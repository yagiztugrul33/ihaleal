-- S3 — Borsa terminali: price_index + transaction_stats (idempotent)
-- Kaynak: _audit/templates/S3_BORSA_FRONTEND_TASLAK.md, src/borsa/useLiveMarket.ts
-- RLS: anon/authenticated SELECT (public terminal); write yalnız service_role + admin ETL

begin;

-- ── price_index ─────────────────────────────────────────────────────────────

create table if not exists public.price_index (
  id uuid primary key default gen_random_uuid(),
  index_date date not null,
  region_code text not null,
  segment text not null default 'konut'
    check (segment in ('konut', 'arsa', 'ticari', 'turizm')),
  source text not null default 'platform'
    check (source in ('platform', 'tcmb_kfe', 'tcmb_yiufe')),
  index_value numeric not null,
  change_pct numeric,
  series_code text,
  created_at timestamptz not null default now(),
  unique (region_code, index_date, segment, source)
);

create index if not exists idx_price_index_region_date
  on public.price_index (region_code, index_date desc);

-- ── transaction_stats ───────────────────────────────────────────────────────

create table if not exists public.transaction_stats (
  id uuid primary key default gen_random_uuid(),
  stat_date date not null,
  region_code text not null,
  volume_try numeric not null default 0,
  trade_count int not null default 0,
  active_listings int not null default 0,
  avg_price_try numeric,
  created_at timestamptz not null default now(),
  unique (region_code, stat_date)
);

create index if not exists idx_transaction_stats_region_date
  on public.transaction_stats (region_code, stat_date desc);

-- ── RLS ─────────────────────────────────────────────────────────────────────

alter table public.price_index enable row level security;
alter table public.transaction_stats enable row level security;

drop policy if exists "price_index_select_public" on public.price_index;
create policy "price_index_select_public"
  on public.price_index
  for select
  to anon, authenticated
  using (true);

drop policy if exists "price_index_write_service_role" on public.price_index;
create policy "price_index_write_service_role"
  on public.price_index
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "price_index_write_admin" on public.price_index;
create policy "price_index_write_admin"
  on public.price_index
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (p.is_admin = true or p.role = 'admin')
    )
  );

drop policy if exists "price_index_update_admin" on public.price_index;
create policy "price_index_update_admin"
  on public.price_index
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (p.is_admin = true or p.role = 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (p.is_admin = true or p.role = 'admin')
    )
  );

drop policy if exists "transaction_stats_select_public" on public.transaction_stats;
create policy "transaction_stats_select_public"
  on public.transaction_stats
  for select
  to anon, authenticated
  using (true);

drop policy if exists "transaction_stats_write_service_role" on public.transaction_stats;
create policy "transaction_stats_write_service_role"
  on public.transaction_stats
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "transaction_stats_write_admin" on public.transaction_stats;
create policy "transaction_stats_write_admin"
  on public.transaction_stats
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (p.is_admin = true or p.role = 'admin')
    )
  );

drop policy if exists "transaction_stats_update_admin" on public.transaction_stats;
create policy "transaction_stats_update_admin"
  on public.transaction_stats
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (p.is_admin = true or p.role = 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (p.is_admin = true or p.role = 'admin')
    )
  );

-- ── Grants ──────────────────────────────────────────────────────────────────

grant select on public.price_index to anon, authenticated;
grant all on public.price_index to service_role;

grant select on public.transaction_stats to anon, authenticated;
grant all on public.transaction_stats to service_role;

commit;

-- ── Doğrulama (apply sonrası çıktı) ─────────────────────────────────────────

select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('price_index', 'transaction_stats')
order by c.relname;

select
  tablename,
  count(*) as policy_count
from pg_policies
where schemaname = 'public'
  and tablename in ('price_index', 'transaction_stats')
group by tablename
order by tablename;
