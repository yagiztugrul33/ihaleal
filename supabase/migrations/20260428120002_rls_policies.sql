-- RLS — tur #5. service_role RLS’yi bypass eder; Edge Function sırları repoda yok.

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.auctions enable row level security;
alter table public.bids enable row level security;
alter table public.payments enable row level security;
alter table public.documents enable row level security;

-- profiles: kendi satırı + aktif ilanı olan sahibin kısıtlı görünürlüğü (id eşleşmesi)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_select_as_listing_owner_public" on public.profiles;
create policy "profiles_select_as_listing_owner_public"
  on public.profiles for select
  using (
    exists (
      select 1 from public.listings l
      where l.owner_id = profiles.id
        and l.status = 'active'
    )
  );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- listings: taslak/aktif/kapalı seçimi — sahibi tüm durumları okur; herkes aktif/kapalı okur
drop policy if exists "listings_select_public_active_closed" on public.listings;
create policy "listings_select_public_active_closed"
  on public.listings for select
  using (status in ('active', 'closed'));

drop policy if exists "listings_select_own_drafts" on public.listings;
create policy "listings_select_own_drafts"
  on public.listings for select
  using (auth.uid() = owner_id);

drop policy if exists "listings_insert_kyc" on public.listings;
create policy "listings_insert_kyc"
  on public.listings for insert
  with check (
    auth.uid() = owner_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.kyc_verified = true or p.is_demo = true)
    )
  );

drop policy if exists "listings_update_own" on public.listings;
create policy "listings_update_own"
  on public.listings for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- auctions: canlı/zamanlanmış/ bitmiş seç — taslak yalnızca ilan sahibi zincirinden (listing owner)
drop policy if exists "auctions_select_non_draft_or_owner" on public.auctions;
create policy "auctions_select_non_draft_or_owner"
  on public.auctions for select
  using (
    status is distinct from 'draft'
    or exists (
      select 1 from public.listings l
      where l.id = auctions.listing_id
        and l.owner_id = auth.uid()
    )
  );

drop policy if exists "auctions_no_client_mutate" on public.auctions;
create policy "auctions_no_client_mutate"
  on public.auctions for insert
  with check (false);

drop policy if exists "auctions_no_client_update" on public.auctions;
create policy "auctions_no_client_update"
  on public.auctions for update
  using (false);

-- bids: herkes (authenticated) açık artırmada teklifleri okuyabilir; doğrudan insert yok (yalnız RPC)
drop policy if exists "bids_select_when_auction_visible" on public.bids;
create policy "bids_select_when_auction_visible"
  on public.bids for select
  using (
    exists (
      select 1 from public.auctions a
      where a.id = bids.auction_id
        and a.status in ('live', 'ended', 'scheduled')
    )
  );

drop policy if exists "bids_no_direct_insert" on public.bids;
create policy "bids_no_direct_insert"
  on public.bids for insert
  with check (false);

drop policy if exists "bids_no_direct_update" on public.bids;
create policy "bids_no_direct_update"
  on public.bids for update
  using (false);

-- payments: yalnız kendi satırları
drop policy if exists "payments_select_self" on public.payments;
create policy "payments_select_self"
  on public.payments for select
  using (auth.uid() = user_id);

drop policy if exists "payments_no_direct_mutate" on public.payments;
create policy "payments_no_direct_mutate"
  on public.payments for insert
  with check (false);

drop policy if exists "payments_no_direct_update" on public.payments;
create policy "payments_no_direct_update"
  on public.payments for update
  using (false);

-- documents: sahibi
drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own"
  on public.documents for select
  using (auth.uid() = user_id);

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own"
  on public.documents for insert
  with check (auth.uid() = user_id);

drop policy if exists "documents_update_own" on public.documents;
create policy "documents_update_own"
  on public.documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own"
  on public.documents for delete
  using (auth.uid() = user_id);
