-- pre_launch_signups — lansman email (TUR #22)

create table if not exists public.pre_launch_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  phone text,
  source text default 'website',
  created_at timestamptz not null default now()
);

create index if not exists pre_launch_signups_email_idx on public.pre_launch_signups (email);

alter table public.pre_launch_signups enable row level security;

drop policy if exists "pre_launch_insert_anon" on public.pre_launch_signups;
create policy "pre_launch_insert_anon" on public.pre_launch_signups
  for insert
  with check (true);

drop policy if exists "pre_launch_select_admin" on public.pre_launch_signups;
create policy "pre_launch_select_admin" on public.pre_launch_signups
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

grant insert on public.pre_launch_signups to anon;
grant insert on public.pre_launch_signups to authenticated;
