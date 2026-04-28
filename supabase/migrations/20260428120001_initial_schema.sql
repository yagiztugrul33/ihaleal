-- ihaleal.com — tur #5 şema taslağı (K3=Supabase). auth.users ile hizalı profil + ilan/ihale/teklif/ödeme/belge.
-- Uzak projeye uygulama: K12 + `npx supabase link` + `db push` (Cursor ön koşul sağlanınca).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles (auth.users ile 1-1)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  phone text,
  is_demo boolean not null default true,
  user_flows jsonb not null default '[]'::jsonb,
  kyc_verified boolean not null default false,
  findeks_score int not null default 720,
  created_at timestamptz not null default now()
);

create index if not exists profiles_kyc_idx on public.profiles (kyc_verified) where kyc_verified = true;

-- Yeni auth kullanıcısı → profil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- listings
-- ---------------------------------------------------------------------------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'active', 'closed')),
  is_demo boolean not null default true,
  title text not null,
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_owner_status_idx on public.listings (owner_id, status);

-- ---------------------------------------------------------------------------
-- auctions
-- ---------------------------------------------------------------------------
create table if not exists public.auctions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'live', 'ended', 'cancelled')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  current_high numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists auctions_listing_idx on public.auctions (listing_id);
create index if not exists auctions_live_idx on public.auctions (ends_at) where status = 'live';

-- ---------------------------------------------------------------------------
-- bids (idempotency_key tekil — çift gönderim güvenli)
-- ---------------------------------------------------------------------------
create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions (id) on delete cascade,
  bidder_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  constraint bids_idempotency_key_unique unique (idempotency_key)
);

create index if not exists bids_auction_amount_desc_idx on public.bids (auction_id, amount desc);

-- ---------------------------------------------------------------------------
-- payments (escrow durumu)
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  escrow_status text not null default 'none' check (escrow_status in ('none', 'held', 'released', 'disputed')),
  amount numeric(14, 2) not null,
  currency text not null default 'TRY',
  created_at timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id);

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,
  mime text,
  label text,
  created_at timestamptz not null default now()
);

create index if not exists documents_user_idx on public.documents (user_id);
