-- RB1+RB2 ön-kontrol — salt-okuma. corporate_leads + organizations + bid_bonds RLS detayı.

with checks as (
  -- corporate_leads policy detayları
  select 1 as ord, 'corp_leads_policies' as k,
    coalesce((select string_agg(
      policyname || ' [cmd=' || cmd || ' roles=' || roles::text ||
      ' qual=' || coalesce(qual, 'null') || ' with_check=' || coalesce(with_check, 'null') || ']',
      E'\n'
    ) from pg_policies where schemaname='public' and tablename='corporate_leads'), 'NONE') as v

  union all
  -- organizations policy detayları
  select 2, 'organizations_policies',
    coalesce((select string_agg(
      policyname || ' [cmd=' || cmd || ' roles=' || roles::text ||
      ' qual=' || coalesce(qual, 'null') || ' with_check=' || coalesce(with_check, 'null') || ']',
      E'\n'
    ) from pg_policies where schemaname='public' and tablename='organizations'), 'NONE')

  union all
  -- bid_bonds policy detayları
  select 3, 'bid_bonds_policies',
    coalesce((select string_agg(
      policyname || ' [cmd=' || cmd || ' roles=' || roles::text ||
      ' qual=' || coalesce(qual, 'null') || ' with_check=' || coalesce(with_check, 'null') || ']',
      E'\n'
    ) from pg_policies where schemaname='public' and tablename='bid_bonds'), 'NONE')

  union all
  -- bid_bonds prosrc referansı (kimse yazmıyor olmalı)
  select 4, 'bid_bonds_referenced_by_fn',
    coalesce((select string_agg(proname, ', ') from pg_proc p
      join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.prosrc ilike '%bid_bonds%'), 'NONE (orphan teyit)')

  union all
  -- bid_bonds row count
  select 5, 'bid_bonds_rowcount', (select count(*)::text from public.bid_bonds)

  union all
  -- corporate_leads row count
  select 6, 'corporate_leads_rowcount', (select count(*)::text from public.corporate_leads)

  union all
  -- organizations row count
  select 7, 'organizations_rowcount', (select count(*)::text from public.organizations)

  union all
  -- corporate_leads grants (table level)
  select 8, 'corp_leads_grants',
    coalesce((select string_agg(grantee || ':' || privilege_type, ',') from information_schema.role_table_grants
      where table_schema='public' and table_name='corporate_leads' and grantee in ('anon','authenticated','PUBLIC')), 'NONE')

  union all
  -- organizations grants
  select 9, 'organizations_grants',
    coalesce((select string_agg(grantee || ':' || privilege_type, ',') from information_schema.role_table_grants
      where table_schema='public' and table_name='organizations' and grantee in ('anon','authenticated','PUBLIC')), 'NONE')

  union all
  -- bid_bonds grants
  select 10, 'bid_bonds_grants',
    coalesce((select string_agg(grantee || ':' || privilege_type, ',') from information_schema.role_table_grants
      where table_schema='public' and table_name='bid_bonds' and grantee in ('anon','authenticated','PUBLIC')), 'NONE')

  union all
  -- organizations kolonları (org_public_read'ı kısıtlamadan önce hangi alanlar hassas?)
  select 11, 'organizations_columns',
    coalesce((select string_agg(column_name, ',' order by ordinal_position) from information_schema.columns
      where table_schema='public' and table_name='organizations'), 'NONE')

  union all
  -- corporate_leads kolonları
  select 12, 'corp_leads_columns',
    coalesce((select string_agg(column_name, ',' order by ordinal_position) from information_schema.columns
      where table_schema='public' and table_name='corporate_leads'), 'NONE')

  union all
  -- Mevcut org_dashboard_stats secdef false (önceki bulgu — has_org_role check'i ile güvenli)
  select 13, 'org_dashboard_stats_secdef',
    coalesce((select prosecdef::text from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname='org_dashboard_stats' limit 1), 'NOT_FOUND')

  union all
  -- has_org_role var mı (organizations RLS replacement için kullanılabilir)
  select 14, 'has_org_role_exists',
    (exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname='has_org_role'))::text

  union all
  -- corporate_leads tabloya yazan herhangi bir SECDEF RPC var mı (insert facade)?
  select 15, 'corp_leads_writer_fn',
    coalesce((select string_agg(proname, ', ') from pg_proc p
      join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.prosrc ilike '%insert into public.corporate_leads%'), 'NONE (direct insert via RLS)')
)
select ord, k, v from checks order by ord;
