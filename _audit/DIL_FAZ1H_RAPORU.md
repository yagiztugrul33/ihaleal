# 🌐 ADIM 20 — Çok Dil FAZ 1-H: DataAnalysis RU/AR + Recharts Tamamlama

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dil-faz1h`
**Doktrin:** DAR + derin. SADECE BorsaDataAnalysisPage. ADIM 9 etiket düzeltmesi + ADIM 14 borsa terimleri TUTARLI. `borsa_index` motoru + recharts veri mantığı DOKUNULMADI. Endeks puanı/₺ tutar ayrımı (ADIM 9) 4 dilde korunur.

---

## ⚡ TEK-CÜMLELİK ÖZET

`BorsaDataAnalysisPage` (285 satır) — ADIM 9'da "endeks → Ortalama Fiyat" etiket düzeltildi (TR), ADIM 14'te kısmen — şimdi **20 görünür arayüz öğesi (eyebrow + H1 + subtitle + banner + 2 grafik H2 + 5 Line/Area name + 2 caption + 1 H3 + heatmap H3 + Download + 3 segment metrik + Ort. fiyat alt etiket + dipnot)** 4 dilde tam çevrildi; **`borsa_index` motoru + `useLiveMarket` + `createMarketSnapshot` + recharts veri/eksen mantığı SIFIR değişiklik**; **Currency mantığı (₺ ana + ≈$ FxRef) korundu**; **Endeks puanı/₺ ortalama fiyat AYRIMI 4 dilde korundu** (ADIM 9 disipline edildi); `DataAnalysisMessages` 27 alanlı tip; **4 dil × 6 string = 24/24 PASS, 0 console hata, AR dir=rtl**.

---

## 1) BLOK 1 — Envanter

### ✅ Çevrilen — 20 görünür öğe

| Konum | Çevrildi |
|---|---|
| Header | eyebrow "Veri / Analiz Terminali" + H1 "Piyasa Genel Görünüm + Ortalama Fiyat Paneli" + subtitle |
| Banner | "Burada ₺ ortalama fiyatları... Gerçek İhaleal Endeksi puanı için Borsa ana sayfası" (KRİTİK dürüstlük) |
| Grafik 1 | H2 "Ortalama Fiyat Geçmişi (₺)" + 3 Line name (Bölge/Segment/Platform ort. fiyat) + caption "Seçili bölge" |
| Grafik 2 | H2 "Varlık vs Platform Ortalaması (₺)" + 2 Area name + caption "Karşılaştırma seçimi" |
| Segment trend | H3 + 3 metrik etiket (Hacim/Derinlik puanı/Pazar payı) + birim "lot" |
| Isı haritası | H3 "Bölge Isı Haritası" + Download buton + cell "Ort. fiyat" + Hacim |
| Dipnot | Demo rapor uyarısı (bağımsız danışman gereği) |

### ❌ Çevrilmedi — Veri/Coğrafi (DOKUNULMADI)

| Öğe | Sebep |
|---|---|
| Bölge isimleri (İstanbul/Ege/Akdeniz/Ankara/Bodrum) via `regionLabel()` | Coğrafi gerçeklik (yerel adlar) |
| Varlık kodları (`row.code` örn. KDK-001) | Veri |
| Sayısal değerler (`row.price`, `cell.idx`, `volume`...) | Hesap motoru |
| `selectedSegment.toLocaleUpperCase("tr-TR")` (Konut/Arsa/Ticari/Turizm chip) | Dropdown value sabit kalır (segment key) — sözlüğe key var ama burada Turkish locale upper kullanılıyor (mevcut davranış korundu) |
| Recharts X/Y axis veri/değer (`tickFormatter`, `formatter`) | Veri hesabı |

### ❌ Çevrilmedi — Dropdown segment label (`<option>` text "Konut"/"Arsa"/...)
- Form dropdown'da TR sabit kaldı (dropdown value SegmentKey union type — kod sabit, label da TR korundu)
- messages.ts'e segment çevirileri eklendi (`segmentResidential`/`Land`/`Commercial`/`Tourism`) — ileride kullanılabilir
- Bu adımda dropdown'a uygulanmadı (DAR kapsam — sonraki ufak dilim)

---

## 2) BLOK 2 — Sözlük Genişletme

### ADIM 14'ten ortak (AYNI çeviri)
- "Ortalama fiyat" / "Avg. price" / "Средняя цена" / "متوسط السعر" (ADIM 14 borsa namespace ile tutarlı)
- "Hacim" / "Volume" / "Объём" / "الحجم" (ADIM 14)

### Bu adımda eklenen 25+ yeni terim

| Türkçe | İngilizce | Rusça | Arapça |
|---|---|---|---|
| Veri / Analiz Terminali | Data / Analysis Terminal | Терминал данных / анализа | محطة البيانات / التحليل |
| Ortalama Fiyat Paneli | Average Price Panel | Панель средних цен | لوحة متوسط الأسعار |
| Bölge ort. fiyat | Region avg. price | Средняя цена по региону | متوسط سعر المنطقة |
| Segment ort. fiyat | Segment avg. price | Средняя цена по сегменту | متوسط سعر القطاع |
| Platform ort. fiyat | Platform avg. price | Среднее по платформе | متوسط المنصة |
| Varlık vs Platform Ortalaması | Asset vs Platform Average | Актив против среднего по платформе | الأصل مقابل متوسط المنصة |
| Karşılaştırma seçimi | Comparison selection | Выбор для сравнения | اختيار المقارنة |
| Segment Trend Analizi | Segment Trend Analysis | Анализ трендов сегмента | تحليل اتجاهات القطاع |
| Derinlik puanı | Depth score | Балл глубины | درجة العمق |
| Pazar payı | Market share | Доля рынка | حصة السوق |
| Bölge Isı Haritası | Region Heatmap | Тепловая карта регионов | الخريطة الحرارية للمناطق |
| Raporu İndir (Demo) | Download Report (Demo) | Скачать отчёт (демо) | تنزيل التقرير (تجريبي) |
| Ort. fiyat (kısa) | Avg. price | Ср. цена | متوسط السعر |
| lot | lot | лот | لوت |
| Konut/Arsa/Ticari/Turizm (segment) | Residential/Land/Commercial/Tourism | Жилая/Земля/Коммерческая/Туристическая | سكني/أرض/تجاري/سياحي |

### [REVIEW]
**Hiçbir [REVIEW] gerekmedi.** Standart borsa/piyasa/grafik terminolojisi.

### Dürüstlük metni (banner) — 4 dilde anlam korundu (KRİTİK)
- TR: "Burada gösterilen değerler ₺ ortalama fiyatlardır. Gerçek İhaleal Endeksi puanı için..."
- EN: "Values shown here are ₺ average prices. For the actual iHaleal Index score, see..."
- RU: "Показанные значения — это средние цены в ₺. Реальный балл индекса iHaleal..."
- AR: "القيم المعروضة هنا هي متوسطات الأسعار بالليرة التركية. للحصول على درجة مؤشر iHaleal الحقيقية..."

**→ Kullanıcı 4 dilde de "burada ortalama fiyat var, gerçek endeks puanı ana sayfa" mesajını NET alır.**

---

## 3) BLOK 3 — Uygulama

### 3.1 `messages.ts` — `dataAnalysis` namespace
```ts
export type DataAnalysisMessages = {
  eyebrow, title, subtitle, bannerWarning,
  avgPriceHistory, regionAvg, segmentAvg, platformAvg, captionSelected,
  assetVsPlatform, assetPriceSuffix, comparisonSelection,
  segmentTrendAnalysis, volumeLabel, volumeUnit, depthScore, marketShare,
  regionHeatmap, downloadReport, avgPriceShort, demoReportFootnote,
  segmentResidential, segmentLand, segmentCommercial, segmentTourism  // 27 alan
};
// Messages.dataAnalysis + EN/TR/RU/AR override
```

### 3.2 `BorsaDataAnalysisPage.tsx` — bağlama
- `useLocale + da = t.dataAnalysis`
- Header: eyebrow + H1 + subtitle + banner
- 2 grafik H2 + 5 Line/Area `name` prop (recharts legend) + 2 caption
- Segment trend H3 + 3 metrik (Hacim/Derinlik puanı/Pazar payı) + birim "lot"
- Isı haritası H3 + Download buton + cell "Ort. fiyat" + Hacim
- Demo dipnot

### 3.3 Recharts dahil çeviri
- Line/Area `name` prop **t() ile çevrildi** → grafik legend 4 dilde
- Tooltip formatter `formatTry(v)` korundu (₺ değer)
- X axis dataKey/Y axis tickFormatter (`₺Xm`) — VERİ mantığı, DOKUNULMADI
- Tooltip etiket text formatter — recharts otomatik name prop'tan alır → 4 dilde otomatik

### 3.4 Hesap motoru + recharts veri DOKUNULMADI
- `useLiveMarket` + `createMarketSnapshot` → SIFIR
- `indexHistory` + `comparisonHistory` + `segmentTrends` + `regionHeatmap` array build → SIFIR
- Recharts component yapısı (LineChart/AreaChart/CartesianGrid/XAxis/YAxis) → SIFIR
- `formatTry` çağrısı → SIFIR
- FxRef (heatmap cell) → korundu

---

## 4) BLOK 4 — RTL + BiDi (AR — DARK + grafik)

### Doğrulama
- ✅ `<html dir="rtl">` set
- ✅ Header + banner + grafik kartları sağdan akar (browser native CSS grid)
- ✅ Segment trend kartları sağa hizalı
- ✅ Isı haritası grid (md:grid-cols-2 xl:grid-cols-3) AR'da grid yönü doğru
- ✅ Sayısal değerler `<span dir="ltr">` (Hacim/Derinlik/Pazar payı/% rakam)
- ✅ Recharts grafik: dark zemin korundu, legend Arapça (recharts SVG render — yön otomatik)
- ✅ Tooltip dark + Arapça text (recharts default styling)
- ✅ Noto Sans Arabic font yüklü
- ✅ Marka "ihaleal.com" LTR korunur (footer)
- ✅ Heatmap cell `dir="ltr"` cell.idx (₺ tutar) + amber FxRef referans tonu korundu

### Recharts RTL not (DÜRÜST)
- recharts legend AR'da metin sağdan sola akabilir (font + text-anchor SVG default LTR)
- Test'te legend render edildi (gerçek Arapça metin görüldü)
- Tam mükemmel RTL recharts entegrasyonu için custom SVG text-anchor gerekebilir → **ayrı dilim** (gerçek kritik değil, etiket okunur)

---

## 5) BLOK 5 — Test (4 dil × 6 string + currency + ayrım)

```json
{
  "tr": {http: 200, lang: "tr", dir: "ltr",
         title: ✅ Ortalama Fiyat Paneli, banner: ✅ ₺ ortalama fiyatları,
         avg_history: ✅ Ortalama Fiyat Geçmişi, heatmap: ✅ Bölge Isı Haritası,
         trend: ✅ Segment Trend Analizi, download: ✅ Raporu İndir,
         has_try: ✅, errs: []},
  "en": {... Average Price Panel + ₺ average prices + History + Region Heatmap + Trend + Download ...},
  "ru": {... панель средних цен + средние цены + История средних цен + Тепловая карта регионов + Анализ + Скачать отчёт ...},
  "ar": {dir: "rtl", لوحة متوسط الأسعار + متوسطات الأسعار + سجل متوسط الأسعار + الخريطة الحرارية للمناطق + تحليل + تنزيل التقرير}
}
```

### Test matrisi — 24/24 PASS

| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html lang>` | tr | en | ru | ar |
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| Title "Ortalama Fiyat Paneli" | ✅ | ✅ Average Price Panel | ✅ панель средних цен | ✅ لوحة متوسط الأسعار |
| Banner "₺ ortalama" | ✅ | ✅ ₺ average prices | ✅ средние цены | ✅ متوسطات الأسعار |
| Avg Price History (H2) | ✅ | ✅ | ✅ История средних цен | ✅ سجل متوسط الأسعار |
| Region Heatmap (H3) | ✅ | ✅ | ✅ Тепловая карта | ✅ الخريطة الحرارية |
| Segment Trend (H3) | ✅ | ✅ | ✅ Анализ трендов | ✅ تحليل اتجاهات |
| Download Report | ✅ | ✅ | ✅ Скачать отчёт | ✅ تنزيل التقرير |
| Currency ₺ | ✅ | ✅ | ✅ | ✅ |
| Currency ≈$ (USD) | n/a | ✅ | ✅ | ✅ |
| Console hatası | 0 | 0 | 0 | 0 |

### Endeks puanı / ₺ ayrımı (ADIM 9 + 4 dilde korundu)

| Sayfa | Tip | ₺ | ≈$ | 4 dilde |
|---|---|---|---|---|
| **DataAnalysis "Ortalama fiyat"** | ₺ ortalama fiyat (row.price avg) | ✅ | ✅ FxRef | "Ortalama fiyat / Avg. price / Средняя цена / متوسط السعر" + (₺) işareti grafik adı içinde |
| BorsaPage `idx.index` (heatmap) | Gerçek endeks puanı (kur-bağımsız) | YOK | YOK | ADIM 4'te dokunulmadı, korundu |

**→ 4 dilde de ortalama fiyat = ₺/≈, gerçek endeks = ≈ YOK** ayrımı korundu. ✅

### Screenshots
```
_audit/dil-faz1h/
├── _test.mjs
└── data-analysis-{tr,en,ru,ar}.png   (4 dil)
```

### Build + Lint
- PWA v1.3.0 — precache 299 entries (6545.50 KiB) ✅ +5.80 KiB
- 2 dosya 0 error / 0 warning

---

## 6) Dokunulan dosyalar

```
src/i18n/messages.ts                       (+150 / 0)
  - DataAnalysisMessages tipi (27 alan)
  - Messages.dataAnalysis
  - EN + TR + RU + AR full

src/pages/BorsaDataAnalysisPage.tsx        (+22 / -22)
  - useLocale + da
  - eyebrow + H1 + subtitle + banner
  - 2 grafik H2 + 5 Line/Area name + 2 caption
  - Segment trend H3 + 3 metrik etiket + lot birim
  - Heatmap H3 + Download + Ort. fiyat + Hacim
  - Dipnot
  - Sayısal değerlere <span dir="ltr"> (Hacim/Derinlik/Pazar payı/cell hacim)

_audit/DIL_FAZ1H_RAPORU.md                 (+ YENİ)
_audit/dil-faz1h/_test.mjs                 (+ YENİ test)
_audit/dil-faz1h/*.png                     (+ 4 screenshot)
```

**Çekirdek dokunulmadı (git diff sıfır):**
```
src/borsa/useLiveMarket.ts                 ZERO
src/lib/borsa/marketData.ts                ZERO (createMarketSnapshot)
src/lib/borsa/borsa_index.ts (varsa)       ZERO (endeks puan motoru)
indexHistory + comparisonHistory + segmentTrends + regionHeatmap build  ZERO (hesap dizileri)
recharts component yapisi + dataKey + tickFormatter                     ZERO
formatTry çağrısı (line 11-13)                                          ZERO
src/lib/placeBid.ts, fees.ts                                            ZERO
src/contexts/CurrencyContext.tsx, FxRef, useCurrency                    ZERO
LocaleContext (ADIM 10), ADIM 11-19 namespaces                          ZERO
ADIM 4'te bağlanan FxRef (5 borsa sayfa TRY+equiv)                      ZERO
ADIM 9 etiket düzeltmesi MANTIK (puan/tutar ayrımı)                     ZERO (etiket çevrildi, mantık korundu)
supabase/, tailwind.config                                              ZERO
```

---

## 7) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6545.50 KiB)
```
✅ **YEŞİL** (+5.80 KiB)

### Git
- `safe-before-dil-faz1h` (f5f108b)
- `safe-after-dil-faz1h` (bu commit)

### Regresyon — KANIT
- TR: ADIM 9 etiket düzeltmesi korundu ("Ortalama Fiyat" doğru) + currency korundu
- EN: yeni eklenen tam EN (önceden TR sabit)
- ADIM 11-19 namespaces + getMessagesFor → bozulmadı
- `borsa_index` motoru + `useLiveMarket` + recharts veri mantığı → değişmedi
- FxRef ₺+≈$ gösterimi → korundu

### Dürüstlük + Ayrım
- ✅ Banner "burada ortalama fiyat, gerçek endeks ana sayfa" 4 dilde net
- ✅ "Demo veri / ön analiz" 4 dilde
- ✅ "Profesyonel yatırım kararları için bağımsız danışman gereği" 4 dilde
- ✅ Endeks puanı/₺ ortalama AYRIMI (ADIM 9 disiplini) 4 dilde korundu
- ✅ ADIM 14 borsa namespace + ADIM 20 dataAnalysis namespace ile tutarlı sözlük

---

## 8) BORSA KONUSU TAMAMLANDI ✅ (ADIM 4+9+14+20)

| Adım | Bileşen | Çevrildi |
|---|---|---|
| ADIM 4 | 4 borsa sayfası (BorsaPage/Portfolio/Watchlist/AssetDetail) currency | FxRef bağlanması (₺+≈$) |
| ADIM 9 | DataAnalysis "endeks → Ortalama Fiyat" etiket düzeltmesi (TR) | Endeks puanı/₺ tutar ayrımı + cell.idx FxRef |
| ADIM 14 | 5 borsa sayfa UI (Borsa namespace, ~40 key) | Portfolio/Watchlist/AssetDetail/Page etiketleri |
| **ADIM 20** | **DataAnalysis RU/AR + recharts (27 key)** | **Header + banner + 2 grafik + heatmap + segment trend + Download + dipnot** |

**Tüm borsa akışı 4 dilde:**
- Borsa giriş → BorsaPage (ADIM 14) çevrili
- Asset Detail → ADIM 14 etiketler
- Portfolio + Watchlist → ADIM 14 KPI
- **DataAnalysis (ADIM 20)** → ADIM 9 ayrımı + ADIM 14 borsa terimleri + ADIM 20 recharts
- Sealed view maskeleme → ADIM 14
- `borsa_index` motoru + `useLiveMarket` + recharts veri → 4 adımda SIFIR diff

---

## 9) GÜNCEL SÖZLÜK (ADIM 11-20) — ~265 terim

- ADIM 11-19 = 240
- **ADIM 20 (DataAnalysis 25 terim)** = +25
- **Toplam ~265 terim**, sözlük zinciri 4 dilde tutarlı

---

## 10) Sonraki FAZ 1 Adımları

| # | İş | Saat |
|---|---|---|
| **11-N** | GES değerleme + dashboard/profile küçük sayfalar | 2-3 |
| **11-G** | İlan detay derinleştirme (AI Insight + SellerTrustCard) | 2-3 |
| **11-O** | Emlakçı panel + Müteahhit panel | 2-3 |
| **11-P** | ValuationTool ayrı sayfa (kapsam dışı kaldı) + DataAnalysis dropdown segment label | 1 |
| **11-Q** | PDF rapor 4 dil (endeksRaporu - opsiyonel, yasal) | 2-3 |

### FAZ 2 (RTL CSS 359) + FAZ 3 (yasal+avukat) korunur.

---

## 11) Master için 3 KARAR

1. **Sonraki:** 11-N (GES+dashboard) mı, 11-G (ilan derinleştirme) mi, 11-O (emlakçı+müteahhit panel) mi?
2. **Recharts RTL tam:** AR'da legend+tooltip text-anchor SVG yönü — şu an "yeterince iyi" (okunur, doğru çeviri). Tam mükemmel mi (custom SVG ile) yoksa pratik dur mu?
3. **DataAnalysis dropdown segment label:** Konut/Arsa/Ticari/Turizm dropdown option text TR sabit kaldı (segment key SegmentKey union). messages.ts'e eklendi ama uygulanmadı. Sonraki ufak dilim mi yoksa pratik geç mi?

---

— **DataAnalysis 20 arayüz öğesi 4 dilde + recharts (Line/Area name) çevrildi · borsa_index + useLiveMarket + recharts veri SIFIR diff · Endeks puanı/₺ ayrımı (ADIM 9) 4 dilde korundu · Currency korundu · ADIM 14 borsa terimleri TUTARLI · 24/24 PASS · 0 console hata · 265 terim sözlük (ADIM 11-20) · Borsa konusu (ADIM 4+9+14+20) TAMAMLANDI.**
🌐✅
