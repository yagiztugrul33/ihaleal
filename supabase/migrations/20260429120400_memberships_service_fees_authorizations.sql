-- Üyelik, hizmet bedeli, yetki, komisyon ve emlakçı performans tabloları
-- Not: authorizations.agent_role için CHECK içinde NULL doğrudan IN listesinde kullanılamaz.

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

-- RLS
alter table public.memberships enable row level security;
alter table public.service_fees enable row level security;
alter table public.authorizations enable row level security;
alter table public.commission_records enable row level security;
alter table public.agent_performance enable row level security;

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
