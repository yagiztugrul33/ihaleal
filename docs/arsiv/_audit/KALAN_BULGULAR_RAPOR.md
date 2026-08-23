# Kalan Bulgular Raporu — H1–H6

**Tarih:** 2026-05-30  
**Dal:** `main` (origin’den ahead)  
**Kısıt:** `Register.tsx` + RPC migration **dokunulmadı**. Edge **deploy edilmedi** (Claude Code).

---

## Özet

| Görev | Durum | Commit | Smoke |
|-------|-------|--------|-------|
| H1 Mesajlaşma → post_chat_message | ✅ | `6434641` | 36/36 PASS |
| H2 KYC → kyc-submit | ✅ | `4ca2004` | 36/36 PASS |
| H3 pvgis_solar 405 | ✅ | `82e2fc4` | 36/36 PASS |
| H4 ai_qa fail-closed | ✅ | `82e2fc4`* | 36/36 PASS |
| H5 Edge envanter | ✅ | `eac18af` | — |
| H6 Gizli crash avı | ✅ 0 crash | `81e9920` | **36/36 PASS** |

\* H4 kodu H3 ile aynı commit’te (`supabase/functions/ai_qa/index.ts`); deploy ayrı.

**Kapı:** `tsc` 0 · `build` yeşil · `smoke` **36/36 PASS** (desktop + iPhone 13)

---

## H1 — post_chat_message frontend

**Sorun:** Edge deploy vardı; demo thread id’leri (`t1`) UUID olmadığı için `functions.invoke` hiç tetiklenmiyordu.

**Çözüm:**
- `src/lib/chat/chatSupabase.ts` — thread/mesaj SELECT, `ensureListingChatThread`
- `src/hooks/useChatThreads.ts` — oturum + `?listing=` query ile canlı thread
- `src/pages/Messages.tsx` — remote yükleme, edge sonrası mesaj refresh
- `src/pages/AuctionDetail.tsx:1132` — MessageSquare → `/mesajlar?listing={id}`

**Graceful:** `chat_*` tablo yoksa demo thread’ler kalır.

---

## H2 — KYC verify

**Dosyalar:**
- `src/lib/kyc/kycSubmitClient.ts` — `kyc-submit` invoke
- `src/hooks/useKycStatus.ts` — `profiles.kyc_status` + `kyc_verifications`
- `src/pages/mega/KycSimulation.tsx` — belge yükleme (`uploadFile` project-docs) + durum UI

---

## H3 — pvgis_solar 405

**Kök neden:** Edge yalnızca GET; `functions.invoke` varsayılan POST → 405.

**Çözüm:**
- `supabase/functions/pvgis_solar/index.ts` — GET + POST `{ lat, lon, tilt, aspect, year }`
- `src/lib/data/pvgisClient.ts` — önce `invoke`, GET fetch yedek, sonra direct PVGIS
- `src/lib/data/pvgisClient.test.ts` — body shape testi

**Çağıran sayfalar:** `GesAnalysisPage`, `siteEnvironmentalData`, `/modul/ges-analizi`

---

## H4 — ai_qa fail-open → fail-closed

**Dosya:** `supabase/functions/ai_qa/index.ts:31-48`

**Değişiklik:** `rl_consume` erişilemez / RPC hata → **503** `rate_limit_unavailable` (istek reddedilir). Kota aşımı → **429**. Fail-open kaldırıldı.

**Deploy bekliyor:** `supabase functions deploy ai_qa`

---

## H5 — Edge denetimi

**Rapor:** `_audit/EDGE_BAGLANTI_DURUMU.md`

**Bağlı (9):** post_chat_message, kyc-submit, pvgis_solar, ai_qa, nearby-poi, tcmb_yiufe, earthquakes_latest, place-bid, place_bid (RPC)

**Bekleyen / ürün kararı:** payments-*, matching-fanout, bulk-listing-ingest, ai-price-estimate

---

## H6 — Gizli crash avı

**Araç:** `scripts/smoke.mjs` — 18 rota × 2 viewport = **36 kontrol**

**Yeni rotalar:** `/konut-kredisi-hesaplayici`, `/modul/ges-analizi`, `/uluslararasi`, `/kampanyalar`, `/mesajlar`, `/kyc`

**Sonuç:** **0 pageerror / 0 console.error** (Footer Gavel benzeri yeni crash yok)

---

## Deploy bekleyen (Claude Code sırası)

1. `supabase functions deploy ai_qa` — fail-closed rate limit (H4)
2. `supabase functions deploy pvgis_solar` — POST body (H3)
3. Migration: `20260504140000_chat_messages_compliance_stub.sql` — H1 canlı mesaj
4. Migration + storage: KYC `project-docs` policy — H2

---

## Kalan açık bulgular + lansman

| Bulgu | Etki |
|-------|------|
| Edge deploy edilmedi | Canlı ortamda H3/H4 davranışı eski kalır |
| Chat/KYC tabloları migration bekliyor | UI graceful demo modunda |
| Unit test drift (Home/Navbar) | `verify` tam yeşil değil; smoke yeşil |
| Ödeme edge’leri | Bilinçli bağlanmadı |

**Staging/demo:** GO (smoke 36/36)  
**Prod lansman:** NO-GO — edge deploy + migration + env

---

*Rapor: Cursor agent — Kalan Bulgular kuyruğu.*
