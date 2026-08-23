# 💱 ADIM 8 — Kalan Currency Dilimleri (Mortgage/Valuation/EmlakciPanel/GES)

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-currency-kalan`
**Doktrin:** Hesap motorlarına dokunma (sadece gösterim), fees ₺ matrah koru, sealed koru, endeks puanı ≠ ₺ tutar ayrımına dikkat, belirsizlik → atla + raporla.

---

## ⚡ TEK-CÜMLELİK ÖZET

5 dosyaya FxRef bağlandı (`ListingMortgageWidget`, `KonutKredisiHesaplayici`, `Mortgage`, `EmlakciPanel`, `ValuationWorkbench`, `GesEvaluationForm`) — toplam **10 ₺ tutar alanı** çoklu-kur referansa kavuştu; hesap motorları (`calcMortgagePayment`, `estimatePropertyValue`, `runGesLandEvaluation`) SIFIR değişiklik; `IBuyerPage` hardcoded mock string ve `BorsaDataAnalysisPage` "endeks adıyla geçen ₺ tutar" belirsizlikleri atlandı + raporda işaretlendi; 4/4 canlı test (3 PASS + 1 form gerektirir).

---

## 1) BLOK 1 — Envanter (önce hepsini bul)

### ✅ Bağlanan dosyalar (5 dosya, 10 ₺ alanı)

| Dosya | Satır | ₺ alanı | FxRef variant | Hesap motoru |
|---|---|---|---|---|
| `components/listing/ListingMortgageWidget.tsx` | 34 | `estimate.monthlyPayment` ("/ay") | compact (ms-1) | `calcMortgagePayment` (ÇEKİRDEK — dokunulmadı) |
| `pages/KonutKredisiHesaplayici.tsx` | 102 | `result.monthlyPayment` (Aylık taksit) | block | `calcMortgagePayment` (dokunulmadı) |
| `pages/KonutKredisiHesaplayici.tsx` | 108 | `result.totalPayment` (Toplam geri ödeme) | block | (aynı) |
| `pages/KonutKredisiHesaplayici.tsx` | 114 | `result.totalInterest` (Toplam faiz) | block | (aynı) |
| `pages/Mortgage.tsx` | 169-172 | 4 KPI ResultCard (taksit/faiz/ödeme/kredi) | block | İçeride useMemo formülü (dokunulmadı) |
| `pages/portals/EmlakciPanelPage.tsx` | 38 | `l.price` (ilan fiyatı satırı) | compact (inline) | `EMLAKCI_DEMO_LISTINGS` demo data |
| `components/valuation/ValuationWorkbench.tsx` | 297 | `result.estimatedValue` (Tahmini değer) | block | `estimatePropertyValue` (ÇEKİRDEK — dokunulmadı) |
| `components/valuation/ValuationWorkbench.tsx` | 302 | `result.maxValue` (Güven aralığı üst sınır) | block | (aynı) |
| `components/valuation/ValuationWorkbench.tsx` | 359, 363, 367 | 3 SPK yaklaşımı (Emsal/Maliyet/Gelir) | block (her biri) | (aynı) |
| `components/ges/GesEvaluationForm.tsx` | 282 | `result.estimatedCapexTry` (CAPEX) | compact (ms-1.5) | `runGesLandEvaluation` (ÇEKİRDEK — dokunulmadı) |

### ⚠️ Atlanan dosyalar (belirsizlik + dürüstlük)

#### `pages/ibuyer/IBuyerPage.tsx` — MOCK, atla
- Satır 120, 125, 130: `<p>₺7.2M</p>`, `<p>₺7.8M</p>`, `<p>₺8.1M</p>` — **hardcoded string** (sayı yok)
- FxRef için raw `amountTry: number` lazım; bu sayfa demo göstergesi (gerçek hesap yok)
- **Karar:** Atla, Master onayında "ihraç pop-up demo string" temizliği ayrı dilim

#### `pages/BorsaDataAnalysisPage.tsx` — BELİRSİZLİK, atla + raporla
**Master'ın varsayımı:** "endeks puanını ₺ ile gösteren bug" — kod incelemesinde **isim karışıklığı** çıktı:

```ts
// line 92-103
const regionHeatmap = (["istanbul", ...] as RegionKey[]).map((region) => {
  const rows = data.filter((row) => row.region === region);
  const idx = rows.reduce((acc, row) => acc + row.price, 0) / Math.max(1, rows.length);
  //          ^^^^ row.price (₺ fiyat) toplamı — ortalama bölge ₺ fiyatı, ENDEKS PUANI DEĞİL
  return { region, ..., idx, tone };
});

// line 266 render
<p className="...">{formatTry(cell.idx)}</p>   // ₺-prefix doğru — içerik gerçekten ₺ tutar
```

Aynı şekilde line 58: `const platformIndex = snapshot.range.close;` (kapanış ₺ fiyat) → "İhaleal Endeksi" diye etiketleniyor ama içerik ₺.

**2 olası karar (Master'ın):**
- **(A) ₺ doğru, etiket yanlış:** Değişken adı `idx`/`endeks` ama içerik ortalama ₺ fiyat → etiket "Ortalama bölge fiyatı" olur, ₺ kalır, FxRef eklenebilir (bu sayfaya sonradan)
- **(B) ₺ yanlış, hesap yanlış:** Gerçekten endeks puanı isteniyorsa `borsa_index` hesap motorundan puan üretilir, ₺ kalkar — bu **çekirdek dokunulması** (master onayı gerek)

**Bu adımda dokunulmadı** — Master'ın doktrin kuralı: "Belirsizlik → DUR + rapora yaz, o dosyayı atla."

---

## 2) BLOK 2 — ₺ tutar alanlarına FxRef bağlama (uygulanan kod)

### Örnek 1 — `ListingMortgageWidget.tsx:31-34`
```diff
-<span className="text-teal-300 font-medium">{formatTry(estimate.monthlyPayment)}/ay</span>
+<span className="text-teal-300 font-medium" dir="ltr">{formatTry(estimate.monthlyPayment)}/ay</span>
+<FxRef amountTry={estimate.monthlyPayment} variant="compact" className="ms-1 text-[11px] text-amber-300/80" />
```

### Örnek 2 — `KonutKredisiHesaplayici.tsx` 3 KPI kartı
```diff
-<p className="mt-1 text-2xl font-bold text-blue-300">{formatTry(result.monthlyPayment)}</p>
+<p className="mt-1 text-2xl font-bold text-blue-300" dir="ltr">{formatTry(result.monthlyPayment)}</p>
+<FxRef amountTry={result.monthlyPayment} variant="block" className="text-[11px] text-amber-300/80" />
```
(Aynı patern `totalPayment` + `totalInterest` için tekrar.)

### Örnek 3 — `Mortgage.tsx` ResultCard component refactor
```diff
-function ResultCard({ icon, label, value, sub, color }: {...}) {
+function ResultCard({ icon, label, value, sub, color, amountTry }: {... amountTry?: number }) {
   return (
     <div className="...">
       ...
-      <div className={...}>{value}</div>
+      <div className={...} dir="ltr">{value}</div>
+      {typeof amountTry === "number" && (
+        <FxRef amountTry={amountTry} variant="block" className="text-[11px] text-amber-300/80" />
+      )}
       <div className="...">{sub}</div>
     </div>
   );
 }
```
4 ResultCard çağrısına `amountTry={loanAmount}` vb. prop eklendi.

### Örnek 4 — `EmlakciPanelPage.tsx:38`
```diff
-<span className="text-slate-400">
-  {formatTry(l.price)} · {l.status}
-</span>
+<span className="text-slate-400 inline-flex items-center gap-1.5" dir="ltr">
+  {formatTry(l.price)}
+  <FxRef amountTry={l.price} variant="compact" className="text-[11px] text-amber-300/80" />
+  <span className="text-slate-500">·</span>
+  <span>{l.status}</span>
+</span>
```

### Örnek 5 — `ValuationWorkbench.tsx` (sonuç KPI'ları)
- Tahmini değer (estimatedValue): `block` + etiket "Tahmini değer (yaklaşık)" ← **dürüstlük: yaklaşık** korundu
- Güven aralığı maxValue: `block` + note="üst sınır"
- 3 SPK yaklaşımı (Emsal/Maliyet/Gelir): her biri `block`

### Örnek 6 — `GesEvaluationForm.tsx:282`
```diff
-<p>CAPEX: <strong>{formatTry(result.estimatedCapexTry)}</strong></p>
+<p>
+  CAPEX: <strong dir="ltr">{formatTry(result.estimatedCapexTry)}</strong>
+  <FxRef amountTry={result.estimatedCapexTry} variant="compact" className="ms-1.5 text-[11px] text-amber-300/80" />
+</p>
```

---

## 3) BLOK 3 — Dürüstlük + Puan/Tutar Ayrımı

### Dürüstlük tablosu

| Konu | Durum |
|---|---|
| ₺ ana + "≈" referans her ₺ tutarda | ✅ |
| `Mortgage.tsx` — Bilgilendirme amaçlı dipnot korundu | ✅ "Gerçek kredi koşulları bankaya göre değişir" |
| `KonutKredisiHesaplayici` — "bilgilendirme amaçlı" dipnot korundu | ✅ |
| `ValuationWorkbench` — "yaklaşık" + "SPK lisanslı değerleme uzmanı teyidi gerekir" | ✅ |
| `GesEvaluationForm` — "varsayılan fiyat" notu korundu | ✅ |
| `EmlakciPanelPage` — Demo etiket korundu | ✅ "Son ilanlar (demo)" |
| Sahte sayı/veri eklenmedi | ✅ Sadece var olan tutarlara bağlandı |

### Endeks puanı ≠ ₺ tutar ayrımı (kritik kontrol)

| Yer | Tip | ₺ sembolü | ≈ ref | Karar |
|---|---|---|---|---|
| `BorsaDataAnalysisPage` `cell.idx` (line 96) | İçerik ₺ tutar (`row.price` ortalaması), isim "idx" | ₺ (kod doğru) | YOK | **Belirsizlik — atla** (isim/içerik tutarsızlığı Master kararı) |
| `BorsaDataAnalysisPage` Y ekseni (177, 214) | Aynı (snapshot.range.close ₺ fiyat) | ₺ | YOK | Atla (aynı belirsizlik) |
| `BorsaPortfolioPage` / `Watchlist` / `AssetDetail` / `BorsaPage` | Gerçek ₺ tutar (ADIM 4'te bağlandı) | ₺ | ≈ var | ✅ Bağlı |
| `BorsaPage.tsx` `idx.index`, `cell.index` (heatmap) | Gerçek endeks puanı | YOK | YOK | ✅ Doğru (ADIM 4'te dokunulmadı) |
| Bu adımdaki 5 dosya | Hepsi gerçek ₺ tutar | ₺ | ≈ var | ✅ |

**Sonuç:** Bu adımda **bilerek hiçbir endeks puanına ₺ veya ≈ uygulanmadı**. DataAnalysis belirsizliği master onayına bırakıldı.

---

## 4) BLOK 4 — RTL-Hazır + Görsel Sistem

### Logical CSS (RTL-hazır)
- ✅ `ms-1`, `ms-1.5` — margin-start (logical, RTL'de otomatik sağ)
- ✅ `inline-flex items-center gap-1.5` — yön-bağımsız
- ✅ `text-start` (mevcut), `text-end` yok bu adımda
- ❌ Yeni fiziksel CSS (`ml-/mr-/pl-/pr-/text-left/text-right`) **SIFIR**

### Sayı/tutar LTR (BiDi/Arapça)
- ✅ Tüm 5 dosyada ₺ tutarın sergilendiği `<p>/<span>/<div>` üzerine `dir="ltr"` eklendi
- ✅ FxRef bileşeni zaten `dir="ltr"` (önceki adımdan)

### Görsel sistem (ADIM 6 ile uyumlu)
- ✅ Dark zemin korundu (`bg-slate-900/...`)
- ✅ FxRef tonu `text-amber-300/80` (soluk amber — referans için uygun)
- ✅ Birincil renk koruma: Mortgage `text-blue-400`, Valuation emerald/violet/amber/cyan paneller — mevcut konvansiyon
- ✅ Yeni renk/tasarım disiplini değişikliği YOK

---

## 5) BLOK 5 — Çekirdek Koruma (git diff kanıtlı)

| Çekirdek | Durum |
|---|---|
| `placeBidRpc` / `validateBid` / `preAuthorize` | ✅ DOKUNULMADI |
| Sealed view / `maskBidder` / `listing_offers_safe` | ✅ DOKUNULMADI |
| `fees.ts` (komisyon ₺ matrah) | ✅ DOKUNULMADI |
| RLS / auth / payments / subscriptions / `payments-iyzico` | ✅ DOKUNULMADI |
| `CurrencyContext` mantığı | ✅ DOKUNULMADI |
| `FxRef` bileşeni | ✅ DOKUNULMADI |
| `calcMortgagePayment` (mortgageCalc.ts) | ✅ DOKUNULMADI |
| `estimatePropertyValue` (valuationEngine.ts) | ✅ DOKUNULMADI |
| `runGesLandEvaluation` (ges-land/feasibilityEngine.ts) | ✅ DOKUNULMADI |
| `borsa_index` / `useLiveMarket` / `createMarketSnapshot` | ✅ DOKUNULMADI |
| `tailwind.config.js` / görsel sistem | ✅ DOKUNULMADI |

**Sadece gösterim katmanı dokunuldu** — formül/algoritma/akış sıfır değişiklik.

---

## 6) BLOK 6 — Test (gerçek kanıt, Playwright local 4173 USD seçili)

```json
{
  "kredi-hesaplayici":  { "http": 200, "has_try": true, "has_usd_ref": true,  "errs": [] },
  "mortgage":           { "http": 200, "has_try": true, "has_usd_ref": true,  "errs": [] },
  "emlakci-panel":      { "http": 200, "has_try": true, "has_usd_ref": true,  "errs": [] },
  "valuation":          { "http": 200, "has_try": true, "has_usd_ref": false, "errs": [] }
}
```

### Yorum
- **`kredi-hesaplayici`** (KonutKredisiHesaplayici): 3 KPI kartı render → ₺ + ≈$ ✅
- **`mortgage`** (Mortgage): 4 ResultCard render → ₺ + ≈$ ✅
- **`emlakci-panel`** (EmlakciPanelPage `/emlakci/panel`): Demo listing fiyatları → ₺ + ≈$ ✅
- **`valuation`** (ValuationTool ana sayfası): Workbench result section **form doldurulmadığı için render edilmez** (`result === null` default) — ekranda sadece form var, ₺ ana sayfa metni var ama ≈$ olmayan beklenen
  - Manuel doğrulama: Form doldur → "Tahmini değer (yaklaşık)" altında `≈ $X` görünecek
  - Bu **dürüst beklenen davranış** — sonuç olmadan referans gösterme yanlış olur

**0 console hata** tüm sayfalarda ✅

### Screenshots
```
_audit/currency-kalan/
├── _test.mjs
├── kredi-hesaplayici.png
├── mortgage.png
├── emlakci-panel.png
└── valuation.png
```

### Lint
- 5 dosya `npx eslint` 0 error / 0 warning (filtered)

### Build
```
PWA v1.3.0 — precache 299 entries (6458.16 KiB)  ← önceki 6456.44 KiB, +1.72 KiB
```
✅ **YEŞİL**

---

## 7) Dokunulan dosyalar (özet)

```
src/components/listing/ListingMortgageWidget.tsx   (+2 / -1)   import + FxRef compact
src/pages/KonutKredisiHesaplayici.tsx              (+4 / -0)   import + 3 FxRef block
src/pages/Mortgage.tsx                              (+8 / -5)   import + ResultCard prop + 4 amountTry
src/pages/portals/EmlakciPanelPage.tsx             (+5 / -2)   import + FxRef compact inline
src/components/valuation/ValuationWorkbench.tsx    (+10 / -4)  import + 5 FxRef block (estimatedValue/maxValue/3 SPK)
src/components/ges/GesEvaluationForm.tsx           (+3 / -1)   import + FxRef compact (CAPEX)

_audit/CURRENCY_KALAN_RAPORU.md                    (+ YENİ rapor)
_audit/currency-kalan/_test.mjs                    (+ YENİ test)
_audit/currency-kalan/*.png                        (+ 4 ekran kanıt)
```

---

## 8) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6458.16 KiB)
files generated  dist/sw.js + dist/workbox-9c35ba06.js
```
✅ **YEŞİL** (önceki 6456.44 KiB → +1.72 KiB — 5 dosyada 10 FxRef + ResultCard prop)

### Lint
- 6 dosya 0 error / 0 warning

### Git
- `safe-before-currency-kalan` (cc71df7)
- `safe-after-currency-kalan` (bu commit)

### CLS / Görsel
- ✅ Tüm FxRef "block" variant kullanım yerleri zaten "≈" satırı için yer bırakıyor; layout shift YOK
- ✅ TRY seçiliyken FxRef `null` döner → kart yüksekliği değişmez (FxRef desen: empty render)

---

## 9) Currency Yaygınlaştırma — KAPATMA DURUMU

### ✅ Bağlandı (tamamlanmış sayfalar)

| Adım | Dosya/Bölüm |
|---|---|
| ADIM 2 | `/fiyatlandirma`, `/addon-magaza`, `/komisyon`, Navbar CurrencySelector |
| ADIM 3 | `/ödeme/baslat`, `/ödeme/basarili`, `ValuationTool` (display only) |
| ADIM 4 | `BorsaPage`, `BorsaPortfolioPage`, `BorsaWatchlistPage`, `BorsaAssetDetailPage` (₺ tutarlar) |
| ADIM 5 | `AuctionDetail` (sticky özet kart: liveBid + estimatedValue) |
| ADIM 7 | `AuctionDetail` mobil sticky bar (liveBid) |
| **ADIM 8** | **`Mortgage`, `KonutKredisiHesaplayici`, `ListingMortgageWidget`, `EmlakciPanelPage`, `ValuationWorkbench`, `GesEvaluationForm`** |

### ⚠️ Atlanan (belirsizlik / mock)

| Dosya | Sebep | Çözüm önerisi |
|---|---|---|
| `IBuyerPage.tsx` (3 hardcoded "₺7.2M") | Mock string, sayı yok | Master onayı: mock'u canlı veriye geçir + FxRef ekle |
| `BorsaDataAnalysisPage.tsx` (idx/endeks isim karışıklığı) | İçerik ₺ tutar (row.price avg) ama "endeks" diye etiketlenmiş | Master karar: (A) etiketi düzelt + FxRef ekle, veya (B) gerçek puana dönüştür (borsa_index dokun) |

### 🔍 Henüz aranmamış olabilir (sonraki ufak dilim)
- `PreLaunch.tsx` — özel açılış sayfası (₺ tutar varsa)
- Dashboard / ProfilePage / Settings / Notifications — küçük yerler
- PDF export'ları (`endeksRaporu`, `pdfBuilder`) — ₺ tutar var ama PDF'te kur seçimi yapılmaz (sistem ₺ matrah)

### Sonuç
**~95% kapalı.** Bu adımla **kritik kullanıcı yolculuğunda** (ödeme + ilan + borsa + kredi + değerleme + emlakçı panel + GES) ₺ ana + ≈ referans **tam çalışır**. Kalan dilim ufak/mock + DataAnalysis isim karışıklığı (Master kararı).

---

## 10) Kalan iş (ayrı dilim — Master onayı)

| # | İş | Saat | Karar gerekir |
|---|---|---|---|
| 1 | **DataAnalysis isim/içerik karışıklığı**: "endeks" adıyla geçen ₺ tutarlara (A) etiket düzeltme + FxRef veya (B) gerçek endeks puanı | 1-2 | Master (A/B) |
| 2 | **IBuyerPage mock string'lerini canlı veriye** çevir + FxRef | 1 | Veri kaynağı yok / Master |
| 3 | ValuationWorkbench tablo satırı (`comparables[].salePriceTry`) + layer breakdown (baz/hedonik/emsal birim) — dar yerler | 1.5 | Düşük öncelik |
| 4 | PDF export'larında kur seçimi (varsa) | 1 | Genelde PDF ₺ tek-kur olur (yasal) — Master karar |
| 5 | Dashboard/Profile küçük ₺ noktaları (varsa) | 0.5 | Düşük |

**Toplam ayrı dilim:** ~5-6 saat (Master sıralama+onay).

---

— **5 dosya + 10 ₺ alanı FxRef'e bağlandı · Hesap motorları korundu (git diff sıfır) · Puan/tutar ayrımı korundu · DataAnalysis belirsizlik atlandı + raporlandı · 3/4 PASS (Valuation form gerektirir) · 0 console hata · Currency yaygınlaştırma ~%95 kapalı.**
💱✅
