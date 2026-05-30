# PWA Durumu ve Plan (E1 — 2026-05-30)

## Mevcut durum

| Bileşen | Durum | Kaynak |
|---------|--------|--------|
| `public/manifest.json` | **Yok** | repo glob 0 |
| Aktif service worker | **Bilerek kapalı** | `index.html:17-19` → `/sw-unregister.js` |
| Kill-switch SW | **Aktif** | `public/sw.js` + `sw-unregister.js:1-7` |
| VitePWA / Workbox | **Devre dışı** | `vite.config.ts` — yalnızca `react()` plugin |
| Referans config | Arşiv | `_vite_utf8.ts` (eski PWA taslağı, prod'da kullanılmıyor) |

## Neden açılmadı (risk)

1. **HashRouter + SW cache uyumsuzluğu** — `#/route` precache miss, sonsuz reload riski (`RISK_REGISTER.md` R-T06).
2. **Bilinçli kill-switch** — Eski bozuk SW ve stale cache temizliği için `sw-unregister.js` React öncesi yükleniyor; manifest eklemek SW'yi açmadan A2HS kısmen çalışabilir ama tutarsız UX yaratır.
3. **CI flake geçmişi** — Workbox precache Linux runner'da fail (`NIHAI_RAPOR.md`, `docs/SISTEM_RISK_ANALIZI_VE_FAZ0.md`).

## Bu turda yapılan

- Kod değişikliği **yapılmadı** (risk > fayda).
- SW kill-switch **korundu**.

## S5 açılış planı (öneri sıra)

1. `public/manifest.json` — isim, `theme_color: #0B1120`, `display: standalone`, mevcut `icon-192.png` / `favicon.svg` (icon-512 üret veya `gen:assets`).
2. `index.html` — `<link rel="manifest" href="/manifest.json">` (SW olmadan minimal).
3. HashRouter → pathname migrasyon veya SW **network-first** navigation stratejisi doğrulandıktan sonra kill-switch kaldır.
4. `vite-plugin-pwa` — yalnızca CI yeşil + staging smoke sonrası; `_vite_utf8.ts` referans alınabilir.
5. Smoke: A2HS prompt manuel QA; Playwright offline senaryosu ayrı test.

## Sahiplik

- **Frontend (manifest + link):** Cursor lane — S5-T04
- **SW stratejisi + kill-switch kaldırma:** Claude Code / DevOps — S5-T05, staging doğrulama zorunlu
