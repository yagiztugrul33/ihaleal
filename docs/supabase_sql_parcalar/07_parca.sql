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
