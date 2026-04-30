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
