# N Kuyruğu Raporu (N1–N6)

**Tarih:** 2026-05-30  
**Önkoşul:** 6 migration canlı apply edildi, RLS 0 açık, smoke 36/36 (M14 sonrası)

---

## Özet

| İş | Durum | Commit |
|----|-------|--------|
| N1 Gerçek veri doğrulama | ✅ | `bbecc9f` |
| N2 view_count tetikleme | ✅ | `d5da20d` |
| N3 Rating ortalama gösterim | ✅ | `df95db1` |
| N4 Teklif bildirimi | ✅ (CC-apply bekliyor) | `f2f3781` |
| N5 Arama alarmı eşleştirme | ✅ (CC-apply bekliyor) | `61728a9` |
| N6 Rapor | ✅ | _(bu commit)_ |

---

## N1 — Apply sonrası gerçek veri (PASS/FAIL)

| Özellik | Canlı tablo/kolon | Frontend | Sonuç |
|---------|-------------------|----------|-------|
| listing_reviews | `listing_reviews` | `ListingReviewDialog.tsx:35` insert; `useSellerProfile.ts:38-46` select | **PASS** |
| listing_offers | `listing_offers` | `listingOffersClient.ts` insert/update/select; sealed: `listingOffers.ts:16-24` | **PASS** |
| saved_searches | `saved_searches` | `savedSearchesClient.ts:37-88` CRUD | **PASS** |
| is_featured | `listings.is_featured` | `supabaseAuctionsFetch.ts:26-27` → `remoteAuctionsMapper.ts:105` → kart rozeti | **PASS** |
| view_count | `listings.view_count` | fetch: mapper; artırma: N2 | **PASS** (N2 ile tam) |

**Düzeltme:** `PGRST205`/`42P01` sessiz boş dönüş kaldırıldı — `listingOffersClient.ts`, `savedSearchesClient.ts`, `useSellerAnalytics.ts`, `useSellerProfile.ts`, `useNotifications.ts`.

---

## N2 — view_count

- `src/lib/listingViewCount.ts:1-36` — `sessionStorage` ile oturum başına tek RPC
- `src/pages/AuctionDetail.tsx:182-185` — detay açılışında `incrementListingView`
- `src/pages/AuctionDetail.tsx:746-751` — görüntülenme rozeti
- `src/hooks/useSellerAnalytics.ts:38-81` — satıcı analitik `view_count` kolonu
- Test: `src/lib/listingViewCount.test.ts` (2 PASS)

---

## N3 — Rating ortalama

- `src/lib/listingReviews/listingReviewsClient.ts` — batch özet (listing + seller)
- `src/hooks/useListingRatings.ts` — kart listesi için hook
- `src/components/trust/RatingSummaryBadge.tsx` — yıldız + “Henüz yorum yok”
- `src/sections/Auctions.tsx:211,365` — ilan kartında ortalama
- `src/pages/AuctionDetail.tsx:752` — detay başlığında ortalama
- `src/pages/Profile.tsx:35-36` + `SellerTrustCard.tsx:30-36` — profil (önceden vardı, canlı veri)

---

## N4 — Teklif bildirimi

**CC-apply:** `supabase/migrations/20260601200000_listing_offer_notifications.sql`

- Trigger `listing_offers_notify` — INSERT → satıcıya `listing_offer_new`
- UPDATE status → alıcıya `listing_offer_status` (accepted/rejected/countered)
- UI: `NotificationBell` + `useNotifications.ts` (M12 canlı)

---

## N5 — Arama alarmı

**CC-apply:** `supabase/migrations/20260601210000_saved_search_listing_trigger.sql`

- Fonksiyon `saved_search_listing_matches` — kriter karşılaştırma (query, city, category, price)
- Trigger `listings_saved_search_match` — INSERT/aktif status → `saved_search_match` notification
- İstemci tamamlayıcı: `useSavedSearches.ts:44-70` (katalog yüklendiğinde eşleşme)

---

## CC-apply bekleyen (sıra)

7. `20260601200000_listing_offer_notifications.sql` — teklif bildirimi trigger
8. `20260601210000_saved_search_listing_trigger.sql` — kayıtlı arama trigger

_(Önceki 6 migration M0–M14’te apply edildi.)_

---

## Kapı kanıtı (N6)

- `npm run typecheck` — exit 0
- `npx eslint <dokunulan dosyalar>` — exit 0
- `npm run build` — exit 0
- `npm run smoke` — **36/36 PASS** (2026-05-30)

---

## Kısıt uyumu

- Register.tsx + RPC: dokunulmadı
- core RLS / place-bid: dokunulmadı
- OG prerender / Vercel middleware: dokunulmadı
