-- ═══════════════════════════════════════════════════════════════════════════
-- DEPLOY — FAZ 4 ASYNC ALTYAPI (atomik, RB1/RB2 patterniyle, Vault revize)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- KULLANIM:
--   npx supabase db query --linked --file _audit/migration_deploy/extra_phase4.sql
--
-- AMAÇ:
--   Faz 4 pgmq async altyapı + cron job + edge function integration:
--     - pgmq extension + 2 queue (bulk_listings + kyc_prescan)
--     - 3 RPC wrapper (pgmq_send/read/delete)
--     - pg_cron job (matching-fanout-every-minute) — pg_net üzerinden edge function tetik
--
-- KAYNAK:
--   supabase/migrations/20260516120400_v2_pgmq_matching.sql (canonical)
--   _audit/migration_deploy/phase4_async.sql (eski sürüm — atomik smoke yoktu)
--
-- VAULT PATTERN (NEDEN GUC DEĞİL):
--   Supabase managed DB'de `alter database postgres set app.X` superuser
--   gerektirir — SQL Editor ve CLI service_role'den fail (permission denied).
--   GUC yerine Supabase resmi pattern: vault.secrets + URL hardcode.
--   - URL hassas değil (web bundle'da zaten görünür), hardcode → audit temiz
--   - Cron secret vault'ta encrypted, cron job vault.decrypted_secrets'tan okur
--   - vault.create_secret() postgres role'e EXECUTE — SQL Editor'den çalışır
--
-- ÖN-KOŞUL DASHBOARD (BU SQL'DEN ÖNCE ZORUNLU — eksikse smoke fail → abort):
--
--   1. Database → Extensions → pgmq ENABLE
--   2. Database → Extensions → pg_cron ENABLE
--   3. Database → Extensions → pg_net ENABLE
--   4. SQL Editor — Vault secret oluştur (TEK SEFERLİK):
--        select vault.create_secret(
--          '<64-hex-random-secret>',
--          'matching_fanout_cron_secret'
--        );
--   5. Edge Functions → matching-fanout → Secrets:
--        INTERNAL_CRON_SECRET = <adım 4 ile AYNI 64-hex değer>
--   6. matching-fanout edge function production'a deploy:
--        npx supabase functions deploy matching-fanout --no-verify-jwt
--      (bu deploy zaten 2026-05-28 turunda yapıldı)
--
-- Smoke 47 check (10 Faz 4 self + 35 önceki regression + 2 schema row),
-- atomik transaction içinde — fail → abort, DB değişmez.
--
-- REVERSE (geri alma) — atomik tek blok:
--
--   begin;
--   -- Cron job durdur
--   do $reverse_cron$
--   begin
--     if exists (select 1 from pg_extension where extname='pg_cron') then
--       perform cron.unschedule(jobid) from cron.job where jobname='matching-fanout-every-minute';
--     end if;
--   exception when others then null;
--   end $reverse_cron$;
--
--   -- 3 RPC drop
--   drop function if exists public.pgmq_delete(text, bigint);
--   drop function if exists public.pgmq_read(text, int, int);
--   drop function if exists public.pgmq_send(text, jsonb);
--
--   -- 2 queue drop (rowcount 0 ise güvenli)
--   do $reverse_q1$ begin perform pgmq.drop_queue('bulk_listings'); exception when others then null; end $reverse_q1$;
--   do $reverse_q2$ begin perform pgmq.drop_queue('kyc_prescan'); exception when others then null; end $reverse_q2$;
--
--   -- Vault secret sil (SQL Editor'den ayrıca — bu dosyanın dışında):
--   --   select vault.delete_secret(
--   --     (select id from vault.secrets where name='matching_fanout_cron_secret')
--   --   );
--
--   -- pgmq extension drop önerilmez (başka queue kullanımı varsa kayıp):
--   -- drop extension if exists pgmq cascade;
--
--   -- schema_migrations satırını sil
--   delete from supabase_migrations.schema_migrations where version='20260516120400';
--   commit;
--
--   -- Edge function env var INTERNAL_CRON_SECRET — Dashboard UI'dan sil.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ──────────────────────────────────────────────────────────────────────────
-- Faz 4 DDL — pgmq core + queues + RPCs + cron schedule (Vault okuma)
-- ──────────────────────────────────────────────────────────────────────────

create extension if not exists pgmq cascade;

do $pgmq_bulk$
begin
  perform pgmq.create('bulk_listings');
exception when others then null;
end
$pgmq_bulk$;

do $pgmq_kyc$
begin
  perform pgmq.create('kyc_prescan');
exception when others then null;
end
$pgmq_kyc$;

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

-- matching cron — pg_cron + pg_net + Vault secret bağımlı
-- Dashboard ön-koşul gerekli; eksikse smoke check exception atar (strict mode).
-- DDL bloğu best-effort sarmalanmış (cron yoksa skip), smoke katmanında strict.
-- URL hardcoded (production canonical /functions/v1/<name> pattern).
-- Secret: vault.decrypted_secrets runtime'da okur (cron job postgres role olarak çalışır).
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
          url := 'https://wsjifesrdaeorrdzbvmk.supabase.co/functions/v1/matching-fanout',
          headers := jsonb_build_object(
            'content-type', 'application/json',
            'x-internal-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'matching_fanout_cron_secret' limit 1)
          ),
          body := '{}'::jsonb
        )
      $cmd$
    );
  end if;
exception when others then
  raise notice 'matching cron schedule skipped: %', sqlerrm;
end
$cron$;

-- ──────────────────────────────────────────────────────────────────────────
-- schema_migrations kaydı
-- ──────────────────────────────────────────────────────────────────────────

insert into supabase_migrations.schema_migrations (version, name, statements)
  values (
    '20260516120400',
    'v2_pgmq_matching',
    array[
      '-- Deployed via _audit/migration_deploy/extra_phase4.sql on 2026-05-28. ' ||
      'Atomik BEGIN/COMMIT + 47-check smoke (Vault pattern). ' ||
      'pgmq + pg_cron + pg_net Dashboard ön-koşul. ' ||
      'Vault secret matching_fanout_cron_secret + edge function INTERNAL_CRON_SECRET set.'
    ]
  )
on conflict (version) do nothing;

-- ──────────────────────────────────────────────────────────────────────────
-- Atomik regression smoke — 47 check
--   10 Faz 4 self (extension + queue + RPC + cron + vault)
--   35 önceki regression (6 RB + 4 bundle + 3 grant + 2 KYC + 4 Faz1 + 12 tablo + 4 RPC)
--   2 schema_migrations row (RB1/RB2 + Faz 4)
-- ──────────────────────────────────────────────────────────────────────────

do $regress$
declare
  -- 10 Faz 4 self
  v_pgmq_extension boolean;
  v_pg_cron_extension boolean;
  v_pg_net_extension boolean;
  v_q_bulk_listings boolean;
  v_q_kyc_prescan boolean;
  v_pgmq_send_rpc boolean;
  v_pgmq_read_rpc boolean;
  v_pgmq_delete_rpc boolean;
  v_cron_job boolean;
  v_vault_cron_secret boolean := false;
  -- 35 önceki regression
  v_cl_dublike_insert_dropped boolean;
  v_cl_select_admin_only boolean;
  v_cl_anon_insert_kept boolean;
  v_org_public_read_dropped_admin_added boolean;
  v_org_member_select_kept boolean;
  v_bid_bonds_zero_policy boolean;
  v_place_bid_deposit_guard boolean;
  v_calc_commission_auth_check boolean;
  v_submit_ges_auth_null_check boolean;
  v_consume_ai_quota_org_check boolean;
  v_calc_commission_public_revoked boolean;
  v_consume_ai_quota_public_revoked boolean;
  v_submit_ges_anon_revoked boolean;
  v_kyc_guard_buy_now_present boolean;
  v_kyc_guard_deposit_present boolean;
  v_bids_select_public_dropped boolean;
  v_bids_select_bidder_or_owner_present boolean;
  v_bid_public_summary_view_present boolean;
  v_rl_buckets_rls_on boolean;
  v_organizations_table boolean;
  v_buyer_preferences_table boolean;
  v_kyc_verifications_table boolean;
  v_property_submissions_table boolean;
  v_ges_projects_table boolean;
  v_trade_offers_table boolean;
  v_device_push_tokens_table boolean;
  v_engineering_runs_table boolean;
  v_moderation_queue_table boolean;
  v_corporate_leads_table boolean;
  v_listing_matches_table boolean;
  v_watchlist_table boolean;
  v_register_push_token_fn boolean;
  v_submit_takas_fn boolean;
  v_submit_ges_fn boolean;
  v_create_trade_offer_fn boolean;
  -- 2 schema_migrations row
  v_schema_migrations_rb_row boolean;
  v_schema_migrations_faz4_row boolean;
begin
  -- ═══ FAZ 4 SELF (10) ═══

  -- Extensions (3)
  select exists (select 1 from pg_extension where extname='pgmq') into v_pgmq_extension;
  select exists (select 1 from pg_extension where extname='pg_cron') into v_pg_cron_extension;
  select exists (select 1 from pg_extension where extname='pg_net') into v_pg_net_extension;

  -- Queue tabloları (2)
  select exists (select 1 from information_schema.tables
    where table_schema='pgmq' and table_name='q_bulk_listings') into v_q_bulk_listings;
  select exists (select 1 from information_schema.tables
    where table_schema='pgmq' and table_name='q_kyc_prescan') into v_q_kyc_prescan;

  -- pgmq RPC wrappers (3)
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='pgmq_send') into v_pgmq_send_rpc;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='pgmq_read') into v_pgmq_read_rpc;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='pgmq_delete') into v_pgmq_delete_rpc;

  -- Cron job (1)
  select exists (select 1 from cron.job where jobname='matching-fanout-every-minute')
  into v_cron_job;

  -- Vault secret (1) — permission denied senaryosunda false (cron job da fail eder)
  begin
    select exists (
      select 1 from vault.decrypted_secrets
      where name = 'matching_fanout_cron_secret'
        and decrypted_secret is not null
        and decrypted_secret <> ''
    ) into v_vault_cron_secret;
  exception when others then
    v_vault_cron_secret := false;
  end;

  -- ═══ RB1/RB2 SELF (6) ═══

  select not exists (select 1 from pg_policies
      where schemaname='public' and tablename='corporate_leads' and policyname='cl_insert_anyone')
     and exists (select 1 from pg_policies
      where schemaname='public' and tablename='corporate_leads' and policyname='allow_insert_all')
  into v_cl_dublike_insert_dropped;
  select not exists (select 1 from pg_policies
      where schemaname='public' and tablename='corporate_leads' and policyname='allow_select_all')
     and exists (select 1 from pg_policies
      where schemaname='public' and tablename='corporate_leads' and policyname='corporate_leads_select_admin')
  into v_cl_select_admin_only;
  select exists (select 1 from pg_policies
      where schemaname='public' and tablename='corporate_leads' and policyname='allow_insert_all'
        and cmd='INSERT' and 'anon' = ANY(roles::text[]))
  into v_cl_anon_insert_kept;
  select not exists (select 1 from pg_policies
      where schemaname='public' and tablename='organizations' and policyname='org_public_read')
     and exists (select 1 from pg_policies
      where schemaname='public' and tablename='organizations' and policyname='org_select_admin')
  into v_org_public_read_dropped_admin_added;
  select exists (select 1 from pg_policies
      where schemaname='public' and tablename='organizations' and policyname='org_select_member')
  into v_org_member_select_kept;
  select (select count(*) from pg_policies where schemaname='public' and tablename='bid_bonds') = 0
  into v_bid_bonds_zero_policy;

  -- ═══ SECURITY BUNDLE SELF (4) ═══

  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='place_bid'
      and p.prosrc like '%bid_deposits%' and p.prosrc like '%deposit_required%')
  into v_place_bid_deposit_guard;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='calculate_commission_with_offset'
      and p.prosrc like '%auth_required%' and p.prosrc like '%forbidden%')
  into v_calc_commission_auth_check;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='submit_ges_land_evaluation'
      and p.prosrc like '%v_user_id is null%' and p.prosrc like '%authentication required%')
  into v_submit_ges_auth_null_check;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='consume_ai_quota'
      and p.prosrc like '%has_org_role%' and p.prosrc like '%forbidden%')
  into v_consume_ai_quota_org_check;

  -- ═══ GRANT SERTLEŞTİRME (3) ═══

  select not exists (select 1 from information_schema.routine_privileges
    where routine_schema='public' and routine_name='calculate_commission_with_offset'
      and grantee='PUBLIC' and privilege_type='EXECUTE')
  into v_calc_commission_public_revoked;
  select not exists (select 1 from information_schema.routine_privileges
    where routine_schema='public' and routine_name='consume_ai_quota'
      and grantee='PUBLIC' and privilege_type='EXECUTE')
  into v_consume_ai_quota_public_revoked;
  select not exists (select 1 from information_schema.routine_privileges
    where routine_schema='public' and routine_name='submit_ges_land_evaluation'
      and grantee='anon' and privilege_type='EXECUTE')
  into v_submit_ges_anon_revoked;

  -- ═══ KYC GUARD (2) ═══

  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='execute_buy_now' and p.prosrc like '%kyc_required%')
  into v_kyc_guard_buy_now_present;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='register_bid_deposit' and p.prosrc like '%kyc_required%')
  into v_kyc_guard_deposit_present;

  -- ═══ FAZ 1 (4) ═══

  select not exists (select 1 from pg_policies
    where schemaname='public' and tablename='bids' and policyname='bids_select_public')
  into v_bids_select_public_dropped;
  select exists (select 1 from pg_policies
    where schemaname='public' and tablename='bids' and policyname='bids_select_bidder_or_listing_owner')
  into v_bids_select_bidder_or_owner_present;
  select exists (select 1 from information_schema.views
    where table_schema='public' and table_name='auction_bid_public_summary')
  into v_bid_public_summary_view_present;
  select c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname='public' and c.relname='rate_limit_buckets'
  into v_rl_buckets_rls_on;

  -- ═══ FAZ 2/3 TABLOLAR (12) ═══

  select exists (select 1 from information_schema.tables where table_schema='public' and table_name='organizations') into v_organizations_table;
  select exists (select 1 from information_schema.tables where table_schema='public' and table_name='buyer_preferences') into v_buyer_preferences_table;
  select exists (select 1 from information_schema.tables where table_schema='public' and table_name='kyc_verifications') into v_kyc_verifications_table;
  select exists (select 1 from information_schema.tables where table_schema='public' and table_name='property_submissions') into v_property_submissions_table;
  select exists (select 1 from information_schema.tables where table_schema='public' and table_name='ges_projects') into v_ges_projects_table;
  select exists (select 1 from information_schema.tables where table_schema='public' and table_name='trade_offers') into v_trade_offers_table;
  select exists (select 1 from information_schema.tables where table_schema='public' and table_name='device_push_tokens') into v_device_push_tokens_table;
  select exists (select 1 from information_schema.tables where table_schema='public' and table_name='engineering_analysis_runs') into v_engineering_runs_table;
  select exists (select 1 from information_schema.tables where table_schema='public' and table_name='moderation_queue') into v_moderation_queue_table;
  select exists (select 1 from information_schema.tables where table_schema='public' and table_name='corporate_leads') into v_corporate_leads_table;
  select exists (select 1 from information_schema.tables where table_schema='public' and table_name='listing_matches') into v_listing_matches_table;
  select exists (select 1 from information_schema.tables where table_schema='public' and table_name='watchlist') into v_watchlist_table;

  -- ═══ RPC'LER (4) ═══

  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='register_push_token') into v_register_push_token_fn;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='submit_takas_application') into v_submit_takas_fn;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='submit_ges_land_evaluation') into v_submit_ges_fn;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='create_trade_offer') into v_create_trade_offer_fn;

  -- ═══ schema_migrations row (2) ═══

  select exists (select 1 from supabase_migrations.schema_migrations where version='20260528150000')
  into v_schema_migrations_rb_row;
  select exists (select 1 from supabase_migrations.schema_migrations where version='20260516120400')
  into v_schema_migrations_faz4_row;

  -- ═══ RAISE EXCEPTION (47 check) ═══

  -- Faz 4 self (10)
  if not v_pgmq_extension then raise exception 'FAZ4 FAIL: pgmq extension YOK (Dashboard → Extensions → pgmq ENABLE)'; end if;
  if not v_pg_cron_extension then raise exception 'FAZ4 FAIL: pg_cron extension YOK (Dashboard → Extensions → pg_cron ENABLE)'; end if;
  if not v_pg_net_extension then raise exception 'FAZ4 FAIL: pg_net extension YOK (Dashboard → Extensions → pg_net ENABLE)'; end if;
  if not v_q_bulk_listings then raise exception 'FAZ4 FAIL: pgmq.q_bulk_listings tablosu YOK'; end if;
  if not v_q_kyc_prescan then raise exception 'FAZ4 FAIL: pgmq.q_kyc_prescan tablosu YOK'; end if;
  if not v_pgmq_send_rpc then raise exception 'FAZ4 FAIL: pgmq_send RPC YOK'; end if;
  if not v_pgmq_read_rpc then raise exception 'FAZ4 FAIL: pgmq_read RPC YOK'; end if;
  if not v_pgmq_delete_rpc then raise exception 'FAZ4 FAIL: pgmq_delete RPC YOK'; end if;
  if not v_cron_job then raise exception 'FAZ4 FAIL: cron job matching-fanout-every-minute YOK'; end if;
  if not v_vault_cron_secret then raise exception 'FAZ4 FAIL: vault.secrets matching_fanout_cron_secret YOK veya boş (SQL Editor: select vault.create_secret(...))'; end if;

  -- RB1/RB2 regression (6)
  if not v_cl_dublike_insert_dropped then raise exception 'REGRESSION: corp_leads cl_insert_anyone geri gelmiş'; end if;
  if not v_cl_select_admin_only then raise exception 'REGRESSION: corp_leads allow_select_all geri gelmiş'; end if;
  if not v_cl_anon_insert_kept then raise exception 'REGRESSION: corp_leads anon INSERT akışı bozulmuş'; end if;
  if not v_org_public_read_dropped_admin_added then raise exception 'REGRESSION: org_public_read geri gelmiş'; end if;
  if not v_org_member_select_kept then raise exception 'REGRESSION: org_select_member kayıp'; end if;
  if not v_bid_bonds_zero_policy then raise exception 'REGRESSION: bid_bonds policy 0 değil'; end if;

  -- Security bundle self (4)
  if not v_place_bid_deposit_guard then raise exception 'REGRESSION: place_bid deposit guard kayıp'; end if;
  if not v_calc_commission_auth_check then raise exception 'REGRESSION: calc_commission auth check kayıp'; end if;
  if not v_submit_ges_auth_null_check then raise exception 'REGRESSION: submit_ges auth null check kayıp'; end if;
  if not v_consume_ai_quota_org_check then raise exception 'REGRESSION: consume_ai_quota has_org_role kayıp'; end if;

  -- Grant (3)
  if not v_calc_commission_public_revoked then raise exception 'REGRESSION: calc_commission PUBLIC EXECUTE geri gelmiş'; end if;
  if not v_consume_ai_quota_public_revoked then raise exception 'REGRESSION: consume_ai_quota PUBLIC EXECUTE geri gelmiş'; end if;
  if not v_submit_ges_anon_revoked then raise exception 'REGRESSION: submit_ges anon EXECUTE geri gelmiş'; end if;

  -- KYC (2)
  if not v_kyc_guard_buy_now_present then raise exception 'REGRESSION: KYC guard (execute_buy_now) bozulmuş'; end if;
  if not v_kyc_guard_deposit_present then raise exception 'REGRESSION: KYC guard (register_bid_deposit) bozulmuş'; end if;

  -- Faz 1 (4)
  if not v_bids_select_public_dropped then raise exception 'REGRESSION: Faz 1 bids_select_public geri gelmiş'; end if;
  if not v_bids_select_bidder_or_owner_present then raise exception 'REGRESSION: Faz 1 bids_select_bidder_or_listing_owner kayıp'; end if;
  if not v_bid_public_summary_view_present then raise exception 'REGRESSION: Faz 1 view kayıp'; end if;
  if not v_rl_buckets_rls_on then raise exception 'REGRESSION: Faz 1 rl_buckets RLS kapalı'; end if;

  -- Faz 2/3 tablolar (12)
  if not v_organizations_table then raise exception 'REGRESSION: organizations kayıp'; end if;
  if not v_buyer_preferences_table then raise exception 'REGRESSION: buyer_preferences kayıp'; end if;
  if not v_kyc_verifications_table then raise exception 'REGRESSION: kyc_verifications kayıp'; end if;
  if not v_property_submissions_table then raise exception 'REGRESSION: property_submissions kayıp'; end if;
  if not v_ges_projects_table then raise exception 'REGRESSION: ges_projects kayıp'; end if;
  if not v_trade_offers_table then raise exception 'REGRESSION: trade_offers kayıp'; end if;
  if not v_device_push_tokens_table then raise exception 'REGRESSION: device_push_tokens kayıp'; end if;
  if not v_engineering_runs_table then raise exception 'REGRESSION: engineering_analysis_runs kayıp'; end if;
  if not v_moderation_queue_table then raise exception 'REGRESSION: moderation_queue kayıp'; end if;
  if not v_corporate_leads_table then raise exception 'REGRESSION: corporate_leads kayıp'; end if;
  if not v_listing_matches_table then raise exception 'REGRESSION: listing_matches kayıp'; end if;
  if not v_watchlist_table then raise exception 'REGRESSION: watchlist kayıp'; end if;

  -- RPC (4)
  if not v_register_push_token_fn then raise exception 'REGRESSION: register_push_token kayıp'; end if;
  if not v_submit_takas_fn then raise exception 'REGRESSION: submit_takas_application kayıp'; end if;
  if not v_submit_ges_fn then raise exception 'REGRESSION: submit_ges_land_evaluation kayıp'; end if;
  if not v_create_trade_offer_fn then raise exception 'REGRESSION: create_trade_offer kayıp'; end if;

  -- schema_migrations row (2)
  if not v_schema_migrations_rb_row then raise exception 'REGRESSION: schema_migrations RB1/RB2 satırı kayıp'; end if;
  if not v_schema_migrations_faz4_row then raise exception 'FAZ4 FAIL: schema_migrations Faz 4 satırı kayıp'; end if;

  raise notice 'Faz 4 smoke OK — 47/47 check geçti (10 Faz 4 self + 35 önceki regression + 2 schema row)';
end
$regress$;

commit;

-- ──────────────────────────────────────────────────────────────────────────
-- Son satır: tek SELECT — deploy başarı sinyali
-- ──────────────────────────────────────────────────────────────────────────

select
  '20260516120400_v2_pgmq_matching' as migration,
  'deployed' as status,
  (select exists (select 1 from pg_extension where extname='pgmq')) as pgmq_ext,
  (select exists (select 1 from pg_extension where extname='pg_cron')) as pg_cron_ext,
  (select exists (select 1 from pg_extension where extname='pg_net')) as pg_net_ext,
  (select count(*) from information_schema.tables where table_schema='pgmq' and table_name like 'q_%') as queue_count,
  (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in ('pgmq_send','pgmq_read','pgmq_delete')) as pgmq_rpc_count,
  (select exists (select 1 from cron.job where jobname='matching-fanout-every-minute')) as cron_job_present,
  (select exists (
    select 1 from vault.decrypted_secrets
    where name = 'matching_fanout_cron_secret' and decrypted_secret is not null and decrypted_secret <> ''
  )) as vault_secret_set,
  (select exists (select 1 from supabase_migrations.schema_migrations where version='20260516120400')) as schema_migrations_row,
  now() as deployed_at;
