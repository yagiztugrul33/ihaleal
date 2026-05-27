-- ═══════════════════════════════════════════════════════════════════════════
-- SECURITY BUNDLE — 4 SERVER-SIDE FIX (atomik tek migration)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- AMAÇ:
--   Sistem röntgeni (2026-05-27, _audit/SISTEM_ROENTGENI.md) sırasında
--   keşfedilen 4 sunucu-tarafı güvenlik açığını tek bundle olarak kapatır.
--   Hepsi KYC guard pattern'iyle (20260527120000_buy_now_kyc_guard.sql)
--   tutarlı: CREATE OR REPLACE FUNCTION + minimal davranış değişikliği.
--
-- FIX'LER:
--   1) place_bid       — deposit guard (F1.2). bid_deposits.status='authorized'
--                        + context='bid' zorunlu. İstemci-tarafı bidDisabled
--                        bypass'ını sunucuda kapatır.
--   2) calculate_commission_with_offset — auth check + REVOKE PUBLIC (F1.9).
--                        Anon kullanıcının commission_records'a sahte kayıt
--                        insert etmesini engeller.
--   3) submit_ges_land_evaluation — auth.uid() null check (F1.10).
--                        submit_ibuyer/takas pattern'iyle aynı: anon kullanıcı
--                        ges_projects.user_id=null insert edemez.
--   4) consume_ai_quota — has_org_role check + REVOKE PUBLIC (F1.11).
--                        Anon herhangi bir org'un AI kotasını tüketemez.
--
-- BUNDLE DIŞI (ayrı commit'te):
--   - F1.8 `/kyc` route App.tsx ekleme — web kod, SQL değil. Ayrı commit.
--   - F1.12 komisyon trigger gap (RB14/AB11) — ürün kararı bekliyor (yaklaşım
--           A/B/C). Bu bundle'a girmiyor.
--   - F1.4 corporate_leads + organizations RLS sertleştirme — ayrı tur.
--   - F1.5 bid_bonds insert/update policy drop — ayrı tur (orphan tablo).
--
-- ÖN-KONTROL KANITI (2026-05-27, _audit/tmp_bundle_precheck.json):
--   - 4 açığın hiçbiri henüz fix edilmemiş (4× false)
--   - schema_migrations'da 20260527130100 YOK (deploy edilmedi)
--   - has_org_role(p_org uuid, p_roles text[]) mevcut ✓
--   - commission_records kolonları + organizations.ai_* + bid_deposits.context
--     ('bid','buy_now') doğrulandı
--   - ges_projects.user_id NULLABLE (F1.10 sömürü gerçek — orphan satır riski)
--   - GRANT'ler: calc_commission PUBLIC EXECUTE, consume_ai_quota PUBLIC
--     EXECUTE, submit_ges anon EXPLICIT — hepsi revoke edilecek
--
-- ROLLBACK:
--   PostgreSQL CREATE OR REPLACE FUNCTION kalıcı yer-değiştirmedir. Geri almak
--   için: önceki gövdeleri ayrı reverse-migration dosyalarına yapıştır + deploy.
--   GRANT geri alma: 3 REVOKE'un tersi (grant). Tam reverse SQL deploy
--   dosyasında (_audit/migration_deploy/extra_security_bundle_5fix.sql) yorum
--   içinde hazır.
--
-- DEPLOY:
--   _audit/migration_deploy/extra_security_bundle_5fix.sql üzerinden
--   atomik BEGIN/COMMIT + 27-check regression smoke (23 önceki + 4 yeni
--   self-check).
-- ═══════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────────
-- FIX 1/4: place_bid — DEPOSIT GUARD (F1.2)
-- Konum: auth check sonrası, idempotency check öncesi.
-- Kaynak: 20260430150000_profiles_role_place_bid_antisniping.sql:12-79
--         + DEPOSIT GUARD bloğu (bid_deposits.status='authorized' + context='bid')
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

  -- ═══ DEPOSIT GUARD (sert; istemci atlatılamaz) ═══
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
-- FIX 2/4: calculate_commission_with_offset — AUTH CHECK (F1.9)
-- Davranış:
--   - auth.uid() null → {status:'error', code:'auth_required'}
--   - Çağıran admin değilse VE auction taraflarından (seller/buyer/agent)
--     değilse → {status:'error', code:'forbidden'}
--   - Diğer davranış orijinaliyle aynı.
-- GRANT: PUBLIC EXECUTE → REVOKE; authenticated EXECUTE.
-- Kaynak gövde: önceki prosrc (_audit/tmp_rpc_bodies_parsed.txt:6-120)
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
  -- ═══ AUTH CHECK (sert; anon engellenir) ═══
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

  -- ═══ AUTHORIZATION (admin veya işlem tarafı) ═══
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
-- FIX 3/4: submit_ges_land_evaluation — AUTH NULL CHECK (F1.10)
-- Davranış:
--   - auth.uid() null → raise exception 'authentication required'
--     (submit_ibuyer/takas pattern'iyle aynı)
-- GRANT: anon EXECUTE → REVOKE (bonus sertleştirme).
-- Kaynak gövde: önceki prosrc (_audit/tmp_rpc_bodies_parsed.txt:235-341)
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
  -- ═══ AUTH CHECK (submit_ibuyer/takas paterniyle aynı) ═══
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
-- FIX 4/4: consume_ai_quota — has_org_role CHECK + REVOKE PUBLIC (F1.11)
-- Davranış:
--   - p_org null → true döner (no-op; çağıran org-bağımsız akış)
--   - has_org_role(p_org, ['owner','admin','manager','agent']) false →
--     raise exception 'forbidden'
--   - Diğer davranış orijinaliyle aynı.
-- GRANT: PUBLIC EXECUTE → REVOKE; authenticated EXECUTE.
-- Kaynak gövde: önceki prosrc (_audit/tmp_rpc_bodies_parsed.txt:128-142)
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

  -- ═══ ORG-MEMBERSHIP CHECK (anon ve yabancı bypass'ı engeller) ═══
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
