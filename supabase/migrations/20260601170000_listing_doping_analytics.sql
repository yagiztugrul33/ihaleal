-- M4 — Doping (is_featured, featured_badge) + görüntülenme sayacı
-- CC-apply: Claude Code canlı Supabase'e uygulayacak

begin;

alter table public.listings
  add column if not exists is_featured boolean not null default false;

alter table public.listings
  add column if not exists featured_badge text
    check (featured_badge is null or featured_badge in ('urgent', 'opportunity', 'price_drop'));

alter table public.listings
  add column if not exists view_count int not null default 0;

create index if not exists idx_listings_featured
  on public.listings (is_featured desc, created_at desc)
  where is_featured = true;

create or replace function public.increment_listing_view(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_listing_id is null then
    return;
  end if;
  update public.listings
  set view_count = view_count + 1
  where id = p_listing_id
    and status in ('active', 'closed', 'review');
end;
$$;

revoke all on function public.increment_listing_view(uuid) from public;
grant execute on function public.increment_listing_view(uuid) to anon, authenticated, service_role;

commit;

select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'listings'
  and column_name in ('is_featured', 'featured_badge', 'view_count')
order by column_name;
