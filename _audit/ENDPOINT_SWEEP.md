# Canlı Endpoint Tam Sweep — R12 Final

**Tarih:** 2026-05-30  
**Hedef:** `https://ihaleal.vercel.app`  
**Kaynak route listesi:** `src/App.tsx` (HEAD `6331110`)  
**Yöntem:** HTTP GET, parametresiz 118 path, iPhone Safari UA

---

## 1. Önemli not — SPA davranışı

Vercel `rewrites`: tüm path → `/index.html`. Bu yüzden **HTTP 200 = HTML kabuğu**; client-side 404 ayrı test (HashRouter `/#/path`). Bu sweep **sunucu katmanı** sağlığını ölçer.

---

## 2. Özet

| Metrik | Sonuç |
|---|---:|
| Test edilen statik path | **118** |
| iPhone Safari UA 200 | **118** |
| 4xx/5xx | **0** |
| CRITICAL HTTP fail | **Yok** |

---

## 3. Örnek path tablosu (modül + kritik)

| PATH | Normal | iPhone | Not |
|---|---:|---:|---|
| `/` | 200 | 200 | Home shell |
| `/sss` | 200 | 200 | R12.6 zengin SSS |
| `/hizmet-bedelleri` | 200 | 200 | R12.6 |
| `/komisyon-hesaplayici` | 200 | 200 | R12.6.b |
| `/borsa` | 200 | 200 | Borsa lazy (shell) |
| `/modul/bina-risk-sorgu` | 200 | 200 | Faz A |
| `/modul/canli-deprem-takip` | 200 | 200 | Faz A |
| `/modul/kentsel-donusum` | 200 | 200 | Faz A-2 |
| `/modul/deprem-egitimi` | 200 | 200 | Faz A-3 |
| `/modul/deprem-egitimi/ders-1` | 200 | 200 | Ders route fix (`b11f8b6`) |
| `/modul/yapay-zeka-hasar-tahmini` | 200 | 200 | Faz A-4 |
| `/modul/degerleme` | 200 | 200 | Faz A-5 |
| `/modul/ges-analizi` | 200 | 200 | Faz A-5 |
| `/modul/afet-risk-haritasi` | 200 | 200 | AfetDisasterHub wire (`6331110`) |

Tam 118 path listesi: `src/App.tsx` grep `path="..."` (parametresiz).

---

## 4. Canlı bundle string scan

**Production index:** `/assets/index-CWwyApsU.js` — **929.7 KB** (tek monolitik chunk, R6 fix deploy öncesi)

| String | Main index'te |
|---|---|
| Türkiye / Gayrimenkul Borsası | ✅ |
| Komisyon Hesaplayıcı | ✅ |
| Hizmet Bedelleri | ✅ |
| Bina Risk / Canlı Deprem | ✅ |
| Kentsel Dönüşüm | ❌ (lazy chunk — beklenen) |
| Deprem Eğitimi | ❌ (lazy) |
| Yapay Zeka Hasar | ❌ (lazy) |
| `buildAssistantReply` | ❌ (tree-shake — ChatWidget eski motor) |
| `AfetDisasterHub` | ❌ (lazy — modül chunk'ta) |
| `ihaleal-logo` | ✅ path string |
| `ihaleal_com_logo` | ❌ kullanılmıyor |

**Sonuç:** Ana bundle core marketing + fees metinlerini taşıyor; modül metinleri lazy split'te (canlıda henüz ayrı chunk deploy görünmüyor — tek index).

---

## 5. Sprint 3 RLS sağlık (anon REST)

**Base:** `wsjifesrdaeorrdzbvmk.supabase.co/rest/v1` (anon key, public)

| Tablo | Beklenen | Ölçülen |
|---|---|---|
| `listings?select=id&limit=1` | 200 + `[]` | ✅ 200, len=2 |
| `auctions?select=id&limit=1` | 200 + `[]` | ✅ 200, len=2 |
| `profiles?select=id&limit=1` | **401** (RLS) | ✅ **401** |

**Sprint 3 RLS:** ✅ Sağlıklı — anon catalog okunur, profil sızmaz.

---

## 6. CRITICAL listesi

**HTTP katmanında CRITICAL yok.**

Takip (client-side / deploy):

| ID | Konu | Öncelik |
|---|---|---|
| E1 | Prod tek chunk 930 KB — R6 PR merge + redeploy | 🟡 |
| E2 | HashRouter smoke (`/#/modul/...`) Playwright ile | 🟢 |
| E3 | `advancedValuation.ts` eksik → `/modul/degerleme` runtime risk | 🔴 |

---

## 7. Doğrulama komutu (tekrar)

```powershell
# iPhone UA — tek path
Invoke-WebRequest -Uri "https://ihaleal.vercel.app/modul/deprem-egitimi" -UserAgent "Mozilla/5.0 (iPhone...) Safari/604.1" -UseBasicParsing
```
