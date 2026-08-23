# 🌐 ADIM 18 — Çok Dil FAZ 1-M: Mortgage Ana Simülatör Çevirisi

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dil-faz1m`
**Doktrin:** DAR + derin. SADECE arayüz (slider/select label + ResultCard etiketleri + grafik/tablo başlıkları + ipuçları + dürüstlük). `calcMortgagePayment` motor + slider mantığı DOKUNULMADI. ADIM 17 ortak terimleri **AYNI çeviri** (tutarlılık zinciri).

---

## ⚡ TEK-CÜMLELİK ÖZET

`Mortgage.tsx` (279 satır) — ADIM 8'de currency bağlanmış ana kredi simülatörü — arayüzünde **~35 görünür öğe** 4 dilde çevrildi (H1 + altyazı + 4 slider/select label + Banka Gereksinimleri + 4 ResultCard + ödeme planı grafiği + yıllık özet tablosu 5 sütun + 2 ipucu + dürüstlük); **`calcMortgagePayment` formülü + slider mantığı + INTEREST_RATES sabitleri SIFIR değişiklik**; **Currency (₺+≈$ ADIM 8) korundu**; **ADIM 17 kredi terimleri TUTARLI** ("Aylık taksit"/"Toplam Faiz"/"Toplam geri ödeme"/"Kredi Tutarı" = `lv.*` AYNI key); `MortgageMessages` 35 alanlı yeni tip; **4 dil × 7 string = 28/28 PASS + KonutKredisi-Mortgage tutarlılık 4/4 PASS + 0 console hata, AR dir=rtl**.

---

## 1) BLOK 1 — Envanter (ADIM 17 ortak terimleri işaretle)

### ✅ Çevrilen — Mortgage özgü yeni terimler (`mortgage.*` namespace, 35 alan)
- Sayfa: H1 (Mortgage/Kredi Hesaplayıcı) + altyazı
- Slider/select label (4): Gayrimenkul Değeri, Peşinat Oranı, Vade (+ 7 option), Faiz Oranı (Yıllık)
- Slider altı küçük text: Peşinat: TRY X + Kredi: TRY X
- Banka Gereksinimleri kart: title + 3 row (Min. Aylık Gelir, Peşinat Oranı, Kredi/Tapu Oranı) + "Min" / "Max"
- ResultCard 4 sub-text: "Düzgün ödeme", "X% maliyet", "X yıl", "X% peşinat"
- Grafik: "Ödeme Planı — Kalan Borç Grafiği" + tickFormatter ay suffix + Legend "Kalan Borç" / "Toplam Faiz"
- Tablo: "Yıllık Ödeme Özeti" + "Her yıl sonu" + 5 sütun başlığı + "{n}. Yıl" prefix
- 2 ipucu: "Düşük Faiz İpuçları" + "Peşinat Artırma" + 2 desc
- Dürüstlük: "* Bu hesaplama bilgilendirme amaçlıdır. Gerçek kredi koşulları..."

### ✅ ADIM 17'den ortak terimler (`lv.*` AYNI key — tutarlılık)

| Öğe | Mortgage.tsx (ADIM 18) | ADIM 17 KonutKredisi |
|---|---|---|
| **Geri butonu** | `lv.back` | `lv.back` ✅ AYNI |
| **Aylık taksit** | `lv.monthlyInstallment` (ResultCard label + tablo sütun) | `lv.monthlyInstallment` ✅ AYNI |
| **Toplam Faiz** | `lv.totalInterest` (ResultCard label) | `lv.totalInterest` ✅ AYNI |
| **Toplam geri ödeme** | `lv.totalRepayment` (ResultCard label) | `lv.totalRepayment` ✅ AYNI |
| **Kredi Tutarı** | `lv.loanAmountField` (ResultCard label) | `lv.loanAmountField` ✅ AYNI |

**KANIT (Playwright):** `kkh_monthly_consistent: true` **4/4 dilde** — KonutKredisi sayfasında AYNI "Aylık taksit / Monthly installment / Ежемесячный платёж / القسط الشهري" çevirisi render edildi.

### ❌ Çevrilmedi — Hesap/sayı (DOKUNULMADI)

| Öğe | Sebep |
|---|---|
| `calcMortgagePayment` (line 30-33) | Hesap motoru (ADIM 17'de korundu, yine sıfır) |
| Slider `min/max/step` (line 93/102/135) | Slider mantığı |
| `INTEREST_RATES` data (line 12-14) | Faiz oranı sabit data |
| `propertyValue`/`downPayment`/`loanAmount`/`monthlyPayment`/`totalInterest`/`totalPayment` | Hesaplanmış sayısal değerler |
| `amortizationData` array | Hesap motorunun ürettiği veri |
| FxRef ₺+≈$ gösterimi | ADIM 8'de bağlı (dokunulmadı) |

---

## 2) BLOK 2 — Sözlük Genişletme (~30 yeni terim)

### Bu adımda eklenen Mortgage-özgü terimler

| Türkçe | İngilizce | Rusça | Arapça |
|---|---|---|---|
| Mortgage / Kredi Hesaplayıcı | Mortgage / Loan Calculator | Ипотека / Кредитный калькулятор | قرض عقاري / حاسبة القرض |
| Kredi Parametreleri | Loan Parameters | Параметры кредита | معاملات القرض |
| Gayrimenkul Değeri | Property Value | Стоимость недвижимости | قيمة العقار |
| Peşinat Oranı | Down Payment Rate | Размер первоначального взноса | نسبة الدفعة الأولى |
| Faiz Oranı (Yıllık) | Annual Interest Rate | Годовая процентная ставка | معدل الفائدة السنوي |
| Banka Gereksinimleri | Bank Requirements | Требования банка | متطلبات البنك |
| Min. Aylık Gelir | Min. Monthly Income | Мин. ежемесячный доход | الحد الأدنى للدخل الشهري |
| Kredi/Tapu Oranı | Loan-to-Value Ratio | Соотношение кредита к стоимости | نسبة القرض إلى القيمة |
| Kredi Özeti | Loan Summary | Сводка по кредиту | ملخص القرض |
| Düzgün ödeme | Even payment | Равный платёж | قسط متساوٍ |
| maliyet | of cost | от стоимости | من التكلفة |
| Ödeme Planı — Kalan Borç Grafiği | Payment Plan — Remaining Debt Chart | График платежей — Остаток долга | جدول السداد — الدين المتبقي |
| Kalan Borç | Remaining Debt | Остаток долга | الدين المتبقي |
| Yıllık Ödeme Özeti | Yearly Payment Summary | Сводка платежей по годам | ملخص السداد السنوي |
| Her yıl sonu | End of each year | Конец каждого года | نهاية كل سنة |
| Anapara | Principal | Основной долг | أصل الدين |
| Düşük Faiz İpuçları | Low Interest Tips | Советы по снижению процентов | نصائح لخفض الفوائد |
| Peşinat Artırma | Increase Down Payment | Увеличение первоначального взноса | زيادة الدفعة الأولى |

### [REVIEW]
**Hiçbir [REVIEW] gerekmedi.** Tüm çeviriler bankacılık/finans terminolojisi standardı.

---

## 3) BLOK 3 — Uygulama

### 3.1 `messages.ts` — `mortgage` namespace
```ts
export type MortgageMessages = {
  title, subtitle, loanParameters,
  propertyValueLabel, downPaymentPercent, downPaymentValue, loanValue,
  termSelect, yearShort, monthShort, annualRate,
  bankRequirements, minMonthlyIncome, minLabel, maxLabel, loanToValueRatio,
  loanSummary, subEvenPay, subOfCost,
  paymentPlanGraphTitle, monthSuffix, remainingDebt, totalInterestLegend,
  yearlyPaymentSummary, everyYearEnd, yearColumn, principalColumn,
  interestColumn, remainingColumn, yearRowPrefix,
  tipLowInterestTitle, tipLowInterestDesc, tipDownPaymentTitle, tipDownPaymentDesc,
  disclaimer  // 35 alan
};
// Messages.mortgage + EN/TR/RU/AR override
```

### 3.2 `Mortgage.tsx` — bağlama
- `useLocale + m = t.mortgage + lv = t.loanValuation` (ADIM 17 ortak için)
- H1 + altyazı + Banka kart başlık + 4 slider label + 4 ResultCard label + 4 sub + grafik + tablo 5 sütun + 2 ipucu + dürüstlük (toplam ~35 yer)
- **ResultCard `label` prop'una `lv.*` (ADIM 17 ortak terimleri)** — tutarlılık zinciri:
  - `label={lv.monthlyInstallment}` (was "Aylik Taksit")
  - `label={lv.totalInterest}` (was "Toplam Faiz")
  - `label={lv.totalRepayment}` (was "Toplam Odeme")
  - `label={lv.loanAmountField}` (was "Kredi Tutari")
- Grafik `<Area name={m.remainingDebt}>` / `<Area name={m.totalInterestLegend}>`
- Tooltip formatter `if (name === m.remainingDebt) ...` (string match güncelliği)
- Tablo: `text-left` → `text-start`, `text-right` → `text-end`, satır td'lere `dir="ltr"` (TRY tutar BiDi)
- Sayısal/% gösterimi `<span dir="ltr">` (faiz/peşinat/TRY)
- ArrowLeft `rtl:rotate-180`
- "20% / 80%" Min/Max kısaltma sözlüğü ile birleştirildi

### 3.3 Hesap motoru DOKUNULMADI
- `calcMortgagePayment` formülü (useMemo line 30-33) → SIFIR
- Slider min/max/step → SIFIR
- `INTEREST_RATES` sabit → SIFIR
- `amortizationData` döngüsü → SIFIR
- Sonuç sayıları (`monthlyPayment`/`totalInterest`/...) → render edildiği gibi
- FxRef gösterimi (ADIM 8) → korundu

---

## 4) BLOK 4 — RTL + BiDi (AR slider'lı simülatör)

### Doğrulama
- ✅ `<html dir="rtl">` set
- ✅ Slider'lar AR'da görsel sağdan akar (Tailwind logical + browser native), DEĞER doğru
- ✅ ResultCard değerleri `dir="ltr"` (TRY tutar BiDi)
- ✅ Slider label sağ kısmı (% / TRY) `<span dir="ltr">` (sayı LTR)
- ✅ Vade select `dir="ltr"` (sayı + "Yıl" + "(Ay)" karışım)
- ✅ Tablo satırı td'leri `dir="ltr"` (TRY tutar + yıl)
- ✅ ArrowLeft `rtl:rotate-180` (geri butonu)
- ✅ `text-left` → `text-start`, `text-right` → `text-end` (tablo başlık + hücre)
- ✅ Faiz oranı `dir="ltr"` ({interestRate}%)
- ✅ Min/Max "20%/80%" sayı LTR
- ✅ Noto Sans Arabic font yüklü
- ✅ Grafik (recharts) eksen + tooltip LTR (sayı + ay suffix)

### Logical CSS değişikliği
- `text-left` (1 yer) → `text-start`
- `text-right` (4 yer — tablo) → `text-end`
- `<ArrowLeft>` → `rtl:rotate-180`

---

## 5) BLOK 5 — Test (4 dil × 7 string + tutarlılık + currency)

```json
{
  "tr": {http_mortgage: 200, http_kkh: 200, lang: "tr", dir: "ltr",
         mort_title: ✅ Mortgage / Kredi Hesaplayıcı, mort_params: ✅ Kredi Parametreleri,
         mort_banka: ✅ Banka Gereksinimleri, mort_summary: ✅ Kredi Özeti,
         mort_monthly: ✅ Aylık taksit, mort_tip_low: ✅ Düşük Faiz İpuçları,
         kkh_monthly_consistent: ✅ AYNI çeviri KonutKredisi'nde de var,
         has_try: ✅, errs: []},
  "en": {... Mortgage / Loan Calculator + Loan Parameters + Bank Requirements + Loan Summary
         + Monthly installment (AYNI ADIM 17) + Low Interest Tips, kkh_consistent: ✅ ...},
  "ru": {... Ипотека / Кредитный калькулятор + Параметры кредита + Требования банка + Сводка по кредиту
         + Ежемесячный платёж (AYNI) + Советы по снижению процентов, kkh_consistent: ✅ ...},
  "ar": {dir: "rtl", قرض عقاري + معاملات القرض + متطلبات البنك + ملخص القرض + القسط الشهري (AYNI) + نصائح لخفض الفوائد, kkh_consistent: ✅}
}
```

### Test matrisi — Mortgage **28/28 PASS** + Tutarlılık **4/4 PASS**

| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html lang>` | tr | en | ru | ar |
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| Mortgage title | ✅ | ✅ | ✅ | ✅ |
| Kredi Parametreleri | ✅ | ✅ Loan Parameters | ✅ Параметры кредита | ✅ معاملات القرض |
| Banka Gereksinimleri | ✅ | ✅ Bank Requirements | ✅ Требования банка | ✅ متطلبات البنك |
| Kredi Özeti | ✅ | ✅ Loan Summary | ✅ Сводка по кредиту | ✅ ملخص القرض |
| **Aylık taksit (lv.* ortak)** | ✅ | ✅ Monthly installment | ✅ Ежемесячный платёж | ✅ القسط الشهري |
| Düşük Faiz İpuçları | ✅ | ✅ Low Interest Tips | ✅ Советы по снижению | ✅ نصائح لخفض الفوائد |
| **KonutKredisi tutarlılık** (Aylık taksit AYNI) | ✅ AYNI | ✅ AYNI | ✅ AYNI | ✅ AYNI |
| Currency ₺ | ✅ | ✅ | ✅ | ✅ |
| Currency ≈$ (USD) | n/a | ✅ | ✅ | ✅ |
| Console hatası | 0 | 0 | 0 | 0 |

**Tutarlılık kanıtı:** ADIM 17'de KonutKredisi'nde "Ежемесячный платёж" → ADIM 18'de Mortgage'da "Ежемесячный платёж" (4 dilde de AYNI key `lv.monthlyInstallment` — değiştirilemez tutarlılık).

### Hesap motoru korundu (KANIT)
- `calcMortgagePayment` formülü (useMemo line 30-33) — DOKUNULMADI
- Aynı input (propertyValue=5M, downPayment=20%, term=120, rate=4.79%) → 4 dilde aynı sonuç
- Slider min/max/step — DOKUNULMADI
- INTEREST_RATES sabitler — DOKUNULMADI

### Screenshots
```
_audit/dil-faz1m/
├── _test.mjs
└── mortgage-{tr,en,ru,ar}.png   (4 dil × Mortgage simülatör)
```

### Build + Lint
- PWA v1.3.0 — precache 299 entries (6534.00 KiB) ✅ +7.31 KiB
- 2 dosya 0 error / 0 warning

---

## 6) Dokunulan dosyalar

```
src/i18n/messages.ts                  (+170 / 0)
  - MortgageMessages tipi (35 alan)
  - Messages.mortgage
  - EN + TR + RU + AR full

src/pages/Mortgage.tsx                (+38 / -36)
  - useLocale + m + lv (ADIM 17 ortak)
  - ~35 hardcoded TR → m.* / lv.*
  - ResultCard label'lar lv.* (tutarlılık)
  - Grafik name + tooltip formatter sözlük güncel
  - Tablo logical CSS (text-start/end)
  - dir="ltr" sayısal değerler + Vade select
  - ArrowLeft rtl:rotate-180

_audit/DIL_FAZ1M_RAPORU.md            (+ YENİ)
_audit/dil-faz1m/_test.mjs            (+ YENİ test)
_audit/dil-faz1m/*.png                (+ 4 screenshot)
```

**Çekirdek + hesap motoru dokunulmadı (git diff sıfır):**
```
src/lib/mortgageCalc.ts                ZERO (KonutKredisi ADIM 17 ile aynı)
calcMortgagePayment formülü (Mortgage.tsx içinde)   ZERO (useMemo line 30-33)
Slider min/max/step                                  ZERO
INTEREST_RATES sabit                                ZERO
amortizationData döngüsü                            ZERO
src/lib/valuation/, fees.ts, placeBidRpc            ZERO
RLS, auth, payments, edge function                  ZERO
CurrencyContext + FxRef gosterimi + useCurrency     ZERO
LocaleContext (ADIM 10), ADIM 11-17 namespaces      ZERO
ADIM 8'de eklenen FxRef bağlanma                    ZERO
ADIM 17 KonutKredisi (Mortgage'da lv.* tutarlı kullanım) ZERO  - rota DEĞİŞMEDİ
supabase/, tailwind.config                          ZERO
```

---

## 7) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6534.00 KiB)
```
✅ **YEŞİL** (+7.31 KiB — mortgage 4 dil)

### Git
- `safe-before-dil-faz1m` (a3226a5)
- `safe-after-dil-faz1m` (bu commit)

### Regresyon — KANIT
- TR: tüm Mortgage etiketleri korundu + currency korundu + hesap çalışıyor
- EN: yeni eklenen tam EN (önceden Mortgage TR sabit fallback)
- ADIM 11-17 namespaces → bozulmadı
- `calcMortgagePayment` formülü → değişmedi (aynı input → aynı output)
- FxRef gösterimi (₺ + ≈$) → korundu

### Dürüstlük (KRİTİK — finansal)
- ✅ "Bu hesaplama bilgilendirme amaçlıdır" 4 dilde anlam korundu (ADIM 17 ile aynı)
- ✅ "Gerçek kredi koşulları bankaya göre değişiklik gösterebilir" → 4 dilde net
- ✅ Hiçbir yanıltıcı garanti/söz yok
- ✅ "Düşük Faiz İpuçları" + "Peşinat Artırma" → eğitici bilgi (pazarlama değil)

### Tutarlılık (KRİTİK — sözlük zinciri)
- ✅ **Aylık taksit** 4 dilde: TR "Aylık taksit" / EN "Monthly installment" / RU "Ежемесячный платёж" / AR "القسط الشهري" — KonutKredisi + Mortgage **AYNI**
- ✅ Aynı key (`lv.monthlyInstallment`) kullanıldı — değiştirilemez tutarlılık
- ✅ Toplam Faiz + Toplam Geri Ödeme + Kredi Tutarı + Vade hep AYNI çeviri

---

## 8) GÜNCEL SÖZLÜK (ADIM 11-18) — ~210 terim

- ADIM 11-17 = 180
- **ADIM 18 (Mortgage özgü 30 terim)** = +30
- **Toplam ~210 terim**, sözlük zinciri 4 dilde tutarlı

---

## 9) Sonraki FAZ 1 Adımları

| # | İş | Saat |
|---|---|---|
| **11-L** | ValuationWorkbench form 16 select/checkbox + ValuationTool ana sayfa | 1-2 |
| **11-H** | DataAnalysis 4 dil (ADIM 9 etiketleri RU/AR) | 1-2 |
| **11-G** | İlan detay derinleştirme (AI Insight + SellerTrustCard) | 2-3 |
| **11-I** | Borsa derinleştirme (Watchlist tablo + alarm prefs) | 1-2 |
| **11-N** | GES değerleme + dashboard/profile küçük sayfalar | 2-3 |

### FAZ 2 (RTL CSS 359) + FAZ 3 (yasal+avukat) korunur.

---

## 10) Master için 3 KARAR

1. **Sonraki:** 11-L (Workbench form) mü, 11-H (DataAnalysis tamamla) mı, 11-N (GES+dashboard kalan) mı?
2. **Vade option:** "1 Yıl (12 Ay)" formatı 4 dilde çevrildi (yearShort+monthShort interp). RU "1 год (12 мес)" / AR "1 سنة (12 شهر)" — Arapça gramer için "1 سنة" vs "2 سنوات" varyantı olabilir. Şu an her dilde tek-form (DAR). [REVIEW] ileride çoğul.
3. **Native review:** "Düşük Faiz İpuçları"/"Peşinat Artırma" finans-eğitim metinleri RU/AR uzman review (~$50/dil)?

---

— **Mortgage ana simülatör 35 arayüz öğesi 4 dilde · calcMortgagePayment + slider + INTEREST_RATES motor SIFIR diff · ADIM 17 ortak kredi terimleri TUTARLI (lv.* aynı key, 4 dilde Aylık taksit/Toplam Faiz/Kredi Tutarı AYNI) · Currency korundu · 28/28 + tutarlılık 4/4 PASS · 0 console hata · 210 terim sözlük (ADIM 11-18) · Kredi konusu TAMAMLANDI.**
🌐✅
