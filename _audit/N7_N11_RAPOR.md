# N7–N11 Kuyruk Raporu

**Tarih:** 2026-05-30  
**Önkoşul:** N1–N6 tamamlandı; backend canlı; smoke 36/36

---

## Özet

| İş | Durum | Commit |
|----|-------|--------|
| N7 Canlı kullanıcı sayacı | ✅ | `6ec0de4` |
| N8 Pantsir denetim + POI hibrit | ✅ | `1606617` |
| N9 Programatik SEO (1908 sayfa) | ✅ | `7d941ea` |
| N10 Buton zenginleştirme | ✅ | `211610c` |
| N11 Rapor | ✅ | `2cf43a0` |

---

## N7 — Presence

- `src/hooks/useOnlinePresence.ts:1-56` — Supabase Realtime `site_presence_v1` channel, `presence.track`
- `src/lib/presence/presenceSessionId.ts` — anonim `sessionStorage` id
- `src/components/presence/OnlinePresenceBadge.tsx` — 🟢 X kişi çevrimiçi
- `src/components/Navbar.tsx:301` — header (xl+)
- `src/pages/Home.tsx:15` — anasayfa
- Test: `presenceSessionId.test.ts` (2 PASS)
- Tablo gerekmez (in-memory presence)

---

## N8 — Pantsir

Rapor: `_audit/PANTSIR_DURUM.md`

| R13 | Sonuç |
|-----|-------|
| R13.1 geofence | ❌ (~14s, CC-apply migration gerekir) |
| R13.2 nearby-poi | ✅ ilan detay konum sekmesi |
| R13.3 TÜİK/MEB | ❌ (~25s ETL) |
| R13.4 Pantsir UI | ✅ hibrit canlı POI (`PantsirPanel.tsx`) |
| R13.5 mobile | ❌ (~14s, ayrı repo) |

---

## N9 — Programatik SEO

- **1908 sayfa** (`programmaticSeoPageCount()` — test doğruladı)
- Route: `/satilik/:il`, `/kiralik/:il`, `/:deal/:il/:segment` (ilçe veya tip)
- 81 il × 387 ilçe × 6 tip × 2 deal
- `src/pages/ProgrammaticSeoLanding.tsx` — ilan filtresi + `price_index` + breadcrumb
- `public/sitemap-programmatic.xml` — 1908 URL
- `public/sitemap-index.xml` — ana + programatik index
- `scripts/generate-programmatic-sitemap.mjs`

---

## N10 — Buton zenginleştirme

- `ListingQuickActions.tsx` — kart: favori, karşılaştır, WA, link kopyala
- `Auctions.tsx:352` — kart aksiyonları
- `AuctionDetail.tsx:704-718` — yazdır, harita, benzer ara, favori, paylaş, karşılaştır
- `SearchFilterChips.tsx` + `SearchResults.tsx` — aktif filtre çipleri + temizle

---

## CC-apply bekleyen (Pantsir / geofence)

- `user_geofences` migration (R13.1) — henüz yazılmadı
- TÜİK/MEB ETL tabloları (R13.3) — henüz yazılmadı

---

## Kapı kanıtı

- `npm run typecheck` — exit 0
- eslint (dokunulan dosyalar) — exit 0
- `npm run build` — exit 0
- `npm run smoke` — **36/36 PASS**
- `programmaticSeo.test.ts` — 1908 ≥ 600 PASS

---

## N1–N6 hatırlatma (CC-apply sıra 7–8)

7. `20260601200000_listing_offer_notifications.sql`
8. `20260601210000_saved_search_listing_trigger.sql`
