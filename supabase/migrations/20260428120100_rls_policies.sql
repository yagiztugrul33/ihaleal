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
