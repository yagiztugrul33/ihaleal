-- ════════════════════════════════════════════════════════════════════════════
-- FAZ 2 — TEMEL VERİ MODELİ
-- Hedef: production wsjifesrdaeorrdzbvmk
-- Migrationlar (4):
--   (1) 20260516120001_v2_core_safety_additive.sql  [idempotent; production'da uygulanmış, sadece tracking eksik]
--   (2) 20260516120100_v2_multi_tenant.sql         [organizations VAR; kalan parçalar IF NOT EXISTS]
--   (3) 20260516120200_v2_liquidity.sql            [yeni — buyer_preferences, watchlist, listing_matches, notifications, commission_campaigns]
--   (4) 20260516120300_v2_kyc_moderation_bulk.sql  [yeni — kyc_verifications, moderation_queue, bulk_jobs, events, corporate_leads]
-- Risk: 🟡 ORTA (multi-tenant kısmen uygulanmış; tüm CREATE'ler IF NOT EXISTS / OR REPLACE → idempotent)
-- Süre: 5-10 dakika
-- Bağımlılık: yok (Faz 1'den bağımsız)
-- ────────────────────────────────────────────────────────────────────────────
-- KIRILMA ANALİZİ:
--   - v2_core: zaten uygulanmış (idempotency_keys, rate_limit_buckets, rl_consume var) → no-op
--   - v2_multi_tenant: organizations zaten var; organization_members/listings.organization_id/current_org_id/has_org_role yeni
--     RLS policy "org_select_member" referans alır organization_members → bu adımda ekleniyor ✅
--     useActiveOrg.ts + useOrgPermissions.ts hook'ları current_org_id() çağırıyor → bu adımdan sonra ÇALIŞIR
--   - v2_liquidity: tamamen yeni; mevcut hiçbir tabloyu etkilemez
--   - v2_kyc_moderation_bulk: organization_id FK'leri organizations'a → v2_multi_tenant ÖNCE yapılmalı (dosya içinde sırayla bu yapıdadır)
--     CorporateContact.tsx (corporate_leads), OrganizationDashboard.tsx (org_dashboard_stats) → bu adımdan sonra ÇALIŞIR
-- ────────────────────────────────────────────────────────────────────────────
-- NOT: Atomic — tüm 4 migration tek BEGIN/COMMIT. Biri fail ederse hepsi rollback.
-- Migration dosyalarındaki begin/commit ifadeleri kaldırıldı (iç-içe transaction olmaması için).
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ════════════ MIGRATION 1: v2_core_safety_additive (idempotent re-apply) ════════════
create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists public.idempotency_keys (
  key            text primary key,
  user_id        uuid not null,
  endpoint       text not null,
  request_hash   text not null,
  response       jsonb,
  status_code    int,
  created_at     timestamptz not null default now(),
  expires_at     timestamptz not null default (now() + interval '24 hours')
);
create index if not exists idem_expires_idx on public.idempotency_keys (expires_at);
alter table public.idempotency_keys enable row level security;

create table if not exists public.rate_limit_buckets (
  bucket_key   text primary key,
  tokens       numeric not null,
  capacity     numeric not null,
  refill_rate  numeric not null,
  last_refill  timestamptz not null default now()
);

create or replace function public.rl_consume(
  p_key text, p_capacity numeric, p_refill_rate numeric, p_cost numeric default 1
) returns boolean
language plpgsql security definer set search_path = public as $rlc$
declare v_tokens numeric; v_last timestamptz; v_now timestamptz := clock_timestamp();
begin
  insert into rate_limit_buckets(bucket_key, tokens, capacity, refill_rate)
    values (p_key, p_capacity, p_capacity, p_refill_rate) on conflict do nothing;
  select tokens, last_refill into v_tokens, v_last from rate_limit_buckets where bucket_key = p_key for update;
  v_tokens := least(p_capacity, v_tokens + extract(epoch from (v_now - v_last)) * p_refill_rate);
  if v_tokens < p_cost then
    update rate_limit_buckets set tokens = v_tokens, last_refill = v_now where bucket_key = p_key;
    return false;
  end if;
  update rate_limit_buckets set tokens = v_tokens - p_cost, last_refill = v_now,
    capacity = p_capacity, refill_rate = p_refill_rate where bucket_key = p_key;
  return true;
end $rlc$;
grant execute on function public.rl_consume(text, numeric, numeric, numeric) to authenticated, service_role;

create or replace function public.write_audit_v2(
  p_action text, p_entity_type text, p_entity_id text, p_diff jsonb default null
) returns void language plpgsql security definer set search_path = public as $wav2$
begin
  insert into public.audit_log(actor_id, action, entity_type, entity_id, payload)
  values (
    auth.uid(), p_action, p_entity_type,
    nullif(p_entity_id, '')::uuid,
    coalesce(p_diff, '{}'::jsonb)
  );
exception when others then null;
end $wav2$;
grant execute on function public.write_audit_v2(text, text, text, jsonb) to authenticated, service_role;

-- ════════════ MIGRATION 2: v2_multi_tenant ════════════
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $tgu$
begin new.updated_at = now(); return new; end $tgu$;

create table if not exists public.organizations (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  legal_name      text not null,
  display_name    text not null,
  org_type        text not null check (org_type in ('agency','gyo','contractor','bank','other')),
  plan            text not null default 'free' check (plan in ('free','agency','gyo','enterprise')),
  kyc_status      text not null default 'pending' check (kyc_status in ('pending','in_review','verified','rejected','suspended')),
  tax_number      text,
  contact_email   citext,
  settings        jsonb not null default '{}'::jsonb,
  ai_quota_monthly int not null default 200,
  ai_used_this_period int not null default 0,
  period_started_at timestamptz not null default date_trunc('month', now()),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ⚠ PRODUCTION ÖNDEN-VAROLAN ORG TABLE PATCH (CREATE TABLE IF NOT EXISTS skipped on existing table)
-- Production'daki organizations tablosunda EKSİK olan 3 kolon: tax_number, settings, period_started_at
-- consume_ai_quota fonksiyonu period_started_at'a runtime'da referans verir → MUTLAKA eklenmeli
alter table public.organizations
  add column if not exists tax_number text,
  add column if not exists settings jsonb not null default '{}'::jsonb,
  add column if not exists period_started_at timestamptz not null default date_trunc('month', now());

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null check (role in ('owner','admin','manager','agent','viewer')),
  status          text not null default 'active' check (status in ('active','invited','suspended','removed')),
  joined_at       timestamptz default now(),
  primary key (organization_id, user_id)
);
create index if not exists om_user_idx on public.organization_members(user_id) where status = 'active';

alter table public.listings add column if not exists organization_id uuid references public.organizations(id);
alter table public.listings add column if not exists matched_at timestamptz;
create index if not exists listings_org_idx on public.listings(organization_id) where organization_id is not null;

create or replace function public.set_active_org(p_org_id uuid)
returns void language plpgsql security definer set search_path = public as $sao$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'unauthenticated'; end if;
  if p_org_id is not null and not exists (
    select 1 from organization_members where organization_id = p_org_id and user_id = v_user and status = 'active'
  ) then raise exception 'not_a_member'; end if;
  update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb)
    || jsonb_build_object('active_org_id', p_org_id) where id = v_user;
end $sao$;
grant execute on function public.set_active_org(uuid) to authenticated;

create or replace function public.current_org_id() returns uuid language sql stable as $cor$
  select nullif(coalesce(current_setting('request.jwt.claims', true)::jsonb
    -> 'app_metadata' ->> 'active_org_id', ''), '')::uuid
$cor$;

create or replace function public.has_org_role(p_org uuid, p_roles text[]) returns boolean language sql stable as $hor$
  select exists (
    select 1 from organization_members
    where organization_id = p_org and user_id = auth.uid() and status = 'active' and role = any(p_roles)
  )
$hor$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

drop policy if exists "org_select_member" on public.organizations;
create policy "org_select_member" on public.organizations for select using (
  exists (select 1 from organization_members where organization_id = id and user_id = auth.uid() and status = 'active')
);

drop policy if exists "om_select_self_or_member" on public.organization_members;
create policy "om_select_self_or_member" on public.organization_members for select using (
  user_id = auth.uid() or has_org_role(organization_id, array['owner','admin','manager'])
);

create or replace function public.consume_ai_quota(p_org uuid default null, p_count int default 1)
returns boolean language plpgsql security definer set search_path = public as $caq$
declare v_used int; v_quota int; v_period timestamptz;
begin
  if p_org is null then return true; end if;
  select ai_used_this_period, ai_quota_monthly, period_started_at into v_used, v_quota, v_period
    from organizations where id = p_org for update;
  if v_period < date_trunc('month', now()) then
    update organizations set ai_used_this_period = 0, period_started_at = date_trunc('month', now()) where id = p_org;
    v_used := 0;
  end if;
  if v_used + p_count > v_quota then return false; end if;
  update organizations set ai_used_this_period = ai_used_this_period + p_count where id = p_org;
  return true;
end $caq$;
grant execute on function public.consume_ai_quota(uuid, int) to authenticated, service_role;

-- ════════════ MIGRATION 3: v2_liquidity ════════════
create table if not exists public.buyer_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cities text[] not null default '{}',
  districts text[] not null default '{}',
  property_types text[] not null default '{}',
  price_min numeric, price_max numeric,
  is_active boolean not null default true,
  notify_channels text[] not null default '{in_app,email}',
  created_at timestamptz not null default now()
);
alter table public.buyer_preferences enable row level security;
drop policy if exists "bp_owner" on public.buyer_preferences;
create policy "bp_owner" on public.buyer_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.watchlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  price_at_add numeric not null,
  notify_on_drop boolean not null default true,
  drop_threshold_pct numeric not null default 5.0,
  added_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
alter table public.watchlist enable row level security;
drop policy if exists "wl_owner" on public.watchlist;
create policy "wl_owner" on public.watchlist for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.listing_matches (
  id bigserial primary key,
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score numeric not null,
  reason jsonb,
  matched_at timestamptz not null default now(),
  unique (listing_id, user_id)
);
alter table public.listing_matches enable row level security;
drop policy if exists "lm_owner" on public.listing_matches;
create policy "lm_owner" on public.listing_matches for select using (user_id = auth.uid());

create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  channel text not null check (channel in ('in_app','email','push')),
  payload jsonb not null,
  state text not null default 'pending',
  created_at timestamptz not null default now(),
  read_at timestamptz
);
alter table public.notifications enable row level security;
drop policy if exists "notif_owner_select" on public.notifications;
create policy "notif_owner_select" on public.notifications for select using (user_id = auth.uid());

create table if not exists public.commission_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  commission_pct_override numeric not null default 0,
  created_at timestamptz not null default now()
);
alter table public.commission_campaigns enable row level security;
drop policy if exists "cc_public_read" on public.commission_campaigns;
create policy "cc_public_read" on public.commission_campaigns
  for select using (active = true and now() between starts_at and ends_at);

-- ════════════ MIGRATION 4: v2_kyc_moderation_bulk ════════════
create table if not exists public.kyc_verifications (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('individual','organization','property')),
  subject_id uuid not null,
  submitted_by uuid not null references auth.users(id),
  organization_id uuid references public.organizations(id) on delete cascade,
  status text not null default 'in_review',
  documents jsonb not null,
  declared_data jsonb not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.kyc_verifications enable row level security;
drop policy if exists "kyc_submitter_read" on public.kyc_verifications;
create policy "kyc_submitter_read" on public.kyc_verifications for select using (submitted_by = auth.uid());

create table if not exists public.moderation_queue (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.bulk_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  kind text not null,
  status text not null default 'queued',
  input jsonb not null,
  result jsonb,
  created_at timestamptz not null default now()
);
alter table public.bulk_jobs enable row level security;
drop policy if exists "bj_org_read" on public.bulk_jobs;
create policy "bj_org_read" on public.bulk_jobs
  for select using (has_org_role(organization_id, array['owner','admin','manager','agent']));

create table if not exists public.events (
  id bigserial primary key,
  occurred_at timestamptz not null default now(),
  user_id uuid,
  kind text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb
);
create index if not exists ev_entity_time on public.events(entity_type, entity_id, occurred_at desc);

create table if not exists public.corporate_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null,
  role text,
  email text not null,
  phone text,
  org_size text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
alter table public.corporate_leads enable row level security;
drop policy if exists "cl_insert_anyone" on public.corporate_leads;
create policy "cl_insert_anyone" on public.corporate_leads for insert with check (true);

create or replace function public.org_dashboard_stats(p_org uuid)
returns jsonb language plpgsql security invoker set search_path = public as $ods$
begin
  if not has_org_role(p_org, array['owner','admin','manager','agent','viewer']) then
    raise exception 'forbidden';
  end if;
  return jsonb_build_object(
    'total_listings', (select count(*) from listings where organization_id = p_org),
    'active_listings', (select count(*) from listings where organization_id = p_org and status = 'active'),
    'total_views_30d', 0,
    'total_leads_30d', 0,
    'conversion_pct', 0,
    'ai_used', (select ai_used_this_period from organizations where id = p_org),
    'ai_quota', (select ai_quota_monthly from organizations where id = p_org),
    'pending_kyc', (select count(*) from kyc_verifications where organization_id = p_org and status = 'in_review'),
    'open_disputes', 0
  );
end $ods$;
grant execute on function public.org_dashboard_stats(uuid) to authenticated;

-- ════════════ schema_migrations TRACKING (4 satır) ════════════
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES
  ('20260516120001', 'v2_core_safety_additive',
   ARRAY['-- Idempotent re-apply via CLI on 2026-05-27. Originally applied untracked.']::text[]),
  ('20260516120100', 'v2_multi_tenant',
   ARRAY['-- Deployed via CLI on 2026-05-27. organizations was pre-existing; rest added.']::text[]),
  ('20260516120200', 'v2_liquidity',
   ARRAY['-- Deployed via CLI on 2026-05-27. Full new schema.']::text[]),
  ('20260516120300', 'v2_kyc_moderation_bulk',
   ARRAY['-- Deployed via CLI on 2026-05-27. Depends on v2_multi_tenant.organizations.']::text[])
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- SMOKE
-- ════════════════════════════════════════════════════════════════════════════

-- (S1) Tüm yeni tablolar var mı?
SELECT 'S1 tables' AS check,
       string_agg(table_name, ',' ORDER BY table_name) AS present
FROM information_schema.tables
WHERE table_schema='public'
  AND table_name IN ('idempotency_keys','rate_limit_buckets','organizations','organization_members',
                     'buyer_preferences','watchlist','listing_matches','notifications','commission_campaigns',
                     'kyc_verifications','moderation_queue','bulk_jobs','events','corporate_leads');

-- (S2) listings.organization_id kolonu eklendi mi?
SELECT 'S2 listings.organization_id' AS check,
       EXISTS(SELECT 1 FROM information_schema.columns
              WHERE table_schema='public' AND table_name='listings' AND column_name='organization_id') AS exists;

-- (S2b) organizations'a eksik 3 kolon eklendi mi? (production önden-vardı)
SELECT 'S2b organizations missing cols patched' AS check,
       string_agg(column_name, ',' ORDER BY column_name) AS patched_cols
FROM information_schema.columns
WHERE table_schema='public' AND table_name='organizations'
  AND column_name IN ('tax_number','settings','period_started_at');

-- (S3) Tüm yeni fonksiyonlar var mı?
SELECT 'S3 functions' AS check,
       string_agg(proname, ',' ORDER BY proname) AS present
FROM pg_proc
WHERE pronamespace='public'::regnamespace
  AND proname IN ('set_active_org','current_org_id','has_org_role','consume_ai_quota','org_dashboard_stats','tg_set_updated_at');

-- (S4) RLS açık mı?
SELECT 'S4 RLS enabled' AS check,
       string_agg(c.relname, ',' ORDER BY c.relname) AS rls_on_tables
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname='public' AND c.relrowsecurity=true
  AND c.relname IN ('organizations','organization_members','buyer_preferences','watchlist',
                    'listing_matches','notifications','commission_campaigns','kyc_verifications',
                    'bulk_jobs','corporate_leads','idempotency_keys');

-- (S5) schema_migrations'a 4 yeni satır eklendi mi?
SELECT 'S5 new tracking rows' AS check,
       string_agg(version || ':' || name, ', ' ORDER BY version) AS new_versions
FROM supabase_migrations.schema_migrations
WHERE version IN ('20260516120001','20260516120100','20260516120200','20260516120300');

-- (S6) REGRESSION — KYC guard + bids RLS hâlâ çalışıyor mu?
DO $$
DECLARE v_result json;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-aaaa-bbbb-cccc-000000000002', true);
  SELECT public.execute_buy_now(gen_random_uuid(), gen_random_uuid(), 'smoke-phase2') INTO v_result;
  IF v_result->>'code' = 'kyc_required' THEN
    RAISE NOTICE 'S6 REGRESSION OK — KYC guard still works';
  ELSE
    RAISE EXCEPTION 'S6 REGRESSION FAIL — expected kyc_required, got %', v_result;
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════════
-- REVERSE (sadece acil — yorumda)
-- ════════════════════════════════════════════════════════════════════════════
/*
-- DİKKAT: DROP TABLE veri kaybına yol açabilir. Sadece henüz veri yokken çalıştır.
BEGIN;

-- v2_kyc_moderation_bulk reverse
drop function if exists public.org_dashboard_stats(uuid);
drop table if exists public.corporate_leads;
drop table if exists public.events;
drop table if exists public.bulk_jobs;
drop table if exists public.moderation_queue;
drop table if exists public.kyc_verifications;

-- v2_liquidity reverse
drop table if exists public.commission_campaigns;
drop table if exists public.notifications;
drop table if exists public.listing_matches;
drop table if exists public.watchlist;
drop table if exists public.buyer_preferences;

-- v2_multi_tenant reverse (BE CAREFUL — listings.organization_id veri içerebilir)
drop function if exists public.consume_ai_quota(uuid, int);
drop function if exists public.has_org_role(uuid, text[]);
drop function if exists public.current_org_id();
drop function if exists public.set_active_org(uuid);
alter table public.listings drop column if exists matched_at;
alter table public.listings drop column if exists organization_id;
drop table if exists public.organization_members;
-- ⚠ organizations tablosu yine kalabilir (daha önceden vardı)

-- v2_core_safety_additive NO reverse — idempotent re-apply, original state korunur

DELETE FROM supabase_migrations.schema_migrations
WHERE version IN ('20260516120001','20260516120100','20260516120200','20260516120300');

COMMIT;
*/
