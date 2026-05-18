-- iBuyer & Trade-In module
create type public.instant_offer_status as enum (
  'PENDING',
  'LEGAL_REVIEW',
  'OFFER_GENERATED',
  'REJECTED',
  'EXPIRED',
  'ACCEPTED'
);

create type public.ibuyer_target_option as enum (
  'CASH_ONLY',
  'TRADE_IN',
  'BOTH'
);

create table if not exists public.property_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  city text not null,
  district text,
  address text,
  parcel_no text,
  gross_m2 numeric not null check (gross_m2 > 0),
  market_value_try numeric not null check (market_value_try > 0),
  property_type text not null default 'konut',
  contact_phone text,
  contact_email text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.property_risk_assessments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.property_submissions (id) on delete cascade,
  risk_flags jsonb not null default '{}',
  risk_score integer not null default 0 check (risk_score >= 0),
  risk_breakdown jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists public.instant_offer_requests (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.property_submissions (id) on delete cascade,
  risk_assessment_id uuid not null references public.property_risk_assessments (id) on delete cascade,
  status public.instant_offer_status not null default 'PENDING',
  offer_amount_try numeric,
  market_value_try numeric not null,
  risk_score integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.trade_in_details (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.property_submissions (id) on delete cascade,
  target_option public.ibuyer_target_option not null default 'CASH_ONLY',
  desired_city text,
  desired_district text,
  desired_budget_try numeric,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists property_submissions_user_id_idx
  on public.property_submissions (user_id);

create index if not exists instant_offer_requests_submission_idx
  on public.instant_offer_requests (submission_id, created_at desc);

alter table public.property_submissions enable row level security;
alter table public.property_risk_assessments enable row level security;
alter table public.instant_offer_requests enable row level security;
alter table public.trade_in_details enable row level security;

create policy "property_submissions_select_own"
  on public.property_submissions for select
  using (auth.uid() = user_id);

create policy "property_submissions_insert_own"
  on public.property_submissions for insert
  with check (auth.uid() = user_id);

create policy "property_risk_assessments_select_own"
  on public.property_risk_assessments for select
  using (
    exists (
      select 1 from public.property_submissions ps
      where ps.id = submission_id and ps.user_id = auth.uid()
    )
  );

create policy "property_risk_assessments_insert_own"
  on public.property_risk_assessments for insert
  with check (
    exists (
      select 1 from public.property_submissions ps
      where ps.id = submission_id and ps.user_id = auth.uid()
    )
  );

create policy "instant_offer_requests_select_own"
  on public.instant_offer_requests for select
  using (
    exists (
      select 1 from public.property_submissions ps
      where ps.id = submission_id and ps.user_id = auth.uid()
    )
  );

create policy "instant_offer_requests_insert_own"
  on public.instant_offer_requests for insert
  with check (
    exists (
      select 1 from public.property_submissions ps
      where ps.id = submission_id and ps.user_id = auth.uid()
    )
  );

create policy "trade_in_details_select_own"
  on public.trade_in_details for select
  using (
    exists (
      select 1 from public.property_submissions ps
      where ps.id = submission_id and ps.user_id = auth.uid()
    )
  );

create policy "trade_in_details_insert_own"
  on public.trade_in_details for insert
  with check (
    exists (
      select 1 from public.property_submissions ps
      where ps.id = submission_id and ps.user_id = auth.uid()
    )
  );

create or replace function public.ibuyer_calculate_risk_score(flags jsonb)
returns integer
language plpgsql
immutable
as $$
declare
  score integer := 0;
begin
  if coalesce((flags->>'inheritance')::boolean, false) then score := score + 40; end if;
  if coalesce((flags->>'concordat')::boolean, false) then score := score + 35; end if;
  if coalesce((flags->>'lien')::boolean, false) then score := score + 25; end if;
  if coalesce((flags->>'urban')::boolean, false) then score := score + 15; end if;
  if coalesce((flags->>'arsaPayi')::boolean, false) then score := score + 20; end if;
  if coalesce((flags->>'familySherh')::boolean, false) then score := score + 15; end if;
  if coalesce((flags->>'veraset')::boolean, false) then score := score + 30; end if;
  if coalesce((flags->>'imar')::boolean, false) then score := score + 20; end if;
  if coalesce((flags->>'katMismatch')::boolean, false) then score := score + 15; end if;
  return score;
end;
$$;

create or replace function public.ibuyer_determine_status(
  flags jsonb,
  risk_score integer
)
returns public.instant_offer_status
language plpgsql
immutable
as $$
declare
  has_inheritance boolean := coalesce((flags->>'inheritance')::boolean, false);
  has_concordat boolean := coalesce((flags->>'concordat')::boolean, false);
begin
  if has_inheritance and has_concordat then
    return 'REJECTED'::public.instant_offer_status;
  end if;
  if has_inheritance or has_concordat then
    return 'LEGAL_REVIEW'::public.instant_offer_status;
  end if;
  if risk_score >= 70 then
    return 'REJECTED'::public.instant_offer_status;
  end if;
  if risk_score >= 30 then
    return 'LEGAL_REVIEW'::public.instant_offer_status;
  end if;
  return 'OFFER_GENERATED'::public.instant_offer_status;
end;
$$;

create or replace function public.ibuyer_calculate_offer(market_value numeric, risk_score integer)
returns numeric
language sql
immutable
as $$
  select round(
    market_value * 0.82 - market_value * (risk_score::numeric / 100.0) * 0.15,
    2
  );
$$;

create or replace function public.submit_ibuyer_application(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_submission_id uuid;
  v_assessment_id uuid;
  v_offer_id uuid;
  v_trade_id uuid;
  v_flags jsonb := coalesce(payload->'legalFlags', '{}'::jsonb);
  v_risk_score integer;
  v_status public.instant_offer_status;
  v_market numeric := (payload->>'marketValueTry')::numeric;
  v_offer_amount numeric;
  v_breakdown jsonb := '[]'::jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;
  if v_market is null or v_market <= 0 then
    raise exception 'marketValueTry must be positive';
  end if;

  v_risk_score := public.ibuyer_calculate_risk_score(v_flags);
  v_status := public.ibuyer_determine_status(v_flags, v_risk_score);

  v_breakdown := jsonb_build_array(
    jsonb_build_object('key', 'inheritance', 'points', case when coalesce((v_flags->>'inheritance')::boolean, false) then 40 else 0 end),
    jsonb_build_object('key', 'concordat', 'points', case when coalesce((v_flags->>'concordat')::boolean, false) then 35 else 0 end),
    jsonb_build_object('key', 'lien', 'points', case when coalesce((v_flags->>'lien')::boolean, false) then 25 else 0 end),
    jsonb_build_object('key', 'urban', 'points', case when coalesce((v_flags->>'urban')::boolean, false) then 15 else 0 end),
    jsonb_build_object('key', 'arsaPayi', 'points', case when coalesce((v_flags->>'arsaPayi')::boolean, false) then 20 else 0 end),
    jsonb_build_object('key', 'familySherh', 'points', case when coalesce((v_flags->>'familySherh')::boolean, false) then 15 else 0 end),
    jsonb_build_object('key', 'veraset', 'points', case when coalesce((v_flags->>'veraset')::boolean, false) then 30 else 0 end),
    jsonb_build_object('key', 'imar', 'points', case when coalesce((v_flags->>'imar')::boolean, false) then 20 else 0 end),
    jsonb_build_object('key', 'katMismatch', 'points', case when coalesce((v_flags->>'katMismatch')::boolean, false) then 15 else 0 end)
  );

  insert into public.property_submissions (
    user_id, city, district, address, parcel_no, gross_m2, market_value_try,
    property_type, contact_phone, contact_email, metadata
  ) values (
    v_user_id,
    coalesce(payload->>'city', ''),
    payload->>'district',
    payload->>'address',
    payload->>'parcelNo',
    (payload->>'grossM2')::numeric,
    v_market,
    coalesce(payload->>'propertyType', 'konut'),
    payload->>'contactPhone',
    payload->>'contactEmail',
    coalesce(payload->'metadata', '{}'::jsonb)
  )
  returning id into v_submission_id;

  insert into public.property_risk_assessments (submission_id, risk_flags, risk_score, risk_breakdown)
  values (v_submission_id, v_flags, v_risk_score, v_breakdown)
  returning id into v_assessment_id;

  if v_status = 'OFFER_GENERATED' then
    v_offer_amount := public.ibuyer_calculate_offer(v_market, v_risk_score);
  else
    v_offer_amount := null;
  end if;

  insert into public.instant_offer_requests (
    submission_id, risk_assessment_id, status, offer_amount_try,
    market_value_try, risk_score, expires_at
  ) values (
    v_submission_id,
    v_assessment_id,
    v_status,
    v_offer_amount,
    v_market,
    v_risk_score,
    case when v_status = 'OFFER_GENERATED' then now() + interval '72 hours' else null end
  )
  returning id into v_offer_id;

  if coalesce(payload->>'targetOption', '') <> '' then
    insert into public.trade_in_details (
      submission_id, target_option, desired_city, desired_district, desired_budget_try, notes
    ) values (
      v_submission_id,
      (payload->>'targetOption')::public.ibuyer_target_option,
      payload->>'desiredCity',
      payload->>'desiredDistrict',
      nullif(payload->>'desiredBudgetTry', '')::numeric,
      payload->>'tradeInNotes'
    )
    returning id into v_trade_id;
  end if;

  return jsonb_build_object(
    'submissionId', v_submission_id,
    'riskAssessmentId', v_assessment_id,
    'offerRequestId', v_offer_id,
    'tradeInId', v_trade_id,
    'status', v_status::text,
    'riskScore', v_risk_score,
    'offerAmountTry', v_offer_amount,
    'marketValueTry', v_market,
    'expiresAt', case when v_status = 'OFFER_GENERATED' then (now() + interval '72 hours') else null end,
    'riskBreakdown', v_breakdown
  );
end;
$$;

revoke all on function public.submit_ibuyer_application(jsonb) from public;
grant execute on function public.submit_ibuyer_application(jsonb) to authenticated;
