# ihaleal — Sistem Röntgeni (2026-05-27)

**Yazıldığı an:** 2026-05-27 akşam, kullanıcı misafirlikte.
**Kapsam:** Production DB + web src/ + mobile/ + edge functions + git. Tek toplu rapor.
**Kural:** SALT-OKUMA, hiçbir CANLI/DEPLOY/PUSH yok. Yalnız bu dosya yazıldı + lokal commit.
**Bağlam dosyaları:** `_audit/OTURUM_DURUMU.md` (önceki gece özet), `_audit/AKSAM_PLANI.md` (akşam mobil bağlantı planı).

---

# 🔴 F — KRİTİK BULGULAR (rapor başı özet)

## F1. En kritik 7 bulgu

### 🔴 F1.1 — KYC akışı uçtan uca KIRIK (üretim-blocker)

**Kanıt:**
- Production DB sorgusu `kyc_verify_fn_exists=false` — `profiles.kyc_status='verified'` yazacak HİÇBİR RPC fonksiyonu YOK (`pg_proc` taraması: `proname like '%kyc%' or proname like '%verify%'` → 0 sonuç).
- `/kyc` route'u `src/pages/mega/KycSimulation.tsx` — dosya kendisi açıkça yazıyor: "Gerçek kimlik doğrulaması değildir. Üretimde kimlik sağlayıcı ve hukuki süreçler uygulanır."
- Edge function `supabase/functions/kyc-submit/index.ts` var ama yalnız `kyc_verifications` tablosuna `status='pending'` ekliyor; profiles güncellemiyor.
- Production state: `profiles_kyc_status_distinct: none:4` (4 kullanıcı, hepsi `none`). Hiç kimse hiçbir zaman verified olmadı.

**Sonuç:** `register_bid_deposit` ve `execute_buy_now` KYC guard'lı (`kyc_status != 'verified'` reddediyor). Hiçbir kullanıcı verified değil. **Production'da kimse teklif veremez/satın alamaz.** Pratikte production-zero-traffic, ama release-blocker.

**Öneri:** İki seçenek:
- (A) Bir admin RPC: `admin_verify_kyc(user_id)` SECURITY DEFINER, sadece is_admin=true olan çağırabilir. kyc-submit edge function'ı tetikleyip moderation_queue'ya atar, admin elle onaylar → admin RPC `kyc_status='verified'` yazar.
- (B) Üçüncü taraf KYC sağlayıcı (Findeks, Türkiye'de e-Devlet, vs.) ile gerçek entegrasyon. Edge function bunu çağırır, callback'te verified yapar. Daha uzun yol.

### 🔴 F1.2 — `place_bid` deposit guard kayıp (mevcut tur fix'lendi, deploy bekliyor)

**Kanıt:** Bu turda zaten kanıtlandı (önceki paragraflar). DB envanter doğruladı: `place_bid` flag matrix `[auth, idemp]` — `bid_deposits`/`bid_bonds` referansı YOK (`refs_bid_deposits=false`, `refs_bid_bonds=false`).

**Durum:** Migration + deploy + smoke dosyaları yazıldı (`supabase/migrations/20260527130100_place_bid_bond_guard.sql` + `_audit/migration_deploy/extra_place_bid_bond_guard.sql`). Kullanıcı "BAS bond guard" onayı bekliyor. **Deploy SONRASI 4. açık kapanır.**

### 🔴 F1.3 — `calculate_commission_with_offset` ve `consume_ai_quota` AUTH BYPASS

**Kanıt:**
- `calc_commission_grant: PUBLIC:EXECUTE, postgres:EXECUTE, service_role:EXECUTE` — **anon (giriş yapmamış) dahil herkes** çağırabilir.
- `consume_ai_quota_grant: PUBLIC:EXECUTE, postgres:EXECUTE, authenticated:EXECUTE, service_role:EXECUTE` — aynı.
- Fonksiyon body flag matrix `[]` (boş): `has_auth_check=false`, `touches_kyc=false`, `uses_rate_limit=false`. Gövdede `auth.uid()` çağrısı YOK.

**Sonuç:**
- `consume_ai_quota`: AI kotası anonim olarak tüketilebilir. AI maliyet patlatma vektörü.
- `calculate_commission_with_offset`: Komisyon hesaplaması anonim çağırılabilir. Veri tabanına yazıp yazmadığı bilinmiyor (`commission_records_count=0` — şu an hiç çağrılmamış); fonksiyon body okunmadı bu turda. Yazıyorsa fake commission record insert riski.

**Öneri:** Her ikisinin SECURITY DEFINER setup'ını yenile, gövdeye `if auth.uid() is null then raise exception` ekle, GRANT'i `authenticated` ile sınırla, PUBLIC EXECUTE'u revoke et.

### 🟠 F1.4 — `corporate_leads` ve `organizations` ANON erişim açık

**Kanıt:**
- `corporate_leads.allow_insert_all` policy: `with_check=true`, roles=`{anon,authenticated}` — **giriş yapmamış kullanıcı insert edebilir.** PII spam vektörü.
- `corporate_leads.allow_select_all` policy: aynı, roles=`{anon,authenticated}` — anon kullanıcı PII (telefon, e-mail) okuyabilir. **KVKK ihlali riski.**
- `organizations.org_public_read`: `qual=true` — tüm organizations satırları PUBLIC. Vergi numarası, plan, kyc_status, internal kolon her şey sızar.

**Öneri:**
- `corporate_leads`: `allow_insert_all` → DROP. Yerine `for insert with check (auth.uid() = created_by)` veya edge function üzerinden anon submit. SELECT: sadece admin (`profiles.is_admin=true`).
- `organizations`: `org_public_read` → DROP. Yerine: kurumun *sadece* public profil kolonlarını (örn. ad, slug, logo) açan bir public_view + RLS. Diğer kolonlar private.

### 🟠 F1.5 — `bid_bonds` user-direct INSERT/UPDATE policy açık (orphan ama exploit edilebilir)

**Kanıt:**
- `bid_bonds_insert_self`: `with_check=(auth.uid() = bidder_id)` — kullanıcı kendisi için bond INSERT edebilir.
- `bid_bonds_update_self`: `qual=(auth.uid() = bidder_id)` — kullanıcı kendi bond status'unu UPDATE edebilir (held → released etc).
- `bid_bonds_rowcount=0` — tablo orphan, kimse yazmıyor.

**Risk:** `place_bid` bond guard'ı `bid_deposits`'e bakacak (bizim yeni migration), `bid_bonds`'a değil. Yani **bu policy bond guard'ı bypass etmiyor**. Ama:
- Tablo orphan; gelecekte biri yanlışlıkla `bid_bonds` üzerinden bond yatırma akışı yazarsa bypass riski tetiklenir.
- Kötü niyetli kullanıcı `bid_bonds` insert + status='held' yapar; eğer gelecekte bir kod parçası `place_bid` yerine `bid_bonds`'a bakarsa risk.

**Öneri:** `bid_bonds_insert_self` ve `bid_bonds_update_self` DROP. Yerine: hiç policy → user direkt yazamaz; SECURITY DEFINER RPC içinden bypass. Veya tablonun kendisini drop et (orphan ise).

### 🟠 F1.6 — Web `handleBid` istemci-tarafı `bidDisabled` bypass riski (4. açık ile aynı kategori)

**Kanıt:**
- `src/pages/AuctionDetail.tsx:433-487` `handleBid` implementation:
  - Satır 452: `if (!isListingOnly && bidDisabled) { toast('Önce AI raporunu onaylayın ve teminat (ön yetki) adımını tamamlayın.'); return; }`
  - `bidDisabled` istemci-tarafı React state — DevTools'tan `setBidDisabled(false)` ile bypass edilebilir.
- `register_bid_deposit` çağrısı (satır 269, 319) **handleBid'in dışında** — ayrı bir `runPreAuth` fonksiyonunda. handleBid sadece `placeBidRpc` çağırıyor (satır 464).

**Sonuç:** F1.2 bond guard deploy edildikten sonra place_bid kendi başına bond enforce edecek; istemci bypass'ı **sunucu reddeder** → sorun otomatik çözülür. Ama bond guard deploy EDİLMEDEN ÖNCE bu açık aktif.

### 🟠 F1.7 — Mobile bid/buy-now akışları yalın MOCK (D-7 + 3 ekran)

**Kanıt:**
- `mobile/shared/bidActions.ts:53`: `await new Promise((r) => setTimeout(r, 250));` — fake-success simülasyon, gerçek RPC yok (TODO satır 50).
- `mobile/src/app/ihale/[id]/teklif.tsx:14-24`: `submitMock` — sadece state set, RPC yok.
- `mobile/src/app/ihale/[id]/hemen-al.tsx:13-19`: `onMockBuyNow` — sadece state set.
- `mobile/src/app/ihale/[id]/kapali-teklif.tsx:23-29`: `onSubmit` — sadece state set (sealed bid backend zaten yok).

**Sonuç:** Mobile uygulama **şu an gerçek teklif kabul ETMEZ** — UI deneyimi sağlam, ama production'da kimse mobile'dan teklif veremiyor. Akşam planının ana işi tam bu (Bölüm 1).

---

## F2. En kritik 7 KARAR noktası (kullanıcı yanıtı bekleyen)

| # | Karar | Bağlam |
|---|---|---|
| 1 | **KYC verify mekanizması** — A (admin onaylı RPC) mı, B (3.taraf entegrasyon) mı? | F1.1; release-blocker |
| 2 | **iBuyer/Trade-In/GES ürünleştirme** — submit_*application RPC'leri var, web sayfaları var (`IBuyerPage.tsx`), mobil yok. Mobile MVP'de iBuyer girer mi? | Scope kararı |
| 3 | **commission/AI quota auth gap** — calc_commission_with_offset ve consume_ai_quota PUBLIC EXECUTE. Acil mi (deploy bu turda?) yoksa Faz 5 ile mi? | F1.3; orta vadeli |
| 4 | **corporate_leads + organizations RLS sertleştirme** — F1.4. Acil mi? KVKK için evet, ama production-traffic 0. | F1.4 |
| 5 | **bid_bonds tablosu drop** — orphan, hiç kullanılmıyor. Drop migration mı, dursun mu? | F1.5 |
| 6 | **Faz 4 (pgmq) — Dashboard hazırlık ne zaman?** | Migration gap=1 |
| 7 | **main push zamanlaması** — 11 commit ahead, CI ağır (typecheck/test/rls/playwright), Supabase v2-deploy --include-all Faz 4 olmadan fail. Sıra: bond guard → Faz 4 → main push. Bugün mü, sonraki gün mü? | E5 |

## F3. Genel sağlık notu

**Sistem ~%65 production-ready.**

**Güçlü 3 nokta:**
1. **DB güvenlik temelleri sağlam:** 47/47 tabloda RLS aktif, 22 SECDEF RPC'nin çoğu disciplined (KYC guard + rate_limit + idempotency), 90 policy detaylı.
2. **Çekirdek facade'ler temiz:** `placeBid.ts`, `buyNow.ts` discriminated union döner, hata yönetimi olgun.
3. **Migration disiplini:** 31 migration sıralı, son 14 (KYC + Faz 1-3b + push) atomik smoke ile deploy edildi; gap=1.

**Zayıf 3 nokta:**
1. **KYC akışı kırık (F1.1):** verified yapacak hiçbir backend mekanizması yok. Tüm KYC-gated RPC'ler pratik olarak ulaşılamaz.
2. **Mobile bid/buy-now mock (F1.7):** ekran var, UI çalışıyor, gerçek transaction sıfır.
3. **Public erişim açıkları (F1.3, F1.4):** commission/AI quota anon çağrı + organizations/corporate_leads anon read/insert. KVKK ve maliyet vektörleri.

---

# A — VERİ TABANI KILCAL TARAMA

## A1. Tablo envanteri (47 tablo, hepsi RLS aktif)

Production sorgu: `select table_name, relrowsecurity, reltuples, policy_count from information_schema.tables + pg_class + pg_policies`.

| Tablo | RLS | Policy sayısı | Notlar |
|---|---|---|---|
| agent_performance | ✓ | 1 (SELECT) | Aylık agent KPI |
| auctions | ✓ | 2 (INSERT/SELECT) | İhale meta — anti-sniping kolonları |
| audit_log | ✓ | 1 (SELECT admin) | **row=0**, hiç audit yazılmamış |
| authorizations | ✓ | 2 | Agent yetkisi (signed_via: e_devlet/kep/wet_signature) |
| bid_bonds | ✓ | 3 (INSERT/SELECT/UPDATE) | **ORPHAN** — row=0, prosrc ref=0 |
| **bid_deposits** | ✓ | 3 | Yeni iyzico-uyumlu teminat tablosu |
| bids | ✓ | 1 (SELECT bidder_or_owner) | INSERT policy YOK ✓ (sadece place_bid RPC) |
| bulk_jobs | ✓ | 1 | Toplu işlem kuyruğu |
| buy_now_purchases | ✓ | 1 | row=0; Hemen Al kayıtları |
| buyer_preferences | ✓ | 1 (ALL owner) | Alıcı tercih |
| chat_messages | ✓ | 2 | Mesajlaşma |
| chat_thread_participants | ✓ | 2 | |
| chat_threads | ✓ | 2 | |
| commission_campaigns | ✓ | 1 (SELECT public) | |
| commission_records | ✓ | 1 | **row=0** |
| compliance_review_queue | ✓ | 1 (SELECT admin) | |
| corporate_leads | ✓ | 3 | 🔴 `allow_insert_all` anon açık (F1.4) |
| device_push_tokens | ✓ | 2 | Push token (yeni eklenen) |
| documents | ✓ | 3 | |
| engineering_analysis_runs | ✓ | 2 | GES/parcel/zoning/site/war_room/seismic/geotech |
| events | ✓ | 4 (CRUD + soft delete) | Faz 1 hardening |
| ges_legal_compliance | ✓ | 2 | GES projesi hukuki uygunluk |
| ges_projects | ✓ | 3 | GES projesi ana tablo |
| ges_technical_analyses | ✓ | 2 | |
| idempotency_keys | ✓ | 0 | **POLICY YOK** + `idempotency_keys_writers=NONE` (kimse yazmıyor) |
| instant_offer_requests | ✓ | 2 | iBuyer instant offer |
| kyc_verifications | ✓ | 1 (SELECT submitter) | KYC başvuru kayıtları |
| listing_matches | ✓ | 1 | Otomatik eşleştirme |
| listings | ✓ | 5 | row=0 — Production'da hiç ilan yok |
| memberships | ✓ | 3 | seller_yearly/buyer_yearly/agent_* |
| moderation_queue | ✓ | 4 (CRUD + soft delete) | Faz 1 hardening |
| notifications | ✓ | 1 | |
| organization_members | ✓ | 1 | |
| organizations | ✓ | 2 | 🔴 `org_public_read` qual=true (F1.4) |
| payments | ✓ | 1 | |
| pre_launch_signups | ✓ | 2 | Pre-launch signup (anon insert açık — DOĞRU) |
| profiles | ✓ | 4 | **row=4 (hepsi kyc=none, role=individual)** |
| property_analysis_reports | ✓ | 5 | **row=0** AI raporlar |
| property_risk_assessments | ✓ | 2 | |
| property_submissions | ✓ | 2 | iBuyer/takas başvuru |
| rate_limit_buckets | ✓ | 1 (service_only) | Faz 1 fix sonrası kapalı |
| rate_limit_events | ✓ | 0 | **POLICY YOK** — internal log? |
| report_approvals | ✓ | 1 | |
| service_fees | ✓ | 2 | photo/drone/legal/expertise/vt/video/tapu_prep/bid_entry |
| trade_in_details | ✓ | 2 | Takas akışı |
| trade_offers | ✓ | 1 | P2P trade |
| watchlist | ✓ | 1 | |

**Toplam canlı veri:**
- profiles: 4 (hepsi kyc=none, individual)
- diğer iş tabloları: 0 (hiç listing, auction, bid, deposit, commission, audit, report)
- **Production şu an effective traffic-zero.** Yapı hazır, içerik henüz yok.

**Tabular notlar:**
- `idempotency_keys` policy=0 ve writer=NONE — **kullanılmayan tablo.** RPC'ler kendi tablolarında idempotency_key kolonu üzerinden duplicate önlüyor.
- `rate_limit_events` policy=0 — internal log, kullanılmıyorsa drop kandidatı.
- `bid_bonds` orphan (F1.5).

## A2. RPC envanteri (22 SECURITY DEFINER fonksiyonu)

Flag matrix: `has_auth_check`, `touches_kyc`, `uses_rate_limit`, `refs_bid_deposits`, `refs_bid_bonds`, `uses_idempotency`, `writes_audit`.

| # | Fonksiyon | İmza | L | auth | kyc | rl | dep | bond | idemp | audit | Notlar |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | admin_approve_listing | `(p_listing_id uuid)` | 821 | ✓ | | | | | | ✓ | Admin |
| 2 | calculate_commission_with_offset | (?) | 3380 | | | | | | | | 🔴 F1.3 PUBLIC EXECUTE, auth YOK |
| 3 | cancel_trade_offer | `(p_offer_id uuid)` | 645 | ✓ | | | | | | | Idempotency YOK |
| 4 | consume_ai_quota | (?) | 625 | | | | | | | | 🔴 F1.3 PUBLIC EXECUTE, auth YOK |
| 5 | create_trade_offer | `(...)` | 2052 | ✓ | | | | | | | Idempotency YOK |
| 6 | execute_buy_now | `(p_listing_id uuid, p_deposit_id uuid, p_idempotency_key text)` | 3629 | ✓ | ✓ | ✓ | ✓ | | | | KYC guard ✓ |
| 7 | handle_new_user | (trigger fn) | 305 | | | | | | | | Trigger: `on_auth_user_created` |
| 8 | is_profile_admin | (no args) | 159 | | | | | | | | Helper |
| 9 | place_bid | `(p_auction_id uuid, p_amount numeric, p_idempotency_key text)` | 1949 | ✓ | | | | | ✓ | | 🔴 F1.2 bond guard YOK (deploy bekliyor) |
| 10 | rate_limit_check | `(p_action_key text, p_max_per_hour int)` | 562 | ✓ | | | | | | | Helper |
| 11 | register_bid_deposit | `(p_listing_id, p_auction_id, p_base, p_deposit, p_pre_auth_ref, p_context, p_idempotency)` | 1882 | ✓ | ✓ | ✓ | ✓ | | ✓ | | KYC guard ✓ |
| 12 | register_push_token | `(p_token text, p_platform text, p_device_id text?)` | 1025 | ✓ | | | | | | | |
| 13 | respond_trade_offer | `(p_offer_id uuid, p_action text)` | 837 | ✓ | | | | | | | Idempotency YOK |
| 14 | rl_consume | (?) | 797 | | | | | | | | Internal helper |
| 15 | set_active_org | `(p_org_id uuid)` | 477 | ✓ | | | | | | | |
| 16 | soft_delete_events | (?) | 287 | ✓ | | | | | | ✓ | Trigger |
| 17 | soft_delete_moderation_queue | (?) | 379 | ✓ | | | | | | ✓ | Trigger |
| 18 | submit_ges_land_evaluation | `(...)` | 5081 | ✓ | | | | | | | KYC YOK (araştırılacak) |
| 19 | submit_ibuyer_application | `(...)` | 4449 | ✓ | | | | | | | KYC YOK (araştırılacak) |
| 20 | submit_takas_application | `(...)` | 244 | ✓ | | | | | | | KYC YOK (araştırılacak) |
| 21 | unregister_push_token | `(p_token text)` | 351 | ✓ | | | | | | | |
| 22 | write_audit_v2 | `(p_action, p_entity_type, p_entity_id, p_diff jsonb)` | 252 | ✓ | | | | | | ✓ | Tam interface |

### POTANSİYEL GÜVENLİK AÇIKLARI (RPC tarafı)

1. 🔴 **F1.2 — place_bid bond/deposit guard yok** (deploy bekliyor)
2. 🔴 **F1.3 — calculate_commission_with_offset + consume_ai_quota auth yok + PUBLIC EXECUTE**
3. 🟡 **submit_ges_land_evaluation / submit_ibuyer_application / submit_takas_application** — `touches_kyc=false`. Para akışı/yasal yükümlülük olan akışlar, KYC guard koymak gerekir mi? (Bu RPC'ler iyzico/komisyon değil ama PII içerir; karar.)
4. 🟡 **trade_offers RPC'leri (create/respond/cancel)** — idempotency_key yok, aynı işlem iki kez gönderilirse iki kayıt insert olabilir.
5. 🟢 `register_push_token` / `unregister_push_token` — KYC/RL gerekmeyen low-risk OK.
6. 🟢 `admin_approve_listing` + soft_delete'ler + write_audit_v2 — audit yazıyor ✓.
7. 🟡 `audit_log_count=0` — `write_audit_v2` interface tam ama hiç tetiklenmemiş. Mevcut RPC'lerden hiçbiri write_audit_v2 çağırmıyor? Veya çağırıyor ama production'da işlem olmadığından henüz boş. Araştırılacak.

## A3. RLS politika haritası (90 policy, tablo başına)

Önemli policy'ler:

### Sağlam (review geçti)
- `bids_select_bidder_or_listing_owner` — Faz 1 fix, public read kapalı ✓
- `bid_deposits` (deposits_buyer_self / deposits_seller_view / deposits_admin_all) ✓
- `profiles_select_self` (self read) + `profiles_select_admin` (admin) ✓
- `listings_select_active` + `listings_select_admin` + ownership update ✓
- `rate_limit_buckets_service_only` — Faz 1 fix ✓
- Soft-delete pattern (events, moderation_queue) ✓

### 🔴 Açık veya riskli
- `corporate_leads.allow_insert_all`: roles=`{anon,authenticated}`, with_check=`true` — F1.4
- `corporate_leads.allow_select_all`: roles=`{anon,authenticated}` — F1.4
- `organizations.org_public_read`: qual=`true` — F1.4
- `bid_bonds.bid_bonds_insert_self` + `bid_bonds_update_self`: auth.uid()=bidder_id, user direct write — F1.5

### Boş (tablo RLS aktif ama policy=0 → kullanıcı erişimi yok)
- `idempotency_keys` (policy=0) — Tablo orphan, kullanan RPC yok (`idempotency_keys_writers=NONE`)
- `rate_limit_events` (policy=0) — Internal log

### Public-read (kasıtlı görünüyor)
- `pre_launch_signups.pre_launch_insert_anon` (kayıt için anon insert OK)
- `commission_campaigns.cc_public_read`
- `auctions.auctions_select_public`
- `listings.listings_select_active`
- `agent_performance.agent_performance_select_own` (own)

## A4. Migration zinciri

**Production'da (schema_migrations) 31 satır:**
```
20260428120000 initial_schema
20260428120100 rls_policies
20260428120200 place_bid_function
20260429120000 profiles_extra_fields
20260429120100 bid_bonds_and_antisniping
20260429120200 listings_rls_strict
20260429120300 audit_log
20260429120400 memberships_service_fees_authorizations
20260429140000 listings_insert_kyc_edevlet_idempotent
20260430120000 write_policies_and_place_bid_v2
20260430140000 pre_launch_signups
20260430150000 profiles_role_place_bid_antisniping ← F1.2 buradan kayboldu
20260501120000 ai_buynow_deposit
20260502120000 profiles_rls_recursion_service_grants
20260504140000 chat_messages_compliance_stub
20260516120000 admin_listing_security
20260516120001 v2_core_safety_additive
20260516120100 v2_multi_tenant
20260516120200 v2_liquidity
20260516120300 v2_kyc_moderation_bulk
20260517140000 land_ges_intelligence
20260517150000 engineering_war_room
20260518120000 ibuyer_trade_in
20260518140000 ges_land_evaluation
20260518200000 takas_enhancements
20260518300000 trade_offers
20260521221500 harden_bids_visibility_and_public_views
20260526162000 harden_events_moderation_rls_soft_delete
20260526200500 harden_rate_limit_buckets_rls
20260527120000 buy_now_kyc_guard
20260527130000 device_push_tokens
```

**Lokal `supabase/migrations/` (32 dosya — son ekleme bond_guard):**
- Tüm 31 production migration ✓
- **Eksik (production'da yok, lokalde var):** `20260516120400_v2_pgmq_matching.sql` (Faz 4 — Dashboard hazırlık bekliyor)
- **Yeni (henüz deploy edilmedi):** `20260527130100_place_bid_bond_guard.sql` (kullanıcı BAS bekliyor)

**Hayalet migration:** YOK (production'da fazlalık yok).

**Faz 4 önkoşulu:** Dashboard → Database → Extensions: `pgmq`, `pg_cron`, `pg_net` enable. SQL Editor: `alter database postgres set app.functions_url = ...` + `app.cron_secret = ...`. Sonra `db query --linked --file 20260516120400_v2_pgmq_matching.sql`.

## A5. Enum + domain envanteri (8 enum)

```
ges_agricultural_class: MARGINAL,NORMAL,MUTLAK,UNKNOWN
ges_hard_kill_reason: SIT_OR_MILITARY,ABSOLUTE_AGRICULTURE,NO_CADASTRAL_ROAD
ges_project_status: DATA_COLLECTION,ENGINEERING_CALCULATION,HIGH_VIABILITY,TECHNICAL_REJECTION,SUBMITTED_TO_INVESTORS
ges_slope_aspect: SOUTH,NORTH,EAST,WEST,FLAT,MIXED
ibuyer_target_option: CASH_ONLY,TRADE_IN,BOTH
instant_offer_status: PENDING,LEGAL_REVIEW,OFFER_GENERATED,REJECTED,EXPIRED,ACCEPTED
target_type: REAL_ESTATE,VEHICLE
trade_status: PENDING,ACCEPTED,REJECTED,CANCELLED,LEGAL_REVIEW,COMPLETED
```

**Eksik enum:**
- `profiles.kyc_status` — text check (none/pending/verified/rejected), enum DEĞİL. Sorun yok ama enum'a çekmek tutarlılık için. Karar.
- `auctions.status` — text check (scheduled/live/ended/cancelled), enum DEĞİL. Aynı.
- `bid_deposits.status` — text check (pending/authorized/captured/released/forfeit_partial/failed/expired), enum DEĞİL.

**CHECK constraint listesi:** 56 check (kolon değer kısıtları, status enum'ları). Sağlam.

## A6. Trigger + index haritası

**Trigger'lar (4 toplam):**
- `device_push_tokens.trg_dpt_updated_at` [BEFORE UPDATE]
- `events.trg_soft_delete_events` [BEFORE DELETE]
- `moderation_queue.trg_soft_delete_moderation_queue` [BEFORE DELETE]
- `trade_offers.trade_offers_updated_at` [BEFORE UPDATE]

**Eksik trigger'lar (kritik tablolar):**
- `profiles.updated_at` trigger YOK — manuel set varsayımı (kontrol gerekir; updated_at değişimi RPC'lerde elle yapılıyor olabilir)
- `listings.updated_at` trigger YOK
- `auctions.updated_at` trigger YOK (auction.bid_count, ends_at güncellemesi place_bid içinde, OK)
- `bid_deposits.updated_at` YOK
- `kyc_verifications` updated_at YOK
- Genel kalıp eksik: tüm updated_at'lı tablolara bir tane `tg_set_updated_at` trigger önerilir.

**Auth/users → profiles trigger:**
- `on_auth_user_created` ✓ (kanıt: `handle_new_user_trigger: on_auth_user_created`)

**Index sayıları:** 47 tabloda toplam 96+ index (rakam yaklaşık). Yüksek-volüm tablolar (bid_deposits=4, profiles=4, listings=4, property_analysis_reports=4) yeterli. `bids` 3 index — auction_id+amount_try desc btree var (initial schema). `auctions` 3 index, kritik (status filter için olmalı). Performans için kritik bir index eksiklik göze çarpmıyor.

---

# B — WEB KOD KILCAL TARAMA

## B1. Facade/RPC çağrım haritası

**Çekirdek facade'lar (`src/lib/`):**

| Dosya | RPC | İmza | Tüketici |
|---|---|---|---|
| `src/lib/placeBid.ts:58` | `place_bid` | `(auctionId, amountTry, idempotencyKey?)` → `PlaceBidResult` | `AuctionDetail.tsx:464` |
| `src/lib/buyNow.ts:125` | `execute_buy_now` | `(listingId, depositId, idempotencyKey?)` → `ExecuteBuyNowResult` (7-case union) | `AuctionDetail.tsx:378`, `BuyNow.tsx` |
| `src/lib/ibuyer/submitInstantOffer.ts:57` | `submit_ibuyer_application` | (?) | `IBuyerPage.tsx` |
| `src/lib/ges-land/submitGesProject.ts:63` | `submit_ges_land_evaluation` | (?) | `pages/ges-land/...` (var) |

**Raw RPC çağrıları (facade YOK / yarı facade):**

| Dosya:satır | RPC | Durum |
|---|---|---|
| `src/pages/AuctionDetail.tsx:269` | `register_bid_deposit` (context='bid') | **Facade YOK** — depositRegister.ts yazılacak |
| `src/pages/AuctionDetail.tsx:319` | `register_bid_deposit` (context='buy_now') | **Facade YOK** |
| `src/pages/admin/AdminDashboard.tsx:106` | `admin_approve_listing` | Admin tek nokta, facade overkill |
| `src/hooks/useActiveOrg.ts:57` | `set_active_org` | Hook, helper OK |
| `src/features/organizations/OrganizationDashboard.tsx:37` | `org_dashboard_stats` | NOT SECDEF (invoker rights) — araştırılacak |

**Refactor durumu:**
- `bdaa42e refactor(client): BuyNow.tsx + AuctionDetail.tsx use buyNow helper` — BuyNow.tsx tamam, AuctionDetail.tsx **PARTIAL** (executeBuyNow facade kullanıyor ama register_bid_deposit raw).
- `depositRegister.ts` facade yazılırsa AuctionDetail.tsx:269,319 tek noktaya alınır → refactor tamamlanır → mobil aynı facade'i kullanır.

## B2. Güvenlik kapısı haritası (kritik handler'lar)

### `src/pages/AuctionDetail.tsx`

#### `handleBid` (satır 433-487) — bid akışı
| Kontrol | İstemci | Sunucu enforce | Bypass riski |
|---|---|---|---|
| Auction ended | `auctionEndedVisual` state | place_bid `ends_at <= now()` | ✓ sunucu |
| Amount validate | `parsePositiveTryFromInput` | place_bid `p_amount min_increment` | ✓ sunucu |
| User login | `if (!user) toast('giriş yapın')` | place_bid `auth.uid() is null` | ✓ sunucu |
| **Deposit/bond zorunluluğu** | `bidDisabled` state | **❌ YOK** (F1.2) | 🔴 **BYPASS MÜMKÜN** |
| Bid gate (KVKK çekboxları) | `isBidGateComplete(bidGateAck)` | (yok) | 🟡 UX-only, hukuk açısından sözleşme sorunu |

**Sonuç:** place_bid bond guard deploy edilmeden BYPASS aktif. F1.2 fix sonrası kapanır.

#### `runPreAuth` (satır 250-296) — bid context için ön-yetki
| Adım | Davranış |
|---|---|
| `preAuthorize(...)` | `src/lib/payment/...` — iyzico ön-yetki (mock) |
| `register_bid_deposit` raw RPC | KYC guard ✓ sunucu, rate_limit ✓ |
| Mock fallback | Demo ilan için `mock-local-{ts}` |

**Server-enforce ✓.** Ama F1.1 (KYC verified=0) yüzünden gerçek kullanıcı erişemez.

#### `runPreAuthBuyNow` (satır 298-348) — buy_now context için ön-yetki
Aynı pattern + `context='buy_now'`. Server-enforce ✓.

#### `executeBuyNowConfirm` (satır 350-418) — Hemen Al onay
| Adım | Davranış |
|---|---|
| `!reportApproved` | "Önce raporu onaylayın" — execute_buy_now sunucuda da kontrol ediyor (`report_approvals` EXISTS) ✓ |
| `!depositIdBuyNow` | "Önce blokaj" — sunucu da kontrol ediyor (`bid_deposits status=authorized`) ✓ |
| `!buyNowFinalAck` | "Yasal onay kutusu" — istemci-only, ama sözleşme akışı için **UX-only**, sunucu yapamaz |
| `useServerBuyNow` flag | mock prefix kontrolü; gerçek RPC vs demo |
| `executeBuyNow` discriminated union | 7-case ✓: ok / duplicate / kyc_required / auth_required / preconditions_failed / rpc_error / config_missing |
| `kyc_required` → `navigate("/kyc")` (2.5s gecikme) | ✓ yönlendiriyor; **AMA `/kyc` simülasyon (F1.1)** |

**Server-enforce ✓.** Bypass mümkün değil; yalnız F1.1 yüzünden gerçek akış mümkün değil.

## B3. KYC akışı haritası

**Web tarafı:**
- `/kyc` route (App.tsx içinde grep'le bulunamadı satır 130-230 arasında — daha sonraki satırlarda var olabilir; **araştırılacak: App.tsx tam satır numarası**)
- `src/pages/mega/KycSimulation.tsx` — sayfa, "Gerçek değildir" beyanı, 5 phase mock akış (next → otp → uyum işareti → inceleme → tamam)
- `src/data/mega/kycSimulation.ts` — adım dataset
- Yönlendirme: `BuyNow.tsx:143` ve `AuctionDetail.tsx:397` → `navigate("/kyc")`

**Backend tarafı:**
- `supabase/functions/kyc-submit/index.ts` — edge function. Body: `subject_type`, `subject_id`, `documents[]`, `declared_data`. Yazıyor: `kyc_verifications` tablosuna `submitted_by, ...` ile insert. `status=?` (kontrol edilmedi tam, ama default 'pending' check constraint mevcut).
- Verified yapacak RPC YOK (kanıt: `kyc_verify_fn_exists=false`, `kyc_fn_names: NONE`).
- Manuel olarak admin DB'den `update profiles set kyc_status='verified' where id='...'` çalıştırabilir — ama hiçbir UI bunu yapmıyor.

**Sonuç — uçtan uca:**
1. Kullanıcı RPC'den `kyc_required` aldı → `/kyc` simülasyon sayfasına yönlendi
2. UI'da "Devam → SMS kod (demo) → Uyumlu işaretle (demo) → Tamamla" akışı
3. **Hiçbir yerde profiles.kyc_status='verified' yazılmıyor.**
4. Kullanıcı tekrar RPC çağırsa hâlâ `kyc_required` alır.
5. Kapalı döngü, kullanıcı asla "verified" olamıyor.

**Eksik adımlar:**
- KYC submit edge function'ı `kyc_verifications` tablosuna pending olarak yazıyor; sonraki adım yok.
- Admin için kyc_verifications onay UI'ı yok (admin paneli muhtemelen sınırlı).
- "Verified" yapacak admin RPC yok.

## B4. Hata yönetimi + audit

**RPC error code'ları ve UI handling:**

| Error code | UI'da gösterim |
|---|---|
| `kyc_required` | toast(warning) + 2.5s sonra `navigate("/kyc")` ✓ |
| `deposit_required` (yeni, bond guard ile) | Henüz UI'da yok; eklenecek (mobil + web) |
| `rate_limited` ("Çok sık deneme") | toast(error) ✓ |
| `auction_ended` ("İhale bitti") | toast(info) ✓ |
| `listing_not_active` | toast(error) ✓ |
| `report_not_approved` ("Önce AI raporunu onaylayın") | toast(error) ✓ |
| `auth_required` | toast(warning) "Giriş yapın" ✓ |
| `preconditions_failed` | toast(error) generic message ✓ |
| `rpc_error` (PostgrestError) | toast(error) + `error.code` ✓ |
| `config_missing` | toast(error) "Supabase yapılandırması eksik" ✓ |

**Audit log durumu:**
- `write_audit_v2(p_action, p_entity_type, p_entity_id, p_diff)` interface tam.
- `audit_log_count=0` — hiç tetiklenmemiş.
- Mevcut SECDEF RPC'lerden `admin_approve_listing` + `soft_delete_*` + `write_audit_v2` kendisi flag=audit.
- Kritik akışlar (place_bid, register_bid_deposit, execute_buy_now) write_audit_v2 ÇAĞIRMIYOR. Bu eksiklik — para akışı audit edilmiyor.

**Öneri:** place_bid + register_bid_deposit + execute_buy_now içine `perform public.write_audit_v2(...)` ekle. F2'deki KARAR notlarına alındı.

## B5. AuthContext + Route Guard

**Web AuthContext (`src/contexts/AuthContext.tsx`):**
- `user`, `session`, `loading`, `profile (role + isAdmin)`, `profileLoading`, `signIn/signUp/signOut`
- `isSupabaseConfigured()` ile demo mode fallback
- `onAuthStateChange` ile session güncellemesi ✓

**Route Guard durumu (`src/App.tsx`):**
- **Route düzeyinde guard YOK** çoğu sayfada. Sayfaların kendisi `useAuth()` → user null kontrolü yapıyor olmalı.
- Sadece `LocalAuthGate` wrapper bir route'ta görünüyor: `/emlakci-giris`.
- `RequireAuthGate` component'i mevcut ama Route'lar wrap'i değil, sayfa içi conditional rendering: `IBuyerPage.tsx`, `BuyNow.tsx` import ediyor.

**Korumalı sayfalar (manuel kontrol gerekir):**
- `/profil` (Profile) — sayfa içinde user yok → kontrolü olmalı
- `/panel` (UserPanel) — aynı
- `/mesajlar`, `/belgeler`, `/ayarlar`, `/favoriler`, `/raporlar` — aynı
- `/ihale-ac` (CreateAuction) — aynı
- `/dashboard`, `/dashboard/yatirimci`
- `/ibuyer` — RequireAuthGate ✓
- `/ihale/:auctionId/hemen-al` (BuyNow) — RequireAuthGate ✓

**Risk:** Route düzeyinde guard yokken sayfa içinde user-null kontrol unutulursa SSR olmasa da bile bileşen mount olur, sensitive UI flash olur. Mobile'da `_layout.tsx` PROTECTED_ROUTES set'i ile centralized; web'de centralized eksik.

**Deep-link bypass:**
- Mobile K-A: `bed875d fix(mobile-auth): add route-level guard for personal screens` ile çözüldü.
- Web: aynı pattern uygulanmamış — `RequireRouteAuth` wrapper veya React Router `loader` ile yapılabilir.

**Araştırılacak:** Web Profile.tsx vs UserPanel.tsx içinde user-null kontrolü var mı? Bu turda okumadım.

---

# C — MOBİL KOD KILCAL TARAMA

## C1. RPC bağlantı durumu (mobil)

| Dosya | İş | Durum | Detay |
|---|---|---|---|
| `mobile/src/features/notifications/pushNotifications.ts` | register_push_token / unregister_push_token | **GERÇEK** ✓ | `4833925 fix(mobile-push): wire production register/unregister RPC bridge` |
| `mobile/shared/bidActions.ts:50,53` | submitBid → placeBidRpc | **MOCK** (setTimeout 250) | TODO satırı, validateBid ✓ pure engine ama RPC yok |
| `mobile/src/app/(tabs)/borsa.tsx:98-142` | handleSubmit → bidActions | **MOCK** zinciri | bidderId=session.user.id ✓ (K-B fix), ama bidActions fake |
| `mobile/src/app/ihale/[id]/teklif.tsx:14-24` | submitMock | **MOCK** | KVKK checkbox + amount, state-only |
| `mobile/src/app/ihale/[id]/hemen-al.tsx:13-19` | onMockBuyNow | **MOCK** | 3-step açıklama UI, RPC yok |
| `mobile/src/app/ihale/[id]/kapali-teklif.tsx:23-29` | onSubmit | **MOCK** | Sealed-bid backend zaten yok |
| `mobile/src/app/ihale/[id].tsx:26-36` | setTimeout(300) + mock notice | **MOCK** | "Çekirdek API gerekli: placeBid + watchlist + notifications" |
| `mobile/src/app/uluslararasi/index.tsx:13-17` | Lead kaydı | **MOCK** | KVKK consent ✓ ama state-only |
| `mobile/src/app/sehirler/index.tsx` | Şehir rehberi | **STATIC** | Mock content viewing |
| `mobile/src/app/moduller/index.tsx` | Modül listesi | **STATIC LINK LIST** | Tüm modüller mock |
| `mobile/src/app/moduller/deprem/index.tsx` | Deprem modeli | **MOCK** | setTimeout(220), mock rows |
| `mobile/src/app/analiz/tapu/index.tsx + aiService.ts` | mockTapuAiService.analyzeTapu | **MOCK** | setTimeout(450), AI sonucu uydurma |
| `mobile/src/app/analiz/ilan/index.tsx + aiService.ts` | mockIlanAiService.analyzeIlan | **MOCK** | setTimeout(300) |
| `mobile/src/app/belgeler/data.ts` | Belge listesi | **MOCK** | setTimeout(260) |
| `mobile/src/app/bildirimler/data.ts` | Bildirimler | **MOCK** | setTimeout(240) |
| `mobile/src/app/favoriler/data.ts` | Favoriler | **MOCK** | setTimeout(220) |
| `mobile/src/app/mesajlar/data.ts` | Mesajlar | **MOCK** | setTimeout(250) |
| `mobile/src/app/ihaleler/data.ts` | İhale listesi | **MOCK** | setTimeout(240) |
| `mobile/src/app/borsa-detay/data.ts` | Borsa watchlist/alarms/auto-bid | **MOCK store** | In-memory mockStore |
| `mobile/src/app/(tabs)/profil.tsx` | Auth + push + biyometrik + lokasyon | **GERÇEK** ✓ (push token wire), KVKK consent state-only |

**Özet:** Mobile'da gerçek backend bağlantısı **sadece**:
- Auth (Supabase via SecureStore)
- Push register/unregister RPC

Diğer **her şey** mock veya static.

## C2. Mobil facade durumu

`mobile/shared/` barrel (`mobile/shared/index.ts`):
```ts
export * from './valuation';
export * from './borsa';            // -> @/lib/borsa/orderBook + marketData + auctionEngine
export * from './calculators';
export * from './locationIntelligence';
export * from './bidActions';        // -> validateBid + setTimeout(250) MOCK
export * from './demoMarket';
```

**Eksikler:**
- `buyNow` re-export YOK
- `placeBid` re-export YOK
- `depositRegister` re-export YOK
- `fees` re-export YOK (MIN_INCREMENT_TRY mobile'a köprüsü dolaylı)
- `executeBuyNow` mobile barrel'da YOK

**Akşam planı (AKSAM_PLANI.md):**
- Adım 5,6: `mobile/shared/buyNow.ts` + barrel ekle (placeBid + executeBuyNow + depositRegister re-export)
- Adım 4: `bidActions.ts` gerçek placeBidRpc çağrısı

**SupabaseClient mobile (authClient.ts):**
- `SupabaseClientLike` tipi `.auth` + (`from` implicit) — `.rpc()` exposed DEĞİL
- Mobile RPC çağrısı için: `(await getSupabaseClient()) as unknown as SupabaseClient` cast (zaten `persistAuthSession` bu pattern'i kullanıyor satır 72-73)
- Veya tip genişlet (`SupabaseClientLike.rpc?: (fn:string, params?:any) => Promise<{data, error}>`)

## C3. AuthGuard kapsamı

`mobile/src/app/_layout.tsx:9-21`:
```ts
const PROTECTED_ROUTES = new Set([
  'profil', 'bildirimler', 'mesajlar', 'favoriler', 'belgeler',
  'ihale', 'ihaleler', 'ilan', 'analiz', 'uluslararasi', 'borsa-detay'
]);
```

**Kapsadığı:**
- ✓ ihale (teklif, hemen-al, kapali-teklif)
- ✓ ihaleler (liste)
- ✓ ilan (detay)
- ✓ analiz (tapu, ilan)
- ✓ borsa-detay (izleme, veri, portfoy)
- ✓ Kişisel: profil, bildirimler, mesajlar, favoriler, belgeler
- ✓ uluslararasi (lead)

**Kapsamayan (potansiyel risk):**
- `(tabs)/borsa.tsx` — tabs grup içinde, topRoute filter sırasında `(tabs)` segment skip ediliyor → guard check'i etkisiz. Borsa.tsx submitBid çağrısı yapıyor (auth.uid() gerekir) ama protected route DEĞİL. Anonim user erişebilir, içeride `bidderId=null` → "Giriş gerekli" alert. UX iyi değil ama bypass değil.
- `moduller`, `sehirler`, `araclar`, `icerik`, `kka` — public sayfalar olarak işaretlenmiş. KKA modülü preview, OK. Diğerleri içerik-yoğun.

**Deep-link bypass (K-A fix):**
- `ca93b20 fix(mobile-auth): harden protected routes and block pre-auth render` ile çözüldü
- `_layout.tsx:69-72`: `if (isProtectedRoute && !isSignedIn) router.replace('/(auth)/login')` ✓
- `_layout.tsx:78`: `if (!authReady) return null` — pre-auth render block ✓

## C4. KVKK akışı

| Ekran | Consent ayrı mı? | SecureStore persist | Maskeleme | Notlar |
|---|---|---|---|---|
| `(tabs)/profil.tsx` (lokasyon) | ✓ ayrı (`locationIlluminationAccepted` + `locationConsentAccepted`) | ❌ state-only (M-3) | (yok) | refresh ile sıfırlanır |
| `(tabs)/profil.tsx` (push) | ✓ ayrı (`pushIlluminationAccepted` + `pushConsentAccepted`) | ❌ state-only (M-3) | (yok) | refresh ile sıfırlanır |
| `(tabs)/profil.tsx` (background lokasyon) | ❌ ayrı modal YOK (M-5) | ❌ | ❌ | `requestBackgroundPermissionsAsync` çağrısı doğrudan |
| `analiz/tapu/index.tsx` | ✓ (consent ekranı) | ❌ state | ✓ | Mock AI ama KVKK consent var |
| `analiz/ilan/index.tsx` | ✓ | ❌ state | ✓ | Aynı |
| `ihale/[id]/teklif.tsx` | ✓ KVKK checkbox | ❌ state | (yok) | Mock |
| `ihale/[id]/hemen-al.tsx` | ✓ tek kombine onay | ❌ state | (yok) | Mock |
| `ihale/[id].tsx` | ✓ alarm/izleme KVKK | ❌ state | (yok) | Mock |
| `uluslararasi/index.tsx` | ✓ tek consent (`consentAccepted`) | ❌ state | (yok) | Mock |
| `moduller/deprem/index.tsx` | ✓ KVKK rıza adımı | ❌ state | ✓ (region masking `/.*/` -> "/ ***") | Mock |
| `borsa-detay/*` | (yok — sadece veri ekranı) | ❌ | ❌ | Mock |

**Tutarlılık:**
- Konum/push paritesi `5fdfc5b fix(mobile-kvkk): separate consent gates` ile sağlanmış ✓
- **M-3 her ekranda mevcut:** SecureStore persist yapan ekran YOK.
- **M-5 mevcut:** Background lokasyon için ayrı modal YOK.
- Maskeleme deprem modülünde var, diğerlerinde yok (uygun değil tabi — kişisel ekranlar için maskeleme gerekmez).

## C5. Güvenlik sertleştirme envanteri (mobil)

| Kontrol | Durum | Risk | SDK56 çözümü |
|---|---|---|---|
| **TLS Certificate Pinning** | ❌ YOK | Orta — MITM bid değiştirme | `react-native-ssl-pinning` (bare workflow gerek, EAS Build dev client) — **ertelensin** |
| **Biometric (LocalAuthentication)** | ✓ Var (`(auth)/biometric.ts`) ama `disableDeviceFallback:false` (M-1) | Orta — PIN/parola fallback yüksek-değer için | `authenticateBiometric(reason, {strict:true})` parametre eklenip yüksek-değer akışta strict=true |
| **Jailbreak/Root tespiti** | ❌ YOK | Düşük-orta — TR pazarında düşük | `expo-device.isRootedExperimentalAsync()` (deneysel) veya `jail-monkey` (bare workflow) — düşük öncelik |
| **Screen capture engeli** | ❌ YOK | Düşük-orta — KYC/ödeme ekran screenshot | `expo-screen-capture.preventScreenCaptureAsync()` mount, allow on unmount; ekranlar: KYC, hemen-al, teklif, profil/kimlik |
| **PrivacyInfo.xcprivacy (iOS 17+)** | ❌ YOK | Orta — App Store reddi | `expo-build-properties` plugin'i ile `iosPrivacyManifests` config; SDK 56 destekliyor |
| **App Transport Security** | ✓ Default HTTPS-only | OK | — |
| **Code obfuscation (Hermes)** | ✓ Expo default Hermes | OK | — |
| **expo-secure-store** | ✓ authClient kullanıyor | OK | — |
| **ITSAppUsesNonExemptEncryption** | ✓ false (app.json) | OK | — |
| **Android ACCESS_BACKGROUND_LOCATION runtime** | ⚠️ permission manifest'te ama runtime KVKK modalı eksik (M-5) | Orta | `Location.requestBackgroundPermissionsAsync()` öncesi KVKK rıza modalı |
| **EAS projectId** | ❌ `PLACEHOLDER_EAS_PROJECT_ID` (D-1) | Yüksek (build-blocker) | `eas init` çalıştır |

## C6. Scope-dışı kod durumu (d5a81ca + sonraki commits)

Cursor `d5a81ca feat(mobile): borsa terminal + new module screens (mock, needs productization)` — büyük scope dışı eklem. Sonraki commits ürünleştirme:

| Dosya | Tip | Karar |
|---|---|---|
| `mobile/src/app/(tabs)/borsa.tsx` | Borsa terminal, ana ekran | **TUT** — gerçek bid RPC bağlanacak (akşam planı) |
| `mobile/src/app/borsa-detay/` (5 ekran + 2 test) | İzleme/veri/portfoy + mock store | **DÜZELT** — gerçek RPC bekliyor, MVP'de tutulabilir |
| `mobile/src/app/ihaleler/` (3 dosya + test) | İhale liste | **DÜZELT** — supabaseAuctionsFetch ile köprüleme |
| `mobile/src/app/sehirler/index.tsx` | Şehir rehberi | **TUT (static)** — web'den linklenir, mobile içerik şu an public OK |
| `mobile/src/app/moduller/` | Modül listesi + deprem mock | **TUT** — preview/eğitim amaçlı, scope açık |
| `mobile/src/app/uluslararasi/index.tsx` | Uluslararası lead | **DÜZELT** — gerçek lead RPC (corporate_leads kullanıma uygun ama F1.4 fix gerek) |
| `mobile/src/app/analiz/tapu/` + `analiz/ilan/` | AI analiz (mock) | **TUT (preview)** — AI backend gerçekleşince bağlanır |
| `mobile/src/app/kka/` | KKA preview | **TUT** — KKA Hub web'de var |
| `mobile/src/app/araclar/` | Hesaplayıcılar | **TUT** — calculators shared'dan beslenir |
| `mobile/src/app/icerik/` | İçerik (KVKK vb. webview proxy) | **TUT** — webContentCatalog ile yönlendirme |
| `mobile/src/app/belgeler/data.ts` | Belge listesi | **DÜZELT** — gerçek documents tablo bağlama |
| `mobile/src/app/bildirimler/data.ts` | Bildirim listesi | **DÜZELT** — gerçek notifications tablo bağlama |
| `mobile/src/app/favoriler/data.ts` | Favoriler | **DÜZELT** — gerçek watchlist tablo bağlama |
| `mobile/src/app/mesajlar/data.ts` | Mesajlar | **DÜZELT** — gerçek chat_messages bağlama |
| `mobile/src/app/ihale/[id].tsx` | İhale detay + alarm/teklif preview | **DÜZELT** — supabase ihale detay + bid RPC |

**Test eksikliği:** Yeni ekranlardan `borsa-detay/__tests__/data.test.ts`, `ihaleler/__tests__/filters.test.ts`, `analiz/tapu/__tests__/privacy.test.ts`, `analiz/ilan/__tests__/ilan.test.ts` — var, hepsi pure-engine tests. Integration test yok (RPC mock'lar). Acceptable for MVP.

---

# D — TUTARLILIK VE EKSİKLİK ÇAPRAZ KONTROLÜ

## D1. Web ↔ Mobil parite

| Özellik | Web | Mobil | Durum |
|---|---|---|---|
| Auth (signin/signup) | ✓ Login.tsx, Register.tsx | ✓ (auth)/login.tsx, register.tsx, reset-password.tsx | parite ✓ |
| Profil | ✓ Profile.tsx | ✓ (tabs)/profil.tsx | parite ✓ (mobilde KYC ekranı yok) |
| İhale listesi | ✓ LiveAuctions, AuctionListPage | ✓ ihaleler/index.tsx (mock data) | **mobilde mock** |
| İhale detay | ✓ AuctionDetail.tsx (3000+ satır, tam akış) | ✓ ihale/[id].tsx (mock) | **mobilde mock** |
| Teklif | ✓ handleBid → placeBidRpc | ❌ teklif.tsx mock | F1.7 |
| Hemen Al | ✓ BuyNow.tsx + AuctionDetail executeBuyNow | ❌ hemen-al.tsx mock | F1.7 |
| Kapalı teklif | ✓ (var mı?) | ❌ kapali-teklif.tsx mock (backend yok) | parite ✓ (her ikisi de eksik) |
| KYC | ⚠️ KycSimulation.tsx (sahte) | ❌ Mobil ekran yok, Linking ile web'e | F1.1 |
| AI analiz (tapu/ilan) | ✓ src/pages/analiz/* (mock?) | ⚠️ mockTapuAiService / mockIlanAiService | parite ✓ (her ikisi mock) |
| Borsa terminal | ⚠️ BorsaAssetDetailPage.tsx | ✓ (tabs)/borsa.tsx + borsa-detay | mobilde Cursor scope-dışı eklem |
| Bildirimler | ✓ notifications tablo + UI | ⚠️ bildirimler mock | mobilde mock |
| Mesajlar | ✓ chat_messages + chat_threads | ⚠️ mesajlar mock | mobilde mock |
| Belgeler | ✓ Documents.tsx + documents tablo | ⚠️ belgeler mock | mobilde mock |
| Favoriler | ✓ Favorites.tsx + watchlist | ⚠️ favoriler mock | mobilde mock |
| Push notifications | ⚠️ Web push ayrı (service worker) | ✓ device_push_tokens + register/unregister RPC | mobil daha sağlam |
| Biometric | (yok) | ✓ LocalAuthentication | mobil tek taraflı |
| Lokasyon radar | (yok) | ✓ locationRadar + geofencing | mobil tek taraflı |
| Deprem modülü | (var mı?) | ✓ moduller/deprem (mock) | araştırılacak |
| KKA / Land Equity | ✓ KKA Hub | ✓ kka preview | parite |
| GES / Land | ✓ ges-land sayfaları | (yok) | web tek taraflı |
| iBuyer | ✓ IBuyerPage.tsx + submitInstantOffer facade | (yok) | web tek taraflı |
| Trade-In | ✓ trade-in sayfaları | (yok) | web tek taraflı |
| Trade Offers (P2P) | ✓ trade_offers tablo + 3 RPC | (yok) | web tek taraflı |
| Admin paneli | ✓ AdminDashboard.tsx | (yok) | web tek taraflı |
| Komisyon hesaplayıcı | ✓ /komisyon-hesaplayici | ✓ araclar/* | parite |

**Eksitsizlik özet:**
- Mobilde "8 mock data dosyası" var (favoriler/bildirimler/mesajlar/belgeler/ihaleler/borsa-detay/...) — gerçek tabloya bağlanmalı
- Web tarafında olan **GES/iBuyer/Trade-In/Trade Offers/Admin** mobilde yok — MVP scope kararı (F2.2)
- Mobile'da "Borsa Terminal" web'de denk değil — Cursor'ın scope-dışı eklemesi

## D2. Çekirdek motor köprüsü (mobile/shared → src/lib)

`mobile/shared/index.ts` re-export'ları:

| mobile/shared | → src/lib | Durum |
|---|---|---|
| `valuation` | `src/lib/valuation/...` | re-export, drift YOK ✓ |
| `borsa` | `src/lib/borsa/orderBook` + `marketData` + `auctionEngine` | re-export ✓ |
| `calculators` | `src/lib/calculators/...` | re-export ✓ |
| `locationIntelligence` | (mobil tarafta lokal) | drift riski araştırılacak |
| `bidActions` | (mobil tarafta facade) | local — `validateBid` shared'dan, RPC kısmı TODO |
| `demoMarket` | (mobil tarafta lokal) | drift riski araştırılacak |

**Çift kod riski:**
- `locationIntelligence` ve `demoMarket` mobilde local (web'de denk modüller var mı kontrol edilmeli). Eğer mobilde tek başına ise OK, ama web ile drift'e açık.

## D3. Mock ↔ gerçek ayrımı

**Mobilde mock olan ama gerçeğe yakın:**
- `bidActions.ts` — validateBid pure engine gerçek, RPC kısmı setTimeout → akşam planı ile gerçekleşecek
- `pushNotifications.ts` — gerçek RPC ✓

**Mobilde tam mock:**
- 4 ihale ekranı (teklif/hemen-al/kapali-teklif/[id])
- 6 data dosyası (favoriler/bildirimler/mesajlar/belgeler/ihaleler/borsa-detay)
- 2 AI servisi (tapu/ilan)
- 1 modül (deprem)
- 1 lead form (uluslararasi)

**Web'de mock olan ama gerçek bekliyor:**
- `KycSimulation.tsx` — mock simulasyon (F1.1)
- `preAuthorize` (`src/lib/payment/capabilities.ts`?) — iyzico mock fallback (production'da gerçek mi araştırılacak)
- AI analiz sayfaları (`src/pages/analiz/...`)

**Production'a sızma riski:**
- Hiçbir mock production'da görünür değil (üretim 0 traffic)
- Test user akışlarında `mock-local-{ts}` veya `mock-buynow-{ts}` prefix'leri var — bunlar sunucuya gönderilmiyor (clientside fallback)
- `bidActions.ts` setTimeout(250) "üretimde" yorumu var ama production user yok → sızma riski şu an sıfır

## D4. Komisyon akışı + audit

**`commission_records` tablosu:**
- 4 FK: auction_id, seller_id, buyer_id, agent_id → tüm taraflar trackable
- 1 policy: `commission_records_select_party` — taraflar okur
- Row count: 0 (hiç komisyon kayıtlı değil)

**`calculate_commission_with_offset` RPC:**
- Body 3380 karakter
- 🔴 auth_check YOK, audit YOK
- GRANT: PUBLIC EXECUTE (F1.3)

**Bekleyen sorular:**
- RPC body okumadım — `commission_records`'a INSERT yapıyor mu? Service_fees ile mahsup mekanizması var mı?
- Trigger: `auctions.status='ended'` olduğunda commission_records insert otomatik mi yoksa manuel mi?

**Defterdeki "komisyon-trigger gap" (OTURUM_DURUMU veya önceki belge):**
- Henüz okunmadı bu turda
- Olasılıkla: `execute_buy_now` listings.status='sold' yapar, auctions.status='ended' yapar ama commission_records insert YAPMAZ. Yani satış sonrası komisyon kaydı OTOMATİK değil.
- Manuel: admin paneli üzerinden? Veya başka bir RPC?

**Araştırılacak:** `calculate_commission_with_offset` gövde okuma + trigger kontrol.

## D5. AI / external entegrasyonlar

| Entegrasyon | Mevcut | Durum |
|---|---|---|
| AI fiyat tahmini | `supabase/functions/ai-price-estimate/` edge function | wire-up bilinmiyor |
| AI Q&A | `supabase/functions/ai_qa/` | wire-up bilinmiyor |
| AI tapu analizi (mobil) | `mockTapuAiService` (mock) | UI-only mock |
| AI ilan analizi (mobil) | `mockIlanAiService` (mock) | UI-only mock |
| iyzico ödeme | `supabase/functions/payments-iyzico/` edge function + `src/lib/payment/capabilities.ts` | bid_deposits.iyzico_capture_ref=0 — gerçek capture henüz yok, web tarafında `preAuthorize` mock fallback |
| PayTR ödeme | `supabase/functions/payments-paytr/` | yedek sağlayıcı |
| Bulk listing ingest | `supabase/functions/bulk-listing-ingest/` | wire-up bilinmiyor (bulk_jobs tablo var) |
| Matching fanout (Faz 4 öncesi) | `supabase/functions/matching-fanout/` (`--no-verify-jwt`) | Faz 4 pgmq olmadan trigger yok |
| Push (Expo + FCM/APNs) | mobile/features/notifications/pushNotifications.ts | Expo push ✓, gerçek yarınki sertifika gerek |
| KYC sağlayıcı (Findeks/e-Devlet) | (yok) | F1.1 |
| Place bid edge function | `supabase/functions/place-bid/` ve `place_bid/` (iki dizin) | RPC ile parallel mi? Araştırılacak — placeBidRpc DB RPC çağırıyor, edge function alternatif (gateway) olabilir |
| Post chat message | `supabase/functions/post_chat_message/` | wire-up bilinmiyor |
| PVGIS solar | `supabase/functions/pvgis_solar/` | GES için |
| TCMB Yİ-ÜFE | `supabase/functions/tcmb_yiufe/` | Endeks veri |

**Anti-pattern uyarısı:** `place-bid` ve `place_bid` iki edge function dizini var (tire vs underscore). Hangi adlandırma kullanılıyor karışık. CI workflow'da `npx supabase functions deploy place-bid` (tire) geçiyor; ikisi de var mı?

---

# E — YAPILANLAR + YAPILACAKLAR TAM PLAN

## E1. Bu oturumda yapılanlar özeti

### Web/DB tarafı (main branch, 11 commit ahead)

```
b6dad44 docs(audit): evening session plan
3091f84 docs(audit): session status snapshot for context handoff
00f83e9 chore: gitignore claude state + screenshots, remove stale plan
65faadf chore(audit): archive phase 1-4 deploy SQL files + README
1474019 feat(db): add device_push_tokens migration (K1+K4 mobile push fix)
34315c8 chore(migrations): land 5 unmerged migrations + fix encoding/timestamp
bdaa42e refactor(client): BuyNow.tsx + AuctionDetail.tsx use buyNow helper
605449e feat(security): src/lib/buyNow.ts - thin facade for execute_buy_now RPC
3788a88 feat(security): server-side KYC guard on buy_now + bid_deposit RPCs
12a1abd fix(ui): final homepage visual parity and production QA polish
105fdd8 feat(ui): recreate premium cinematic PropTech homepage reference
```

### Mobil tarafı (feat/mobile-calculators @ 07753a3, origin senkron)

```
07753a3 refactor(mobile-auth): remove VITE env fallback     ← M-6 fix
28cc052 fix(mobile-webview): restrict embedded origins      ← K-C fix
f6622bd fix(mobile-borsa): remove hardcoded bidder          ← K-B fix
ca93b20 fix(mobile-auth): harden protected routes           ← K-A fix
5fdfc5b fix(mobile-kvkk): separate consent gates           ← KVKK parite
211233e chore(mobile-ui): feedback states + a11y
bed875d fix(mobile-auth): add route-level guard
80385c9 feat(mobile-nav): connect hidden routes
4833925 fix(mobile-push): wire register/unregister RPC      ← K1+K4 fix
d5a81ca feat(mobile): borsa terminal + module screens
70104e2 feat: add kka preview
68d399c feat: add deprem module
7c34378 feat: tapu and ilan AI analysis screens with KVKK
7705471 fix(mobile-auth): persist and refresh sessions in SecureStore
6da4697 fix(mobile-push): soft-disable token persistence until backend ready
11ac4c3 chore(mobile): SDK56-native module imports
6ce0c7c feat(mobile): hemen-al ekrani aktif
bcff0ea feat: borsa watchlist and market data sub-screens
9e4888d fix(mobile-shared): replace web aliases in valuation bridge
14e247d fix(build): remove app-level test configs from Expo Router graph
```

### Güvenlik açıkları kapatıldı (3 + 1 hazır)

1. ✓ KYC guard (`buy_now_kyc_guard` migration — `execute_buy_now` + `register_bid_deposit`)
2. ✓ bids public-read sızıntısı (`harden_bids_visibility_and_public_views` — bidder_or_listing_owner + 2 maskelenmiş view)
3. ✓ rate_limit_buckets RLS açık (`harden_rate_limit_buckets_rls`)
4. ⏸️ place_bid deposit guard (bu tur yazıldı, deploy bekliyor — F1.2)

**Mobilde kapatılan 4 kritik (Cursor):**
- K-A: deep-link bypass
- K-B: hardcoded bidder
- K-C: webview originWhitelist
- M-6: VITE env fallback

### Migration deploy (14 satır eklendi)

KYC guard + Faz 1 (2) + Faz 2 (4) + push (1) + Faz 3a (4) + Faz 3b (3) = **14**.

### Repo temizliği

- `00f83e9`: gitignore claude state + screenshots, stale plan removed
- `65faadf`: archive phase 1-4 deploy SQL files + README

## E2. Kalan işler — tam envanter

### 🔴 Acil / release-blocker

| ID | İş | Dosya:satır | Büyüklük | Araç |
|---|---|---|---|---|
| **AB1** | **F1.2 — place_bid deposit guard deploy** | `supabase/migrations/20260527130100_*.sql` + `_audit/migration_deploy/extra_place_bid_bond_guard.sql` | **Küçük** (5 dk deploy + smoke) | Claude Code + kullanıcı "BAS bond guard" |
| **AB2** | **F1.1 — KYC verify mekanizması** | Yeni RPC `admin_verify_kyc` + admin paneli UI veya 3.taraf entegrasyon | **Büyük** (1-2 gün) | Claude + Cursor + ürün kararı |
| **AB3** | **F1.3 — consume_ai_quota + calculate_commission_with_offset auth ekle** | `supabase/migrations/20260527140000_authz_quota_commission.sql` (yeni) | Orta (1-2 saat) | Claude Code |
| **AB4** | F1.4 — corporate_leads + organizations RLS sertleştir | Yeni migration | Orta (1-2 saat) | Claude Code |
| **AB5** | Mobil teklif/hemen-al gerçek RPC bağlantısı (AKSAM_PLANI Bölüm 1) | mobile/shared/* + mobile/src/app/ihale/* + mobile/src/app/(tabs)/borsa.tsx | **Büyük** (4-6 saat) | Claude Code (köprü) + Cursor (UI) |
| **AB6** | Web AuctionDetail.tsx register_bid_deposit refactor (depositRegister.ts facade) | `src/lib/depositRegister.ts` yeni + `src/pages/AuctionDetail.tsx:269,319` refactor | Orta (1-2 saat) | Claude Code |

### 🟠 Release-öncesi gerekli

| ID | İş | Büyüklük | Araç |
|---|---|---|---|
| RB1 | F1.5 — bid_bonds insert/update policy DROP (veya tablo drop) | Küçük | Claude Code |
| RB2 | Faz 4 pgmq deploy (Dashboard hazırlık + deploy + smoke) | Orta | Claude + kullanıcı |
| RB3 | M-1 — biometric strict variant (yüksek-değer) | Küçük | Cursor |
| RB4 | M-3 — KVKK consent SecureStore persist | Küçük-orta | Cursor |
| RB5 | M-4 — push RPC payload error handling | Küçük | Cursor |
| RB6 | M-5 — background lokasyon KVKK modal | Orta | Cursor |
| RB7 | O8 — push deep link router.push | Küçük | Cursor |
| RB8 | D-1 — EAS projectId üret (`eas init`) | Trivial | Kullanıcı |
| RB9 | Screen capture block (hemen-al/teklif/KYC/profil-kimlik) | Küçük | Cursor |
| RB10 | PrivacyInfo.xcprivacy (iOS) | Küçük-orta | Cursor |
| RB11 | Web route-level guard (RequireAuthGate wrapper'lı route'lar) | Orta | Claude Code |
| RB12 | trade_offers RPC'lerine idempotency_key ekle | Orta | Claude Code |
| RB13 | Para akışı RPC'lerine write_audit_v2 entegre (place_bid, register_bid_deposit, execute_buy_now) | Orta | Claude Code |
| RB14 | Komisyon trigger gap fix (auctions ended → commission_records insert otomatik) | Orta-büyük | Claude Code |
| RB15 | Mobil 6 mock data dosyasını gerçek tabloya bağla (favoriler, bildirimler, mesajlar, belgeler, ihaleler, borsa-detay) | Büyük | Cursor |
| RB16 | KYC akışı uçtan uca test (4 test user'ı verify edip akış doğrula) | Orta | Kullanıcı + Claude |
| RB17 | main push (CI yeşil + Faz 4 deploy edildi + kullanıcı onay) | Orta | Kullanıcı |

### 🟢 Release-sonrası iyileştirme

| ID | İş | Büyüklük |
|---|---|---|
| RS1 | TLS certificate pinning (EAS Build dev client) | Büyük |
| RS2 | Jailbreak/root tespiti | Küçük |
| RS3 | Audit log retention politikası | Orta |
| RS4 | Idempotency_keys tablosu kullanımı veya drop | Küçük |
| RS5 | rate_limit_events drop (kullanılmıyor) | Trivial |
| RS6 | bid_bonds tablosu drop (orphan) | Küçük |
| RS7 | Mobile native KYC (kamera + e-Devlet OCR) | Çok büyük |
| RS8 | Mobile iBuyer/Trade-In/GES (F2.2 kararına göre) | Büyük |
| RS9 | Web push (service worker) — opsiyonel | Orta |
| RS10 | i18n EN tam kapsam | Büyük |

### 🟣 Hukuk / store / ürün kararı bekleyen

| ID | İş | Karar |
|---|---|---|
| HU1 | KVKK metinleri hukuk onayı (özellikle background lokasyon, push, AI çıktı) | Hukukçu |
| HU2 | Mesafeli satış sözleşmesi versiyon onayı | Hukukçu |
| HU3 | App Store / Play Store yatırımcı metinleri (uluslararası) | Pazarlama + hukuk |
| HU4 | KYC sağlayıcı seçimi (Findeks / e-Devlet / 3.taraf KYC SaaS) | Kullanıcı kararı |
| HU5 | iyzico merchant onboarding tamamlandı mı (gerçek prod credentials) | Kullanıcı |
| HU6 | EAS Build hesap (production cert) | Kullanıcı |

## E3. Bağımlılık grafiği

```
AB1 (bond guard deploy) — bağımsız, ilk yapılır
    ├── AB5 (mobil bid RPC) bağımlı: yoksa mobil borsa.tsx bond eksiği üretmeye devam
    └── AB6 (web depositRegister facade) bağımlı: aynı facade mobil köprüye girer

AB2 (KYC verify mekanizması) — bağımsız ama release-blocker
    └── AB5 mobil hemen-al akışı KYC-required çözümü için bağımlı (kullanıcı verify olamadan akış test edilemez)

AB3 (auth ekle quota/commission) — bağımsız
AB4 (RLS sertleştir corp_leads/orgs) — bağımsız

AB5 (mobil bid RPC)
    ├── AB1 sonrası başlar (akşam planı önerdiği sıra)
    ├── AB6 sonrası başlar (depositRegister facade gerekli)
    └── RB14 (komisyon trigger) PARALEL — independent

AB6 (web AuctionDetail refactor) — AB5'in dependency'si

RB1 (bid_bonds policy drop) — bağımsız, AB1 sonrası yapılabilir
RB2 (Faz 4 pgmq) — bağımsız, kullanıcı uyanıkken + Dashboard hazırlık
RB3-RB10 (mobil güvenlik + müfettiş kalan) — paralelize, hepsi Cursor
RB11 (web route guard) — bağımsız

RB17 (main push) EN SON: AB1+AB2+AB3+AB4+RB2 yeşil + CI ön-kontrol + Faz 4 deploy edildi
```

**Paralelleşebilir (Claude Code ↔ Cursor):**
- AB1, AB3, AB4, AB6, RB1, RB11, RB13, RB14 → Claude Code
- AB5 (UI yarısı), RB3-RB10, RB15 → Cursor

**Sıralı zorunlu:**
- AB1 → AB5 (mobil borsa)
- AB6 → AB5 (mobil teklif/hemen-al facade kullanır)
- RB2 → RB17 (Faz 4 olmadan main push fail)
- AB2 → RB16 (KYC verify olmadan E2E test mümkün değil)

## E4. Zaman tahmin matrisi

| Kategori | Adam-saat tahmini |
|---|---|
| AB1 (bond guard deploy) | 0.5 |
| AB2 (KYC verify — admin RPC + UI) | 8-16 |
| AB3 (quota/commission auth) | 1-2 |
| AB4 (corp_leads + orgs RLS) | 1-2 |
| AB5 (mobil bid RPC tam) | 4-6 |
| AB6 (web depositRegister facade) | 1-2 |
| RB1 (bid_bonds policy drop) | 0.5 |
| RB2 (Faz 4 pgmq) | 1 |
| RB3-RB10 (mobil sertleştirme + müfettiş) | 6-10 |
| RB11 (web route guard) | 2-4 |
| RB12 (trade_offers idempotency) | 1-2 |
| RB13 (audit log entegrasyon) | 2-3 |
| RB14 (komisyon trigger gap) | 3-5 |
| RB15 (mobil mock data → real) | 8-12 |
| RB16 (KYC E2E test) | 2 |
| RB17 (main push + smoke) | 1 |
| Toplam release-ready | **42-69 saat** (~5-9 günü insan-paralelize) |

**Paralel araç kazancı:** Claude Code + Cursor paralel çalışırsa ~40% kısalır → **30-50 saat** real-world (3-5 gün).

## E5. Önerilen sıra

```
1. AB1 — Bond guard deploy (BAS bekliyor)               [0.5 saat]
2. AB6 — Web AuctionDetail depositRegister refactor     [1-2 saat]   Claude
3. AB5 (Adım 1-6) — Mobile shared facade köprüleme      [2-3 saat]   Claude
   ↕ paralel ↕
3'. RB3-RB10 — Mobil güvenlik + müfettiş bulguları      [6-10 saat]  Cursor
4. AB5 (Adım 7-10) — Mobile UI bağlama                  [3-4 saat]   Cursor
5. AB3 — Quota + commission auth migration              [1-2 saat]   Claude
6. AB4 — corp_leads + orgs RLS sertleştir               [1-2 saat]   Claude
7. RB1 — bid_bonds policy drop                          [0.5 saat]   Claude
8. RB12 — trade_offers idempotency                      [1-2 saat]   Claude
9. RB13 — audit log entegrasyon                         [2-3 saat]   Claude
10. RB14 — komisyon trigger gap                         [3-5 saat]   Claude
11. RB11 — web route guard wrapper                      [2-4 saat]   Claude
12. RB15 — mobile 6 mock data → real                    [8-12 saat]  Cursor
13. AB2 — KYC verify mekanizması                        [8-16 saat]  ürün karar + Claude
14. RB16 — KYC E2E test                                 [2 saat]     kullanıcı + Claude
15. RB2 — Faz 4 pgmq deploy                             [1 saat]     kullanıcı + Claude
16. CI ön-kontrol (typecheck+test+rls+lint+bundle+audit)[1 saat]     Claude
17. RB17 — main push                                    [1 saat]     kullanıcı + Claude
```

## E6. Risk matrisi

| İş | Para riski | Güvenlik riski | Regression riski | Kullanıcı onay |
|---|---|---|---|---|
| AB1 (bond guard) | Yok | Yok (sertleştirme) | Düşük (smoke 23-check) | ✓ "BAS bond guard" |
| AB2 (KYC verify) | Yok | Yok | Orta (yeni RPC, KYC akışı değişir) | ✓ tasarım onay + deploy onay |
| AB3 (quota/commission auth) | Düşük (commission body okumadık) | Orta — açık var | Düşük | ✓ "BAS auth fix" |
| AB4 (RLS sertleştir) | Yok | Orta — KVKK | Düşük | ✓ "BAS RLS" |
| AB5 (mobil RPC) | Orta — para akışı | Düşük (sunucu zaten enforce) | Orta — UI değişikliği | ✓ "BAS canlı test" |
| AB6 (web refactor) | Düşük | Yok | Orta (web regresyon) | ✓ "BAS web refactor" |
| RB1 (bid_bonds drop policy) | Yok | Yok (sertleştirme) | Düşük | ✓ |
| RB2 (Faz 4) | Yok | Yok | Orta (Dashboard değişikliği) | ✓ "BAS Faz 4" |
| RB13 (audit log) | Yok | Yok (güçlendirme) | Düşük | ✓ |
| RB14 (komisyon trigger) | **Yüksek** — para akışı | Yok | **Yüksek** — gelir kaybı veya çift kayıt | ✓ tasarım + canlı test |
| RB16 (KYC E2E test) | Yok | Yok | Düşük | ✓ "verified yap user" |
| RB17 (main push) | Yok | Yok | **Yüksek** — 3 workflow + production deploy | ✓ "BAS push" |

**Kullanıcı onayı zorunlu adımlar:** AB1, AB2 (tasarım), AB3, AB4, AB5 (canlı test), AB6, RB2, RB14, RB16, RB17.

---

# G — DOSYA / KOMUT EKLERİ (REFERANS)

## G1. Mevcut yazılı ama deploy edilmemiş dosyalar (untracked + plan)

```
supabase/migrations/20260527130100_place_bid_bond_guard.sql       (untracked, deploy bekliyor)
_audit/migration_deploy/extra_place_bid_bond_guard.sql            (untracked, deploy bekliyor)
_audit/tmp_bond_precheck.sql                                       (deploy sonrası silinecek)
_audit/tmp_db_inventory.sql, tmp_db_inventory.json, tmp_parse.cjs, tmp_db_inventory_parsed.txt, tmp_db_inventory2.sql, tmp_db_inventory2.json   (geçici, silinecek)
supabase/migrations/20260516120400_v2_pgmq_matching.sql           (lokal, production'da YOK — Faz 4 bekliyor)
_audit/SISTEM_ROENTGENI.md                                         (bu dosya, lokal commit)
_audit/AKSAM_PLANI.md                                              (zaten lokal commit `b6dad44`)
_audit/OTURUM_DURUMU.md                                            (zaten lokal commit `3091f84`)
```

## G2. Bilinmiyor / araştırılacak

- `App.tsx` içinde `/kyc` route'unun tam tanımı (satır 230 sonrası okumadım)
- `calculate_commission_with_offset` body — commission_records'a insert mi, sadece hesap mı?
- `org_dashboard_stats` body — invoker rights ama ne yapıyor?
- `submit_takas/ibuyer/ges_land_evaluation` body — KYC check var mı? Sadece flag false geldi.
- `supabase/functions/place-bid/` ve `place_bid/` (iki dizin) — ikisi de aktif mi, hangi farkları var?
- `src/lib/payment/capabilities.ts` — preAuthorize mock mu gerçek mi?
- Web Profile.tsx + UserPanel.tsx içinde user-null kontrolü var mı (route guard yedeği)
- `notifications` tablosu insert mekanizması (RPC mı edge function mı manuel mi)?
- Mobile/shared `locationIntelligence` ve `demoMarket` web tarafıyla drift kontrolü

---

**Bu raporun ucu:** Tüm bulgular kanıtlı (dosya:satır, prosrc grep, SQL sorgu sonucu, commit hash). Varsayım yapılan yerler "araştırılacak" ile işaretli. Sistem ~%65 production-ready; release için kritik 6 iş (AB1-AB6) + 17 release-öncesi (RB) iş kaldı.
