-- N20 — Geofence konum bildirimi (R13.1)
-- CC-apply: Claude Code canlı Supabase'e uygulayacak

begin;

create table if not exists public.user_geofence_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  consent_at timestamptz,
  radius_meters int not null default 800 check (radius_meters between 100 and 5000),
  deal_filter text not null default 'all' check (deal_filter in ('all', 'sale', 'rent')),
  browser_push_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.geofence_alert_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null,
  alerted_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index if not exists idx_geofence_alert_log_user
  on public.geofence_alert_log (user_id, alerted_at desc);

alter table public.user_geofence_preferences enable row level security;
alter table public.geofence_alert_log enable row level security;

drop policy if exists "geofence_prefs_owner" on public.user_geofence_preferences;
create policy "geofence_prefs_owner"
  on public.user_geofence_preferences
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "geofence_log_owner" on public.geofence_alert_log;
create policy "geofence_log_owner"
  on public.geofence_alert_log
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.user_geofence_preferences to authenticated;
grant select, insert on public.geofence_alert_log to authenticated;

commit;

select tablename from pg_tables where schemaname = 'public' and tablename like 'geofence%';
