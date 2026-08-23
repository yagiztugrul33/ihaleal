-- Faz 4 cron job ilk tetik teyit (SELECT-only).
-- matching-fanout-every-minute son çalıştırmaları + HTTP status response.

select 'schema_migrations_total' as k,
  (select count(*)::text from supabase_migrations.schema_migrations) as v
union all
select 'cron_job_count',
  (select count(*)::text from cron.job where jobname='matching-fanout-every-minute')
union all
select 'cron_runs_total',
  (select count(*)::text from cron.job_run_details
   where jobid in (select jobid from cron.job where jobname='matching-fanout-every-minute'))
union all
select 'cron_last_run',
  coalesce((select status || ' @ ' || start_time::text
            from cron.job_run_details
            where jobid in (select jobid from cron.job where jobname='matching-fanout-every-minute')
            order by start_time desc limit 1), 'NO_RUN_YET')
union all
select 'cron_last_return',
  coalesce((select coalesce(return_message, 'NULL_MESSAGE')
            from cron.job_run_details
            where jobid in (select jobid from cron.job where jobname='matching-fanout-every-minute')
            order by start_time desc limit 1), 'NO_RUN_YET')
union all
-- pg_net response (net.http_post sonucu net._http_response tablosunda saklanır)
select 'net_http_responses',
  case when exists (select 1 from information_schema.tables where table_schema='net' and table_name='_http_response')
       then (select count(*)::text from net._http_response
             where created >= now() - interval '5 minutes')
       else 'net_table_yok' end
union all
select 'net_last_status_code',
  case when exists (select 1 from information_schema.tables where table_schema='net' and table_name='_http_response')
       then coalesce((select status_code::text || ' (content: ' || left(coalesce(content::text, 'null'), 100) || ')'
                      from net._http_response
                      where created >= now() - interval '5 minutes'
                      order by created desc limit 1), 'NO_RESPONSE_YET')
       else 'net_table_yok' end;
