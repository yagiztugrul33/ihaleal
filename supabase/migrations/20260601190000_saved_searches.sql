-- M10 — Kayıtlı arama + alarm (saved_searches)
-- CC-apply: Claude Code canlı Supabase'e uygulayacak

begin;

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  query_text text not null default '',
  city text,
  category text,
  price_min numeric(14, 2),
  price_max numeric(14, 2),
  sort_key text,
  criteria jsonb not null default '{}'::jsonb,
  last_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_saved_searches_user
  on public.saved_searches (user_id, created_at desc);

create or replace function public.tg_saved_searches_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists saved_searches_set_updated_at on public.saved_searches;
create trigger saved_searches_set_updated_at
  before update on public.saved_searches
  for each row execute function public.tg_saved_searches_updated_at();

alter table public.saved_searches enable row level security;

drop policy if exists "saved_searches_owner" on public.saved_searches;
create policy "saved_searches_owner"
  on public.saved_searches
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.saved_searches to authenticated;

-- İstemci kayıtlı arama eşleşmesinde kendi bildirimini yazabilsin (user_id = auth.uid())
drop policy if exists "notif_owner_insert" on public.notifications;
create policy "notif_owner_insert"
  on public.notifications
  for insert
  to authenticated
  with check (user_id = auth.uid());

commit;

select count(*) as saved_searches_policy_count
from pg_policies
where schemaname = 'public' and tablename = 'saved_searches';
