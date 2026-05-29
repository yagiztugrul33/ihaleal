# Kalan İşler — R12 sprint sonrası (2026-05-29)

> **R12 SPRINT KAPANDI** — 2026-05-29. 8 commit (R12.1-R12.6 + mobile fix + a11y), 115 dosya, +17,999/-119 satır,
> 13/13 endpoint canlı 200. Release tag: `v0.12.6`. Production sağlam, güncel, güvenli.

---

## ✅ R12 SPRINT — ÇÖZÜLDÜ

| ID | İçerik | Commit |
|---|---|---|
| R12.1 | Borsa modülü (BorsaPage + lib/borsa + 5 alt sayfa) | [b9489b0](https://github.com/yagiztugrul33/ihaleal/commit/b9489b0) |
| R12.2 | Hizmetler mega dropdown + 7 portal sayfa + types/property 28 + demo-data + earthquakeEngine | [ef9b18d](https://github.com/yagiztugrul33/ihaleal/commit/ef9b18d) |
| R12.3 | Deprem modülü (band + ticker + workbench + badge + 2 modül + Leaflet harita) | [53ca005](https://github.com/yagiztugrul33/ihaleal/commit/53ca005) |
| MEGA-R12.X | a11y + type safety + ESLint düzeltmeleri | [a9c0027](https://github.com/yagiztugrul33/ihaleal/commit/a9c0027) |
| Mobile CSS | iPhone Safari responsive — ticker + band stilleri eksikti, yamandı | [b3fd506](https://github.com/yagiztugrul33/ihaleal/commit/b3fd506) |
| Mobile Nav | Hamburger görünmüyordu (Tailwind `hidden lg:hidden` bug) + accordion drawer + Borsa CTA | [415a90c](https://github.com/yagiztugrul33/ihaleal/commit/415a90c) |
| R12.5 | Homepage swap PremiumCinematicHome + premium CSS + Logo + ticker konum + 2 modül route | [cd72036](https://github.com/yagiztugrul33/ihaleal/commit/cd72036) |
| R12.6 | SSS 500 fix + HizmetBedelleri 11+ kalem + PageShell + CommissionCalculator responsive + fees.ts WITHDRAWAL_PENALTY_RATE | [341ce94](https://github.com/yagiztugrul33/ihaleal/commit/341ce94) |

**Kalite durumu (2026-05-29 HEAD = 341ce94):**

| Metrik | Değer |
|---|---|
| TS hata | 0 |
| ESLint hata | 0 |
| ESLint warning | 1 (Compare.tsx:46 pre-existing) |
| TS/TSX dosya | 491 |
| Toplam TS satır | 59,087 |
| CSS satır | 4,922 |
| public/ asset | 42 |
| TODO/FIXME | 24 (çoğu placeholder string) |
| `: any` | 0 |
| `@ts-ignore` | 0 |
| `console.*` | 15 (logging utils) |
| `dangerouslySetInnerHTML` | 1 |
| Test dosya | 35 (vitest + playwright) |
| Bundle index.js | 287 KB |
| Bundle vendor-charts | 446 KB (largest) |
| Bundle budget | OK (limit 800 KB) |
| JS chunk sayısı | 159 |

---

## 🔴 Yüksek aciliyet (devam)

### R8 — KYC verify F1.1 release-blocker
**Durum:** 4 production user kyc_status='none', execute_buy_now ve register_bid_deposit KYC guard'lı (`kyc_required` döner). Web/mobile KYC submit akışı şu an mock (sunucu tarafı RPC `kyc_submit` var ama UI mock).

**Karar gerekiyor:**
- (a) **Manuel admin RPC ile test user verified** (hızlı, geçici): bir admin role ile `update profiles set kyc_status='verified' where id=...` — 1 user end-to-end test için yeterli
- (b) **Gerçek iyzico/MASAK KYC entegrasyon** (uzun, kalıcı): kyc_submit edge function + 3rd party API + state machine — ayrı sprint

**Önerim:** (a) önce (end-to-end test için), (b) ayrı R8.5 sprintinde.

**İlgili dosyalar:** `src/pages/KycSimulationPage.tsx`, `supabase/functions/kyc-submit/index.ts`, `supabase/migrations/20260527120000_buy_now_kyc_guard.sql`

---

## 🟡 Orta aciliyet

### R10 — K-M3 mobile mock → gerçek Supabase
**Durum:** Cursor mobile/src/app/ihale/viewModel.ts mock veri yapısını gerçek Supabase fetch'e geçirme planı bekliyor.

**Bağımlılıklar (sprint 3 sonrası hazır):**
- ✅ anon listings SELECT GRANT canlı (REST API 200 + [])
- ✅ anon auctions SELECT GRANT canlı
- ✅ Web `src/lib/auctionsSource.ts` mock data hâlâ var ama altyapı production'a bağlanabilir
- ⏳ Production data: listings=0, auctions=0 (boş — seed data gerekebilir test için)

**Sonraki adım:** K-M3 mobile viewModel + fetch hook + 6 mock dosya migrate (mobile/src/app/borsa-detay/data.ts, ihaleler/data.ts, mesajlar/data.ts, bildirimler/data.ts, favoriler/data.ts, belgeler/data.ts).

**Tahmini efor:** Orta-büyük, ayrı sprint (mobile UI çalışması)

---

### Mobile env (EXPO_PUBLIC_*) — K-M3 plan içinde netleşir
**Durum:** Web tarafı VITE_SUPABASE_URL + ANON_KEY çözüldü. Mobile EAS Build'inde EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY env ayrıca set edilmeli.

**Bağımlı:** R10 K-M3 plan netleşince + EAS projectId set.

---

### R12.4 — Multilang i18n paketi (skip edildi, açık)
**Durum:** MEGA-R12.X FAZ 3 değerlendirmesinde **skip edildi**. Backup `src/i18n/messages.ts` 272 satır diff;
`stats` array shape kırıcı (`{label,vs}` → `{label,value,delta,vs}`); 4 locale eş zamanlı update gerekirdi.

**Gerekçe (skip):** "SKIP if complexity/surprise" kuralı uyarınca. Backup'tan başka tüketici component bağımlılığı belirsiz.

**Yapılacak:** Cursor envanter (DEV-FIZIBILITE 2.0) sonrası, R12.4 paketinin tam scope'u + tüketici komponentleri netleşince ayrı tur.

---

## 🟢 Düşük aciliyet (technical debt)

### R6 — CI bundle budget fail (pre-existing)
**Durum:** Vercel/CI build'inde `index-*.js` chunk **827 KB > 800 KB limit** → `scripts/check-bundle-budget.mjs` exit 1. Lokal'de farklı chunking (en büyük 455 KB) → PASS. R12 sprint sonrası lokal'de aynı durum: index 287 KB, vendor-charts 446 KB. CI farklı chunking üretiyor.

**Çözüm seçenekleri:**
- (a) Vite config manualChunks ekle (vendor-charts/vendor-react/vendor-supabase zaten ayrı; index'i daha agresif split)
- (b) `maxEntryBytes` limit 800 → 900 KB artır (`scripts/check-bundle-budget.mjs:5`)
- (c) Build env'inde NODE_ENV=production (şu an `development` set, daha az tree-shake)

**Önerim:** (a) — vite.config.ts'te manualChunks rule. CI'da farklı chunking ya rollup version farkı ya da bir dependency hoist farkı.

**Etki:** Workflow yeşil olmuyor ama production build çalışıyor. Görsel etki yok.

---

### R7 — Vercel CLI workflow secret fail
**Durum:** deploy-vercel.yml workflow 0 sn fail (her push'ta). Vercel Git Connect integration zaten otomatik deploy yapıyor.

**Çözüm seçenekleri:**
- (a) **Workflow devre dışı bırak** — `.github/workflows/deploy-vercel.yml` sil veya `on: workflow_dispatch` ile manuel-only yap (Git Connect zaten yeterli)
- (b) Vercel secrets doğru set et (VERCEL_TOKEN + VERCEL_ORG_ID + VERCEL_PROJECT_ID) — yine çift deploy riski

**Önerim:** (a) — workflow gereksiz, Git Connect tek mekanizma.

---

### R12 isimtescil — hosting iptal kontrolü
**Durum:** Master notu "gereksiz paket — ama paket yok zaten, kontrol".

**Yapılacak:** Master isimtescil panelinden hosting paketi var mı kontrol et. Yoksa atla. Varsa iptal (cron, e-posta, statik içerik dahil etkilenmemeli — mx01.ihaleal.com ayrı subdomain).

**Risk:** E-posta MX (mx01) korunmalı, sadece hosting/A record paket'i.

---

### Dashboard yanlış SQL temizlik
**Durum:** Sprint 3'te master bir keresinde SQL Editor'e yanlış SQL fragment gelmişti — GUC fail nedeniyle ÇALIŞMADI. Dashboard SQL Editor query history'de bu kayıt durabilir.

**Yapılacak:** Master Dashboard → SQL Editor → Saved Queries veya History'den eski/yanlış query'leri temizle.

**Risk:** Düşük — query history sadece referans, çalışmadı zaten.

---

### RB5-a screen capture EAS build doğrulama
**Durum:** Master notu — Cursor mobile branch'inde RB5-a (screen capture) için yeni commit 2614cda. EAS Build autolinking düzgün mü (expo-screen-capture native module link) doğrulama gerekli.

**Yapılacak:**
1. mobile/ workspace'ine geç (cursor worktree)
2. `npx expo prebuild --no-install --platform ios` (autolinking kontrol)
3. `ios/Podfile` veya `android/settings.gradle` expo-screen-capture autolinkli mi
4. `eas build --platform ios --profile preview` (gerçek build dene — opsiyonel, EAS credit gerek)

---

## 🆕 R12 sprint sonrası ortaya çıkan açık maddeler

### N1 — Logo asset güncelleme (content)
**Durum:** Cursor MEGA-AUDIT'ten — `public/ihaleal_com_logo.png` cherry-pick'lendi ama Logo bileşeni `ihaleal-logo.png` kullanıyor.
İki asset paralel duruyor (118 KB + 312 KB). Master yeni Logo dizaynına geçmek istiyorsa Logo.tsx içinde `src` değişikliği gerekli.

**Yapılacak:** Master karar verir — eski `ihaleal-logo.png` mi yeni `ihaleal_com_logo.png` mi kalsın. Karara göre `src/components/Logo.tsx` src güncelle.

**Risk:** Yok — content kararı, kod değişikliği 1 satır.

---

### N2 — PDF export (PropertyAnalysisReportViewer)
**Durum:** Property analiz raporu (PropertyAnalysisReportViewer) ekranda gösteriliyor ama PDF export yok. R12.6 + R12.5 sonrası master content stratejisinde PDF export potansiyel istek.

**Yapılacak:** jspdf veya html2pdf entegrasyonu (lazy import + button "PDF olarak indir").

**Risk:** Bundle +50 KB (lazy), Türkçe karakter encoding test gerekli.

---

### N3 — PremiumCinematicHome code-split
**Durum:** R12.5 sonrası `src/sections/PremiumCinematicHome.tsx` 584 satır monolitik, `index.js` 214→293 KB (+79 KB). Home.tsx'in sync import'u olduğu için ilk yüklemede full bundle'da.

**Yapılacak:** `Home.tsx`'te `PremiumCinematicHome` lazy import + Suspense fallback. Veya iç section'ları (hero / borsa-how / featured / trust) ayrı bileşene çıkar + lazy.

**Etki:** İlk yükleme küçülür ama Home render geç başlar (network round-trip).

**Risk:** Loading state UX testi gerekli.

---

### N4 — İki ticker UX duplicate (/modul/canli-deprem-takip)
**Durum:** R12.5'te `CanliDepremTakipPage` zaten kendi inline sticky ticker'ına (`deprem-ticker-track--marquee`) sahipti.
LiveEarthquakeTicker da en üste mount edildi (anasayfadan kaldırıldığında yetim kalmasın diye).
Sayfada iki ticker farklı format'ta görünüyor — UX duplicate riski var.

**Yapılacak:** Birini kaldır. Önerim: inline sticky ticker (header'da kalır) + LiveEarthquakeTicker (premium chip-style marquee, ayrı görsel kimlik) → ikisi farklı role hizmet ediyorsa korunabilir; aynı şeyi gösteriyorsa LiveEarthquakeTicker kaldırılır.

**Risk:** Düşük — kosmetik.

---

### N5 — %5 kapora kuralı UI (master ürün karar)
**Durum:** Sprint 3 + R12 sprint sürecinde %5 BID_BOND_RATE (kapora) backend'de var, UI'da prominent gösterilmiyor.
R12.6'da WITHDRAWAL_PENALTY_RATE = 0.05 eklendi (CommissionCalculator için cayma cezası).

**Yapılacak:** Master ürün stratejisi karar — BuyNow / AuctionDetail sayfasında "%5 kapora alınır, kazanmazsanız iade" + cayma durumunda "%5 kesinti" UI prominent gösterimi.

**Risk:** Yasal metin doğruluğu — `_audit/AB11_KARAR_TABLOSU.md` referans.

---

## 📋 Önceki Sprint'lerden devam eden

### AB11 — Komisyon trigger gap (F1.12, ürün kararı bekleyen)
**Durum:** `_audit/AB11_KARAR_TABLOSU.md` K1-K9 ürün kararı bekliyor. execute_buy_now `calculate_commission_with_offset` çağırmıyor — buy_now tamamlandığında komisyon kaydı oluşmuyor.

**Sprint 3'te ve R12 sprintinde dokunulmadı.** Ayrı tur.

---

## 🎯 Önerilen sıra (sonraki oturum)

1. **R8 (a) manuel KYC verified** (15 dk) — end-to-end test için 1 user
2. **R7 workflow devre dışı** (5 dk) — CLI deploy gereksiz, Git Connect yeterli
3. **R6 CI bundle fix** (1 saat) — workflow yeşil için
4. **N1 Logo asset karar** (5 dk) — Master content tercih
5. **R12 isimtescil paket kontrol** (5 dk) — gereksiz paket iptali
6. **Cursor DEV-FIZIBILITE 2.0 sonuçlarına göre R12.4 + N2-N5 paketleri sıralanır**

**Toplam:** ~1.5 saat — temizlik turu.

---

**Acil durum yok.** Production sağlam + güncel + güvenli. R12 sprint kapanış başarılı. Tüm bekleyen işler iyileştirme/temizlik/yeni paket.
