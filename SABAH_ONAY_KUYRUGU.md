# SABAH ONAY KUYRUGU — gece renk donusumu (2026-08-05)

## Ö2 sadeleştirme sonrası eklenenler (2026-08-05 sabah)

1. **Kök `typecheck` scripti no-op** — `tsconfig.json` solution-style ("files": []) olduğundan
   `tsc --noEmit` hiçbir dosyayı denetlemiyor. Gerçek denetim (`tsc -p tsconfig.app.json`) 30 mevcut
   hata veriyor (BorsaTerminali, ChatWidget, lib/reports/*, hooks/*). Script `"typecheck": "tsc --noEmit -p tsconfig.app.json"`
   yapılırsa CI kırılır → önce 30 hata kapatılmalı. Operatör kararı bekliyor.
2. **staging push edildi** (`git push -u origin staging` başarılı, 26 commit). Vercel preview durumu
   DENETIM-KAYDI.md'de.

## Operator onayi bekleyenler

1. **staging push operatör onayı bekliyor** (bundle: `yedekler/ihaleal-staging-gece.bundle`)
   - 16 yeni "renk:" commit'i (origin/main'in 17 commit ilerisinde, `git log --oneline origin/main..staging`).
   - Bundle dogrulandi: `git bundle verify` → "complete history".
   - Push icin: `git push origin staging` (operatör).
2. **iOS/Android build tetiklenmedi — imzalama sırları yok.** Mobil (Capacitor) taraf icin
   keystore / provisioning profili bu makinede bulunmuyor; sadece web build + typecheck kosuldu.

## Gece yapilanlar (ozet)

- Ikincil sayfalar tema tokenlarina gecti (sayfa basina commit): Mortgage, Mesajlar, Profil,
  Bildirimler, InvestorDashboard, UserPanel-dashboard, Favoriler, Aramalarim, Belgelerim,
  Raporlar, AramaSonuclari, Auth (Login/Register/EDevlet), BuyNow.
  Ayarlar ve Admin (AdminDashboard) zaten 0/0 idi — degisiklik gerekmedi.
- `--gradient-scrim` tokeni tokens.css'e eklendi (gorsel scrim'lerin merkezi karsiligi).
- E-posta sablonlari (src/emails/*.html + supabase/functions/report-notifier) lux paletine
  hex-eslemesiyle esitlendi (#0a0f1e→#0B1120, #64748b→#94A3B8, #06B6D4→#38BDF8,
  CTA gradyani → gradient-cta literal duraklari). gen-assets.mjs splash bg → #0B1120.
  gen-luxury-theme.mjs DOKUNULMADI (token tanimlarinin kaynak ureticisi).
- Final gradyan supurmesi: 239 → 160 (51 dosyada tekrarlanan mavi/cyan CTA, scrim ve
  %5 panel tintleri tokene gecti).
- Dogrulama: `npm run typecheck` 0 hata, `npm run build` OK, `precheck:encoding` OK (713 dosya).

## Kalan is kuyrugu (dokunulmadi — karar/onay gerekli)

- **Kalan 160 gradyan** (gorsel-kritik / token karsiligi yok):
  - `src/styles/premium-cinematic-home.css` (27) + cinematic bilesenler (CinematicPropertyGallery,
    AIInsightLayer, WaveBackground, HomeTarget, PlatformModulesShowcase) — ana sayfa sinematik
    tasarim dili, gorsel-kritik.
  - Emerald/amber "durum" CTA'lari (basari/premium anlami tasiyor; yesil/amber gradyan tokeni yok —
    token eklemek tasarim karari): NasilCalisir, CreateAuction, SellerHub, PricingPage vb.
  - `src/index.css` (4) ve `src/borsa/borsa.css` (3) — tanim/fallback katmani.
  - AuctionDetail.tsx (6), ChatWidget.tsx (7), About/AdCampaign/Analytics vb. dekoratif tintler.
- **Hardcoded renk (A) uzun kuyrugu** (ikincil liste disinda kaldi): Analytics.tsx (A=53),
  GesAnalysisPage (23), Compare (19), MapPage (16), CityGuide (15), AuctionDetail (15),
  KomsulukRiskCharts (14), BorsaDataAnalysisPage (13), ParcelIntelligencePage (11),
  DepremRiskHaritasiMapInner (11) ve afet/borsa/modul sayfalari — cogu harita/chart
  kutuphanesi renkleri; sayfa sayfa ele alinmali.
- NotificationsPage/Reports/panel tintlerinde %5-10 renk tonu duzlestirildi (bg-slate-900/xx);
  tasarim gozden gecirebilir.
