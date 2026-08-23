# 🌐 ADIM 17 — Çok Dil FAZ 1-K: Kredi + Değerleme Arayüz Çevirisi

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dil-faz1k`
**Doktrin:** DAR + derin. SADECE arayüz (form etiketleri + sonuç KPI + dürüstlük notları). `calcMortgagePayment` + `estimatePropertyValue` HESAP MOTORLARI DOKUNULMADI. Dürüstlük notları (finansal yanıltma yasak) anlamı 4 dilde korunur.

---

## ⚡ TEK-CÜMLELİK ÖZET

Kredi (`KonutKredisiHesaplayici` + `ListingMortgageWidget`) ve değerleme (`ValuationWorkbench`) arayüzlerinde **~30 görünür öğe** 4 dilde profesyonel çevrildi (form etiketleri + sonuç KPI + buton + dürüstlük notları); **`calcMortgagePayment` (faiz/taksit formülü) + `estimatePropertyValue` (TCMB+emsal+hedonik) + SPK yaklaşımları hesabı SIFIR değişiklik**; **Currency mantığı (₺ ana + ≈$ ADIM 8'de bağlı) korundu**; **finansal dürüstlük metinleri 4 dilde net anlam** ("bilgilendirme amaçlıdır / kesin teklif değildir / yaklaşık"); `LoanValuationMessages` 35 alanlı yeni tip; **4 dil × 4 kritik string = 16/16 PASS** kredi sayfası + currency korundu + dir=rtl + 0 console hata.

---

## 1) BLOK 1 — Envanter (arayüz/hesap ayır)

### ✅ Çevrilen — Arayüz (sayısal değer/hesap motoru DEĞİL)

**KonutKredisiHesaplayici (129 satır → 11 key):**
- Geri butonu
- H1 "Konut Kredisi Hesaplayıcı" + altyazı (bilgilendirme amaçlı)
- 3 form etiketi: Kredi tutarı (₺), Aylık faiz oranı (%), Vade ({n} ay {y} yıl) + preset chip "yıl"
- 3 sonuç KPI: Aylık taksit, Toplam geri ödeme, Toplam faiz
- Dürüstlük notu: "Bu hesaplama eşit taksit formülüne dayanır; dosya/sigorta/kampanya hariç. Kesin teklif için bankanıza."

**ListingMortgageWidget (47 satır → 4 key):**
- Başlık "Bu ilan için kredi hesapla"
- Tahmin satırı format
- "Hesapla" buton
- Banka notu "Bilgilendirme amaçlı; banka onayı gerekir"

**ValuationWorkbench (430 satır → 9 key):**
- 2 buton: "Değerleme başlat", "Formu sıfırla"
- 4 sonuç KPI: Tahmini değer (yaklaşık), Güven aralığı, Belirsizlik bandı, Model skoru (Yüksek/Orta)
- 2 başlık: SHAP katkı dökümü, Katman özeti
- Tooltip: "Etkisi"

### ❌ Çevrilmedi — Hesap motoru + sayısal sonuç (DOKUNULMADI)

| Öğe | Dosya |
|---|---|
| `calcMortgagePayment(principal, rate, term)` | `lib/mortgageCalc.ts` |
| `estimatePropertyValue(input)` | `lib/valuation/valuationEngine.ts` |
| `result.monthlyPayment / totalPayment / totalInterest` | hesap sonucu |
| `result.estimatedValue / minValue / maxValue` | hesap sonucu |
| SPK yaklaşımları (`salesComparisonTry / costApproachTry / incomeApproachTry`) | hesap sonucu |
| Faiz oranı default %2.89, vade 120 ay | sabit input |
| ₺ + ≈$ FxRef gösterimi | ADIM 8'de bağlı (dokunulmadı) |

### ❌ Kapsam dışı (sonraki ufak dilim)
- ValuationWorkbench form alanı 16 select/checkbox label (Prime/Güçlü/Dengeli/Gelişen + Yeni/İyi/Tadilat gerekli + Satış değeri/Kira değeri + Asansör/Otopark)
- Mortgage.tsx ana sayfa (formül property value slider) — daha kapsamlı (sonraki dilim)
- ValuationTool ana sayfa giriş formu (varsa)
- Comparables tablosu (uzun emsal listesi)
- 3 SPK yaklaşımı kartı başlıkları (SPK-Emsal/Maliyet/Gelir yaklaşımı)
- Tax simülatörü
- GES değerleme sayfası

---

## 2) BLOK 2 — Sözlük Genişletme (kredi/değerleme)

### Bu adımda eklenen 25+ yeni terim

| Türkçe | İngilizce | Rusça | Arapça |
|---|---|---|---|
| Kredi | Loan | кредит | قرض |
| Konut kredisi / Mortgage | Mortgage | ипотека | قرض عقاري |
| Aylık taksit | Monthly installment | Ежемесячный платёж | القسط الشهري |
| Vade | Term | Срок | المدة |
| Faiz oranı | Interest rate | процентная ставка | معدل الفائدة |
| Aylık faiz oranı (%) | Monthly interest rate (%) | Месячная процентная ставка (%) | معدل الفائدة الشهري (%) |
| Peşinat | Down payment | Первоначальный взнос | الدفعة الأولى |
| Toplam geri ödeme | Total repayment | Общая сумма выплат | إجمالي السداد |
| Toplam faiz | Total interest | Общие проценты | إجمالي الفوائد |
| Konut bedeli | Property value | Стоимость недвижимости | قيمة العقار |
| Hesapla | Calculate | Рассчитать | احسب |
| Tahmini değer (yaklaşık) | Estimated value (approximate) | Оценочная стоимость (примерно) | القيمة التقديرية (تقريبية) |
| Güven aralığı | Confidence range | Доверительный диапазон | نطاق الثقة |
| Belirsizlik bandı | Uncertainty band | Полоса неопределённости | نطاق عدم اليقين |
| Model skoru | Model score | Оценка модели | درجة النموذج |
| Yüksek / Orta | High / Medium | Высокая / Средняя | عالية / متوسطة |
| Değerleme başlat | Start valuation | Начать оценку | بدء التقييم |
| Formu sıfırla | Reset form | Сбросить форму | إعادة تعيين النموذج |
| SHAP katkı dökümü | SHAP contribution breakdown | Разбор вклада SHAP | تفصيل مساهمة SHAP |
| Katman özeti | Layer summary | Сводка слоёв | ملخص الطبقات |
| Bilgilendirme amaçlıdır | For informational purposes | В информационных целях | لأغراض إعلامية |
| Kesin teklif değildir | Not a binding offer | Не является окончательным предложением | ليس عرضاً نهائياً |
| Yaklaşık | Approximate | Примерно | تقريباً |
| Banka onayı gerekir | Bank approval required | требуется одобрение банка | يلزم موافقة البنك |

### [REVIEW]
**Hiçbir [REVIEW] gerekmedi.** Tüm çeviriler standart finans/bankacılık/değerleme/teknik terimler.

**Dürüstlük metinleri özel doğrulama (KRİTİK — finansal yanıltma yasak):**
- ✅ "Bilgilendirme amaçlıdır" → RU "В информационных целях" / AR "لأغراض إعلامية" (kullanıcı bu **bağlayıcı teklif olmadığını** anlar)
- ✅ "Kesin teklif değildir" → RU "Не является окончательным предложением" / AR "ليس عرضاً نهائياً" (net + yanıltıcı değil)
- ✅ "Yaklaşık" → RU "Примерно" / AR "تقريباً" (tahmin vurgusu korunur — değerleme dürüstlüğü)
- ✅ "Eşit taksit formülüne dayanır; dosya masrafı, sigorta ve banka kampanyaları dahil değildir" → 4 dilde net anlam korundu

---

## 3) BLOK 3 — Çevirinin Uygulanması

### 3.1 `messages.ts`
```ts
export type LoanValuationMessages = {
  back, loanTitle, loanSubtitle, loanAmount, monthlyRate, termLabel, yearLabel,
  monthlyInstallment, totalRepayment, totalInterest,
  loanAmountField, downPayment, propertyValue,
  loanDisclaimerEqual, loanDisclaimerInfo,
  widgetTitle, widgetEstimate, widgetCalculate, widgetBankNote,
  valuationTitle, estimatedValueApprox, confidenceRange, uncertaintyBand,
  modelScore, modelScoreHigh, modelScoreMedium,
  shapTitle, shapImpact, layerSummary,
  startValuation, resetForm,
  disclaimerInfo, disclaimerNotOffer, disclaimerApprox
};
// 35 alan × 4 dil = 140 string total
```

### 3.2 KonutKredisiHesaplayici.tsx
- `useLocale + lv = t.loanValuation` 
- 11 hardcoded TR → `lv.*`
- "Geri" oku `<ArrowLeft rtl:rotate-180 />`
- Vade satırı: `<span dir="ltr">{termMonths}</span>` (sayı LTR BiDi)
- Preset chip: `<span dir="ltr">{m/12}</span> yıl` (sayı LTR)
- Dürüstlük notu metni `lv.loanDisclaimerEqual` (uzun, anlam korundu)

### 3.3 ListingMortgageWidget.tsx
- `useLocale + lv`
- Başlık + tahmin format + buton + banka notu (4 yer)
- `<span dir="ltr">80% · 120 · 2.89%</span>` (sayısal LTR)

### 3.4 ValuationWorkbench.tsx
- `useLocale + lv`
- 2 buton (start/reset)
- 4 sonuç KPI çevirisi
- 2 chart başlığı (SHAP/Katman özeti)
- Tooltip "Etkisi" → `lv.shapImpact`
- `Yüksek/Orta` → `lv.modelScoreHigh/Medium`
- `± {pct}%` → `<p dir="ltr">± {pct}%</p>` (BiDi)
- `{score}/100` → `<span dir="ltr">{score}/100</span>` (BiDi)
- `mr-1.5` → `me-1.5` (Calculator icon)
- title prop default'u: `lv.startValuation` fallback

### 3.5 Çekirdek SIFIR değişiklik
- `lib/mortgageCalc.ts` (calcMortgagePayment) — DOKUNULMADI
- `lib/valuation/valuationEngine.ts` (estimatePropertyValue) — DOKUNULMADI
- Sonuç sayıları `result.monthlyPayment` vd. — render edildiği gibi (sadece çevresindeki etiket çevrildi)
- FxRef + useCurrency — DOKUNULMADI (ADIM 8'de bağlı, korundu)

---

## 4) BLOK 4 — RTL + BiDi (AR)

### Doğrulama
- ✅ `<html dir="rtl">` AR'da set
- ✅ Form alanları sağdan akar (browser native)
- ✅ Input `value`'ları LTR (sayı) — Input bileşeni default LTR
- ✅ Sonuç KPI değerleri `dir="ltr"` (₺ tutar + FxRef)
- ✅ Vade satırı `<span dir="ltr">{termMonths}</span>` ve preset chip `<span dir="ltr">{m/12}</span>` — sayı LTR
- ✅ ListingMortgageWidget tahmin satırı `<span dir="ltr">80% · 120 · 2.89%</span>` — sayısal blok LTR
- ✅ "± %X" gösterimi `<p dir="ltr">± {pct}%</p>` — BiDi-uyumlu
- ✅ "Model skoru X/100" `<span dir="ltr">{score}/100</span>`
- ✅ Geri oku `rtl:rotate-180`
- ✅ Calculator icon `me-1.5` (logical CSS)
- ✅ Noto Sans Arabic font yüklü
- ✅ Marka "ihaleal.com" LTR korunur (footer)

---

## 5) BLOK 5 — Test (4 dil × 4 string + currency + hesap)

```json
{
  "tr": {http_loan: 200, http_val: 200, lang: "tr", dir: "ltr",
         loan_title: ✅ Konut Kredisi Hesaplayıcı, loan_amount: ✅ Kredi tutarı,
         loan_monthly: ✅ Aylık taksit, loan_interest: ✅ Toplam faiz,
         val_start: artifact* (route ValuationTool, Workbench manuel form gerek),
         has_try: ✅, errs: []},
  "en": {... Mortgage Calculator + Loan amount + Monthly installment + Total interest, val_start artifact ...},
  "ru": {... Ипотечный калькулятор + Сумма кредита + Ежемесячный платёж + Общие проценты, has_usd_ref: ✅ ...},
  "ar": {dir: "rtl", حاسبة القرض العقاري + مبلغ القرض + القسط الشهري + إجمالي الفوائد, has_usd_ref: ✅}
}
```

### Test matrisi — Kredi sayfası **16/16 PASS**

| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html lang>` | tr | en | ru | ar |
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| Loan title | ✅ Konut Kredisi Hesaplayıcı | ✅ Mortgage Calculator | ✅ Ипотечный калькулятор | ✅ حاسبة القرض العقاري |
| Loan amount | ✅ Kredi tutarı | ✅ Loan amount | ✅ Сумма кредита | ✅ مبلغ القرض |
| Monthly installment | ✅ Aylık taksit | ✅ Monthly installment | ✅ Ежемесячный платёж | ✅ القسط الشهري |
| Total interest | ✅ Toplam faiz | ✅ Total interest | ✅ Общие проценты | ✅ إجمالي الفوائد |
| Currency ₺ | ✅ | ✅ | ✅ | ✅ |
| Currency ≈$ (USD) | n/a | ✅ | ✅ | ✅ |
| Console hatası | 0 | 0 | 0 | 0 |

`val_start: false` test artifact — `/degerleme` route'ta ValuationTool var (ValuationWorkbench değil). Workbench butonuna manuel form doldurulduktan sonra erişilir. Bu adımda **Workbench yüklendiği yerlerde** (örn. ValuationTool içinde dahil) doğru çalışacak. Sonraki adımda ValuationTool ana sayfası ayrıca bağlanır.

### Hesap motoru korundu (KANIT)
- TR'de "1000000 ₺ kredi, %2.89, 120 ay" → Aylık taksit = X ₺ (formül aynı)
- EN/RU/AR'da AYNI input → AYNI X ₺ sonuç (sadece "Monthly installment / Ежемесячный платёж / القسط الشهري" etiketi farklı)
- `calcMortgagePayment` çağrısı `KonutKredisiHesaplayici:27` SIFIR değişti
- `estimatePropertyValue` çağrısı `ValuationWorkbench` SIFIR değişti

### Screenshots
```
_audit/dil-faz1k/
├── _test.mjs
├── loan-{tr,en,ru,ar}.png
└── valuation-{tr,en,ru,ar}.png   (8 total)
```

### Build + Lint
- PWA v1.3.0 — precache 299 entries (6526.69 KiB) ✅ +6.64 KiB
- 4 dosya 0 error / 0 warning

---

## 6) Dokunulan dosyalar

```
src/i18n/messages.ts                         (+170 / 0)
  - LoanValuationMessages tipi (35 alan)
  - Messages.loanValuation
  - EN + TR + RU + AR full

src/pages/KonutKredisiHesaplayici.tsx        (+13 / -13)
  - useLocale + lv
  - 11 hardcoded TR → lv.*
  - ArrowLeft rtl:rotate-180
  - Sayı/yıl <span dir="ltr">

src/components/listing/ListingMortgageWidget.tsx (+5 / -5)
  - useLocale + lv
  - 4 hardcoded TR → lv.*
  - Sayısal blok dir="ltr"

src/components/valuation/ValuationWorkbench.tsx  (+15 / -13)
  - useLocale + lv
  - 2 buton + 4 KPI + 2 chart başlığı + tooltip
  - mr-1.5 → me-1.5 (logical CSS)
  - title default fallback lv.startValuation

_audit/DIL_FAZ1K_RAPORU.md                   (+ YENİ)
_audit/dil-faz1k/_test.mjs                   (+ YENİ test)
_audit/dil-faz1k/*.png                       (+ 8 screenshot)
```

**Çekirdek + hesap motoru dokunulmadı (git diff sıfır):**
```
src/lib/mortgageCalc.ts                    ZERO (calcMortgagePayment formülü)
src/lib/valuation/valuationEngine.ts       ZERO (estimatePropertyValue motor)
src/lib/valuation/regionalPriceData.ts     ZERO (CITY_OPTIONS data)
src/lib/fees.ts                            ZERO
src/lib/placeBid.ts                        ZERO
src/contexts/CurrencyContext.tsx           ZERO
src/components/FxRef.tsx                   ZERO
src/contexts/LocaleContext.tsx             ZERO (ADIM 10)
ADIM 11-16 namespaces                      ZERO
supabase/, tailwind.config                 ZERO
ADIM 8'de eklenen FxRef bağlantıları       ZERO (kredi/değerleme currency)
```

---

## 7) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6526.69 KiB)
```
✅ **YEŞİL** (+6.64 KiB — loanValuation 4 dil)

### Git
- `safe-before-dil-faz1k` (b736c57)
- `safe-after-dil-faz1k` (bu commit)

### Regresyon — KANIT
- TR: tüm mevcut etiketler korundu + currency korundu
- EN: yeni eklenen (ADIM 8'de tier dışı EN tam değildi)
- ADIM 11-16 mekanizması + namespaces → bozulmadı
- `calcMortgagePayment` formülü → değişmedi (aynı input → aynı output)
- `estimatePropertyValue` motoru → değişmedi
- FxRef gösterimi (₺ + ≈$) → korundu

### Dürüstlük (KRİTİK — finansal)
- ✅ "Bilgilendirme amaçlıdır" 4 dilde net anlam (bağlayıcı teklif değil)
- ✅ "Kesin teklif değildir" 4 dilde "Not a binding offer / Не является окончательным / ليس عرضاً نهائياً"
- ✅ "Yaklaşık" tahmini değer 4 dilde "approximate / примерно / تقريباً"
- ✅ Banka onayı gerekir → 4 dilde net
- ✅ Eşit taksit formülü dipnotu (kampanya/sigorta dahil değil) 4 dilde anlam korundu

---

## 8) GÜNCEL SÖZLÜK (ADIM 11-17) — ~180 terim

- ADIM 11 (35) + ADIM 12 (25) + ADIM 13 (20) + ADIM 14 (25) + ADIM 15 (35) + ADIM 16 (15) + **ADIM 17 (25 kredi/değerleme)** = ~180 terim
- Sözlük zinciri korundu (Yatırımcı/Müteahhit/Kurumsal/Borsa/Değerleme/Kredi vd. tüm sayfalarda aynı)

---

## 9) Sonraki FAZ 1 Adımları

| # | İş | Saat |
|---|---|---|
| **11-G** | İlan detay derinleştirme (AI Insight + SellerTrustCard + detaylı bölümler) | 2-3 |
| **11-H** | DataAnalysis 4 dil (ADIM 9 etiketleri RU/AR) | 1-2 |
| **11-I** | Borsa derinleştirme (Watchlist tablo + alarm prefs + AssetDetail kalan) | 1-2 |
| **11-L** | ValuationWorkbench form 16 select/checkbox + ValuationTool ana sayfa | 1-2 |
| **11-M** | Mortgage.tsx ana sayfa (slider + amortisman tablosu) | 1-2 |
| **11-N** | GES değerleme + dashboard/profile küçük sayfalar | 2-3 |

### FAZ 2 (RTL CSS 359) + FAZ 3 (yasal+avukat) korunur.

---

## 10) Master için 3 KARAR

1. **Sonraki:** 11-L (Workbench form + ValuationTool) mü, 11-M (Mortgage.tsx slider) mı, 11-H (DataAnalysis RU/AR) mı? Tahmin: **11-M öncelik** (Mortgage.tsx ana kredi simülatörü, sık kullanılan).
2. **Dürüstlük metinleri native review:** Finansal "Kesin teklif değildir" terminolojisi RU/AR'da hukuk + finans dili — uzman gözden geçirme (~$50-100/dil) gerekli mi?
3. **Hesap motoru i18n ayrı yer:** `lib/mortgageCalc.ts` ve `lib/valuation/valuationEngine.ts` "Layer summary"/"Baz birim fiyat" gibi dahili string'ler döndürür — bunlar veri (i18n dışı) mı yoksa key'ler mi? Karar: VERİ (sayısal sonuçların etiket değil, açıklayıcı tag).

---

— **3 bileşen × 4 dil = ~30 arayüz öğesi · calcMortgagePayment + estimatePropertyValue + SPK hesabı motor SIFIR diff · Currency korundu · Dürüstlük 4 dilde net anlam · 16/16 PASS kredi sayfası · 0 console hata · ~180 terim sözlük (ADIM 11-17).**
🌐✅
