# ihaleal — Oturum Durumu (2026-05-28, sabah)

**Yazıldığı an:** 2026-05-28 ~06:00 (kullanıcı uyuyacak)
**Önceki snapshot:** `_audit/OTURUM_DURUMU.md` (2026-05-27 gece) — bu dosya 2. tur özet.
**Amaç:** Sabah uyandığında tek dosyada tüm bağlam — bu oturumda yapılanlar + son durum + sıradaki adım.

---

## 🟢 BU OTURUMDA TAMAMLANANLAR (kronolojik)

### A. Güvenlik bundle deploy (4 sunucu-tarafı fix)

**Production migration `20260527130100_security_bundle_5fix` deploy edildi** (27/27 check PASS, atomik rollback ile fail-safe).

| Fix | Açık (önce) | Çözüm | Kanıt |
|---|---|---|---|
| F1.2 | `place_bid` deposit guard YOK | `bid_deposits.status='authorized' + context='bid'` EXISTS check | prosrc 'DEPOSIT GUARD' + 'deposit_required' |
| F1.9 | `calculate_commission_with_offset` PUBLIC EXECUTE + auth bypass | auth check + admin/party kontrol + REVOKE PUBLIC | prosrc 'auth_required' + 'forbidden' |
| F1.10 | `submit_ges_land_evaluation` `auth.uid()` null check yok + anon GRANT | `if v_user_id is null then raise exception` + REVOKE anon | prosrc 'authentication required' |
| F1.11 | `consume_ai_quota` `has_org_role` check yok + PUBLIC EXECUTE | `has_org_role` enforce + REVOKE PUBLIC (DEFAULT korundu) | prosrc 'has_org_role' + 'forbidden' |

**Migration süreci:**
- İlk deploy denemesi `consume_ai_quota` DEFAULT signature uyumsuzluğu nedeniyle ATOMIK ROLLBACK (database değişmedi)
- İmza düzeltildi (`p_org uuid DEFAULT NULL::uuid, p_count integer DEFAULT 1`)
- Re-deploy başarılı: `deployed_at: 2026-05-27 20:31:36.755582+00`
- schema_migrations: 31 → 32 satır

**Sonuç:** Sistem röntgenli 5 yeni F1 bulgusunun 4'ü kapandı. Production durumu (`listings=0, auctions=0`) nedeniyle pratik kullanıcı etkisi YOK ama yapısal sertleşme var.

### B. AB10 — /kyc route web'de mount edildi

- `src/App.tsx:147` `<Route path="/kyc" element={<KycSimulation />} />` eklendi
- KycSimulationPage zaten mevcuttu, sadece Route bağlantısı eksikti (F1.8)
- AuctionDetail.tsx + BuyNow.tsx `navigate("/kyc")` artık 404 yerine sayfaya gider
- Commit `3ab94a8`

### C. Mobile facade altyapısı (Adım 1-2) — büyük tur

**Mimari karar (kayıtta):** Web `src/lib/*` facade'ları `@/lib/supabase` browser-tabanlı client kullanır, mobile'da fail eder. **Tipler `.types.ts` modüllerine ayrıldı**, mobile facade'lar runtime'ı mobile authClient (SecureStore) ile yeniden implemente eder.

| Adım | Commit | Dosya |
|---|---|---|
| Web depositRegister facade + AuctionDetail raw RPC temizliği | `1d51c5d` (main) | `src/lib/depositRegister.ts` + `AuctionDetail.tsx:269,319` refactor |
| Web tipleri ayırma | `934ef87` (main) | 3 yeni `.types.ts` (depositRegister/buyNow/placeBid) + runtime dosyalar revize |
| main → mobile merge | `37aa3cb` (mobile) | feat/mobile-calculators 15 commit ahead → up-to-date |
| Pre-req helper | `b29421f` (mobile) | `mobile/shared/_rpcClient.ts` + tsconfig path maps |
| depositRegister mobile facade | `7527e38` (mobile) | `mobile/shared/depositRegister.ts` (175 satır) |
| buyNow mobile facade | `e68d335` (mobile) | `mobile/shared/buyNow.ts` (184 satır) |
| bidActions revize — D-7 KAPANDI | `67bf79b` (mobile) | `mobile/shared/bidActions.ts` setTimeout → real place_bid RPC |
| Barrel update | `deb6b18` (mobile) | `mobile/shared/index.ts` re-export |

**D-7 fix kanıtı:** `setTimeout(250)` fake-success kaldırıldı, gerçek `place_bid` RPC çağrılıyor (bond guard sunucuda sertleşmiş).

### D. Cursor Adım 4 — Mobile UI bağlama (commit `1589337`)

Cursor 4 ekranı facade'lere bağladı:
- `teklif.tsx` → `registerBidDeposit(context:'bid')` + `submitBid`
- `hemen-al.tsx` → `registerBidDeposit(context:'buy_now')` + `executeBuyNow`
- `kapali-teklif.tsx` → preview-only banner (D-6 önlem)
- `borsa.tsx` (tabs) → handleSubmit code-based switch + handleKycRedirect

`+357 satır / -36 satır` 4 dosya.

### E. Yedekleme (bu turda — kullanıcı uyumadan önce son iş)

**`feat/mobile-calculators` origin'e push edildi** (`07753a3..1589337`). Bu oturumun TÜM mobil işi (8 commit) **bulutta güvende**:
- Pre-req: `b29421f`
- 3 mobile facade: `7527e38`, `e68d335`, `67bf79b`
- Merge: `37aa3cb`
- Barrel: `deb6b18`
- UI bağlama: `1589337`

Workflow tetikleme YOK (ci/supabase-v2-deploy/vercel hepsi sadece `main`).

Diğer feature branch'ler (auction-flow, kyc-guard) **senkron** — push gerekmedi.

**main 21 commit ahead, push EDİLMEDİ** (3 workflow tetikler, kullanıcı uyanıkken yapılacak).

---

## 🟡 ÖNCEKİ MÜFETTİŞ TURU (yapıldı ama henüz değerlendirilmedi)

Adım 4 sonrası Cursor'ın işini bağımsız denetledim (salt-okuma, commit yok). Bulgular kullanıcının değerlendirmesini bekliyor. **Detaylı rapor önceki konuşmada, özet aşağıda:**

### 🔴 KRİTİK (release-blocker)

**K-M1 — Mobile listing_id ALINMIYOR (viewModel eksik)**
- `mobile/src/app/ihale/viewModel.ts:3-11` `AuctionDetailViewModel` tipinde `listingId` alanı YOK
- `MOCK_AUCTIONS` mock veri kaynağı — production listings/auctions ile köprü yok
- **Production kanıt:** `auctions.listing_id` FK → `listings.id` (AYRI uuid'ler). `register_bid_deposit` RPC sunucuda `listings.id = p_listing_id` check ediyor
- **Etki:** Mobile UI production'da çalıştırılırsa `register_bid_deposit` her seferinde "İlan bulunamadı" döner
- **Pratik şu an:** listings=0, auctions=0 → kullanıcı etkisi yok; ama gerçek auction olduğunda fail eder

**K-M2 — teklif.tsx vs hemen-al.tsx TERS MAPPING (semantic bug)**
- teklif.tsx: URL `id` → değişken `auctionId`; `registerBidDeposit({listingId: auction.id, auctionId})`
- hemen-al.tsx: URL `id` → değişken `listingId`; `registerBidDeposit({listingId, auctionId: auction.id})`
- İki ekran semantic ters; URL parametresi mantıken auction id, hemen-al.tsx yanlış adlandırma
- **Sonuç:** İki ekran da aynı UUID'yi listingId olarak gönderiyor (mock varsayımı) → K-M1 ile birleşik bug

**K-M3 — Mobile mock veri kaynağı → real RPC köprüsü EKSİK (RB15)**
- Cursor Adım 4 kapsam dışı (bilinen RB15)
- Mobile UI mock veri ID'leriyle çalışıyor → production'da `isAuctionUuid` check'i bile fail edebilir
- Ayrı tur işi

### 🟠 ORTA

**O-M1 — `dispatchTransactionNotifications` mobile hemen-al'da YOK**
- Web case "ok"'ta var (AuctionDetail.tsx:916), mobile'da kayıp
- UX paritesi bozuldu; küçük side-effect eksik

**O-M2 — teklif.tsx switch case'de 3 case EKSİK**
- `listing_not_found` / `config_missing` / `rpc_error` → default'a düşer
- Generic Alert "Reddedildi" gösterir, spesifik UX kayıp

### 🟢 DOĞRU OLANLAR (10 kontrol)

KYC redirect URL/helper, AuthGuard PROTECTED_ROUTES, idempotency-key facade default, `@/lib/supabase` import yok, mobile/shared path, borsa.tsx code-based switch, kapali-teklif preview banner, hemen-al.tsx 7-case switch tam, build smoke (Cursor commit raporuna göre).

---

## 🔵 PRODUCTION DURUMU

### Schema migrations (32 satır)
- En son: `20260527130100 security_bundle_5fix` ✓ deploy edildi
- Migration gap: 1 (Faz 4 pgmq — Dashboard hazırlık bekliyor)

### Güvenlik durumu
- KYC guard ✓ (execute_buy_now + register_bid_deposit)
- Faz 1 ✓ (bids visibility + rate_limit RLS + 2 public view)
- Faz 2/3 ✓ (organizations + buyer_preferences + kyc_verifications + property_submissions + ges_projects + trade_offers + device_push_tokens + engineering_runs + moderation_queue + corporate_leads + listing_matches + watchlist)
- Push token ✓ (device_push_tokens + register/unregister)
- **5-fix security bundle ✓** (place_bid deposit guard + calc_commission auth + submit_ges null + consume_ai_quota org)
- **0 bilinen sunucu-tarafı güvenlik açığı** (F1.1 KYC akışı uçtan uca kırık — release-blocker, ayrı tur AB2; F1.4 corporate_leads/organizations anon — ayrı tur AB4; F1.5 bid_bonds policy — ayrı tur RB1)

### Production trafiği
- profiles: 4 (hepsi kyc=none)
- listings: 0, auctions: 0, bid_deposits: 0, commission_records: 0
- **Effective zero-traffic** — yapısal hazır, içerik yok

---

## 🔴 KALAN İŞLER — Sıra (öncelik)

### 1. Adım 5 — Müfettiş Turu DEĞERLENDIRMESİ + Adım 6 düzeltme

**Müfettiş raporu yukarıda (K-M1, K-M2, K-M3, O-M1, O-M2).** Kullanıcı uyandığında:

a) Bulguları gözden geçir
b) Karar: K-M1 (viewModel listingId) + K-M2 (semantic rename) + O-M1 (notifications) + O-M2 (3 case) Cursor'a düzeltme komutu hazırla
c) K-M3 (mock → real veri köprüsü) ayrı tur (RB15) — büyük iş, sonraki sprint

**⚠️ KRİTİK: `listingId===auctionId` varsayımı KESİN BUG — production kanıtlı.** Mobile UI canlı testten ÖNCE K-M1/K-M2 düzeltilmeli.

### 2. Adım 6 — Cursor düzeltme komutu

K-M1 + K-M2 + O-M1 + O-M2 için yeni komut metni hazırlanır (önceki Adım 4 komut paterni). Tahmini boyut ~50 satır değişim.

### 3. Adım 7 — Canlı test (test user verify)

- Production'da 4 user var, hepsi `kyc=none`
- KYC verify mekanizması YOK (F1.1 release-blocker)
- Manuel admin RPC ile bir user `kyc_status='verified'` yapılabilir (geçici)
- Mobile UI end-to-end test (teklif + hemen-al)

### 4. Faz 4 (pgmq) deploy

- Dashboard: pgmq + pg_cron + pg_net extension enable + GUC config
- `supabase/migrations/20260516120400_v2_pgmq_matching.sql` deploy
- Migration gap 1 → 0

### 5. main push (üretim güvenli yapma)

- main 21 commit ahead origin
- 3 workflow tetikler: ci.yml (typecheck+test+rls+playwright), supabase-v2-deploy.yml (db push --include-all), deploy-vercel.yml (Vercel production)
- Faz 4 deploy edildikten sonra güvenli
- CI ön-kontrol gerek (lokal typecheck + test + lint + bundle + rls)
- **Kullanıcı uyanıkken + onayla**

### 6. AB11 — Komisyon trigger gap (B-Faz-1)

- F1.12: `execute_buy_now` `calculate_commission_with_offset` çağırmıyor
- `_audit/AB11_KARAR_TABLOSU.md` mevcut, K1-K9 kullanıcı karar bekliyor
- Adım 1 sonrası ayrı tur

### 7. Güvenlik sertleştirme + mobile olgunlaştırma

- F1.4 corporate_leads + organizations RLS sertleştirme
- F1.5 bid_bonds policy DROP (orphan)
- M-1 biometric strict, M-3 KVKK consent SecureStore persist, M-5 background lokasyon KVKK modal, O8 push deep link
- D-1 EAS projectId, PrivacyInfo.xcprivacy, screen capture block

### 8. RB15 — Mobile mock data → real Supabase tablosu

- 6 mock data dosyası (favoriler/bildirimler/mesajlar/belgeler/ihaleler/borsa-detay)
- viewModel.ts + Supabase fetch hook + production tabloya bağlama
- Büyük iş, ayrı sprint

---

## ⚠️ KRİTİK KURALLAR (değişmedi)

1. **main'e push YASAK** — 3 workflow tetikler (ci + supabase-v2-deploy + vercel). Faz 4 deploy edildikten sonra + CI yeşil + kullanıcı onayı.
2. **Faz 4 Dashboard adımı** — pgmq + pg_cron + pg_net extension + 2 GUC. Kullanıcı yapacak.
3. **Çekirdeğe (src/lib) Cursor dokunmaz** — para mantığı (placeBid/payment/escrow/KYC/RLS). Mobile için ayrı facade'lar var (mimari karar 2026-05-28).
4. **Canlı/Production işlemde kullanıcı onayı şart** — DB write, deploy, schema_migrations INSERT, Dashboard değişikliği için "BAS [komut]" explicit onay.
5. **Cursor worktree'ye dokunma** — `ihaleal-mobile` Cursor'ın iş alanı. Bu turda K-M1/K-M2 düzeltmeleri Cursor'ın yapacak.
6. **Salt-okuma teyit her büyük adım öncesi** — sürpriz çıkmasın diye.

---

## 📂 ÇALIŞMA YAPISI

### İki Worktree

```
C:\Users\yagiz\Documents\GitHub\ihaleal               ← Ana worktree
  branch:        main (fc74a62, 21 ahead origin)
  agent:         Claude Code
  sorumluluk:    Çekirdek (src/lib), Supabase migrations, deploy, production
                 yazma, müfettiş turları, repo yönetimi

C:\Users\yagiz\Documents\GitHub\ihaleal-mobile        ← Cursor worktree
  branch:        feat/mobile-calculators (1589337, origin senkron ✓ PUSH EDİLDİ)
  agent:         Cursor
  sorumluluk:    Mobile UI (mobile/src/app/**), navigation, KVKK ekranlar,
                 push integration, mobil testler
```

### Branch durumu (2026-05-28)

| Branch | Local | Origin | Push |
|---|---|---|---|
| `main` | `fc74a62` | `6179800` | **21 ahead — PUSH YASAK** |
| `feat/mobile-calculators` | `1589337` | `1589337` | ✓ SENKRON (bu turda push edildi) |
| `feat/mobile-auction-flow` | `6ce0c7c` | `6ce0c7c` | ✓ senkron |
| `feat/core-buynow-kyc-guard` | `bdaa42e` | `bdaa42e` | ✓ senkron |

### main'deki 21 commit (push edilmemiş, hatırlatma)

```
fc74a62 docs(audit): Cursor Adım 4 komut metni — mobile UI bağlama
934ef87 refactor(lib): extract types to .types.ts files for mobile-safe re-export
de13167 docs(audit): AKSAM_PLANI Adım 2 revize plan — mobile facade şablonu + 3 parça sırası
ad4cd70 docs(audit): AKSAM_PLANI architectural decision — mobile facades to be mobile-specific
1d51c5d feat(client): depositRegister.ts facade + AuctionDetail raw RPC cleanup
70e99ec docs(audit): AB11 commission trigger gap — decision table
3ab94a8 fix(routes): mount /kyc route for KycSimulation page
18d5991 feat(security): 5-fix security bundle — place_bid deposit guard + commission auth + ges null check + ai_quota org guard
45b8df0 docs(audit): system x-ray deepening — 5 new critical findings (G3)
bdefbb6 docs(audit): system x-ray — full DB + web + mobile inventory
b6dad44 docs(audit): evening session plan
3091f84 docs(audit): session status snapshot
00f83e9 chore: gitignore claude state + screenshots, remove stale plan
65faadf chore(audit): archive phase 1-4 deploy SQL files + README
1474019 feat(db): add device_push_tokens migration
34315c8 chore(migrations): land 5 unmerged migrations
bdaa42e refactor(client): BuyNow.tsx + AuctionDetail.tsx use buyNow helper
605449e feat(security): src/lib/buyNow.ts - thin facade for execute_buy_now RPC
3788a88 feat(security): server-side KYC guard on buy_now + bid_deposit RPCs
12a1abd fix(ui): final homepage visual parity and production QA polish
105fdd8 feat(ui): recreate premium cinematic PropTech homepage reference
```

---

## 🎯 KULLANICI UYANDIĞINDA SIRADAKİ ADIM

**Adım 5 müfettiş raporunu değerlendir** (yukarıda K-M1/K-M2/K-M3/O-M1/O-M2 bulguları).

Karar verdikten sonra:
- "BAS Cursor düzeltme komutu hazırla" → K-M1/K-M2/O-M1/O-M2 için yeni komut metni
- veya farklı öncelik (Faz 4 / main push / AB11 / vs.) seç

**Bağlam dosyaları (oku):**
1. `_audit/OTURUM_DURUMU_2.md` (bu dosya — sabah özet)
2. `_audit/OTURUM_DURUMU.md` (önceki gece özet — tarihsel kayıt)
3. `_audit/AKSAM_PLANI.md` (Adım 1-2 plan + mimari karar + Adım 2 revize)
4. `_audit/SISTEM_ROENTGENI.md` (DB + web + mobil envanteri)
5. `_audit/AB11_KARAR_TABLOSU.md` (komisyon trigger gap — K1-K9 karar bekliyor)
6. `_audit/CURSOR_ADIM4_KOMUTU.md` (Cursor'a verilmiş komut)

**Müfettiş raporu detayı** önceki konuşmada — kullanıcı uyandığında scroll-up ile okuyabilir veya bu dosyada özet halinde mevcut.
