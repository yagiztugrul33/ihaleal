# ihaleal.com — mimari özet (repo içi tek kaynak)

Bu depo **Vite + React 19 + TypeScript** ile tek sayfa uygulamasıdır; **HashRouter** kullanılır (`/#/…` URL biçimi). Üretim dağıtımı ve DNS/HTTPS **bulut** tarafında tanımlıdır (ör. `ihalevar-platform/docs/investor-weekend-work-plan-tr.md` §8).

## Veri ve backend

| Katman | Açıklama |
|--------|----------|
| **Supabase Auth** | Oturum: `@supabase/supabase-js` (`src/lib/supabase.ts`), PKCE. |
| **Supabase Postgres** | İlan (`listings`), ihale (`auctions`), teklif (`bids`), vb. Şema: `supabase/migrations/*.sql`. |
| **Manuel SQL** | `supabase db push` kullanılmıyor; Dashboard **SQL Editor** ile `manual_push_v2.sql` … `manual_push_v4.sql` sırası. |
| **RPC** | `place_bid` (teklif + teminat + anti-sniping). |
| **Edge Functions** | `supabase/functions/place_bid` şablon (deploy kullanıcı ortamında). |

## Ön uç akışı

```text
index.html → main.tsx → ErrorBoundary → App → AuthProvider → HashRouter → Layout → Routes
```

- **Katalog:** `src/lib/auctionsSource.ts` — yerel `localStorage`, statik `src/data/`, uzak `fetchRemoteAuctionsCatalog` birleşimi.
- **İlan oluşturma:** `CreateAuction.tsx` → `listings.insert` + `auctions.insert`; başarıda `/ihale/:id`.
- **Detay:** `AuctionDetail.tsx` — katalog + UUID ihalelerde `useAuctionRealtime`.
- **Admin:** `/#/admin` — `AdminGuard` + `AdminDashboard`. Tam RLS için `manual_push_v4.sql`.

## Realtime (canlı ihale)

Supabase Dashboard → **Database → Replication**: `public.auctions` için yayını açın; istemci `useAuctionRealtime` ile `postgres_changes` dinler. Açılmazsa ilk `select` ile gelen değerler korunur, güncelleme gelmez.

## Kimi / içerik

- **STATE:** `docs/sync/STATE.md`
- **Inbox:** `docs/sync/inbox/` — gövde metinleri kullanıcı/Kimi ile tamamlanır.

## Güvenlik

- **Anon key** yalnızca istemci; **service_role** yalnızca `scripts/` (seed).
