-- ihaleal.com — TUR #14 manuel SQL (Supabase SQL Editor → Run)
-- Önce `manual_push_v3.sql` uygulanmış olmalı (veya eşdeğer migrasyonlar).

-- ─────────────────────────────────────────────────────────────────────────────
-- audit_log (20260429120300_audit_log.sql ile aynı gövde — idempotent)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);
create index if not exists audit_log_entity_idx on public.audit_log (entity_type, entity_id);

alter table public.audit_log enable row level security;

drop policy if exists "audit_log_admin_select" on public.audit_log;
create policy "audit_log_admin_select" on public.audit_log
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Admin — tüm ilanları görme + güncelleme (onay akışı)
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "listings_select_admin" on public.listings;
create policy "listings_select_admin" on public.listings
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
    )
  );

drop policy if exists "listings_update_admin" on public.listings;
create policy "listings_update_admin" on public.listings
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Admin — kullanıcı listesi (profiles okuma)
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
    )
  );
