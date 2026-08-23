# PWA Durumu ve Plan (E1 — güncelleme 2026-06-01, M9)

## Mevcut durum

| Bileşen | Durum | Kaynak |
|---------|--------|--------|
| `public/manifest.json` | **Yok** | repo glob 0 |
| Aktif service worker (içerik cache) | **Bilerek kapalı** | `index.html` → `/sw-unregister.js` React öncesi |
| Kill-switch SW | **Aktif** | `public/sw.js` + `public/sw-unregister.js` |
| VitePWA / Workbox | **Devre dışı** | `vite.config.ts` — yalnızca `react()` plugin |
| Router | **BrowserRouter** | `src/App.tsx` (pathname tabanlı) |
| SEO hash notları | **Eski / hibrit** | `src/lib/seo.ts` — kanonik kök URL politikası devam |

## Kill-switch (`sw-unregister.js`) neden var?

1. **Eski bozuk SW temizliği** — Geçmiş Workbox/VitePWA denemelerinden kalan precache, kullanıcıda eski bundle gösterebiliyordu.
2. **Tek seferlik reload** — Script kayıtlı SW'leri unregister eder, cache/IndexedDB temizler, geçici `/sw.js` kill-switch kaydeder; gerekirse bir kez `location.reload()` yapar (`SW_KILLED_RELOAD`).
3. **Üretim güvenliği** — SW açılmadan önce tüm ziyaretçilerin temiz slate alması hedeflenir; staging'de kill-switch kaldırma **ayrı onay** gerektirir.

Kill-switch kaldırılmadan yalnızca `manifest.json` eklemek A2HS prompt'unu kısmen tetikleyebilir ama offline/cache tutarsızlığı yaratır — **önerilmez**.

## HashRouter + SW uyumsuzluğu (tarihsel risk)

| Senaryo | Sorun | Çözüm |
|---------|--------|--------|
| HashRouter (`#/ilan/...`) + precache | SW yalnızca `/index.html` cache'ler; hash değişimi cache miss veya sonsuz reload (R-T06) | **Tercih:** BrowserRouter + hosting rewrite (zaten `App.tsx`'te) |
| HashRouter + SW açık kalacaksa | Navigation `network-first`, precache'e hash URL eklenmez | SW stratejisi: `navigateFallback: '/index.html'`, hash rotaları client-side |
| BrowserRouter + SW | Pathname `/ilan/:id` — standart SPA fallback uyumlu | `scope: '/'`, hosting `/* → index.html` doğrula |

**Güncel kod:** `BrowserRouter` — S5'te SW açılışı pathname ile uyumlu. `seo.ts` hash yorumları dokümantasyon drift'i; migrasyon tamamlandığında seo notları sadeleştirilmeli (ayrı PR).

## S5 güvenli açılış planı (sıra zorunlu)

### Faz A — Manifest only (SW kapalı kalır)

1. `public/manifest.json`: `name`, `short_name`, `start_url: "/"`, `display: standalone`, `theme_color: #0B1120`, `background_color: #0B1120`, icon-192/512.
2. `index.html`: `<link rel="manifest" href="/manifest.json">` — **`sw-unregister.js` satırı kalır**.
3. Staging smoke: 36/36 + manuel A2HS (Chrome Android / Safari iOS) — offline **beklenmez**.

### Faz B — Staging SW (kill-switch hâlâ prod'da)

1. Staging branch'te `vite-plugin-pwa` veya minimal hand-written SW: **network-first** HTML, **cache-first** statik asset (hash'li chunk).
2. `navigateFallback: '/index.html'` — BrowserRouter ile test.
3. Playwright: offline sonrası `/` ve `/borsa` shell yükleniyor mu; eski chunk 404 yok mu.
4. CI: Linux runner precache boyutu / Workbox flake geçmişi — `NIHAI_RAPOR.md` maddeleri yeşil olmadan prod'a taşınmaz.

### Faz C — Prod kill-switch kaldırma (tek seferlik)

1. Deploy öncesi duyuru: kullanıcılar bir kez hard refresh alabilir.
2. `index.html`'den `sw-unregister.js` script'ini kaldır (veya feature flag `VITE_PWA_ENABLED=true` ile koşullu).
3. Yeni SW `skipWaiting` + `clients.claim` — kontrollü; staging'de doğrulanmış strateji aynen.
4. Rollback: `sw-unregister.js` geri ekle + deploy (kill-switch tekrar devreye girer).

### Faz D — Operasyon

- Sürüm bump'ta precache manifest otomatik güncellenir (Workbox).
- Smoke + `npm run verify` her PWA PR'da zorunlu.
- CSP/hosting: SW scope `/` — CDN cache header'ları `index.html` için `no-cache` veya kısa TTL.

## Bu turda (M9)

- Kod: mobil UX cila (touch target, kontrast, aria-label) — SW **açılmadı**.
- Bu dosya: S5 açılış planı netleştirildi; kill-switch gerekçesi ve BrowserRouter uyumu eklendi.

## Sahiplik

- **Manifest + index link (Faz A):** Cursor lane — S5-T04
- **SW stratejisi + kill-switch kaldırma (Faz B–C):** Claude Code / DevOps — staging doğrulama zorunlu, prod CC-apply onayı
