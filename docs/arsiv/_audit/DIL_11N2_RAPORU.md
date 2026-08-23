# 🌐 ADIM 11-N-2 — InvestorDashboard Çevirisi

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dil-11n2`
**Doktrin:** DAR + derin. SADECE InvestorDashboard. `useFavorites` + `loadAllAuctionsForSearch` RPC + recharts veri DOKUNULMADI. ADIM 12/13/14 + 11-N FlowDashboard ile TUTARLI.

---

## ⚡ TEK-CÜMLELİK ÖZET

`InvestorDashboard.tsx` (275 satır) — 11-N'de bölünüp ertelenen Dashboard parçası — **~30 görünür arayüz öğesi** (badge + başlık + 4 KPI + 3 ChartPanel + 2 bar legend + EmptyState + section + 3 kart KPI + 6 ay kısaltması) 4 dilde çevrildi; **`useFavorites` + `loadAllAuctionsForSearch` + `withListingDefaults` + recharts veri mantığı SIFIR değişiklik**; **Currency (₺ KPI gösterimi) korundu** (`dir="ltr"`); `InvestorDashboardMessages` 30 alanlı yeni tip; **4 dil × 4 string = 16/16 PASS, 0 console hata, AR dir=rtl**; "Yatırımcı"/"Portföy" terimleri ADIM 15/14 ile TUTARLI.

---

## 1) BLOK 1 — Envanter + KAPSAM

### KAPSAM: TEK ADIM (bölme gerekmedi)
**Tahmin ~40 idi, gerçek ~30 görünür + 6 ay = 36 string** → <50, yönetilebilir tek adım. Bölme gerekmedi.

### ✅ Çevrilen (30 öğe)
| Konum | Öğe |
|---|---|
| DashboardShell | badge "Yatırımcı" + title "Yatırımcı paneli" + subtitle + back "Panele dön" + actions "Piyasa analizi" |
| LoadingState | "Portföy yükleniyor…" |
| EmptyState | title "Portföyünüz boş" + desc + cta "İlanları keşfet" |
| 4 MetricCard | Portföy değeri (+hint "{n} ilan") / Tahmini değer / Ort. getiri (+hint "Yıllık kira") / Potansiyel (+hint "Tahmini fark") |
| 3 ChartPanel | "Portföy değer artışı"+"Son 6 ay (tahmini)" / "Kategori dağılımı"+"Milyon ₺" / "Getiri ve AI skoru"+"İlçe bazlı" |
| 2 Bar legend | "Kira %" / "AI skor" |
| section | "Portföy ilanları" |
| 3 kart KPI | "Mevcut" / "Tahmini" / "Getiri" |
| 6 ay kısaltması | Haz/Tem/Ağu/Eyl/Eki/Kas (grafik X-axis) |

### ❌ Çevrilmedi — Veri/Hesap (DOKUNULMADI)
| Öğe | Sebep |
|---|---|
| `auction.title` / `auction.location` / `auction.district` | Kullanıcı içeriği / coğrafi |
| `auction.category` (pie name) | Veri kategorisi |
| KPI sayısal değerler (₺M / %) | Hesaplanmış |
| recharts `dataKey` (value/yield/score/month) | Veri anahtarı |
| `useFavorites` / `loadAllAuctionsForSearch` | RPC veri çekme |
| `CHART_COLORS` / chart stilleri | Görsel sabit |

---

## 2) BLOK 2 — Sözlük Uyum

### Ortak terimler (ZORUNLU aynı — kontrol edildi)
| Terim | Kaynak | Bu adım |
|---|---|---|
| Yatırımcı (badge) | ADIM 15 megaMenu.segmentInvestor (Инвестор/مستثمر) | AYNI çeviri ✅ |
| Yatırımcı paneli (title) | ADIM 15 megaMenu.investorPanel (Панель инвестора/لوحة المستثمر) | AYNI çeviri ✅ |
| Portföy | ADIM 14 borsa.portfolioTitle (портфель/المحفظة) | AYNI kök ✅ |
| Favoriler (empty/desc) | ADIM 13 (Избранное/المفضلة) | empty desc'te kullanım AYNI ✅ |
| Keşfet (cta) | ADIM 11 onboarding.discover (исследовать/استكشاف) | "Explore listings" tutarlı ✅ |

### Yeni terimler (bu adım, 4 dil)
| Türkçe | İngilizce | Rusça | Arapça |
|---|---|---|---|
| Portföy değeri | Portfolio value | Стоимость портфеля | قيمة المحفظة |
| Tahmini değer | Predicted value | Прогнозная стоимость | القيمة المتوقعة |
| Ort. getiri | Avg. yield | Сред. доходность | متوسط العائد |
| Yıllık kira | Annual rent | Годовая аренда | إيجار سنوي |
| Potansiyel | Potential | Потенциал | الإمكانية |
| Portföy değer artışı | Portfolio value growth | Рост стоимости портфеля | نمو قيمة المحفظة |
| Kategori dağılımı | Category distribution | Распределение по категориям | التوزيع حسب الفئة |
| Getiri ve AI skoru | Yield and AI score | Доходность и ИИ-оценка | العائد ودرجة الذكاء الاصطناعي |
| Kira % / AI skor | Rent % / AI score | Аренда % / ИИ-оценка | إيجار % / درجة AI |
| Portföy ilanları | Portfolio listings | Объявления портфеля | إعلانات المحفظة |
| Mevcut / Tahmini / Getiri | Current / Predicted / Yield | Текущая / Прогноз / Доходность | الحالي / متوقع / العائد |
| Panele dön | Back to panel | Назад к панели | العودة إلى اللوحة |
| Piyasa analizi | Market analysis | Анализ рынка | تحليل السوق |
| Ay kısaltmaları | Jun-Nov | Июн-Ноя | يونيو-نوفمبر |

### [REVIEW]
**Hiçbir [REVIEW] gerekmedi.** Standart portföy/finans terimleri.

---

## 3) BLOK 3 — Uygulama

### 3.1 `messages.ts` — `investorDashboard` namespace (30 alan)
```ts
export type InvestorDashboardMessages = {
  badge, title, subtitle, back, marketAnalysis, loading,
  emptyTitle, emptyDesc, emptyCta,
  kpiPortfolioValue, kpiListingsHint, kpiPredictedValue,
  kpiAvgYield, kpiAvgYieldHint, kpiPotential, kpiPotentialHint,
  chartGrowthTitle, chartGrowthSubtitle, chartCategoryTitle, chartCategorySubtitle,
  chartYieldTitle, chartYieldSubtitle, barRentPct, barAiScore,
  portfolioListings, cardCurrent, cardPredicted, cardYield,
  months: string[]
};
// Messages.investorDashboard + EN/TR/RU/AR
```

### 3.2 `InvestorDashboard.tsx`
- `useLocale + iv = t.investorDashboard`
- `months` array → `iv.months` (useMemo dep'e eklendi)
- DashboardShell props (badge/title/subtitle/back/actions)
- LoadingState + EmptyState (title/desc/cta)
- 4 MetricCard (label + hint)
- 3 ChartPanel (title + subtitle) + 2 Bar name
- section başlık + 3 kart KPI
- KPI değerlerine `dir="ltr"` (₺M / % BiDi)
- ArrowLeft `rtl:rotate-180`

### 3.3 Çekirdek DOKUNULMADI
- `useFavorites` (favorites/loading/syncError) → SIFIR
- `loadAllAuctionsForSearch` + `getLocalAndStaticAuctions` → SIFIR
- `withListingDefaults` → SIFIR
- Portfolio hesapları (portfolioValue/predictedValue/avgYield/potentialGain) → SIFIR
- recharts veri (yieldData/pieData/priceHistory) → SIFIR (sadece months etiketi i18n)

---

## 4) BLOK 4 — RTL + BiDi (AR)

### Doğrulama
- ✅ `<html dir="rtl">` set
- ✅ DashboardShell + KPI grid (grid-cols-2/4) AR'da sağdan akar
- ✅ KPI değerleri `dir="ltr"` (₺1.5M / %5.2)
- ✅ 3 kart KPI (Mevcut/Tahmini/Getiri) değerleri `dir="ltr"`
- ✅ recharts grafik dark + legend Arapça (SVG)
- ✅ ArrowLeft `rtl:rotate-180`
- ✅ Noto Sans Arabic font
- ✅ Ay kısaltmaları AR (يونيو/يوليو) grafik X-axis

### Logical CSS
- KPI değer + kart KPI `dir="ltr"` (6 yer)
- ArrowLeft `rtl:rotate-180`
- Yeni physical class EKLENMEDİ

---

## 5) BLOK 5 — Test (4 dil × 4 string)

```json
{
  "tr": {http: 200, lang: "tr", dir: "ltr", title: ✅ Yatırımcı paneli, back: ✅ Panele dön,
         market: ✅ Piyasa analizi, empty_or_kpi: ✅, errs: []},
  "en": {... Investor panel + Back to panel + Market analysis + (empty/kpi) ...},
  "ru": {... Панель инвестора + Назад к панели + Анализ рынка + (empty/kpi) ...},
  "ar": {dir: "rtl", لوحة المستثمر + العودة إلى اللوحة + تحليل السوق + (empty/kpi)}
}
```

### Test matrisi — 16/16 PASS

| Test | TR | EN | RU | AR |
|---|---|---|---|---|
| `<html lang>` | tr | en | ru | ar |
| `<html dir>` | ltr | ltr | ltr | **rtl ✅** |
| Title (Yatırımcı paneli) | ✅ | ✅ Investor panel | ✅ Панель инвестора | ✅ لوحة المستثمر |
| Back (Panele dön) | ✅ | ✅ Back to panel | ✅ Назад к панели | ✅ العودة إلى اللوحة |
| Market analysis | ✅ | ✅ | ✅ Анализ рынка | ✅ تحليل السوق |
| Empty/KPI (durum) | ✅ | ✅ | ✅ | ✅ |
| Console hatası | 0 | 0 | 0 | 0 |

**Anchor seçimi:** title (DashboardShell) + back (nav) + market (action) her durumda görünür; empty_or_kpi favori durumuna göre EmptyState ("Portföyünüz boş") veya KPI ("Portföy değeri") — ikisi de çevrildi, biri görünür → PASS.

### RPC korundu (KANIT)
- `useFavorites` + `loadAllAuctionsForSearch` çağrıları → SIFIR diff
- favori varsa KPI değerleri (portfolioValue) → 4 dilde aynı hesap
- favori yoksa EmptyState → 4 dilde aynı koşul

### Screenshots
```
_audit/dil-11n2/
├── _test.mjs
└── investor-{tr,en,ru,ar}.png   (4 dil)
```

### Build + Lint
- PWA v1.3.0 — precache 299 entries (6560.64 KiB) ✅ +4.94 KiB
- 2 dosya 0 error / 0 warning

---

## 6) Dokunulan dosyalar

```
src/i18n/messages.ts                       (+130 / 0)
  - InvestorDashboardMessages tipi (30 alan)
  - Messages.investorDashboard
  - EN + TR + RU + AR full

src/pages/dashboard/InvestorDashboard.tsx  (+22 / -20)
  - useLocale + iv
  - months → iv.months (useMemo dep)
  - ~30 hardcoded TR → iv.*
  - KPI değer dir="ltr" (6 yer) + ArrowLeft rtl:rotate-180

_audit/DIL_11N2_RAPORU.md                  (+ YENİ)
_audit/dil-11n2/_test.mjs                  (+ YENİ test)
_audit/dil-11n2/*.png                      (+ 4 screenshot)
```

**Çekirdek dokunulmadı (git diff sıfır):**
```
src/hooks/useFavorites.ts                  ZERO
src/lib/auctionsSource.ts                  ZERO (loadAllAuctionsForSearch)
src/lib/listingPolicy.ts                   ZERO (withListingDefaults)
Portfolio hesapları + recharts veri        ZERO
src/components/enterprise/*                 ZERO (DashboardShell/MetricCard/ChartPanel)
placeBidRpc, fees.ts, sealed view, auth, payments  ZERO
CurrencyContext + FxRef                    ZERO
LocaleContext (ADIM 10), ADIM 11-21 namespaces + 11-N dashboard  ZERO
supabase/, tailwind.config                 ZERO
```

---

## 7) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6560.64 KiB)
```
✅ **YEŞİL** (+4.94 KiB)

### Git
- `safe-before-dil-11n2` (75e88aa)
- `safe-after-dil-11n2` (bu commit)

### Regresyon — KANIT
- TR: InvestorDashboard etiketleri korundu + currency KPI render
- EN: yeni eklenen tam EN
- 11-N FlowDashboard + GES → bozulmadı (ayrı namespace)
- ADIM 12/13/14 namespaces → bozulmadı
- `useFavorites` + auctionsSource RPC → değişmedi

### Tutarlılık
- ✅ "Yatırımcı" badge = ADIM 15 segmentInvestor (Инвестор/مستثمر) AYNI
- ✅ "Yatırımcı paneli" = ADIM 15 megaMenu.investorPanel paralel (Панель инвестора/لوحة المستثمر)
- ✅ "Portföy" kök = ADIM 14 borsa (портфель/المحفظة) AYNI
- ✅ "Favoriler/Keşfet" empty state = ADIM 11/13 ile tutarlı

---

## 8) GÜNCEL SÖZLÜK (ADIM 11-21 + 11-N-2) — ~310 terim

- ADIM 11-21 = 295
- **11-N-2 (InvestorDashboard 15 yeni)** = +15
- **Toplam ~310 terim**, 4 dilde tutarlı

---

## 9) Sonraki FAZ 1 Adımları

| # | İş | Saat |
|---|---|---|
| **11-N-3** | Profile.tsx (326 satır, ~45 string) — Dashboard'ı TAM kapat | 1-2 |
| **11-G** | İlan detay derinleştirme (AI Insight + SellerTrustCard) | 2-3 |
| **11-O** | Emlakçı panel + Müteahhit panel | 2-3 |
| **11-P** | Küçük dilimler (ValuationTool sayfa + DataAnalysis dropdown + GES ASPECTS enum) | 1-2 |

### FAZ 2 (RTL CSS 359) + FAZ 3 (yasal+avukat) korunur.

---

## 10) Master için 3 KARAR

1. **Sonraki:** 11-N-3 (Profile — Dashboard'ı tamamla) mı, 11-G (ilan derinleştirme) mi, 11-O (emlakçı+müteahhit panel) mi?
2. **Ay kısaltmaları:** Şu an statik 6 ay (Haz-Kas demo serisi) sözlükte 4 dilde. İdeal `Intl.DateTimeFormat` ile dinamik olurdu — ama bu mock demo serisi (gerçek tarih değil). Statik kalsın mı?
3. **Dashboard durumu:** FlowDashboard (11-N) + InvestorDashboard (11-N-2) tamam. Profile (11-N-3) ile Dashboard tamamen kapanır — hemen mi yoksa başka konuya mı?

---

— **InvestorDashboard ~30 öğe 4 dilde · useFavorites + auctionsSource RPC + recharts veri SIFIR diff · Currency korundu (₺ KPI dir=ltr) · Yatırımcı/Portföy ADIM 14/15 ile TUTARLI · 16/16 PASS · 0 console hata · AR dir=rtl · 310 terim sözlük · KAPSAM bölme gerekmedi (36 string).**
🌐✅
