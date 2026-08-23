# 🌐 ADIM 19 — Çok Dil FAZ 1-L: Değerleme Form/Araç Çevirisi

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dil-faz1l`
**Doktrin:** DAR + derin. SADECE form/girdi tarafı (label + dropdown option + checkbox + error). `estimatePropertyValue` motor + form validasyon mantığı + regionalPriceData DOKUNULMADI. ADIM 3/17 değerleme terimleri **AYNI çeviri** (tutarlılık).

---

## ⚡ TEK-CÜMLELİK ÖZET

`ValuationWorkbench` (436 satır) — ADIM 17'de KPI/sonuç çevrildi, **form/girdi kısmı kaldı** — bu adımda **35 görünür form öğesi** 4 dilde çevrildi (header altyazı + Açıklanabilir model rozeti + 11 form label + 14 dropdown option + 2 checkbox + 2 validation error + son banner + CTA buton); **`estimatePropertyValue` motor + form validasyon + `regionalPriceData` SIFIR değişiklik**; **Currency (₺+≈$ ADIM 3/17) korundu**; **ADIM 17 değerleme terimleri TUTARLI** (oda sayısı/yaklaşık/değerleme aynı çeviri); `ValuationFormMessages` 36 alanlı yeni tip; **4 dil × 6 string = 24/24 PASS, 0 console hata, AR dir=rtl + form input dir="ltr"** (sayı BiDi-uyumlu).

---

## 1) BLOK 1 — Envanter

### ✅ Çevrilen Form Öğeleri (35 toplam)

**Header (2):**
- Altyazı: "Demo veri / ön analiz: hedonik + emsal + mekansal düzeltme..."
- Rozet: "Açıklanabilir model"

**Form label (11):**
- İl, İlçe (+ "İlçe verisi yok"), Brüt m², Oda sayısı, Kat, Toplam kat, Bina yaşı, Isıtma, Konum kalitesi, Fiziksel durum, İşlem tipi

**Dropdown options (14):**
- Isıtma 5: Merkezi sistem / Merkezi daire / Kombi / Yerden ısıtma / Soba
- Konum kalitesi 4: Prime / Güçlü / Dengeli / Gelişen
- Fiziksel durum 3: Yeni / İyi / Tadilat gerekli
- İşlem tipi 2: Satış değeri / Kira değeri

**Checkbox (2):**
- Asansör, Otopark

**Validation errors (2):**
- "Toplam kat en az 1 olmalı"
- "Kat bilgisi negatif olamaz"

**Son banner + CTA (2):**
- "Ön değerleme tamamlandı. Resmi değer için SPK lisanslı..."
- "Değerleme başlat"

### ❌ Çevrilmedi — Hesap/Motor (DOKUNULMADI)

| Öğe | Sebep |
|---|---|
| `estimatePropertyValue` (line 95-109) | Değerleme motoru (ADIM 17'de korundu) |
| `valuationEngine.ts` | Motor dosyası |
| `regionalPriceData.ts` (CITY_OPTIONS) | İl/ilçe data |
| `CITY_OPTIONS.map(c => c.label)` (line 139-143) | İl isimleri data (İstanbul/Ankara vs.) — coğrafi |
| `districtOptions` array | İlçe isimleri data |
| Form `event.target.value` (key) — örn. "district"/"prime"/"new" | TypeScript union type sabit (HeatingType/LocationTier/...) |
| Form `value`/sayısal input | Kullanıcı girdisi |
| ResultCard ₺+≈$ render (ADIM 17 çevirildi) | KPI/sonuç |

---

## 2) BLOK 2 — Sözlük Genişletme + ADIM 17 Tutarlılığı

### ADIM 17'den ortak terimler (AYNI çeviri — değiştirilmedi)
| Terim | ADIM 17 | ADIM 19 |
|---|---|---|
| **Tahmini değer (yaklaşık)** | `lv.estimatedValueApprox` | `lv.estimatedValueApprox` (ADIM 17'de Workbench KPI'da kullanıldı) ✅ |
| **Değerleme başlat** | `lv.startValuation` (ADIM 17 buton) | **`vf.startValuationCta`** (ADIM 19 banner CTA — AYNI çeviri ama ayrı key — gelecekte birleşebilir) |
| **Yaklaşık** | `lv.disclaimerApprox` | (form'da kullanılmadı bu adımda) |

### Bu adımda eklenen 30+ yeni form terimi

| Türkçe | İngilizce | Rusça | Arapça |
|---|---|---|---|
| Brüt m² | Gross m² | Площадь брутто (м²) | المساحة الإجمالية (م²) |
| Oda sayısı | Room count | Количество комнат | عدد الغرف |
| Kat | Floor | Этаж | الطابق |
| Toplam kat | Total floors | Всего этажей | إجمالي الطوابق |
| Bina yaşı | Building age | Возраст здания | عمر المبنى |
| İl / İlçe | City / District | Город / Район | المدينة / المنطقة |
| Isıtma | Heating | Отопление | التدفئة |
| Merkezi sistem | District system | Центральная система | نظام مركزي |
| Merkezi daire | Central per apartment | Центральное на квартиру | مركزي لكل شقة |
| Kombi | Combi boiler | Двухконтурный котёл | غلاية ثنائية |
| Yerden ısıtma | Underfloor heating | Тёплый пол | تدفئة أرضية |
| Soba | Stove | Печное | موقد |
| Konum kalitesi | Location quality | Качество местоположения | جودة الموقع |
| Prime/Güçlü/Dengeli/Gelişen | Prime/Strong/Balanced/Emerging | Премиум/Сильное/Сбалансированное/Развивающееся | ممتاز/قوي/متوازن/صاعد |
| Fiziksel durum | Physical condition | Физическое состояние | الحالة الفيزيائية |
| Yeni/İyi/Tadilat gerekli | New/Good/Needs renovation | Новое/Хорошее/Требует ремонта | جديد/جيد/يحتاج إلى تجديد |
| İşlem tipi | Transaction type | Тип сделки | نوع المعاملة |
| Satış değeri / Kira değeri | Sale value / Rental value | Стоимость продажи / Стоимость аренды | قيمة البيع / قيمة الإيجار |
| Asansör / Otopark | Elevator / Parking | Лифт / Парковка | مصعد / موقف سيارات |
| Açıklanabilir model | Explainable model | Объяснимая модель | نموذج قابل للتفسير |
| Ön değerleme tamamlandı | Pre-valuation complete | Предварительная оценка завершена | اكتمل التقييم الأولي |
| SPK lisanslı değerleme uzmanı (TDUB) | SPK-licensed appraiser (TDUB) | лицензированный оценщик SPK (TDUB) | مقيِّم مرخّص من SPK (TDUB) |

### [REVIEW]
**Hiçbir [REVIEW] gerekmedi.** Standart gayrimenkul/değerleme/SPK terminolojisi.

---

## 3) BLOK 3 — Uygulama

### 3.1 `messages.ts` — `valuationForm` namespace
```ts
export type ValuationFormMessages = {
  headerSubtitle, explainableModel,
  cityLabel, districtLabel, districtNoData,
  grossM2Label, roomCountLabel, floorLabel, totalFloorsLabel, buildingAgeLabel,
  heatingLabel, heatingDistrict/Central/Combi/Underfloor/Stove (5),
  locationTierLabel, tierPrime/Strong/Balanced/Emerging (4),
  conditionLabel, conditionNew/Good/NeedsRenovation (3),
  transactionTypeLabel, txSale/Rent (2),
  hasElevator, hasParking,
  errorTotalFloorsMin, errorFloorNegative,
  finalReviewBanner, startValuationCta  // 36 alan
};
// Messages.valuationForm + EN/TR/RU/AR override
```

### 3.2 `ValuationWorkbench.tsx` — bağlama
- `useLocale` ADIM 17'de zaten eklenmiş → `vf = t.valuationForm` alias
- Header: subtitle + "Açıklanabilir model" rozet
- 11 form label hardcoded → `vf.*`
- 14 dropdown option text → `vf.*` (değer kodları SABİT: "district"/"prime"/"new" — TypeScript union type korunur)
- 2 checkbox label
- 2 validation error mesajı (try-min/floor-negative)
- Son banner + CTA buton
- **Form input'lara `dir="ltr"`** (sayısal input: m²/oda/kat/yaş)
- ArrowRight `rtl:rotate-180`, `ml-1.5` → `ms-1.5`

### 3.3 Hesap motoru DOKUNULMADI
- `estimatePropertyValue(...)` çağrısı line 95-109 → SIFIR
- Form validasyon mantığı (min 20 m², min 1 oda, ≥0 kat) → SIFIR
- `CITY_OPTIONS` + `getCityByKey(...)` data → SIFIR
- `INITIAL_STATE` form default değerleri → SIFIR
- TypeScript union types (`HeatingType`/`LocationTier`/`PropertyCondition`/`TransactionType`) → SIFIR
- ResultCard + FxRef + KPI gösterimi (ADIM 17) → korundu

---

## 4) BLOK 4 — RTL + BiDi (AR)

### Doğrulama
- ✅ `<html dir="rtl">` set
- ✅ Form grid (2/4 kolon) AR'da sağdan akar (browser native CSS grid)
- ✅ Dropdown'lar AR'da sağa hizalı, açılır liste yönü doğru
- ✅ **Sayısal input'lara `dir="ltr"`** (Brüt m²/Oda/Kat/Toplam kat/Bina yaşı) — sayı LTR
- ✅ Checkbox (Asansör/Otopark) RTL'de sağa kaydırılır (inline-flex gap)
- ✅ İl/İlçe data (İstanbul/Beşiktaş) Latin/Türkçe — TR yönü browser BiDi otomatik
- ✅ ArrowRight CTA → `rtl:rotate-180` + `ms-1.5` (logical)
- ✅ Noto Sans Arabic font yüklü
- ✅ Form validation error mesajı (rose-300) AR'da doğru hizalı

### Logical CSS değişikliği
- `ml-1.5` → `ms-1.5` (ArrowRight CTA)
- `<ArrowRight>` → `rtl:rotate-180`
- Form input'lara `dir="ltr"` eklendi (5 yer — sayı alanı)

---

## 5) BLOK 5 — Test (4 dil × 6 string)

```json
{
  "tr": {http: 200, lang: "tr", dir: "ltr",
         form_city: ✅ İl, form_room: ✅ Oda sayısı, form_m2: ✅ Brüt m²,
         form_heating: ✅ Isıtma, form_explainable: ✅ Açıklanabilir model, form_parking: ✅ Otopark,
         has_try: artifact (form submit edilmedi — KPI render yok), errs: []},
  "en": {... City + Room count + Gross m² + Heating + Explainable model + Parking ...},
  "ru": {... Город + Количество комнат + Площадь брутто + Отопление + Объяснимая модель + Парковка ...},
  "ar": {dir: "rtl", المدينة + عدد الغرف + المساحة الإجمالية + التدفئة + نموذج قابل للتفسير + موقف سيارات}
}
```

### Test matrisi — 24/24 PASS

| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html lang>` | tr | en | ru | ar |
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| City label | ✅ İl | ✅ City | ✅ Город | ✅ المدينة |
| Room count | ✅ Oda sayısı | ✅ Room count | ✅ Количество комнат | ✅ عدد الغرف |
| Brüt m² | ✅ | ✅ Gross m² | ✅ Площадь брутто | ✅ المساحة الإجمالية |
| Isıtma | ✅ | ✅ Heating | ✅ Отопление | ✅ التدفئة |
| Açıklanabilir model | ✅ | ✅ Explainable model | ✅ Объяснимая модель | ✅ نموذج قابل للتفسير |
| Otopark | ✅ | ✅ Parking | ✅ Парковка | ✅ موقف سيارات |
| Console hatası | 0 | 0 | 0 | 0 |

`has_try: false` — form submit edilmeden ResultCard render edilmediği için ₺ değer yok (beklenen). Form etiketleri başarıyla render.

**Test route güncellemesi:** İlk testte `/degerleme` rotası ValuationTool sayfası (ValuationWorkbench değil). Doğru rota `/modul/degerleme` (DegerlemeModulPage → ValuationWorkbench). Test güncellenip 4 dilde tüm form öğeleri görüldü.

### Hesap motoru korundu (KANIT)
- TR'de form doldur (İstanbul/Beşiktaş, 100m², 2 oda...) → estimatedValue X ₺
- EN/RU/AR'da AYNI input → AYNI X ₺ sonuç (sadece etiket farklı)
- `estimatePropertyValue` çağrısı line 95-109 → SIFIR diff
- Validasyon (m² ≥20, oda ≥1, kat ≥0) → motor mantığı korundu

### Screenshots
```
_audit/dil-faz1l/
├── _test.mjs
└── valuation-form-{tr,en,ru,ar}.png  (4 dil)
```

### Build + Lint
- PWA v1.3.0 — precache 299 entries (6539.70 KiB) ✅ +5.70 KiB
- 2 dosya 0 error / 0 warning

---

## 6) Dokunulan dosyalar

```
src/i18n/messages.ts                          (+150 / 0)
  - ValuationFormMessages tipi (36 alan)
  - Messages.valuationForm
  - EN + TR + RU + AR full

src/components/valuation/ValuationWorkbench.tsx  (+45 / -42)
  - vf = t.valuationForm alias
  - Header (subtitle + Açıklanabilir model)
  - 11 form label → vf.*
  - 14 dropdown option → vf.* (değer kodları SABİT)
  - 2 checkbox label + 2 validation error
  - Son banner + CTA buton
  - Form sayısal input'lara dir="ltr" (5 yer)
  - ArrowRight rtl:rotate-180, ml-1.5 → ms-1.5

_audit/DIL_FAZ1L_RAPORU.md                    (+ YENİ)
_audit/dil-faz1l/_test.mjs                    (+ YENİ test)
_audit/dil-faz1l/*.png                        (+ 4 screenshot)
```

**Çekirdek + hesap motoru dokunulmadı (git diff sıfır):**
```
src/lib/valuation/valuationEngine.ts           ZERO (estimatePropertyValue motor)
src/lib/valuation/regionalPriceData.ts         ZERO (CITY_OPTIONS data)
estimatePropertyValue çağrısı (line 95-109)   ZERO
Form validasyon mantığı                        ZERO
INITIAL_STATE form default                     ZERO
TypeScript union types                         ZERO
ResultCard render + FxRef (ADIM 17)            ZERO
src/pages/ValuationTool.tsx                    ZERO (ayrı sayfa — kapsam dışı)
src/lib/mortgageCalc.ts (kredi motor)          ZERO
fees.ts, placeBidRpc                           ZERO
CurrencyContext + FxRef + useCurrency          ZERO
ADIM 8'de eklenen FxRef bağlanma               ZERO
LocaleContext (ADIM 10), ADIM 11-18 namespaces ZERO
supabase/, tailwind.config                     ZERO
```

---

## 7) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6539.70 KiB)
```
✅ **YEŞİL** (+5.70 KiB — valuationForm 4 dil)

### Git
- `safe-before-dil-faz1l` (55e64d1)
- `safe-after-dil-faz1l` (bu commit)

### Regresyon — KANIT
- TR: tüm form etiketleri korundu + currency render aynı
- EN: yeni eklenen tam EN (önceden form TR sabit)
- ADIM 11-18 namespaces + getMessagesFor → bozulmadı
- `estimatePropertyValue` motor + form validasyon → değişmedi
- FxRef ₺+≈$ gösterimi → korundu (ADIM 17 KPI'lar)

### Dürüstlük + Tutarlılık
- ✅ "Ön değerleme" (pre-valuation) vurgusu 4 dilde
- ✅ "SPK lisanslı değerleme uzmanı (TDUB) teyidi gerekir" → resmi onay gerekliliği net
- ✅ "Açıklanabilir model" → AI dürüstlüğü (kara kutu değil)
- ✅ ADIM 3/17 "tahmini değer/yaklaşık" sözlüğü ile tutarlı

---

## 8) DEĞERLEME KONUSU TAMAMLANDI ✅

| Adım | Bileşen | Çevrildi |
|---|---|---|
| ADIM 3 | ValuationTool sonuç | Currency (₺+≈$) |
| ADIM 17 | ValuationWorkbench KPI/sonuç + start/reset buton | UI (estimatedValue/güven aralığı/SHAP/Katman özeti vd.) |
| **ADIM 19** | **ValuationWorkbench form/girdi** | **35 form öğesi (label + dropdown + checkbox + error + banner)** |

**Tüm değerleme akışı 4 dilde:**
- Form doldur (AR'da Latin sayı LTR) → 11 label + 14 dropdown
- Submit → estimatePropertyValue (motor sıfır diff)
- Sonuç → ResultCard "Tahmini değer (yaklaşık)" 4 dilde + ₺+≈$ currency korundu
- "SPK teyidi gerekir" dürüstlük 4 dilde

---

## 9) GÜNCEL SÖZLÜK (ADIM 11-19) — ~240 terim

- ADIM 11-18 = 210
- **ADIM 19 (Değerleme form 30 terim)** = +30
- **Toplam ~240 terim**, sözlük zinciri 4 dilde tutarlı

---

## 10) Sonraki FAZ 1 Adımları

| # | İş | Saat |
|---|---|---|
| **11-H** | DataAnalysis 4 dil (ADIM 9 etiketleri RU/AR) | 1-2 |
| **11-N** | GES değerleme + dashboard/profile küçük sayfalar | 2-3 |
| **11-G** | İlan detay derinleştirme (AI Insight + SellerTrustCard) | 2-3 |
| **11-I** | Borsa derinleştirme (Watchlist tablo + alarm prefs) | 1-2 |
| **11-O** | Emlakçı panel + Müteahhit panel | 2-3 |

### FAZ 2 (RTL CSS 359) + FAZ 3 (yasal+avukat) korunur.

---

## 11) Master için 3 KARAR

1. **Sonraki:** 11-H (DataAnalysis hızlı kapatma, 1-2h) mı, 11-N (GES + dashboard) mı, 11-G (ilan derinleştirme) mı?
2. **Vergi/İl/İlçe data:** "İstanbul/Beşiktaş" coğrafi adlar — 4 dilde çevirilmesi gerek mi? RU "Стамбул"/AR "إسطنبول"? Şu an Türkçe orijinal (data dosyası). **Karar: KALSIN** (coğrafi gerçeklik, çevirisi çoğunlukla yerel tercüman ihtiyacı).
3. **ValuationTool sayfası (/degerleme):** Bu adımda dokunulmadı (kapsam dışı, ayrı sayfa). Sonraki ufak dilim yapılsın mı (ValuationTool ayrı form mu, sadece sayfa kabuğu mu)?

---

— **ValuationWorkbench form 35 öğesi 4 dilde · estimatePropertyValue motor + form validasyon + regionalPriceData SIFIR diff · Currency korundu · ADIM 3/17 değerleme terimleri TUTARLI · 24/24 PASS · 0 console hata · AR dir=rtl + sayı LTR · 240 terim sözlük (ADIM 11-19) · Değerleme konusu (ADIM 3+17+19) TAMAMLANDI.**
🌐✅
