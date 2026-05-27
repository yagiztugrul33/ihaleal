-- Takas (Trade-In) enhancements
-- Adds richer target criteria to trade_in_details and dedicated submit_takas_application RPC.
-- Backwards compatible with submit_ibuyer_application (new columns are nullable and additive).

alter table public.trade_in_details
  add column if not exists desired_property_type text,
  add column if not exists desired_min_m2 numeric,
  add column if not exists desired_max_m2 numeric,
  add column if not exists desired_rooms text,
  add column if not exists timeline text;

create index if not exists trade_in_details_user_filter_idx
  on public.trade_in_details (submission_id);

-- Update iBuyer RPC to optionally populate the new takas columns.
-- (Re-create as CREATE OR REPLACE keeps the GRANT.)
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
      submission_id, target_option, desired_city, desired_district,
      desired_budget_try, notes,
      desired_property_type, desired_min_m2, desired_max_m2, desired_rooms, timeline
    ) values (
      v_submission_id,
      (payload->>'targetOption')::public.ibuyer_target_option,
      payload->>'desiredCity',
      payload->>'desiredDistrict',
      nullif(payload->>'desiredBudgetTry', '')::numeric,
      payload->>'tradeInNotes',
      payload->>'desiredPropertyType',
      nullif(payload->>'desiredMinM2', '')::numeric,
      nullif(payload->>'desiredMaxM2', '')::numeric,
      payload->>'desiredRooms',
      payload->>'timeline'
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

-- Dedicated takas submission RPC: target_option forced to TRADE_IN,
-- accepts the richer hedef-property criteria upfront.
create or replace function public.submit_takas_application(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payload jsonb;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;
  -- Force target_option to TRADE_IN regardless of caller input.
  v_payload := payload || jsonb_build_object('targetOption', 'TRADE_IN');
  return public.submit_ibuyer_application(v_payload);
end;
$$;

revoke all on function public.submit_takas_application(jsonb) from public;
grant execute on function public.submit_takas_application(jsonb) to authenticated;
