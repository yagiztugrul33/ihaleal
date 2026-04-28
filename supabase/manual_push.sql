-- ihaleal.com — birleşik migration
-- Tarih: 2026-04-28T11:01:30.688Z

-- ===== 20260428120000_initial_schema.sql =====
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


-- ===== 20260428120100_rls_policies.sql =====
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.auctions enable row level security;
alter table public.bids enable row level security;
alter table public.payments enable row level security;
alter table public.documents enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "listings_select_active" on public.listings;
create policy "listings_select_active" on public.listings
  for select using (status in ('active','closed') or auth.uid() = seller_id);

drop policy if exists "listings_insert_kyc" on public.listings;
create policy "listings_insert_kyc" on public.listings
  for insert with check (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and kyc_status = 'verified'
    )
  );

drop policy if exists "listings_update_own" on public.listings;
create policy "listings_update_own" on public.listings
  for update using (auth.uid() = seller_id);

drop policy if exists "auctions_select_public" on public.auctions;
create policy "auctions_select_public" on public.auctions
  for select using (status != 'draft');

drop policy if exists "bids_select_public" on public.bids;
create policy "bids_select_public" on public.bids
  for select using (true);

drop policy if exists "payments_select_self" on public.payments;
create policy "payments_select_self" on public.payments
  for select using (auth.uid() = payer_id);

drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own" on public.documents
  for select using (auth.uid() = owner_id);

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = owner_id);

drop policy if exists "documents_admin_all" on public.documents;
create policy "documents_admin_all" on public.documents
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );


-- ===== 20260428120200_place_bid_function.sql =====
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
  v_min_increment numeric := 100;
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
  if v_auction.ends_at < now() then
    return json_build_object('status','error','message','İhale bitti');
  end if;
  if p_amount < coalesce(v_auction.current_high_bid_try, 0) + v_min_increment then
    return json_build_object('status','error','message','Teklif çok düşük');
  end if;

  insert into public.bids (auction_id, bidder_id, amount_try, idempotency_key)
    values (p_auction_id, v_bidder, p_amount, p_idempotency_key);
  update public.auctions
    set current_high_bid_try = p_amount,
        current_high_bidder_id = v_bidder,
        bid_count = bid_count + 1
    where id = p_auction_id;

  return json_build_object('status','ok','amount',p_amount);
end;
$fn$;

grant execute on function public.place_bid(uuid, numeric, text) to authenticated;


