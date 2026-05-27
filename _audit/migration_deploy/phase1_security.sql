-- ════════════════════════════════════════════════════════════════════════════
-- FAZ 1 — GÜVENLİK FIX'LERİ
-- Hedef: production wsjifesrdaeorrdzbvmk
-- Migrationlar:
--   (1) 20260526200500_harden_rate_limit_buckets_rls.sql
--   (2) 20260521221500_harden_bids_visibility_and_public_views.sql
-- Risk: 🟢 DÜŞÜK (izole; frontend kırılma yok — kanıtlandı)
-- Süre: < 5 dakika
-- Bağımlılık: yok
-- ────────────────────────────────────────────────────────────────────────────
-- KIRILMA ANALİZİ (önceki turda yapıldı):
--   - rate_limit_check, register_bid_deposit, execute_buy_now hepsi SECURITY DEFINER, owner=postgres
--     → postgres rolü RLS bypass (relforcerowsecurity=false) → rate_limit_buckets RLS açılınca etkilenmez
--   - .from('bids') hiçbir frontend dosyada yok (kanıt: grep ana repo + ihaleal-mobile worktree)
--     useAuctionState.ts auctions tablosundan okuyor; AdminDashboard.tsx r.bid_count alanı yine auctions'dan
-- ════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- DEPLOY (atomic, BEGIN/COMMIT — ikinci fail olursa ilki de rollback)
-- ────────────────────────────────────────────────────────────────────────────
BEGIN;

-- (1) RATE LIMIT BUCKETS — RLS aç + service_role only policy
alter table public.rate_limit_buckets enable row level security;

drop policy if exists "rate_limit_buckets_service_only" on public.rate_limit_buckets;
create policy "rate_limit_buckets_service_only" on public.rate_limit_buckets
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- (2) BIDS VISIBILITY — public-read DROP + bidder/seller-only + maskelenmiş public view'lar
drop policy if exists "bids_select_public" on public.bids;
drop policy if exists "bids_select_bidder_or_listing_owner" on public.bids;

create policy "bids_select_bidder_or_listing_owner" on public.bids
  for select using (
    auth.uid() = bidder_id
    or exists (
      select 1
      from public.auctions a
      join public.listings l on l.id = a.listing_id
      where a.id = bids.auction_id
        and l.seller_id = auth.uid()
    )
  );

create or replace view public.auction_bid_public_summary as
select
  b.auction_id,
  count(*)::int as bid_count,
  max(b.amount_try) as highest_bid_try,
  max(b.created_at) as last_bid_at
from public.bids b
group by b.auction_id;

create or replace view public.auction_bid_public_tape as
with ranked as (
  select
    b.auction_id,
    b.id as bid_id,
    b.amount_try,
    b.created_at,
    (
      left(replace(coalesce(b.bidder_id::text, ''), '-', ''), 1)
      || '***' ||
      right(replace(coalesce(b.bidder_id::text, ''), '-', ''), 1)
    ) as bidder_mask,
    row_number() over (
      partition by b.auction_id
      order by b.amount_try desc, b.created_at desc
    ) as depth_rank
  from public.bids b
)
select auction_id, bid_id, amount_try, created_at, bidder_mask, depth_rank
from ranked
where depth_rank <= 20;

grant select on public.auction_bid_public_summary to anon, authenticated;
grant select on public.auction_bid_public_tape to anon, authenticated;

-- schema_migrations tracking kayıtları
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES (
  '20260526200500',
  'harden_rate_limit_buckets_rls',
  ARRAY[
    '-- Manually deployed via supabase db query (CLI) on 2026-05-27. ' ||
    'Canonical: supabase/migrations/20260526200500_harden_rate_limit_buckets_rls.sql. ' ||
    'Scope: ALTER TABLE rate_limit_buckets ENABLE RLS + service_role-only policy. ' ||
    'Closes pre-existing RLS-off + 0-policy security gap.'
  ]::text[]
)
ON CONFLICT (version) DO NOTHING;

INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES (
  '20260521221500',
  'harden_bids_visibility_and_public_views',
  ARRAY[
    '-- Manually deployed via supabase db query (CLI) on 2026-05-27. ' ||
    'Canonical: supabase/migrations/20260521221500_harden_bids_visibility_and_public_views.sql. ' ||
    'Scope: DROP bids_select_public (public-read leak) + restricted policy + 2 masked aggregate views. ' ||
    'Closes confirmed GDPR/bidder-identity exposure.'
  ]::text[]
)
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ────────────────────────────────────────────────────────────────────────────
-- SMOKE — bu blok deploy ile aynı transaction'da çalışmaz; ayrı SELECT'ler
-- ────────────────────────────────────────────────────────────────────────────

-- (S1) rate_limit_buckets RLS aktif mi + policy var mı?
SELECT 'S1 rate_limit_buckets' AS check,
       (SELECT relrowsecurity FROM pg_class WHERE relname='rate_limit_buckets' AND relnamespace='public'::regnamespace) AS rls_on,
       (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='rate_limit_buckets') AS policy_count;

-- (S2) bids policy değişti mi? bids_select_public GİTMELİ, yeni policy gelmeli
SELECT 'S2 bids policies' AS check,
       policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname='public' AND tablename='bids'
ORDER BY policyname;

-- (S3) public view'lar var mı?
SELECT 'S3 public views' AS check,
       string_agg(table_name, ', ' ORDER BY table_name) AS views
FROM information_schema.views
WHERE table_schema='public' AND table_name IN ('auction_bid_public_summary','auction_bid_public_tape');

-- (S4) schema_migrations'a iki yeni kayıt var mı?
SELECT 'S4 schema_migrations new rows' AS check,
       string_agg(version || ':' || name, ', ' ORDER BY version) AS new_versions
FROM supabase_migrations.schema_migrations
WHERE version IN ('20260526200500','20260521221500');

-- (S5) REGRESSION TEST — KYC guard hâlâ çalışıyor mu?
DO $$
DECLARE v_result json;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-aaaa-bbbb-cccc-000000000001', true);
  SELECT public.execute_buy_now(gen_random_uuid(), gen_random_uuid(), 'smoke-phase1') INTO v_result;
  IF v_result->>'code' = 'kyc_required' THEN
    RAISE NOTICE 'S5 REGRESSION OK — KYC guard still returns kyc_required';
  ELSE
    RAISE EXCEPTION 'S5 REGRESSION FAIL — expected kyc_required, got %', v_result;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- REVERSE (sadece acil — bu blok YORUMDA, yanlışlıkla çalışmasın)
-- ────────────────────────────────────────────────────────────────────────────
/*
BEGIN;
-- Geri al: bids_visibility
drop view if exists public.auction_bid_public_tape;
drop view if exists public.auction_bid_public_summary;
drop policy if exists "bids_select_bidder_or_listing_owner" on public.bids;
-- ⚠ DİKKAT: aşağıdaki create policy AÇIĞI GERİ AÇAR — sadece broken-deploy durumunda
create policy "bids_select_public" on public.bids for select using (true);

-- Geri al: rate_limit_buckets
drop policy if exists "rate_limit_buckets_service_only" on public.rate_limit_buckets;
alter table public.rate_limit_buckets disable row level security;

-- schema_migrations tracking'i sil
DELETE FROM supabase_migrations.schema_migrations WHERE version IN ('20260526200500','20260521221500');
COMMIT;
*/
