-- ═══════════════════════════════════════════════════════════════════════════
-- ihaleal.com — TEK DOSYA (tüm migration’lar birleşik)
-- Oluşturulma: 2026-04-30T16:05:04.330Z
-- Kaynak: supabase/migrations/ (13 dosya)
--
-- NASIL KULLANILIR
-- 1) Boş / yeni bir Supabase projesinde: içeriğin TAMAMINI SQL Editor’da bir kez Run.
-- 2) Veritabanında zaten bu şema varsa TEKRAR ÇALIŞTIRMA — "already exists" hataları normaldir.
--    O zaman sadece eksik migration dosyalarını tek tek uygula.
-- ═══════════════════════════════════════════════════════════════════════════


-- ═══ 20260428120000_initial_schema.sql ═══

-- ihaleal.com initial schema (tur #9)
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text unique,
  email text,
  kyc_status text not null default 'none'
    check (kyc_status in ('none','pending','verified','rejected')),
  flows jsonb not null default '[]'::jsonb,
  findeks_score int not null default 720,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id),
  title text not null,
  body jsonb,
  category text not null default 'real_estate',
  city text,
  district text,
  start_price_try numeric(14,2) not null check (start_price_try > 0),
  reserve_price_try numeric(14,2),
  status text not null default 'draft'
    check (status in ('draft','review','active','closed','cancelled')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists listings_seller_idx on public.listings(seller_id);
create index if not exists listings_status_idx on public.listings(status);

create table if not exists public.auctions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  current_high_bid_try numeric(14,2),
  current_high_bidder_id uuid references public.profiles(id),
  bid_count int not null default 0,
  status text not null default 'scheduled'
    check (status in ('scheduled','live','ended','cancelled')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists auctions_listing_idx on public.auctions(listing_id);
create index if not exists auctions_status_idx on public.auctions(status);

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id),
  bidder_id uuid not null references public.profiles(id),
  amount_try numeric(14,2) not null check (amount_try > 0),
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (auction_id, bidder_id, idempotency_key)
);
create index if not exists bids_auction_amount_idx
  on public.bids(auction_id, amount_try desc);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id),
  payer_id uuid not null references public.profiles(id),
  amount_try numeric(14,2) not null,
  provider text not null,
  provider_ref text,
  status text not null default 'pending'
    check (status in ('pending','held','released','refunded','failed')),
  held_until timestamptz,
  released_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  doc_type text not null,
  file_path text not null,
  file_size_bytes bigint,
  status text not null default 'pending'
    check (status in ('pending','verified','rejected')),
  created_at timestamptz not null default now()
);

-- Yeni auth kullanıcısı → profil satırı
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$fn$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ═══ 20260428120100_rls_policies.sql ═══

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.auctions enable row level security;
alter table public.bids enable row level security;
alter table public.payments enable row level security;
alter table public.documents enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "listings_select_active" on public.listings;
create policy "listings_select_active" on public.listings
  for select using (status in ('active','closed') or auth.uid() = seller_id);

drop policy if exists "listings_insert_kyc" on public.listings;
create policy "listings_insert_kyc" on public.listings
  for insert with check (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and kyc_status = 'verified'
    )
  );

drop policy if exists "listings_update_own" on public.listings;
create policy "listings_update_own" on public.listings
  for update using (auth.uid() = seller_id);

drop policy if exists "auctions_select_public" on public.auctions;
create policy "auctions_select_public" on public.auctions
  for select using (status != 'draft');

drop policy if exists "bids_select_public" on public.bids;
create policy "bids_select_public" on public.bids
  for select using (true);

drop policy if exists "payments_select_self" on public.payments;
create policy "payments_select_self" on public.payments
  for select using (auth.uid() = payer_id);

drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own" on public.documents
  for select using (auth.uid() = owner_id);

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = owner_id);

drop policy if exists "documents_admin_all" on public.documents;
create policy "documents_admin_all" on public.documents
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );


-- ═══ 20260428120200_place_bid_function.sql ═══

-- SUPERSEDED by migration 20260429120100_bid_bonds_and_antisniping.sql (TUR #13: anti-sniping + bid_bonds).
-- Bu dosya eski kurulum sırası için kalır; yeni yerleşimlerde güncel RPC oradan gelir.

create or replace function public.place_bid(
  p_auction_id uuid,
  p_amount numeric,
  p_idempotency_key text
) returns json
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_auction record;
  v_bidder uuid := auth.uid();
  v_min_increment numeric := 100;
begin
  if v_bidder is null then
    return json_build_object('status','error','message','Giriş yapmalısınız');
  end if;

  if exists (
    select 1 from public.bids
    where auction_id = p_auction_id
      and bidder_id = v_bidder
      and idempotency_key = p_idempotency_key
  ) then
    return json_build_object('status','duplicate','message','Bu teklif zaten kayıtlı');
  end if;

  select * into v_auction from public.auctions
  where id = p_auction_id for update;

  if v_auction is null then
    return json_build_object('status','error','message','İhale bulunamadı');
  end if;
  if v_auction.status != 'live' then
    return json_build_object('status','error','message','İhale aktif değil');
  end if;
  if v_auction.ends_at < now() then
    return json_build_object('status','error','message','İhale bitti');
  end if;
  if p_amount < coalesce(v_auction.current_high_bid_try, 0) + v_min_increment then
    return json_build_object('status','error','message','Teklif çok düşük');
  end if;

  insert into public.bids (auction_id, bidder_id, amount_try, idempotency_key)
    values (p_auction_id, v_bidder, p_amount, p_idempotency_key);
  update public.auctions
    set current_high_bid_try = p_amount,
        current_high_bidder_id = v_bidder,
        bid_count = bid_count + 1
    where id = p_auction_id;

  return json_build_object('status','ok','amount',p_amount);
end;
$fn$;

grant execute on function public.place_bid(uuid, numeric, text) to authenticated;


-- ═══ 20260429120000_profiles_extra_fields.sql ═══

alter table public.profiles
  add column if not exists e_devlet_status text default 'none'
    check (e_devlet_status in ('none','pending','verified','rejected')),
  add column if not exists iban text,
  add column if not exists tc_kimlik_no text,
  add column if not exists role text default 'individual'
    check (role in ('individual','agent','bank','admin'));

create index if not exists profiles_role_idx on public.profiles(role);
drop index if exists public.profiles_tc_idx;
create unique index if not exists profiles_tc_unique
  on public.profiles(tc_kimlik_no)
  where tc_kimlik_no is not null;


-- ═══ 20260429120100_bid_bonds_and_antisniping.sql ═══

-- TUR #13 — teminat (bid bond) + anti-sniping + place_bid güncellemesi
-- fees.ts FEES.bidBondRate (%5) ile uyumlu sabit

alter table public.auctions
  add column if not exists anti_sniping_threshold_seconds int not null default 120,
  add column if not exists anti_sniping_extend_seconds int not null default 120,
  add column if not exists minimum_increment_try numeric(14,2) not null default 100;

create table if not exists public.bid_bonds (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  bidder_id uuid not null references public.profiles(id) on delete cascade,
  amount_try numeric(14,2) not null check (amount_try >= 0),
  bid_amount_try numeric(14,2) not null check (bid_amount_try > 0),
  status text not null default 'held'
    check (status in ('held','released','forfeited')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auction_id, bidder_id)
);

create index if not exists bid_bonds_auction_idx on public.bid_bonds(auction_id);
create index if not exists bid_bonds_bidder_idx on public.bid_bonds(bidder_id);

alter table public.bid_bonds enable row level security;

drop policy if exists "bid_bonds_select_own" on public.bid_bonds;
create policy "bid_bonds_select_own" on public.bid_bonds
  for select using (auth.uid() = bidder_id);

-- INSERT/UPDATE: RPC security definer altında bile RLS çağıran = oturum kullanıcısı
drop policy if exists "bid_bonds_insert_own" on public.bid_bonds;
create policy "bid_bonds_insert_own" on public.bid_bonds
  for insert with check (auth.uid() = bidder_id);

drop policy if exists "bid_bonds_update_own" on public.bid_bonds;
create policy "bid_bonds_update_own" on public.bid_bonds
  for update using (auth.uid() = bidder_id)
  with check (auth.uid() = bidder_id);

drop policy if exists "bid_bonds_service_all" on public.bid_bonds;

grant select, insert, update on public.bid_bonds to authenticated;

create or replace function public.place_bid(
  p_auction_id uuid,
  p_amount numeric,
  p_idempotency_key text
) returns json
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_auction record;
  v_bidder uuid := auth.uid();
  v_min_increment numeric;
  v_bond_rate numeric := 0.05;
  v_bond_try numeric;
  v_sniping_extended boolean := false;
begin
  if v_bidder is null then
    return json_build_object('status','error','message','Giriş yapmalısınız');
  end if;

  if exists (
    select 1 from public.bids
    where auction_id = p_auction_id
      and bidder_id = v_bidder
      and idempotency_key = p_idempotency_key
  ) then
    return json_build_object('status','duplicate','message','Bu teklif zaten kayıtlı');
  end if;

  select * into v_auction from public.auctions
  where id = p_auction_id for update;

  if v_auction is null then
    return json_build_object('status','error','message','İhale bulunamadı');
  end if;
  if v_auction.status != 'live' then
    return json_build_object('status','error','message','İhale aktif değil');
  end if;

  if v_auction.ends_at <= now() then
    return json_build_object('status','error','message','İhale bitti');
  end if;

  -- Anti-sniping: bitişe X saniye kala teklif → bitiş +Y saniye
  if (v_auction.ends_at - now())
       <= interval '1 second' * coalesce(v_auction.anti_sniping_threshold_seconds, 120)
  then
    update public.auctions
    set ends_at = ends_at
      + interval '1 second' * coalesce(v_auction.anti_sniping_extend_seconds, 120)
    where id = p_auction_id
    returning * into v_auction;
    v_sniping_extended := true;
  end if;

  if v_auction.ends_at <= now() then
    return json_build_object('status','error','message','İhale bitti');
  end if;

  v_min_increment := coalesce(v_auction.minimum_increment_try, 100);
  if p_amount < coalesce(v_auction.current_high_bid_try, 0) + v_min_increment then
    return json_build_object('status','error','message','Teklif çok düşük');
  end if;

  v_bond_try := round(p_amount * v_bond_rate, 2);

  insert into public.bids (auction_id, bidder_id, amount_try, idempotency_key)
    values (p_auction_id, v_bidder, p_amount, p_idempotency_key);

  insert into public.bid_bonds (auction_id, bidder_id, amount_try, bid_amount_try, status)
    values (p_auction_id, v_bidder, v_bond_try, p_amount, 'held')
  on conflict (auction_id, bidder_id) do update
    set amount_try = excluded.amount_try,
        bid_amount_try = excluded.bid_amount_try,
        status = 'held',
        updated_at = now();

  update public.auctions
    set current_high_bid_try = p_amount,
        current_high_bidder_id = v_bidder,
        bid_count = bid_count + 1
    where id = p_auction_id;

  return json_build_object(
    'status','ok',
    'amount', p_amount,
    'bond_try', v_bond_try,
    'ends_at', v_auction.ends_at,
    'anti_sniping_extended', v_sniping_extended
  );
end;
$fn$;

grant execute on function public.place_bid(uuid, numeric, text) to authenticated;


-- ═══ 20260429120200_listings_rls_strict.sql ═══

-- ADIM 13.3 — Listings INSERT gevşek moddan sıkı moda (TUR #12 `listings_insert_authenticated` yerine).
-- Paket / abonelik kapısı şemada yok; ileride WITH CHECK genişletilebilir.

drop policy if exists "listings_insert_authenticated" on public.listings;
drop policy if exists "listings_insert_kyc" on public.listings;
drop policy if exists "listings_insert_kyc_edevlet" on public.listings;

create policy "listings_insert_kyc_edevlet" on public.listings
  for insert with check (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kyc_status = 'verified'
        and coalesce(p.e_devlet_status, 'none') = 'verified'
    )
  );


-- ═══ 20260429120300_audit_log.sql ═══

-- TUR #14 ADIM 14.1 — audit trail (admin okuma; yazım Edge/service_role veya SECURITY DEFINER)
-- Not: 20260429120200 zaman damgası listings_rls_strict ile dolu; bu dosya 20260429120300.

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


-- ═══ 20260429120400_memberships_service_fees_authorizations.sql ═══

-- Üyelik, hizmet bedeli, yetki, komisyon ve emlakçı performans tabloları
-- Not: authorizations.agent_role için CHECK içinde NULL doğrudan IN listesinde kullanılamaz.

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

create table if not exists public.service_fees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  service_type text not null
    check (service_type in (
      'photo','drone','legal','expertise','virtual_tour','video','tapu_prep','bid_entry'
    )),
  amount_try numeric(14,2) not null,
  paid_at timestamptz not null default now(),
  status text not null default 'paid'
    check (status in ('paid','refunded','offset_against_commission'))
);

create index if not exists service_fees_user_idx on public.service_fees(user_id);
create index if not exists service_fees_listing_idx on public.service_fees(listing_id);

create table if not exists public.authorizations (
  id uuid primary key default gen_random_uuid(),
  property_title_deed text not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  authorized_by_agent_id uuid references public.profiles(id) on delete set null,
  agent_role text
    check (agent_role is null or agent_role in ('referral','portfolio','full')),
  listing_id uuid references public.listings(id) on delete set null,
  signed_at timestamptz,
  expires_at timestamptz,
  signed_via text
    check (signed_via is null or signed_via in ('e_devlet','kep','wet_signature')),
  pdf_url text,
  status text not null default 'pending'
    check (status in ('pending','active','expired','revoked')),
  created_at timestamptz not null default now()
);

create index if not exists authorizations_owner_idx on public.authorizations(owner_id);
create index if not exists authorizations_agent_idx on public.authorizations(authorized_by_agent_id);
create index if not exists authorizations_listing_idx on public.authorizations(listing_id);

create table if not exists public.commission_records (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete restrict,
  seller_id uuid not null references public.profiles(id),
  buyer_id uuid references public.profiles(id),

  sale_amount_try numeric(14,2) not null,

  seller_commission_try numeric(14,2) not null,
  seller_vat_try numeric(14,2) not null,

  buyer_commission_try numeric(14,2) not null default 0,
  buyer_vat_try numeric(14,2) not null default 0,

  offset_membership_try numeric(14,2) not null default 0,
  offset_service_fees_try numeric(14,2) not null default 0,
  offset_total_try numeric(14,2) not null default 0,

  agent_id uuid references public.profiles(id) on delete set null,
  agent_role text,
  agent_share_rate numeric(10,6),
  agent_share_try numeric(14,2) not null default 0,
  agent_invoice_received boolean not null default false,
  agent_invoice_url text,

  platform_net_try numeric(14,2) not null,

  collected_at timestamptz not null default now()
);

create index if not exists commission_records_auction_idx on public.commission_records(auction_id);
create index if not exists commission_records_seller_idx on public.commission_records(seller_id);
create index if not exists commission_records_agent_idx on public.commission_records(agent_id);

create table if not exists public.agent_performance (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.profiles(id) on delete cascade,
  period_year int not null check (period_year >= 2000 and period_year <= 2100),
  period_month int not null check (period_month >= 1 and period_month <= 12),

  referrals_count int not null default 0,
  referrals_converted int not null default 0,

  portfolio_listings int not null default 0,
  portfolio_listings_sold int not null default 0,

  full_listings int not null default 0,
  full_listings_sold int not null default 0,

  total_gmv_try numeric(14,2) not null default 0,
  total_earned_try numeric(14,2) not null default 0,

  unique (agent_id, period_year, period_month)
);

create index if not exists agent_performance_agent_idx on public.agent_performance(agent_id);

-- RLS
alter table public.memberships enable row level security;
alter table public.service_fees enable row level security;
alter table public.authorizations enable row level security;
alter table public.commission_records enable row level security;
alter table public.agent_performance enable row level security;

drop policy if exists "memberships_select_own" on public.memberships;
create policy "memberships_select_own" on public.memberships
  for select using (auth.uid() = user_id);

drop policy if exists "service_fees_select_own" on public.service_fees;
create policy "service_fees_select_own" on public.service_fees
  for select using (auth.uid() = user_id);

drop policy if exists "authorizations_select_related" on public.authorizations;
create policy "authorizations_select_related" on public.authorizations
  for select using (
    auth.uid() = owner_id
    or auth.uid() = authorized_by_agent_id
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "commission_records_select_party" on public.commission_records;
create policy "commission_records_select_party" on public.commission_records
  for select using (
    auth.uid() = seller_id
    or auth.uid() = buyer_id
    or auth.uid() = agent_id
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "agent_performance_select_own" on public.agent_performance;
create policy "agent_performance_select_own" on public.agent_performance
  for select using (
    auth.uid() = agent_id
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
    )
  );

grant select on public.memberships to authenticated;
grant select on public.service_fees to authenticated;
grant select on public.authorizations to authenticated;
grant select on public.commission_records to authenticated;
grant select on public.agent_performance to authenticated;


-- ═══ 20260429140000_listings_insert_kyc_edevlet_idempotent.sql ═══

-- listings_insert_kyc_edevlet — yeniden çalıştırılabilir (42710: policy already exists önlenir)
-- Önceki INSERT politikasıyla uyumlu: doğrulanmış KYC + satıcı = giriş yapmış kullanıcı

DROP POLICY IF EXISTS "listings_insert_kyc_edevlet" ON public.listings;

CREATE POLICY "listings_insert_kyc_edevlet" ON public.listings
  FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND kyc_status = 'verified'
    )
  );


-- ═══ 20260430120000_write_policies_and_place_bid_v2.sql ═══

-- TUR #19 — Write RLS (memberships, service_fees, authorizations, bid_bonds)
-- place_bid v2 — önce teminat (bid_bonds.status = held), sonra teklif
-- calculate_commission_with_offset — mahsup + commission_records insert

-- ─── memberships ───────────────────────────────────────────────

grant insert, update on public.memberships to authenticated;

drop policy if exists "memberships_select_own" on public.memberships;
drop policy if exists "memberships_select_self" on public.memberships;
create policy "memberships_select_self" on public.memberships
  for select using (auth.uid() = user_id);

drop policy if exists "memberships_insert_self" on public.memberships;
create policy "memberships_insert_self" on public.memberships
  for insert with check (auth.uid() = user_id);

drop policy if exists "memberships_update_admin" on public.memberships;
create policy "memberships_update_admin" on public.memberships
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- ─── service_fees ──────────────────────────────────────────────

grant insert on public.service_fees to authenticated;

drop policy if exists "service_fees_select_own" on public.service_fees;
drop policy if exists "service_fees_select_self" on public.service_fees;
create policy "service_fees_select_self" on public.service_fees
  for select using (auth.uid() = user_id);

drop policy if exists "service_fees_insert_self" on public.service_fees;
create policy "service_fees_insert_self" on public.service_fees
  for insert with check (auth.uid() = user_id);

-- ─── authorizations ────────────────────────────────────────────

grant insert on public.authorizations to authenticated;

drop policy if exists "authorizations_select_related" on public.authorizations;
drop policy if exists "authorizations_select_owner" on public.authorizations;
create policy "authorizations_select_owner" on public.authorizations
  for select using (
    auth.uid() = owner_id
    or auth.uid() = authorized_by_agent_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "authorizations_insert_owner" on public.authorizations;
create policy "authorizations_insert_owner" on public.authorizations
  for insert with check (auth.uid() = owner_id);

-- ─── commission_records: INSERT yalnızca SECURITY DEFINER RPC ───
-- (mevcut SELECT politikaları kalır)

-- ─── agent_performance (READ-only kullanıcı; yazım backend/job) ─

-- ─── bid_bonds yeniden adlandırma + yazım ───────────────────────

drop policy if exists "bid_bonds_select_own" on public.bid_bonds;
drop policy if exists "bid_bonds_select_self" on public.bid_bonds;
create policy "bid_bonds_select_self" on public.bid_bonds
  for select using (auth.uid() = bidder_id);

drop policy if exists "bid_bonds_insert_own" on public.bid_bonds;
drop policy if exists "bid_bonds_insert_self" on public.bid_bonds;
create policy "bid_bonds_insert_self" on public.bid_bonds
  for insert with check (auth.uid() = bidder_id);

drop policy if exists "bid_bonds_update_own" on public.bid_bonds;
drop policy if exists "bid_bonds_update_self" on public.bid_bonds;
create policy "bid_bonds_update_self" on public.bid_bonds
  for update using (auth.uid() = bidder_id)
  with check (auth.uid() = bidder_id);

-- ─── place_bid — teminat zorunlu + anti-sniping (tur #13 kolonları) ───

create or replace function public.place_bid(
  p_auction_id uuid,
  p_amount numeric,
  p_idempotency_key text
) returns json
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_auction record;
  v_bidder uuid := auth.uid();
  v_min_increment numeric;
  v_bond_rate numeric := 0.05;
  v_bond_try numeric;
  v_sniping_extended boolean := false;
  v_bond_status text;
begin
  if v_bidder is null then
    return json_build_object('status','error','message','Giriş yapmalısınız');
  end if;

  if exists (
    select 1 from public.bids
    where auction_id = p_auction_id
      and bidder_id = v_bidder
      and idempotency_key = p_idempotency_key
  ) then
    return json_build_object('status','duplicate','message','Bu teklif zaten kayıtlı');
  end if;

  select status into v_bond_status from public.bid_bonds
    where auction_id = p_auction_id and bidder_id = v_bidder
    limit 1;

  if v_bond_status is null then
    return json_build_object('status','error','message','Önce teminat yatırmalısınız');
  end if;

  if v_bond_status <> 'held' then
    return json_build_object(
      'status','error',
      'message','Teminatınız geçersiz: ' || v_bond_status
    );
  end if;

  select * into v_auction from public.auctions
    where id = p_auction_id for update;

  if v_auction is null then
    return json_build_object('status','error','message','İhale bulunamadı');
  end if;
  if v_auction.status <> 'live' then
    return json_build_object('status','error','message','İhale aktif değil');
  end if;

  if v_auction.ends_at <= now() then
    return json_build_object('status','error','message','İhale bitti');
  end if;

  if (v_auction.ends_at - now())
       <= interval '1 second' * coalesce(v_auction.anti_sniping_threshold_seconds, 120)
  then
    update public.auctions
      set ends_at = ends_at
        + interval '1 second' * coalesce(v_auction.anti_sniping_extend_seconds, 120)
      where id = p_auction_id
      returning * into v_auction;
    v_sniping_extended := true;
  end if;

  if v_auction.ends_at <= now() then
    return json_build_object('status','error','message','İhale bitti');
  end if;

  v_min_increment := coalesce(v_auction.minimum_increment_try, 100);
  if p_amount < coalesce(v_auction.current_high_bid_try, 0) + v_min_increment then
    return json_build_object('status','error','message','Teklif çok düşük');
  end if;

  v_bond_try := round(p_amount * v_bond_rate, 2);

  insert into public.bids (auction_id, bidder_id, amount_try, idempotency_key)
    values (p_auction_id, v_bidder, p_amount, p_idempotency_key);

  update public.bid_bonds
    set amount_try = v_bond_try,
        bid_amount_try = p_amount,
        status = 'held',
        updated_at = now()
    where auction_id = p_auction_id
      and bidder_id = v_bidder;

  update public.auctions
    set current_high_bid_try = p_amount,
        current_high_bidder_id = v_bidder,
        bid_count = bid_count + 1
    where id = p_auction_id;

  return json_build_object(
    'status','ok',
    'amount', p_amount,
    'bond_try', v_bond_try,
    'ends_at', v_auction.ends_at,
    'anti_sniping_extended', v_sniping_extended
  );
end;
$fn$;

grant execute on function public.place_bid(uuid, numeric, text) to authenticated;

-- ─── Mahsup + komisyon kaydı ────────────────────────────────────

create or replace function public.calculate_commission_with_offset(
  p_auction_id uuid,
  p_sale_amount numeric
) returns json
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_seller_id uuid;
  v_buyer_id uuid;
  v_agent_id uuid;
  v_agent_role text;
  v_seller_commission numeric;
  v_buyer_commission numeric;
  v_seller_vat numeric;
  v_buyer_vat numeric;
  v_offset_membership numeric := 0;
  v_offset_service numeric := 0;
  v_agent_share numeric := 0;
  v_agent_share_rate numeric := 0;
  v_platform_net numeric;
  v_commission_rate numeric := 0.04;
  v_vat_rate numeric := 0.20;
  v_record_id uuid;
begin
  select
    l.seller_id,
    a.current_high_bidder_id,
    ar.authorized_by_agent_id,
    ar.agent_role
  into v_seller_id, v_buyer_id, v_agent_id, v_agent_role
  from public.auctions a
  join public.listings l on l.id = a.listing_id
  left join lateral (
    select z.authorized_by_agent_id, z.agent_role
    from public.authorizations z
    where z.listing_id = l.id
      and z.status = 'active'
    order by z.created_at desc nulls last
    limit 1
  ) ar on true
  where a.id = p_auction_id;

  if v_seller_id is null then
    return json_build_object('status','error','message','İhale bulunamadı');
  end if;

  v_seller_commission := p_sale_amount * v_commission_rate;
  v_buyer_commission := p_sale_amount * v_commission_rate;
  v_seller_vat := v_seller_commission * v_vat_rate;
  v_buyer_vat := v_buyer_commission * v_vat_rate;

  select coalesce(sum(m.amount_paid_try), 0) into v_offset_membership
  from public.memberships m
  where m.user_id = v_seller_id
    and m.status = 'active'
    and m.starts_at <= now()
    and m.expires_at >= now();

  select coalesce(sum(sf.amount_try), 0) into v_offset_service
  from public.service_fees sf
  join public.listings l2 on l2.id = sf.listing_id
  join public.auctions a2 on a2.listing_id = l2.id
  where sf.user_id = v_seller_id
    and a2.id = p_auction_id
    and sf.status = 'paid';

  if v_agent_id is not null then
    v_agent_share_rate := case v_agent_role
      when 'referral' then 0.005
      when 'portfolio' then 0.015
      when 'full' then 0.02
      else 0
    end;
    v_agent_share := round(p_sale_amount * v_agent_share_rate, 2);
  end if;

  v_platform_net :=
      (v_seller_commission + v_buyer_commission)
    - v_offset_membership
    - v_offset_service
    - v_agent_share;

  insert into public.commission_records (
    auction_id, seller_id, buyer_id,
    sale_amount_try,
    seller_commission_try, seller_vat_try,
    buyer_commission_try, buyer_vat_try,
    offset_membership_try, offset_service_fees_try,
    offset_total_try,
    agent_id, agent_role, agent_share_rate, agent_share_try,
    platform_net_try
  ) values (
    p_auction_id, v_seller_id, v_buyer_id,
    p_sale_amount,
    v_seller_commission, v_seller_vat,
    v_buyer_commission, v_buyer_vat,
    v_offset_membership, v_offset_service,
    v_offset_membership + v_offset_service,
    v_agent_id,
    v_agent_role,
    case when v_agent_id is not null then v_agent_share_rate else null end,
    v_agent_share,
    v_platform_net
  )
  returning id into v_record_id;

  return json_build_object(
    'status','ok',
    'record_id', v_record_id,
    'sale_amount', p_sale_amount,
    'seller_commission', v_seller_commission,
    'buyer_commission', v_buyer_commission,
    'total_vat', v_seller_vat + v_buyer_vat,
    'offset_membership', v_offset_membership,
    'offset_service', v_offset_service,
    'agent_share', v_agent_share,
    'platform_net', v_platform_net
  );
end;
$fn$;

grant execute on function public.calculate_commission_with_offset(uuid, numeric) to service_role;


-- ═══ 20260430140000_pre_launch_signups.sql ═══

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


-- ═══ 20260430150000_profiles_role_place_bid_antisniping.sql ═══

-- profiles.role: AuthContext uyumu (minimal şemada eksikse eklenir)
alter table public.profiles add column if not exists role text default 'individual';

create index if not exists profiles_role_idx on public.profiles (role);

comment on column public.profiles.role is 'individual | seller | admin vb.; AuthContext ile uyumlu';

-- auctions: minimum artış (varsayılan fees.ts ile uyumlu)
alter table public.auctions add column if not exists min_increment_try numeric(14, 2) default 100;

-- Anti-sniping + min_increment — fees.ts ANTI_SNIPING_* ile uyumlu (120 sn)
create or replace function public.place_bid(
  p_auction_id uuid,
  p_amount numeric,
  p_idempotency_key text
) returns json
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_auction record;
  v_bidder uuid := auth.uid();
  v_min_increment numeric := 100;
  v_threshold interval := interval '120 seconds';
  v_extend interval := interval '120 seconds';
  v_new_ends timestamptz;
begin
  if v_bidder is null then
    return json_build_object('status','error','message','Giriş yapmalısınız');
  end if;

  if exists (
    select 1 from public.bids
    where auction_id = p_auction_id
      and bidder_id = v_bidder
      and idempotency_key = p_idempotency_key
  ) then
    return json_build_object('status','duplicate','message','Bu teklif zaten kayıtlı');
  end if;

  select * into v_auction from public.auctions
  where id = p_auction_id for update;

  if v_auction is null then
    return json_build_object('status','error','message','İhale bulunamadı');
  end if;
  if v_auction.status != 'live' then
    return json_build_object('status','error','message','İhale aktif değil');
  end if;
  if v_auction.ends_at <= clock_timestamp() then
    return json_build_object('status','error','message','İhale bitti');
  end if;

  v_min_increment := coalesce(v_auction.min_increment_try, 100);
  if p_amount < coalesce(v_auction.current_high_bid_try, 0) + v_min_increment then
    return json_build_object('status','error','message','Teklif çok düşük');
  end if;

  v_new_ends := v_auction.ends_at;
  if clock_timestamp() >= v_auction.ends_at - v_threshold then
    v_new_ends := v_auction.ends_at + v_extend;
    update public.auctions
      set ends_at = v_new_ends
    where id = p_auction_id;
  end if;

  insert into public.bids (auction_id, bidder_id, amount_try, idempotency_key)
    values (p_auction_id, v_bidder, p_amount, p_idempotency_key);

  update public.auctions
    set current_high_bid_try = p_amount,
        current_high_bidder_id = v_bidder,
        bid_count = bid_count + 1
    where id = p_auction_id;

  return json_build_object('status','ok','amount',p_amount,'ends_at',v_new_ends);
end;
$fn$;

grant execute on function public.place_bid(uuid, numeric, text) to authenticated;


-- ═══ 20260501120000_ai_buynow_deposit.sql ═══

-- TUR #26 — AI analiz raporları, rapor onayları, blokaj, hemen al (Supabase)
-- Prisma yerine SQL; Redis lock yerine SELECT FOR UPDATE

-- ═══ listings.status: buy_now sonrası 'sold' ═══
alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings add constraint listings_status_check check (
  status in ('draft','review','active','closed','cancelled','sold')
);

-- ═══ AI ANALIZ RAPORLARI ═══
create table if not exists public.property_analysis_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,

  legal_title_deed_status text
    check (legal_title_deed_status in ('clean','encumbered','disputed','unknown')),
  legal_mortgages jsonb default '[]'::jsonb,
  legal_liens jsonb default '[]'::jsonb,
  legal_zoning_status text,
  legal_building_permit_status text,
  legal_municipal_records jsonb default '{}'::jsonb,
  legal_risk_score int check (legal_risk_score between 1 and 10),
  legal_warnings text[],

  socio_income_level text
    check (socio_income_level in ('low','lower_middle','middle','upper_middle','high')),
  socio_education_score int check (socio_education_score between 1 and 10),
  socio_cultural_indicators jsonb default '{}'::jsonb,
  socio_crime_index int check (socio_crime_index between 1 and 10),
  socio_political_lean text,
  socio_employment_rate numeric,
  socio_demographics jsonb default '{}'::jsonb,

  location_metro_distance_km numeric,
  location_highway_distance_km numeric,
  location_airport_distance_km numeric,
  location_school_distance_km numeric,
  location_hospital_distance_km numeric,
  location_shopping_distance_km numeric,
  location_park_distance_km numeric,
  location_green_area_pct numeric,
  location_pollution_index int,
  location_earthquake_risk text
    check (location_earthquake_risk in ('low','medium','high','very_high')),
  location_commerce_potential text,

  economic_avg_rent_try numeric,
  economic_price_trend_3y_pct numeric,
  economic_price_trend_5y_pct numeric,
  economic_municipal_plan_alignment text,
  economic_fair_market_value_try numeric,
  economic_fair_price_score int check (economic_fair_price_score between 1 and 10),
  economic_lower_bound_try numeric,
  economic_upper_bound_try numeric,

  overall_risk_score int check (overall_risk_score between 1 and 10),
  overall_recommendation_buyer text,
  overall_recommendation_seller text,
  overall_red_flags text[],
  overall_disclaimer text not null default
    'Bu rapor bilgilendirme amaçlıdır, profesyonel ekspertiz veya hukuki tavsiye yerine geçmez.',

  status text not null default 'pending'
    check (status in ('pending','generating','ready','failed')),
  ai_provider text default 'mock',
  ai_model_version text,
  generated_at timestamptz,
  approved_by_seller_at timestamptz,
  raw_data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(listing_id)
);

create index if not exists property_reports_listing_idx on public.property_analysis_reports(listing_id);
create index if not exists property_reports_status_idx on public.property_analysis_reports(status);

create table if not exists public.report_approvals (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.property_analysis_reports(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  approved_at timestamptz not null default now(),
  ip_address inet,
  user_agent text,
  unique(report_id, user_id)
);

create index if not exists report_approvals_user_idx on public.report_approvals(user_id);

create table if not exists public.bid_deposits (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  auction_id uuid references public.auctions(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id),

  base_amount_try numeric(14,2) not null,
  deposit_rate numeric default 0.015,
  deposit_amount_try numeric(14,2) not null,

  status text not null default 'pending'
    check (status in (
      'pending',
      'authorized',
      'captured',
      'released',
      'forfeit_partial',
      'failed',
      'expired'
    )),

  iyzico_pre_auth_ref text,
  iyzico_capture_ref text,
  iyzico_refund_ref text,
  iyzico_void_ref text,

  pre_auth_at timestamptz,
  captured_at timestamptz,
  released_at timestamptz,
  forfeited_at timestamptz,

  forfeit_amount_try numeric(14,2) default 0,
  refund_amount_try numeric(14,2) default 0,

  context text check (context in ('bid','buy_now')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists bid_deposits_buyer_idx on public.bid_deposits(buyer_id);
create index if not exists bid_deposits_listing_idx on public.bid_deposits(listing_id);
create index if not exists bid_deposits_status_idx on public.bid_deposits(status);

create table if not exists public.buy_now_purchases (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  auction_id uuid references public.auctions(id),
  buyer_id uuid not null references public.profiles(id),

  amount_try numeric(14,2) not null,
  deposit_id uuid references public.bid_deposits(id),

  buyer_report_approved_at timestamptz not null,
  buyer_terms_accepted_at timestamptz not null,
  buyer_kyc_verified_at timestamptz,

  status text not null default 'pending_payment'
    check (status in (
      'pending_payment','confirmed','cancelled','refunded','disputed'
    )),

  iyzico_payment_ref text,
  cancelled_reason text,

  created_at timestamptz default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz
);

create index if not exists buy_now_buyer_idx on public.buy_now_purchases(buyer_id);
create index if not exists buy_now_listing_idx on public.buy_now_purchases(listing_id);

-- ═══ LISTINGS uzatma ═══
alter table public.listings
  add column if not exists buy_now_price_try numeric(14,2),
  add column if not exists analysis_report_id uuid references public.property_analysis_reports(id),
  add column if not exists seller_report_approved_at timestamptz,
  add column if not exists buy_now_disabled boolean default false;

-- ═══ Rate limit (iç tablo; yazım SECURITY DEFINER fonksiyonlarıyla) ═══
create table if not exists public.rate_limit_events (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_user_action_idx
  on public.rate_limit_events (user_id, action, created_at desc);

alter table public.rate_limit_events enable row level security;

-- ═══ RLS ═══
alter table public.property_analysis_reports enable row level security;
alter table public.report_approvals enable row level security;
alter table public.bid_deposits enable row level security;
alter table public.buy_now_purchases enable row level security;

drop policy if exists "reports_select_seller" on public.property_analysis_reports;
create policy "reports_select_seller" on public.property_analysis_reports
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

drop policy if exists "reports_select_authenticated_active" on public.property_analysis_reports;
create policy "reports_select_authenticated_active" on public.property_analysis_reports
  for select using (
    auth.uid() is not null
    and exists (
      select 1 from public.listings l
      join public.auctions a on a.listing_id = l.id
      where l.id = listing_id and a.status in ('live','scheduled')
    )
  );

drop policy if exists "reports_admin_all" on public.property_analysis_reports;
create policy "reports_admin_all" on public.property_analysis_reports
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "reports_insert_seller" on public.property_analysis_reports;
create policy "reports_insert_seller" on public.property_analysis_reports
  for insert to authenticated
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

drop policy if exists "reports_update_seller" on public.property_analysis_reports;
create policy "reports_update_seller" on public.property_analysis_reports
  for update to authenticated
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

drop policy if exists "approvals_self" on public.report_approvals;
create policy "approvals_self" on public.report_approvals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "deposits_buyer_self" on public.bid_deposits;
create policy "deposits_buyer_self" on public.bid_deposits
  for select using (auth.uid() = buyer_id);

drop policy if exists "deposits_seller_view" on public.bid_deposits;
create policy "deposits_seller_view" on public.bid_deposits
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );

drop policy if exists "deposits_admin_all" on public.bid_deposits;
create policy "deposits_admin_all" on public.bid_deposits
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

drop policy if exists "buy_now_party" on public.buy_now_purchases;
create policy "buy_now_party" on public.buy_now_purchases
  for select using (
    auth.uid() = buyer_id
    or exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ═══ Rate limit RPC ═══
create or replace function public.rate_limit_check(p_action text, p_max_per_hour int)
returns json
language plpgsql
security definer
set search_path = public
as $rl$
declare
  v_uid uuid := auth.uid();
  v_count int;
begin
  if v_uid is null then
    return json_build_object('ok', false, 'reason', 'auth');
  end if;
  select count(*)::int into v_count
  from public.rate_limit_events
  where user_id = v_uid
    and action = p_action
    and created_at > now() - interval '1 hour';
  if v_count >= p_max_per_hour then
    return json_build_object('ok', false, 'reason', 'rate_limited');
  end if;
  insert into public.rate_limit_events (user_id, action) values (v_uid, p_action);
  return json_build_object('ok', true);
end;
$rl$;

grant execute on function public.rate_limit_check(text, int) to authenticated;

-- ═══ Blokaj kaydı (ödeme mock sonrası) — INSERT yalnız RPC ═══
create or replace function public.register_bid_deposit(
  p_listing_id uuid,
  p_auction_id uuid,
  p_base_amount_try numeric,
  p_deposit_amount_try numeric,
  p_pre_auth_ref text,
  p_context text,
  p_idempotency_key text
) returns json
language plpgsql
security definer
set search_path = public
as $dep$
declare
  v_uid uuid := auth.uid();
  v_rl json;
  v_id uuid;
begin
  if v_uid is null then
    return json_build_object('status','error','message','Giriş yapmalısınız');
  end if;

  if p_context is null or p_context not in ('bid','buy_now') then
    return json_build_object('status','error','message','Geçersiz işlem bağlamı');
  end if;

  v_rl := public.rate_limit_check(
    case when p_context = 'buy_now' then 'buy_now_attempts' else 'pre_auth_attempts' end,
    case when p_context = 'buy_now' then 5 else 10 end
  );
  if coalesce((v_rl->>'ok')::boolean, false) is not true then
    return json_build_object('status','error','message','Çok sık deneme — lütfen daha sonra tekrar deneyin');
  end if;

  if not exists (select 1 from public.listings l where l.id = p_listing_id) then
    return json_build_object('status','error','message','İlan bulunamadı');
  end if;

  insert into public.bid_deposits (
    listing_id,
    auction_id,
    buyer_id,
    base_amount_try,
    deposit_rate,
    deposit_amount_try,
    status,
    iyzico_pre_auth_ref,
    pre_auth_at,
    context,
    metadata
  ) values (
    p_listing_id,
    p_auction_id,
    v_uid,
    p_base_amount_try,
    0.015,
    p_deposit_amount_try,
    'authorized',
    p_pre_auth_ref,
    now(),
    p_context,
    jsonb_build_object('idempotency_key', p_idempotency_key, 'is_mock', true)
  )
  returning id into v_id;

  return json_build_object('status','ok','deposit_id', v_id);
end;
$dep$;

grant execute on function public.register_bid_deposit(uuid, uuid, numeric, numeric, text, text, text) to authenticated;

-- ═══ HEMEN AL atomik (SELECT FOR UPDATE) ═══
create or replace function public.execute_buy_now(
  p_listing_id uuid,
  p_deposit_id uuid,
  p_idempotency_key text
) returns json
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_buyer_id uuid := auth.uid();
  v_listing record;
  v_auction record;
  v_buy_now_id uuid;
  v_deposit record;
  v_report_approved boolean;
  v_rl json;
begin
  if v_buyer_id is null then
    return json_build_object('status','error','message','Giriş yapmalısınız');
  end if;

  v_rl := public.rate_limit_check('buy_now_attempts', 5);
  if coalesce((v_rl->>'ok')::boolean, false) is not true then
    return json_build_object('status','error','message','Çok sık deneme — lütfen daha sonra tekrar deneyin');
  end if;

  if exists (
    select 1 from public.buy_now_purchases
    where listing_id = p_listing_id
      and buyer_id = v_buyer_id
      and status in ('pending_payment','confirmed')
  ) then
    return json_build_object('status','duplicate','message','Bu ilan için zaten Hemen Al işleminiz var');
  end if;

  select * into v_listing from public.listings
    where id = p_listing_id for update;

  if not found then
    return json_build_object('status','error','message','İlan bulunamadı');
  end if;

  if v_listing.status != 'active' then
    return json_build_object('status','error','message','İlan aktif değil');
  end if;

  if v_listing.buy_now_price_try is null then
    return json_build_object('status','error','message','Bu ilanda Hemen Al fiyatı yok');
  end if;

  if coalesce(v_listing.buy_now_disabled, false) then
    return json_build_object('status','error','message','Hemen Al kapatıldı');
  end if;

  select * into v_auction from public.auctions
    where listing_id = p_listing_id
    order by created_at desc nulls last
    limit 1
    for update;

  if not found then
    return json_build_object('status','error','message','İhale kaydı bulunamadı');
  end if;

  if v_auction.status not in ('scheduled','live') then
    return json_build_object('status','error','message','İhale tamamlanmış veya iptal');
  end if;

  select exists(
    select 1 from public.report_approvals ra
    join public.property_analysis_reports r on r.id = ra.report_id
    where r.listing_id = p_listing_id and ra.user_id = v_buyer_id
  ) into v_report_approved;

  if not v_report_approved then
    return json_build_object('status','error','message','Önce AI analiz raporunu onaylamalısınız');
  end if;

  select * into v_deposit from public.bid_deposits
    where id = p_deposit_id
      and buyer_id = v_buyer_id
      and listing_id = p_listing_id
      and status = 'authorized'
      and context = 'buy_now';

  if not found then
    return json_build_object('status','error','message','Geçerli blokaj bulunamadı');
  end if;

  insert into public.buy_now_purchases (
    listing_id, auction_id, buyer_id, amount_try, deposit_id,
    buyer_report_approved_at, buyer_terms_accepted_at,
    status
  ) values (
    p_listing_id, v_auction.id, v_buyer_id, v_listing.buy_now_price_try, p_deposit_id,
    now(), now(),
    'pending_payment'
  ) returning id into v_buy_now_id;

  update public.auctions set status = 'ended'
    where listing_id = p_listing_id;

  update public.listings set status = 'sold', updated_at = now()
    where id = p_listing_id;

  return json_build_object(
    'status','ok',
    'buy_now_id', v_buy_now_id,
    'amount', v_listing.buy_now_price_try
  );
end;
$fn$;

grant execute on function public.execute_buy_now(uuid, uuid, text) to authenticated;

