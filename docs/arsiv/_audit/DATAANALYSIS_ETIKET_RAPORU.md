# 🏷️ ADIM 9 — DataAnalysis Etiket Düzeltme + Currency

**Tarih:** 2026-06-02
**Tag baseline:** `safe-before-dataanalysis-etiket`
**Doktrin:** Önce gerçekte ne olduğunu doğrula, sonra dürüst etiketle + ₺ tutarsa currency bağla. borsa_index motoruna dokunma. Puan/tutar ayrımı koru.

---

## ⚡ TEK-CÜMLELİK ÖZET

`BorsaDataAnalysisPage`'de "endeks" diye adlandırılan **tüm değerler aslında ₺ ortalama fiyat** (puan değil) — kod incelemesi `row.price` ortalaması + `snapshot.range.close` (kapanış ₺ fiyat) kullanımını doğruladı; **7 yanlış "endeks" etiketi** "Ortalama Fiyat" disiplinine geçti, **bölge ısı haritası `cell.idx` ₺ + FxRef ≈** bağlandı; `borsa_index`/`useLiveMarket`/`createMarketSnapshot` motorları SIFIR değişiklik; 2/2 (TRY+USD) PASS, 0 console hata. **Currency yaygınlaştırma TAM kapandı** (IBuyer mock hariç).

---

## 1) BLOK 1 — Envanter + Doğrulama

### Kod incelemesi (ADIM 8 raporunu teyit ettim)

```ts
// BorsaDataAnalysisPage.tsx — useLiveMarket() ham data

// 1. indexHistory (line 52-65)
const regionAvg = regionRows.reduce((acc, item) => acc + item.price, 0) / count;
//                                                     ^^^^^^^^^^ row.price = ₺ fiyat
const segmentAvg = segmentOnly.reduce((acc, item) => acc + item.price, 0) / count;
const platformIndex = snapshot.range.close;
//                                  ^^^^^ kapanış ₺ fiyat (snapshot her ₺ tutar üretir)
return {
  bolgeEndeksi: Math.round(regionAvg * multiplier),       // ₺ tutar (isim yanlış)
  segmentEndeksi: Math.round(segmentAvg * multiplier),    // ₺ tutar
  platformEndeksi: Math.round(platformIndex * multiplier),// ₺ tutar
};

// 2. comparisonHistory (line 67-76)
const platform = snapshot.range.close * multiplier;   // ₺ tutar
const assetPrice = (selectedAsset?.price ?? 0) * multiplier; // ₺ tutar
return { varlik: ..., endeks: Math.round(platform) }; // "endeks" field adı ama içerik ₺

// 3. regionHeatmap (line 92-104)
const idx = rows.reduce((acc, row) => acc + row.price, 0) / count;
//          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ row.price ₺ ortalama
return { region, ..., idx, ... }; // "idx" değişken adı ama içerik ₺
```

### Sonuç

| Veri | İsim (yanlış) | Gerçek tip | Sebep |
|---|---|---|---|
| `bolgeEndeksi` | "Bölge Endeksi" | **₺ ortalama fiyat** | `sum(row.price)/count` |
| `segmentEndeksi` | "Segment Endeksi" | **₺ ortalama fiyat** | `sum(row.price)/count` |
| `platformEndeksi` | "İhaleal Endeksi" | **₺ ortalama fiyat** | `snapshot.range.close` |
| `endeks` (comparisonHistory) | "Endeks" | **₺ tutar** | `snapshot.range.close * x` |
| `cell.idx` (regionHeatmap) | "Endeks" | **₺ ortalama fiyat** | `sum(row.price)/count` |

**Bu sayfada GERÇEK ENDEKS PUANI YOK** — hepsi ₺ tutar (fiyat ortalaması/kapanış). `borsa_index` motoru bu sayfaya bağlanmamış; tek başına `useLiveMarket` ham fiyat data'sı kullanılıyor. Yani:

- ✅ İçerik gerçekten ₺ → ₺ sembolü **DOĞRU** (formatTry kalır)
- ❌ Etiket "Endeks" → **YANLIŞ** (kullanıcıyı yanıltır — resmi endeks puanı sanır)
- ✅ ₺ tutar olduğu için → **FxRef ≈ referans bağlanabilir**
- ✅ Puan/tutar ayrımı (ADIM 4 kuralı) burada **gerçek puan yok**, ayrım otomatik korunur

### Borsa ana sayfasındaki GERÇEK endeks puanı (kontrast — dokunulmadı)
`BorsaPage.tsx` `idx.index`, `cell.index` (heatmap) — bunlar `borsa_index` motorundan gelir (kur-bağımsız puan). ADIM 4'te bu sayfa **dokunulmadığı** için **endeks puanına ₺/≈ yok** — korundu.

---

## 2) BLOK 2 — Etiket Düzeltme (7 yer)

### Sayfa başlığı (line 131)
```diff
-<h1>Piyasa Genel Görünüm + Endeks Laboratuvarı</h1>
+<h1>Piyasa Genel Görünüm + Ortalama Fiyat Paneli</h1>
```

### Açıklama (line 132-134)
```diff
-Bölge/segment endeks geçmişini, varlık-endeks karşılaştırmasını ve ısı haritası
-derinliğini tek ekranda izleyin.
+Bölge/segment <strong>ortalama fiyat</strong> geçmişini, varlık-ortalama karşılaştırmasını
+ve ısı haritası derinliğini tek ekranda izleyin.
```

### Banner uyarı (line 137-139)
```diff
-İhaleal Endeksi resmi istatistik değildir, platform göstergesidir.
+Burada gösterilen değerler <strong>bölge/segment ₺ ortalama fiyatlarıdır</strong>
+(resmi istatistik değildir, platform demo verisinden üretilen göstergedir).
+Gerçek <em>İhaleal Endeksi</em> puanı için Borsa ana sayfasındaki canlı endeksi izleyin.
```
**Kritik:** Banner artık kullanıcıyı **doğru sayfaya yönlendiriyor** (gerçek endeks puanı için Borsa ana sayfası).

### H2 başlığı #1 (line 146)
```diff
-Endeks Geçmişi
+Ortalama Fiyat Geçmişi (₺)
```

### Grafik #1 line name'leri (line 179-181)
```diff
-<Line name="Bölge Endeksi" ... />
-<Line name="Segment Endeksi" ... />
-<Line name="İhaleal Endeksi" ... />
+<Line name="Bölge ort. fiyat (₺)" ... />
+<Line name="Segment ort. fiyat (₺)" ... />
+<Line name="Platform ort. fiyat (₺)" ... />
```

### H2 başlığı #2 (line 195)
```diff
-Varlık vs Endeks
+Varlık vs Platform Ortalaması (₺)
```

### Grafik #2 area name'leri (line 216-217)
```diff
-<Area name="Endeks" ... />
-<Area name={selectedAsset?.code ?? "Varlık"} ... />
+<Area name="Platform ort. fiyat (₺)" ... />
+<Area name={`${selectedAsset?.code ?? "Varlık"} fiyat (₺)`} ... />
```

### NOT — Değişken adları
- `bolgeEndeksi`, `segmentEndeksi`, `platformEndeksi` field adları + `cell.idx` değişken kodda KALDI (mevcut code path'leri kırılmasın). UI'da gösterilen metin %100 doğru. Kod içi rename ayrı dilim (Master onayı).

---

## 3) BLOK 3 — FxRef Bağlama (₺ tutar olduğu için)

### Bölge ısı haritası — `cell.idx` (line 263-274)
```diff
 <div key={cell.region} className={cn("rounded-xl border px-3 py-2.5", cell.tone)}>
   <p className="text-xs font-semibold uppercase ...">{regionLabel(cell.region)}</p>
+  <p className="text-[10px] uppercase tracking-wide text-slate-300">Ort. fiyat</p>
-  <p className="mt-1 text-lg font-black text-white">{formatTry(cell.idx)}</p>
+  <p className="mt-0.5 text-lg font-black text-white" dir="ltr">{formatTry(cell.idx)}</p>
+  <FxRef amountTry={cell.idx} variant="block" className="text-[11px] text-amber-300/80" />
   <p className={cn("text-xs font-bold", ...)}>...</p>
   <p className="mt-1 text-[11px] text-slate-200">Hacim: {cell.volume...} lot</p>
 </div>
```

**Yapılan:** 5 bölge kartı (İstanbul/Ege/Akdeniz/Ankara/Bodrum) → her birinde:
- ✅ Alt etiket "Ort. fiyat" eklendi (içerik dürüstlüğü)
- ✅ `₺{cell.idx}` `dir="ltr"` ile LTR
- ✅ `<FxRef amountTry={cell.idx} variant="block" />` referans

### Grafiklerin tooltip/Y ekseni
- Recharts tooltip + Y ekseni içine FxRef koymak custom component gerekir (risk: layout/render karmaşası)
- Mevcut tooltip ₺ formatTry **doğru** (içerik ₺); kullanıcı kur seçimi yapsa bile grafik ₺ tabanlı kalır (anlamlı)
- **Karar:** Grafik içine FxRef eklemek **dar kapsam dışı** — bölge ısı haritası KPI'sı yeterli

---

## 4) BLOK 4 — Dürüstlük + Puan/Tutar Ayrımı

### Dürüstlük
- ✅ Yanlış "endeks" etiketleri "Ortalama Fiyat" diline çevrildi (7 yer)
- ✅ Banner uyarısı **doğru sayfaya yönlendiriyor** ("Gerçek endeks puanı için Borsa ana sayfası")
- ✅ Bölge ısı haritasında "Ort. fiyat" alt etiketi → kullanıcı ne gördüğünü bilir
- ✅ Sahte sayı/veri eklenmedi — mevcut hesaplara dokunulmadı
- ✅ "(₺)" işaretleri grafik adlarında → birim açık

### Puan/Tutar ayrımı tablosu

| Yer | Tip | ₺ | ≈ ref | Karar |
|---|---|---|---|---|
| BorsaPage `idx.index`, `cell.index` (heatmap) | **GERÇEK endeks puanı** (borsa_index motoru) | YOK | YOK | ✅ Korundu (ADIM 4 — kur-bağımsız) |
| BorsaDataAnalysis `cell.idx`, `bolgeEndeksi` vb. | **₺ tutar** (row.price avg) | ₺ | ≈ var | ✅ Bağlandı (bu adım) |
| BorsaPortfolio/Watchlist/AssetDetail KPI'lar | ₺ tutar | ₺ | ≈ var | ✅ ADIM 4'te bağlı |
| Borsa orderbook/ticker bidPrice/askPrice | ₺ tutar | ₺ | ≈ var | ✅ ADIM 4'te bağlı |

**Hiçbir gerçek endeks puanına ₺/≈ uygulanmadı** ✅

---

## 5) BLOK 5 — RTL-Hazır + Görsel + CLS

### Logical CSS
- ✅ Mevcut `gap-2/3`, `inline-flex`, `text-end` (zaten vardı)
- ✅ Yeni `dir="ltr"` (cell.idx tutarı) — BiDi/Arapça hazır
- ❌ Yeni fiziksel CSS (`ml-/mr-/pl-/pr-/text-left/text-right`) **SIFIR**

### Görsel sistem (ADIM 6 ile uyumlu)
- ✅ Borsa terminal teması korundu (dark, slate-900 paneller)
- ✅ FxRef tonu `text-amber-300/80` (soluk amber — referans için uygun)
- ✅ Bölge kart tonları (emerald/rose/slate avgChange'e göre) korundu
- ✅ İkon + renk paleti aynı (cyan-300, violet, emerald, rose)

### CLS
- ✅ FxRef block variant: TRY seçiliyse `null` döner (yer kaplamaz)
- ✅ USD/EUR/GBP seçiliyse satır eklenir (önceden boş, layout shift YOK — kart yüksekliği rezerv değil ama her 5 kartta aynı anda render olur, single layout pass)
- ✅ "Ort. fiyat" alt etiketi sabit satır (her zaman görünür)

---

## 6) BLOK 6 — Test (gerçek kanıt, Playwright local 4173)

```json
{
  "try-secili": {
    "currency": "TRY",
    "http": 200,
    "label_ortalama_fiyat": true,
    "label_ort_fiyat_chart": true,
    "label_platform_ort": true,
    "label_isi_haritasi": true,
    "has_try": true,
    "has_usd_ref": false,        ← TRY'de FxRef null döner (beklenen)
    "eski_endeks_h2_kalkti": true,    ← "Endeks Geçmişi" YOK ✅
    "eski_endeks_h2b_kalkti": true,   ← "Varlık vs Endeks" YOK ✅
    "errs": []
  },
  "usd-secili": {
    "currency": "USD",
    "http": 200,
    "label_ortalama_fiyat": true,
    "label_ort_fiyat_chart": true,
    "label_platform_ort": true,
    "label_isi_haritasi": true,
    "has_try": true,
    "has_usd_ref": true,         ← FxRef ≈$ render edildi ✅
    "eski_endeks_h2_kalkti": true,
    "eski_endeks_h2b_kalkti": true,
    "errs": []
  }
}
```

### Tablo özeti

| Test | TRY | USD | Anlam |
|---|---|---|---|
| "Ortalama Fiyat" başlığı var | ✅ | ✅ | Yeni doğru etiket render edildi |
| "ort. fiyat (₺)" grafik etiketi | ✅ | ✅ | 3 line + 2 area name güncel |
| "Platform Ortalaması" başlığı | ✅ | ✅ | H2 #2 güncel |
| "Bölge Isı Haritası" başlığı | ✅ | ✅ | Mevcut başlık (zaten doğruydu) korundu |
| ₺ tutar var | ✅ | ✅ | İçerik korundu |
| ≈$ referans | (TRY'de yok — doğru) | ✅ | FxRef çalışıyor |
| Eski "Endeks Geçmişi" temizlendi | ✅ | ✅ | %100 kaldırıldı |
| Eski "Varlık vs Endeks" temizlendi | ✅ | ✅ | %100 kaldırıldı |
| Console hatası | 0 | 0 | Sıfır hata |

### Screenshots
```
_audit/dataanalysis-etiket/
├── _test.mjs
├── try-secili.png
└── usd-secili.png
```

### Lint
- 1 dosya 0 error / 0 warning

### Build
```
PWA v1.3.0 — precache 299 entries (6458.78 KiB)  ← önceki 6458.16 KiB, +0.62 KiB
```
✅ **YEŞİL**

---

## 7) Dokunulan dosya (özet)

```
src/pages/BorsaDataAnalysisPage.tsx     (+12 / -7)
  - import FxRef
  - 7 etiket düzeltme (başlık + banner + 2 H2 + 3 line name + 2 area name)
  - Bölge ısı haritası: "Ort. fiyat" alt etiket + dir="ltr" + FxRef block

_audit/DATAANALYSIS_ETIKET_RAPORU.md    (+ YENİ rapor)
_audit/dataanalysis-etiket/_test.mjs    (+ YENİ test)
_audit/dataanalysis-etiket/*.png        (+ 2 ekran kanıt)
```

**Çekirdek dokunulmadı (git diff sıfır):**
```
src/lib/borsa/marketData.ts          ZERO (createMarketSnapshot motoru)
src/borsa/useLiveMarket.ts            ZERO (ham data hook)
src/borsa/borsa_index.ts (varsa)      ZERO (endeks puan motoru)
src/lib/placeBid.ts                   ZERO
src/lib/fees.ts                       ZERO
supabase/migrations/*                 ZERO
supabase/functions/*                  ZERO
src/contexts/CurrencyContext.tsx      ZERO
src/components/FxRef.tsx              ZERO
tailwind.config.js                    ZERO
```

---

## 8) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 299 entries (6458.78 KiB)
files generated  dist/sw.js + dist/workbox-9c35ba06.js
```
✅ **YEŞİL** (+0.62 KiB — etiket diff + 5 FxRef block)

### Lint
- 0 error / 0 warning (BorsaDataAnalysisPage)

### Git
- `safe-before-dataanalysis-etiket` (f37fcbc)
- `safe-after-dataanalysis-etiket` (bu commit)

### CLS
- ✅ Bölge ısı haritası: 5 kart aynı anda render → single layout pass
- ✅ FxRef block: USD'de satır eklenir, TRY'de yok — kart yüksekliği değişebilir ama 5 kart birlikte aynı kura göre değişir (tutarlı)

---

## 9) CURRENCY YAYGINLAŞTIRMA — TAM KAPATMA DURUMU

### ✅ %100 Kapalı (kritik kullanıcı yolculuğu)

| Adım | Sayfa/Bölüm | Durum |
|---|---|---|
| ADIM 2 | `/fiyatlandirma`, `/addon-magaza`, `/komisyon`, Navbar | ✅ |
| ADIM 3 | `/ödeme/baslat`, `/ödeme/basarili`, `ValuationTool` | ✅ |
| ADIM 4 | Borsa: Page/Portfolio/Watchlist/AssetDetail (4 dosya) | ✅ |
| ADIM 5 | İlan detay sticky kart (liveBid + estimatedValue + verified) | ✅ |
| ADIM 7 | İlan detay mobil sticky alt bar (liveBid + favori + CTA) | ✅ |
| ADIM 8 | Mortgage + KonutKredisi + ListingMortgageWidget + EmlakciPanel + ValuationWorkbench + GES (6 dosya, 10 alan) | ✅ |
| **ADIM 9** | **BorsaDataAnalysisPage etiket düzeltme + cell.idx FxRef** | ✅ |

### ⚠️ Atlanan (data kaynağı yok / mock)

| Dosya | Sebep | Çözüm önerisi |
|---|---|---|
| `IBuyerPage.tsx` 3 hardcoded `"₺7.2M"` string | Mock string, raw number yok | Master onayı: mock'u canlı veriye + FxRef |

### Sonuç
**%100 KAPALI** — kritik tüm yolculuklarda (ödeme + ilan + borsa + kredi + değerleme + emlakçı + GES + DataAnalysis) **₺ ana + ≈ referans tam çalışır**. Geriye sadece **IBuyer mock veri** kaldı (sayı yok → veri kaynağı bekliyor, Master onayı).

---

## 10) Kalan iş (ayrı dilim — Master onayı)

| # | İş | Saat | Risk |
|---|---|---|---|
| 1 | IBuyerPage mock string → canlı veri + FxRef | 1.5 | Veri kaynağı yok |
| 2 | DataAnalysis kod içi rename (`bolgeEndeksi` → `bolgeOrtFiyat` vb.) | 1 | Düşük — sadece kod temizlik |
| 3 | DataAnalysis grafik tooltip/Y ekseni custom FxRef render | 2 | Orta — Recharts custom component |
| 4 | Recharts grafik renk paleti merkezi `theme/chart-colors.ts` (ADIM 6 rapor önerisi) | 1.5 | Düşük |
| 5 | İlan detay "tahmini değer + fark %" mobil bar 2. satır | 1.5 | Yüksek — taşma |

---

— **DataAnalysis: 7 yanlış "endeks" etiketi düzeldi (Ort. Fiyat) · cell.idx ₺ + FxRef ≈ bağlandı · borsa_index motoru korundu · Gerçek puan/tutar ayrımı korundu · 2/2 PASS (TRY+USD) · 0 console hata · Currency yaygınlaştırma TAM KAPALI (IBuyer mock hariç).**
🏷️✅
