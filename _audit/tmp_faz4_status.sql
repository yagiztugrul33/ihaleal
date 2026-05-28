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
-- Vault pattern (GUC değil — Supabase resmi cron + secret yaklaşımı)
select 'vault_secret_exists',
  case when exists (select 1 from pg_extension where extname='supabase_vault' or extname='vault')
       then case when exists (select 1 from vault.secrets where name='matching_fanout_cron_secret')
                 then 'PRESENT' else 'ABSENT' end
       else 'vault_extension_yok' end
union all
select 'vault_secret_decryptable',
  case when exists (select 1 from pg_extension where extname='supabase_vault' or extname='vault')
       then coalesce((select 'PRESENT (' || length(decrypted_secret)::text || ' chars)'
                      from vault.decrypted_secrets where name='matching_fanout_cron_secret' limit 1),
                     'ABSENT_OR_DECRYPT_FAIL')
       else 'vault_extension_yok' end
union all
select 'pgmq_in_other_migrations',
  case when exists (select 1 from supabase_migrations.schema_migrations where statements::text ilike '%pgmq%')
       then 'REFERENCED' else 'NOT_REFERENCED' end;
