# ihaleal — Tam Özellik Envanteri (2026-05-30)

**HEAD:** `3c094b1` (R13 plan) · **Prod bundle (son ölçüm):** `index-BIoS6Azi.js`  
**Kaynak:** `src/App.tsx` rotalar, `src/pages/modules/index.ts`, Supabase Edge envanter, `_audit/*` cross-ref  
**Amaç:** Master “tüm özellikleri istiyorum” — canlı / kısmi / açık madde tek resim

**Özet sayılar**

| Metrik | Değer |
|--------|------:|
| **Canlı özellik (route + engine)** | **~78** |
| **Kısmi / mock özellik** | **~14** |
| **Açık madde (planlı / blok)** | **~18** |
| **Fresh `tsc` hata** | **27** (hedef 0 → v0.12.8 öncesi) |

---

## A) CANLI ÖZELLİKLER (~78)

### 1. İhale & İlan Sistemi (Sprint 3 + core)

| Özellik | Rota / kod | Durum |
|---------|------------|--------|
| İlan listesi (açık artırma kataloğu) | `/auctions`, `/ihaleler` | ✅ Canlı |
| İlan detay + galeri + sekmeler | `/ilan/:id`, `/ihale/:id` | ✅ Canlı |
| İlan oluşturma (satıcı) | `/ihale-ac` | ✅ Canlı |
| AI analiz raporu (mock/DB) + zorunlu onay | `AuctionDetail` → `PropertyAnalysisReportViewer` | ✅ Canlı |
| Teklif verme + %5 teminat (blokaj) | `registerBidDeposit`, Edge `place-bid` | ✅ Canlı (KYC gate) |
| Hemen Al akışı | `/ihale/:id/hemen-al`, `execute_buy_now` RPC | ✅ Canlı (demo/taslak) |
| Anti-sniping (son 2 dk uzatma) | `src/lib/fees.ts` | ✅ Canlı |
| Komisyon modeli (%2+2, KDV) | `src/lib/fees.ts`, `calcCommissionBreakdown` | ✅ Canlı |
| Komisyon hesaplayıcı UI | `/komisyon-hesaplayici` | ✅ Canlı |
| Favoriler | `/favoriler` | ✅ Canlı |
| Karşılaştırma | `/karsilastir` | ✅ Canlı |
| Canlı ihaleler ticker | `/ihaleler` | ✅ Canlı |
| Eşleştirme fan-out (şehir+fiyat) | Edge `matching-fanout` + cron | ✅ Deployed |
| AI fiyat tahmini | Edge `ai-price-estimate` | ✅ Deployed (auth) |
| Toplu ilan ingest | Edge `bulk-listing-ingest` | ✅ Deployed (admin) |

### 2. Kimlik, Uyumluluk & Hesap

| Özellik | Rota / kod | Durum |
|---------|------------|--------|
| Giriş / kayıt | `/giris`, `/kayit` | ✅ Canlı |
| Profil | `/profil` | ✅ Canlı |
| KYC simülasyon + submit | `/kyc`, Edge `kyc-submit` | ✅ Canlı (prod user verify bekliyor) |
| Kullanıcı paneli | `/panel`, `/panel/:tabId` | ✅ Canlı |
| Ayarlar (pushBid pref) | `/ayarlar` | ✅ Canlı |
| Mesajlar | `/mesajlar` | 🟡 UI canlı; Edge `post_chat_message` 404 |
| Belgeler | `/belgeler` | ✅ Canlı |
| Admin dashboard | `/admin` | ✅ Canlı (guard) |
| e-Devlet mock onboarding | `/auth/edevis-mock`, `/onboarding/akis` | ✅ Demo |

### 3. Risk Modülleri — Deprem (R12.3 + R12.14 Faz A-1)

| Özellik | Rota | Durum |
|---------|------|--------|
| Deprem risk haritası | `/modul/deprem-risk-haritasi` | ✅ Canlı |
| Bina risk sorgusu | `/modul/bina-risk-sorgu` | ✅ Canlı |
| Canlı deprem takibi | `/modul/canli-deprem-takip` | 🟡 UI canlı; `earthquakes_latest` Edge 404 → fallback |
| Güçlendirme rehberi | `/modul/guclendirme-rehberi` | ✅ Canlı |
| **AfetDisasterHub** (birleşik deprem panel) | `AfetRiskHaritasiPage` içinde | ✅ Canlı |
| Deprem skor motoru | `earthquakeEngine.ts`, `earthquakeRiskEngine.ts` | ✅ Canlı |
| AI deprem anlatımı | `earthquakeNarrative.ts` | ✅ Canlı |

### 4. Harita Modülleri (R12.14 Faz A-2)

| Özellik | Rota | Durum |
|---------|------|--------|
| Afet risk haritası (GIS katman) | `/modul/afet-risk-haritasi` | ✅ Canlı |
| Parsel zekası (LocationIntelligence) | `/modul/parsel-zekasi` | ✅ Canlı (demo profil verisi) |
| Kentsel dönüşüm bölgeleri | `/modul/kentsel-donusum` | ✅ Canlı |
| Afet toplanma alanları | `/modul/afet-toplanma-alanlari` | ✅ Canlı |
| Genel harita sayfası | `/harita` | ✅ Canlı |

### 5. Eğitim Modülleri (R12.14 Faz A-3)

| Özellik | Rota / kod | Durum |
|---------|------------|--------|
| Deprem eğitimi hub | `/modul/deprem-egitimi` | ✅ Canlı |
| 10 ders + LessonView | `/modul/deprem-egitimi/ders-1` … `ders-10` | ✅ Canlı |
| Procedural içerik | `buildParagraphs.ts`, `lessons.ts` | ✅ Canlı |
| Quiz soruları | `lessonTypes.ts` | ✅ Canlı |

### 6. İkincil Modüller (R12.14 Faz A-4) — 16 sayfa

| # | Modül | Rota |
|---|--------|------|
| 1 | Aile acil planı | `/modul/aile-acil-plan` |
| 2 | Airbnb potansiyel | `/modul/airbnb-potansiyel` |
| 3 | Deprem çantası | `/modul/deprem-cantasi` |
| 4 | Deprem eğitimi (hub) | `/modul/deprem-egitimi` |
| 5 | Deprem sigortası | `/modul/deprem-sigortasi` |
| 6 | İmar sorgu | `/modul/imar-sorgu` |
| 7 | Komşuluk risk analizi (deprem) | `/modul/komsuluk-risk-analizi` |
| 8 | Kredi pazaryeri | `/modul/kredi-pazaryeri` |
| 9 | Portföy yönetimi | `/modul/portfoy-yonetimi` |
| 10 | Renovasyon ROI | `/modul/renovasyon-roi` |
| 11 | Sigorta pazaryeri | `/modul/sigorta-pazaryeri` |
| 12 | Tatbikat rehberi | `/modul/tatbikat-rehberi` |
| 13 | Uzman randevu | `/modul/uzman-randevu` |
| 14 | Yapay zeka hasar tahmini | `/modul/yapay-zeka-hasar-tahmini` |
| 15 | Yatırım önerisi | `/modul/yatirim-onerisi` |
| 16 | Yıkılan binalar arşivi | `/modul/yikilan-binalar-arsivi` |

**Durum:** ✅ Tümü route + UI canlı (çoğu demo/hesap motoru ile)

### 7. Değerleme + GES (R12.14 Faz A-5)

| Özellik | Rota | Durum |
|---------|------|--------|
| Gelişmiş değerleme workbench | `/modul/degerleme` | 🟡 UI canlı; `advancedValuation.ts` commit `0683451` ile eklendi — TS hâlâ kırık parçalar |
| GES analizi modülü | `/modul/ges-analizi` | 🟡 UI canlı; `pvgis_solar` Edge 404 |
| GES arazi değerlendirme | `/ges-analiz-arazi` | ✅ Canlı |
| GES intelligence engine | `gesIntelligenceEngine.ts` | ✅ Canlı + test |
| Klasik değerleme aracı | `/degerleme`, `/valuation` | ✅ Canlı |

### 8. Hesaplayıcılar (R12.7)

| Engine | Kullanım yeri | Rota / modül |
|--------|---------------|--------------|
| Mortgage | `/mortgage` sayfası | ✅ `/mortgage` |
| Airbnb potansiyel | `airbnbEngine.ts` | ✅ `/modul/airbnb-potansiyel` |
| Yatırım getirisi | `investmentReturnsEngine.ts` | ✅ `/modul/yatirim-onerisi` |
| Emlak vergisi | `propertyTaxEngine.ts` | ✅ Engine + test (ayrı sayfa yok; vergi simülatörü ile ilişkili) |
| Renovasyon ROI | `renovationRoiEngine.ts` | ✅ `/modul/renovasyon-roi` |
| Komisyon + çekilme cezası | `CommissionCalculator` | ✅ `/komisyon-hesaplayici` |

### 9. Borsa (R12.1)

| Özellik | Rota | Durum |
|---------|------|--------|
| Borsa terminali | `/borsa` | ✅ Canlı |
| Varlık listesi | `/borsa/varliklar` | ✅ Canlı |
| İzleme listesi | `/borsa/izleme` | ✅ Canlı |
| Veri analizi | `/borsa/analiz` | ✅ Canlı |
| Portföy | `/borsa/portfoy` | ✅ Canlı |
| Varlık detay + teklif | `/borsa/varlik/:id` | ✅ Canlı |
| Borsa layout shell | `BorsaLayout.tsx` | ✅ Canlı |

### 10. PDF Export (N2)

| Özellik | Kod | Durum |
|---------|-----|--------|
| AI rapor PDF indir | `PropertyAnalysisReportViewer` → lazy `jspdf` + `html2canvas` | ✅ Canlı (`488fc69`) |
| Mock banner + disclaimer | `AI_REPORT_DISCLAIMER_TR` | ✅ Canlı |

### 11. Premium Homepage & Marka (R12.5 + hotfix)

| Özellik | Kod | Durum |
|---------|-----|--------|
| PremiumCinematicHome | `/` | ✅ Canlı |
| Logo SVG vektör | `logo.svg`, `2fa878a` | ✅ Canlı |
| Footer + Site Haritası (ana sayfa) | `Layout.tsx`, `62e23aa` | ✅ Canlı |
| i18n investor block | `messages.ts`, `771d2a6` | ✅ Canlı |
| Gradient CTA fix | `global-dark.css`, `a385675` | ✅ Canlı |

### 12. AI Engine (R12.10)

| Özellik | Kod | Durum |
|---------|-----|--------|
| Assistant reply motoru | `src/lib/ai/assistantEngine.ts` | ✅ Canlı |
| Bilgi tabanı | `src/lib/ai/knowledgeBase.ts` | ✅ Canlı |
| Deprem anlatımı | `src/lib/ai/earthquakeNarrative.ts` | ✅ Canlı |
| ChatWidget (guide + QA modu) | `ChatWidget.tsx` | 🟡 QA → Edge `ai_qa` **404** |
| AI mock rapor üretici | `src/lib/aiAnalysis.ts` | ✅ Canlı |
| Edge shared knowledge | `_shared/ihalealKnowledge.ts` | ✅ Kod hazır |

### 13. Araştırma & Intelligence Hub

| Özellik | Rota | Durum |
|---------|------|--------|
| Intelligence hub | `/arastirma` | ✅ Canlı |
| GES analiz terminali | `/arastirma/ges` | ✅ Canlı |
| Parsel istihbarat | `/arastirma/parsel` | 🟡 TS hataları (ParcelIntelligencePage) |
| Yatırım terminali | `/arastirma/yatirim` | ✅ Canlı |
| War Room | `/arastirma/war-room` | ✅ Canlı |
| Analitik dashboard | `/analiz` | ✅ Canlı |

### 14. Hizmetler & Portallar (R12.2)

| Özellik | Rota | Durum |
|---------|------|--------|
| Emlakçı landing + panel | `/emlakci`, `/emlakci/panel` | ✅ Canlı |
| Müteahhit landing + panel | `/muteahhit`, `/muteahhit/panel` | ✅ Canlı |
| Sadakat / ödüller | `/oduller` | ✅ Canlı |
| Kampanyalar | `/kampanyalar` | ✅ Canlı |
| Uluslararası yatırımcı | `/uluslararasi` | ✅ Canlı |
| Kurumsal / hizmetler | `/services`, `/kurumsal` | ✅ Canlı |
| Emlakçı ortaklık | `/emlakci-ortaklik` | ✅ Canlı |

### 15. Ticari & Yatırım Akışları

| Özellik | Rota | Durum |
|---------|------|--------|
| Anında teklif (iBuyer) | `/aninda-teklif` | ✅ Canlı |
| Kat karşılığı hub + studio | `/kat-karsiligi`, `/kat-karsiligi/istudio` | ✅ Canlı |
| Satıcı hub | `/sat-basla` | ✅ Canlı |
| Ekspertiz talep | `/ekspertiz` | ✅ Canlı |
| Yıllık üyelik | `/uyelik/yillik` | ✅ Canlı |
| Hizmet bedelleri | `/hizmet-bedelleri` | ✅ Canlı |

### 16. İçerik, Hukuk & SEO

| Özellik | Rota | Durum |
|---------|------|--------|
| Blog | `/blog`, `/blog/:slug` | ✅ Canlı |
| SSS | `/sss` | ✅ Canlı |
| KVKK, gizlilik, çerez, mesafeli satış | `/kvkk`, `/gizlilik`, … | ✅ Canlı |
| Anayasa 400 / platform çerçevesi | `/anayasa-400` | ✅ Canlı |
| Yasal çerçeve, operasyonel hazırlık | `/yasal-cerceve`, `/canliya-hazirlik` | ✅ Canlı |
| Şehir rehberleri | `/sehirler`, `/sehir/:cityName` | ✅ Canlı |
| Vergi simülatörü | `/araclar/vergi-simulator` | 🟡 TCMB Edge 404 → fallback |

### 17. Mobile (kısmen — ayrı repo)

| Özellik | Repo | Durum |
|---------|------|--------|
| 43 ekran route | `ihaleal-mobile` worktree | ✅ Shell canlı |
| İhaleler Supabase | K-M3 | ✅ Migrate edildi |
| Mesajlar / bildirimler / favoriler / belgeler | K-M6 hedef | 🟡 **MOCK** |
| Geofence / push | — | 🔴 Yok |

---

## B) AÇIK MADDELER (~18)

### R13 Pantsir Sprint (plan: [`R13_PANTSIR_PLAN.md`](./R13_PANTSIR_PLAN.md))

| Madde | Durum | Paket |
|--------|--------|-------|
| Konum bazlı bildirim (geofence) | 🔴 **YOK** | R13.1 |
| Yakın POI haritası (gerçek API) | 🟡 Statik `nearbyFacilities` | R13.2 |
| Suç + eğitim + sosyo-ekonomik (gerçek) | 🟡 Mock + AI rapor sekmesi | R13.3 |
| Pantsir tek panel UI | 🔴 **YOK** | R13.4 |
| Mobile geofence | 🔴 **YOK** | R13.5 |

### Platform & Entegrasyon

| Madde | Durum | Kaynak |
|--------|--------|--------|
| **K-M6 Mobile** (4 auth-bound ekran) | 🟡 PLANLI | [`K_M6_KAPSAM.md`](./K_M6_KAPSAM.md) |
| **Edge function deploy** (404) | 🔴 7 fonksiyon | [`EDGE_FUNCTIONS_DEPLOY_STATUS.md`](./EDGE_FUNCTIONS_DEPLOY_STATUS.md) |
| → `ai_qa` | 🔴 404 | ChatWidget QA |
| → `post_chat_message` | 🔴 404 | `/mesajlar` |
| → `tcmb_yiufe` | 🔴 404 | Vergi simülatörü |
| → `pvgis_solar` | 🔴 404 | GES modül |
| → `earthquakes_latest` | 🔴 404 | Canlı deprem |
| → `payments-iyzico`, `payments-paytr` | 🔴 Beklenen | PSP kararı yok |
| **Multilang tam sürüm (R12.13)** | 🟠 Açık madde | 272 satır diff; skip edildi |
| **ChatWidget hibrit UX** | 🟠 Master karar | [`AI_CHATWIDGET_REWIRE.md`](./AI_CHATWIDGET_REWIRE.md) |
| **KYC prod verify** | 🔴 Release-blocker | [`KYC_VERIFY_TASLAK.md`](./KYC_VERIFY_TASLAK.md) |
| **%5 kapora UI prominent** | 🟠 Ürün kararı | N5 |
| **v0.12.8 tag** | ⏳ TS 0 hata sonrası | — |
| **Banka + Avukat + Şirket** | 🟠 Master resmi karar | Ürün |
| **Gerçek PSP / escrow banka** | 🔴 Yok | [`SISTEM_RISK_ANALIZI`](./SISTEM_ROENTGENI.md) |
| **e-Devlet / Findeks prod** | 🔴 Mock | SellerHub açıklaması |
| **Komisyon DB trigger (AB11)** | 🟠 Ürün kararı | — |
| **DNS + hosting plan** | 🟡 Master | KALAN_ISLER |

---

## C) TEKNİK BORÇ

### TS Sprint 2 (fresh `tsc -p tsconfig.app.json --noEmit`)

**Durum (2026-05-30):** **27 hata** (önceki sprint: 33 → 13 hedefi; regresyon / yeni dosyalar)

| Dosya / alan | Hata | Paket |
|--------------|------|-------|
| `ParcelIntelligencePage.tsx` | 9 | Tip senkron (`ParcelFeasibilityResult` vs `Report`, field rename) |
| `KomsulukRiskAnaliziPage.tsx` + `types/property` | 4 | `NeighborhoodData` vs `string` çakışması |
| `locationIntelligenceEngine.ts` | 1 | `Required<LocationIntelligenceInput>` eksik alan |
| `AuthContext.tsx` | 1 | `SignUpExtra` return union |
| `AfetDisasterHub.tsx` | 1 | `EarthquakeSubScoreKey` cast |
| `calendar.tsx` | 1 | `table` classNames |
| `fireSafety.ts` | 1 | boolean vs string/number |
| `CurrencyContext.tsx` | 1 | `number \| undefined` |
| `PremiumCinematicHome.tsx` | 1 | SetState literal |
| `RecentlyViewed.tsx` | 1 | implicit `any` |
| `HomeTarget.tsx` | 1 | `LucideIcon` import |
| `DocumentUploader.tsx` | 1 | Lucide `title` prop |
| `WarRoomPage.tsx` | 1 | `GesAnalysisInput` |
| `demo-data/generate.ts` | 1 | NeighborhoodData type |
| `types/property/base.ts` | 1 | `LocationFields` extend çakışması |

**Hedef:** 0 hata → **`v0.12.8`** tag

### Bundle

| Ortam | Durum | Not |
|-------|--------|-----|
| **Lokal + R6 fix** | ✅ PASS | `vendor-charts` ~456 KB < 819 KB (`99f8f39` main'de) |
| **Prod (deploy sonrası)** | 🟡 İyileşti | `index-BIoS6Azi.js` (önceki monolit ~930 KB) |
| **check-bundle-budget** | ✅ Lokal yeşil | [`BUNDLE_FINAL.md`](./BUNDLE_FINAL.md) |

### Hotfix geçmişi (2026-05-29 sabah krizi)

| Commit | İçerik |
|--------|--------|
| `c66e875` | i18n `home.investor` fallback (500 crash) |
| `bdc8554` | Gradient buton CSS + logo PNG |
| `62e23aa` | Footer ana sayfa + Site Haritası |
| `a385675` | Navbar mobil Button asChild |
| `2fa878a` | Logo SVG final |

### Diğer borç

- Faz A-5 değerleme: lib eklendi (`0683451`) — runtime smoke önerilir
- `gh auth` yok — PR workflow yerine cherry-pick kullanıldı (`99f8f39`, `d564a04`)
- Prod Supabase `profiles` anon 401 — RLS normal
- Incremental tsc cache yanıltıcı olabilir — release öncesi `tsbuildinfo` sil

---

## D) Önceki Sprint'ler Özet

| Sprint / ID | İçerik | Commit / durum |
|-------------|--------|----------------|
| **Sprint 3** | İhale core, RLS, listings/auctions, deposit RPC | ✅ Canlı |
| **R12.1** | Borsa modülü (6 ekran) | `b9489b0` ✅ |
| **R12.2** | Hizmetler dropdown + 7 portal | `ef9b18d` ✅ |
| **R12.3** | Deprem band + ticker + workbench | `53ca005` ✅ |
| **R12.5** | PremiumCinematicHome + logo | `cd72036` ✅ |
| **R12.6** | SSS + HizmetBedelleri + CommissionCalculator | `341ce94` ✅ |
| **R12.7** | 5 calculator engine + vitest | `f8c1451` ✅ |
| **R12.10** | AI assistantEngine + knowledgeBase | `71b4af6` ✅ |
| **R12.13** | Multilang i18n | ⏸️ Skip |
| **R12.14 Faz A-1** | AfetDisasterHub + earthquake lib | `aaea5f8` ✅ |
| **R12.14 Faz A-2** | 4 harita modülü | `c944f05` ✅ |
| **R12.14 Faz A-3** | 10 ders + LessonView | `2d84776` ✅ |
| **R12.14 Faz A-4** | 16 ikincil modül | `75bcfc0` ✅ |
| **R12.14 Faz A-5** | Değerleme + GES | `edb0ef2` / `0683451` 🟡 |
| **N2** | PDF export | `488fc69` ✅ |
| **R6** | CI bundle budget | `99f8f39` ✅ main |
| **Console cleanup** | 15→6 console | `d564a04` ✅ main |
| **TS sağlık** | Paket 1–7 devam | `cb2c393` 🔄 |
| **R13 plan** | PANTSIR 5 paket | `3c094b1` 📋 plan only |

---

## E) Master Sonraki Sprint Önerileri

| Sıra | İş | Süre | Blok |
|------|-----|------|------|
| 1 | **TS Sprint 2 bitir** → fresh tsc 0 | ~2–4s | v0.12.8 |
| 2 | ~~R6 + Console PR~~ | ✅ | Cherry-pick main'de |
| 3 | **KYC verify** (1 prod user SQL) | 15 dk | Teklif gate |
| 4 | **Edge selektif deploy** (`ai_qa`, deprem, pvgis) | 30 dk | Console 404 gürültüsü |
| 5 | **R13 Pantsir** — önce R13.4 UI mock (1 gün) | ~1 hafta | [`R13_PANTSIR_PLAN.md`](./R13_PANTSIR_PLAN.md) |
| 6 | **K-M6 Mobile** (4 ekran Supabase) | 11–16s | Ayrı repo |
| 7 | **R12.13 Multilang** | Ayrı sprint | Breaking |
| 8 | **Banka + Avukat + Şirket** | Master resmi | Ürün |

---

## F) Master Karar Matrisi (hızlı)

| Soru | Cevap (envanter) |
|------|------------------|
| “Tüm özellikler hazır mı?” | **Hayır** — ~78 canlı, ~14 kısmi/mock, ~18 açık |
| “Kullanıcı ilan yanında suç/eğitim görür mü?” | **Hayır** — R13.4 + R13.3 gerek |
| “Deprem / harita modülleri?” | **Evet** — R12 tamam |
| “Borsa?” | **Evet** — UI canlı |
| “Mobile tam mı?” | **Hayır** — K-M6 mock |
| “Prod güvenli mi?” | **Site açılıyor** — TS + KYC + Edge borç var |
| “Ne önce?” | TS 0 → v0.12.8 → R13.4 görsel → POI API |

---

## İlgili audit dosyaları

- [`KALAN_ISLER.md`](./KALAN_ISLER.md)
- [`MASTER_TESLIMAT_2026_05_30.md`](./MASTER_TESLIMAT_2026_05_30.md)
- [`R13_PANTSIR_PLAN.md`](./R13_PANTSIR_PLAN.md)
- [`EDGE_FUNCTIONS_DEPLOY_STATUS.md`](./EDGE_FUNCTIONS_DEPLOY_STATUS.md)
- [`K_M6_KAPSAM.md`](./K_M6_KAPSAM.md)
- [`BUNDLE_FINAL.md`](./BUNDLE_FINAL.md)

---

## EK — R14 Müteahhit Lansman Sprint (2026-05-30 gece)

| Özellik | Rota / kod | Durum |
|---|---|---|
| Müteahhit kayıt (organizations contractor + ruhsat_pending) | `/kayit?profil=muteahhit` | ✅ Canlı |
| Onay-bekleniyor sayfası | `/muteahhit/onay-bekleniyor` | ✅ Canlı |
| Müteahhit paneli (gerçek Supabase) | `/muteahhit/panel` | ✅ Canlı |
| Yeni proje wizard (4 adım) | `/muteahhit/yeni-proje` | ✅ Canlı |
| Proje detay + birim envanteri + publish | `/muteahhit/proje/:projectId` | ✅ Canlı (owner) |
| Public proje görünüm (verified) | `/proje/:projectId` | ✅ Canlı (anon) |
| Lansman ilanı badge + proje linki | `/ilan/:id` üzerine | ✅ Canlı |
| useDeveloperProjects + useDeveloperProject hooks | `src/hooks/` | ✅ |
| `bulkInsertUnits` + `publishUnitAsListing` helpers | `src/hooks/useDeveloperProjects.ts` | ✅ |
| developer_projects + project_units + listings ext + RLS | `supabase/migrations/20260530140000_*` | ✅ Migrated |

**Sayılar güncel:** ~78 canlı + **~85 canlı (R14 sonrası, 7 yeni rota/özellik eklemesi)**.

---

*Envanter: Cursor salt-okuma · R14 eklemesi: Claude · Onay: Master · Sonraki güncelleme: v0.12.8 veya R14 follow-up*
