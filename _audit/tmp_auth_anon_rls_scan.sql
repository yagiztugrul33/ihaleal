-- authenticated/anon GRANT detayı + RLS-disabled tablolar (salt-okuma).
-- Hedef: web canlı SELECT yapan akışların hangi rolde grant gerek netleşsin.

-- 1) authenticated SELECT'i olan TÜM tablolar (sample 8/47 sayımının liste'si)
select '1_auth_SELECT_tables' as k,
  coalesce(string_agg(table_name, ', ' order by table_name), 'NONE') as v
from information_schema.role_table_grants
where table_schema='public' and grantee='authenticated' and privilege_type='SELECT'

union all

-- 2) anon SELECT'i olan TÜM tablolar (sample 2/47)
select '2_anon_SELECT_tables',
  coalesce(string_agg(table_name, ', ' order by table_name), 'NONE')
from information_schema.role_table_grants
where table_schema='public' and grantee='anon' and privilege_type='SELECT'

union all

-- 3) Kritik 5 tablo spesifik durumu (web ihale/profil/bid akışları)
select '3_listings_auth_SELECT',
  case when exists (select 1 from information_schema.role_table_grants
                    where table_schema='public' and table_name='listings'
                      and grantee='authenticated' and privilege_type='SELECT')
       then 'GRANTED' else 'MISSING (web ihale listesi kırık)' end
union all
select '3_listings_anon_SELECT',
  case when exists (select 1 from information_schema.role_table_grants
                    where table_schema='public' and table_name='listings'
                      and grantee='anon' and privilege_type='SELECT')
       then 'GRANTED' else 'MISSING (public ihale listesi kırık)' end
union all
select '3_profiles_auth_SELECT',
  case when exists (select 1 from information_schema.role_table_grants
                    where table_schema='public' and table_name='profiles'
                      and grantee='authenticated' and privilege_type='SELECT')
       then 'GRANTED' else 'MISSING (own profile read kırık)' end
union all
select '3_bids_auth_SELECT',
  case when exists (select 1 from information_schema.role_table_grants
                    where table_schema='public' and table_name='bids'
                      and grantee='authenticated' and privilege_type='SELECT')
       then 'GRANTED' else 'MISSING (own bids list kırık)' end
union all
select '3_auctions_auth_SELECT',
  case when exists (select 1 from information_schema.role_table_grants
                    where table_schema='public' and table_name='auctions'
                      and grantee='authenticated' and privilege_type='SELECT')
       then 'GRANTED' else 'MISSING (auction page kırık)' end
union all
select '3_bid_deposits_auth_SELECT',
  case when exists (select 1 from information_schema.role_table_grants
                    where table_schema='public' and table_name='bid_deposits'
                      and grantee='authenticated' and privilege_type='SELECT')
       then 'GRANTED' else 'MISSING (deposit history kırık)' end

union all

-- 4) RLS DISABLED tablolar (grant verince herkes okur — güvenlik açığı kontrolü)
select '4_RLS_DISABLED_tables',
  coalesce((select string_agg(c.relname, ', ' order by c.relname)
            from pg_class c join pg_namespace n on n.oid=c.relnamespace
            where n.nspname='public' and c.relkind='r' and not c.relrowsecurity),
           'NONE - tüm tablolar RLS ENABLED (grant açmak güvenli)')

union all

-- 5) Per-table RLS+policy özet (kritik 5 tablo için)
select '5_listings_rls_policies',
  (select case when c.relrowsecurity then 'RLS=ON, '
               else 'RLS=OFF, ' end ||
          (select count(*)::text from pg_policies where schemaname='public' and tablename='listings') ||
          ' policy'
   from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relname='listings')
union all
select '5_profiles_rls_policies',
  (select case when c.relrowsecurity then 'RLS=ON, '
               else 'RLS=OFF, ' end ||
          (select count(*)::text from pg_policies where schemaname='public' and tablename='profiles') ||
          ' policy'
   from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relname='profiles')
union all
select '5_bids_rls_policies',
  (select case when c.relrowsecurity then 'RLS=ON, '
               else 'RLS=OFF, ' end ||
          (select count(*)::text from pg_policies where schemaname='public' and tablename='bids') ||
          ' policy'
   from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relname='bids')
union all
select '5_auctions_rls_policies',
  (select case when c.relrowsecurity then 'RLS=ON, '
               else 'RLS=OFF, ' end ||
          (select count(*)::text from pg_policies where schemaname='public' and tablename='auctions') ||
          ' policy'
   from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relname='auctions')

union all

-- 6) RLS-enabled ama policy=0 olan tablolar (RLS varsa policy yoksa hiçbir rol okuyamaz)
select '6_RLS_on_policy_zero',
  coalesce((select string_agg(c.relname, ', ' order by c.relname)
            from pg_class c join pg_namespace n on n.oid=c.relnamespace
            where n.nspname='public' and c.relkind='r' and c.relrowsecurity
              and not exists (select 1 from pg_policies
                              where schemaname='public' and tablename=c.relname)),
           'NONE');
