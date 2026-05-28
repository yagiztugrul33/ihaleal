-- Faz 4 production durumu canlı tespit (SELECT-only).
-- pgmq + pg_cron + pg_net extension + GUC + cron job + queue tabloları.

select 'extensions' as k,
  coalesce(string_agg(extname, ',' order by extname), 'NONE') as v
from pg_extension where extname in ('pgmq','pg_cron','pg_net')
union all
select 'pgmq_rpcs',
  coalesce(string_agg(proname, ',' order by proname), 'NONE')
from pg_proc where pronamespace='public'::regnamespace
  and proname in ('pgmq_send','pgmq_read','pgmq_delete')
union all
select 'pgmq_queue_tables',
  coalesce((select string_agg(table_name, ',' order by table_name)
            from information_schema.tables
            where table_schema='pgmq' and table_name like 'q_%'), 'NONE')
union all
select 'cron_job',
  case when exists (select 1 from pg_extension where extname='pg_cron')
       then coalesce((select to_regclass('cron.job')::text), 'pg_cron_loaded_but_table_missing')
       else 'pg_cron_extension_yok' end
union all
select 'schema_migrations_faz4',
  case when exists (select 1 from supabase_migrations.schema_migrations where version='20260516120400')
       then 'PRESENT' else 'ABSENT' end
union all
select 'GUC_functions_url',
  coalesce(nullif(current_setting('app.functions_url', true), ''), 'NOT_SET')
union all
select 'GUC_cron_secret_set',
  case when nullif(current_setting('app.cron_secret', true), '') is null
       then 'NOT_SET' else 'SET' end
union all
select 'pgmq_in_other_migrations',
  case when exists (select 1 from supabase_migrations.schema_migrations where statements::text ilike '%pgmq%')
       then 'REFERENCED' else 'NOT_REFERENCED' end;
