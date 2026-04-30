  for insert with check (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kyc_status = 'verified'
        and coalesce(p.e_devlet_status, 'none') = 'verified'
    )
  );

-- ===== v3 SON =====

-- ===== v4 BAŞLANGIÇ =====

-- audit_log
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

-- Admin politikaları
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

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and (p.is_admin = true or p.role = 'admin')
    )
  );

-- ===== v4 SON =====

-- ===== v5 BAŞLANGIÇ =====

-- memberships
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null
    check (type in (
      'seller_yearly',
      'buyer_yearly',
      'agent_referral',
      'agent_portfolio',
      'agent_full'
    )),
  amount_paid_try numeric(14,2) not null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'active'
    check (status in ('active','expired','cancelled')),
  iyzico_ref text,
  created_at timestamptz not null default now()
);

create index if not exists memberships_user_idx on public.memberships(user_id);
create index if not exists memberships_expires_idx on public.memberships(expires_at);

-- service_fees
create table if not exists public.service_fees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
