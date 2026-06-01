# Kurumsal Demo Hazırlık Raporu

Tarih: 2026-05-16
Branch: feat/v2-foundation-20260516
Vercel URL: https://ihaleal.vercel.app

## Demo Sayfalari

- [x] / (landing + CorporateBanner)
- [x] /kurumsal
- [x] /kurumsal/iletisim
- [x] /kurumsal/dashboard

## Router

OrganizationDashboard ROUTER'A BAGLI: **EVET**

Route'lar `src/App.tsx` icinde tanimli.

## Build

- `npm run typecheck`: basarili
- `npm run build`: basarili

## Demo Veriler

- SQL: `supabase/seed/demo_seed.sql` (organizations + listings, seller_id uyumlu)
- Calistirmak icin: Supabase SQL Editor veya `supabase db execute` (link gerekli)

## Manuel Isler

1. Supabase Dashboard → Extensions: pgcrypto, citext, vector, pg_cron, pg_net, pgmq
2. `supabase db push` (v2 migration'lar timestamp on ekli)
3. `supabase secrets set` OPENAI_API_KEY, ANTHROPIC_API_KEY, INTERNAL_CRON_SECRET
4. Edge functions deploy
5. Storage: bulk-uploads, kyc-documents bucket'lari
6. Demo seed calistir (profiles tablosunda en az 1 kullanici olmali)

## Kurumsal Müşteriye Söylenecek

Bu canli surum bir demonstration. Production trafik icin KYC entegrasyonu, CRM/RETS API ve white-label opsiyonu 3-4 haftada custom paket olarak teslim edilebilir.
