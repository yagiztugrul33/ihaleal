-- Tam GRANT kapsam taraması (salt-okuma).
-- 47 public schema tablosu × 4 rol (anon/authenticated/service_role/PUBLIC) × 4 priv (S/I/U/D)
-- Özet: hangi rol-priv kombinasyonunda kaç tablo grant'li.

-- Bölüm 1: Özet sayım (rol+privilege bazında tablo sayısı)
select 'SUMMARY ' || grantee || ':' || privilege_type as k,
  count(distinct table_name)::text || ' / 47 table' as v
from information_schema.role_table_grants
where table_schema='public'
  and grantee in ('anon', 'authenticated', 'service_role', 'postgres', 'PUBLIC')
  and privilege_type in ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
group by grantee, privilege_type

union all

-- Bölüm 2: Per-table snapshot (3 rol × SELECT/INSERT/UPDATE/DELETE)
-- Format: TABLE table_name = anon[siud] auth[siud] service[siud] pub[siud]
-- Her karakter: s=SELECT i=INSERT u=UPDATE d=DELETE, "_" yok
select 'TABLE ' || t.table_name as k,
  'anon=' ||
  case when bool_or(g.grantee='anon' and g.privilege_type='SELECT') then 's' else '_' end ||
  case when bool_or(g.grantee='anon' and g.privilege_type='INSERT') then 'i' else '_' end ||
  case when bool_or(g.grantee='anon' and g.privilege_type='UPDATE') then 'u' else '_' end ||
  case when bool_or(g.grantee='anon' and g.privilege_type='DELETE') then 'd' else '_' end ||
  ' auth=' ||
  case when bool_or(g.grantee='authenticated' and g.privilege_type='SELECT') then 's' else '_' end ||
  case when bool_or(g.grantee='authenticated' and g.privilege_type='INSERT') then 'i' else '_' end ||
  case when bool_or(g.grantee='authenticated' and g.privilege_type='UPDATE') then 'u' else '_' end ||
  case when bool_or(g.grantee='authenticated' and g.privilege_type='DELETE') then 'd' else '_' end ||
  ' srv=' ||
  case when bool_or(g.grantee='service_role' and g.privilege_type='SELECT') then 's' else '_' end ||
  case when bool_or(g.grantee='service_role' and g.privilege_type='INSERT') then 'i' else '_' end ||
  case when bool_or(g.grantee='service_role' and g.privilege_type='UPDATE') then 'u' else '_' end ||
  case when bool_or(g.grantee='service_role' and g.privilege_type='DELETE') then 'd' else '_' end ||
  ' PUB=' ||
  case when bool_or(g.grantee='PUBLIC' and g.privilege_type='SELECT') then 's' else '_' end ||
  case when bool_or(g.grantee='PUBLIC' and g.privilege_type='INSERT') then 'i' else '_' end ||
  case when bool_or(g.grantee='PUBLIC' and g.privilege_type='UPDATE') then 'u' else '_' end ||
  case when bool_or(g.grantee='PUBLIC' and g.privilege_type='DELETE') then 'd' else '_' end
  as v
from information_schema.tables t
left join information_schema.role_table_grants g
  on g.table_schema=t.table_schema and g.table_name=t.table_name
where t.table_schema='public' and t.table_type='BASE TABLE'
group by t.table_name

order by k;
