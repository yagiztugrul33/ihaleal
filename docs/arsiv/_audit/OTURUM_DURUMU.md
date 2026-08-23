# ihaleal — Oturum Durumu (2026-05-27)

**Yazıldığı an:** 2026-05-27 (kullanıcı çıkışı öncesi)
**Amaç:** Dönüldüğünde tam bağlam — bu dosya tek başına okunduğunda oturumun her şeyini özetlesin.

---

## 1. TAMAMLANANLAR (bu oturum)

### A. Production güvenlik açıkları KAPATILDI (3)

1. **KYC guard** — `execute_buy_now` + `register_bid_deposit` RPC'leri server-side `kyc_status != 'verified'` enforcement aldı; istemci-tarafı kontrol atlatma yolu kapandı. Migration `20260527120000_buy_now_kyc_guard.sql`, deploy edildi + smoke 6/6 + production smoke 2/2.
2. **Bids public-read sızıntısı (Faz 1)** — `bids_select_public` policy (roles=public, qual=true) → DROP. Yerine `bids_select_bidder_or_listing_owner` (bidder veya seller görür). Public market depth için maskelenmiş 2 view: `auction_bid_public_summary`, `auction_bid_public_tape` (bidder_mask `a***z`, top-20).
3. **Rate-limit bypass (Faz 1)** — `rate_limit_buckets` tablo RLS=false + 0 policy idi → `relrowsecurity=true` + `rate_limit_buckets_service_only` policy. `rate_limit_check` SECURITY DEFINER + postgres owner sayesinde RLS bypass → RPC'ler etkilenmedi (smoke kanıtlı).

### B. 13 migration deploy edildi (4 faz + 1 ek)

| Faz | Migration | Smoke |
|-----|-----------|-------|
| KYC | `20260527120000_buy_now_kyc_guard` | 2/2 |
| Faz 1 | `harden_rate_limit_buckets_rls` + `harden_bids_visibility_and_public_views` | 10/10 |
| Faz 2 | `v2_core_safety_additive` (tracking) + `v2_multi_tenant` (+ organizations 3-col patch) + `v2_liquidity` + `v2_kyc_moderation_bulk` | 13/13 |
| Push ek | `20260527130000_device_push_tokens` | 11/11 (S2 sadece test literal hatası) |
| Faz 3a | `land_ges_intelligence` + `engineering_war_room` + `ibuyer_trade_in` + `takas_enhancements` | 19/19 |
| Faz 3b | `ges_land_evaluation` + `trade_offers` + `harden_events_moderation_rls_soft_delete` | 25/25 |

**Migration gap: 14 → 1** (sadece Faz 4 pgmq kaldı).

### C. Mobil build fix + olgunlaştırma (Cursor + ortak)

- `mobile/` build engelleyici Expo v56 sorunları çözüldü (Cursor)
- Navigation + AuthGuard (`ca93b20` route-level guard + pre-auth render block)
- Push notification RPC bağlantısı (`4833925` — `register_push_token`/`unregister_push_token` doğru çağrılıyor, user_id payload'a EKLENMİYOR — server-side `auth.uid()`)
- KVKK paritesi (location/push/tapu/ilan/uluslararası — `5fdfc5b` ayrılmış consent gate'leri)
- Auth persistence — `persistSession: true` + `SecureStore` adapter; `eval('require')` kaldırıldı (K3 fix)

### D. 3 mobil güvenlik açığı KAPATILDI (Müfettiş Turu 2'den sonra)

| Bulgu | Cursor commit |
|-------|----------------|
| K-A: AuthGuard route bypass (deep link ile anonim teklif) | `ca93b20` |
| K-B: `bidderId: 'demo-mobile'` hardcoded | `f6622bd` |
| K-C: WebView `originWhitelist={["https://*"]}` | `28cc052` |
| M-6: VITE env fallback (mobil bundle'da Vite kalıntısı) | `07753a3` |

### E. 2 müfettiş turu tamamlandı

- **Tur 1** (gece komutu): 5 KRİTİK + 8 ORTA + 7 DÜŞÜK bulgu — K1/K3/K4 öne çıktı
- **Tur 2** (Cursor olgunlaşma sonrası): K1+K3+K4 çözülmüş; ama K-A/K-B/K-C yeni kritikler bulundu → Cursor bunları **aynı oturumda** düzeltti

---

## 2. PRODUCTION DURUMU

**Proje:** `wsjifesrdaeorrdzbvmk` (ihaleal-mvp)

### Canlı Migration'lar (schema_migrations tracked)

KYC guard + Faz 1 (2) + Faz 2 (4) + push_token (1) + Faz 3a (4) + Faz 3b (3) = **14 yeni satır eklendi**.

**Eksik (gap=1):** `20260516120400_v2_pgmq_matching` — Faz 4 pgmq async altyapı (Dashboard'da pgmq + pg_cron + pg_net extension aktif edilmeli + 2 GUC ayarlanmalı). Acil değil — kullanıcısız özellik.

### Mevcut artifact özeti (high-level)

- ✅ Multi-tenant temeli: organizations, organization_members, listings.organization_id, has_org_role, current_org_id, consume_ai_quota
- ✅ Likidite altyapısı: buyer_preferences, watchlist, listing_matches, notifications, commission_campaigns
- ✅ KYC/moderation/bulk: kyc_verifications, moderation_queue (RLS+soft-delete), bulk_jobs, events (RLS+soft-delete), corporate_leads, org_dashboard_stats RPC
- ✅ Engineering: engineering_analysis_runs (war_room/seismic/geotech/site analiz tipleri + label/lat/lon)
- ✅ iBuyer: property_submissions, property_risk_assessments, instant_offer_requests, trade_in_details (+5 takas kolon), submit_ibuyer_application (M4), submit_takas_application
- ✅ GES: ges_projects, ges_technical_analyses, ges_legal_compliance, submit_ges_land_evaluation, ges_evaluate_hard_kill, ges_calculate_score
- ✅ P2P trade: trade_offers + trade_status/target_type enum + create/respond/cancel RPC
- ✅ Push notification: device_push_tokens + register_push_token + unregister_push_token

### Güvenlik durumu

- 🔒 0 güvenlik açığı (bids public-read kapalı, rate_limit RLS aktif, KYC guard sert)
- 🔒 RLS aktif tablolar: organizations, organization_members, buyer_preferences, watchlist, listing_matches, notifications, commission_campaigns, kyc_verifications, moderation_queue, bulk_jobs, events, corporate_leads, idempotency_keys, rate_limit_buckets, ges_projects, ges_technical_analyses, ges_legal_compliance, property_submissions, property_risk_assessments, instant_offer_requests, trade_in_details, trade_offers, device_push_tokens, bids
- 🔒 SECURITY DEFINER fonksiyonlar: execute_buy_now, register_bid_deposit, rate_limit_check, register_push_token, unregister_push_token, submit_ibuyer_application, submit_takas_application, submit_ges_land_evaluation, create_trade_offer, respond_trade_offer, cancel_trade_offer, set_active_org, consume_ai_quota, write_audit_v2, rl_consume, soft_delete_moderation_queue, soft_delete_events
- 🔒 KYC regression sıfır (5 fazda tek tek smoke'la kanıtlandı)

### Frontend kırılma

**0 kırık ekran** (production senkronize). Mobile push notification client-kod tarafında `register_push_token` RPC bağlantısı yapıldı (Cursor `4833925`).

---

## 3. GIT DURUMU

### Branch konfigürasyonu

| Branch | Local | Origin | Worktree |
|--------|-------|--------|----------|
| `main` | `00f83e9` | `6179800e` (9 commit ahead — **PUSH YASAK**) | `C:\Users\yagiz\Documents\GitHub\ihaleal` |
| `feat/mobile-calculators` | `07753a3` | `07753a3` (senkron) | `C:\Users\yagiz\Documents\GitHub\ihaleal-mobile` (Cursor) |
| `feat/mobile-auction-flow` | `6ce0c7c` | `6ce0c7c` (senkron) | (checked out değil) |
| `feat/core-buynow-kyc-guard` | `bdaa42e` | `bdaa42e` (senkron) | (checked out değil) |

### main'deki 9 commit (push edilmemiş — main push 3 workflow tetikler)

```
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

### Cursor'ın bu oturum commit'leri (feat/mobile-calculators @ 07753a3, origin'de senkron)

```
07753a3 refactor(mobile-auth): remove VITE env fallback         ← M-6 fix
28cc052 fix(mobile-webview): restrict embedded origins          ← K-C fix
f6622bd fix(mobile-borsa): remove hardcoded bidder              ← K-B fix
ca93b20 fix(mobile-auth): harden protected routes               ← K-A fix
9eb8ebe feat(earthquake): nearby monitoring skeleton
5fdfc5b fix(mobile-kvkk): separate consent gates location/push
211233e chore(mobile-ui): feedback states + accessibility
bed875d fix(mobile-auth): route-level guard
80385c9 feat(mobile-nav): connect hidden routes
4833925 fix(mobile-push): wire register/unregister RPC          ← K1+K4 fix
d5a81ca feat(mobile): borsa terminal + new module screens
```

### Working tree

Ana worktree: TEMİZ (`nothing to commit, working tree clean`).
Cursor worktree: kendi alanı.

---

## 4. KALAN İŞLER (öncelik sırasıyla)

### Yüksek

1. **Faz 4 (pgmq async)** — Migration gap'in son 1'i. Kullanıcısız özellik (matching-fanout dispatcher). Dashboard adımı gerek: pgmq + pg_cron + pg_net extension aktif + `app.functions_url` + `app.cron_secret` GUC set. Sonra `_audit/migration_deploy/phase4_async.sql` deploy. Acil değil.
2. **main push hazırlığı** — Workflow tetiklediği için (CI typecheck/test/build + Vercel deploy + Supabase db push --include-all). Yapılmadan önce: (a) CI yeşil mi (typecheck, test, lint, bundle budget); (b) Supabase v2-deploy workflow'unda `db push --include-all` Faz 4 dahil 1 missing'i tetikler — eğer Dashboard hazırsa OK, değilse CI fail eder; (c) main push'tan sonra origin/main lokal main'le senkron olacak — bu noktadan sonra "fresh start" başlar. **Şu an: push YASAK.**
3. **Mobil teklif/hemen-al gerçek RPC bağlantısı (O5/O6)** — `submitBid` ve `executeBuyNow` mobil tarafında hâlâ mock (`setTimeout(250)` simülasyon). `placeBidRpc` ve `register_bid_deposit` çağrılarını mobile'a köprüle. Cursor'ın alanı.

### Orta

4. **Müfettiş Turu 2 kalan bulguları:**
   - M-1: Biyometrik strict variant (yüksek-değer için `disableDeviceFallback: true`)
   - M-3: Ekran-level oturum check + KVKK consent SecureStore persist (yenile/back ile sıfırlanmasın)
   - M-4: Push RPC `data?.status === 'error'` payload kontrolü
   - M-5: Background location KVKK consent modal + runtime `requestBackgroundPermissionsAsync`
   - O8: Push deep link `Linking.openURL('ihaleal://...')` → `expo-router.push`
5. **Güvenlik sertleştirme (OWASP)** — CSP header'ları (web), rate limit ölçeklenebilirlik (Redis benzeri), JWT refresh stratejisi audit, idempotency_keys retention politikası.
6. **KVKK metin hukuk onayı** — Aydınlatma metinleri + açık rıza beyanları hukukçu onayı gerek (özellikle background location, push notification, AI analiz çıktıları).

### Düşük

7. **Müfettiş D-1..D-7** — EAS projectId placeholder, mock PII sentetikleştirme, deprem modülü Object.keys hack, fake-success setTimeout, vs.
8. **Scope-dışı borsa/ekran ürünleştirme** — `mobile/src/app/(tabs)/borsa.tsx` mock data, gerçek market data feed bağlantısı; bedel/teklif submit gerçek RPC; sealed-bid backend henüz yok (Cursor "preview only" işaretlemiş — doğru karar).
9. **Repo temizliği** — `_audit/` altında eski oturum kalıntıları (`canliya/`, `deploy/`, `deploy3/`, `diag/`, `envanter/`, `final/`, ... ~30 klasör). Mevcut faz arşivi (`_audit/migration_deploy/`) ve diagnosis dosyaları kalsın; gerisini ayrı bir turda kullanıcı kararıyla budayalım.

---

## 5. KRİTİK KURALLAR

1. **main'e push YASAK** — 3 workflow tetikler: (a) `supabase-v2-deploy.yml` → `npx supabase db push --include-all` → 1 missing migration (Faz 4 pgmq) için extension hazır değilse fail; (b) `deploy-vercel.yml` → Vercel production deploy; (c) `ci.yml` → typecheck/test/lint/bundle. Tek bir push 3 zinciri tetikler. **Kullanıcı uyanıkken + Dashboard pgmq hazır + CI yeşil olduğu teyit edildikten sonra push edilir.**
2. **Faz 4 Dashboard adımı gerektirir** — Supabase Dashboard → Database → Extensions: `pgmq`, `pg_cron`, `pg_net` aktif edilmeli. Sonra SQL Editor'dan `alter database postgres set app.functions_url = '...'` ve `app.cron_secret = '<secret>'`. Bunlar yapılmadan Faz 4 deploy'unda `create extension if not exists pgmq cascade` fail edebilir.
3. **Çekirdeğe (src/lib) Cursor dokunmaz** — Para mantığı (placeBid/payment/escrow/KYC/RLS/fees/taxConfig/preAuthorize/commission). Mobil köprü: sadece `mobile/shared/*.ts` üzerinden `@/lib/...` re-export. Cursor bu çizgiyi koruyor (Müfettiş 2: "çekirdeğe sızıntı yok").
4. **Canlı/Production işlemde kullanıcı onayı şart** — DB query write, db push, schema_migrations INSERT, repair, Dashboard değişikliği gibi tüm production-write işlemleri için "BAS [komut]" şeklinde explicit onay. Bu kural KYC deploy'undan beri her fazda uygulandı, tek 502 hatası dışında temiz çalıştı.
5. **Cursor worktree'ye dokunma** — `ihaleal-mobile` Cursor'ın iş alanı. Ana worktree (main, Claude Code) çekirdek + Supabase + deploy + migration. İki tarafın commit objeleri shared (lokal git store), ama her biri kendi branch'inde HEAD tutar — bu izolasyon çakışmayı önler.
6. **Salt-okuma teyit her büyük adım öncesi** — Faz 2 organizations 3-col patch bu protokol sayesinde ortaya çıktı. Bu kuralı koru.

---

## 6. ÇALIŞMA YAPISI

### İki Worktree

```
C:\Users\yagiz\Documents\GitHub\ihaleal           ← Ana worktree
  branch:        main (00f83e9, 9 ahead origin)
  agent:         Claude Code
  sorumluluk:    Çekirdek (src/lib), Supabase migrations, deploy planı,
                 production yazma, müfettiş turları, repo yönetimi

C:\Users\yagiz\Documents\GitHub\ihaleal-mobile    ← Linked worktree
  branch:        feat/mobile-calculators (07753a3, origin'le senkron)
  agent:         Cursor
  sorumluluk:    Mobil (mobile/), src/features/earthquake/, navigation,
                 KVKK ekranlar, push integration, mobil testler
```

### İletişim Pattern'i

- Müfettiş raporları (Claude Code yazar) → Cursor'a bulgular iletilir
- Cursor düzeltir, kendi worktree'sinde commit + push
- Ana worktree git remote update ile bilgi alır (gerekirse)
- Çakışma yok — branch'ler ayrı, dosya sistemleri ayrı

### Faz Deploy Pattern'i (kanıtlanmış)

1. Ön-kontrol — production'a SADECE OKU (information_schema, pg_class, pg_policies)
2. Sürpriz varsa → patch ekle (faz dosyasına ALTER ADD COLUMN IF NOT EXISTS)
3. Kullanıcı "BAS Faz N" → atomik `db query --linked --file` (BEGIN/COMMIT, regression DO bloku)
4. Smoke teyit — temp table accumulation pattern, tek SELECT son satırda (KYC + Faz 1 + Faz 2 + öncekiler regression)
5. Bir sorun → reverse SQL (yorumda hazır), dosya başında

---

## Hızlı Bağlam (geri dönüşte ilk okunacak)

- Production gap 14 → 1
- 0 güvenlik açığı production'da
- Cursor mobil işi güvende (origin'de senkron, müfettiş 2'deki 4 kritik bulgu çözülmüş)
- main 9 commit ahead — **PUSH YOK**, edilirse 3 workflow tetiklenir
- Faz 4 pgmq bekliyor (Dashboard hazırlık + onay)
- `_audit/migration_deploy/` faz arşivi (README + 5 sql + push token sql) commit'li
- `_audit/OTURUM_DURUMU.md` (bu dosya) tam bağlam
