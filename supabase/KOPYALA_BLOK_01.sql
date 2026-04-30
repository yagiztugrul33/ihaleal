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
