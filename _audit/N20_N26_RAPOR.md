# N20–N26 Rapor

**Tarih:** 2026-05-30 · **Kapı:** typecheck ✅ · eslint ✅ · build ✅ · smoke 36/36 ✅

## Özet

| İş | Durum | Commit | CC-apply / deploy |
|----|-------|--------|-------------------|
| N20 Geofence R13.1 | ✅ | `8a7e2c9` | `20260603100000_user_geofence_preferences.sql` |
| N21 Borsa derinleştirme | ✅ | (bu push) | `borsa_etl` edge CC-deploy |
| N22 PDF yaygınlaştırma | ✅ | (bu push) | — |
| N23 E-imza MVP | ✅ | (bu push) | `20260603110000_signatures.sql` |
| N24 AI chat MVP | ✅ | (bu push) | `ai_qa` billing bekliyor |
| N25 Güvenlik tarama | ✅ | (bu push) | pentest listesi `_audit/GUVENLIK_SON_TARAMA.md` |
| N26 Rapor | ✅ | (bu push) | — |

---

## N20 — Geofence

**PANTSIR öncesi:** R13.1 ❌ YOK (`PANTSIR_DURUM.md`)  
**Sonrası:** 🟡 MVP + CC-apply bekliyor

| Kanıt | Dosya:satır |
|-------|-------------|
| Haversine | `src/lib/geo/haversine.ts` |
| Yakın ilan | `src/lib/geofence/geofenceEngine.ts:findNearbyListings` |
| watchPosition | `src/hooks/useGeofenceWatch.ts:90-94` |
| KVKK rıza | `GeofenceSettingsPanel.tsx:59-63` |
| Ayarlar UI | `Settings.tsx:97-105` |
| Global watcher | `Layout.tsx` → `GeofenceWatcher` |
| Unit test 3/3 | `geofenceEngine.test.ts` |

**Test senaryosu:** Kadıköy koordinat + 800m yarıçap → `geofenceEngine.test.ts` PASS. Canlı bildirim migration CC-apply + kullanıcı izni sonrası.

---

## N21 — Borsa

| Özellik | Kanıt |
|---------|-------|
| Endeks trend (Recharts) | `BorsaAnalyticsDashboard.tsx:72-99` |
| Bölge karşılaştırma | aynı dosya `compareA` / `compareB` |
| İşlem hacmi grafiği | `BorsaAnalyticsDashboard.tsx:107-125` |
| Bölge sıralama / fırsat | `useBorsaAnalytics.ts:rankings` |
| Borsa veri sekmesi | `BorsaPage.tsx` → `BorsaAnalyticsDashboard` |
| Watchlist bölge izleme | `BorsaWatchlistPage.tsx` + `useBorsaRegionWatchlist.ts` |
| ETL edge | `supabase/functions/borsa_etl/index.ts` |

**CC-deploy:** `supabase functions deploy borsa_etl` + `INTERNAL_CRON_SECRET` cron.

---

## N22 — PDF

| Belge | Kanıt |
|-------|-------|
| Ortak şablon | `src/lib/pdf/pdfBuilder.ts:downloadStructuredPdf` |
| İlan detay | `AuctionDetail.tsx` → `downloadListingPdf` |
| KKA sonuç | `KkaParselStudioPage.tsx` |
| Sözleşme taslağı | `AgencyContractView.tsx` |
| Proje raporu | `MuteahhitProjeDetayPage.tsx` |
| Ekspertiz (mevcut) | `PropertyAnalysisReportViewer.tsx:76-97` html2canvas |

---

## N23 — E-imza MVP

| Kanıt | Dosya |
|-------|-------|
| Canvas imza | `SignaturePad.tsx` |
| Hash + kayıt | `signatureClient.ts` |
| Migration RLS | `20260603110000_signatures.sql` |
| Hukuki not | `_audit/EIMZA_NOTU.md` |

Konumlandırma: **ön onay imzası**, yasal e-imza değil.

---

## N24 — Chat / sanal temsilci

| Kanıt | Dosya |
|-------|-------|
| Senaryo chip'leri | `ChatWidget.tsx` CHAT_SCENARIOS |
| Temsilci devir | `/mesajlar` navigate |
| XSS strip | `sanitizeChatInput` |
| Sesli not | `_audit/CALL_CENTER_NOTU.md` |

---

## N25 — Güvenlik

`_audit/GUVENLIK_SON_TARAMA.md` — RLS CC-apply bekleyenler, npm audit 1 moderate (ws).

---

## CC-apply / deploy kuyruğu (canlı)

1. `20260603100000_user_geofence_preferences.sql`
2. `20260603110000_signatures.sql`
3. Edge deploy: `borsa_etl`
4. Önceki kuyruk: N16 notification migrations (varsa)

## Kısıtlara uyum

- Register.tsx / core RLS: **dokunulmadı**
- Gerçek veri: listings + borsa tabloları; boşsa demo fallback (`useLiveMarket.ts:213-217`)
