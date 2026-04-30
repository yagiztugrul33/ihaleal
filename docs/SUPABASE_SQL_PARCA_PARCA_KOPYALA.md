# ihaleal.com SQL — 4 parça (v3→v6)

Her dosya **tam bir faz**dır; içindeki PL/pgSQL blokları bütün olarak kalır.

Supabase SQL Editor: **01 → 02 → 03 → 04** sırayla yapıştır, her defasında **Run**.

---

## Parça 1/4 — v3 (profiles, bid_bonds, place_bid v1, listings RLS)

```sql
-- ihaleal.com — Birleşik manuel SQL (v3 + v4 + v5 + v6)
-- Tek seferde Run ile uygulanır; mümkün olduğunca yeniden çalıştırılabilir (DROP IF EXISTS policies).
-- Komisyon oranı: %2 alıcı + %2 satıcı = %4 toplam matrah (KDV ayrı hesaplanır)
--
-- ÖNEMLİ DÜZELTME (42710 policy already exists): listings_insert_kyc_edevlet için DROP eklendi.

-- ===== v3 BAŞLANGIÇ =====

-- profiles ekstra alanlar
alter table public.profiles
  add column if not exists e_devlet_status text default 'none'
    check (e_devlet_status in ('none','pending','verified','rejected')),
  add column if not exists iban text,
  add column if not exists tc_kimlik_no text,
  add column if not exists role text default 'individual'
    check (role in ('individual','agent','bank','admin'));

create index if not exists profiles_role_idx on public.profiles(role);
drop index if exists public.profiles_tc_idx;
create unique index if not exists profiles_tc_unique
  on public.profiles(tc_kimlik_no)
  where tc_kimlik_no is not null;

-- auctions INSERT (listing sahibi)
drop policy if exists "auctions_insert_listing_owner" on public.auctions;
create policy "auctions_insert_listing_owner" on public.auctions
  for insert with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

-- bid_bonds + anti-sniping
alter table public.auctions
  add column if not exists anti_sniping_threshold_seconds int not null default 120,
  add column if not exists anti_sniping_extend_seconds int not null default 120,
  add column if not exists minimum_increment_try numeric(14,2) not null default 100;

create table if not exists public.bid_bonds (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  bidder_id uuid not null references public.profiles(id) on delete cascade,
  amount_try numeric(14,2) not null check (amount_try >= 0),
  bid_amount_try numeric(14,2) not null check (bid_amount_try > 0),
  status text not null default 'held'
    check (status in ('held','released','forfeited')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auction_id, bidder_id)
);

create index if not exists bid_bonds_auction_idx on public.bid_bonds(auction_id);
create index if not exists bid_bonds_bidder_idx on public.bid_bonds(bidder_id);

alter table public.bid_bonds enable row level security;

drop policy if exists "bid_bonds_select_own" on public.bid_bonds;
create policy "bid_bonds_select_own" on public.bid_bonds
  for select using (auth.uid() = bidder_id);

drop policy if exists "bid_bonds_insert_own" on public.bid_bonds;
create policy "bid_bonds_insert_own" on public.bid_bonds
  for insert with check (auth.uid() = bidder_id);

drop policy if exists "bid_bonds_update_own" on public.bid_bonds;
create policy "bid_bonds_update_own" on public.bid_bonds
  for update using (auth.uid() = bidder_id)
  with check (auth.uid() = bidder_id);

drop policy if exists "bid_bonds_service_all" on public.bid_bonds;
grant select, insert, update on public.bid_bonds to authenticated;

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
  v_min_increment numeric;
  v_bond_rate numeric := 0.05;
  v_bond_try numeric;
  v_sniping_extended boolean := false;
begin
  if v_bidder is null then
    return json_build_object('status','error','message','Giriş yapmalısınız');
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
  if v_auction.ends_at <= now() then
    return json_build_object('status','error','message','İhale bitti');
  end if;
  if (v_auction.ends_at - now())
       <= interval '1 second' * coalesce(v_auction.anti_sniping_threshold_seconds, 120)
  then
    update public.auctions
    set ends_at = ends_at
      + interval '1 second' * coalesce(v_auction.anti_sniping_extend_seconds, 120)
    where id = p_auction_id
    returning * into v_auction;
    v_sniping_extended := true;
  end if;
  if v_auction.ends_at <= now() then
    return json_build_object('status','error','message','İhale bitti');
  end if;
  v_min_increment := coalesce(v_auction.minimum_increment_try, 100);
  if p_amount < coalesce(v_auction.current_high_bid_try, 0) + v_min_increment then
    return json_build_object('status','error','message','Teklif çok düşük');
  end if;
  v_bond_try := round(p_amount * v_bond_rate, 2);
  insert into public.bids (auction_id, bidder_id, amount_try, idempotency_key)
    values (p_auction_id, v_bidder, p_amount, p_idempotency_key);
  insert into public.bid_bonds (auction_id, bidder_id, amount_try, bid_amount_try, status)
    values (p_auction_id, v_bidder, v_bond_try, p_amount, 'held')
  on conflict (auction_id, bidder_id) do update
    set amount_try = excluded.amount_try,
        bid_amount_try = excluded.bid_amount_try,
        status = 'held',
        updated_at = now();
  update public.auctions
    set current_high_bid_try = p_amount,
        current_high_bidder_id = v_bidder,
        bid_count = bid_count + 1
    where id = p_auction_id;
  return json_build_object(
    'status','ok',
    'amount', p_amount,
    'bond_try', v_bond_try,
    'ends_at', v_auction.ends_at,
    'anti_sniping_extended', v_sniping_extended
  );
end;
$fn$;

grant execute on function public.place_bid(uuid, numeric, text) to authenticated;

-- listings RLS strict (KYC + e-Devlet)
drop policy if exists "listings_insert_authenticated" on public.listings;
drop policy if exists "listings_insert_kyc" on public.listings;
drop policy if exists "listings_insert_kyc_edevlet" on public.listings;

create policy "listings_insert_kyc_edevlet" on public.listings
  for insert with check (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kyc_status = 'verified'
        and coalesce(p.e_devlet_status, 'none') = 'verified'
    )
  );

-- ===== v3 SON =====
```

## Parça 2/4 — v4 (audit_log, admin)

```sql
-- ===== v4 BAŞLANGIÇ =====

-- audit_log
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);
create index if not exists audit_log_entity_idx on public.audit_log (entity_type, entity_id);

alter table public.audit_log enable row level security;

drop policy if exists "audit_log_admin_select" on public.audit_log;
create policy "audit_log_admin_select" on public.audit_log
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Admin politikaları
drop policy if exists "listings_select_admin" on public.listings;
create policy "listings_select_admin" on public.listings
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
    )
  );

drop policy if exists "listings_update_admin" on public.listings;
create policy "listings_update_admin" on public.listings
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
    )
  );

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
    )
  );

-- ===== v4 SON =====
```

## Parça 3/4 — v5 (memberships, commission tabloları)

```sql
-- ===== v5 BAŞLANGIÇ =====

-- memberships
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null
    check (type in (
      'seller_yearly',
      'buyer_yearly',
      'agent_referral',
      'agent_portfolio',
      'agent_full'
    )),
  amount_paid_try numeric(14,2) not null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'active'
    check (status in ('active','expired','cancelled')),
  iyzico_ref text,
  created_at timestamptz not null default now()
);

create index if not exists memberships_user_idx on public.memberships(user_id);
create index if not exists memberships_expires_idx on public.memberships(expires_at);

-- service_fees
create table if not exists public.service_fees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  service_type text not null
    check (service_type in (
      'photo','drone','legal','expertise','virtual_tour','video','tapu_prep','bid_entry'
    )),
  amount_try numeric(14,2) not null,
  paid_at timestamptz not null default now(),
  status text not null default 'paid'
    check (status in ('paid','refunded','offset_against_commission'))
);

create index if not exists service_fees_user_idx on public.service_fees(user_id);
create index if not exists service_fees_listing_idx on public.service_fees(listing_id);

-- authorizations
create table if not exists public.authorizations (
  id uuid primary key default gen_random_uuid(),
  property_title_deed text not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  authorized_by_agent_id uuid references public.profiles(id) on delete set null,
  agent_role text
    check (agent_role is null or agent_role in ('referral','portfolio','full')),
  listing_id uuid references public.listings(id) on delete set null,
  signed_at timestamptz,
  expires_at timestamptz,
  signed_via text
    check (signed_via is null or signed_via in ('e_devlet','kep','wet_signature')),
  pdf_url text,
  status text not null default 'pending'
    check (status in ('pending','active','expired','revoked')),
  created_at timestamptz not null default now()
);

create index if not exists authorizations_owner_idx on public.authorizations(owner_id);
create index if not exists authorizations_agent_idx on public.authorizations(authorized_by_agent_id);
create index if not exists authorizations_listing_idx on public.authorizations(listing_id);

-- commission_records
create table if not exists public.commission_records (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete restrict,
  seller_id uuid not null references public.profiles(id),
  buyer_id uuid references public.profiles(id),
  sale_amount_try numeric(14,2) not null,
  seller_commission_try numeric(14,2) not null,
  seller_vat_try numeric(14,2) not null,
  buyer_commission_try numeric(14,2) not null default 0,
  buyer_vat_try numeric(14,2) not null default 0,
  offset_membership_try numeric(14,2) not null default 0,
  offset_service_fees_try numeric(14,2) not null default 0,
  offset_total_try numeric(14,2) not null default 0,
  agent_id uuid references public.profiles(id) on delete set null,
  agent_role text,
  agent_share_rate numeric(10,6),
  agent_share_try numeric(14,2) not null default 0,
  agent_invoice_received boolean not null default false,
  agent_invoice_url text,
  platform_net_try numeric(14,2) not null,
  collected_at timestamptz not null default now()
);

create index if not exists commission_records_auction_idx on public.commission_records(auction_id);
create index if not exists commission_records_seller_idx on public.commission_records(seller_id);
create index if not exists commission_records_agent_idx on public.commission_records(agent_id);

-- agent_performance
create table if not exists public.agent_performance (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.profiles(id) on delete cascade,
  period_year int not null check (period_year >= 2000 and period_year <= 2100),
  period_month int not null check (period_month >= 1 and period_month <= 12),
  referrals_count int not null default 0,
  referrals_converted int not null default 0,
  portfolio_listings int not null default 0,
  portfolio_listings_sold int not null default 0,
  full_listings int not null default 0,
  full_listings_sold int not null default 0,
  total_gmv_try numeric(14,2) not null default 0,
  total_earned_try numeric(14,2) not null default 0,
  unique (agent_id, period_year, period_month)
);

create index if not exists agent_performance_agent_idx on public.agent_performance(agent_id);

-- RLS açma
alter table public.memberships enable row level security;
alter table public.service_fees enable row level security;
alter table public.authorizations enable row level security;
alter table public.commission_records enable row level security;
alter table public.agent_performance enable row level security;

-- SELECT politikaları
drop policy if exists "memberships_select_own" on public.memberships;
create policy "memberships_select_own" on public.memberships
  for select using (auth.uid() = user_id);

drop policy if exists "service_fees_select_own" on public.service_fees;
create policy "service_fees_select_own" on public.service_fees
  for select using (auth.uid() = user_id);

drop policy if exists "authorizations_select_related" on public.authorizations;
create policy "authorizations_select_related" on public.authorizations
  for select using (
    auth.uid() = owner_id
    or auth.uid() = authorized_by_agent_id
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "commission_records_select_party" on public.commission_records;
create policy "commission_records_select_party" on public.commission_records
  for select using (
    auth.uid() = seller_id
    or auth.uid() = buyer_id
    or auth.uid() = agent_id
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "agent_performance_select_own" on public.agent_performance;
create policy "agent_performance_select_own" on public.agent_performance
  for select using (
    auth.uid() = agent_id
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
    )
  );

grant select on public.memberships to authenticated;
grant select on public.service_fees to authenticated;
grant select on public.authorizations to authenticated;
grant select on public.commission_records to authenticated;
grant select on public.agent_performance to authenticated;

-- ===== v5 SON =====
```

## Parça 4/4 — v6 (RLS güncellemeleri, place_bid v2, komisyon RPC)

```sql
-- ===== v6 BAŞLANGIÇ =====

-- memberships INSERT/UPDATE
grant insert, update on public.memberships to authenticated;

drop policy if exists "memberships_select_own" on public.memberships;
drop policy if exists "memberships_select_self" on public.memberships;
create policy "memberships_select_self" on public.memberships
  for select using (auth.uid() = user_id);

drop policy if exists "memberships_insert_self" on public.memberships;
create policy "memberships_insert_self" on public.memberships
  for insert with check (auth.uid() = user_id);

drop policy if exists "memberships_update_admin" on public.memberships;
create policy "memberships_update_admin" on public.memberships
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- service_fees INSERT
grant insert on public.service_fees to authenticated;

drop policy if exists "service_fees_select_own" on public.service_fees;
drop policy if exists "service_fees_select_self" on public.service_fees;
create policy "service_fees_select_self" on public.service_fees
  for select using (auth.uid() = user_id);

drop policy if exists "service_fees_insert_self" on public.service_fees;
create policy "service_fees_insert_self" on public.service_fees
  for insert with check (auth.uid() = user_id);

-- authorizations INSERT
grant insert on public.authorizations to authenticated;

drop policy if exists "authorizations_select_related" on public.authorizations;
drop policy if exists "authorizations_select_owner" on public.authorizations;
create policy "authorizations_select_owner" on public.authorizations
  for select using (
    auth.uid() = owner_id
    or auth.uid() = authorized_by_agent_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "authorizations_insert_owner" on public.authorizations;
create policy "authorizations_insert_owner" on public.authorizations
  for insert with check (auth.uid() = owner_id);

-- bid_bonds yeniden adlandırma
drop policy if exists "bid_bonds_select_own" on public.bid_bonds;
drop policy if exists "bid_bonds_select_self" on public.bid_bonds;
create policy "bid_bonds_select_self" on public.bid_bonds
  for select using (auth.uid() = bidder_id);

drop policy if exists "bid_bonds_insert_own" on public.bid_bonds;
drop policy if exists "bid_bonds_insert_self" on public.bid_bonds;
create policy "bid_bonds_insert_self" on public.bid_bonds
  for insert with check (auth.uid() = bidder_id);

drop policy if exists "bid_bonds_update_own" on public.bid_bonds;
drop policy if exists "bid_bonds_update_self" on public.bid_bonds;
create policy "bid_bonds_update_self" on public.bid_bonds
  for update using (auth.uid() = bidder_id)
  with check (auth.uid() = bidder_id);

-- place_bid v2 — teminat zorunlu + anti-sniping
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
  v_min_increment numeric;
  v_bond_rate numeric := 0.05;
  v_bond_try numeric;
  v_sniping_extended boolean := false;
  v_bond_status text;
begin
  if v_bidder is null then
    return json_build_object('status','error','message','Giriş yapmalısınız');
  end if;
  if exists (
    select 1 from public.bids
    where auction_id = p_auction_id
      and bidder_id = v_bidder
      and idempotency_key = p_idempotency_key
  ) then
    return json_build_object('status','duplicate','message','Bu teklif zaten kayıtlı');
  end if;
  select status into v_bond_status from public.bid_bonds
    where auction_id = p_auction_id and bidder_id = v_bidder
    limit 1;
  if v_bond_status is null then
    return json_build_object('status','error','message','Önce teminat yatırmalısınız');
  end if;
  if v_bond_status <> 'held' then
    return json_build_object(
      'status','error',
      'message','Teminatınız geçersiz: ' || v_bond_status
    );
  end if;
  select * into v_auction from public.auctions
    where id = p_auction_id for update;
  if v_auction is null then
    return json_build_object('status','error','message','İhale bulunamadı');
  end if;
  if v_auction.status <> 'live' then
    return json_build_object('status','error','message','İhale aktif değil');
  end if;
  if v_auction.ends_at <= now() then
    return json_build_object('status','error','message','İhale bitti');
  end if;
  if (v_auction.ends_at - now())
       <= interval '1 second' * coalesce(v_auction.anti_sniping_threshold_seconds, 120)
  then
    update public.auctions
      set ends_at = ends_at
        + interval '1 second' * coalesce(v_auction.anti_sniping_extend_seconds, 120)
      where id = p_auction_id
      returning * into v_auction;
    v_sniping_extended := true;
  end if;
  if v_auction.ends_at <= now() then
    return json_build_object('status','error','message','İhale bitti');
  end if;
  v_min_increment := coalesce(v_auction.minimum_increment_try, 100);
  if p_amount < coalesce(v_auction.current_high_bid_try, 0) + v_min_increment then
    return json_build_object('status','error','message','Teklif çok düşük');
  end if;
  v_bond_try := round(p_amount * v_bond_rate, 2);
  insert into public.bids (auction_id, bidder_id, amount_try, idempotency_key)
    values (p_auction_id, v_bidder, p_amount, p_idempotency_key);
  update public.bid_bonds
    set amount_try = v_bond_try,
        bid_amount_try = p_amount,
        status = 'held',
        updated_at = now()
    where auction_id = p_auction_id
      and bidder_id = v_bidder;
  update public.auctions
    set current_high_bid_try = p_amount,
        current_high_bidder_id = v_bidder,
        bid_count = bid_count + 1
    where id = p_auction_id;
  return json_build_object(
    'status','ok',
    'amount', p_amount,
    'bond_try', v_bond_try,
    'ends_at', v_auction.ends_at,
    'anti_sniping_extended', v_sniping_extended
  );
end;
$fn$;

grant execute on function public.place_bid(uuid, numeric, text) to authenticated;

-- Mahsup + komisyon kaydı RPC (KOMİSYON %2 + %2 matrah)
create or replace function public.calculate_commission_with_offset(
  p_auction_id uuid,
  p_sale_amount numeric
) returns json
language plpgsql
security definer
set search_path = public
as $fn$
declare
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
  v_commission_rate numeric := 0.02;
  v_vat_rate numeric := 0.20;
  v_record_id uuid;
begin
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

grant execute on function public.calculate_commission_with_offset(uuid, numeric) to service_role;

-- ===== v6 SON =====
```

