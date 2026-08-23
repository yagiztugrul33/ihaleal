# Edge Functions — Deploy Status

**Tarih:** 2026-05-30 akşam (10-komut zinciri re-test)  
**Production Supabase:** `https://wsjifesrdaeorrdzbvmk.supabase.co`  
**Yöntem:** Anon POST test + bundle string grep (salt-okuma)

---

## Deploy edilmemiş (404 NOT_FOUND)

| Function | UI / kod konumu | Etki |
|---|---|---|
| **`pvgis_solar`** | `pvgisClient.ts`, `/modul/ges-analizi` | GES analizi tam canlı PVGIS verisi almayabilir |
| **`nearby-poi`** | R13.2 plan — henüz kod yok | POI API yok |
| **`post_chat_message`** | `Messages.tsx`, `postChatMessageClient.ts` | Mesaj gönderiminde Edge fail; `/mesajlar` akışı kısıtlı |
| **`tcmb_yiufe`** | `tcmbYiUfeClient.ts`, Vergi simülatörü metti | TCMB Yİ-ÜFE canlı seri yok → demo/fallback |
| **`payments-iyzico`**, **`payments-paytr`** | Ödeme akışları (henüz prod PSP yok) | Beklenen — ürün kararı öncesi deploy yok |
| **`place_bid`** (underscore) | Eski isim | **404** — deploy adı `place-bid` (tire) |

---

## Deploy edilmiş (anon POST → 401, auth gerekli — NORMAL)

| Function | Auth / KYC | Not |
|---|---|---|
| **`ai_qa`** | Evet | ✅ **2026-05-30 re-test: 401** (404 değil) |
| **`earthquakes_latest`** | Anon read hedef | ✅ **401** POST (deployed; auth/CORS — OPTIONS 200) |
| **`ai-price-estimate`** | Evet; KYC verified hedeflenir | Bid/AI fiyat akışı |
| **`place-bid`** | Evet (auth) | Teklif RPC zinciri |
| **`kyc-submit`** | Evet (auth) | KYC başvuru |
| **`bulk-listing-ingest`** | Evet (admin) | Toplu ilan |
| **`matching-fanout`** | Evet (cron/internal) | Eşleştirme fan-out |

**401 anon test = deployed** — oturum/KYC/admin token gerekir.

---

## Önceki durum (2026-05-29 sabah) — güncellendi

| Function | Eski | Yeni (2026-05-30) |
|---|---|---|
| `ai_qa` | 404 | **401** ✅ deployed |
| `earthquakes_latest` | 404 | **401** ✅ deployed |
| `pvgis_solar` | 404 | **404** (değişmedi) |

---

## REST (Edge değil, referans)

| Endpoint | Anon status | Anlam |
|---|---|---|
| `listings?select=id&limit=1` | **200** `[]` | OK |
| `auctions?select=id&limit=1` | **200** `[]` | OK |
| `profiles?select=id&limit=1` | **401** | Sprint 3 RLS **NORMAL** |
| `auth/v1/health` | **200** | GoTrue OK |

---

## Master karar matrisi

| Seçenek | Artı | Eksi | Öneri |
|---|---|---|---|
| **A — Tümünü deploy** | UI tam fonksiyonel | Secrets eksikse **500**; maliyet/ops | Erken prod riskli |
| **B — UI'da devre dışı** | Temiz console | Feature loss | Demo/staging |
| **C — Selektif deploy** | Görünen modüller çalışır | Kademeli ops | **Önerilen** |

### C seçeneği — önerilen sıra (~30 dk, master müsaitken)

```bash
# Supabase CLI (Dashboard Secrets önce)
supabase secrets set OPENAI_API_KEY=sk-...

supabase functions deploy ai_qa
supabase functions deploy earthquakes_latest
supabase functions deploy pvgis_solar
# tcmb_yiufe — vergi simülatörü canlı veri istenirse
# post_chat_message — /mesajlar prod öncesi
# payments-* — PSP kararı sonrası
```

**Ön koşul:** `ALLOWED_ORIGINS`, `OPENAI_API_KEY` (ai_qa), PVGIS/deprem harici API anahtarları (varsa).

---

## ChatWidget ile ilişki

- **Mount anında ping yok** — lazy; kullanıcı QA modunda mesaj gönderince `ai_qa` çağrılır.
- Deploy yokken master Network'te **404 gürültüsü** görür; site sağlam kalır.
- Detay: [`AI_CHATWIDGET_REWIRE.md`](./AI_CHATWIDGET_REWIRE.md)

---

## Ne zaman

- **Şimdi değil zorunlu** — site HTTP 200, crash yok.
- **Bu hafta:** C seçeneği (ai_qa + earthquakes_latest + pvgis_solar) master Supabase Dashboard erişimi ile.

---

**Son güncelleme:** 2026-05-29 — Cursor FINAL audit (prod curl kanıtı)
