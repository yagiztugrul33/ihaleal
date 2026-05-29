# Bundle Final Audit — R12 Kapanış

**Tarih:** 2026-05-30  
**HEAD lokal:** `6331110` | **Canlı prod:** `index-CWwyApsU.js`

---

## 1. Canlı vs lokal

| Ortam | Largest chunk | Boyut | Budget (819 KB) |
|---|---|---:|---|
| **Production (Vercel)** | `index-CWwyApsU.js` | **929.7 KB** | ❌ FAIL |
| **Lokal build (HEAD)** | `vendor-charts-*.js` | **455.9 KB** | ✅ PASS |
| **Lokal + R6 fix branch** | `vendor-charts-*.js` | **455.9 KB** | ✅ PASS (`CI=true`) |

**Kök neden (prod fail):** Canlı deploy R6 `manualChunks` fix **öncesi** — tek monolitik index (~930 KB). Feature branch `feat/r6-ci-bundle-budget-fix` (`8ef0c10`) merge bekliyor.

---

## 2. Lokal vendor chunk envanteri (HEAD build)

| Chunk | Boyut | İçerik |
|---|---:|---|
| `vendor-charts` | 455.9 KB | recharts |
| `jspdf.es.min` | 390.3 KB | PDF export (lazy route) |
| `index` (main) | 300.3 KB | app shell |
| `vendor-react` | 232.8 KB | react + router |
| `vendor-supabase` | 204.4 KB | @supabase |
| `html2canvas.esm` | 202.4 KB | PDF export (lazy) |
| `index.es` | 159.8 KB | — |
| `TileLayer` / leaflet | 153.4 KB | harita modülleri |
| `vendor-motion` | 125.8 KB | framer-motion |
| `vendor-ui` | 86.3 KB | lucide-react |

**check-bundle-budget.mjs:** limit **819200 B** — lokal ✅

---

## 3. En büyük 10 lazy chunk (lokal)

| Chunk | ~KB | Parent route / özellik |
|---|---:|---|
| `AuctionDetail` | 70.5 | `/ilan/:id` |
| `vendor-zod` | 53.0 | shared |
| `Anayasa400` | 46.5 | `/anayasa-400` |
| `Analytics` | 46.9 | `/analiz` |
| `BorsaPage` | 38.0 | `/borsa` |
| `CreateAuction` | 26.6 | `/ihale-ac` |
| `CommissionCalculator` | 24.7 | `/komisyon-hesaplayici` |
| `WarRoomPage` | 23.8 | intelligence |
| `ParselZekasiPage` | 20.7 | modül |
| `KkaParselStudioPage` | 20.8 | KKA |

Modül sayfaları çoğunlukla 15–25 KB lazy bandında.

---

## 4. AfetDisasterHub / PremiumCinematic

| Bileşen | Durum (HEAD) | Bundle etkisi |
|---|---|---|
| `AfetDisasterHub` | ✅ `AfetRiskHaritasiPage`'e wire (`6331110`) | Lazy modül chunk — ana index'e girmez |
| `PremiumCinematicHome` | Sync import `Home.tsx` | ~79 KB index şişmesi (N3) |
| `buildAssistantReply` | Tree-shake (ChatWidget tüketmiyor) | 0 KB ana bundle |

**Faz A-5 sonrası:** GES/Değerleme workbench'leri lazy; `advancedValuation.ts` eksikse değerleme chunk compile riski ayrı.

---

## 5. jspdf + html2canvas (N2 PDF)

| Paket | Chunk | Lazy? |
|---|---|---|
| jspdf | 390 KB | ✅ dynamic import (`PropertyAnalysisReportViewer`) |
| html2canvas | 202 KB | ✅ dynamic import |

**N2 durumu:** PDF export **canlı kodda var** (lazy). İlk tıklamada ~590 KB indirilir — kabul edilebilir.

**Optimizasyon seçenekleri:**

| Seçenek | Tasarruf | Efor |
|---|---|---|
| PDF butonunu ayrı route'a taşı | İlk paint −0 | 0 |
| jspdf custom build (subset font) | ~50–100 KB | 2–3 saat |
| Sunucu tarafı PDF (Edge) | client −590 KB | 1 sprint |

---

## 6. Öneri tablosu

| # | Optimizasyon | KB etkisi | Süre | Öncelik |
|---|---|---:|---|---|
| O1 | **R6 PR merge + redeploy** | prod 930→~300 index | 30 dk | 🔴 |
| O2 | PremiumCinematicHome lazy (N3) | index −60~80 KB | 1–2 saat | 🟡 |
| O3 | Console PR merge | minimal | 15 dk | 🟢 |
| O4 | jspdf subset | −50~100 KB lazy | 2–3 saat | 🟢 |
| O5 | ChatWidget → engine rewire | engine chunk +15 KB lazy | 1 saat | 🟡 |

---

## 7. Aksiyon

1. Merge `feat/r6-ci-bundle-budget-fix` → main → Vercel redeploy
2. Redeploy sonrası prod index < 350 KB + vendor-charts ayrı chunk doğrula
3. `npm run verify` CI yeşil
