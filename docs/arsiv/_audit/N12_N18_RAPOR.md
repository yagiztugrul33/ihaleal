# N12–N18 Rapor

**Tarih:** 2026-05-29

## Commit'ler

| İş | Hash |
|----|------|
| N12 | `45aa3e8` |
| N13 | `cb21418` |
| N14 | `1e8f808` |
| N15 | `493e8b9` |
| N16 | `b792f5d` |
| N17 | `a81086d` |
| N18 | `b99c7b6` |

---

## Özet tablo

| İş | Durum | Kanıt (dosya:satır) |
|----|-------|---------------------|
| N12 Statik güvenlik | Tamam | `_audit/STATIK_GUVENLIK_TARAMA.md`; `uploadFile.ts:29-58` |
| N13 Rehber sistemi | Tamam | 8 rehber; `realEstateGuides.ts`; `/rehber/:slug` |
| N14 600+ sayfa | Tamam | **6633** URL; `public/sitemap-programmatic.xml` |
| N15 Panel zenginleştirme | Tamam | `UserPanelOverview.tsx`; `UserPanel.tsx` |
| N16 Bildirim tam | Tamam | `20260602100000_notification_triggers_prefs.sql` (CC-apply) |
| N17 Arama gelişmiş | Tamam | `SearchAutocomplete.tsx`; `MapPolygonSearchInner.tsx`; popularity sort |
| N18 Rapor | Tamam | Bu dosya |

---

## N12 — Güvenlik

- Rapor: `_audit/STATIK_GUVENLIK_TARAMA.md`
- Düzeltme: `src/lib/uploadFile.ts:29-40` path traversal sanitize
- npm audit: 2 moderate; kritik/yüksek yok
- **Claude Code crafted-test listesi:** raporda § Claude Code

---

## N13 — Rehber (8 sayfa)

`ev-alirken-dikkat-edilecekler`, `ihaleye-nasil-girilir`, `tapu-islemleri`, `kredi-rehberi`, `muteahhitle-anlasma`, `kira-sozlesmesi`, `ekspertiz-nedir`, `kka-nedir` → `/rehber/:slug`

---

## N14 — Sitemap

Toplam programmatic sitemap: **6633 URL** (81 il × ilçe × tip kombinasyonları + borsa il + rehber).

---

## CC-apply bekleyen

1. `20260601200000_listing_offer_notifications.sql`
2. `20260601210000_saved_search_listing_trigger.sql`
3. `20260602100000_notification_triggers_prefs.sql`
