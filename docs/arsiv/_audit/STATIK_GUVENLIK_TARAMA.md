# Statik Güvenlik Taraması (N12)

**Tarih:** 2026-05-29  
**Kapsam:** İstemci kodu, Supabase sorguları, upload, bağımlılıklar, gizli anahtar grep.  
**Dış kapsam (Claude Code crafted-test):** Oturum hijacking, CSRF, rate limit, RLS bypass fuzz, place-bid edge.

---

## Özet

| Severity | Bulgu | Durum |
|----------|-------|-------|
| Orta | Storage path traversal (`uploadFile.ts`) | **Düzeltildi** (N12 commit) |
| Düşük | `updateOfferStatus` yalnızca `offerId` ile günceller | RLS’e güveniyor; crafted-test |
| Düşük | `fetchOffersForListing` listingId ile tüm teklifler | RLS sealed görünürlük; crafted-test |
| Bilgi | `npm audit`: 2 moderate (`brace-expansion`, `ws`) | `npm audit fix` ile düzeltilebilir |
| Bilgi | İstemcide hardcoded secret yok | Temiz |
| Bilgi | XSS: tek `dangerouslySetInnerHTML` (Recharts `chart.tsx`) | Statik config; düşük risk |

---

## IDOR / Supabase sorguları

### Güvenli kalıplar (RLS + `auth.uid()`)

| Dosya | Satır | Not |
|-------|-------|-----|
| `src/hooks/useNotifications.ts` | 47–52 | `.eq("user_id", user.id)` |
| `src/hooks/useFavorites.ts` | 58 | `watchlist` — RLS owner |
| `src/lib/offers/listingOffersClient.ts` | 49–54 | `fetchBuyerOffers` — `.eq("buyer_id", buyerId)` |
| `src/lib/offers/listingOffersClient.ts` | 79–83 | `fetchSellerOffers` — önce seller listings |
| `src/lib/savedSearches/savedSearchesClient.ts` | 85 | delete — RLS owner |
| `src/hooks/useSellerAnalytics.ts` | 37 | `.eq("seller_id", user.id)` |

### RLS’e güvenen (crafted-test gerekli)

| Dosya | Satır | Risk | Öneri |
|-------|-------|------|-------|
| `src/lib/offers/listingOffersClient.ts` | 40 | Başkasının teklifini güncelleme | RLS `listing_offers_update_seller` doğrula |
| `src/lib/offers/listingOffersClient.ts` | 113–119 | Listing teklifleri IDOR | Alıcı/sealed politikası DB’de test |
| `src/lib/aiAnalysis.ts` | 184 | Listing update by id | RLS seller-only olmalı |
| `src/hooks/useDeveloperProjects.ts` | 91 | Org filtresi client’ta | RLS org_members |

---

## Input validation

| Dosya | Satır | Durum |
|-------|-------|-------|
| `src/lib/uploadFile.ts` | 60–77 | MIME + boyut + uzantı ✓ |
| `src/lib/uploadFile.ts` | 49–58 | Path segment sanitize ✓ (N12) |
| `src/pages/CorporateContact.tsx` | 24 | Insert — sunucu/RLS |
| `src/sections/Contact.tsx` | 40 | Insert — sunucu/RLS |
| Formlar genel | — | Zod kısmi; edge functions’ta sıkı validation CC-apply |

---

## npm audit (2026-05-29)

```
brace-expansion 5.0.2–5.0.5 — moderate (DoS)
ws 8.0.0–8.20.0 — moderate (memory disclosure)
```

**Düzeltme:** `npm audit fix` (dev transitive; prod bundle etkisi sınırlı).

---

## Hardcoded secret grep

`src/` içinde `service_role`, `sk-`, gerçek `api_key` **0 eşleşme**.  
`password` eşleşmeleri: auth state, route path (`bina-risk-sorgu`), hash yardımcıları — secret değil.

---

## Storage upload

| Kontrol | `uploadFile.ts` | Durum |
|---------|-----------------|-------|
| MIME whitelist | 14–27 | ✓ |
| Boyut limiti | 60–65 | ✓ |
| PDF zorunluluğu (ekspertiz) | 70–72 | ✓ |
| Path traversal | 29–40, 49–58 | ✓ N12 |

---

## Claude Code — crafted-test listesi

1. **listing_offers IDOR:** A kullanıcısı B’nin teklifini `updateOfferStatus(offerId)` ile kabul/red edebilir mi?
2. **Sealed teklif sızıntısı:** Alıcı olmayan kullanıcı `fetchOffersForListing` ile tutarı görür mü?
3. **watchlist / saved_searches:** Başka user_id ile insert/delete.
4. **notifications:** Başka user_id’ye insert (policy `notif_owner_insert` bypass).
5. **Storage RLS:** `listing-photos` bucket’ta başka owner path’ine upload/read.
6. **place-bid / auction:** Teklif manipülasyonu (core RLS — ayrı paket).
7. **Rate limit / brute force:** Login, teklif, mesaj flood.
8. **XSS reflected:** Arama `q` parametresi DOM’a escape ediliyor mu (React default — doğrula).

---

## CC-apply bekleyen migration’lar

- `20260601200000_listing_offer_notifications.sql`
- `20260601210000_saved_search_listing_trigger.sql`
- N16: `20260602100000_notification_triggers_prefs.sql`
