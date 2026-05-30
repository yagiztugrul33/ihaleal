# Pantsir (R13) Durum Denetimi

**Tarih:** 2026-05-30  
**Denetim:** N8 kuyruk

---

## Özet

| Kod | Konu | Durum | Dosya |
|-----|------|-------|-------|
| R13.1 | Geofence konum bildirim | ❌ | — (kod yok) |
| R13.2 | nearby-poi edge + frontend | ✅ | `useNearbyPOI.ts`, `ListingNearbyPoiSection.tsx` |
| R13.3 | TÜİK/MEB sosyo-ekonomik ETL | ❌ | — (kod yok) |
| R13.4 | Pantsir UI (AI Analiz tab) | 🟡→✅ | `PantsirPanel.tsx` (canlı POI ile hibrit) |
| R13.5 | Mobil geofence | ❌ | ayrı `ihaleal-mobile` worktree |

---

## R13.1 — Geofence konum bildirimi

**Durum:** ❌ YOK

- `grep geofence src/` → 0 eşleşme
- Plan: `_audit/R13_PANTSIR_PLAN.md` — `user_geofences` tablosu + matching-fanout genişletme
- **Yapılabilir mi:** Evet (web MVP ~14 saat)
- **CC-apply:** `supabase/migrations/*_user_geofences.sql` (henüz yazılmadı)

---

## R13.2 — nearby-poi (canlı edge)

**Durum:** ✅ CANLI

- Edge invoke: `src/hooks/useNearbyPOI.ts:73-80` — `nearby-poi` function
- İlan detay: `AuctionDetail.tsx:1003-1008` — `ListingNearbyPoiSection` konum sekmesinde
- Fallback: edge fail → boş liste (mock pantsir ayrı katman)

---

## R13.3 — Sosyo-ekonomik veri (TÜİK/MEB)

**Durum:** ❌ YOK

- TÜİK/MEB ingest pipeline yok
- Pantsir skorları POI yoğunluğundan türetiliyor (N8 düzeltmesi)
- **Yapılabilir mi:** Evet (~20–30 saat ETL + CC-apply)
- **Not:** Resmi kaynak entegrasyonu hukuk/veri lisansı gerektirir

---

## R13.4 — Pantsir UI

**Durum:** 🟡 mock → ✅ hibrit (N8)

- Önce: `pantsir-mock.ts` + `PantsirPanel.tsx` tam mock
- Sonra: `PantsirPanel.tsx` — `lat/lng` varsa `useNearbyPOI` × 6 kategori → gerçek skor/POI listesi
- Koordinat yok: önizleme mock (kullanıcıya “önizleme” etiketi)
- `AuctionDetail.tsx:1042` — `mapCoords` geçiriliyor

---

## R13.5 — Mobil geofence

**Durum:** ❌ YOK (beklenen)

- Ayrı mobile repo / worktree; bg location + push yok
- **Yapılabilir mi:** Evet (~12–16 saat, R13.1 web sonrası)
- Web geofence CC-apply olmadan mobile anlamsız

---

## N8 düzeltme commit'i

- `PantsirPanel.tsx` — canlı POI hibrit
- `AuctionDetail.tsx:1042` — lat/lng props

## Kalan iş (öncelik)

1. R13.1 web geofence migration + UI (~14s) — CC-apply
2. R13.3 TÜİK/MEB ETL (~25s) — CC-apply + veri lisansı
3. R13.5 mobile geofence (~14s) — ayrı repo
