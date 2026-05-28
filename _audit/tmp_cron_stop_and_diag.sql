-- İŞ 1: cron job geçici durdur (reversible — cron.schedule ile geri açılır)
-- İŞ 2: listings tablosu db_error root cause araştırması (salt-okuma)

-- ────────────────────────────────────────────────────────────────────────
-- İŞ 1 — cron unschedule
-- ────────────────────────────────────────────────────────────────────────

select cron.unschedule('matching-fanout-every-minute') as unschedule_result;

-- ────────────────────────────────────────────────────────────────────────
-- İŞ 2 — Tespit raporu (UNION)
-- ────────────────────────────────────────────────────────────────────────

select 'cron_after_unschedule' as k,
  case when exists (select 1 from cron.job where jobname='matching-fanout-every-minute')
       then 'STILL_PRESENT (FAIL)' else 'REMOVED (OK)' end as v
union all
-- listings RLS aktif mi
select 'listings_rls_enabled',
  case when (select c.relrowsecurity from pg_class c
             join pg_namespace n on n.oid=c.relnamespace
             where n.nspname='public' and c.relname='listings')
       then 'ENABLED' else 'DISABLED' end
union all
-- listings policy detayları
select 'listings_policies',
  coalesce(string_agg(
    policyname || ' [cmd=' || cmd || ' roles=' || roles::text ||
    ' qual=' || left(coalesce(qual, 'null'), 80) || ']',
    E'\n'
    order by policyname
  ), 'NONE')
from pg_policies where schemaname='public' and tablename='listings'
union all
-- listings rowcount (production trafiği)
select 'listings_rowcount',
  (select count(*)::text from public.listings)
union all
-- listings table grants (service_role bypass için gerekli mi?)
select 'listings_grants_relevant',
  coalesce(string_agg(grantee || ':' || privilege_type, ',' order by grantee, privilege_type), 'NONE')
from information_schema.role_table_grants
where table_schema='public' and table_name='listings'
  and grantee in ('service_role', 'authenticator', 'postgres', 'anon', 'authenticated')
union all
-- service_role var mı, ne yetkilerde
select 'service_role_exists',
  case when exists (select 1 from pg_roles where rolname='service_role')
       then 'EXISTS (bypassrls=' ||
            (select case when rolbypassrls then 'YES' else 'NO' end from pg_roles where rolname='service_role') || ')'
       else 'MISSING' end
union all
-- net response detayı (cron unschedule sonrası daha tetik olmaz, son 5 entry)
select 'net_recent_5_responses',
  coalesce((select string_agg(
              created::text || ' | status=' || status_code::text || ' | body=' || left(coalesce(content::text, 'null'), 80),
              E'\n'
              order by created desc)
            from (select status_code, content, created
                  from net._http_response
                  where created >= now() - interval '10 minutes'
                  order by created desc limit 5) sub), 'NONE')
union all
-- listings'in yeni eklenen kolonları kontrolü (Faz 2/3 sonrası)
select 'listings_critical_columns_check',
  case when exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='listings' and column_name='matched_at'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='listings' and column_name='organization_id'
  ) then 'matched_at + organization_id BOTH EXIST'
  else 'AT LEAST ONE MISSING' end;
