# Production readiness audit — ihaleal.com

**Tarih:** 2026-04-29 · **Kapsam:** repo gerçeği + yapılan iyileştirmeler.

## Özet cevap: “Production-ready mi?”

**Henüz tam değil.** Statik SPA + Supabase mimarisi canlıya çıkarılabilir; ancak **ödeme kuruluşu entegrasyonu**, **Edge/BFF ile hassas işlem doğrulaması**, **yük testi** ve **avukat onaylı sözleşmeler** olmadan “kurumsal production-ready” iddiası yapılmamalıdır.

## Bu turda düzeltilen / eklenenler

| Alan | Ne yapıldı |
|------|------------|
| Teklif UX | `AuctionDetail`: Sunucu kaynaklı ilanlar için `place_bid` RPC + minimum tutar (`minNextBidTry` / `fees.ts`) |
| Anti-sniping | `supabase/migrations/20260430150000_profiles_role_place_bid_antisniping.sql` — son 120 sn uzatma + `min_increment_try` |
| Profil şema | `profiles.role` opsiyonel sütun — AuthContext uyumu |
| Realtime | `useAuctionRealtime`: DELETE olayında yanlış güncelleme önlendi |
| Admin | `AdminDashboard`: Supabase özet sayımları (RLS uyarılarıyla) |
| Test | `placeBid.test.ts` — minimum teklif matematiği |

## Kalan kritik riskler (repo dışı işler)

1. **JWT / oturum:** Anon anahtar tarayıcıda; üretimde kritik işlemler için BFF veya Edge doğrulaması.
2. **Ödeme:** Çift tahsilat önlemi için idempotency sunucuda zorunlu; ÖHS webhook imzası.
3. **Rate limit:** İstemci debounce yeterli değil; API Gateway / Edge rate limit şart.
4. **Redis:** Önbellek repo’da yok — ölçek için ayrı katman (bkz. `docs/PRODUCTION_PLATFORM_MASTER.md`).
5. **Admin RLS:** Tam liste sayımı için `listings_select_admin` vb. politikaların DB’de olması gerekir.

## Deploy

1. `npm ci` → `npm run verify`
2. Supabase: migrasyonları sırayla uygula (`20260430150000...` dahil).
3. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Vercel env).
4. `npm run build` → `dist` → Vercel (`vercel.json` SPA rewrite).

## Son 10 dakika checklist

- [ ] `npm run verify` yeşil
- [ ] Production Supabase URL + anon key doğru proje
- [ ] `place_bid` RPC uzak DB’de güncel (antisniping migration)
- [ ] Admin kullanıcıda `is_admin = true` test edildi
- [ ] Canlı ihale satırında teklif denendi (staging)
