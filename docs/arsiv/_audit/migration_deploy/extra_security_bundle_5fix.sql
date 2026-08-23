-- ═══════════════════════════════════════════════════════════════════════════
-- DEPLOY — SECURITY BUNDLE 4 FIX (atomik, BEGIN/COMMIT)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- KULLANIM:
--   npx supabase db query --linked --file _audit/migration_deploy/extra_security_bundle_5fix.sql
--
-- AMAÇ:
--   4 sunucu-tarafı güvenlik fix'i tek atomik bundle olarak deploy eder:
--     - F1.2 place_bid deposit guard
--     - F1.9 calculate_commission_with_offset auth check + REVOKE PUBLIC
--     - F1.10 submit_ges_land_evaluation auth.uid() null check
--     - F1.11 consume_ai_quota has_org_role check + REVOKE PUBLIC
--
-- KAYNAK:
--   supabase/migrations/20260527130100_security_bundle_5fix.sql
--
-- REVERSE (4 ayrı blok — hangi fix'i geri almak istiyorsanız onu kullanın):
--
--   --- REVERSE FIX 1 (place_bid → 20260430150000 versiyona dön) ---
--   begin;
--   create or replace function public.place_bid(p_auction_id uuid, p_amount numeric, p_idempotency_key text)
--   returns json language plpgsql security definer set search_path = public as $fn$
--   declare
--     v_auction record; v_bidder uuid := auth.uid();
--     v_min_increment numeric := 100;
--     v_threshold interval := interval '120 seconds';
--     v_extend interval := interval '120 seconds';
--     v_new_ends timestamptz;
--   begin
--     if v_bidder is null then return json_build_object('status','error','message','Giriş yapmalısınız'); end if;
--     if exists (select 1 from public.bids where auction_id=p_auction_id and bidder_id=v_bidder and idempotency_key=p_idempotency_key) then
--       return json_build_object('status','duplicate','message','Bu teklif zaten kayıtlı'); end if;
--     select * into v_auction from public.auctions where id=p_auction_id for update;
--     if v_auction is null then return json_build_object('status','error','message','İhale bulunamadı'); end if;
--     if v_auction.status != 'live' then return json_build_object('status','error','message','İhale aktif değil'); end if;
--     if v_auction.ends_at <= clock_timestamp() then return json_build_object('status','error','message','İhale bitti'); end if;
--     v_min_increment := coalesce(v_auction.min_increment_try, 100);
--     if p_amount < coalesce(v_auction.current_high_bid_try,0) + v_min_increment then
--       return json_build_object('status','error','message','Teklif çok düşük'); end if;
--     v_new_ends := v_auction.ends_at;
--     if clock_timestamp() >= v_auction.ends_at - v_threshold then
--       v_new_ends := v_auction.ends_at + v_extend;
--       update public.auctions set ends_at=v_new_ends where id=p_auction_id;
--     end if;
--     insert into public.bids (auction_id,bidder_id,amount_try,idempotency_key) values (p_auction_id,v_bidder,p_amount,p_idempotency_key);
--     update public.auctions set current_high_bid_try=p_amount, current_high_bidder_id=v_bidder, bid_count=bid_count+1 where id=p_auction_id;
--     return json_build_object('status','ok','amount',p_amount,'ends_at',v_new_ends);
--   end; $fn$;
--   grant execute on function public.place_bid(uuid, numeric, text) to authenticated;
--   commit;
--
--   --- REVERSE FIX 2 (calculate_commission_with_offset → öncesine dön) ---
--   --- Önceki gövde _audit/tmp_rpc_bodies_parsed.txt:6-120 (auth check yok)
--   --- + grant execute on function ... to PUBLIC;
--
--   --- REVERSE FIX 3 (submit_ges_land_evaluation → öncesine dön) ---
--   --- Önceki gövde _audit/tmp_rpc_bodies_parsed.txt:235-341 (auth null check yok)
--   --- + grant execute on function ... to anon, PUBLIC, authenticated;
--
--   --- REVERSE FIX 4 (consume_ai_quota → öncesine dön) ---
--   --- Önceki gövde _audit/tmp_rpc_bodies_parsed.txt:128-142 (has_org_role check yok)
--   --- + grant execute on function ... to PUBLIC;
--
--   --- son: schema_migrations satırını sil ---
--   delete from supabase_migrations.schema_migrations where version='20260527130100';
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ──────────────────────────────────────────────────────────────────────────
-- FIX 1/4: place_bid deposit guard
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.place_bid(
  p_auction_id uuid,
  p_amount numeric,
  p_idempotency_key text
) returns json
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_auction record;
  v_bidder uuid := auth.uid();
  v_min_increment numeric := 100;
  v_threshold interval := interval '120 seconds';
  v_extend interval := interval '120 seconds';
  v_new_ends timestamptz;
begin
  if v_bidder is null then
    return json_build_object('status','error','message','Giriş yapmalısınız');
  end if;

  -- ═══ DEPOSIT GUARD ═══
  if not exists (
    select 1 from public.bid_deposits
    where auction_id = p_auction_id
      and buyer_id = v_bidder
      and context = 'bid'
      and status = 'authorized'
  ) then
    return json_build_object(
      'status','error',
      'code','deposit_required',
      'message','Teklif vermeden önce teminat (ön yetki) zorunlu. Önce teminat yatırın.'
    );
  end if;

  if exists (
    select 1 from public.bids
    where auction_id = p_auction_id
      and bidder_id = v_bidder
      and idempotency_key = p_idempotency_key
  ) then
    return json_build_object('status','duplicate','message','Bu teklif zaten kayıtlı');
  end if;

  select * into v_auction from public.auctions
  where id = p_auction_id for update;

  if v_auction is null then
    return json_build_object('status','error','message','İhale bulunamadı');
  end if;
  if v_auction.status != 'live' then
    return json_build_object('status','error','message','İhale aktif değil');
  end if;
  if v_auction.ends_at <= clock_timestamp() then
    return json_build_object('status','error','message','İhale bitti');
  end if;

  v_min_increment := coalesce(v_auction.min_increment_try, 100);
  if p_amount < coalesce(v_auction.current_high_bid_try, 0) + v_min_increment then
    return json_build_object('status','error','message','Teklif çok düşük');
  end if;

  v_new_ends := v_auction.ends_at;
  if clock_timestamp() >= v_auction.ends_at - v_threshold then
    v_new_ends := v_auction.ends_at + v_extend;
    update public.auctions
      set ends_at = v_new_ends
    where id = p_auction_id;
  end if;

  insert into public.bids (auction_id, bidder_id, amount_try, idempotency_key)
    values (p_auction_id, v_bidder, p_amount, p_idempotency_key);

  update public.auctions
    set current_high_bid_try = p_amount,
        current_high_bidder_id = v_bidder,
        bid_count = bid_count + 1
    where id = p_auction_id;

  return json_build_object('status','ok','amount',p_amount,'ends_at',v_new_ends);
end;
$fn$;

grant execute on function public.place_bid(uuid, numeric, text) to authenticated;

-- ──────────────────────────────────────────────────────────────────────────
-- FIX 2/4: calculate_commission_with_offset — auth check + REVOKE PUBLIC
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.calculate_commission_with_offset(
  p_auction_id uuid,
  p_sale_amount numeric
) returns json
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_caller uuid := auth.uid();
  v_seller_id uuid;
  v_buyer_id uuid;
  v_agent_id uuid;
  v_agent_role text;
  v_seller_commission numeric;
  v_buyer_commission numeric;
  v_seller_vat numeric;
  v_buyer_vat numeric;
  v_offset_membership numeric := 0;
  v_offset_service numeric := 0;
  v_agent_share numeric := 0;
  v_agent_share_rate numeric := 0;
  v_platform_net numeric;
  v_commission_rate numeric := 0.04;
  v_vat_rate numeric := 0.20;
  v_record_id uuid;
  v_is_admin boolean;
begin
  if v_caller is null then
    return json_build_object('status','error','code','auth_required','message','Giriş yapmalısınız');
  end if;

  select
    l.seller_id,
    a.current_high_bidder_id,
    ar.authorized_by_agent_id,
    ar.agent_role
  into v_seller_id, v_buyer_id, v_agent_id, v_agent_role
  from public.auctions a
  join public.listings l on l.id = a.listing_id
  left join lateral (
    select z.authorized_by_agent_id, z.agent_role
    from public.authorizations z
    where z.listing_id = l.id
      and z.status = 'active'
    order by z.created_at desc nulls last
    limit 1
  ) ar on true
  where a.id = p_auction_id;

  if v_seller_id is null then
    return json_build_object('status','error','message','İhale bulunamadı');
  end if;

  select coalesce((select p.is_admin = true or p.role = 'admin'
                   from public.profiles p where p.id = v_caller), false)
  into v_is_admin;

  if not v_is_admin
     and v_caller <> coalesce(v_seller_id, '00000000-0000-0000-0000-000000000000'::uuid)
     and v_caller <> coalesce(v_buyer_id, '00000000-0000-0000-0000-000000000000'::uuid)
     and v_caller <> coalesce(v_agent_id, '00000000-0000-0000-0000-000000000000'::uuid)
  then
    return json_build_object('status','error','code','forbidden','message','Bu işlem yalnız admin veya işlem tarafları için');
  end if;

  v_seller_commission := p_sale_amount * v_commission_rate;
  v_buyer_commission := p_sale_amount * v_commission_rate;
  v_seller_vat := v_seller_commission * v_vat_rate;
  v_buyer_vat := v_buyer_commission * v_vat_rate;

  select coalesce(sum(m.amount_paid_try), 0) into v_offset_membership
  from public.memberships m
  where m.user_id = v_seller_id
    and m.status = 'active'
    and m.starts_at <= now()
    and m.expires_at >= now();

  select coalesce(sum(sf.amount_try), 0) into v_offset_service
  from public.service_fees sf
  join public.listings l2 on l2.id = sf.listing_id
  join public.auctions a2 on a2.listing_id = l2.id
  where sf.user_id = v_seller_id
    and a2.id = p_auction_id
    and sf.status = 'paid';

  if v_agent_id is not null then
    v_agent_share_rate := case v_agent_role
      when 'referral' then 0.005
      when 'portfolio' then 0.015
      when 'full' then 0.02
      else 0
    end;
    v_agent_share := round(p_sale_amount * v_agent_share_rate, 2);
  end if;

  v_platform_net :=
      (v_seller_commission + v_buyer_commission)
    - v_offset_membership
    - v_offset_service
    - v_agent_share;

  insert into public.commission_records (
    auction_id, seller_id, buyer_id,
    sale_amount_try,
    seller_commission_try, seller_vat_try,
    buyer_commission_try, buyer_vat_try,
    offset_membership_try, offset_service_fees_try,
    offset_total_try,
    agent_id, agent_role, agent_share_rate, agent_share_try,
    platform_net_try
  ) values (
    p_auction_id, v_seller_id, v_buyer_id,
    p_sale_amount,
    v_seller_commission, v_seller_vat,
    v_buyer_commission, v_buyer_vat,
    v_offset_membership, v_offset_service,
    v_offset_membership + v_offset_service,
    v_agent_id,
    v_agent_role,
    case when v_agent_id is not null then v_agent_share_rate else null end,
    v_agent_share,
    v_platform_net
  )
  returning id into v_record_id;

  return json_build_object(
    'status','ok',
    'record_id', v_record_id,
    'sale_amount', p_sale_amount,
    'seller_commission', v_seller_commission,
    'buyer_commission', v_buyer_commission,
    'total_vat', v_seller_vat + v_buyer_vat,
    'offset_membership', v_offset_membership,
    'offset_service', v_offset_service,
    'agent_share', v_agent_share,
    'platform_net', v_platform_net
  );
end;
$fn$;

revoke execute on function public.calculate_commission_with_offset(uuid, numeric) from PUBLIC;
grant execute on function public.calculate_commission_with_offset(uuid, numeric) to authenticated;

-- ──────────────────────────────────────────────────────────────────────────
-- FIX 3/4: submit_ges_land_evaluation — auth null check + REVOKE anon
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.submit_ges_land_evaluation(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_user_id uuid := auth.uid();
  v_project_id uuid;
  v_area numeric := (payload->>'totalAreaM2')::numeric;
  v_dist numeric := coalesce((payload->>'distanceToTrafoKm')::numeric, 0);
  v_irr numeric := (payload->>'solarIrradianceKwh')::numeric;
  v_capacity numeric;
  v_cf numeric;
  v_annual_mwh numeric;
  v_capex numeric;
  v_payback numeric;
  v_kill jsonb;
  v_kill_enum public.ges_hard_kill_reason;
  v_reason text;
  v_score integer;
  v_status public.ges_project_status;
  v_log jsonb := '[]'::jsonb;
  v_notes jsonb := jsonb_build_array(
    'Bu cikti on fizibilite niteligindedir; EPDK/TEIAS/TEDAS onaylari ayrica gereklidir.',
    'Resmi GEPA/Tarim sinifi yerel kayitlarla teyit edilmelidir.'
  );
begin
  if v_user_id is null then raise exception 'authentication required'; end if;

  if v_area is null or v_area <= 0 then raise exception 'totalAreaM2 must be positive'; end if;
  if v_irr is null or v_irr <= 0 then raise exception 'solarIrradianceKwh must be positive'; end if;

  v_capacity := round((v_area / 15000.0)::numeric, 3);
  v_kill := public.ges_evaluate_hard_kill(payload);
  v_reason := v_kill->>'reason';
  if (v_kill->>'kill') is not null then
    v_kill_enum := (v_kill->>'kill')::public.ges_hard_kill_reason;
  end if;

  v_score := public.ges_calculate_score(payload, v_capacity);
  if v_kill_enum is not null then v_score := least(v_score, 25); end if;

  if v_kill_enum is not null then v_status := 'TECHNICAL_REJECTION';
  elsif v_score >= 75 then v_status := 'HIGH_VIABILITY';
  else v_status := 'ENGINEERING_CALCULATION'; end if;

  v_cf := least(0.28, greatest(0.14, (v_irr / 2000.0) * 0.22));
  v_annual_mwh := round(v_capacity * v_cf * 8760, 1);
  v_capex := round(v_capacity * 13500000.0 * case when v_dist > 10 then 1.12 when v_dist > 5 then 1.06 else 1 end);
  if v_annual_mwh * 1000 * 2.6 > 0 then v_payback := round(v_capex / (v_annual_mwh * 1000 * 2.6), 1); end if;

  v_log := v_log || jsonb_build_array(format('[Muhendislik] Tahmini kurulu guc: %s MW', v_capacity));

  insert into public.ges_projects (
    user_id, city, district, neighborhood, ada, parcel,
    total_area_m2, distance_to_trafo_km, trafo_name, trafo_capacity_mw,
    solar_irradiance_kwh, slope_degree, slope_aspect,
    agricultural_class, is_marginal_tarim_approved,
    has_cadastral_road, has_sit_area_conflict, has_military_zone_conflict, has_archaeological_site,
    owner_name, owner_email, owner_phone,
    status, ges_feasibility_score, technical_viability_score,
    estimated_capacity_mw, estimated_annual_mwh, estimated_capex_try, payback_years,
    hard_kill, rejection_reason, engineering_log, compliance_notes, input_snapshot
  ) values (
    v_user_id,
    coalesce(payload->>'city', ''), coalesce(payload->>'district', ''),
    payload->>'neighborhood', payload->>'ada', payload->>'parcel',
    v_area, v_dist, payload->>'trafoName',
    (payload->>'trafoCapacityMw')::numeric, v_irr,
    coalesce((payload->>'slopeDegree')::numeric, 0),
    coalesce(payload->>'slopeAspect', 'FLAT')::public.ges_slope_aspect,
    coalesce(payload->>'agriculturalClass', 'UNKNOWN')::public.ges_agricultural_class,
    coalesce((payload->>'isMarginalTarimApproved')::boolean, false),
    coalesce((payload->>'hasCadastralRoad')::boolean, false),
    coalesce((payload->>'hasSitAreaConflict')::boolean, false),
    coalesce((payload->>'hasMilitaryZoneConflict')::boolean, false),
    coalesce((payload->>'hasArchaeologicalSite')::boolean, false),
    payload->>'ownerName', payload->>'ownerEmail', payload->>'ownerPhone',
    v_status, v_score, v_score,
    v_capacity, v_annual_mwh, v_capex, v_payback,
    v_kill_enum, v_reason, v_log, v_notes, payload
  ) returning id into v_project_id;

  insert into public.ges_technical_analyses (
    project_id, estimated_capacity_mw, estimated_annual_mwh, estimated_capex_try,
    payback_years, technical_viability_score, engineering_log
  ) values (v_project_id, v_capacity, v_annual_mwh, v_capex, v_payback, v_score, v_log);

  insert into public.ges_legal_compliance (
    project_id, agricultural_class, is_marginal_tarim_approved,
    has_cadastral_road, has_sit_area_conflict, has_military_zone_conflict, has_archaeological_site,
    hard_kill, rejection_reason, compliance_notes
  ) values (
    v_project_id,
    coalesce(payload->>'agriculturalClass', 'UNKNOWN')::public.ges_agricultural_class,
    coalesce((payload->>'isMarginalTarimApproved')::boolean, false),
    coalesce((payload->>'hasCadastralRoad')::boolean, false),
    coalesce((payload->>'hasSitAreaConflict')::boolean, false),
    coalesce((payload->>'hasMilitaryZoneConflict')::boolean, false),
    coalesce((payload->>'hasArchaeologicalSite')::boolean, false),
    v_kill_enum, v_reason, v_notes
  );

  return jsonb_build_object(
    'projectId', v_project_id, 'status', v_status,
    'gesFeasibilityScore', v_score, 'technicalViabilityScore', v_score,
    'estimatedCapacityMw', v_capacity, 'estimatedAnnualMwh', v_annual_mwh,
    'estimatedCapexTry', v_capex, 'paybackYears', v_payback,
    'hardKill', v_kill->>'kill', 'rejectionReason', v_reason,
    'engineeringLog', v_log, 'complianceNotes', v_notes
  );
end;
$fn$;

revoke execute on function public.submit_ges_land_evaluation(jsonb) from anon, PUBLIC;
grant execute on function public.submit_ges_land_evaluation(jsonb) to authenticated;

-- ──────────────────────────────────────────────────────────────────────────
-- FIX 4/4: consume_ai_quota — has_org_role check + REVOKE PUBLIC
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.consume_ai_quota(p_org uuid DEFAULT NULL::uuid, p_count integer DEFAULT 1)
returns boolean
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_used int;
  v_quota int;
  v_period timestamptz;
begin
  if p_org is null then return true; end if;

  if not public.has_org_role(p_org, array['owner','admin','manager','agent']) then
    raise exception 'forbidden';
  end if;

  select ai_used_this_period, ai_quota_monthly, period_started_at
    into v_used, v_quota, v_period
    from organizations where id = p_org for update;

  if v_period < date_trunc('month', now()) then
    update organizations set ai_used_this_period = 0, period_started_at = date_trunc('month', now()) where id = p_org;
    v_used := 0;
  end if;

  if v_used + p_count > v_quota then return false; end if;

  update organizations set ai_used_this_period = ai_used_this_period + p_count where id = p_org;
  return true;
end;
$fn$;

revoke execute on function public.consume_ai_quota(uuid, integer) from PUBLIC;
grant execute on function public.consume_ai_quota(uuid, integer) to authenticated;

-- ──────────────────────────────────────────────────────────────────────────
-- schema_migrations kaydı
-- ──────────────────────────────────────────────────────────────────────────

insert into supabase_migrations.schema_migrations (version, name, statements)
  values (
    '20260527130100',
    'security_bundle_5fix',
    array['-- see supabase/migrations/20260527130100_security_bundle_5fix.sql']
  )
on conflict (version) do nothing;

-- ──────────────────────────────────────────────────────────────────────────
-- Atomik regression smoke — 27 check (23 önceki + 4 yeni bundle self)
-- ──────────────────────────────────────────────────────────────────────────

do $regress$
declare
  -- 4 yeni bundle self-check
  v_place_bid_deposit_guard boolean;
  v_calc_commission_auth_check boolean;
  v_submit_ges_auth_null_check boolean;
  v_consume_ai_quota_org_check boolean;
  -- 23 önceki regression
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
  v_schema_migrations_bundle_row boolean;
  -- Bonus: grant doğrulamaları
  v_calc_commission_public_revoked boolean;
  v_consume_ai_quota_public_revoked boolean;
  v_submit_ges_anon_revoked boolean;
begin
  -- ═══ YENİ BUNDLE SELF-CHECK (4) ═══

  -- 1) place_bid: deposit guard prosrc'ta var mı
  select exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='place_bid'
      and p.prosrc like '%bid_deposits%'
      and p.prosrc like '%deposit_required%'
      and p.prosrc like '%DEPOSIT GUARD%'
  ) into v_place_bid_deposit_guard;

  -- 2) calculate_commission_with_offset: auth.uid() ve forbidden check prosrc'ta var mı
  select exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='calculate_commission_with_offset'
      and p.prosrc like '%auth.uid()%'
      and p.prosrc like '%auth_required%'
      and p.prosrc like '%forbidden%'
  ) into v_calc_commission_auth_check;

  -- 3) submit_ges_land_evaluation: auth null check prosrc'ta var mı
  select exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='submit_ges_land_evaluation'
      and p.prosrc like '%v_user_id is null%'
      and p.prosrc like '%authentication required%'
  ) into v_submit_ges_auth_null_check;

  -- 4) consume_ai_quota: has_org_role check prosrc'ta var mı
  select exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='consume_ai_quota'
      and p.prosrc like '%has_org_role%'
      and p.prosrc like '%forbidden%'
  ) into v_consume_ai_quota_org_check;

  -- ═══ GRANT SERTLEŞTİRME DOĞRULAMA (3) ═══

  -- calc_commission: PUBLIC EXECUTE kalkmış olmalı
  select not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema='public' and routine_name='calculate_commission_with_offset'
      and grantee='PUBLIC' and privilege_type='EXECUTE'
  ) into v_calc_commission_public_revoked;

  -- consume_ai_quota: PUBLIC EXECUTE kalkmış olmalı
  select not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema='public' and routine_name='consume_ai_quota'
      and grantee='PUBLIC' and privilege_type='EXECUTE'
  ) into v_consume_ai_quota_public_revoked;

  -- submit_ges: anon EXECUTE kalkmış olmalı
  select not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema='public' and routine_name='submit_ges_land_evaluation'
      and grantee='anon' and privilege_type='EXECUTE'
  ) into v_submit_ges_anon_revoked;

  -- ═══ ÖNCEKİ REGRESSION (23) ═══

  -- KYC guard sağlam (execute_buy_now)
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='execute_buy_now' and p.prosrc like '%kyc_required%')
  into v_kyc_guard_buy_now_present;

  -- KYC guard sağlam (register_bid_deposit)
  select exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='register_bid_deposit' and p.prosrc like '%kyc_required%')
  into v_kyc_guard_deposit_present;

  -- Faz 1: bids_select_public DROP edildi mi
  select not exists (select 1 from pg_policies
    where schemaname='public' and tablename='bids' and policyname='bids_select_public')
  into v_bids_select_public_dropped;

  -- Faz 1: bids_select_bidder_or_listing_owner var mı
  select exists (select 1 from pg_policies
    where schemaname='public' and tablename='bids' and policyname='bids_select_bidder_or_listing_owner')
  into v_bids_select_bidder_or_owner_present;

  -- Faz 1: auction_bid_public_summary view var mı
  select exists (select 1 from information_schema.views
    where table_schema='public' and table_name='auction_bid_public_summary')
  into v_bid_public_summary_view_present;

  -- Faz 1: rate_limit_buckets RLS aktif mi
  select c.relrowsecurity from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
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

  -- schema_migrations satırı
  select exists (select 1 from supabase_migrations.schema_migrations where version='20260527130100')
  into v_schema_migrations_bundle_row;

  -- ═══ RAISE EXCEPTION (27 check) ═══
  -- Bundle self (4)
  if not v_place_bid_deposit_guard then raise exception 'BUNDLE FIX 1 FAIL: place_bid deposit guard prosrc YOK'; end if;
  if not v_calc_commission_auth_check then raise exception 'BUNDLE FIX 2 FAIL: calc_commission auth check prosrc YOK'; end if;
  if not v_submit_ges_auth_null_check then raise exception 'BUNDLE FIX 3 FAIL: submit_ges auth null check prosrc YOK'; end if;
  if not v_consume_ai_quota_org_check then raise exception 'BUNDLE FIX 4 FAIL: consume_ai_quota has_org_role check prosrc YOK'; end if;
  -- Grant sertleştirme (3)
  if not v_calc_commission_public_revoked then raise exception 'BUNDLE FIX 2 FAIL: calc_commission PUBLIC EXECUTE hâlâ var'; end if;
  if not v_consume_ai_quota_public_revoked then raise exception 'BUNDLE FIX 4 FAIL: consume_ai_quota PUBLIC EXECUTE hâlâ var'; end if;
  if not v_submit_ges_anon_revoked then raise exception 'BUNDLE FIX 3 FAIL: submit_ges anon EXECUTE hâlâ var'; end if;
  -- Önceki regression (20)
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
  if not v_corporate_leads_table then raise exception 'REGRESSION: Faz 2 corporate_leads kayıp'; end if;
  if not v_listing_matches_table then raise exception 'REGRESSION: Faz 2 listing_matches kayıp'; end if;
  if not v_watchlist_table then raise exception 'REGRESSION: Faz 2 watchlist kayıp'; end if;
  if not v_register_push_token_fn then raise exception 'REGRESSION: register_push_token RPC kayıp'; end if;
  if not v_submit_takas_fn then raise exception 'REGRESSION: submit_takas_application kayıp'; end if;
  if not v_submit_ges_fn then raise exception 'REGRESSION: submit_ges_land_evaluation kayıp'; end if;
  if not v_create_trade_offer_fn then raise exception 'REGRESSION: create_trade_offer kayıp'; end if;
  -- Migration satırı
  if not v_schema_migrations_bundle_row then raise exception 'REGRESSION: schema_migrations bundle satırı eksik'; end if;

  raise notice 'SECURITY BUNDLE smoke OK — 27/27 check geçti (4 yeni fix + 3 grant + 20 regression)';
end;
$regress$;

commit;

-- Son satır: tek SELECT — deploy başarı sinyali
select
  '20260527130100_security_bundle_5fix' as migration,
  'deployed' as status,
  (select prosrc like '%DEPOSIT GUARD%' from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='place_bid') as fix1_place_bid,
  (select prosrc like '%auth_required%' from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='calculate_commission_with_offset') as fix2_calc_commission,
  (select prosrc like '%authentication required%' from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='submit_ges_land_evaluation') as fix3_submit_ges,
  (select prosrc like '%has_org_role%' from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='consume_ai_quota') as fix4_consume_ai_quota,
  (select exists (select 1 from supabase_migrations.schema_migrations where version='20260527130100')) as schema_migrations_row,
  now() as deployed_at;
