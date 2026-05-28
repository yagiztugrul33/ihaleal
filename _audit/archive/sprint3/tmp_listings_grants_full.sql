-- Listings GRANT kapsamlı tespit (PUBLIC + tüm roller).
-- Edge function 500 db_error: service_role'de SELECT yok hipotezi.

select 'all_grants_listings' as k,
  coalesce(string_agg(
    grantee || ':' || privilege_type,
    ', '
    order by grantee, privilege_type
  ), 'NONE') as v
from information_schema.role_table_grants
where table_schema='public' and table_name='listings'
union all
-- PUBLIC explicit grant
select 'public_grant_listings',
  coalesce((select string_agg(privilege_type, ',')
            from information_schema.role_table_grants
            where table_schema='public' and table_name='listings' and grantee='PUBLIC'), 'NONE')
union all
-- Default ACL on table (pg_class.relacl)
select 'listings_relacl',
  coalesce((select array_to_string(c.relacl, ' | ')
            from pg_class c join pg_namespace n on n.oid=c.relnamespace
            where n.nspname='public' and c.relname='listings'), 'NULL')
union all
-- Karşılaştırma için profiles (default Supabase pattern — herkes SELECT genelde)
select 'profiles_grants',
  coalesce(string_agg(
    grantee || ':' || privilege_type,
    ', '
    order by grantee, privilege_type
  ), 'NONE')
from information_schema.role_table_grants
where table_schema='public' and table_name='profiles'
  and grantee in ('service_role', 'authenticated', 'anon')
union all
-- bids da karşılaştırma
select 'bids_grants',
  coalesce(string_agg(
    grantee || ':' || privilege_type,
    ', '
    order by grantee, privilege_type
  ), 'NONE')
from information_schema.role_table_grants
where table_schema='public' and table_name='bids'
  and grantee in ('service_role', 'authenticated', 'anon');
