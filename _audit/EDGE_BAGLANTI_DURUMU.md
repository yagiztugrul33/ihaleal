# Edge bağlantı durumu (2026-05-30)

Supabase `supabase/functions/` altındaki edge fonksiyonları ve frontend bağlantı özeti.

| Edge | Frontend çağrısı | Dosya | Durum |
|------|------------------|-------|-------|
| `post_chat_message` | `functions.invoke` | `src/lib/chat/postChatMessageClient.ts` | ✅ H1 — Messages + ilan mesajlaşma |
| `kyc-submit` | `functions.invoke` | `src/lib/kyc/kycSubmitClient.ts` | ✅ H2 — KycSimulation |
| `pvgis_solar` | `functions.invoke` + GET fetch | `src/lib/data/pvgisClient.ts` | ✅ H3 — POST destekli |
| `ai_qa` | `functions.invoke` | `src/lib/systemQaClient.ts`, `ChatWidget` | ✅ (fail-closed H4) |
| `nearby-poi` | `functions.invoke` | `src/hooks/useNearbyPOI.ts` | ✅ |
| `tcmb_yiufe` | `functions.invoke` | `src/lib/tax/tcmbYiUfeClient.ts` | ✅ |
| `earthquakes_latest` | `fetch` GET | `src/components/home/LiveEarthquakeTicker.tsx` | ✅ |
| `place-bid` | `fetch` POST | `src/features/auctions/hooks/useAuctionState.ts` | ✅ |
| `place_bid` | — | RPC doğrudan `src/lib/placeBid.ts` | 🟡 Edge duplicate; RPC tercih |
| `payments-iyzico` | — | — | ⏸ Ürün kararı — bağlama |
| `payments-paytr` | — | — | ⏸ Ürün kararı — bağlama |
| `matching-fanout` | — | — | 📋 Sonra — eşleştirme batch |
| `bulk-listing-ingest` | — | — | 📋 Sonra — kurumsal toplu ilan |
| `ai-price-estimate` | — | — | 📋 Sonra — `/analiz` derinleştirme |

## Deploy bekleyen (Claude Code)

1. `ai_qa` — fail-closed rate limit (H4 kod hazır)
2. `pvgis_solar` — POST body desteği (H3 kod hazır)
3. `post_chat_message` — zaten deploy; migration chat tabloları
4. `kyc-submit` — storage policy + `kyc_verifications` migration

## Deprecated / birleştir

- `place_bid` vs `place-bid`: İki edge; istemci `place-bid` fetch + `place_bid` RPC kullanıyor. Tek isimde birleştirme önerilir (deploy kararı).
