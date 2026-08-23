# Mock temizlik raporu (M12 — 2026-06-01)

Tarama: `src/` içinde `demo|mock|DEMO_|placeholder|yakında` + kullanıcıya görünen sahte özellik.

## Gerçekleştirildi (canlı backend / graceful)

| Dosya | Değişiklik |
|-------|------------|
| `NotificationBell.tsx` | `DEMO_NOTIFICATIONS` kaldırıldı → `useNotifications` + Supabase; giriş yoksa boş + link |
| `InvestorDashboard.tsx` (M10) | `AUCTIONS` statik → `loadAllAuctionsForSearch` + `useFavorites` |
| `SavedSearchesPanel.tsx` (M10) | Kayıtlı arama + `notifications` insert (tablo yoksa graceful) |
| `Favorites.tsx` | Zaten `useFavorites` + watchlist (önceki sprint) |

## Gizlendi (prod'da görünmez)

| Dosya | Sebep |
|-------|--------|
| `Analytics.tsx:949` | `ListingLinkDemo` yalnız `import.meta.env.DEV` |
| `UserPanel.tsx` profil/ihalelerim placeholder | Kısmi — tekliflerim/gelen-teklifler canlı (M7); diğer sekmeler hâlâ stub |

## Bilinçli bırakıldı (sebep)

| Alan | Sebep |
|------|--------|
| `demoAuctionCatalog` / `AUCTIONS` katalog fallback | Supabase yokken arama/liste crash etmesin |
| `payment.ts` mock refs | Gerçek PSP kararı yok (`docs/SISTEM_RISK_ANALIZI_VE_FAZ0.md`) |
| `KycSimulation`, `/auth/edevis-mock` | Geliştirici/demo rota; nav'da yok |
| `BorsaPage` mockTrades | Borsa simülasyon UI; canlı order book ayrı faz |
| `LoyaltyProgramPage` DEMO_LEADERBOARD | Lansman dışı gamification; nav sınırlı |
| `CommissionCalculator` mock notu | Bilgilendirme simülasyonu; ödeme motoru değil |
| `ai/assistantEngine` DEMO_WARNING | Yasal sınır metni — kaldırılmamalı |

## Kalan (lansman sonrası)

- UserPanel: profil, ihalelerim, komisyon stub → backend bağlantısı
- Borsa watchlist: `localStorage` (`borsa_watchlist_ids`) — listing watchlist ile birleştirme
- Loyalty / leaderboard tamamen canlı veya gizle kararı

## Commit

- M12 mock: `NotificationBell`, `Analytics` ListingLinkDemo gizleme
- Rapor: bu dosya
