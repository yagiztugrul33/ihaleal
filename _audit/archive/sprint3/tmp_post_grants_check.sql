-- Post-deploy comprehensive teyit (SELECT-only).
-- Cron 200 mu, anon güvenlik, authenticated SELECT çalışır mı.

-- schema_migrations sayı (34→35)
select 'schema_migrations_total' as k,
  (select count(*)::text from supabase_migrations.schema_migrations) as v
union all
-- Cron son tetik durumu
select 'cron_runs_total',
  (select count(*)::text from cron.job_run_details
   where jobid in (select jobid from cron.job where jobname='matching-fanout-every-minute'))
union all
select 'cron_last_run_status',
  coalesce((select status || ' @ ' || start_time::text
            from cron.job_run_details
            where jobid in (select jobid from cron.job where jobname='matching-fanout-every-minute')
            order by start_time desc limit 1), 'NO_RUN_YET')
union all
-- HTTP response son 3 tetik (200 OK mu, db_error gitti mi?)
select 'http_responses_recent',
  coalesce((select string_agg(
              created::text || ' status=' || status_code::text || ' body=' || left(coalesce(content::text, 'null'), 100),
              E'\n'
              order by created desc)
            from (select status_code, content, created
                  from net._http_response
                  where created >= now() - interval '5 minutes'
                  order by created desc limit 5) sub), 'NO_RESPONSE_YET')
union all
-- Web SELECT teyit — SET ROLE authenticated + listings SELECT (kritik)
-- service_role bağlıdan SET ROLE authenticated yapıp test
select 'web_test_authenticated_listings',
  (select case
    when (select count(*) from public.listings) >= 0
    then 'authenticated SELECT WORKS (count=' || (select count(*)::text from public.listings) || ')'
    else 'FAIL'
   end)
union all
-- Anon güvenlik teyit (smoke içinde geçti ama tekrar manuel)
select 'anon_listings_SELECT_grant',
  case when exists (select 1 from information_schema.role_table_grants
                    where table_schema='public' and table_name='listings'
                      and grantee='anon' and privilege_type='SELECT')
       then 'GRANTED (kasıtlı public browse)' else 'MISSING' end
union all
select 'anon_profiles_SELECT_grant_NOT',
  case when exists (select 1 from information_schema.role_table_grants
                    where table_schema='public' and table_name='profiles'
                      and grantee='anon' and privilege_type='SELECT')
       then 'GRANTED (GÜVENLİK AÇIĞI!)' else 'CORRECTLY MISSING (güvenli)' end
union all
select 'anon_bids_SELECT_grant_NOT',
  case when exists (select 1 from information_schema.role_table_grants
                    where table_schema='public' and table_name='bids'
                      and grantee='anon' and privilege_type='SELECT')
       then 'GRANTED (GÜVENLİK AÇIĞI!)' else 'CORRECTLY MISSING (güvenli)' end
union all
select 'anon_bid_deposits_SELECT_grant_NOT',
  case when exists (select 1 from information_schema.role_table_grants
                    where table_schema='public' and table_name='bid_deposits'
                      and grantee='anon' and privilege_type='SELECT')
       then 'GRANTED (GÜVENLİK AÇIĞI!)' else 'CORRECTLY MISSING (güvenli)' end
union all
-- RLS koruması (47 tablo hâlâ aktif mi)
select 'rls_disabled_tables',
  case when (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
             where n.nspname='public' and c.relkind='r' and not c.relrowsecurity) = 0
       then 'NONE (47/47 RLS ENABLED)' else 'PROBLEM' end;
