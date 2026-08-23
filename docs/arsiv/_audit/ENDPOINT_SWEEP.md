# Canlı Endpoint Tam Sweep — 10-Komut Zinciri Final

**Tarih:** 2026-05-30 akşam  
**Hedef:** `https://ihaleal.com`  
**Kaynak route:** `src/App.tsx` (HEAD `c2c020f`)  
**Yöntem:** HTTP GET, iPhone Safari UA (`iOS 17 / Safari 604.1`)  
**Prod bundle:** `index-BH3oeyCz.js` (R6 split deploy sonrası)

---

## 1. SPA davranışı

Vercel `rewrites` → tüm path `/index.html`. **HTTP 200 = HTML kabuğu** (HashRouter client route ayrı). Bu sweep **sunucu / CDN katmanı** sağlığını ölçer.

---

## 2. Özet

| Metrik | Sonuç |
|---|---:|
| Test edilen path (kritik sweep) | **73** |
| iPhone Safari UA **200** | **73** |
| 4xx/5xx | **0** |
| CRITICAL HTTP fail | **Yok** |
| Statik route envanter (`App.tsx`) | **~100** (parametreli hariç) |

---

## 3. Modül rotaları (32 route — tamamı 200)

| PATH | Status |
|---|---:|
| `/modul/bina-risk-sorgu` | 200 |
| `/modul/deprem-risk-haritasi` | 200 |
| `/modul/canli-deprem-takip` | 200 |
| `/modul/guclendirme-rehberi` | 200 |
| `/modul/afet-risk-haritasi` | 200 |
| `/modul/parsel-zekasi` | 200 |
| `/modul/kentsel-donusum` | 200 |
| `/modul/afet-toplanma-alanlari` | 200 |
| `/modul/deprem-egitimi` | 200 |
| `/modul/deprem-egitimi/ders-1` … `ders-10` | 200 (×10) |
| `/modul/aile-acil-plan` | 200 |
| `/modul/airbnb-potansiyel` | 200 |
| `/modul/deprem-cantasi` | 200 |
| `/modul/deprem-sigortasi` | 200 |
| `/modul/imar-sorgu` | 200 |
| `/modul/komsuluk-risk-analizi` | 200 |
| `/modul/kredi-pazaryeri` | 200 |
| `/modul/portfoy-yonetimi` | 200 |
| `/modul/renovasyon-roi` | 200 |
| `/modul/sigorta-pazaryeri` | 200 |
| `/modul/tatbikat-rehberi` | 200 |
| `/modul/uzman-randevu` | 200 |
| `/modul/yapay-zeka-hasar-tahmini` | 200 |
| `/modul/yatirim-onerisi` | 200 |
| `/modul/yikilan-binalar-arsivi` | 200 |
| `/modul/degerleme` | 200 |
| `/modul/ges-analizi` | 200 |

---

## 4. Kritik ürün rotaları

| PATH | Status | Not |
|---|---:|---|
| `/` | 200 | Premium home |
| `/sss` | 200 | R12.6 |
| `/hakkimizda` | 200 | |
| `/iletisim` | 200 | |
| `/giris` | 200 | |
| `/kayit` | 200 | |
| `/borsa` | 200 | Lazy shell |
| `/borsa/portfoy` | 200 | |
| `/borsa/izleme` | 200 | |
| `/borsa/analiz` | 200 | |
| `/auctions` | 200 | |
| `/ihaleler` | 200 | |
| `/ilan/prop-001` | 200 | Demo ilan shell |
| `/komisyon-hesaplayici` | 200 | |
| `/hizmet-bedelleri` | 200 | |
| `/arastirma` | 200 | Intelligence hub |
| `/aninda-teklif` | 200 | iBuyer |
| `/kyc` | 200 | |
| `/ihale-ac` | 200 | |

---

## 5. R13 bileşen sweep (bundle string)

| Bileşen | Prod bundle | Repo (`main`) |
|---|---|---|
| `PantsirPanel` | ❌ Yok | ❌ Yok (plan: [`R13_PANTSIR_PLAN.md`](./R13_PANTSIR_PLAN.md)) |
| `NearbyPOIList` | ❌ Yok | ❌ Yok |
| Edge `nearby-poi` | ❌ **404** | ❌ Fonksiyon yok |

**Not:** İlan detay shell 200 döner; Pantsir panel **henüz render edilmez** (R13.4 implement bekliyor).

---

## 6. Canlı bundle (2026-05-30 akşam)

**HTML entry script refs (7 chunk):**

| Chunk | Boyut | Budget 819 KB |
|---|---:|---|
| **`index-BH3oeyCz.js`** | **300.3 KB** | ✅ |
| **`vendor-charts-DUXOCkR2.js`** | **445.2 KB** | ✅ |
| `vendor-react-DbBl4joo.js` | 227.2 KB | ✅ |
| `vendor-supabase-dTDx1jjQ.js` | 203.3 KB | ✅ |
| `vendor-motion-7rVTZgRl.js` | (lazy ref) | ✅ |
| `vendor-ui-BtEWoMxY.js` | (lazy ref) | ✅ |
| `vendor-zod-Dfv_uopb.js` | (lazy ref) | ✅ |

**Önceki prod:** `index-CWwyApsU.js` ~930 KB monolit → **R6 fix (`99f8f39`) deploy edildi** ✅

**Largest chunk:** `vendor-charts` **445 KB** < 819 KB limit ✅

---

## 7. Edge function re-test (2026-05-30 akşam)

**Base:** `https://wsjifesrdaeorrdzbvmk.supabase.co/functions/v1`  
**Yöntem:** Anon POST `{}` (auth yok)

| Function | Status | Yorum |
|---|---:|---|
| **`ai_qa`** | **401** | ✅ Deployed (404 değil) |
| **`earthquakes_latest`** | **401** | ✅ Deployed (anon POST; auth gerekli) |
| **`pvgis_solar`** | **404** | ❌ Hâlâ deploy yok |
| **`nearby-poi`** | **404** | ❌ R13.2 henüz yok |
| `post_chat_message` | 404 | ❌ |
| `place-bid` | 401 | ✅ Deployed |
| `ai-price-estimate` | 401 | ✅ Deployed |

**OPTIONS** `ai_qa` / `earthquakes_latest` → **200** (CORS preflight OK)

---

## 8. Supabase REST (anon key — prod bundle)

| Endpoint | Status | Beklenen |
|---|---:|---|
| `listings?select=id&limit=1` | **200** | ✅ |
| `auctions?select=id&limit=1` | **200** | ✅ |
| `profiles?select=id&limit=1` | **401** | ✅ RLS normal |

---

## 9. CRITICAL / takip

| ID | Konu | Durum |
|---|---|---|
| E1 | Prod bundle monolit | ✅ **ÇÖZÜLDÜ** — split chunk |
| E2 | R13.4 Pantsir UI | 🔴 Plan only |
| E3 | R13.2 POI Edge | 🔴 404 |
| E4 | HashRouter client smoke | 🟢 Playwright önerilir |
| E5 | Fresh tsc 27 hata | 🔴 v0.12.8 öncesi |

---

## 10. Tekrar komutu

```powershell
$UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
Invoke-WebRequest -Uri "https://ihaleal.com/modul/komsuluk-risk-analizi" -UserAgent $UA -UseBasicParsing
```
