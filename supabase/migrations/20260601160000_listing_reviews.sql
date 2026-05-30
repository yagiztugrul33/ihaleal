-- M2 — Alıcı/satıcı karşılıklı puan ve yorum
-- CC-apply: Claude Code canlı Supabase'e uygulayacak

begin;

create table if not exists public.listing_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewed_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (listing_id, reviewer_id),
  check (reviewer_id <> reviewed_id)
);

create index if not exists idx_listing_reviews_reviewed
  on public.listing_reviews (reviewed_id, created_at desc);

create index if not exists idx_listing_reviews_listing
  on public.listing_reviews (listing_id, created_at desc);

alter table public.listing_reviews enable row level security;

drop policy if exists "listing_reviews_select_public" on public.listing_reviews;
create policy "listing_reviews_select_public"
  on public.listing_reviews
  for select
  to anon, authenticated
  using (true);

drop policy if exists "listing_reviews_insert_self" on public.listing_reviews;
create policy "listing_reviews_insert_self"
  on public.listing_reviews
  for insert
  to authenticated
  with check (
    reviewer_id = auth.uid()
    and reviewer_id <> reviewed_id
  );

drop policy if exists "listing_reviews_update_self" on public.listing_reviews;
create policy "listing_reviews_update_self"
  on public.listing_reviews
  for update
  to authenticated
  using (reviewer_id = auth.uid())
  with check (reviewer_id = auth.uid());

grant select on public.listing_reviews to anon, authenticated;
grant insert, update on public.listing_reviews to authenticated;

commit;

select count(*) as listing_reviews_policy_count
from pg_policies
where schemaname = 'public' and tablename = 'listing_reviews';
