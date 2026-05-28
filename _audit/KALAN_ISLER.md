# Kalan İşler — Sprint 3 sonrası (2026-05-28)

Sprint 3 büyük resim kapandı (4 migration + grants + web env + DNS başlatma). Buradan sonra açık konular:

---

## 🔴 Yüksek aciliyet

### R8 — KYC verify F1.1 release-blocker
**Durum:** 4 production user kyc_status='none', execute_buy_now ve register_bid_deposit KYC guard'lı (`kyc_required` döner). Web/mobile KYC submit akışı şu an mock (sunucu tarafı RPC `kyc_submit` var ama UI mock).

**Karar gerekiyor:**
- (a) **Manuel admin RPC ile test user verified** (hızlı, geçici): bir admin role ile `update profiles set kyc_status='verified' where id=...` — 1 user end-to-end test için yeterli
- (b) **Gerçek iyzico/MASAK KYC entegrasyon** (uzun, kalıcı): kyc_submit edge function + 3rd party API + state machine — ayrı sprint

**Önerim:** (a) önce (end-to-end test için), (b) ayrı R8.5 sprintinde.

**İlgili dosyalar:** `src/pages/KycSimulationPage.tsx`, `supabase/functions/kyc-submit/index.ts`, `supabase/migrations/20260527120000_buy_now_kyc_guard.sql`

---

### R11 — Cloudflare DNS propagation + Vercel domain bağlama
**Durum:** Master Cloudflare'e nameserver geçişi yaptı. Propagation 5 dk - 24 saat. Vercel Dashboard'da `ihaleal.com` + `www.ihaleal.com` domain ekleme bekliyor.

**Teyit (propagation sonrası):**
```bash
nslookup ihaleal.com 1.1.1.1     # Cloudflare DNS
# Beklenen: 76.76.21.21 (Vercel apex IP)

curl -sI https://ihaleal.com/
# Beklenen: 200 OK + Vercel headers + Last-Modified ihaleal.vercel.app ile aynı

# REST API anon ile test (zaten kanıtlı):
curl "https://wsjifesrdaeorrdzbvmk.supabase.co/rest/v1/listings?select=id&limit=1" \
  -H "apikey: <anon>" -H "Authorization: Bearer <anon>"
# Beklenen: 200 + []
```

**DOKUNULMAYACAK:** MX `mx01.ihaleal.com` + SPF `v=spf1 ip4:93.89.226.0/24 ip4:93.89.232.0/24 -all` (e-posta korunmalı)

**İlgili commit:** `3fd5776` audit (DNS teşhis)

---

## 🟡 Orta aciliyet

### R10 — K-M3 mobile mock → gerçek Supabase
**Durum:** Master notu "Cursor ADIM 1 teşhis bitti, plan bekliyor". Cursor mobile/src/app/ihale/viewModel.ts mock veri yapısını gerçek Supabase fetch'e geçirme planı hazırlamış olabilir.

**Bağımlılıklar (sprint 3 sonrası hazır):**
- ✅ anon listings SELECT GRANT canlı (REST API 200 + [])
- ✅ anon auctions SELECT GRANT canlı
- ✅ Web `src/lib/auctionsSource.ts` mock data hâlâ var ama altyapı production'a bağlanabilir
- ⏳ Production data: listings=0, auctions=0 (boş — seed data gerekebilir test için)

**Sonraki adım:** Cursor planını oku, K-M3 mobile viewModel + fetch hook + 6 mock dosya migrate (mobile/src/app/borsa-detay/data.ts, ihaleler/data.ts, mesajlar/data.ts, bildirimler/data.ts, favoriler/data.ts, belgeler/data.ts).

**Tahmini efor:** Orta-büyük, ayrı sprint (mobile UI çalışması)

**İlgili dosyalar (bilgi):** `_audit/CURSOR_RB5_KOMUTU.md`, `mobile/src/app/ihale/viewModel.ts`

---

### Mobile env (EXPO_PUBLIC_*) — K-M3 plan içinde netleşir
**Durum:** Web tarafı VITE_SUPABASE_URL + ANON_KEY çözüldü (R5 sprint sonu). Mobile EAS Build'inde EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY env ayrıca set edilmeli (Cursor RB5-a EAS doğrulama sırasında bakılacak).

**Bağımlı:** R10 K-M3 plan netleşince + R12 EAS projectId set (D-1 RB5).

---

## 🟢 Düşük aciliyet (technical debt)

### R6 — CI bundle budget fail (pre-existing)
**Durum:** Vercel/CI build'inde `index-*.js` chunk **827 KB > 800 KB limit** → `scripts/check-bundle-budget.mjs` exit 1. Lokal'de farklı chunking (en büyük 455 KB) → PASS.

**Kanıt pre-existing:** 6179800 (10 gün öncesi) ve 3fd5776 (bugün) AYNI step + AYNI fail (GitHub Actions API run jobs).

**Çözüm seçenekleri:**
- (a) Vite config manualChunks ekle (vendor-charts/vendor-react/vendor-supabase ayır, index'i küçült)
- (b) `maxEntryBytes` limit 800 → 900 KB artır (`scripts/check-bundle-budget.mjs:5`)
- (c) Build env'inde NODE_ENV=production (şu an `development` set, daha az tree-shake)

**Önerim:** (a) — vite.config.ts'te manualChunks rule (chunk size analiz + split). Lokal'de zaten 455 KB en büyük olmasının sebebi vendor-charts ayrıştırılmış. CI'da farklı chunking ya rollup version farkı ya da bir dependency hoist farkı.

**Etki:** Workflow yeşil olmuyor ama production build çalışıyor. Görsel etki yok.

---

### R7 — Vercel CLI workflow secret fail
**Durum:** deploy-vercel.yml workflow 0 sn fail (her push'ta). Vercel Git Connect integration zaten otomatik deploy yapıyor.

**Çözüm seçenekleri:**
- (a) **Workflow devre dışı bırak** — `.github/workflows/deploy-vercel.yml` sil veya `on: workflow_dispatch` ile manuel-only yap (Git Connect zaten yeterli)
- (b) Vercel secrets doğru set et (VERCEL_TOKEN + VERCEL_ORG_ID + VERCEL_PROJECT_ID) — yine çift deploy riski

**Önerim:** (a) — workflow gereksiz, Git Connect tek mekanizma.

---

### R12 — isimtescil hosting iptal kontrolü
**Durum:** Master notu "gereksiz paket — ama paket yok zaten, kontrol". 

**Yapılacak:** Master isimtescil panelinden hosting paketi var mı kontrol et. Yoksa atla. Varsa iptal (cron, e-posta, statik içerik dahil etkilenmemeli — mx01.ihaleal.com ayrı subdomain).

**Risk:** E-posta MX (mx01) korunmalı, sadece hosting/A record paket'i.

---

### Dashboard yanlış SQL temizlik
**Durum:** Bu sprintte master bir keresinde SQL Editor'e yanlış SQL fragment gelmişti (RB1 rollback + test insert) — GUC fail nedeniyle ÇALIŞMADI. Dashboard SQL Editor query history'de bu kayıt durabilir.

**Yapılacak:** Master Dashboard → SQL Editor → Saved Queries veya History'den eski/yanlış query'leri temizle (özellikle test insert'ler).

**Risk:** Düşük — query history sadece referans, çalışmadı zaten.

---

### RB5-a screen capture EAS build doğrulama (autolinking, commit 2614cda)
**Durum:** Master notu — Cursor mobile branch'inde RB5-a (screen capture) için yeni commit 2614cda. EAS Build autolinking düzgün mü (expo-screen-capture native module link) doğrulama gerekli.

**Yapılacak:**
1. mobile/ workspace'ine geç (cursor worktree)
2. `npx expo prebuild --no-install --platform ios` (autolinking kontrol)
3. `ios/Podfile` veya `android/settings.gradle` expo-screen-capture autolinkli mi
4. `eas build --platform ios --profile preview` (gerçek build dene — opsiyonel, EAS credit gerek)

**Etki:** RB5-a fonksiyonel doğrulama. Build fail ederse expo-screen-capture install/link sorunu.

---

## 📋 Önceki Sprint'lerden devam eden

### AB11 — Komisyon trigger gap (F1.12, ürün kararı bekleyen)
**Durum:** `_audit/AB11_KARAR_TABLOSU.md` K1-K9 ürün kararı bekliyor. execute_buy_now `calculate_commission_with_offset` çağırmıyor — buy_now tamamlandığında komisyon kaydı oluşmuyor.

**Sprint 3'te dokunulmadı.** Ayrı tur.

---

## 🎯 Önerilen sıra (sonraki oturum)

1. **R11 propagation teyit** (5 dk) — DNS yayıldıysa ihaleal.com Vercel'e gidiyor mu
2. **R10 K-M3 plan değerlendirme** (Cursor planı varsa) — mobile production'a bağlama
3. **R8 (a) manuel KYC verified** (15 dk) — end-to-end test için 1 user
4. **R6 CI bundle fix** (1 saat) — workflow yeşil için
5. **R7 workflow devre dışı** (5 dk) — CLI deploy gereksiz, Git Connect yeterli
6. **R12 isimtescil paket kontrol** (5 dk) — gereksiz paket iptali

**Toplam:** ~2 saat — sprint 4 yapılabilir.

---

**Acil durum yok.** Production sağlam + güncel + güvenli. Tüm bekleyen işler iyileştirme/temizlik.
