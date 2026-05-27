# AB11 — F1.12 Komisyon Trigger Gap — Karar Tablosu

**Tarih:** 2026-05-27
**Bağlam:** `_audit/SISTEM_ROENTGENI.md` F1.12 (G3.13) — komisyon kaydı OTOMATİK insert YOK.
**Mod:** Salt-okuma + plan. Production'a/git'e dokunulmadı. Bu dosya yazıldı + lokal commit; push YOK.
**İstek:** AB11 ürün kararı için derin analiz; A/B/C yaklaşımları kanıtla değerlendirilmiş + karar tablosu.

---

## 1. PROBLEMİN TAM TARİFİ

**F1.12 (G3.13):** Satış sonrası `commission_records` tablosuna OTOMATİK insert YOK.

**Etkilenen akışlar:**

### Akış 1 — Hemen Al (buy-now)
1. User → `register_bid_deposit({context:'buy_now', ...})` → `bid_deposits.status='authorized'` insert
2. User → `execute_buy_now({listingId, depositId, ...})` →
   - `buy_now_purchases.status='pending_payment'` insert
   - `auctions.status='ended'` update
   - `listings.status='sold'` update
   - **Return ok** → **DURAK**

**Gap 1A (commission):** `calculate_commission_with_offset` çağrılmıyor → `commission_records` boş kalır.
**Gap 1B (ödeme capture):** `buy_now_purchases.status='pending_payment'` → `'confirmed'` geçişi yapacak hiçbir RPC YOK. Ödeme sağlayıcı capture sonrası bunu kim güncelleyecek?

### Akış 2 — İhale Kazanımı (auction won)
1. User → `place_bid({auctionId, amount, ...})` → `bids` insert + `auctions.current_high_bid_try` update + anti-sniping extend
2. **`auctions.ends_at` geçtiğinde:**
   - `auctions.status` HÂLÂ `'live'` kalır (otomatik `'ended'` yapan trigger/cron yok)
   - Kazanan kullanıcı bilinmiyor (current_high_bidder_id mevcut ama "won" işareti yok)
   - Hiçbir ödeme akışı tetiklenmiyor
   - **DURAK**

**Gap 2A (auction finalize):** İhale kapanışı + winner declare + ödeme isteği akışı **TAMAMEN YOK**. Bu sadece commission değil, ihale-MVP'sinin temel taşı.
**Gap 2B (commission):** Aynı F1.12.

### Web/Mobil müdahale durumu

| Taraf | calculate_commission çağırıyor mu? | Kanıt |
|---|---|---|
| Web (`src/`) | Hayır | grep: yalnız `Changelog.tsx:25` (metin) — fonksiyon çağrısı 0 |
| Mobil (`mobile/`) | Hayır | grep: 0 sonuç |
| DB RPC (`pg_proc`) | Hayır | `calc_commission_callers: NONE` |
| Edge function | Hayır | _kontrol edilmedi bu turda; gerek yok çünkü tüm akış DB-tabanlı_ |

**Sonuç:** Manuel müdahale gerekmez çünkü zaten hiçbir akış commission'ı çağırmıyor. **Sistem komisyon kaydı oluşturma açısından komple sessiz.**

---

## 2. MEVCUT AKIŞ KANITI (execute_buy_now tam analiz)

### Kaynak

`supabase/migrations/20260527120000_buy_now_kyc_guard.sql:129-252` (KYC guard'lı son hâl).

### Sıralı blok analizi

```sql
create or replace function public.execute_buy_now(
  p_listing_id uuid, p_deposit_id uuid, p_idempotency_key text
) returns json language plpgsql security definer ...
declare
  v_buyer_id uuid := auth.uid();
  v_listing record; v_auction record; v_buy_now_id uuid; ...
begin
  -- 1) auth check
  if v_buyer_id is null then return error('Giriş yapmalısınız'); end if;

  -- 2) KYC guard (F1.1 fix sonrası)
  select kyc_status into v_kyc_status from profiles where id = v_buyer_id;
  if v_kyc_status <> 'verified' then return error('kyc_required'); end if;

  -- 3) rate_limit
  v_rl := public.rate_limit_check('buy_now_attempts', 5);
  if not ok then return error('rate_limited'); end if;

  -- 4) duplicate check
  if exists (... buy_now_purchases ... status in (pending_payment, confirmed)) then
    return duplicate;
  end if;

  -- 5) listing for update + state checks (active, buy_now_price, !disabled)
  select * into v_listing from listings where id = p_listing_id for update;
  if v_listing.status != 'active' then return error('İlan aktif değil'); end if;
  if v_listing.buy_now_price_try is null then return error; end if;
  if coalesce(v_listing.buy_now_disabled, false) then return error; end if;

  -- 6) auction for update + state checks
  select * into v_auction from auctions where listing_id = p_listing_id
    order by created_at desc nulls last limit 1 for update;
  if v_auction.status not in ('scheduled','live') then return error; end if;

  -- 7) report_approved check
  select exists(... report_approvals join property_analysis_reports ...) into v_report_approved;
  if not v_report_approved then return error('Önce AI analiz raporunu onaylamalısınız'); end if;

  -- 8) deposit check (bid_deposits status='authorized' + context='buy_now')
  select * into v_deposit from bid_deposits ...;
  if not found then return error('Geçerli blokaj bulunamadı'); end if;

  -- 9) buy_now_purchases INSERT (status='pending_payment')
  insert into buy_now_purchases (
    listing_id, auction_id, buyer_id, amount_try, deposit_id,
    buyer_report_approved_at, buyer_terms_accepted_at, status
  ) values (
    p_listing_id, v_auction.id, v_buyer_id, v_listing.buy_now_price_try, p_deposit_id,
    now(), now(), 'pending_payment'
  ) returning id into v_buy_now_id;

  -- 10) auctions.status='ended' (BU İLAN İÇİN)
  update auctions set status = 'ended' where listing_id = p_listing_id;

  -- 11) listings.status='sold'
  update listings set status = 'sold', updated_at = now() where id = p_listing_id;

  -- 12) Return
  return json_build_object('status','ok', 'buy_now_id', v_buy_now_id, 'amount', v_listing.buy_now_price_try);
end;
```

### Eksik adımlar (commission akışı için)

- ❌ Adım 13 (commission): `perform calculate_commission_with_offset(v_auction.id, v_listing.buy_now_price_try);`
- ❌ Adım 14 (capture invoice/payment): iyzico capture, buy_now_purchases.status='confirmed', confirmed_at set
- ❌ Adım 15 (audit log): `perform write_audit_v2('buy_now_executed', 'auction', v_auction.id::text, ...)`

### Hangi tablolara yazıyor (mevcut)

| Tablo | İşlem | Notlar |
|---|---|---|
| buy_now_purchases | INSERT | status='pending_payment' — **sonraki adım yok** |
| auctions | UPDATE | status='ended' (sadece bu listing için) |
| listings | UPDATE | status='sold' |

### Hangi tablolara yazmıyor (yazmalı)

| Tablo | Beklenen | Şu an |
|---|---|---|
| commission_records | calculate_commission_with_offset insert eder | **Hiç çağrılmıyor** |
| buy_now_purchases (UPDATE) | status='confirmed' + confirmed_at set | **Hiç tetiklenmiyor** |
| audit_log | write_audit_v2 ile satış kaydı | **Hiç çağrılmıyor** |
| bid_deposits (UPDATE) | status='captured' (ödeme tahsil) | **Hiç güncellenmiyor** |

---

## 3. YAKLAŞIM A — TRIGGER TABANLI

### Senaryo

PostgreSQL trigger'lar `buy_now_purchases` ve `auctions` üzerinde, status değişiminde `calculate_commission_with_offset` tetikler.

```sql
-- A1: buy_now confirmed → commission
create function public.trg_buy_now_commission() returns trigger
language plpgsql security definer as $$
begin
  if (new.status = 'confirmed' and (old.status is null or old.status <> 'confirmed')) then
    perform public.calculate_commission_with_offset(new.auction_id, new.amount_try);
  end if;
  return new;
end; $$;

create trigger trg_buy_now_purchases_commission
  after insert or update on public.buy_now_purchases
  for each row execute function public.trg_buy_now_commission();

-- A2: auction ended → commission (eğer bid-won satışsa)
create function public.trg_auction_commission() returns trigger ... ;
create trigger ... on public.auctions ... ;
```

### Artı

- Otomatik — geliştirici unutamaz
- Tek doğruluk kaynağı: status transition = commission
- Mevcut akışa minimum müdahale (execute_buy_now değişmez)

### Eksi

- Trigger'lar görünmez business logic — debug zor
- **Status'u manuel set eden herhangi bir RPC/admin tool yanlışlıkla commission tetikler** (örn. admin paneli üzerinden test verisi oluşturma → commission record kirlenir)
- Cancel/refund/dispute akışı status değişimleri çift commission/iade ile karmaşıklaşır
- Idempotency: trigger tekrar çalışırsa (örneğin status='confirmed' iki kez set edilirse) çift kayıt — commission_records'da unique YOK
- Schema migration sırasında trigger disable/enable disiplini gerekir (yedekleme, restore, vs.)

### Risk

- **Yüksek false positive riski.** Bir admin "test ortamında" `update buy_now_purchases set status='confirmed'` çalıştırırsa production'da commission_records'a satır yazar.
- Recovery zor: bir trigger yanlışlıkla 100 commission insert ederse temizlemek için manuel SQL gerekir.

---

## 4. YAKLAŞIM B — RPC ENTEGRASYONU

### Senaryo

`execute_buy_now`'un sonuna `perform calculate_commission_with_offset(...)` çağrısı ekle. Auction-won akışı için yeni RPC `finalize_auction(p_auction_id)` yarat — admin veya cron tetikler.

```sql
-- B1: execute_buy_now içine commission çağrısı (idempotent guard'lı)
-- ... mevcut adımlar 1-11 aynı ...

-- 12) Commission (idempotent — sadece bir kez insert)
if not exists (
  select 1 from public.commission_records
  where auction_id = v_auction.id
) then
  perform public.calculate_commission_with_offset(v_auction.id, v_listing.buy_now_price_try);
end if;

-- 13) Audit log
perform public.write_audit_v2('buy_now_executed', 'auction', v_auction.id::text, ...);

-- 14) Return
return json_build_object('status','ok', ...);
```

**Ek RPC — auction-won akışı için:**

```sql
create function public.finalize_auction(p_auction_id uuid)
returns json language plpgsql security definer ...
declare ...
begin
  -- Auth: sadece admin veya cron (service_role)
  if not (auth.role() = 'service_role' or is_profile_admin(auth.uid())) then
    return error('forbidden');
  end if;

  -- Auction state check
  select * into v_auction from auctions where id = p_auction_id for update;
  if v_auction.status not in ('live','ended') then return error('invalid_state'); end if;
  if v_auction.ends_at > now() then return error('not_yet_ended'); end if;
  if v_auction.current_high_bidder_id is null then return error('no_winner'); end if;

  -- Status update + commission
  update auctions set status = 'ended' where id = p_auction_id;

  if not exists (select 1 from commission_records where auction_id = p_auction_id) then
    perform public.calculate_commission_with_offset(p_auction_id, v_auction.current_high_bid_try);
  end if;

  return json_build_object('status','ok', 'winner_id', v_auction.current_high_bidder_id, ...);
end;
```

### Artı

- **Net görünürlük:** RPC body'sinde kontrol — yeni geliştirici okuyup anlar
- **Net auth/sınır:** SECURITY DEFINER + ilgili çağıran kontrolü
- **Idempotent:** `if not exists` guard → çift insert engellenir (commission_records.unique YOK ama mantıkla korunur)
- KYC guard pattern'iyle tamamen uyumlu (önceki guard'larla aynı tarz)
- Cancel/refund/dispute için ayrı RPC'ler kolay yazılır (`revert_commission(auction_id, reason)`)
- Audit trail otomatik: write_audit_v2 çağrısıyla

### Eksi

- **Auction-won akışı için yeni `finalize_auction` RPC + admin paneli UI veya cron** gerek — kapsam büyür
- Her finalize-point'i (buy_now, auction-won, gelecekte sealed-bid) ayrı yazılmalı
- Cron tabanlı `finalize_auction` çağrısı için Faz 4 (pg_cron) gerek — şu an yok; geçici manuel admin akışı

### Risk

- **Düşük.** İdempotent guard + auth + SECURITY DEFINER ile tutarlı.
- Tek risk: auction-won akışı için cron olmadan **admin manuel finalize** yapmaz olursa commission gecikmesi (gelir kaybı değil, sadece kayıt gecikmesi).

---

## 5. YAKLAŞIM C — OUTBOX/QUEUE (pgmq)

### Senaryo

`buy_now_purchases`/`auctions` üzerinde trigger sadece **event yaz** (pgmq queue'ya mesaj kuyrukla). Async dispatcher edge function (`commission-finalize` — yeni) queue'dan tüketir, calculate_commission_with_offset çağırır.

```sql
-- C1: trigger (sadece event)
create function public.trg_buy_now_outbox() returns trigger as $$
begin
  if (new.status = 'confirmed' and old.status <> 'confirmed') then
    perform pgmq.send('commission_calc',
      jsonb_build_object('type','buy_now', 'auction_id', new.auction_id, 'amount', new.amount_try));
  end if;
  return new;
end; $$;

-- C2: edge function (Deno) — pgmq.read + calculate_commission + pgmq.delete
```

### Artı

- Async — latency düşük, kullanıcı işlemi hızlı dönüş alır
- **Retry mekanizması** — başarısız commission insert kuyruğa geri konabilir
- **Idempotent ack** — message ID + dedupe
- **Decoupling** — commission akışı bağımsız scaled
- **Faz 4 (pgmq) altyapısı zaten planlı** — matching-fanout için pgmq + pg_cron + pg_net hazırlık var

### Eksi

- **pgmq schema DEPLOY EDİLMEDİ** (kanıt: `pgmq_schema_installed: false`) — Faz 4 onayı bekliyor
- Edge function yazılması + Dashboard hazırlık + cron job + secret yönetimi: kayda değer altyapı çalışması
- Debug daha karmaşık (queue inspect, edge function log)
- Anlık tutarsızlık penceresi (event yaz ↔ commission insert arasında latency)

### Risk

- **Orta** — pgmq deploy edilince hazır; ama deploy gecikirse commission akışı tamamen kapalı kalır
- Edge function maintenance + monitor

---

## 6. KANIT-DAYALI ÖNERİ

**Önerilen yaklaşım: B (RPC entegrasyonu), fazlı.**

### Gerekçe

1. **Mevcut mimari B ile tam uyumlu:** KYC guard (20260527120000) + place_bid bond guard (bundle) zaten SECURITY DEFINER + içerideki kontrol pattern'ini kullanıyor. B aynı disiplin.

2. **A'nın yanılma riski yüksek:** trigger görünmez, test ortamı sızıntı riski. Production zero-traffic şu an ama gelecekte admin paneli/migration sırasında yanlış status update kalıcı kirli kayıt yaratabilir.

3. **C şu an mümkün değil:** pgmq yok. Faz 4 deploy edilene kadar bekleyemeyiz çünkü ödeme akışı release-blocker.

4. **commission_records şemasıyla uyum:**
   - Unique constraint YOK → idempotency RPC içinde guard ile sağlanır
   - FK auction_id ON DELETE RESTRICT → commission silinmez (B ile uyumlu, A trigger'da auction silme zinciri sorun yaratabilir)
   - Mutator (UPDATE/DELETE) yok → revert akışı yeni RPC olarak yazılmalı (B ile uyumlu)

5. **Faz 4 hazır olunca C'ye geçiş kolay:** B fazını C ile değiştirmek (queue üzerinden) RPC interface'ini bozmadan yapılabilir — B'den C'ye migrate path açık.

### Önerilen alt-fazlar

**B-Faz-1 (acil, AB11 deploy'ında):**
- `execute_buy_now`'a `if not exists ... perform calculate_commission_with_offset ...` ekle (idempotent)
- `buy_now_purchases.status='pending_payment'` insert sonrası, return öncesi
- Audit log: `write_audit_v2('buy_now_executed', ...)` da eklensin
- **Gap:** `buy_now_purchases.status='confirmed'` geçişi hâlâ ayrı bir RPC bekliyor (ödeme capture sonrası)

**B-Faz-2 (sonraki sprint):**
- Yeni RPC `confirm_buy_now_payment(p_buy_now_id, p_iyzico_capture_ref)` — service_role only, ödeme capture sonrası çağrılır
- `buy_now_purchases.status='confirmed'`, `confirmed_at=now()`, `iyzico_payment_ref` set
- `bid_deposits.status='captured'` update
- Bu fix `payments-iyzico` edge function'ı ile entegre olur

**B-Faz-3 (sonraki sprint):**
- Yeni RPC `finalize_auction(p_auction_id)` — admin only veya service_role (cron için)
- Auction-won akışı: status='ended' + commission + winner declare + ödeme isteği oluştur
- Cron için Faz 4 pg_cron deploy bekleniyor; geçici manuel admin akışı

**B-Faz-4 (iade/dispute):**
- `commission_records`'a `status text` kolon ekle (active/reverted/disputed)
- Yeni RPC `revert_commission(p_record_id, p_reason)` — admin only, status='reverted', revert_reason kayıt
- buy_now_purchases.status='refunded'/'disputed' tetikleyici (manuel admin akışı)

### B-Faz-1 önerilen migration

```sql
-- 20260527140000_commission_trigger_buy_now.sql (önerilen ad)
-- execute_buy_now'a commission entegrasyonu (idempotent)

create or replace function public.execute_buy_now(...) returns json ... as $fn$
declare ...
begin
  -- ... mevcut adımlar 1-11 (auth, kyc, rl, dup, listing, auction, report, deposit, insert, update auctions, update listings) ...

  -- 12) Commission tetikleme (B-Faz-1, idempotent)
  if not exists (
    select 1 from public.commission_records
    where auction_id = v_auction.id
  ) then
    perform public.calculate_commission_with_offset(v_auction.id, v_listing.buy_now_price_try);
  end if;

  -- 13) Audit log (opsiyonel, bu turda eklenebilir)
  perform public.write_audit_v2(
    'buy_now_executed', 'auction', v_auction.id::text,
    jsonb_build_object('buy_now_id', v_buy_now_id, 'amount', v_listing.buy_now_price_try)
  );

  -- 14) Return (aynı)
  return json_build_object('status','ok', 'buy_now_id', v_buy_now_id, 'amount', v_listing.buy_now_price_try);
end;
$fn$;
```

**Boyut:** Küçük (~20 satır eklenecek). 5 dk yazımı + 5 dk smoke.

**Risk:**
- execute_buy_now SECURITY DEFINER + calculate_commission AUTH CHECK: `auth.uid()` SECURITY DEFINER context'te caller'ın uid'i = buyer. Bundle'da yazdığımız fix: `if not v_is_admin and v_caller<>seller_id and v_caller<>buyer_id and v_caller<>agent_id` — **buyer = v_caller eşittir buyer_id, koşul geçer ✓**. Bundle deploy edildikten sonra bu çağrı çalışır.

**Bağımlılık:** Bundle deploy edilmiş olmalı (FIX 2 — calc_commission auth check). Yoksa B-Faz-1 deploy'unda execute_buy_now içinden çağrı auth_required hatası vermez (çünkü auth.uid() var) ama yine de bundle'dan SONRA yapılmalı (auth check'in olmadığı versiyonda call zaten çalışıyor olur, sıralama önemli değil aslında — ama temiz olması için bundle önce).

---

## 7. KULLANICI KARAR TABLOSU

Aşağıdaki soruların yanıtları AB11'in son şekline karar verir.

### K1. Tetikleme noktası — Hemen Al (buy-now) için

**Seçenekler:**
- (a) **`buy_now_purchases.status='pending_payment'` insert anında** (execute_buy_now içinde, B-Faz-1)
- (b) **`buy_now_purchases.status='confirmed'` geçişinde** (B-Faz-2'de yazılacak confirm_buy_now_payment RPC içinde)
- (c) Hibrit: pending'de "draft" commission (status='draft'), confirmed'de "active" commission (status='active')

**Etki:**
- (a) erken kayıt — ödeme tamamlanmadan commission insert; iade durumunda revert lazım. Avantaj: gelir tahmini için anında veri.
- (b) doğru zamanlama — ödeme alındı, commission kesin. Dezavantaj: B-Faz-2 (ödeme capture RPC) yazılana kadar commission yine boş kalır.
- (c) en temiz — iki state tutar. Dezavantaj: commission_records'a status kolonu eklemek migration gerektirir.

**Öneri:** **(b) — confirmed geçişi.** Hatalı/iptal ödemeli kayıt birikmesi olmaz. B-Faz-1 + B-Faz-2 birlikte tasarlansın.

### K2. Tetikleme noktası — İhale Kazanan için

**Seçenekler:**
- (a) `auctions.status='ended'` anında otomatik (admin RPC `finalize_auction` veya cron)
- (b) Winner declare + ödeme alındı (yeni `confirm_auction_payment` RPC) sonrası
- (c) `auctions.ends_at < now()` koşulu (anti-sniping sonrası) cron ile kontrol → finalize

**Etki:**
- (a) hızlı kayıt; ödeme alınmadan commission "talep" olur
- (b) doğru zamanlama; ama "kazandın, ödemeyi yap" akışı yazılmalı
- (c) MVP için en pragmatik; Faz 4 cron ile düzenli denetim

**Öneri:** **(b) — ödeme alındı sonrası.** Buy-now ile aynı disiplin. Cron sadece kazananları işaretler, asıl commission ödeme capture'da.

### K3. Idempotency stratejisi

**Seçenekler:**
- (a) RPC içinde `if not exists (... commission_records where auction_id=X)` guard (current öneri)
- (b) `commission_records` üzerinde unique constraint (auction_id) + ON CONFLICT DO NOTHING
- (c) Hibrit: hem RPC guard hem DB constraint

**Etki:**
- (a) hızlı, esnek; RPC dışı çağrı bypass edebilir (ama caller_grants sınırlı)
- (b) en sert; ama auction tekrar açılırsa (iptal sonrası yeniden ihale) commission yeniden insert olamaz — design constraint
- (c) defense-in-depth

**Öneri:** **(c) — hibrit.** Hem RPC guard hem DB unique constraint (`unique(auction_id)` veya `unique(auction_id, status='active')` partial index — ikincisi iade sonrası yeni commission'a izin verir).

### K4. İade akışı (`buy_now_purchases.status='refunded'`)

**Seçenekler:**
- (a) `commission_records.status='reverted'` (yeni kolon) — soft revert, kayıt korunur
- (b) `commission_records` row delete — sert silme
- (c) Yeni `commission_records` satır `negative platform_net_try` ile — muhasebe-uygun ters kayıt

**Etki:**
- (a) muhasebe izi korunur, kolay revert
- (b) bilanço temizlenir ama denetim/iz kaybolur
- (c) çift kayıt + status text — standart muhasebe

**Öneri:** **(c) — ters kayıt + (a) status kolonu.** Hem hızlı görüntüleme (status filter) hem tam muhasebe (kar/zarar takibi).

### K5. Dispute akışı (`buy_now_purchases.status='disputed'`)

**Seçenekler:**
- (a) `commission_records.status='disputed'` (hold) — ödeme yapılmaz, manuel admin müdahale
- (b) Otomatik revert (a-style) — bekleme yok
- (c) Hibrit: dispute süresince hold, çözüm sonrası ya active ya reverted

**Etki:**
- (a) en güvenli — admin karar verir
- (b) hızlı temizlik ama yanlış pozitif riski
- (c) gerçekçi muhasebe akışı

**Öneri:** **(c) — hibrit hold + karar.** dispute_resolved_at timestamp + admin RPC `resolve_dispute(record_id, action)`.

### K6. Yaklaşım seçimi (genel)

**Seçenekler:**
- (a) **B (RPC entegrasyonu) hemen** — bu turun önerisi
- (b) **C (pgmq) Faz 4 sonrası** — async/queue tabanlı
- (c) A (trigger) yedek/geçici

**Öneri:** **(a) — B hemen + (b) Faz 4 sonrası B→C migration.** B-Faz-1+2+3 deploy + Faz 4 deploy + C'ye migrate (RPC arkasında queue dispatcher).

### K7. Agent commission revoke (gelecek)

**Senaryo:** Satış commission_records'da `agent_id=X, agent_share_rate=0.02` ile kayıtlı. Sonra agent yetkisi (authorizations.status='revoked') iptal edildi. Commission ne olur?

**Seçenekler:**
- (a) commission_records aynen kalır — historical truth
- (b) `agent_share_try` revert + platform_net artırılır
- (c) Admin manuel karar (case-by-case)

**Öneri:** **(a) — historical truth.** Satış anının kararı bağlayıcı; sonradan değişiklik manuel admin işidir.

### K8. `buy_now_purchases.status='confirmed'` yapacak RPC kim?

**Şu an mevcut değil — kim yazacak?**

**Seçenekler:**
- (a) **`payments-iyzico` edge function** — capture başarılı dönüşünde RPC çağırır
- (b) Yeni admin RPC `admin_confirm_buy_now(buy_now_id)` — manuel
- (c) İkisi de (production: edge function; dev/test: admin RPC)

**Öneri:** **(c) — ikisi de.** Production'da edge function (service_role); dev/manual onay için admin RPC. RPC adı: `confirm_buy_now_payment(p_buy_now_id, p_iyzico_capture_ref)`.

### K9. Komisyon hesaplama zamanı (snapshot)

**Senaryo:** Buy-now fiyatı `listings.buy_now_price_try=5M`. Satış anında calculate_commission `5M * 0.04 = 200K` insert eder. Sonra `listings.buy_now_price_try` admin tarafından `6M`'a güncellenir. Commission yeniden hesaplanır mı?

**Seçenekler:**
- (a) **Snapshot at sale** — commission satış anının fiyatıyla hesaplanır, sonraki değişimler etkilemez (current behavior — `p_sale_amount` parametre)
- (b) Live recalculation — listings.buy_now_price_try değişimiyle commission güncellenir
- (c) Audit-only: değişim history tablosunda saklanır

**Öneri:** **(a) — snapshot.** Doğru muhasebe pratiği; current calculate_commission_with_offset bu pattern'i kullanıyor (`p_sale_amount` parametre).

---

## 8. ÖZET — KARAR PAKETİ

**Tahmini önerilen B-Faz paketi:**

| Faz | İçerik | Büyüklük | Bağımlılık |
|---|---|---|---|
| B-Faz-1 | execute_buy_now → calculate_commission idempotent çağrı + audit log | Küçük (20 satır) | Bundle deploy sonrası |
| B-Faz-2 | confirm_buy_now_payment RPC (ödeme capture sonrası status='confirmed', commission burada tetiklensin K1.b ise) | Orta (100 satır) | iyzico edge function entegre |
| B-Faz-3 | finalize_auction RPC (admin + cron için) | Orta (150 satır) | Faz 4 (cron) — geçici manuel |
| B-Faz-4 | commission_records.status kolonu + revert/dispute RPC'leri | Orta-büyük | İade akışı kararları (K4, K5) |
| B→C migrate | Trigger + pgmq dispatcher edge function | Büyük | Faz 4 deploy sonrası |

### Bu turda yapılabilir / yapılamaz

- **Yapılabilir (B-Faz-1):** execute_buy_now içine commission çağrısı ekle — 20 satır + smoke
- **Yapılamaz (bu turda):** B-Faz-2/3/4 — ürün kararı + ödeme capture entegrasyonu + ürünleşme

### Acil aksiyon önerisi

1. **Bundle deploy edildikten sonra** (kullanıcı "BAS güvenlik bundle" → 27-check geçer)
2. **AB11 K1-K9 cevapları net olunca** (özellikle K1, K3, K6, K8)
3. **B-Faz-1 migration yaz** (20260527140000_commission_trigger_buy_now.sql)
4. **Smoke** — bundle + buy_now_commission entegrasyonu birlikte
5. **B-Faz-2/3 ayrı sprint'lere** (ödeme capture entegrasyonu hazır olunca)

---

## 9. EK — TEKNİK DETAYLAR

### commission_records tam şema (kanıt)

```
id:uuid! (default gen_random_uuid())
auction_id:uuid! → auctions(id) ON DELETE RESTRICT
seller_id:uuid! → profiles(id)
buyer_id:uuid? → profiles(id)
sale_amount_try:numeric!
seller_commission_try:numeric!
seller_vat_try:numeric!
buyer_commission_try:numeric! (default 0)
buyer_vat_try:numeric! (default 0)
offset_membership_try:numeric! (default 0)
offset_service_fees_try:numeric! (default 0)
offset_total_try:numeric! (default 0)
agent_id:uuid? → profiles(id) ON DELETE SET NULL
agent_role:text?
agent_share_rate:numeric?
agent_share_try:numeric! (default 0)
agent_invoice_received:boolean! (default false)
agent_invoice_url:text?
platform_net_try:numeric!
collected_at:timestamp with time zone! (default now())
```

**Şema gözlemleri:**
- **status kolonu YOK** — K4 (iade) için migration eklemesi gerekir
- **revert_reason kolonu YOK** — K4 için eklenir
- `collected_at default now()` — "kayıt anı" olarak işliyor; "calculated_at" olarak yeniden adlandırmak doğru olur (kapsam dışı, ama gelecek için not)
- buyer_id NULLABLE — anonim/manual satışlar için (?). Validate edilmeli.
- Unique constraint YOK — K3'te ele alındı

### buy_now_purchases tam şema

```
id, listing_id, auction_id, buyer_id, amount_try, deposit_id,
buyer_report_approved_at, buyer_terms_accepted_at, buyer_kyc_verified_at,
status (pending_payment/confirmed/cancelled/refunded/disputed),
iyzico_payment_ref, cancelled_reason,
created_at, confirmed_at, cancelled_at
```

`refunded_at` ve `disputed_at` **yok** — K4/K5 için migration eklemesi.

### auctions tam status enum

```
scheduled, live, ended, cancelled
```

`won` veya `awaiting_payment` gibi ara state YOK — auction kapanışı sadece "ended" diye işaretlenir, kazanan ödeme yapana kadar belirsiz state. K2'ye göre yeni state'ler eklenebilir.

### Şu anki production durumu

- profiles: 4 (kyc=none=4)
- listings: 0
- auctions: 0
- buy_now_purchases: 0
- commission_records: 0
- bid_deposits: 0

**Pratik etki:** F1.12 fix'i deploy edildiğinde anlık görünür değişiklik OLMAZ (zaten 0 satış var). Fix yapısal — ilk gerçek satışla devreye girer.

---

**SON:** Bu rapor B-Faz-1 için hazır. K1-K9 cevapları gelince B-Faz-1 migration yazılır + bundle ile aynı tur'da veya hemen sonra deploy edilir. K6.b (Faz 4 sonrası C migrate) uzun vadeli yol.
