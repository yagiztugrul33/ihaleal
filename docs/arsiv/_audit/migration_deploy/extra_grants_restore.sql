-- ═══════════════════════════════════════════════════════════════════════════
-- DEPLOY — SİSTEMİK GRANT RESTORE (atomik, RB1/RB2 + Faz 4 patterniyle)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- KULLANIM:
--   npx supabase db query --linked --file _audit/migration_deploy/extra_grants_restore.sql
--
-- AMAÇ:
--   Initial schema'dan beri eksik kalan table-level GRANT'leri sistemik
--   restore eder. matching-fanout edge function (Faz 4 500 db_error) + web
--   direct table SELECT silent fail problemini tek seferde çözer.
--
-- KAYNAK:
--   supabase/migrations/20260528170000_grants_restore_systemic.sql
--
-- ÖN-KOŞUL (deploy sırasında):
--   - Faz 4 cron geçici unschedule durumda (önceki tur)
--   - vault.secrets'ta matching_fanout_cron_secret PRESENT (kullanıcı koymuş)
--   - matching-fanout edge function deployed (kullanıcı koymuş)
--   - INTERNAL_CRON_SECRET edge function env set (kullanıcı koymuş)
--
-- KAPSAM:
--   1. service_role: tüm public CRUD (admin role)
--   2. authenticated: tüm public SELECT + 11 spesifik INSERT/UPDATE/DELETE
--   3. anon: KISITLI — sadece 2 tablo SELECT (listings + auctions, RLS policy
--      zaten public browse filter) + 1 INSERT (corporate_leads form)
--   4. Faz 4 cron reschedule (matching-fanout artık listings okuyabilir)
--
-- SMOKE: 67 check atomik (47 önceki regression + 19 yeni grant + 1 schema row).
--
-- GÜVENLİK ANALİZİ (PII/yetki sızıntı yok):
--   - profiles RLS = own-only (profiles_select_self) + admin → güvenli
--   - listings RLS = public browse (active/closed) → KASITLI, anon görür
--   - auctions RLS = public browse (non-draft) → KASITLI
--   - bids RLS = own-only (bidder/listing owner) → anon görmez
--   - bid_deposits RLS = own-only + seller + admin → güvenli
--   - 47 tablo HEPSI RLS ENABLED → grant açmak güvenli
--   - anon kısıtlı: profiles/bids/bid_deposits/watchlist/notifications anon
--     SELECT YOK
--
-- REVERSE (geri alma) — atomik tek blok:
--
--   begin;
--   -- Cron unschedule
--   do $rev_cron$
--   begin
--     if exists (select 1 from pg_extension where extname='pg_cron') then
--       perform cron.unschedule(jobid) from cron.job where jobname='matching-fanout-every-minute';
--     end if;
--   exception when others then null;
--   end $rev_cron$;
--
--   -- service_role revoke (default privileges + grants)
--   alter default privileges in schema public revoke execute on functions from service_role;
--   alter default privileges in schema public revoke usage, select on sequences from service_role;
--   alter default privileges in schema public revoke select, insert, update, delete on tables from service_role;
--   revoke execute on all functions in schema public from service_role;
--   revoke usage, select on all sequences in schema public from service_role;
--   revoke select, insert, update, delete on all tables in schema public from service_role;
--
--   -- authenticated revoke
--   alter default privileges in schema public revoke usage, select on sequences from authenticated;
--   alter default privileges in schema public revoke select on tables from authenticated;
--   revoke usage, select on all sequences in schema public from authenticated;
--   revoke insert, update, delete on public.watchlist from authenticated;
--   revoke insert on public.notifications from authenticated;
--   revoke insert, update on public.profiles from authenticated;
--   revoke update on public.listings from authenticated;
--   revoke insert on public.auctions from authenticated;
--   revoke insert on public.report_approvals from authenticated;
--   revoke insert on public.memberships from authenticated;
--   revoke insert on public.authorizations from authenticated;
--   revoke insert on public.service_fees from authenticated;
--   revoke insert on public.bid_deposits from authenticated;
--   revoke insert on public.corporate_leads from authenticated;
--   revoke select on all tables in schema public from authenticated;
--
--   -- anon revoke
--   revoke insert on public.corporate_leads from anon;
--   revoke select on public.listings from anon;
--   revoke select on public.auctions from anon;
--
--   delete from supabase_migrations.schema_migrations where version='20260528170000';
--   commit;
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ──────────────────────────────────────────────────────────────────────────
-- 1) service_role: tüm public CRUD
-- ──────────────────────────────────────────────────────────────────────────

grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;

-- ──────────────────────────────────────────────────────────────────────────
-- 2) authenticated: tüm public SELECT + spesifik writes
-- ──────────────────────────────────────────────────────────────────────────

grant select on all tables in schema public to authenticated;
alter default privileges in schema public grant select on tables to authenticated;

grant insert, update, delete on public.watchlist to authenticated;
grant insert on public.notifications to authenticated;
grant insert, update on public.profiles to authenticated;
grant update on public.listings to authenticated;
grant insert on public.auctions to authenticated;
grant insert on public.report_approvals to authenticated;
grant insert on public.memberships to authenticated;
grant insert on public.authorizations to authenticated;
grant insert on public.service_fees to authenticated;
grant insert on public.bid_deposits to authenticated;
grant insert on public.corporate_leads to authenticated;

grant usage, select on all sequences in schema public to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;

-- ──────────────────────────────────────────────────────────────────────────
-- 3) anon: KISITLI (public browse + corporate_leads form)
-- ──────────────────────────────────────────────────────────────────────────

grant select on public.listings to anon;
grant select on public.auctions to anon;
grant insert on public.corporate_leads to anon;

-- ──────────────────────────────────────────────────────────────────────────
-- 4) Faz 4 cron reschedule
-- ──────────────────────────────────────────────────────────────────────────

do $cron_reschedule$
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
  raise notice 'matching cron reschedule skipped: %', sqlerrm;
end
$cron_reschedule$;

-- ──────────────────────────────────────────────────────────────────────────
-- schema_migrations kaydı
-- ──────────────────────────────────────────────────────────────────────────

insert into supabase_migrations.schema_migrations (version, name, statements)
  values (
    '20260528170000',
    'grants_restore_systemic',
    array[
      '-- Deployed via _audit/migration_deploy/extra_grants_restore.sql on 2026-05-28. ' ||
      'Atomik BEGIN/COMMIT + 67-check smoke. ' ||
      'service_role full CRUD + authenticated all SELECT + spesifik writes + ' ||
      'anon kısıtlı (listings/auctions SELECT + corporate_leads INSERT). ' ||
      'Faz 4 cron reschedule dahil (matching-fanout 1 dakika sonra 200 OK beklenir).'
    ]
  )
on conflict (version) do nothing;

-- ──────────────────────────────────────────────────────────────────────────
-- Atomik regression smoke — 67 check
--   19 yeni (8 srv grant + 5 auth grant + 2 anon SELECT + 1 anon INSERT +
--            3 anon NOT SELECT güvenlik + 1 cron + 1 schema row)
--   48 önceki Faz 4 smoke (10 Faz4 self + 6 RB + 4 bundle + 3 grant + 2 KYC
--            + 4 Faz1 + 12 tablo + 4 RPC + 2 schema row, biri grants_restore üzerinde sayar)
-- ──────────────────────────────────────────────────────────────────────────

do $regress$
declare
  -- 19 yeni grant check
  v_srv_listings_select boolean;
  v_srv_listings_update boolean;
  v_srv_listings_insert boolean;
  v_srv_buyer_pref_select boolean;
  v_srv_listing_matches_insert boolean;
  v_srv_notifications_insert boolean;
  v_srv_bid_deposits_select boolean;
  v_srv_profiles_select boolean;
  v_auth_listings_select boolean;
  v_auth_profiles_select boolean;
  v_auth_bids_select boolean;
  v_auth_auctions_select boolean;
  v_auth_bid_deposits_select boolean;
  v_anon_listings_select boolean;
  v_anon_auctions_select boolean;
  v_anon_corp_leads_insert boolean;
  v_anon_NOT_profiles boolean;
  v_anon_NOT_bids boolean;
  v_anon_NOT_bid_deposits boolean;
  v_cron_job_rescheduled boolean;
  v_schema_migrations_grants_row boolean;
  -- Faz 4 önceki regression (10)
  v_pgmq_extension boolean;
  v_pg_cron_extension boolean;
  v_pg_net_extension boolean;
  v_q_bulk_listings boolean;
  v_q_kyc_prescan boolean;
  v_pgmq_send_rpc boolean;
  v_pgmq_read_rpc boolean;
  v_pgmq_delete_rpc boolean;
  v_vault_cron_secret boolean := false;
  -- RB1/RB2 regression (6)
  v_cl_dublike_insert_dropped boolean;
  v_cl_select_admin_only boolean;
  v_cl_anon_insert_kept boolean;
  v_org_public_read_dropped_admin_added boolean;
  v_org_member_select_kept boolean;
  v_bid_bonds_zero_policy boolean;
  -- Security bundle (4)
  v_place_bid_deposit_guard boolean;
  v_calc_commission_auth_check boolean;
  v_submit_ges_auth_null_check boolean;
  v_consume_ai_quota_org_check boolean;
  -- Grant sertleştirme (3)
  v_calc_commission_public_revoked boolean;
  v_consume_ai_quota_public_revoked boolean;
  v_submit_ges_anon_revoked boolean;
  -- KYC (2)
  v_kyc_guard_buy_now_present boolean;
  v_kyc_guard_deposit_present boolean;
  -- Faz 1 (4)
  v_bids_select_public_dropped boolean;
  v_bids_select_bidder_or_owner_present boolean;
  v_bid_public_summary_view_present boolean;
  v_rl_buckets_rls_on boolean;
  -- Faz 2/3 tablo (12)
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
  -- RPC (4)
  v_register_push_token_fn boolean;
  v_submit_takas_fn boolean;
  v_submit_ges_fn boolean;
  v_create_trade_offer_fn boolean;
  -- Önceki schema_migrations row (2)
  v_schema_migrations_rb_row boolean;
  v_schema_migrations_faz4_row boolean;
  -- Sistemik koruma check'i
  v_rls_disabled_count int;
begin
  -- ═══ YENİ GRANT CHECK (19) ═══

  -- service_role (8 anahtar tablo)
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='listings'
      and grantee='service_role' and privilege_type='SELECT')
  into v_srv_listings_select;
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='listings'
      and grantee='service_role' and privilege_type='UPDATE')
  into v_srv_listings_update;
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='listings'
      and grantee='service_role' and privilege_type='INSERT')
  into v_srv_listings_insert;
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='buyer_preferences'
      and grantee='service_role' and privilege_type='SELECT')
  into v_srv_buyer_pref_select;
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='listing_matches'
      and grantee='service_role' and privilege_type='INSERT')
  into v_srv_listing_matches_insert;
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='notifications'
      and grantee='service_role' and privilege_type='INSERT')
  into v_srv_notifications_insert;
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='bid_deposits'
      and grantee='service_role' and privilege_type='SELECT')
  into v_srv_bid_deposits_select;
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='profiles'
      and grantee='service_role' and privilege_type='SELECT')
  into v_srv_profiles_select;

  -- authenticated (5 kritik tablo SELECT)
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='listings'
      and grantee='authenticated' and privilege_type='SELECT')
  into v_auth_listings_select;
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='profiles'
      and grantee='authenticated' and privilege_type='SELECT')
  into v_auth_profiles_select;
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='bids'
      and grantee='authenticated' and privilege_type='SELECT')
  into v_auth_bids_select;
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='auctions'
      and grantee='authenticated' and privilege_type='SELECT')
  into v_auth_auctions_select;
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='bid_deposits'
      and grantee='authenticated' and privilege_type='SELECT')
  into v_auth_bid_deposits_select;

  -- anon (3 izin + 3 yasak güvenlik)
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='listings'
      and grantee='anon' and privilege_type='SELECT')
  into v_anon_listings_select;
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='auctions'
      and grantee='anon' and privilege_type='SELECT')
  into v_anon_auctions_select;
  select exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='corporate_leads'
      and grantee='anon' and privilege_type='INSERT')
  into v_anon_corp_leads_insert;

  -- GÜVENLİK: anon BU tablolara SELECT yapamamalı
  select not exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='profiles'
      and grantee='anon' and privilege_type='SELECT')
  into v_anon_NOT_profiles;
  select not exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='bids'
      and grantee='anon' and privilege_type='SELECT')
  into v_anon_NOT_bids;
  select not exists (select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='bid_deposits'
      and grantee='anon' and privilege_type='SELECT')
  into v_anon_NOT_bid_deposits;

  -- Cron job reschedule
  select exists (select 1 from cron.job where jobname='matching-fanout-every-minute')
  into v_cron_job_rescheduled;

  -- schema_migrations grants_restore row
  select exists (select 1 from supabase_migrations.schema_migrations where version='20260528170000')
  into v_schema_migrations_grants_row;

  -- ═══ FAZ 4 SELF REGRESSION (9 — cron job ayrı yeni check) ═══

  select exists (select 1 from pg_extension where extname='pgmq') into v_pgmq_extension;
  select exists (select 1 from pg_extension where extname='pg_cron') into v_pg_cron_extension;
  select exists (select 1 from pg_extension where extname='pg_net') into v_pg_net_extension;
  select exists (select 1 from information_schema.tables
    where table_schema='pgmq' and table_name='q_bulk_listings') into v_q_bulk_listings;
  select exists (select 1 from information_schema.tables
    where table_schema='pgmq' and table_name='q_kyc_prescan') into v_q_kyc_prescan;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='pgmq_send') into v_pgmq_send_rpc;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='pgmq_read') into v_pgmq_read_rpc;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='pgmq_delete') into v_pgmq_delete_rpc;

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

  -- ═══ RB1/RB2 REGRESSION (6) ═══

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

  -- ═══ FAZ 2/3 TABLO (12) ═══

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

  -- ═══ RPC (4) ═══

  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='register_push_token') into v_register_push_token_fn;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='submit_takas_application') into v_submit_takas_fn;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='submit_ges_land_evaluation') into v_submit_ges_fn;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='create_trade_offer') into v_create_trade_offer_fn;

  -- ═══ schema_migrations row önceki (2) ═══

  select exists (select 1 from supabase_migrations.schema_migrations where version='20260528150000')
  into v_schema_migrations_rb_row;
  select exists (select 1 from supabase_migrations.schema_migrations where version='20260516120400')
  into v_schema_migrations_faz4_row;

  -- ═══ Sistemik koruma — RLS=ON tüm tablolar (47 tablo) ═══

  select count(*) into v_rls_disabled_count
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind='r' and not c.relrowsecurity;

  -- ═══ RAISE EXCEPTION (67 check) ═══

  -- Yeni grant — service_role (8)
  if not v_srv_listings_select then raise exception 'GRANTS FAIL: service_role listings SELECT MISSING'; end if;
  if not v_srv_listings_update then raise exception 'GRANTS FAIL: service_role listings UPDATE MISSING'; end if;
  if not v_srv_listings_insert then raise exception 'GRANTS FAIL: service_role listings INSERT MISSING'; end if;
  if not v_srv_buyer_pref_select then raise exception 'GRANTS FAIL: service_role buyer_preferences SELECT MISSING'; end if;
  if not v_srv_listing_matches_insert then raise exception 'GRANTS FAIL: service_role listing_matches INSERT MISSING'; end if;
  if not v_srv_notifications_insert then raise exception 'GRANTS FAIL: service_role notifications INSERT MISSING'; end if;
  if not v_srv_bid_deposits_select then raise exception 'GRANTS FAIL: service_role bid_deposits SELECT MISSING'; end if;
  if not v_srv_profiles_select then raise exception 'GRANTS FAIL: service_role profiles SELECT MISSING'; end if;

  -- Yeni grant — authenticated (5)
  if not v_auth_listings_select then raise exception 'GRANTS FAIL: authenticated listings SELECT MISSING'; end if;
  if not v_auth_profiles_select then raise exception 'GRANTS FAIL: authenticated profiles SELECT MISSING'; end if;
  if not v_auth_bids_select then raise exception 'GRANTS FAIL: authenticated bids SELECT MISSING'; end if;
  if not v_auth_auctions_select then raise exception 'GRANTS FAIL: authenticated auctions SELECT MISSING'; end if;
  if not v_auth_bid_deposits_select then raise exception 'GRANTS FAIL: authenticated bid_deposits SELECT MISSING'; end if;

  -- Yeni grant — anon izin (3)
  if not v_anon_listings_select then raise exception 'GRANTS FAIL: anon listings SELECT (public browse) MISSING'; end if;
  if not v_anon_auctions_select then raise exception 'GRANTS FAIL: anon auctions SELECT (public browse) MISSING'; end if;
  if not v_anon_corp_leads_insert then raise exception 'GRANTS FAIL: anon corporate_leads INSERT MISSING'; end if;

  -- Güvenlik — anon yasak (3)
  if not v_anon_NOT_profiles then raise exception 'SECURITY FAIL: anon profiles SELECT açık (PII sızıntı riski)'; end if;
  if not v_anon_NOT_bids then raise exception 'SECURITY FAIL: anon bids SELECT açık (kullanıcı verisi sızıntı riski)'; end if;
  if not v_anon_NOT_bid_deposits then raise exception 'SECURITY FAIL: anon bid_deposits SELECT açık (finansal veri sızıntı riski)'; end if;

  -- Cron + migration row (2)
  if not v_cron_job_rescheduled then raise exception 'GRANTS FAIL: cron matching-fanout-every-minute reschedule fail'; end if;
  if not v_schema_migrations_grants_row then raise exception 'GRANTS FAIL: schema_migrations grants_restore satırı eksik'; end if;

  -- Faz 4 regression (9)
  if not v_pgmq_extension then raise exception 'REGRESSION: pgmq extension kayıp'; end if;
  if not v_pg_cron_extension then raise exception 'REGRESSION: pg_cron extension kayıp'; end if;
  if not v_pg_net_extension then raise exception 'REGRESSION: pg_net extension kayıp'; end if;
  if not v_q_bulk_listings then raise exception 'REGRESSION: pgmq.q_bulk_listings kayıp'; end if;
  if not v_q_kyc_prescan then raise exception 'REGRESSION: pgmq.q_kyc_prescan kayıp'; end if;
  if not v_pgmq_send_rpc then raise exception 'REGRESSION: pgmq_send RPC kayıp'; end if;
  if not v_pgmq_read_rpc then raise exception 'REGRESSION: pgmq_read RPC kayıp'; end if;
  if not v_pgmq_delete_rpc then raise exception 'REGRESSION: pgmq_delete RPC kayıp'; end if;
  if not v_vault_cron_secret then raise exception 'REGRESSION: vault matching_fanout_cron_secret kayıp'; end if;

  -- RB1/RB2 regression (6)
  if not v_cl_dublike_insert_dropped then raise exception 'REGRESSION: corp_leads cl_insert_anyone geri gelmiş'; end if;
  if not v_cl_select_admin_only then raise exception 'REGRESSION: corp_leads allow_select_all geri gelmiş'; end if;
  if not v_cl_anon_insert_kept then raise exception 'REGRESSION: corp_leads anon INSERT akışı bozulmuş'; end if;
  if not v_org_public_read_dropped_admin_added then raise exception 'REGRESSION: org_public_read geri gelmiş'; end if;
  if not v_org_member_select_kept then raise exception 'REGRESSION: org_select_member kayıp'; end if;
  if not v_bid_bonds_zero_policy then raise exception 'REGRESSION: bid_bonds policy 0 değil'; end if;

  -- Bundle (4)
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
  if not v_bids_select_bidder_or_owner_present then raise exception 'REGRESSION: Faz 1 bids_select_bidder kayıp'; end if;
  if not v_bid_public_summary_view_present then raise exception 'REGRESSION: Faz 1 view kayıp'; end if;
  if not v_rl_buckets_rls_on then raise exception 'REGRESSION: Faz 1 rl_buckets RLS kapalı'; end if;

  -- Faz 2/3 tablo (12)
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

  -- schema_migrations row önceki (2)
  if not v_schema_migrations_rb_row then raise exception 'REGRESSION: schema_migrations RB1/RB2 kayıp'; end if;
  if not v_schema_migrations_faz4_row then raise exception 'REGRESSION: schema_migrations Faz 4 kayıp'; end if;

  -- Sistemik RLS koruması
  if v_rls_disabled_count > 0 then raise exception 'SECURITY FAIL: % tabloda RLS DISABLED (grant ile açılır kalır)', v_rls_disabled_count; end if;

  raise notice 'Grants restore smoke OK — 67/67 check geçti (19 yeni grant + 47 önceki regression + 1 RLS koruma)';
end
$regress$;

commit;

-- ──────────────────────────────────────────────────────────────────────────
-- Son satır: tek SELECT — deploy başarı sinyali
-- ──────────────────────────────────────────────────────────────────────────

select
  '20260528170000_grants_restore_systemic' as migration,
  'deployed' as status,
  (select count(distinct table_name) from information_schema.role_table_grants
    where table_schema='public' and grantee='service_role' and privilege_type='SELECT') as srv_select_count,
  (select count(distinct table_name) from information_schema.role_table_grants
    where table_schema='public' and grantee='authenticated' and privilege_type='SELECT') as auth_select_count,
  (select count(distinct table_name) from information_schema.role_table_grants
    where table_schema='public' and grantee='anon' and privilege_type='SELECT') as anon_select_count,
  (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='r' and not c.relrowsecurity) as rls_disabled_count,
  (select exists (select 1 from cron.job where jobname='matching-fanout-every-minute')) as cron_rescheduled,
  (select exists (select 1 from supabase_migrations.schema_migrations where version='20260528170000')) as schema_migrations_row,
  now() as deployed_at;
