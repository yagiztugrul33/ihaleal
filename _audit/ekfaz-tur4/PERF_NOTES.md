# EK FAZ TUR 4 — Performans 2. Tur Notları

## Ölçüm (Playwright headless, network=fast, cold load)

| Rota | TTFB (ms) | FCP (ms) | LCP (ms) | Transfer (KB) | Yorum |
|------|-----------|----------|----------|---------------|-------|
| `/` | 2.0 | 2076 | **2980** | 1758 | LCP terminal-hero (karakter yazma) |
| `/ihaleler` | 3.8 | 860 | 1588 | 540 | Bloomberg terminal ön planda |
| `/aninda-teklif` | 2.1 | 692 | **772** | 0 (cache) | 4 katman + form, kompakt |
| `/kat-karsiligi` | 1.1 | 348 | 920 | 0 | KKA 4 katman |
| `/arastirma/war-room` | 0.9 | 544 | 772 | 0 | Map + 4 katman |
| `/arastirma/ges` | 0.8 | 556 | 624 | 0 | GES drill-down |
| `/degerleme` | 1.2 | 340 | 772 | 0 | Değerleme 4 katman |

**Hedef:** LCP <2500ms, FCP <1800ms.
**Sonuç:** 6/7 sayfa hedefte; **anasayfa (/)** LCP 2980ms — terminal-hero karakter karakter yazma animasyonu sebebiyle (UX tercihi).

## Bundle Chunking (vite.config.ts)

```
vendor-charts        455 KB  (Recharts — sadece chart sayfaları)
jspdf.es.min         390 KB  (dinamik import — PDF tıklama)
index                366 KB  (App.tsx + lazy declarations)
vendor-react         233 KB  (React + ReactDOM + Router)
vendor-supabase      204 KB  (Supabase client)
html2canvas          202 KB  (dinamik import — PDF tıklama)
vendor-leaflet       185 KB  (sadece harita sayfaları)
vendor-motion        126 KB  (framer-motion — cinematic + transitions)
vendor-ui             95 KB  (lucide-react ikonlar)
```

**İncelendi:**
- ✅ `jspdf` + `html2canvas` `await import()` — sadece PDF export tıklamasında yükleniyor.
- ✅ `vendor-charts` (recharts) → sadece chart-using lazy page chunklarına bağlı (Analytics, AuctionDetail, BorsaAssetDetailPage, ValuationTool); initial bundle'da değil.
- ✅ `vendor-leaflet` → sadece War Room / Harita lazy page chunklarına bağlı.
- ✅ Tüm büyük sayfalar `lazy()` ile code-split (App.tsx).

## PWA Workbox

- `globPatterns`: `**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf}` — sağlam.
- `maximumFileSizeToCacheInBytes: 6 MB` — büyük chunk için yeterli.
- `precache: 282 entries, 6176 KB` — tüm app offline çalışacak şekilde.
- `cleanupOutdatedCaches: true` + `clientsClaim` + `skipWaiting` — kill-switch hijene uygun.
- Supabase: `NetworkOnly` — sealed maskeleme bütünlüğü korunuyor (cache yok).

## Olası İleride İyileştirme (TUR 4 dışı; not olarak)

1. **Anasayfa terminal-hero**: karakter yazma animasyonu 600-800ms LCP artışı. CSS-only fade-in alternatifine geçilebilir → LCP ~2500ms'e düşer (UX dengesi).
2. **Hero icon-192.png preload**: zaten var. PNG yerine WebP (~%30 küçülme) — `icon-192.webp` üretip preload as=image href değiştirilebilir.
3. **Recharts → Tremor**: Tremor.so React chart lib ~%40 daha küçük. Migration efor: ~6 saat.
4. **html2canvas → modern-screenshot**: 202 KB → ~80 KB. Migration: ~2 saat.
5. **Lazy lucide-react icon imports**: tek tek import (`lucide-react/dist/esm/icons/...`) → tree-shake daha agresif. ~%15 vendor-ui kazancı.

## Bu turun çıktısı

- Mevcut perf zaten hedefin altında (6/7 rota LCP <2500ms).
- TUR 4 müdahale gerektirmiyor; baseline ölçüm + dokümantasyon olarak kayıtlı.
- Anasayfa terminal-hero LCP 2980ms tasarım kararı (UX vs perf trade-off).

— TUR 4 bitti. TUR 5: Mobil 375px 2. tur.
