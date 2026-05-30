-- M7 — Teklif / pazarlık katmanı (açık artırma place-bid'den ayrı)
-- CC-apply: Claude Code canlı Supabase'e uygulayacak

begin;

create table if not exists public.listing_offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  amount_try numeric(14, 2) not null check (amount_try > 0),
  counter_amount_try numeric(14, 2) check (counter_amount_try is null or counter_amount_try > 0),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'countered')),
  is_sealed boolean not null default false,
  sealed_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_listing_offers_listing
  on public.listing_offers (listing_id, created_at desc);

create index if not exists idx_listing_offers_buyer
  on public.listing_offers (buyer_id, created_at desc);

create or replace function public.tg_listing_offers_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listing_offers_set_updated_at on public.listing_offers;
create trigger listing_offers_set_updated_at
  before update on public.listing_offers
  for each row execute function public.tg_listing_offers_updated_at();

alter table public.listing_offers enable row level security;

drop policy if exists "listing_offers_select_buyer" on public.listing_offers;
create policy "listing_offers_select_buyer"
  on public.listing_offers
  for select
  to authenticated
  using (buyer_id = auth.uid());

drop policy if exists "listing_offers_select_seller" on public.listing_offers;
create policy "listing_offers_select_seller"
  on public.listing_offers
  for select
  to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

drop policy if exists "listing_offers_insert_buyer" on public.listing_offers;
create policy "listing_offers_insert_buyer"
  on public.listing_offers
  for insert
  to authenticated
  with check (
    buyer_id = auth.uid()
    and exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.status in ('active', 'closed')
        and l.seller_id <> auth.uid()
    )
  );

drop policy if exists "listing_offers_update_seller" on public.listing_offers;
create policy "listing_offers_update_seller"
  on public.listing_offers
  for update
  to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

grant select, insert, update on public.listing_offers to authenticated;

commit;

select count(*) as listing_offers_policy_count
from pg_policies
where schemaname = 'public' and tablename = 'listing_offers';
