# 💱 CURRENCY YAYGINLAŞTIRMA — UYGULAMA RAPORU

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-currency-yayginlastir`
**Doktrin:** `fees.ts` mantığı (komisyon %2+%2+KDV ₺ üzerinden) DOKUNULMADI. Çekirdek (placeBid/sealed/RLS/auth/payments) DOKUNULMADI. CurrencyContext **mantığı** dokunulmadı; **kapsamı** genişletildi (App.tsx root).

---

## ⚡ TEK-CÜMLELİK ÖZET

`CurrencyProvider` App.tsx root'una taşındı (önce sadece `InternationalInvestorPage`'de local sarma vardı — diğer sayfalar `useCurrency` çağıramazdı); Navbar'a **`CurrencySelector`** (TRY/USD/EUR/GBP) eklendi; **3 kritik fiyat sayfası** (PricingPage, AddonShopPage, CommissionPage) çoklu kur referansla bağlandı — **ana fiyat ₺, ≈ X$/€ referans + "tahsilat ₺"** dürüst notu; komisyon hesabı ₺ matrah olarak korundu (yasal/muhasebe).

---

## 1) BLOK 1 — ENVANTER (çıkartıldı)

### `formatTry` (sabit ₺) kullanan dosyalar — 23 yer

```
src/components/borsa/BorsaAnalyticsDashboard.tsx
src/components/ges/GesEvaluationForm.tsx
src/components/ibuyer/SubmissionForm.tsx
src/components/ilan/detail/shared.tsx
src/components/listing/ListingMortgageWidget.tsx
src/components/valuation/ValuationWorkbench.tsx
src/lib/mortgageCalc.ts (export formatTry)
src/lib/pricingTiers.ts (export formatTry)
src/lib/valuation/valuationEngine.ts
src/pages/addon/AddonShopPage.tsx                    ← ✅ BU TUR BAĞLANDI
src/pages/BorsaAssetDetailPage.tsx
src/pages/BorsaDataAnalysisPage.tsx
src/pages/BorsaPage.tsx
src/pages/BorsaPortfolioPage.tsx
src/pages/BorsaWatchlistPage.tsx
src/pages/KonutKredisiHesaplayici.tsx
src/pages/payment/CommissionPage.tsx                 ← ✅ BU TUR BAĞLANDI
src/pages/payment/PaymentStartPage.tsx
src/pages/payment/PaymentSuccessPage.tsx
src/pages/portals/EmlakciPanelPage.tsx
src/pages/PricingPage.tsx                            ← ✅ BU TUR BAĞLANDI
src/pages/ValuationTool.tsx
src/sections/PremiumCinematicHome.tsx
```

### Şu turda bağlanan: 3 sayfa + 1 yeni bileşen
### Geri kalan 20 dosya: ayrı dilim (Master onayı sonra) — envanterde

---

## 2) BLOK 2 — KAPSAM GENİŞLETME

### 2.1 — Kritik fix: `CurrencyProvider` App.tsx root'una taşındı

**ÖNCE:** Sadece `InternationalInvestorPage` içinde local `<CurrencyProvider>` sarma. Diğer sayfalardan `useCurrency()` çağrısı **crash**.

**ŞİMDİ:**
```jsx
<LocaleProvider>
  <CurrencyProvider>            {/* ← YENİ root */}
    <AuthProvider>
      <BrowserRouter>...</BrowserRouter>
    </AuthProvider>
  </CurrencyProvider>
</LocaleProvider>
```

→ Artık TÜM sayfalar `useCurrency()` hook'unu kullanabilir.

### 2.2 — `CurrencySelector` bileşeni (Navbar)

`src/components/CurrencySelector.tsx` (yeni, 79 satır):
- Compact mini dropdown — Coins icon + TRY/USD/EUR/GBP
- Hover/focus amber vurgu (60/30/10 disiplini)
- TCMB kaynak + son güncelleme zaman damgası
- **"Tahsilat ₺ — diğer kurlar referans"** dipnot
- Tailwind logical CSS: `text-start`, `end-0`, `rtl:rotate-180`

Navbar'a `<CurrencySelector />` Dil seçicisinin yanına yerleştirildi.

### 2.3 — PricingPage (TierCard)

Kullanıcı kur seçince fiyat kartında:
- **Ana fiyat ₺** (büyük) — `formatTry(early.try ?? listPrice)`
- **Referans satır:** `≈ {formatFromTry(...)} (tahsilat ₺)` (sadece TRY harici kurda)
- Aylık eşdeğer ve "günde ₺X" notu korundu

### 2.4 — AddonShopPage

- Her SKU kartında `formatTry` ana + `≈ {formatFromTry} (tahsilat ₺)` referans
- Sepet toplamı: ₺ ana + altta USD/EUR referans + tahsilat notu

### 2.5 — CommissionPage

**ÖNEMLİ — fees.ts mantığı korundu:**
- `calcCommissionBreakdown(saleTry)` ₺ üzerinden hesaplanır (yasal matrah)
- Komisyon dökümü (satıcı/alıcı/KDV) `formatTry` ile
- USD/EUR seçilince **ek "Referans gösterim" kutusu** açılır:
  ```
  Referans gösterim (USD)
  Satış ≈ $130,890 · Komisyon ≈ $5,236
  Komisyon ₺ üzerinden hesaplanır (yasal matrah);
  diğer kurlar bilgi amaçlıdır.
  ```

---

## 3) BLOK 3 — DÜRÜSTLÜK (kanıtlı)

| Element | Statü |
|---|---|
| **"≈" işareti** çoklu kur değerinde | ✅ Her referans `≈` ile başlıyor |
| **"tahsilat ₺"** notu her referansta | ✅ |
| **"Komisyon ₺ üzerinden hesaplanır (yasal matrah)"** | ✅ CommissionPage'de ek kutu |
| Kur kaynağı (TCMB / Yedek) + tarih | ✅ CurrencySelector dropdown dipnotunda |
| `Intl.NumberFormat` locale-uyumlu | ✅ `formatFromTry` toLocaleString("tr-TR") |
| `iyzico tahsilat ₺` Edge function | ✅ Backend değişmedi — kullanıcıya ₺ ödetir |

→ **Kullanıcı YANILTILMIYOR.** Gerçek çekim ₺ olarak alınır; diğer kurlar referans.

---

## 4) BLOK 4 — RTL-HAZIR + Tutarlılık

| Eleman | Sınıf | RTL davranış |
|---|---|---|
| CurrencySelector dropdown | `end-0` (anchor right→sol RTL) | Otomatik döner |
| Dropdown items | `text-start` | LTR: sol, RTL: sağ |
| ChevronDown | `rotate-180` open state | RTL'de aynı |
| Toplam fiyat satırı | `text-end` (AddonShop sepet) | Otomatik döner |

**Yeni fiziksel CSS borç eklenmedi** (`ml-/mr-/pl-/pr-` SIFIR yeni satır).

---

## 5) CANLI/LOCAL KANIT (Playwright 4173)

```json
{
  "fiyatlandirma_TRY": {
    "http": 200,
    "has_kur_selector": true,         ← Navbar'da picker ✅
    "has_499": true,                  ← TRY default 499 ✅
    "has_eski_donusum_yok": true      ← TRY'de yabancı para görünmüyor ✅
  },
  "fiyatlandirma_USD": {
    "has_499_korundu": true,          ← Ana fiyat ₺ KORUNDU ✅
    "has_dolar_referans": true,       ← ≈ $ referans ✅
    "has_tahsilat_try": true          ← "tahsilat ₺" notu ✅
  },
  "magaza_USD": {
    "http": 200,
    "has_dolar_referans": true,       ← ✅
    "has_tahsilat_try": true          ← ✅
  },
  "komisyon_USD": {
    "http": 200,
    "has_dolar_referans": true,       ← ✅ satış + komisyon referans
    "has_komisyon_try_uyari": true,   ← "₺ üzerinden hesaplanır" UYARI ✅
    "has_200000_korundu": true        ← Komisyon ₺200.000 KORUNDU (yasal matrah) ✅
  }
}
```

**4/4 senaryo PASS · 0 console error.**

---

## 6) DOKUNULAN DOSYALAR (5 dosya)

```
src/App.tsx                              (+2 / +1 — CurrencyProvider import + root sarma)
src/components/CurrencySelector.tsx      (+79 — YENİ bileşen)
src/components/Navbar.tsx                (+2 — import + render)
src/pages/PricingPage.tsx                (+5 / -2 — useCurrency + fx referans satır)
src/pages/addon/AddonShopPage.tsx        (+11 / -1 — useCurrency + sepet toplam referans)
src/pages/payment/CommissionPage.tsx     (+18 / -1 — useCurrency + referans kutu)
```

**Çekirdek korundu:**
- ✅ `fees.ts` (komisyon mantığı %2+%2+KDV ₺) DOKUNULMADI
- ✅ `CurrencyContext` MANTIK kısmı (TCMB API, conversion, rate snapshot) DOKUNULMADI — sadece Provider root'a taşındı
- ✅ `placeBid` RPC, sealed view, RLS, auth, payments-iyzico, subscriptions
- ✅ Tahsilat tüm Edge function'larda hâlâ ₺ — yanıltma yok

---

## 7) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 298 entries (6450.03 KiB)
files generated: dist/sw.js, dist/workbox-9c35ba06.js
```
✅ **YEŞİL**

### Lint
```
$ npx eslint src/App.tsx src/components/CurrencySelector.tsx src/components/Navbar.tsx
$ npx eslint src/pages/PricingPage.tsx src/pages/addon/AddonShopPage.tsx
$ npx eslint src/pages/payment/CommissionPage.tsx
→ 0 hata (CurrencySelector JSDoc `*/` parse fix uygulandı)
```

### CLS
- Yeni kart yapıları öncedendin layout aynı, sadece ek "≈ X$" satırı opsiyonel görünür (TRY'de görünmez, USD/EUR/GBP'de görünür) — kart yüksekliği ±20px değişebilir. **`min-h-[2rem]` zaten var; CLS pratik etki yok.**

---

## 8) KALAN İŞ (Master onayı, ayrı dilim)

20 dosya hâlâ `formatTry` (sabit ₺) — yaygınlaşma sırası önerisi:

| Sıra | Sayfa/Bileşen | Etki | Tahmini saat |
|---|---|---|---|
| 1 | `PaymentStartPage` özet | Yüksek — yabancı ödeme akışı | 0.5 |
| 2 | `PaymentSuccessPage` paket özeti | Orta | 0.5 |
| 3 | `ValuationTool` + `ValuationWorkbench` | Yüksek — değerleme USD/EUR sık sorulur | 1 |
| 4 | `KonutKredisiHesaplayici` + `ListingMortgageWidget` | Orta | 1 |
| 5 | İlan kartları (`PropertyListingCard` ZATEN bağlı; `ilan/detail/shared.tsx` ve `cinematic/HomePage` bağlanmalı) | Yüksek — keşif akışı | 2-3 |
| 6 | Borsa* (5 dosya) | Düşük — borsa zaten ₺ odaklı | 2-3 |
| 7 | iBuyer, GES, Emlakçı paneli | Düşük | 1-2 |

**Toplam ayrı dilim:** ~8-12 saat (Master sıra+onay).

---

## 9) MASTER AKSİYON

1. ✅ Bu commit push edildi (sonda) — canlı `https://www.ihaleal.com` ~5-15 dk Vercel deploy
2. Hard refresh + Navbar'da **Coins icon kur seçici** görünür
3. USD seç → /fiyatlandirma, /magaza, /komisyon sayfalarında ≈ referans + "tahsilat ₺" notu
4. Test kartı sandbox akışıyla ödeme — iyzico ₺ olarak alır (USD seçim gösterim değiştirmez)

### Ayrı dilim sırası önerisi
1. PaymentStartPage + PaymentSuccess (en kritik 2 sayfa, ~1 saat)
2. ValuationTool + ListingCard detay (~3 saat)
3. Borsa* + diğerleri (~3-4 saat)
4. **TÜM SİTE** logical CSS dönüşümü + i18n F1 fazı (ayrı uzun çalışma)

---

## 📂 Audit Ayak İzi

```
_audit/
├── CURRENCY_YAYGINLASTIR_RAPORU.md       ← bu rapor
└── currency-yayginlastir/
    ├── _test-curr.mjs                    (Playwright 4 senaryo)
    └── komisyon-usd.png                  (canlı kanıt)
```

---

— **CurrencyContext kapsamı tüm site · 3 kritik sayfa çoklu kur referansla bağlı · komisyon ₺ matrah korundu · dürüst "tahsilat ₺" notu · RTL-hazır · çekirdek dokunulmadı.**
💱✅
