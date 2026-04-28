-- ihaleal.com initial schema (tur #9)
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text unique,
  email text,
  kyc_status text not null default 'none'
    check (kyc_status in ('none','pending','verified','rejected')),
  flows jsonb not null default '[]'::jsonb,
  findeks_score int not null default 720,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id),
  title text not null,
  body jsonb,
  category text not null default 'real_estate',
  city text,
  district text,
  start_price_try numeric(14,2) not null check (start_price_try > 0),
  reserve_price_try numeric(14,2),
  status text not null default 'draft'
    check (status in ('draft','review','active','closed','cancelled')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists listings_seller_idx on public.listings(seller_id);
create index if not exists listings_status_idx on public.listings(status);

create table if not exists public.auctions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  current_high_bid_try numeric(14,2),
  current_high_bidder_id uuid references public.profiles(id),
  bid_count int not null default 0,
  status text not null default 'scheduled'
    check (status in ('scheduled','live','ended','cancelled')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists auctions_listing_idx on public.auctions(listing_id);
create index if not exists auctions_status_idx on public.auctions(status);

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id),
  bidder_id uuid not null references public.profiles(id),
  amount_try numeric(14,2) not null check (amount_try > 0),
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (auction_id, bidder_id, idempotency_key)
);
create index if not exists bids_auction_amount_idx
  on public.bids(auction_id, amount_try desc);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id),
  payer_id uuid not null references public.profiles(id),
  amount_try numeric(14,2) not null,
  provider text not null,
  provider_ref text,
  status text not null default 'pending'
    check (status in ('pending','held','released','refunded','failed')),
  held_until timestamptz,
  released_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  doc_type text not null,
  file_path text not null,
  file_size_bytes bigint,
  status text not null default 'pending'
    check (status in ('pending','verified','rejected')),
  created_at timestamptz not null default now()
);

-- Yeni auth kullanıcısı → profil satırı
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$fn$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
