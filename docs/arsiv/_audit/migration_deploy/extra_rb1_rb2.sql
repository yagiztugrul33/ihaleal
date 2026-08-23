-- ═══════════════════════════════════════════════════════════════════════════
-- DEPLOY — RB1 + RB2 RLS HARDENING (atomik, BEGIN/COMMIT)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- KULLANIM:
--   npx supabase db query --linked --file _audit/migration_deploy/extra_rb1_rb2.sql
--
-- AMAÇ:
--   RB1: corporate_leads + organizations RLS sertleştirme
--   RB2: bid_bonds 3 orphan policy DROP (tablo + grants KORUNUYOR)
--
-- KAYNAK:
--   supabase/migrations/20260528150000_rb1_rb2_rls_hardening.sql
--
-- ÖN-KONTROL (2026-05-28, _audit/tmp_rb1_rb2_precheck.sql canlı sonuç):
--   - corporate_leads: 3 policy (allow_insert_all, allow_select_all, cl_insert_anyone)
--   - organizations: 2 policy (org_public_read, org_select_member); has_org_role mevcut
--   - bid_bonds: 3 policy (insert/select/update_self); prosrc ref NONE; rowcount 0
--   - CorporateContact.tsx anon INSERT-only; useActiveOrg.ts authenticated SELECT
--
-- REVERSE (geri alma) — atomik tek blok:
--
--   begin;
--   -- RB1 corporate_leads
--   drop policy if exists corporate_leads_select_admin on public.corporate_leads;
--   create policy cl_insert_anyone on public.corporate_leads
--     for insert to public with check (true);
--   create policy allow_select_all on public.corporate_leads
--     for select to anon, authenticated using (true);
--   -- RB1 organizations
--   drop policy if exists org_select_admin on public.organizations;
--   create policy org_public_read on public.organizations
--     for select to public using (true);
--   -- RB2 bid_bonds
--   create policy bid_bonds_insert_self on public.bid_bonds
--     for insert to public with check (auth.uid() = bidder_id);
--   create policy bid_bonds_select_self on public.bid_bonds
--     for select to public using (auth.uid() = bidder_id);
--   create policy bid_bonds_update_self on public.bid_bonds
--     for update to public using (auth.uid() = bidder_id) with check (auth.uid() = bidder_id);
--   -- schema_migrations satırını sil
--   delete from supabase_migrations.schema_migrations where version='20260528150000';
--   commit;
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ──────────────────────────────────────────────────────────────────────────
-- RB1 / corporate_leads
-- ──────────────────────────────────────────────────────────────────────────

drop policy if exists cl_insert_anyone on public.corporate_leads;
drop policy if exists allow_select_all on public.corporate_leads;

create policy corporate_leads_select_admin
  on public.corporate_leads
  for select
  to public
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.is_admin = true or p.role = 'admin')
    )
  );

-- ──────────────────────────────────────────────────────────────────────────
-- RB1 / organizations
-- ──────────────────────────────────────────────────────────────────────────

drop policy if exists org_public_read on public.organizations;

create policy org_select_admin
  on public.organizations
  for select
  to public
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.is_admin = true or p.role = 'admin')
    )
  );

-- ──────────────────────────────────────────────────────────────────────────
-- RB2 / bid_bonds (3 orphan policy DROP)
-- ──────────────────────────────────────────────────────────────────────────

drop policy if exists bid_bonds_insert_self on public.bid_bonds;
drop policy if exists bid_bonds_select_self on public.bid_bonds;
drop policy if exists bid_bonds_update_self on public.bid_bonds;

-- ──────────────────────────────────────────────────────────────────────────
-- schema_migrations kaydı
-- ──────────────────────────────────────────────────────────────────────────

insert into supabase_migrations.schema_migrations (version, name, statements)
  values (
    '20260528150000',
    'rb1_rb2_rls_hardening',
    array['-- see supabase/migrations/20260528150000_rb1_rb2_rls_hardening.sql']
  )
on conflict (version) do nothing;

-- ──────────────────────────────────────────────────────────────────────────
-- Atomik regression smoke — 36 check (6 RB self + 29 önceki regression + 1 migration row)
-- ──────────────────────────────────────────────────────────────────────────

do $regress$
declare
  -- 5 RB self-check
  v_cl_dublike_insert_dropped boolean;
  v_cl_select_admin_only boolean;
  v_cl_anon_insert_kept boolean;
  v_org_public_read_dropped_admin_added boolean;
  v_org_member_select_kept boolean;
  v_bid_bonds_zero_policy boolean;
  -- önceki regression (security_bundle paterni)
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
  v_schema_migrations_rb_row boolean;
begin
  -- ═══ RB SELF-CHECK (5) ═══

  -- 1) corp_leads cl_insert_anyone DROPPED + allow_insert_all KEPT
  select not exists (select 1 from pg_policies
      where schemaname='public' and tablename='corporate_leads' and policyname='cl_insert_anyone')
     and exists (select 1 from pg_policies
      where schemaname='public' and tablename='corporate_leads' and policyname='allow_insert_all')
  into v_cl_dublike_insert_dropped;

  -- 2) corp_leads allow_select_all DROPPED + corporate_leads_select_admin PRESENT
  select not exists (select 1 from pg_policies
      where schemaname='public' and tablename='corporate_leads' and policyname='allow_select_all')
     and exists (select 1 from pg_policies
      where schemaname='public' and tablename='corporate_leads' and policyname='corporate_leads_select_admin')
  into v_cl_select_admin_only;

  -- 3) corp_leads anon INSERT akışı korundu (allow_insert_all hâlâ INSERT + anon role içerir)
  select exists (select 1 from pg_policies
      where schemaname='public' and tablename='corporate_leads' and policyname='allow_insert_all'
        and cmd='INSERT' and 'anon' = ANY(roles::text[]))
  into v_cl_anon_insert_kept;

  -- 4) organizations org_public_read DROPPED + org_select_admin PRESENT
  select not exists (select 1 from pg_policies
      where schemaname='public' and tablename='organizations' and policyname='org_public_read')
     and exists (select 1 from pg_policies
      where schemaname='public' and tablename='organizations' and policyname='org_select_admin')
  into v_org_public_read_dropped_admin_added;

  -- 5) organizations org_select_member KEPT (üye SELECT akışı useActiveOrg.ts için)
  select exists (select 1 from pg_policies
      where schemaname='public' and tablename='organizations' and policyname='org_select_member')
  into v_org_member_select_kept;

  -- 6) bid_bonds policy sayısı = 0 (3 orphan DROPPED)
  select (select count(*) from pg_policies where schemaname='public' and tablename='bid_bonds') = 0
  into v_bid_bonds_zero_policy;

  -- ═══ ÖNCEKİ REGRESSION (27) ═══

  -- security_bundle 4 self
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

  -- Grant sertleştirme (3)
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

  -- KYC guard
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='execute_buy_now' and p.prosrc like '%kyc_required%')
  into v_kyc_guard_buy_now_present;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='register_bid_deposit' and p.prosrc like '%kyc_required%')
  into v_kyc_guard_deposit_present;

  -- Faz 1
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

  -- Faz 2/3 tablolar
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

  -- RPC'ler
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='register_push_token') into v_register_push_token_fn;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='submit_takas_application') into v_submit_takas_fn;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='submit_ges_land_evaluation') into v_submit_ges_fn;
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='create_trade_offer') into v_create_trade_offer_fn;

  -- schema_migrations RB satırı
  select exists (select 1 from supabase_migrations.schema_migrations where version='20260528150000')
  into v_schema_migrations_rb_row;

  -- ═══ RAISE EXCEPTION (32 check) ═══

  -- RB self (5 + 1 bonus)
  if not v_cl_dublike_insert_dropped then raise exception 'RB1 FAIL: corp_leads cl_insert_anyone hâlâ var veya allow_insert_all kayıp'; end if;
  if not v_cl_select_admin_only then raise exception 'RB1 FAIL: corp_leads allow_select_all hâlâ var veya corporate_leads_select_admin kayıp'; end if;
  if not v_cl_anon_insert_kept then raise exception 'RB1 FAIL: corp_leads anon INSERT akışı bozulmuş (allow_insert_all anon rolünde değil)'; end if;
  if not v_org_public_read_dropped_admin_added then raise exception 'RB1 FAIL: organizations org_public_read hâlâ var veya org_select_admin kayıp'; end if;
  if not v_org_member_select_kept then raise exception 'RB1 FAIL: organizations org_select_member kayıp (useActiveOrg akışı kırılır)'; end if;
  if not v_bid_bonds_zero_policy then raise exception 'RB2 FAIL: bid_bonds policy sayısı 0 değil (3 orphan DROP eksik)'; end if;

  -- Önceki regression (20 + 4 + 3 = 27)
  if not v_place_bid_deposit_guard then raise exception 'REGRESSION: place_bid deposit guard kayıp'; end if;
  if not v_calc_commission_auth_check then raise exception 'REGRESSION: calc_commission auth check kayıp'; end if;
  if not v_submit_ges_auth_null_check then raise exception 'REGRESSION: submit_ges auth null check kayıp'; end if;
  if not v_consume_ai_quota_org_check then raise exception 'REGRESSION: consume_ai_quota has_org_role kayıp'; end if;
  if not v_calc_commission_public_revoked then raise exception 'REGRESSION: calc_commission PUBLIC EXECUTE geri gelmiş'; end if;
  if not v_consume_ai_quota_public_revoked then raise exception 'REGRESSION: consume_ai_quota PUBLIC EXECUTE geri gelmiş'; end if;
  if not v_submit_ges_anon_revoked then raise exception 'REGRESSION: submit_ges anon EXECUTE geri gelmiş'; end if;
  if not v_kyc_guard_buy_now_present then raise exception 'REGRESSION: KYC guard (execute_buy_now) bozulmuş'; end if;
  if not v_kyc_guard_deposit_present then raise exception 'REGRESSION: KYC guard (register_bid_deposit) bozulmuş'; end if;
  if not v_bids_select_public_dropped then raise exception 'REGRESSION: Faz 1 bids_select_public geri gelmiş'; end if;
  if not v_bids_select_bidder_or_owner_present then raise exception 'REGRESSION: Faz 1 bids_select_bidder_or_listing_owner kayıp'; end if;
  if not v_bid_public_summary_view_present then raise exception 'REGRESSION: Faz 1 auction_bid_public_summary view kayıp'; end if;
  if not v_rl_buckets_rls_on then raise exception 'REGRESSION: Faz 1 rate_limit_buckets RLS kapalı'; end if;
  if not v_organizations_table then raise exception 'REGRESSION: Faz 2 organizations kayıp'; end if;
  if not v_buyer_preferences_table then raise exception 'REGRESSION: Faz 2 buyer_preferences kayıp'; end if;
  if not v_kyc_verifications_table then raise exception 'REGRESSION: Faz 2 kyc_verifications kayıp'; end if;
  if not v_property_submissions_table then raise exception 'REGRESSION: Faz 3a property_submissions kayıp'; end if;
  if not v_ges_projects_table then raise exception 'REGRESSION: Faz 3a ges_projects kayıp'; end if;
  if not v_trade_offers_table then raise exception 'REGRESSION: Faz 3b trade_offers kayıp'; end if;
  if not v_device_push_tokens_table then raise exception 'REGRESSION: device_push_tokens kayıp'; end if;
  if not v_engineering_runs_table then raise exception 'REGRESSION: Faz 3a engineering_analysis_runs kayıp'; end if;
  if not v_moderation_queue_table then raise exception 'REGRESSION: Faz 2 moderation_queue kayıp'; end if;
  if not v_corporate_leads_table then raise exception 'REGRESSION: Faz 2 corporate_leads tablosu kayıp'; end if;
  if not v_listing_matches_table then raise exception 'REGRESSION: Faz 2 listing_matches kayıp'; end if;
  if not v_watchlist_table then raise exception 'REGRESSION: Faz 2 watchlist kayıp'; end if;
  if not v_register_push_token_fn then raise exception 'REGRESSION: register_push_token kayıp'; end if;
  if not v_submit_takas_fn then raise exception 'REGRESSION: submit_takas_application kayıp'; end if;
  if not v_submit_ges_fn then raise exception 'REGRESSION: submit_ges_land_evaluation kayıp'; end if;
  if not v_create_trade_offer_fn then raise exception 'REGRESSION: create_trade_offer kayıp'; end if;

  -- Migration satırı
  if not v_schema_migrations_rb_row then raise exception 'RB FAIL: schema_migrations RB satırı eksik'; end if;

  raise notice 'RB1+RB2 smoke OK — 36/36 check geçti (6 RB self + 4 bundle self + 3 grant + 2 KYC + 4 Faz1 + 12 tablo + 4 RPC + 1 migration row)';
end;
$regress$;

commit;

-- ──────────────────────────────────────────────────────────────────────────
-- Son satır: tek SELECT — deploy başarı sinyali
-- ──────────────────────────────────────────────────────────────────────────

select
  '20260528150000_rb1_rb2_rls_hardening' as migration,
  'deployed' as status,
  (select count(*) from pg_policies where schemaname='public' and tablename='corporate_leads') as cl_policy_count,
  (select count(*) from pg_policies where schemaname='public' and tablename='organizations') as org_policy_count,
  (select count(*) from pg_policies where schemaname='public' and tablename='bid_bonds') as bid_bonds_policy_count,
  (select exists (select 1 from pg_policies where schemaname='public' and tablename='corporate_leads' and policyname='corporate_leads_select_admin')) as cl_admin_select_present,
  (select exists (select 1 from pg_policies where schemaname='public' and tablename='organizations' and policyname='org_select_admin')) as org_admin_select_present,
  (select exists (select 1 from supabase_migrations.schema_migrations where version='20260528150000')) as schema_migrations_row,
  now() as deployed_at;
