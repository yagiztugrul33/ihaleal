-- ════════════════════════════════════════════════════════════════════════════
-- FAZ 4 — ASYNC ALTYAPI (pgmq + matching cron)
-- Hedef: production wsjifesrdaeorrdzbvmk
-- Migrationlar (1):
--   (1) 20260516120400_v2_pgmq_matching.sql
-- Risk: 🟠 YÜKSEK (Dashboard extension + GUC gerek; CLI alone yapamaz)
-- Süre: 5-10 dakika (Dashboard adımı ayrıca)
-- Bağımlılık: Faz 2 (matching cron edge function'ı çağırır)
-- ────────────────────────────────────────────────────────────────────────────
-- ⚠⚠⚠ DASHBOARD ÖN HAZIRLIK (BU SQL'İ ÇALIŞTIRMADAN ÖNCE!) ⚠⚠⚠
--
-- 1. Supabase Dashboard → Database → Extensions
--    a. `pgmq` extension aktif edilmeli (Enable butonu)
--    b. `pg_cron` extension aktif edilmeli (Enable butonu)
--    c. `pg_net` extension aktif edilmeli (matching cron http_post için)
--
-- 2. Database GUC ayarları — Dashboard SQL Editor'dan TEK SEFERLİK çalıştır:
--    alter database postgres set app.functions_url = 'https://wsjifesrdaeorrdzbvmk.functions.supabase.co';
--    alter database postgres set app.cron_secret = '<güçlü-random-secret>';
--    Not: app.cron_secret edge function (matching-fanout) tarafında da set olmalı.
--
-- 3. Bu SQL Phase 4 deploy'dan ÖNCE Dashboard'da çalıştırılmalı:
--    create extension if not exists pgmq;
--    create extension if not exists pg_cron;
--    create extension if not exists pg_net;
--    (alternatif: yukarıdaki adım 1 ile UI üzerinden)
--
-- Eğer adım 1-3 yapılmazsa: bu migration "matching cron skipped" notice'i verir
-- (do $cron$ bloku exception when others ile yutar), ancak pgmq.create() ve
-- pgmq_send/read/delete fonksiyonları PGMQ EXTENSION YOKSA fail eder.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- pgmq + bağımlılıkları (idempotent)
create extension if not exists pgmq cascade;

-- Queue'ları oluştur (idempotent — except handler)
do $$ begin perform pgmq.create('bulk_listings'); exception when others then null; end $$;
do $$ begin perform pgmq.create('kyc_prescan'); exception when others then null; end $$;

-- pgmq wrapper RPC'leri
create or replace function public.pgmq_send(queue_name text, msg jsonb)
returns bigint language sql security definer set search_path = public, pgmq as $pms$
  select pgmq.send(queue_name, msg);
$pms$;
grant execute on function public.pgmq_send(text, jsonb) to authenticated, service_role;

create or replace function public.pgmq_read(queue_name text, vt int, qty int)
returns setof pgmq.message_record
language sql security definer set search_path = public, pgmq as $pmr$
  select * from pgmq.read(queue_name, vt, qty);
$pmr$;
grant execute on function public.pgmq_read(text, int, int) to service_role;

create or replace function public.pgmq_delete(queue_name text, msg_id bigint)
returns boolean language sql security definer set search_path = public, pgmq as $pmd$
  select pgmq.delete(queue_name, msg_id);
$pmd$;
grant execute on function public.pgmq_delete(text, bigint) to service_role;

-- matching cron — pg_cron + pg_net + GUC bağımlı
-- Eğer extension/GUC yok → exception when others → skip + notice
do $cron$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    begin
      perform cron.unschedule(jobid) from cron.job where jobname = 'matching-fanout-every-minute';
    exception when others then null;
    end;
    perform cron.schedule(
      'matching-fanout-every-minute',
      '* * * * *',
      $cmd$
        select net.http_post(
          url := current_setting('app.functions_url', true) || '/matching-fanout',
          headers := jsonb_build_object(
            'content-type', 'application/json',
            'x-internal-secret', current_setting('app.cron_secret', true)
          ),
          body := '{}'::jsonb
        )
      $cmd$
    );
  end if;
exception when others then
  raise notice 'matching cron skipped: %', sqlerrm;
end $cron$;

-- schema_migrations tracking
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES (
  '20260516120400',
  'v2_pgmq_matching',
  ARRAY[
    '-- Deployed via CLI on 2026-05-27. pgmq + pg_cron extensions required (Dashboard). ' ||
    'Cron job "matching-fanout-every-minute" requires app.functions_url + app.cron_secret GUCs.'
  ]::text[]
)
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- SMOKE
-- ════════════════════════════════════════════════════════════════════════════

-- (S1) Extensions
SELECT 'S1 extensions' AS check,
       string_agg(extname, ',' ORDER BY extname) AS present
FROM pg_extension WHERE extname IN ('pgmq','pg_cron','pg_net');

-- (S2) RPC'ler var mı?
SELECT 'S2 pgmq RPCs' AS check, string_agg(proname, ',' ORDER BY proname) AS present
FROM pg_proc WHERE pronamespace='public'::regnamespace
  AND proname IN ('pgmq_send','pgmq_read','pgmq_delete');

-- (S3) Queue'lar oluştu mu?
SELECT 'S3 queues' AS check,
       (SELECT count(*)
        FROM information_schema.tables
        WHERE table_schema='pgmq' AND table_name LIKE 'q_%') AS queue_count;

-- (S4) Cron job var mı? (pg_cron yoksa boş döner)
SELECT 'S4 cron job' AS check,
       (SELECT jobname FROM cron.job WHERE jobname = 'matching-fanout-every-minute' LIMIT 1) AS job_name;

-- (S5) schema_migrations
SELECT 'S5 tracking' AS check, version, name
FROM supabase_migrations.schema_migrations WHERE version = '20260516120400';

-- (S6) GUC kontrol (app.functions_url ayarlandı mı?)
SELECT 'S6 GUCs' AS check,
       current_setting('app.functions_url', true) AS functions_url,
       case when current_setting('app.cron_secret', true) IS NULL or current_setting('app.cron_secret', true) = ''
            then 'NOT_SET'
            else 'SET' end AS cron_secret_status;

-- (S7) REGRESSION
DO $$ DECLARE v_result json; BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-aaaa-bbbb-cccc-000000000005', true);
  SELECT public.execute_buy_now(gen_random_uuid(), gen_random_uuid(), 'smoke-phase4') INTO v_result;
  IF v_result->>'code' = 'kyc_required' THEN RAISE NOTICE 'S7 REGRESSION OK';
  ELSE RAISE EXCEPTION 'S7 REGRESSION FAIL — got %', v_result; END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════════
-- REVERSE
-- ════════════════════════════════════════════════════════════════════════════
/*
BEGIN;
-- Cron'u durdur
do $$ begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'matching-fanout-every-minute';
  end if;
exception when others then null; end $$;

-- RPC'leri sil
drop function if exists public.pgmq_delete(text, bigint);
drop function if exists public.pgmq_read(text, int, int);
drop function if exists public.pgmq_send(text, jsonb);

-- Queue'ları drop et (veri kaybı — yalnız boşken)
do $$ begin perform pgmq.drop_queue('bulk_listings'); exception when others then null; end $$;
do $$ begin perform pgmq.drop_queue('kyc_prescan'); exception when others then null; end $$;

-- pgmq extension'ı düşürmek genelde istenmez (başka queue'lar olabilir):
-- drop extension if exists pgmq cascade;

DELETE FROM supabase_migrations.schema_migrations WHERE version = '20260516120400';
COMMIT;
*/
