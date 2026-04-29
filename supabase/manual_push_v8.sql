-- TUR #26 — AI analiz raporları, rapor onayları, blokaj, hemen al (Supabase)
-- Prisma yerine SQL; Redis lock yerine SELECT FOR UPDATE

-- ═══ listings.status: buy_now sonrası 'sold' ═══
alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings add constraint listings_status_check check (
  status in ('draft','review','active','closed','cancelled','sold')
);

-- ═══ AI ANALIZ RAPORLARI ═══
create table if not exists public.property_analysis_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,

  legal_title_deed_status text
    check (legal_title_deed_status in ('clean','encumbered','disputed','unknown')),
  legal_mortgages jsonb default '[]'::jsonb,
  legal_liens jsonb default '[]'::jsonb,
  legal_zoning_status text,
  legal_building_permit_status text,
  legal_municipal_records jsonb default '{}'::jsonb,
  legal_risk_score int check (legal_risk_score between 1 and 10),
  legal_warnings text[],

  socio_income_level text
    check (socio_income_level in ('low','lower_middle','middle','upper_middle','high')),
  socio_education_score int check (socio_education_score between 1 and 10),
  socio_cultural_indicators jsonb default '{}'::jsonb,
  socio_crime_index int check (socio_crime_index between 1 and 10),
  socio_political_lean text,
  socio_employment_rate numeric,
  socio_demographics jsonb default '{}'::jsonb,

  location_metro_distance_km numeric,
  location_highway_distance_km numeric,
  location_airport_distance_km numeric,
  location_school_distance_km numeric,
  location_hospital_distance_km numeric,
  location_shopping_distance_km numeric,
  location_park_distance_km numeric,
  location_green_area_pct numeric,
  location_pollution_index int,
  location_earthquake_risk text
    check (location_earthquake_risk in ('low','medium','high','very_high')),
  location_commerce_potential text,

  economic_avg_rent_try numeric,
  economic_price_trend_3y_pct numeric,
  economic_price_trend_5y_pct numeric,
  economic_municipal_plan_alignment text,
  economic_fair_market_value_try numeric,
  economic_fair_price_score int check (economic_fair_price_score between 1 and 10),
  economic_lower_bound_try numeric,
  economic_upper_bound_try numeric,

  overall_risk_score int check (overall_risk_score between 1 and 10),
  overall_recommendation_buyer text,
  overall_recommendation_seller text,
  overall_red_flags text[],
  overall_disclaimer text not null default
    'Bu rapor bilgilendirme amaçlıdır, profesyonel ekspertiz veya hukuki tavsiye yerine geçmez.',

  status text not null default 'pending'
    check (status in ('pending','generating','ready','failed')),
  ai_provider text default 'mock',
  ai_model_version text,
  generated_at timestamptz,
  approved_by_seller_at timestamptz,
  raw_data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(listing_id)
);

create index if not exists property_reports_listing_idx on public.property_analysis_reports(listing_id);
create index if not exists property_reports_status_idx on public.property_analysis_reports(status);

create table if not exists public.report_approvals (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.property_analysis_reports(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  approved_at timestamptz not null default now(),
  ip_address inet,
  user_agent text,
  unique(report_id, user_id)
);

create index if not exists report_approvals_user_idx on public.report_approvals(user_id);

create table if not exists public.bid_deposits (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  auction_id uuid references public.auctions(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id),

  base_amount_try numeric(14,2) not null,
  deposit_rate numeric default 0.015,
  deposit_amount_try numeric(14,2) not null,

  status text not null default 'pending'
    check (status in (
      'pending',
      'authorized',
      'captured',
      'released',
      'forfeit_partial',
      'failed',
      'expired'
    )),

  iyzico_pre_auth_ref text,
  iyzico_capture_ref text,
  iyzico_refund_ref text,
  iyzico_void_ref text,

  pre_auth_at timestamptz,
  captured_at timestamptz,
  released_at timestamptz,
  forfeited_at timestamptz,

  forfeit_amount_try numeric(14,2) default 0,
  refund_amount_try numeric(14,2) default 0,

  context text check (context in ('bid','buy_now')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists bid_deposits_buyer_idx on public.bid_deposits(buyer_id);
create index if not exists bid_deposits_listing_idx on public.bid_deposits(listing_id);
create index if not exists bid_deposits_status_idx on public.bid_deposits(status);

create table if not exists public.buy_now_purchases (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  auction_id uuid references public.auctions(id),
  buyer_id uuid not null references public.profiles(id),

  amount_try numeric(14,2) not null,
  deposit_id uuid references public.bid_deposits(id),

  buyer_report_approved_at timestamptz not null,
  buyer_terms_accepted_at timestamptz not null,
  buyer_kyc_verified_at timestamptz,

  status text not null default 'pending_payment'
    check (status in (
      'pending_payment','confirmed','cancelled','refunded','disputed'
    )),

  iyzico_payment_ref text,
  cancelled_reason text,

  created_at timestamptz default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz
);

create index if not exists buy_now_buyer_idx on public.buy_now_purchases(buyer_id);
create index if not exists buy_now_listing_idx on public.buy_now_purchases(listing_id);

-- ═══ LISTINGS uzatma ═══
alter table public.listings
  add column if not exists buy_now_price_try numeric(14,2),
  add column if not exists analysis_report_id uuid references public.property_analysis_reports(id),
  add column if not exists seller_report_approved_at timestamptz,
  add column if not exists buy_now_disabled boolean default false;

-- ═══ Rate limit (iç tablo; yazım SECURITY DEFINER fonksiyonlarıyla) ═══
create table if not exists public.rate_limit_events (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_user_action_idx
  on public.rate_limit_events (user_id, action, created_at desc);

alter table public.rate_limit_events enable row level security;

-- ═══ RLS ═══
alter table public.property_analysis_reports enable row level security;
alter table public.report_approvals enable row level security;
alter table public.bid_deposits enable row level security;
alter table public.buy_now_purchases enable row level security;

drop policy if exists "reports_select_seller" on public.property_analysis_reports;
create policy "reports_select_seller" on public.property_analysis_reports
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

drop policy if exists "reports_select_authenticated_active" on public.property_analysis_reports;
create policy "reports_select_authenticated_active" on public.property_analysis_reports
  for select using (
    auth.uid() is not null
    and exists (
      select 1 from public.listings l
      join public.auctions a on a.listing_id = l.id
      where l.id = listing_id and a.status in ('live','scheduled')
    )
  );

drop policy if exists "reports_admin_all" on public.property_analysis_reports;
create policy "reports_admin_all" on public.property_analysis_reports
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "reports_insert_seller" on public.property_analysis_reports;
create policy "reports_insert_seller" on public.property_analysis_reports
  for insert to authenticated
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

drop policy if exists "reports_update_seller" on public.property_analysis_reports;
create policy "reports_update_seller" on public.property_analysis_reports
  for update to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

drop policy if exists "approvals_self" on public.report_approvals;
create policy "approvals_self" on public.report_approvals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "deposits_buyer_self" on public.bid_deposits;
create policy "deposits_buyer_self" on public.bid_deposits
  for select using (auth.uid() = buyer_id);

drop policy if exists "deposits_seller_view" on public.bid_deposits;
create policy "deposits_seller_view" on public.bid_deposits
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

drop policy if exists "deposits_admin_all" on public.bid_deposits;
create policy "deposits_admin_all" on public.bid_deposits
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "buy_now_party" on public.buy_now_purchases;
create policy "buy_now_party" on public.buy_now_purchases
  for select using (
    auth.uid() = buyer_id
    or exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ═══ Rate limit RPC ═══
create or replace function public.rate_limit_check(p_action text, p_max_per_hour int)
returns json
language plpgsql
security definer
set search_path = public
as $rl$
declare
  v_uid uuid := auth.uid();
  v_count int;
begin
  if v_uid is null then
    return json_build_object('ok', false, 'reason', 'auth');
  end if;
  select count(*)::int into v_count
  from public.rate_limit_events
  where user_id = v_uid
    and action = p_action
    and created_at > now() - interval '1 hour';
  if v_count >= p_max_per_hour then
    return json_build_object('ok', false, 'reason', 'rate_limited');
  end if;
  insert into public.rate_limit_events (user_id, action) values (v_uid, p_action);
  return json_build_object('ok', true);
end;
$rl$;

grant execute on function public.rate_limit_check(text, int) to authenticated;

-- ═══ Blokaj kaydı (ödeme mock sonrası) — INSERT yalnız RPC ═══
create or replace function public.register_bid_deposit(
  p_listing_id uuid,
  p_auction_id uuid,
  p_base_amount_try numeric,
  p_deposit_amount_try numeric,
  p_pre_auth_ref text,
  p_context text,
  p_idempotency_key text
) returns json
language plpgsql
security definer
set search_path = public
as $dep$
declare
  v_uid uuid := auth.uid();
  v_rl json;
  v_id uuid;
begin
  if v_uid is null then
    return json_build_object('status','error','message','Giriş yapmalısınız');
  end if;

  if p_context is null or p_context not in ('bid','buy_now') then
    return json_build_object('status','error','message','Geçersiz işlem bağlamı');
  end if;

  v_rl := public.rate_limit_check(
    case when p_context = 'buy_now' then 'buy_now_attempts' else 'pre_auth_attempts' end,
    case when p_context = 'buy_now' then 5 else 10 end
  );
  if coalesce((v_rl->>'ok')::boolean, false) is not true then
    return json_build_object('status','error','message','Çok sık deneme — lütfen daha sonra tekrar deneyin');
  end if;

  if not exists (select 1 from public.listings l where l.id = p_listing_id) then
    return json_build_object('status','error','message','İlan bulunamadı');
  end if;

  insert into public.bid_deposits (
    listing_id,
    auction_id,
    buyer_id,
    base_amount_try,
    deposit_rate,
    deposit_amount_try,
    status,
    iyzico_pre_auth_ref,
    pre_auth_at,
    context,
    metadata
  ) values (
    p_listing_id,
    p_auction_id,
    v_uid,
    p_base_amount_try,
    0.015,
    p_deposit_amount_try,
    'authorized',
    p_pre_auth_ref,
    now(),
    p_context,
    jsonb_build_object('idempotency_key', p_idempotency_key, 'is_mock', true)
  )
  returning id into v_id;

  return json_build_object('status','ok','deposit_id', v_id);
end;
$dep$;

grant execute on function public.register_bid_deposit(uuid, uuid, numeric, numeric, text, text, text) to authenticated;

-- ═══ HEMEN AL atomik (SELECT FOR UPDATE) ═══
create or replace function public.execute_buy_now(
  p_listing_id uuid,
  p_deposit_id uuid,
  p_idempotency_key text
) returns json
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_buyer_id uuid := auth.uid();
  v_listing record;
  v_auction record;
  v_buy_now_id uuid;
  v_deposit record;
  v_report_approved boolean;
  v_rl json;
begin
  if v_buyer_id is null then
    return json_build_object('status','error','message','Giriş yapmalısınız');
  end if;

  v_rl := public.rate_limit_check('buy_now_attempts', 5);
  if coalesce((v_rl->>'ok')::boolean, false) is not true then
    return json_build_object('status','error','message','Çok sık deneme — lütfen daha sonra tekrar deneyin');
  end if;

  if exists (
    select 1 from public.buy_now_purchases
    where listing_id = p_listing_id
      and buyer_id = v_buyer_id
      and status in ('pending_payment','confirmed')
  ) then
    return json_build_object('status','duplicate','message','Bu ilan için zaten Hemen Al işleminiz var');
  end if;

  select * into v_listing from public.listings
    where id = p_listing_id for update;

  if not found then
    return json_build_object('status','error','message','İlan bulunamadı');
  end if;

  if v_listing.status != 'active' then
    return json_build_object('status','error','message','İlan aktif değil');
  end if;

  if v_listing.buy_now_price_try is null then
    return json_build_object('status','error','message','Bu ilanda Hemen Al fiyatı yok');
  end if;

  if coalesce(v_listing.buy_now_disabled, false) then
    return json_build_object('status','error','message','Hemen Al kapatıldı');
  end if;

  select * into v_auction from public.auctions
    where listing_id = p_listing_id
    order by created_at desc nulls last
    limit 1
    for update;

  if not found then
    return json_build_object('status','error','message','İhale kaydı bulunamadı');
  end if;

  if v_auction.status not in ('scheduled','live') then
    return json_build_object('status','error','message','İhale tamamlanmış veya iptal');
  end if;

  select exists(
    select 1 from public.report_approvals ra
    join public.property_analysis_reports r on r.id = ra.report_id
    where r.listing_id = p_listing_id and ra.user_id = v_buyer_id
  ) into v_report_approved;

  if not v_report_approved then
    return json_build_object('status','error','message','Önce AI analiz raporunu onaylamalısınız');
  end if;

  select * into v_deposit from public.bid_deposits
    where id = p_deposit_id
      and buyer_id = v_buyer_id
      and listing_id = p_listing_id
      and status = 'authorized'
      and context = 'buy_now';

  if not found then
    return json_build_object('status','error','message','Geçerli blokaj bulunamadı');
  end if;

  insert into public.buy_now_purchases (
    listing_id, auction_id, buyer_id, amount_try, deposit_id,
    buyer_report_approved_at, buyer_terms_accepted_at,
    status
  ) values (
    p_listing_id, v_auction.id, v_buyer_id, v_listing.buy_now_price_try, p_deposit_id,
    now(), now(),
    'pending_payment'
  ) returning id into v_buy_now_id;

  update public.auctions set status = 'ended'
    where listing_id = p_listing_id;

  update public.listings set status = 'sold', updated_at = now()
    where id = p_listing_id;

  return json_build_object(
    'status','ok',
    'buy_now_id', v_buy_now_id,
    'amount', v_listing.buy_now_price_try
  );
end;
$fn$;

grant execute on function public.execute_buy_now(uuid, uuid, text) to authenticated;
