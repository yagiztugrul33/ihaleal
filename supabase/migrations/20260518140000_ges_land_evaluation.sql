-- GES land evaluation: projects, technical analyses, legal compliance
do $$ begin
  create type public.ges_project_status as enum (
    'DATA_COLLECTION',
    'ENGINEERING_CALCULATION',
    'HIGH_VIABILITY',
    'TECHNICAL_REJECTION',
    'SUBMITTED_TO_INVESTORS'
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
    'SIT_OR_MILITARY',
    'ABSOLUTE_AGRICULTURE',
    'NO_CADASTRAL_ROAD'
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

create policy "Users read own ges projects"
  on public.ges_projects for select
  using (auth.uid() = user_id);

create policy "Users insert own ges projects"
  on public.ges_projects for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users update own ges projects"
  on public.ges_projects for update
  using (auth.uid() = user_id);

create policy "Users read technical via project"
  on public.ges_technical_analyses for select
  using (
    exists (
      select 1 from public.ges_projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "Users insert technical via project"
  on public.ges_technical_analyses for insert
  with check (
    exists (
      select 1 from public.ges_projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "Users read legal via project"
  on public.ges_legal_compliance for select
  using (
    exists (
      select 1 from public.ges_projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "Users insert legal via project"
  on public.ges_legal_compliance for insert
  with check (
    exists (
      select 1 from public.ges_projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

-- Server-side evaluation helpers (mirror client engine)
create or replace function public.ges_evaluate_hard_kill(payload jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
  v_kill text;
  v_reason text;
  v_class text := coalesce(payload->>'agriculturalClass', 'UNKNOWN');
  v_marginal boolean := coalesce((payload->>'isMarginalTarimApproved')::boolean, false);
begin
  if coalesce((payload->>'hasSitAreaConflict')::boolean, false)
     or coalesce((payload->>'hasMilitaryZoneConflict')::boolean, false)
     or coalesce((payload->>'hasArchaeologicalSite')::boolean, false) then
    return jsonb_build_object(
      'kill', 'SIT_OR_MILITARY',
      'reason', 'Mevzuat Engeli: SIT/askeri/arkeolojik alan — GES uygun degil.'
    );
  end if;

  if v_class = 'MUTLAK' or (v_class <> 'MARGINAL' and not v_marginal) then
    return jsonb_build_object(
      'kill', 'ABSOLUTE_AGRICULTURE',
      'reason', 'Mevzuat Engeli: Tarim sinifi veya marjinal onay eksik.'
    );
  end if;

  if not coalesce((payload->>'hasCadastralRoad')::boolean, false) then
    return jsonb_build_object(
      'kill', 'NO_CADASTRAL_ROAD',
      'reason', 'Kadastro yolu yok — lojistik engeli.'
    );
  end if;

  return jsonb_build_object('kill', null, 'reason', null);
end;
$$;

create or replace function public.ges_calculate_score(payload jsonb, capacity_mw numeric)
returns integer
language plpgsql
immutable
as $$
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
end;
$$;

create or replace function public.submit_ges_land_evaluation(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
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
  if v_area is null or v_area <= 0 then
    raise exception 'totalAreaM2 must be positive';
  end if;
  if v_irr is null or v_irr <= 0 then
    raise exception 'solarIrradianceKwh must be positive';
  end if;

  v_capacity := round((v_area / 15000.0)::numeric, 3);
  v_kill := public.ges_evaluate_hard_kill(payload);
  v_reason := v_kill->>'reason';
  if (v_kill->>'kill') is not null then
    v_kill_enum := (v_kill->>'kill')::public.ges_hard_kill_reason;
  end if;

  v_score := public.ges_calculate_score(payload, v_capacity);
  if v_kill_enum is not null then
    v_score := least(v_score, 25);
  end if;

  if v_kill_enum is not null then
    v_status := 'TECHNICAL_REJECTION';
  elsif v_score >= 75 then
    v_status := 'HIGH_VIABILITY';
  else
    v_status := 'ENGINEERING_CALCULATION';
  end if;

  v_cf := least(0.28, greatest(0.14, (v_irr / 2000.0) * 0.22));
  v_annual_mwh := round(v_capacity * v_cf * 8760, 1);
  v_capex := round(
    v_capacity * 13500000.0 * case when v_dist > 10 then 1.12 when v_dist > 5 then 1.06 else 1 end
  );
  if v_annual_mwh * 1000 * 2.6 > 0 then
    v_payback := round(v_capex / (v_annual_mwh * 1000 * 2.6), 1);
  end if;

  v_log := v_log || jsonb_build_array(
    format('[Muhendislik] Tahmini kurulu guc: %s MW', v_capacity)
  );

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
    coalesce(payload->>'city', ''),
    coalesce(payload->>'district', ''),
    payload->>'neighborhood',
    payload->>'ada',
    payload->>'parcel',
    v_area,
    v_dist,
    payload->>'trafoName',
    (payload->>'trafoCapacityMw')::numeric,
    v_irr,
    coalesce((payload->>'slopeDegree')::numeric, 0),
    coalesce(payload->>'slopeAspect', 'FLAT')::public.ges_slope_aspect,
    coalesce(payload->>'agriculturalClass', 'UNKNOWN')::public.ges_agricultural_class,
    coalesce((payload->>'isMarginalTarimApproved')::boolean, false),
    coalesce((payload->>'hasCadastralRoad')::boolean, false),
    coalesce((payload->>'hasSitAreaConflict')::boolean, false),
    coalesce((payload->>'hasMilitaryZoneConflict')::boolean, false),
    coalesce((payload->>'hasArchaeologicalSite')::boolean, false),
    payload->>'ownerName',
    payload->>'ownerEmail',
    payload->>'ownerPhone',
    v_status,
    v_score,
    v_score,
    v_capacity,
    v_annual_mwh,
    v_capex,
    v_payback,
    v_kill_enum,
    v_reason,
    v_log,
    v_notes,
    payload
  ) returning id into v_project_id;

  insert into public.ges_technical_analyses (
    project_id, estimated_capacity_mw, estimated_annual_mwh, estimated_capex_try,
    payback_years, technical_viability_score, engineering_log
  ) values (
    v_project_id, v_capacity, v_annual_mwh, v_capex, v_payback, v_score, v_log
  );

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
    v_kill_enum,
    v_reason,
    v_notes
  );

  return jsonb_build_object(
    'projectId', v_project_id,
    'status', v_status,
    'gesFeasibilityScore', v_score,
    'technicalViabilityScore', v_score,
    'estimatedCapacityMw', v_capacity,
    'estimatedAnnualMwh', v_annual_mwh,
    'estimatedCapexTry', v_capex,
    'paybackYears', v_payback,
    'hardKill', v_kill->>'kill',
    'rejectionReason', v_reason,
    'engineeringLog', v_log,
    'complianceNotes', v_notes
  );
end;
$$;

grant execute on function public.submit_ges_land_evaluation(jsonb) to authenticated, anon;
grant execute on function public.ges_evaluate_hard_kill(jsonb) to authenticated, anon;
grant execute on function public.ges_calculate_score(jsonb, numeric) to authenticated, anon;
