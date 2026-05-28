-- Kritik tabloların RLS policy detayı (salt-okuma).
-- Hedef: GRANT açtığımızda PII sızıntı / yetkisiz erişim olmasın.

-- profiles policies (PII kritik — başka kullanıcıların profile'ı görünmemeli)
select 'profiles_policies' as k,
  string_agg(
    policyname || ' [cmd=' || cmd || ' roles=' || roles::text ||
    ' qual=' || left(coalesce(qual, 'null'), 100) || ']',
    E'\n'
    order by policyname
  ) as v
from pg_policies where schemaname='public' and tablename='profiles'

union all

-- listings policies (public browse: anon active listings görüyor mu)
select 'listings_policies',
  string_agg(
    policyname || ' [cmd=' || cmd || ' roles=' || roles::text ||
    ' qual=' || left(coalesce(qual, 'null'), 100) || ']',
    E'\n'
    order by policyname
  )
from pg_policies where schemaname='public' and tablename='listings'

union all

-- auctions policies
select 'auctions_policies',
  string_agg(
    policyname || ' [cmd=' || cmd || ' roles=' || roles::text ||
    ' qual=' || left(coalesce(qual, 'null'), 100) || ']',
    E'\n'
    order by policyname
  )
from pg_policies where schemaname='public' and tablename='auctions'

union all

-- bids policies (own-only mu, public mı)
select 'bids_policies',
  string_agg(
    policyname || ' [cmd=' || cmd || ' roles=' || roles::text ||
    ' qual=' || left(coalesce(qual, 'null'), 100) || ']',
    E'\n'
    order by policyname
  )
from pg_policies where schemaname='public' and tablename='bids'

union all

-- bid_deposits policies
select 'bid_deposits_policies',
  string_agg(
    policyname || ' [cmd=' || cmd || ' roles=' || roles::text ||
    ' qual=' || left(coalesce(qual, 'null'), 100) || ']',
    E'\n'
    order by policyname
  )
from pg_policies where schemaname='public' and tablename='bid_deposits'

union all

-- watchlist policies (authenticated INSERT/DELETE için)
select 'watchlist_policies',
  string_agg(
    policyname || ' [cmd=' || cmd || ' roles=' || roles::text ||
    ' qual=' || left(coalesce(qual, 'null'), 100) || ']',
    E'\n'
    order by policyname
  )
from pg_policies where schemaname='public' and tablename='watchlist'

union all

-- notifications policies
select 'notifications_policies',
  string_agg(
    policyname || ' [cmd=' || cmd || ' roles=' || roles::text ||
    ' qual=' || left(coalesce(qual, 'null'), 100) || ']',
    E'\n'
    order by policyname
  )
from pg_policies where schemaname='public' and tablename='notifications';
