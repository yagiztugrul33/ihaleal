-- ════════════════════════════════════════════════════════════════════════════
-- FAZ 3b — GES + P2P TRADE + MODERATION HARDENING
-- Hedef: production wsjifesrdaeorrdzbvmk
-- Migrationlar (3):
--   (5) 20260518140000_ges_land_evaluation.sql              [ges_projects + RPC'ler]
--   (6) 20260518300000_trade_offers.sql                     [trade_offers + create/respond/cancel]
--   (7) 20260526162000_harden_events_moderation_rls_soft_delete.sql  [moderation_queue + events RLS hardening]
-- Risk: 🟡 ORTA
-- Süre: 5-10 dakika
-- Bağımlılık: Faz 2 (moderation_queue + events Faz 2'de yaratıldı; is_profile_admin zaten production'da var — teyit edildi)
-- ────────────────────────────────────────────────────────────────────────────
-- KIRILMA ANALİZİ:
--   - ges_land_evaluation: tamamen yeni (ges_projects ailesi); frontend henüz lib/engineering/ges/ üzerinden bağlanır
--   - trade_offers: yeni tablo; frontend kullanımı yok (henüz)
--   - harden_events_moderation_rls: moderation_queue ve events tablolarına RLS politikası ekler
--     ⚠ DİKKAT: events.user_id mevcut kolon — update edilirken NULL satırlar olabilir
--     ⚠ moderation_queue mevcut satır varsa created_by NULL olur; update set ile auth.uid()'e atanır (deploy anında auth.uid() service_role olabilir)
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ════════════ MIGRATION 5: ges_land_evaluation ════════════
do $$ begin
  create type public.ges_project_status as enum (
    'DATA_COLLECTION','ENGINEERING_CALCULATION','HIGH_VIABILITY','TECHNICAL_REJECTION','SUBMITTED_TO_INVESTORS'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ges_agricultural_class as enum ('MARGINAL', 'NORMAL', 'MUTLAK', 'UNKNOWN');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ges_slope_aspect as enum ('SOUTH', 'NORTH', 'EAST', 'WEST', 'FLAT', 'MIXED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ges_hard_kill_reason as enum (
    'SIT_OR_MILITARY','ABSOLUTE_AGRICULTURE','NO_CADASTRAL_ROAD'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.ges_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  city text not null,
  district text not null,
  neighborhood text,
  ada text,
  parcel text,
  total_area_m2 numeric not null check (total_area_m2 > 0),
  distance_to_trafo_km numeric not null check (distance_to_trafo_km >= 0),
  trafo_name text,
  trafo_capacity_mw numeric,
  solar_irradiance_kwh numeric not null check (solar_irradiance_kwh > 0),
  slope_degree numeric not null check (slope_degree >= 0),
  slope_aspect public.ges_slope_aspect not null,
  agricultural_class public.ges_agricultural_class not null default 'UNKNOWN',
  is_marginal_tarim_approved boolean not null default false,
  has_cadastral_road boolean not null default false,
  has_sit_area_conflict boolean not null default false,
  has_military_zone_conflict boolean not null default false,
  has_archaeological_site boolean not null default false,
  owner_name text,
  owner_email text,
  owner_phone text,
  status public.ges_project_status not null default 'DATA_COLLECTION',
  ges_feasibility_score integer,
  technical_viability_score integer,
  estimated_capacity_mw numeric,
  estimated_annual_mwh numeric,
  estimated_capex_try numeric,
  payback_years numeric,
  hard_kill public.ges_hard_kill_reason,
  rejection_reason text,
  engineering_log jsonb not null default '[]'::jsonb,
  compliance_notes jsonb not null default '[]'::jsonb,
  input_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ges_technical_analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.ges_projects (id) on delete cascade,
  estimated_capacity_mw numeric not null,
  estimated_annual_mwh numeric not null,
  estimated_capex_try numeric not null,
  payback_years numeric,
  technical_viability_score integer not null,
  engineering_log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ges_legal_compliance (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.ges_projects (id) on delete cascade,
  agricultural_class public.ges_agricultural_class not null,
  is_marginal_tarim_approved boolean not null default false,
  has_cadastral_road boolean not null,
  has_sit_area_conflict boolean not null default false,
  has_military_zone_conflict boolean not null default false,
  has_archaeological_site boolean not null default false,
  hard_kill public.ges_hard_kill_reason,
  rejection_reason text,
  compliance_notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ges_projects_user_id_idx on public.ges_projects (user_id);
create index if not exists ges_projects_status_created_idx on public.ges_projects (status, created_at desc);
create index if not exists ges_technical_analyses_project_id_idx on public.ges_technical_analyses (project_id);
create index if not exists ges_legal_compliance_project_id_idx on public.ges_legal_compliance (project_id);

alter table public.ges_projects enable row level security;
alter table public.ges_technical_analyses enable row level security;
alter table public.ges_legal_compliance enable row level security;

drop policy if exists "Users read own ges projects" on public.ges_projects;
create policy "Users read own ges projects" on public.ges_projects for select using (auth.uid() = user_id);
drop policy if exists "Users insert own ges projects" on public.ges_projects;
create policy "Users insert own ges projects" on public.ges_projects for insert with check (auth.uid() = user_id or user_id is null);
drop policy if exists "Users update own ges projects" on public.ges_projects;
create policy "Users update own ges projects" on public.ges_projects for update using (auth.uid() = user_id);
drop policy if exists "Users read technical via project" on public.ges_technical_analyses;
create policy "Users read technical via project" on public.ges_technical_analyses for select using (
  exists (select 1 from public.ges_projects p where p.id = project_id and p.user_id = auth.uid())
);
drop policy if exists "Users insert technical via project" on public.ges_technical_analyses;
create policy "Users insert technical via project" on public.ges_technical_analyses for insert with check (
  exists (select 1 from public.ges_projects p where p.id = project_id and p.user_id = auth.uid())
);
drop policy if exists "Users read legal via project" on public.ges_legal_compliance;
create policy "Users read legal via project" on public.ges_legal_compliance for select using (
  exists (select 1 from public.ges_projects p where p.id = project_id and p.user_id = auth.uid())
);
drop policy if exists "Users insert legal via project" on public.ges_legal_compliance;
create policy "Users insert legal via project" on public.ges_legal_compliance for insert with check (
  exists (select 1 from public.ges_projects p where p.id = project_id and p.user_id = auth.uid())
);

create or replace function public.ges_evaluate_hard_kill(payload jsonb)
returns jsonb language plpgsql immutable as $gehk$
declare
  v_class text := coalesce(payload->>'agriculturalClass', 'UNKNOWN');
  v_marginal boolean := coalesce((payload->>'isMarginalTarimApproved')::boolean, false);
begin
  if coalesce((payload->>'hasSitAreaConflict')::boolean, false)
     or coalesce((payload->>'hasMilitaryZoneConflict')::boolean, false)
     or coalesce((payload->>'hasArchaeologicalSite')::boolean, false) then
    return jsonb_build_object('kill', 'SIT_OR_MILITARY', 'reason', 'Mevzuat Engeli: SIT/askeri/arkeolojik alan.');
  end if;
  if v_class = 'MUTLAK' or (v_class <> 'MARGINAL' and not v_marginal) then
    return jsonb_build_object('kill', 'ABSOLUTE_AGRICULTURE', 'reason', 'Mevzuat Engeli: Tarim sinifi/marjinal onay eksik.');
  end if;
  if not coalesce((payload->>'hasCadastralRoad')::boolean, false) then
    return jsonb_build_object('kill', 'NO_CADASTRAL_ROAD', 'reason', 'Kadastro yolu yok.');
  end if;
  return jsonb_build_object('kill', null, 'reason', null);
end $gehk$;

create or replace function public.ges_calculate_score(payload jsonb, capacity_mw numeric)
returns integer language plpgsql immutable as $gcs$
declare
  v_score integer := 100;
  v_dist numeric := coalesce((payload->>'distanceToTrafoKm')::numeric, 0);
  v_aspect text := coalesce(payload->>'slopeAspect', 'FLAT');
  v_slope numeric := coalesce((payload->>'slopeDegree')::numeric, 0);
  v_trafo numeric := coalesce((payload->>'trafoCapacityMw')::numeric, capacity_mw);
  v_irr numeric := coalesce((payload->>'solarIrradianceKwh')::numeric, 1500);
  v_class text := coalesce(payload->>'agriculturalClass', 'UNKNOWN');
  v_marginal boolean := coalesce((payload->>'isMarginalTarimApproved')::boolean, false);
begin
  if v_dist > 10 then v_score := v_score - 25;
  elsif v_dist > 5 then v_score := v_score - 10; end if;
  if v_aspect = 'NORTH' and v_slope > 15 then v_score := v_score - 20;
  elsif v_aspect = 'NORTH' then v_score := v_score - 10;
  elsif v_slope > 25 then v_score := v_score - 15;
  elsif v_aspect = 'SOUTH' then v_score := v_score + 8; end if;
  if v_trafo < capacity_mw then v_score := v_score - 15; end if;
  if v_irr >= 1700 then v_score := v_score + 5; end if;
  if v_class = 'MARGINAL' and v_marginal then v_score := v_score + 5; end if;
  return greatest(0, least(100, v_score));
end $gcs$;

create or replace function public.submit_ges_land_evaluation(payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $sgle$
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
end $sgle$;

grant execute on function public.submit_ges_land_evaluation(jsonb) to authenticated, anon;
grant execute on function public.ges_evaluate_hard_kill(jsonb) to authenticated, anon;
grant execute on function public.ges_calculate_score(jsonb, numeric) to authenticated, anon;

-- ════════════ MIGRATION 6: trade_offers (BEGIN/COMMIT stripped) ════════════
do $$ begin
  create type public.trade_status as enum (
    'PENDING','ACCEPTED','REJECTED','CANCELLED','LEGAL_REVIEW','COMPLETED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.target_type as enum ('REAL_ESTATE', 'VEHICLE');
exception when duplicate_object then null; end $$;

create table if not exists public.trade_offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  proposer_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.target_type not null,
  offered_listing_id uuid references public.listings(id) on delete set null,
  offered_asset_details jsonb,
  cash_difference numeric(14, 2) not null default 0,
  currency text not null default 'TRY',
  status public.trade_status not null default 'PENDING',
  is_legal_approved boolean not null default false,
  is_deposit_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trade_offers_asset_xor check (
    offered_listing_id is not null or offered_asset_details is not null
  )
);

create index if not exists trade_offers_listing_idx on public.trade_offers (listing_id);
create index if not exists trade_offers_proposer_idx on public.trade_offers (proposer_id);
create index if not exists trade_offers_status_idx on public.trade_offers (status);

create or replace function public.trade_offers_set_updated_at()
returns trigger language plpgsql as $tosua$
begin new.updated_at := now(); return new; end $tosua$;

drop trigger if exists trade_offers_updated_at on public.trade_offers;
create trigger trade_offers_updated_at before update on public.trade_offers
  for each row execute function public.trade_offers_set_updated_at();

alter table public.trade_offers enable row level security;

drop policy if exists trade_offers_select_party on public.trade_offers;
create policy trade_offers_select_party on public.trade_offers for select using (
  proposer_id = auth.uid()
  or exists (select 1 from public.listings l where l.id = trade_offers.listing_id and l.seller_id = auth.uid())
);

create or replace function public.create_trade_offer(payload jsonb)
returns public.trade_offers language plpgsql security definer set search_path = public as $cto$
declare
  v_user uuid := auth.uid();
  v_listing public.listings%rowtype;
  v_offered public.listings%rowtype;
  v_row public.trade_offers%rowtype;
  v_listing_id uuid := (payload->>'listingId')::uuid;
  v_offered_listing_id uuid := nullif(payload->>'offeredListingId', '')::uuid;
  v_target public.target_type := (payload->>'targetType')::public.target_type;
  v_cash numeric := coalesce((payload->>'cashDifference')::numeric, 0);
begin
  if v_user is null then raise exception 'authentication required'; end if;
  select * into v_listing from public.listings where id = v_listing_id;
  if not found or v_listing.status <> 'active' then raise exception 'Hedef ilan aktif değil.'; end if;
  if v_listing.seller_id = v_user then raise exception 'Kendi ilanınıza takas teklifi gönderemezsiniz.'; end if;
  if v_offered_listing_id is not null then
    select * into v_offered from public.listings where id = v_offered_listing_id;
    if not found or v_offered.status <> 'active' then raise exception 'Teklif edilen ilan aktif değil.'; end if;
    if v_offered.seller_id <> v_user then raise exception 'Teklif edilen ilan size ait olmalıdır.'; end if;
  elsif payload->'offeredAssetDetails' is null then
    raise exception 'offeredListingId veya offeredAssetDetails zorunludur.';
  end if;
  if coalesce((payload->>'skipLegalCheck')::boolean, false) is false then
    if coalesce((payload->'legalFlags'->>'concordat')::boolean, false)
      or coalesce((payload->'legalFlags'->>'lien')::boolean, false)
      or coalesce((payload->'legalFlags'->>'inheritance')::boolean, false) then
      raise exception 'Hukuki risk (haciz, şerh, konkordato) tespit edildi.';
    end if;
  end if;
  insert into public.trade_offers (
    listing_id, proposer_id, target_type, offered_listing_id, offered_asset_details,
    cash_difference, currency, status
  ) values (
    v_listing_id, v_user, v_target, v_offered_listing_id, payload->'offeredAssetDetails',
    v_cash, coalesce(payload->>'currency', 'TRY'), 'PENDING'
  ) returning * into v_row;
  return v_row;
end $cto$;

create or replace function public.respond_trade_offer(p_offer_id uuid, p_accept boolean)
returns public.trade_offers language plpgsql security definer set search_path = public as $rto$
declare
  v_user uuid := auth.uid();
  v_offer public.trade_offers%rowtype;
  v_listing public.listings%rowtype;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  select * into v_offer from public.trade_offers where id = p_offer_id for update;
  if not found then raise exception 'Takas teklifi bulunamadı.'; end if;
  select * into v_listing from public.listings where id = v_offer.listing_id;
  if v_listing.seller_id <> v_user then raise exception 'Bu işlem için yetkiniz yok.'; end if;
  if v_offer.status <> 'PENDING' then raise exception 'Bu teklif zaten sonuçlandırılmış.'; end if;
  update public.trade_offers
  set status = case when p_accept then 'ACCEPTED'::public.trade_status else 'REJECTED'::public.trade_status end
  where id = p_offer_id returning * into v_offer;
  return v_offer;
end $rto$;

create or replace function public.cancel_trade_offer(p_offer_id uuid)
returns public.trade_offers language plpgsql security definer set search_path = public as $cto2$
declare
  v_user uuid := auth.uid();
  v_offer public.trade_offers%rowtype;
begin
  if v_user is null then raise exception 'authentication required'; end if;
  select * into v_offer from public.trade_offers where id = p_offer_id for update;
  if not found then raise exception 'Takas teklifi bulunamadı.'; end if;
  if v_offer.proposer_id <> v_user then raise exception 'Bu işlem için yetkiniz yok.'; end if;
  if v_offer.status <> 'PENDING' then raise exception 'Yalnızca bekleyen teklifler iptal edilebilir.'; end if;
  update public.trade_offers set status = 'CANCELLED' where id = p_offer_id returning * into v_offer;
  return v_offer;
end $cto2$;

revoke all on function public.create_trade_offer(jsonb) from public;
grant execute on function public.create_trade_offer(jsonb) to authenticated;
revoke all on function public.respond_trade_offer(uuid, boolean) from public;
grant execute on function public.respond_trade_offer(uuid, boolean) to authenticated;
revoke all on function public.cancel_trade_offer(uuid) from public;
grant execute on function public.cancel_trade_offer(uuid) to authenticated;

-- ════════════ MIGRATION 7: harden_events_moderation_rls_soft_delete (BEGIN/COMMIT stripped) ════════════
-- moderation_queue: user-owned moderation records + soft delete
alter table public.moderation_queue
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users(id);

-- NOT: update set ... where created_by is null çalıştığında auth.uid()
-- service_role/admin context'inde NULL döner — yeni satırlar default ile dolacak.
update public.moderation_queue set created_by = coalesce(created_by, auth.uid()) where created_by is null;

alter table public.moderation_queue alter column created_by set default auth.uid();
alter table public.moderation_queue enable row level security;

drop policy if exists "mq_select_own_or_admin" on public.moderation_queue;
create policy "mq_select_own_or_admin" on public.moderation_queue for select using (
  deleted_at is null and (created_by = auth.uid() or is_profile_admin(auth.uid()))
);

drop policy if exists "mq_insert_own" on public.moderation_queue;
create policy "mq_insert_own" on public.moderation_queue for insert with check (
  auth.uid() is not null and created_by = auth.uid()
);

drop policy if exists "mq_update_own_or_admin" on public.moderation_queue;
create policy "mq_update_own_or_admin" on public.moderation_queue for update
  using (created_by = auth.uid() or is_profile_admin(auth.uid()))
  with check (created_by = auth.uid() or is_profile_admin(auth.uid()));

create or replace function public.soft_delete_moderation_queue()
returns trigger language plpgsql security definer set search_path = public as $sdmq$
begin
  update public.moderation_queue
  set deleted_at = now(), deleted_by = auth.uid(),
      status = case when status = 'deleted' then status else 'deleted' end
  where id = old.id and deleted_at is null;
  perform public.write_audit_v2('soft_delete', 'moderation_queue', old.id::text,
    jsonb_build_object('reason', old.reason, 'status', old.status));
  return null;
end $sdmq$;

drop trigger if exists trg_soft_delete_moderation_queue on public.moderation_queue;
create trigger trg_soft_delete_moderation_queue before delete on public.moderation_queue
  for each row execute function public.soft_delete_moderation_queue();

drop policy if exists "mq_delete_soft_own_or_admin" on public.moderation_queue;
create policy "mq_delete_soft_own_or_admin" on public.moderation_queue for delete using (
  created_by = auth.uid() or is_profile_admin(auth.uid())
);

-- events: user-owned activity feed + soft delete
alter table public.events
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users(id);

update public.events set created_by = coalesce(created_by, user_id, auth.uid()) where created_by is null;

alter table public.events alter column created_by set default auth.uid();
alter table public.events enable row level security;

drop policy if exists "ev_select_own_or_admin" on public.events;
create policy "ev_select_own_or_admin" on public.events for select using (
  deleted_at is null and (user_id = auth.uid() or created_by = auth.uid() or is_profile_admin(auth.uid()))
);

drop policy if exists "ev_insert_own" on public.events;
create policy "ev_insert_own" on public.events for insert with check (
  auth.uid() is not null and (user_id = auth.uid() or user_id is null) and created_by = auth.uid()
);

drop policy if exists "ev_update_own_or_admin" on public.events;
create policy "ev_update_own_or_admin" on public.events for update
  using (user_id = auth.uid() or created_by = auth.uid() or is_profile_admin(auth.uid()))
  with check (user_id = auth.uid() or created_by = auth.uid() or is_profile_admin(auth.uid()));

create or replace function public.soft_delete_events()
returns trigger language plpgsql security definer set search_path = public as $sde$
begin
  update public.events set deleted_at = now(), deleted_by = auth.uid()
  where id = old.id and deleted_at is null;
  perform public.write_audit_v2('soft_delete', 'events', old.id::text,
    jsonb_build_object('kind', old.kind, 'entity_type', old.entity_type));
  return null;
end $sde$;

drop trigger if exists trg_soft_delete_events on public.events;
create trigger trg_soft_delete_events before delete on public.events
  for each row execute function public.soft_delete_events();

drop policy if exists "ev_delete_soft_own_or_admin" on public.events;
create policy "ev_delete_soft_own_or_admin" on public.events for delete using (
  user_id = auth.uid() or created_by = auth.uid() or is_profile_admin(auth.uid())
);

-- ════════════ schema_migrations TRACKING (3 satır) ════════════
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES
  ('20260518140000', 'ges_land_evaluation',
   ARRAY['-- Deployed via CLI on 2026-05-27. GES projects + technical + legal compliance.']::text[]),
  ('20260518300000', 'trade_offers',
   ARRAY['-- Deployed via CLI on 2026-05-27. P2P trade offers + create/respond/cancel RPCs.']::text[]),
  ('20260526162000', 'harden_events_moderation_rls_soft_delete',
   ARRAY['-- Deployed via CLI on 2026-05-27. moderation_queue + events RLS hardening + soft delete triggers.']::text[])
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- SMOKE
-- ════════════════════════════════════════════════════════════════════════════

-- (S1) GES tabloları
SELECT 'S1 GES tables' AS check, string_agg(table_name, ',' ORDER BY table_name) AS present
FROM information_schema.tables WHERE table_schema='public'
  AND table_name IN ('ges_projects','ges_technical_analyses','ges_legal_compliance');

-- (S2) GES RPC'ler
SELECT 'S2 GES functions' AS check, string_agg(proname, ',' ORDER BY proname) AS present
FROM pg_proc WHERE pronamespace='public'::regnamespace
  AND proname IN ('submit_ges_land_evaluation','ges_evaluate_hard_kill','ges_calculate_score');

-- (S3) trade_offers
SELECT 'S3 trade_offers' AS check,
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='trade_offers') AS table_exists,
       EXISTS(SELECT 1 FROM pg_type WHERE typname='trade_status' AND typnamespace='public'::regnamespace) AS enum_exists,
       (SELECT count(*) FROM pg_proc WHERE proname IN ('create_trade_offer','respond_trade_offer','cancel_trade_offer')
        AND pronamespace='public'::regnamespace) AS rpc_count;

-- (S4) moderation_queue ek kolonlar + RLS
SELECT 'S4 moderation_queue extensions' AS check,
       (SELECT bool_and(c.column_name = ANY(ARRAY['created_by','deleted_at','deleted_by']))
        FROM information_schema.columns c WHERE c.table_schema='public' AND c.table_name='moderation_queue'
          AND c.column_name IN ('created_by','deleted_at','deleted_by')) AS columns_added,
       (SELECT relrowsecurity FROM pg_class WHERE relname='moderation_queue' AND relnamespace='public'::regnamespace) AS rls_on,
       (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='moderation_queue') AS policy_count;

-- (S5) events ek kolonlar + RLS
SELECT 'S5 events extensions' AS check,
       (SELECT bool_and(c.column_name = ANY(ARRAY['created_by','deleted_at','deleted_by']))
        FROM information_schema.columns c WHERE c.table_schema='public' AND c.table_name='events'
          AND c.column_name IN ('created_by','deleted_at','deleted_by')) AS columns_added,
       (SELECT relrowsecurity FROM pg_class WHERE relname='events' AND relnamespace='public'::regnamespace) AS rls_on,
       (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='events') AS policy_count;

-- (S6) Soft delete trigger'ları
SELECT 'S6 soft delete triggers' AS check, string_agg(tgname, ',' ORDER BY tgname) AS present
FROM pg_trigger WHERE tgname IN ('trg_soft_delete_moderation_queue','trg_soft_delete_events');

-- (S7) schema_migrations yeni satırlar
SELECT 'S7 new tracking' AS check, string_agg(version || ':' || name, ', ' ORDER BY version) AS new_versions
FROM supabase_migrations.schema_migrations
WHERE version IN ('20260518140000','20260518300000','20260526162000');

-- (S8) REGRESSION
DO $$ DECLARE v_result json; BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-aaaa-bbbb-cccc-000000000004', true);
  SELECT public.execute_buy_now(gen_random_uuid(), gen_random_uuid(), 'smoke-phase3b') INTO v_result;
  IF v_result->>'code' = 'kyc_required' THEN RAISE NOTICE 'S8 REGRESSION OK';
  ELSE RAISE EXCEPTION 'S8 REGRESSION FAIL — got %', v_result; END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════════
-- REVERSE (acil — yorumda)
-- ════════════════════════════════════════════════════════════════════════════
/*
BEGIN;
-- M7 reverse: events + moderation_queue extensions
drop policy if exists "ev_delete_soft_own_or_admin" on public.events;
drop trigger if exists trg_soft_delete_events on public.events;
drop function if exists public.soft_delete_events();
drop policy if exists "ev_update_own_or_admin" on public.events;
drop policy if exists "ev_insert_own" on public.events;
drop policy if exists "ev_select_own_or_admin" on public.events;
alter table public.events disable row level security;
alter table public.events alter column created_by drop default;
alter table public.events drop column if exists deleted_by, drop column if exists deleted_at, drop column if exists created_by;

drop policy if exists "mq_delete_soft_own_or_admin" on public.moderation_queue;
drop trigger if exists trg_soft_delete_moderation_queue on public.moderation_queue;
drop function if exists public.soft_delete_moderation_queue();
drop policy if exists "mq_update_own_or_admin" on public.moderation_queue;
drop policy if exists "mq_insert_own" on public.moderation_queue;
drop policy if exists "mq_select_own_or_admin" on public.moderation_queue;
alter table public.moderation_queue disable row level security;
alter table public.moderation_queue alter column created_by drop default;
alter table public.moderation_queue drop column if exists deleted_by, drop column if exists deleted_at, drop column if exists created_by;

-- M6 reverse: trade_offers
drop function if exists public.cancel_trade_offer(uuid);
drop function if exists public.respond_trade_offer(uuid, boolean);
drop function if exists public.create_trade_offer(jsonb);
drop trigger if exists trade_offers_updated_at on public.trade_offers;
drop function if exists public.trade_offers_set_updated_at();
drop table if exists public.trade_offers;
drop type if exists public.target_type;
drop type if exists public.trade_status;

-- M5 reverse: ges_land_evaluation
drop function if exists public.submit_ges_land_evaluation(jsonb);
drop function if exists public.ges_calculate_score(jsonb, numeric);
drop function if exists public.ges_evaluate_hard_kill(jsonb);
drop table if exists public.ges_legal_compliance;
drop table if exists public.ges_technical_analyses;
drop table if exists public.ges_projects;
drop type if exists public.ges_hard_kill_reason;
drop type if exists public.ges_slope_aspect;
drop type if exists public.ges_agricultural_class;
drop type if exists public.ges_project_status;

DELETE FROM supabase_migrations.schema_migrations
WHERE version IN ('20260518140000','20260518300000','20260526162000');
COMMIT;
*/
