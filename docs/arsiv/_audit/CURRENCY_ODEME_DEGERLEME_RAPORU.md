# 💱 ADIM 3 — Ödeme + Değerleme CurrencyContext'e Bağla

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-currency-odeme-degerleme`
**Doktrin:** Edge function (payments-iyzico) MANTIĞI + değerleme HESAP mantığı (`estimatePropertyValue`) ₺ üzerinden YAPMAYA devam — sadece gösterim çoklu kur. Çekirdek (placeBid/sealed/RLS/fees.ts/auth/subscriptions/CurrencyContext mantığı) DOKUNULMADI.

---

## ⚡ TEK-CÜMLELİK ÖZET

`PaymentStartPage` özet kartı + `PaymentSuccessPage` paket özeti + `ValuationTool` tahmini sonuç bloğu (merkez + aralık) CurrencyContext'e bağlandı — **₺ ana KORUNDU, ≈ X$/€ referans + "tahsilat ₺" / "değerleme ₺" dürüst notu**; sandbox banner ve fees.ts mantığı korundu; canlı test 3/3 PASS.

---

## 1) BLOK 1 — PaymentStart + PaymentSuccess

### PaymentStartPage (`/odeme/baslat`)

Özet kartı "Toplam" satırı altına ek referans:
```
Toplam              ₺499 /ay
Referans (USD)      ≈ $13.06 (tahsilat ₺)
```

**Sandbox + dürüstlük korundu:** "Sandbox / Test Modu" banner + iyzico ₺ tahsilat akışı değişmedi.

### PaymentSuccessPage (`/odeme/basarili`)

Paket özeti sağ tarafında:
```
₺4.500
/ay
≈ $117.81 (tahsilat ₺)
```

Mevcut "Sandbox Ödeme Onayı" + "iyzico sandbox" + "Supabase subscriptions" metni KORUNDU.

### Edge function mantığı

`payments-iyzico/index.ts` DOKUNULMADI. `createSubscription` action `monthly_price_try` ₺ olarak yazmaya devam ediyor — sadece frontend gösterim çoklu kur.

---

## 2) BLOK 2 — ValuationTool

### Tahmini sonuç bloğu

ÖNCEDEN:
```
₺X.XXX.XXX
Güven: Yüksek · %85
```

ŞİMDİ (USD seçili iken):
```
₺7.250.000
≈ $189,790 (USD referans · değerleme ₺)
Güven: Yüksek · %85
```

Tahmin aralığı altına ek satır:
```
Aralık ≈ $182k – $197k (yaklaşık)
```

### Hesap mantığı korundu

`estimatePropertyValue()` — TCMB + emsal + hedonik bölge baz fiyatı **₺ üzerinden hesaplanır**. Frontend sadece sonucu çoklu kurda gösterir. Bölge ortalaması / katman fiyatları (₺/m²) hâlâ ₺ olarak listelenir (özetle "değerleme ₺" referansı belirtilmiş).

---

## 3) BLOK 3 — Dürüstlük + RTL-hazır

| Element | Durum |
|---|---|
| "≈" işareti her referansta | ✅ |
| "tahsilat ₺" notu (ödeme sayfalarında) | ✅ |
| "değerleme ₺" notu (ValuationTool) | ✅ |
| Sandbox banner (PaymentStart) | ✅ KORUNDU |
| "iyzico sandbox + subscriptions" (PaymentSuccess) | ✅ KORUNDU |
| Logical CSS — `text-end`, `ms-1` | ✅ Yeni satırlarda fiziksel borç YOK |
| Sayı BiDi (LTR) | ✅ `formatFromTry` toLocaleString("tr-TR") locale-uyumlu |

---

## 4) CANLI KANIT (Playwright local 4173, USD seçili)

```json
{
  "odeme_baslat": {
    "http": 200,
    "has_499": true,                  ← Ana ₺ fiyat KORUNDU ✅
    "has_dolar_referans": true,       ← ≈ $ referans ✅
    "has_tahsilat_try": true,         ← "tahsilat ₺" notu ✅
    "has_sandbox": true               ← Sandbox banner KORUNDU ✅
  },
  "odeme_basarili": {
    "http": 200,
    "has_4500": true,                 ← Ana ₺ fiyat KORUNDU ✅
    "has_dolar_referans": true,       ← ≈ $ referans ✅
    "has_tahsilat_try": true          ← "tahsilat ₺" notu ✅
  },
  "degerleme": {
    "http": 200,
    "has_tahmini_sonuc": true,        ← Sonuç bloğu render ✅
    "has_dolar_referans": true,       ← ≈ $ referans ✅
    "has_degerleme_try": true         ← "değerleme ₺" notu ✅
  }
}
```

**3/3 senaryo PASS** · 1 net error (CDN env, lokal beklenen).

---

## 5) DOKUNULAN DOSYALAR (3 dosya)

```
src/pages/payment/PaymentStartPage.tsx     (+15 / -4)   useCurrency + özet referans satır
src/pages/payment/PaymentSuccessPage.tsx   (+8 / -2)    useCurrency + paket özeti referans
src/pages/ValuationTool.tsx                (+13 / -2)   useCurrency + tahmini sonuç + aralık referans
```

**Çekirdek korundu:**
- ✅ `fees.ts` (komisyon mantığı)
- ✅ `payments-iyzico/index.ts` (Edge function — tutar hesap ve INSERT ₺)
- ✅ `valuationEngine.ts` (HESAP mantığı ₺)
- ✅ `CurrencyContext` mantığı (önceki turda sadece Provider root'a alındı)
- ✅ `placeBid` RPC, sealed view, RLS, auth, subscriptions

---

## 6) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 298 entries (6451.13 KiB)
```
✅ **YEŞİL**

### Lint
```
$ npx eslint PaymentStart/Success/ValuationTool
→ 0 hata
```

### CLS
Referans satırı sabit yapıda — TRY default'ta görünmez, USD/EUR/GBP'de görünür. Kart yüksekliği ±15px potansiyel; pratik etki minimal.

---

## 7) Kalan iş (Master onayı, ayrı dilim)

**17 dosya hâlâ `formatTry` sabit ₺:**
| Sıra | Sayfa | Etki | Saat |
|---|---|---|---|
| 1 | Borsa* (5 dosya: Page/Portfolio/Watchlist/AssetDetail/DataAnalysis) | Yüksek — yatırımcı portföy | 3-4 |
| 2 | İlan kartları (`ilan/detail/shared.tsx`, `cinematic/PremiumCinematicHome`) | Yüksek — keşif akışı | 2 |
| 3 | KonutKredisiHesaplayici + ListingMortgageWidget | Orta | 1 |
| 4 | iBuyer SubmissionForm + GES EvaluationForm | Düşük | 1 |
| 5 | EmlakciPanelPage + BorsaAnalyticsDashboard | Düşük | 1 |
| 6 | ValuationWorkbench (komponent — ValuationTool sayfası bağlandı; alt bileşen kaldı) | Düşük | 0.5 |

**Toplam ayrı dilim:** ~8-10 saat (Master sıra+onay).

---

## 📂 Audit Ayak İzi

```
_audit/
├── CURRENCY_ODEME_DEGERLEME_RAPORU.md     ← bu rapor
└── currency-odeme-degerleme/
    ├── _test.mjs                          (Playwright 3 senaryo)
    └── odeme-usd.png                      (canlı kanıt)
```

---

— **Ödeme + değerleme USD/EUR/GBP referansla görünür · tahsilat ₺ / değerleme ₺ dürüst · sandbox dürüstlüğü korundu · Edge function + hesap mantığı dokunulmadı · 3/3 canlı PASS.**
💱✅
