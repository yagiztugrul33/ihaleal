# Bundle Final Audit — 10-Komut Zinciri (R6 + R13 öncesi)

**Tarih:** 2026-05-30 akşam  
**HEAD audit:** `c2c020f` · **Canlı prod:** `index-BH3oeyCz.js`

---

## 1. Canlı vs lokal (güncel)

| Ortam | Largest chunk | Boyut | Budget (819 KB) |
|---|---|---:|---|
| **Production (ihaleal.com)** | `vendor-charts-DUXOCkR2.js` | **445.2 KB** | ✅ PASS |
| **Production index shell** | `index-BH3oeyCz.js` | **300.3 KB** | ✅ PASS |
| **Önceki prod (R6 öncesi)** | `index-CWwyApsU.js` | ~930 KB | ❌ FAIL |

**Kök neden çözüldü:** R6 `manualChunks` fix (`99f8c39` / `99f8f39`) main + Vercel redeploy → vendor split aktif.

---

## 2. Canlı HTML entry chunks (7 adet)

| Chunk | ~KB | İçerik |
|---|---:|---|
| `index-BH3oeyCz.js` | 300.3 | App shell, router, marketing |
| `vendor-charts-DUXOCkR2.js` | 445.2 | recharts |
| `vendor-react-DbBl4joo.js` | 227.2 | react + router |
| `vendor-supabase-dTDx1jjQ.js` | 203.3 | @supabase |
| `vendor-motion-*` | ~126 | framer-motion (ref) |
| `vendor-ui-*` | ~86 | lucide-react (ref) |
| `vendor-zod-*` | ~53 | zod (ref) |

**check-bundle-budget (819200 B):** largest **vendor-charts 455888 B** ✅

---

## 3. R13 lazy chunk durumu (doğrulama)

| Bileşen | Beklenen chunk | Prod taraması | Repo |
|---|---|---|---|
| **`PantsirPanel.tsx`** | `AuctionDetail-*` veya `PantsirPanel-*` | ❌ String yok | ❌ Dosya yok |
| **`NearbyPOIList.tsx`** | lazy POI | ❌ String yok | ❌ Dosya yok |
| **`vendor-leaflet`** | Harita modülleri | 🟡 Route lazy load (ilk HTML'de yok) | ✅ vite.config R6 |

**Sonuç:** R13.4 + R13.2 **bundle'a henüz girmedi** — sprint plan aşamasında ([`R13_PANTSIR_PLAN.md`](./R13_PANTSIR_PLAN.md)).

---

## 4. Mevcut lazy chunk'lar (referans — önceki lokal build)

| Chunk | ~KB | Route |
|---|---:|---|
| `AuctionDetail` | 70.5 | `/ilan/:id` |
| `BorsaPage` | 38.0 | `/borsa` |
| `CreateAuction` | 26.6 | `/ihale-ac` |
| `ParselZekasiPage` | 20.7 | modül |
| Modül sayfaları | 15–25 | `/modul/*` |

---

## 5. jspdf + html2canvas (N2 PDF)

| Paket | ~KB | Lazy |
|---|---:|---|
| jspdf | 390 | ✅ dynamic import |
| html2canvas | 202 | ✅ dynamic import |

**N2:** ✅ Canlı — ilk PDF tıklamasında indirilir.

---

## 6. Tamamlanan optimizasyonlar

| # | İş | Commit | Durum |
|---|---|---|---|
| O1 | R6 manualChunks + vendor-leaflet | `99f8f39` | ✅ **Prod'da doğrulandı** |
| O2 | Console cleanup | `d564a04` | ✅ main |
| O3 | PremiumCinematic split (N3) | — | ⏸️ Düşük öncelik |

---

## 7. Sonraki bundle etkisi (R13 plan)

| Paket | Tahmini ek KB | Not |
|---|---:|---|
| R13.4 PantsirPanel | +15–25 lazy | AuctionDetail chunk büyür |
| R13.2 NearbyPOIList | +10–20 lazy | Leaflet zaten ayrı |
| R13.1 geofence UI | +20 lazy | Harita + form |

**Risk:** vendor-charts 445 KB — yeni feature lazy tutulursa budget margin yeterli (~%45 boş).

---

## 8. Aksiyon

1. ✅ R6 prod doğrulandı — monolit sorun kapandı
2. ⏳ R13.4 merge sonrası `PantsirPanel` string scan tekrar
3. ⏳ v0.12.8 tag → TS 0 hata sonrası
