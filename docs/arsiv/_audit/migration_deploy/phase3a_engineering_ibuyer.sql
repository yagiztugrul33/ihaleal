-- ════════════════════════════════════════════════════════════════════════════
-- FAZ 3a — ENGINEERING ALTYAPISI + iBUYER/TAKAS AİLESİ
-- Hedef: production wsjifesrdaeorrdzbvmk
-- Migrationlar (4):
--   (1) 20260517140000_land_ges_intelligence.sql      [engineering_analysis_runs]
--   (2) 20260517150000_engineering_war_room.sql       [analysis_type extension + label/lat/lon kolonlar]
--   (3) 20260518120000_ibuyer_trade_in.sql            [property_submissions + risk + offer + trade_in + RPC]
--   (4) 20260518200000_takas_enhancements.sql         [trade_in_details kolon ek + submit_ibuyer rewrite + submit_takas]
-- Risk: 🟡 ORTA
-- Süre: 5-10 dakika
-- Bağımlılık: Faz 2 tamamlanmış olmalı (organizations tablosu kullanılmıyor ama dolaylı bağımlı değil)
-- ────────────────────────────────────────────────────────────────────────────
-- KIRILMA ANALİZİ:
--   - (1) yeni tablo + RLS — bağımsız, kırılma yok
--   - (2) (1)'in kolonlarını + analysis_type enum değerlerini genişletir; eski analysis_type değerleri korunur
--     check constraint replaced — DROP CONSTRAINT IF EXISTS + new check (idempotent)
--     "10 lib dosyası" (WarRoomPage + GES/seismic/geotech/disaster/urban engines) bu adımdan sonra ÇALIŞIR
--   - (3) iBuyer ailesi — submitInstantOffer.ts artık çalışır
--   - (4) submit_ibuyer_application'ı yeniden tanımlar (M3 versiyonunu üzerine yazar — son yazan kazanır)
--     submit_takas_application yeni RPC ekler
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ════════════ MIGRATION 1: land_ges_intelligence ════════════
create table if not exists public.engineering_analysis_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  analysis_type text not null check (analysis_type in ('ges', 'parcel', 'zoning')),
  input_json jsonb not null default '{}',
  result_json jsonb not null default '{}',
  confidence text,
  created_at timestamptz not null default now()
);

create index if not exists engineering_analysis_runs_user_id_idx
  on public.engineering_analysis_runs (user_id);

create index if not exists engineering_analysis_runs_type_created_idx
  on public.engineering_analysis_runs (analysis_type, created_at desc);

alter table public.engineering_analysis_runs enable row level security;

drop policy if exists "Users read own engineering runs" on public.engineering_analysis_runs;
create policy "Users read own engineering runs"
  on public.engineering_analysis_runs
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own engineering runs" on public.engineering_analysis_runs;
create policy "Users insert own engineering runs"
  on public.engineering_analysis_runs
  for insert
  with check (auth.uid() = user_id);

-- ════════════ MIGRATION 2: engineering_war_room (extend M1) ════════════
alter table public.engineering_analysis_runs
  drop constraint if exists engineering_analysis_runs_analysis_type_check;

alter table public.engineering_analysis_runs
  add constraint engineering_analysis_runs_analysis_type_check
  check (
    analysis_type in (
      'ges', 'parcel', 'zoning', 'site', 'war_room', 'seismic', 'geotech'
    )
  );

alter table public.engineering_analysis_runs
  add column if not exists label text,
  add column if not exists lat double precision,
  add column if not exists lon double precision;

create index if not exists engineering_analysis_runs_geo_idx
  on public.engineering_analysis_runs (lat, lon)
  where lat is not null and lon is not null;

-- ════════════ MIGRATION 3: ibuyer_trade_in ════════════
do $$ begin
  create type public.instant_offer_status as enum (
    'PENDING','LEGAL_REVIEW','OFFER_GENERATED','REJECTED','EXPIRED','ACCEPTED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ibuyer_target_option as enum ('CASH_ONLY','TRADE_IN','BOTH');
exception when duplicate_object then null; end $$;

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

create index if not exists property_submissions_user_id_idx on public.property_submissions (user_id);
create index if not exists instant_offer_requests_submission_idx on public.instant_offer_requests (submission_id, created_at desc);

alter table public.property_submissions enable row level security;
alter table public.property_risk_assessments enable row level security;
alter table public.instant_offer_requests enable row level security;
alter table public.trade_in_details enable row level security;

drop policy if exists "property_submissions_select_own" on public.property_submissions;
create policy "property_submissions_select_own" on public.property_submissions for select using (auth.uid() = user_id);
drop policy if exists "property_submissions_insert_own" on public.property_submissions;
create policy "property_submissions_insert_own" on public.property_submissions for insert with check (auth.uid() = user_id);

drop policy if exists "property_risk_assessments_select_own" on public.property_risk_assessments;
create policy "property_risk_assessments_select_own" on public.property_risk_assessments for select using (
  exists (select 1 from public.property_submissions ps where ps.id = submission_id and ps.user_id = auth.uid())
);
drop policy if exists "property_risk_assessments_insert_own" on public.property_risk_assessments;
create policy "property_risk_assessments_insert_own" on public.property_risk_assessments for insert with check (
  exists (select 1 from public.property_submissions ps where ps.id = submission_id and ps.user_id = auth.uid())
);

drop policy if exists "instant_offer_requests_select_own" on public.instant_offer_requests;
create policy "instant_offer_requests_select_own" on public.instant_offer_requests for select using (
  exists (select 1 from public.property_submissions ps where ps.id = submission_id and ps.user_id = auth.uid())
);
drop policy if exists "instant_offer_requests_insert_own" on public.instant_offer_requests;
create policy "instant_offer_requests_insert_own" on public.instant_offer_requests for insert with check (
  exists (select 1 from public.property_submissions ps where ps.id = submission_id and ps.user_id = auth.uid())
);

drop policy if exists "trade_in_details_select_own" on public.trade_in_details;
create policy "trade_in_details_select_own" on public.trade_in_details for select using (
  exists (select 1 from public.property_submissions ps where ps.id = submission_id and ps.user_id = auth.uid())
);
drop policy if exists "trade_in_details_insert_own" on public.trade_in_details;
create policy "trade_in_details_insert_own" on public.trade_in_details for insert with check (
  exists (select 1 from public.property_submissions ps where ps.id = submission_id and ps.user_id = auth.uid())
);

create or replace function public.ibuyer_calculate_risk_score(flags jsonb)
returns integer language plpgsql immutable as $ibrs$
declare score integer := 0;
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
end $ibrs$;

create or replace function public.ibuyer_determine_status(flags jsonb, risk_score integer)
returns public.instant_offer_status language plpgsql immutable as $ibds$
declare
  has_inheritance boolean := coalesce((flags->>'inheritance')::boolean, false);
  has_concordat boolean := coalesce((flags->>'concordat')::boolean, false);
begin
  if has_inheritance and has_concordat then return 'REJECTED'::public.instant_offer_status; end if;
  if has_inheritance or has_concordat then return 'LEGAL_REVIEW'::public.instant_offer_status; end if;
  if risk_score >= 70 then return 'REJECTED'::public.instant_offer_status; end if;
  if risk_score >= 30 then return 'LEGAL_REVIEW'::public.instant_offer_status; end if;
  return 'OFFER_GENERATED'::public.instant_offer_status;
end $ibds$;

create or replace function public.ibuyer_calculate_offer(market_value numeric, risk_score integer)
returns numeric language sql immutable as $ibco$
  select round(market_value * 0.82 - market_value * (risk_score::numeric / 100.0) * 0.15, 2);
$ibco$;

-- M3's submit_ibuyer_application — will be replaced by M4 (final version below)

-- ════════════ MIGRATION 4: takas_enhancements ════════════
alter table public.trade_in_details
  add column if not exists desired_property_type text,
  add column if not exists desired_min_m2 numeric,
  add column if not exists desired_max_m2 numeric,
  add column if not exists desired_rooms text,
  add column if not exists timeline text;

create index if not exists trade_in_details_user_filter_idx
  on public.trade_in_details (submission_id);

-- submit_ibuyer_application FINAL VERSION (M4 replaces M3's body — extra columns)
create or replace function public.submit_ibuyer_application(payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $sia$
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
  if v_user_id is null then raise exception 'authentication required'; end if;
  if v_market is null or v_market <= 0 then raise exception 'marketValueTry must be positive'; end if;

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
    payload->>'district', payload->>'address', payload->>'parcelNo',
    (payload->>'grossM2')::numeric, v_market,
    coalesce(payload->>'propertyType', 'konut'),
    payload->>'contactPhone', payload->>'contactEmail',
    coalesce(payload->'metadata', '{}'::jsonb)
  ) returning id into v_submission_id;

  insert into public.property_risk_assessments (submission_id, risk_flags, risk_score, risk_breakdown)
  values (v_submission_id, v_flags, v_risk_score, v_breakdown)
  returning id into v_assessment_id;

  if v_status = 'OFFER_GENERATED' then
    v_offer_amount := public.ibuyer_calculate_offer(v_market, v_risk_score);
  else v_offer_amount := null; end if;

  insert into public.instant_offer_requests (
    submission_id, risk_assessment_id, status, offer_amount_try,
    market_value_try, risk_score, expires_at
  ) values (
    v_submission_id, v_assessment_id, v_status, v_offer_amount,
    v_market, v_risk_score,
    case when v_status = 'OFFER_GENERATED' then now() + interval '72 hours' else null end
  ) returning id into v_offer_id;

  if coalesce(payload->>'targetOption', '') <> '' then
    insert into public.trade_in_details (
      submission_id, target_option, desired_city, desired_district,
      desired_budget_try, notes,
      desired_property_type, desired_min_m2, desired_max_m2, desired_rooms, timeline
    ) values (
      v_submission_id,
      (payload->>'targetOption')::public.ibuyer_target_option,
      payload->>'desiredCity', payload->>'desiredDistrict',
      nullif(payload->>'desiredBudgetTry', '')::numeric,
      payload->>'tradeInNotes',
      payload->>'desiredPropertyType',
      nullif(payload->>'desiredMinM2', '')::numeric,
      nullif(payload->>'desiredMaxM2', '')::numeric,
      payload->>'desiredRooms', payload->>'timeline'
    ) returning id into v_trade_id;
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
end $sia$;

revoke all on function public.submit_ibuyer_application(jsonb) from public;
grant execute on function public.submit_ibuyer_application(jsonb) to authenticated;

create or replace function public.submit_takas_application(payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $sta$
declare v_payload jsonb;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  v_payload := payload || jsonb_build_object('targetOption', 'TRADE_IN');
  return public.submit_ibuyer_application(v_payload);
end $sta$;

revoke all on function public.submit_takas_application(jsonb) from public;
grant execute on function public.submit_takas_application(jsonb) to authenticated;

-- ════════════ schema_migrations TRACKING (4 satır) ════════════
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES
  ('20260517140000', 'land_ges_intelligence',
   ARRAY['-- Deployed via CLI on 2026-05-27. engineering_analysis_runs base table.']::text[]),
  ('20260517150000', 'engineering_war_room',
   ARRAY['-- Deployed via CLI on 2026-05-27. Extends analysis_type + adds label/lat/lon.']::text[]),
  ('20260518120000', 'ibuyer_trade_in',
   ARRAY['-- Deployed via CLI on 2026-05-27. iBuyer + trade_in module.']::text[]),
  ('20260518200000', 'takas_enhancements',
   ARRAY['-- Deployed via CLI on 2026-05-27. trade_in_details columns + submit_takas RPC.']::text[])
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- SMOKE
-- ════════════════════════════════════════════════════════════════════════════

-- (S1) Yeni tablolar var mı?
SELECT 'S1 tables' AS check, string_agg(table_name, ',' ORDER BY table_name) AS present
FROM information_schema.tables WHERE table_schema='public'
  AND table_name IN ('engineering_analysis_runs','property_submissions','property_risk_assessments',
                     'instant_offer_requests','trade_in_details');

-- (S2) engineering_analysis_runs.label/lat/lon ek kolon var mı?
SELECT 'S2 columns' AS check, string_agg(column_name, ',' ORDER BY column_name) AS present
FROM information_schema.columns WHERE table_schema='public' AND table_name='engineering_analysis_runs'
  AND column_name IN ('label','lat','lon');

-- (S3) trade_in_details ek kolonlar var mı?
SELECT 'S3 trade_in_details columns' AS check, string_agg(column_name, ',' ORDER BY column_name) AS present
FROM information_schema.columns WHERE table_schema='public' AND table_name='trade_in_details'
  AND column_name IN ('desired_property_type','desired_min_m2','desired_max_m2','desired_rooms','timeline');

-- (S4) RPC'ler var mı?
SELECT 'S4 functions' AS check, string_agg(proname, ',' ORDER BY proname) AS present
FROM pg_proc WHERE pronamespace='public'::regnamespace
  AND proname IN ('ibuyer_calculate_risk_score','ibuyer_determine_status','ibuyer_calculate_offer',
                  'submit_ibuyer_application','submit_takas_application');

-- (S5) submit_ibuyer_application'da desired_property_type kullanılıyor mu? (M4 versiyonu mu?)
SELECT 'S5 submit_ibuyer M4 active' AS check,
       prosrc LIKE '%desired_property_type%' AS m4_active
FROM pg_proc WHERE proname='submit_ibuyer_application' AND pronamespace='public'::regnamespace;

-- (S6) Yeni schema_migrations satırları?
SELECT 'S6 new tracking rows' AS check, string_agg(version || ':' || name, ', ' ORDER BY version) AS new_versions
FROM supabase_migrations.schema_migrations
WHERE version IN ('20260517140000','20260517150000','20260518120000','20260518200000');

-- (S7) REGRESSION — KYC guard çalışıyor mu?
DO $$ DECLARE v_result json; BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-aaaa-bbbb-cccc-000000000003', true);
  SELECT public.execute_buy_now(gen_random_uuid(), gen_random_uuid(), 'smoke-phase3a') INTO v_result;
  IF v_result->>'code' = 'kyc_required' THEN RAISE NOTICE 'S7 REGRESSION OK';
  ELSE RAISE EXCEPTION 'S7 REGRESSION FAIL — got %', v_result; END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════════
-- REVERSE (acil — yorumda; DROP TABLE veri kaybı!)
-- ════════════════════════════════════════════════════════════════════════════
/*
BEGIN;
-- M4 reverse
drop function if exists public.submit_takas_application(jsonb);
-- (submit_ibuyer_application'ı M3 versiyonuna geri almak için ayrı OR REPLACE gerekir)
alter table public.trade_in_details
  drop column if exists timeline,
  drop column if exists desired_rooms,
  drop column if exists desired_max_m2,
  drop column if exists desired_min_m2,
  drop column if exists desired_property_type;

-- M3 reverse
drop function if exists public.submit_ibuyer_application(jsonb);
drop function if exists public.ibuyer_calculate_offer(numeric, integer);
drop function if exists public.ibuyer_determine_status(jsonb, integer);
drop function if exists public.ibuyer_calculate_risk_score(jsonb);
drop table if exists public.trade_in_details;
drop table if exists public.instant_offer_requests;
drop table if exists public.property_risk_assessments;
drop table if exists public.property_submissions;
drop type if exists public.ibuyer_target_option;
drop type if exists public.instant_offer_status;

-- M2 reverse — analysis_type'ı eski set'e döndür
alter table public.engineering_analysis_runs drop constraint if exists engineering_analysis_runs_analysis_type_check;
alter table public.engineering_analysis_runs add constraint engineering_analysis_runs_analysis_type_check
  check (analysis_type in ('ges', 'parcel', 'zoning'));
alter table public.engineering_analysis_runs
  drop column if exists lon, drop column if exists lat, drop column if exists label;

-- M1 reverse
drop table if exists public.engineering_analysis_runs;

DELETE FROM supabase_migrations.schema_migrations
WHERE version IN ('20260517140000','20260517150000','20260518120000','20260518200000');
COMMIT;
*/
