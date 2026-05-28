-- Edge function 500 db_error kök sebep teşhisi (SELECT-only).
-- Hipotez: service_role key kullanılıyor (RLS bypass) AMA service_role'de
-- listings SELECT GRANT yok → "permission denied for table listings" (GRANT
-- error, RLS değil).

-- Cron durum
select 'cron_matching_fanout' as k,
  case when exists (select 1 from cron.job where jobname='matching-fanout-every-minute')
       then 'STILL_PRESENT (previous unschedule didnt remove)' else 'REMOVED' end as v
union all
-- Edge function service_role key kullanıyor (kanıt: _shared/supabase.ts:5
-- createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, ...))
-- service_role rolünün bypassrls bayrağı:
select 'service_role_bypassrls',
  case when (select rolbypassrls from pg_roles where rolname='service_role')
       then 'YES (RLS bypass aktif)' else 'NO' end
union all
-- Edge function kullandığı 4 tablo için service_role grant'leri
select 'listings_service_role_SELECT',
  case when exists (select 1 from information_schema.role_table_grants
                    where table_schema='public' and table_name='listings'
                      and grantee='service_role' and privilege_type='SELECT')
       then 'GRANTED' else 'MISSING (← KÖK SEBEP)' end
union all
select 'listings_service_role_UPDATE',
  case when exists (select 1 from information_schema.role_table_grants
                    where table_schema='public' and table_name='listings'
                      and grantee='service_role' and privilege_type='UPDATE')
       then 'GRANTED' else 'MISSING (matched_at update için gerek)' end
union all
select 'buyer_preferences_service_role_SELECT',
  case when exists (select 1 from information_schema.role_table_grants
                    where table_schema='public' and table_name='buyer_preferences'
                      and grantee='service_role' and privilege_type='SELECT')
       then 'GRANTED' else 'MISSING (buyer prefs filter için gerek)' end
union all
select 'listing_matches_service_role_INSERT',
  case when exists (select 1 from information_schema.role_table_grants
                    where table_schema='public' and table_name='listing_matches'
                      and grantee='service_role' and privilege_type='INSERT')
       then 'GRANTED' else 'MISSING (match insert için gerek)' end
union all
select 'notifications_service_role_INSERT',
  case when exists (select 1 from information_schema.role_table_grants
                    where table_schema='public' and table_name='notifications'
                      and grantee='service_role' and privilege_type='INSERT')
       then 'GRANTED' else 'MISSING (in_app notif için gerek)' end
union all
-- Sistemik test: kaç public tablo service_role'e SELECT verilmiş?
select 'tables_with_service_role_SELECT_total',
  (select count(distinct table_name)::text
   from information_schema.role_table_grants
   where table_schema='public' and grantee='service_role' and privilege_type='SELECT')
union all
-- Karşılaştırma: public schema toplam tablo sayısı
select 'public_schema_total_tables',
  (select count(*)::text from information_schema.tables
   where table_schema='public' and table_type='BASE TABLE')
union all
-- Sample: hangi tablolarda service_role SELECT var (varsa)
select 'tables_with_service_role_SELECT_sample',
  coalesce((select string_agg(table_name, ', ' order by table_name)
            from (select distinct table_name
                  from information_schema.role_table_grants
                  where table_schema='public' and grantee='service_role' and privilege_type='SELECT'
                  order by table_name limit 5) sub), 'NONE');
