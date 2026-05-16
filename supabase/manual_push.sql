-- ═══════════════════════════════════════════════════════════════════════════
-- ihaleal.com — TEK DOSYA (tüm migration’lar birleşik)
-- Oluşturulma: 2026-05-16T14:04:06.932Z
-- Kaynak: supabase/migrations/ (20 dosya)
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


-- ═══ 20260502120000_profiles_rls_recursion_service_grants.sql ═══

-- profiles_select_admin gibi politikalar "profiles" üzerinde tekrar "profiles" SELECT ederse
-- PostgreSQL 42P17 infinite recursion üretir. Admin kontrolü SECURITY DEFINER ile RLS dışında yapılır.

create or replace function public.is_profile_admin(check_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select (p.is_admin = true or p.role = 'admin')
      from public.profiles p
      where p.id = check_uid
    ),
    false
  );
$$;

comment on function public.is_profile_admin(uuid) is
  'RLS içinde profiles.self-join özyinelemesini önlemek için; SECURITY DEFINER ile tek satır okur.';

grant execute on function public.is_profile_admin(uuid) to anon, authenticated, service_role;

drop policy if exists "profiles_select_admin" on public.profiles;

create policy "profiles_select_admin" on public.profiles
  for select using (public.is_profile_admin(auth.uid()));

-- REST üzerinden service_role ile okuma: bazı projelerde tablo oluşturulmuş ama service_role SELECT izni eksik kalır.
grant select on public.memberships to service_role;
grant select on public.bid_bonds to service_role;


-- ═══ 20260504140000_chat_messages_compliance_stub.sql ═══

-- TASLAK: uc sohbet + uyum kuyrugu (Messages uretim hatti)
-- NLP skoru Edge sonrasi; bu dosya tablo + post_chat_message RPC iskeleti.

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  title text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_threads_listing_idx on public.chat_threads (listing_id);

create table if not exists public.chat_thread_participants (
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('buyer','seller','agent','platform')),
  joined_at timestamptz not null default now(),
  primary key (thread_id, profile_id)
);

create index if not exists chat_participants_profile_idx on public.chat_thread_participants (profile_id);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check (char_length(trim(body)) > 0),
  client_msg_id text,
  compliance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (thread_id, client_msg_id)
);

create index if not exists chat_messages_thread_created_idx on public.chat_messages (thread_id, created_at desc);

create table if not exists public.compliance_review_queue (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  severity text not null default 'low' check (severity in ('low','medium','high')),
  flagged_keywords text[] not null default '{}',
  model_score numeric(6,4),
  status text not null default 'open'
    check (status in ('open','in_review','closed_false_positive','closed_action')),
  created_at timestamptz not null default now(),
  unique (message_id)
);

create index if not exists compliance_queue_status_idx on public.compliance_review_queue (status, created_at desc);

create or replace function public.post_chat_message(
  p_thread_id uuid,
  p_body text,
  p_client_msg_id text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $fn$
declare
  v_uid uuid := auth.uid();
  v_msg_id uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if not exists (
    select 1 from public.chat_thread_participants p
    where p.thread_id = p_thread_id and p.profile_id = v_uid
  ) then
    raise exception 'forbidden';
  end if;
  insert into public.chat_messages (thread_id, author_id, body, client_msg_id)
  values (p_thread_id, v_uid, trim(p_body), nullif(trim(p_client_msg_id), ''))
  returning id into v_msg_id;
  update public.chat_threads set updated_at = now() where id = p_thread_id;
  return v_msg_id;
end;
$fn$;

grant execute on function public.post_chat_message(uuid, text, text) to authenticated;

alter table public.chat_threads enable row level security;
alter table public.chat_thread_participants enable row level security;
alter table public.chat_messages enable row level security;
alter table public.compliance_review_queue enable row level security;

drop policy if exists "chat_threads_participant_select" on public.chat_threads;
create policy "chat_threads_participant_select" on public.chat_threads
  for select using (
    exists (
      select 1 from public.chat_thread_participants p
      where p.thread_id = chat_threads.id and p.profile_id = auth.uid()
    )
  );

drop policy if exists "chat_threads_creator_insert" on public.chat_threads;
create policy "chat_threads_creator_insert" on public.chat_threads
  for insert with check (created_by = auth.uid());

drop policy if exists "chat_participants_self_select" on public.chat_thread_participants;
create policy "chat_participants_self_select" on public.chat_thread_participants
  for select using (profile_id = auth.uid());

drop policy if exists "chat_participants_thread_member_insert" on public.chat_thread_participants;
create policy "chat_participants_thread_member_insert" on public.chat_thread_participants
  for insert with check (
    exists (
      select 1 from public.chat_threads t
      where t.id = thread_id and t.created_by = auth.uid()
    )
  );

drop policy if exists "chat_messages_participant_select" on public.chat_messages;
create policy "chat_messages_participant_select" on public.chat_messages
  for select using (
    exists (
      select 1 from public.chat_thread_participants p
      where p.thread_id = chat_messages.thread_id and p.profile_id = auth.uid()
    )
  );

drop policy if exists "chat_messages_author_insert" on public.chat_messages;
create policy "chat_messages_author_insert" on public.chat_messages
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.chat_thread_participants p
      where p.thread_id = chat_messages.thread_id and p.profile_id = auth.uid()
    )
  );

drop policy if exists "compliance_queue_admin_select" on public.compliance_review_queue;
create policy "compliance_queue_admin_select" on public.compliance_review_queue
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );


-- ═══ 20260516120000_v2_core_safety_additive.sql ═══

- -   v 2   c o r e   s a f e t y   ( a d d i t i v e ,   m e v c u t   a u d i t _ l o g   /   p l a c e _ b i d   i l e   u y u m l u ) 
 b e g i n ; 
 
 c r e a t e   e x t e n s i o n   i f   n o t   e x i s t s   p g c r y p t o ; 
 c r e a t e   e x t e n s i o n   i f   n o t   e x i s t s   c i t e x t ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . i d e m p o t e n c y _ k e y s   ( 
     k e y                         t e x t   p r i m a r y   k e y , 
     u s e r _ i d                 u u i d   n o t   n u l l , 
     e n d p o i n t               t e x t   n o t   n u l l , 
     r e q u e s t _ h a s h       t e x t   n o t   n u l l , 
     r e s p o n s e               j s o n b , 
     s t a t u s _ c o d e         i n t , 
     c r e a t e d _ a t           t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) , 
     e x p i r e s _ a t           t i m e s t a m p t z   n o t   n u l l   d e f a u l t   ( n o w ( )   +   i n t e r v a l   ' 2 4   h o u r s ' ) 
 ) ; 
 c r e a t e   i n d e x   i f   n o t   e x i s t s   i d e m _ e x p i r e s _ i d x   o n   p u b l i c . i d e m p o t e n c y _ k e y s   ( e x p i r e s _ a t ) ; 
 a l t e r   t a b l e   p u b l i c . i d e m p o t e n c y _ k e y s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . r a t e _ l i m i t _ b u c k e t s   ( 
     b u c k e t _ k e y       t e x t   p r i m a r y   k e y , 
     t o k e n s               n u m e r i c   n o t   n u l l , 
     c a p a c i t y           n u m e r i c   n o t   n u l l , 
     r e f i l l _ r a t e     n u m e r i c   n o t   n u l l , 
     l a s t _ r e f i l l     t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) 
 ) ; 
 
 c r e a t e   o r   r e p l a c e   f u n c t i o n   p u b l i c . r l _ c o n s u m e ( 
     p _ k e y   t e x t ,   p _ c a p a c i t y   n u m e r i c ,   p _ r e f i l l _ r a t e   n u m e r i c ,   p _ c o s t   n u m e r i c   d e f a u l t   1 
 )   r e t u r n s   b o o l e a n 
 l a n g u a g e   p l p g s q l   s e c u r i t y   d e f i n e r   s e t   s e a r c h _ p a t h   =   p u b l i c   a s   $ $ 
 d e c l a r e   v _ t o k e n s   n u m e r i c ;   v _ l a s t   t i m e s t a m p t z ;   v _ n o w   t i m e s t a m p t z   : =   c l o c k _ t i m e s t a m p ( ) ; 
 b e g i n 
     i n s e r t   i n t o   r a t e _ l i m i t _ b u c k e t s ( b u c k e t _ k e y ,   t o k e n s ,   c a p a c i t y ,   r e f i l l _ r a t e ) 
         v a l u e s   ( p _ k e y ,   p _ c a p a c i t y ,   p _ c a p a c i t y ,   p _ r e f i l l _ r a t e )   o n   c o n f l i c t   d o   n o t h i n g ; 
     s e l e c t   t o k e n s ,   l a s t _ r e f i l l   i n t o   v _ t o k e n s ,   v _ l a s t   f r o m   r a t e _ l i m i t _ b u c k e t s   w h e r e   b u c k e t _ k e y   =   p _ k e y   f o r   u p d a t e ; 
     v _ t o k e n s   : =   l e a s t ( p _ c a p a c i t y ,   v _ t o k e n s   +   e x t r a c t ( e p o c h   f r o m   ( v _ n o w   -   v _ l a s t ) )   *   p _ r e f i l l _ r a t e ) ; 
     i f   v _ t o k e n s   <   p _ c o s t   t h e n 
         u p d a t e   r a t e _ l i m i t _ b u c k e t s   s e t   t o k e n s   =   v _ t o k e n s ,   l a s t _ r e f i l l   =   v _ n o w   w h e r e   b u c k e t _ k e y   =   p _ k e y ; 
         r e t u r n   f a l s e ; 
     e n d   i f ; 
     u p d a t e   r a t e _ l i m i t _ b u c k e t s   s e t   t o k e n s   =   v _ t o k e n s   -   p _ c o s t ,   l a s t _ r e f i l l   =   v _ n o w , 
         c a p a c i t y   =   p _ c a p a c i t y ,   r e f i l l _ r a t e   =   p _ r e f i l l _ r a t e   w h e r e   b u c k e t _ k e y   =   p _ k e y ; 
     r e t u r n   t r u e ; 
 e n d   $ $ ; 
 g r a n t   e x e c u t e   o n   f u n c t i o n   p u b l i c . r l _ c o n s u m e ( t e x t ,   n u m e r i c ,   n u m e r i c ,   n u m e r i c )   t o   a u t h e n t i c a t e d ,   s e r v i c e _ r o l e ; 
 
 c r e a t e   o r   r e p l a c e   f u n c t i o n   p u b l i c . w r i t e _ a u d i t _ v 2 ( 
     p _ a c t i o n   t e x t ,   p _ e n t i t y _ t y p e   t e x t ,   p _ e n t i t y _ i d   t e x t ,   p _ d i f f   j s o n b   d e f a u l t   n u l l 
 )   r e t u r n s   v o i d   l a n g u a g e   p l p g s q l   s e c u r i t y   d e f i n e r   s e t   s e a r c h _ p a t h   =   p u b l i c   a s   $ $ 
 b e g i n 
     i n s e r t   i n t o   p u b l i c . a u d i t _ l o g ( a c t o r _ i d ,   a c t i o n ,   e n t i t y _ t y p e ,   e n t i t y _ i d ,   p a y l o a d ) 
     v a l u e s   ( 
         a u t h . u i d ( ) ,   p _ a c t i o n ,   p _ e n t i t y _ t y p e , 
         n u l l i f ( p _ e n t i t y _ i d ,   ' ' ) : : u u i d , 
         c o a l e s c e ( p _ d i f f ,   ' { } ' : : j s o n b ) 
     ) ; 
 e x c e p t i o n   w h e n   o t h e r s   t h e n   n u l l ; 
 e n d   $ $ ; 
 g r a n t   e x e c u t e   o n   f u n c t i o n   p u b l i c . w r i t e _ a u d i t _ v 2 ( t e x t ,   t e x t ,   t e x t ,   j s o n b )   t o   a u t h e n t i c a t e d ,   s e r v i c e _ r o l e ; 
 
 c o m m i t ; 
 

-- ═══ 20260516120100_v2_multi_tenant.sql ═══

- -   M u l t i - t e n a n t   f o u n d a t i o n   ( s e l l e r _ i d   u y u m l u   l i s t i n g s   R L S ) 
 b e g i n ; 
 
 c r e a t e   o r   r e p l a c e   f u n c t i o n   p u b l i c . t g _ s e t _ u p d a t e d _ a t ( ) 
 r e t u r n s   t r i g g e r   l a n g u a g e   p l p g s q l   a s   $ $ 
 b e g i n   n e w . u p d a t e d _ a t   =   n o w ( ) ;   r e t u r n   n e w ;   e n d   $ $ ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . o r g a n i z a t i o n s   ( 
     i d                             u u i d   p r i m a r y   k e y   d e f a u l t   g e n _ r a n d o m _ u u i d ( ) , 
     s l u g                         t e x t   u n i q u e   n o t   n u l l , 
     l e g a l _ n a m e             t e x t   n o t   n u l l , 
     d i s p l a y _ n a m e         t e x t   n o t   n u l l , 
     o r g _ t y p e                 t e x t   n o t   n u l l   c h e c k   ( o r g _ t y p e   i n   ( ' a g e n c y ' , ' g y o ' , ' c o n t r a c t o r ' , ' b a n k ' , ' o t h e r ' ) ) , 
     p l a n                         t e x t   n o t   n u l l   d e f a u l t   ' f r e e '   c h e c k   ( p l a n   i n   ( ' f r e e ' , ' a g e n c y ' , ' g y o ' , ' e n t e r p r i s e ' ) ) , 
     k y c _ s t a t u s             t e x t   n o t   n u l l   d e f a u l t   ' p e n d i n g '   c h e c k   ( k y c _ s t a t u s   i n   ( ' p e n d i n g ' , ' i n _ r e v i e w ' , ' v e r i f i e d ' , ' r e j e c t e d ' , ' s u s p e n d e d ' ) ) , 
     t a x _ n u m b e r             t e x t , 
     c o n t a c t _ e m a i l       c i t e x t , 
     s e t t i n g s                 j s o n b   n o t   n u l l   d e f a u l t   ' { } ' : : j s o n b , 
     a i _ q u o t a _ m o n t h l y   i n t   n o t   n u l l   d e f a u l t   2 0 0 , 
     a i _ u s e d _ t h i s _ p e r i o d   i n t   n o t   n u l l   d e f a u l t   0 , 
     p e r i o d _ s t a r t e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   d a t e _ t r u n c ( ' m o n t h ' ,   n o w ( ) ) , 
     c r e a t e d _ a t             t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) , 
     u p d a t e d _ a t             t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) 
 ) ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . o r g a n i z a t i o n _ m e m b e r s   ( 
     o r g a n i z a t i o n _ i d   u u i d   n o t   n u l l   r e f e r e n c e s   p u b l i c . o r g a n i z a t i o n s ( i d )   o n   d e l e t e   c a s c a d e , 
     u s e r _ i d                   u u i d   n o t   n u l l   r e f e r e n c e s   a u t h . u s e r s ( i d )   o n   d e l e t e   c a s c a d e , 
     r o l e                         t e x t   n o t   n u l l   c h e c k   ( r o l e   i n   ( ' o w n e r ' , ' a d m i n ' , ' m a n a g e r ' , ' a g e n t ' , ' v i e w e r ' ) ) , 
     s t a t u s                     t e x t   n o t   n u l l   d e f a u l t   ' a c t i v e '   c h e c k   ( s t a t u s   i n   ( ' a c t i v e ' , ' i n v i t e d ' , ' s u s p e n d e d ' , ' r e m o v e d ' ) ) , 
     j o i n e d _ a t               t i m e s t a m p t z   d e f a u l t   n o w ( ) , 
     p r i m a r y   k e y   ( o r g a n i z a t i o n _ i d ,   u s e r _ i d ) 
 ) ; 
 c r e a t e   i n d e x   i f   n o t   e x i s t s   o m _ u s e r _ i d x   o n   p u b l i c . o r g a n i z a t i o n _ m e m b e r s ( u s e r _ i d )   w h e r e   s t a t u s   =   ' a c t i v e ' ; 
 
 a l t e r   t a b l e   p u b l i c . l i s t i n g s   a d d   c o l u m n   i f   n o t   e x i s t s   o r g a n i z a t i o n _ i d   u u i d   r e f e r e n c e s   p u b l i c . o r g a n i z a t i o n s ( i d ) ; 
 a l t e r   t a b l e   p u b l i c . l i s t i n g s   a d d   c o l u m n   i f   n o t   e x i s t s   m a t c h e d _ a t   t i m e s t a m p t z ; 
 c r e a t e   i n d e x   i f   n o t   e x i s t s   l i s t i n g s _ o r g _ i d x   o n   p u b l i c . l i s t i n g s ( o r g a n i z a t i o n _ i d )   w h e r e   o r g a n i z a t i o n _ i d   i s   n o t   n u l l ; 
 
 c r e a t e   o r   r e p l a c e   f u n c t i o n   p u b l i c . s e t _ a c t i v e _ o r g ( p _ o r g _ i d   u u i d ) 
 r e t u r n s   v o i d   l a n g u a g e   p l p g s q l   s e c u r i t y   d e f i n e r   s e t   s e a r c h _ p a t h   =   p u b l i c   a s   $ $ 
 d e c l a r e   v _ u s e r   u u i d   : =   a u t h . u i d ( ) ; 
 b e g i n 
     i f   v _ u s e r   i s   n u l l   t h e n   r a i s e   e x c e p t i o n   ' u n a u t h e n t i c a t e d ' ;   e n d   i f ; 
     i f   p _ o r g _ i d   i s   n o t   n u l l   a n d   n o t   e x i s t s   ( 
         s e l e c t   1   f r o m   o r g a n i z a t i o n _ m e m b e r s   w h e r e   o r g a n i z a t i o n _ i d   =   p _ o r g _ i d   a n d   u s e r _ i d   =   v _ u s e r   a n d   s t a t u s   =   ' a c t i v e ' 
     )   t h e n   r a i s e   e x c e p t i o n   ' n o t _ a _ m e m b e r ' ;   e n d   i f ; 
     u p d a t e   a u t h . u s e r s   s e t   r a w _ a p p _ m e t a _ d a t a   =   c o a l e s c e ( r a w _ a p p _ m e t a _ d a t a , ' { } ' : : j s o n b ) 
         | |   j s o n b _ b u i l d _ o b j e c t ( ' a c t i v e _ o r g _ i d ' ,   p _ o r g _ i d )   w h e r e   i d   =   v _ u s e r ; 
 e n d   $ $ ; 
 g r a n t   e x e c u t e   o n   f u n c t i o n   p u b l i c . s e t _ a c t i v e _ o r g ( u u i d )   t o   a u t h e n t i c a t e d ; 
 
 c r e a t e   o r   r e p l a c e   f u n c t i o n   p u b l i c . c u r r e n t _ o r g _ i d ( )   r e t u r n s   u u i d   l a n g u a g e   s q l   s t a b l e   a s   $ $ 
     s e l e c t   n u l l i f ( c o a l e s c e ( c u r r e n t _ s e t t i n g ( ' r e q u e s t . j w t . c l a i m s ' ,   t r u e ) : : j s o n b 
         - >   ' a p p _ m e t a d a t a '   - > >   ' a c t i v e _ o r g _ i d ' ,   ' ' ) ,   ' ' ) : : u u i d 
 $ $ ; 
 
 c r e a t e   o r   r e p l a c e   f u n c t i o n   p u b l i c . h a s _ o r g _ r o l e ( p _ o r g   u u i d ,   p _ r o l e s   t e x t [ ] )   r e t u r n s   b o o l e a n   l a n g u a g e   s q l   s t a b l e   a s   $ $ 
     s e l e c t   e x i s t s   ( 
         s e l e c t   1   f r o m   o r g a n i z a t i o n _ m e m b e r s 
         w h e r e   o r g a n i z a t i o n _ i d   =   p _ o r g   a n d   u s e r _ i d   =   a u t h . u i d ( )   a n d   s t a t u s   =   ' a c t i v e '   a n d   r o l e   =   a n y ( p _ r o l e s ) 
     ) 
 $ $ ; 
 
 a l t e r   t a b l e   p u b l i c . o r g a n i z a t i o n s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 a l t e r   t a b l e   p u b l i c . o r g a n i z a t i o n _ m e m b e r s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 
 d r o p   p o l i c y   i f   e x i s t s   " o r g _ s e l e c t _ m e m b e r "   o n   p u b l i c . o r g a n i z a t i o n s ; 
 c r e a t e   p o l i c y   " o r g _ s e l e c t _ m e m b e r "   o n   p u b l i c . o r g a n i z a t i o n s   f o r   s e l e c t   u s i n g   ( 
     e x i s t s   ( s e l e c t   1   f r o m   o r g a n i z a t i o n _ m e m b e r s   w h e r e   o r g a n i z a t i o n _ i d   =   i d   a n d   u s e r _ i d   =   a u t h . u i d ( )   a n d   s t a t u s   =   ' a c t i v e ' ) 
 ) ; 
 
 d r o p   p o l i c y   i f   e x i s t s   " o m _ s e l e c t _ s e l f _ o r _ m e m b e r "   o n   p u b l i c . o r g a n i z a t i o n _ m e m b e r s ; 
 c r e a t e   p o l i c y   " o m _ s e l e c t _ s e l f _ o r _ m e m b e r "   o n   p u b l i c . o r g a n i z a t i o n _ m e m b e r s   f o r   s e l e c t   u s i n g   ( 
     u s e r _ i d   =   a u t h . u i d ( )   o r   h a s _ o r g _ r o l e ( o r g a n i z a t i o n _ i d ,   a r r a y [ ' o w n e r ' , ' a d m i n ' , ' m a n a g e r ' ] ) 
 ) ; 
 
 c r e a t e   o r   r e p l a c e   f u n c t i o n   p u b l i c . c o n s u m e _ a i _ q u o t a ( p _ o r g   u u i d   d e f a u l t   n u l l ,   p _ c o u n t   i n t   d e f a u l t   1 ) 
 r e t u r n s   b o o l e a n   l a n g u a g e   p l p g s q l   s e c u r i t y   d e f i n e r   s e t   s e a r c h _ p a t h   =   p u b l i c   a s   $ $ 
 d e c l a r e   v _ u s e d   i n t ;   v _ q u o t a   i n t ;   v _ p e r i o d   t i m e s t a m p t z ; 
 b e g i n 
     i f   p _ o r g   i s   n u l l   t h e n   r e t u r n   t r u e ;   e n d   i f ; 
     s e l e c t   a i _ u s e d _ t h i s _ p e r i o d ,   a i _ q u o t a _ m o n t h l y ,   p e r i o d _ s t a r t e d _ a t   i n t o   v _ u s e d ,   v _ q u o t a ,   v _ p e r i o d 
         f r o m   o r g a n i z a t i o n s   w h e r e   i d   =   p _ o r g   f o r   u p d a t e ; 
     i f   v _ p e r i o d   <   d a t e _ t r u n c ( ' m o n t h ' ,   n o w ( ) )   t h e n 
         u p d a t e   o r g a n i z a t i o n s   s e t   a i _ u s e d _ t h i s _ p e r i o d   =   0 ,   p e r i o d _ s t a r t e d _ a t   =   d a t e _ t r u n c ( ' m o n t h ' ,   n o w ( ) )   w h e r e   i d   =   p _ o r g ; 
         v _ u s e d   : =   0 ; 
     e n d   i f ; 
     i f   v _ u s e d   +   p _ c o u n t   >   v _ q u o t a   t h e n   r e t u r n   f a l s e ;   e n d   i f ; 
     u p d a t e   o r g a n i z a t i o n s   s e t   a i _ u s e d _ t h i s _ p e r i o d   =   a i _ u s e d _ t h i s _ p e r i o d   +   p _ c o u n t   w h e r e   i d   =   p _ o r g ; 
     r e t u r n   t r u e ; 
 e n d   $ $ ; 
 g r a n t   e x e c u t e   o n   f u n c t i o n   p u b l i c . c o n s u m e _ a i _ q u o t a ( u u i d ,   i n t )   t o   a u t h e n t i c a t e d ,   s e r v i c e _ r o l e ; 
 
 c o m m i t ; 
 

-- ═══ 20260516120200_v2_liquidity.sql ═══

b e g i n ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . b u y e r _ p r e f e r e n c e s   ( 
     i d   u u i d   p r i m a r y   k e y   d e f a u l t   g e n _ r a n d o m _ u u i d ( ) , 
     u s e r _ i d   u u i d   n o t   n u l l   r e f e r e n c e s   a u t h . u s e r s ( i d )   o n   d e l e t e   c a s c a d e , 
     c i t i e s   t e x t [ ]   n o t   n u l l   d e f a u l t   ' { } ' , 
     d i s t r i c t s   t e x t [ ]   n o t   n u l l   d e f a u l t   ' { } ' , 
     p r o p e r t y _ t y p e s   t e x t [ ]   n o t   n u l l   d e f a u l t   ' { } ' , 
     p r i c e _ m i n   n u m e r i c ,   p r i c e _ m a x   n u m e r i c , 
     i s _ a c t i v e   b o o l e a n   n o t   n u l l   d e f a u l t   t r u e , 
     n o t i f y _ c h a n n e l s   t e x t [ ]   n o t   n u l l   d e f a u l t   ' { i n _ a p p , e m a i l } ' , 
     c r e a t e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) 
 ) ; 
 a l t e r   t a b l e   p u b l i c . b u y e r _ p r e f e r e n c e s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 d r o p   p o l i c y   i f   e x i s t s   " b p _ o w n e r "   o n   p u b l i c . b u y e r _ p r e f e r e n c e s ; 
 c r e a t e   p o l i c y   " b p _ o w n e r "   o n   p u b l i c . b u y e r _ p r e f e r e n c e s   f o r   a l l   u s i n g   ( u s e r _ i d   =   a u t h . u i d ( ) )   w i t h   c h e c k   ( u s e r _ i d   =   a u t h . u i d ( ) ) ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . w a t c h l i s t   ( 
     u s e r _ i d   u u i d   n o t   n u l l   r e f e r e n c e s   a u t h . u s e r s ( i d )   o n   d e l e t e   c a s c a d e , 
     l i s t i n g _ i d   u u i d   n o t   n u l l   r e f e r e n c e s   p u b l i c . l i s t i n g s ( i d )   o n   d e l e t e   c a s c a d e , 
     p r i c e _ a t _ a d d   n u m e r i c   n o t   n u l l , 
     n o t i f y _ o n _ d r o p   b o o l e a n   n o t   n u l l   d e f a u l t   t r u e , 
     d r o p _ t h r e s h o l d _ p c t   n u m e r i c   n o t   n u l l   d e f a u l t   5 . 0 , 
     a d d e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) , 
     p r i m a r y   k e y   ( u s e r _ i d ,   l i s t i n g _ i d ) 
 ) ; 
 a l t e r   t a b l e   p u b l i c . w a t c h l i s t   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 d r o p   p o l i c y   i f   e x i s t s   " w l _ o w n e r "   o n   p u b l i c . w a t c h l i s t ; 
 c r e a t e   p o l i c y   " w l _ o w n e r "   o n   p u b l i c . w a t c h l i s t   f o r   a l l   u s i n g   ( u s e r _ i d   =   a u t h . u i d ( ) )   w i t h   c h e c k   ( u s e r _ i d   =   a u t h . u i d ( ) ) ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . l i s t i n g _ m a t c h e s   ( 
     i d   b i g s e r i a l   p r i m a r y   k e y , 
     l i s t i n g _ i d   u u i d   n o t   n u l l   r e f e r e n c e s   p u b l i c . l i s t i n g s ( i d )   o n   d e l e t e   c a s c a d e , 
     u s e r _ i d   u u i d   n o t   n u l l   r e f e r e n c e s   a u t h . u s e r s ( i d )   o n   d e l e t e   c a s c a d e , 
     s c o r e   n u m e r i c   n o t   n u l l , 
     r e a s o n   j s o n b , 
     m a t c h e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) , 
     u n i q u e   ( l i s t i n g _ i d ,   u s e r _ i d ) 
 ) ; 
 a l t e r   t a b l e   p u b l i c . l i s t i n g _ m a t c h e s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 d r o p   p o l i c y   i f   e x i s t s   " l m _ o w n e r "   o n   p u b l i c . l i s t i n g _ m a t c h e s ; 
 c r e a t e   p o l i c y   " l m _ o w n e r "   o n   p u b l i c . l i s t i n g _ m a t c h e s   f o r   s e l e c t   u s i n g   ( u s e r _ i d   =   a u t h . u i d ( ) ) ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . n o t i f i c a t i o n s   ( 
     i d   b i g s e r i a l   p r i m a r y   k e y , 
     u s e r _ i d   u u i d   n o t   n u l l   r e f e r e n c e s   a u t h . u s e r s ( i d )   o n   d e l e t e   c a s c a d e , 
     t y p e   t e x t   n o t   n u l l , 
     c h a n n e l   t e x t   n o t   n u l l   c h e c k   ( c h a n n e l   i n   ( ' i n _ a p p ' , ' e m a i l ' , ' p u s h ' ) ) , 
     p a y l o a d   j s o n b   n o t   n u l l , 
     s t a t e   t e x t   n o t   n u l l   d e f a u l t   ' p e n d i n g ' , 
     c r e a t e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) , 
     r e a d _ a t   t i m e s t a m p t z 
 ) ; 
 a l t e r   t a b l e   p u b l i c . n o t i f i c a t i o n s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 d r o p   p o l i c y   i f   e x i s t s   " n o t i f _ o w n e r _ s e l e c t "   o n   p u b l i c . n o t i f i c a t i o n s ; 
 c r e a t e   p o l i c y   " n o t i f _ o w n e r _ s e l e c t "   o n   p u b l i c . n o t i f i c a t i o n s   f o r   s e l e c t   u s i n g   ( u s e r _ i d   =   a u t h . u i d ( ) ) ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . c o m m i s s i o n _ c a m p a i g n s   ( 
     i d   u u i d   p r i m a r y   k e y   d e f a u l t   g e n _ r a n d o m _ u u i d ( ) , 
     n a m e   t e x t   n o t   n u l l , 
     a c t i v e   b o o l e a n   n o t   n u l l   d e f a u l t   t r u e , 
     s t a r t s _ a t   t i m e s t a m p t z   n o t   n u l l , 
     e n d s _ a t   t i m e s t a m p t z   n o t   n u l l , 
     c o m m i s s i o n _ p c t _ o v e r r i d e   n u m e r i c   n o t   n u l l   d e f a u l t   0 , 
     c r e a t e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) 
 ) ; 
 a l t e r   t a b l e   p u b l i c . c o m m i s s i o n _ c a m p a i g n s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 d r o p   p o l i c y   i f   e x i s t s   " c c _ p u b l i c _ r e a d "   o n   p u b l i c . c o m m i s s i o n _ c a m p a i g n s ; 
 c r e a t e   p o l i c y   " c c _ p u b l i c _ r e a d "   o n   p u b l i c . c o m m i s s i o n _ c a m p a i g n s 
     f o r   s e l e c t   u s i n g   ( a c t i v e   =   t r u e   a n d   n o w ( )   b e t w e e n   s t a r t s _ a t   a n d   e n d s _ a t ) ; 
 
 c o m m i t ; 
 

-- ═══ 20260516120300_v2_kyc_moderation_bulk.sql ═══

b e g i n ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . k y c _ v e r i f i c a t i o n s   ( 
     i d   u u i d   p r i m a r y   k e y   d e f a u l t   g e n _ r a n d o m _ u u i d ( ) , 
     s u b j e c t _ t y p e   t e x t   n o t   n u l l   c h e c k   ( s u b j e c t _ t y p e   i n   ( ' i n d i v i d u a l ' , ' o r g a n i z a t i o n ' , ' p r o p e r t y ' ) ) , 
     s u b j e c t _ i d   u u i d   n o t   n u l l , 
     s u b m i t t e d _ b y   u u i d   n o t   n u l l   r e f e r e n c e s   a u t h . u s e r s ( i d ) , 
     o r g a n i z a t i o n _ i d   u u i d   r e f e r e n c e s   p u b l i c . o r g a n i z a t i o n s ( i d )   o n   d e l e t e   c a s c a d e , 
     s t a t u s   t e x t   n o t   n u l l   d e f a u l t   ' i n _ r e v i e w ' , 
     d o c u m e n t s   j s o n b   n o t   n u l l , 
     d e c l a r e d _ d a t a   j s o n b   n o t   n u l l   d e f a u l t   ' { } ' , 
     c r e a t e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) 
 ) ; 
 a l t e r   t a b l e   p u b l i c . k y c _ v e r i f i c a t i o n s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 d r o p   p o l i c y   i f   e x i s t s   " k y c _ s u b m i t t e r _ r e a d "   o n   p u b l i c . k y c _ v e r i f i c a t i o n s ; 
 c r e a t e   p o l i c y   " k y c _ s u b m i t t e r _ r e a d "   o n   p u b l i c . k y c _ v e r i f i c a t i o n s   f o r   s e l e c t   u s i n g   ( s u b m i t t e d _ b y   =   a u t h . u i d ( ) ) ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . m o d e r a t i o n _ q u e u e   ( 
     i d   u u i d   p r i m a r y   k e y   d e f a u l t   g e n _ r a n d o m _ u u i d ( ) , 
     e n t i t y _ t y p e   t e x t   n o t   n u l l , 
     e n t i t y _ i d   t e x t   n o t   n u l l , 
     r e a s o n   t e x t   n o t   n u l l , 
     s t a t u s   t e x t   n o t   n u l l   d e f a u l t   ' p e n d i n g ' , 
     c r e a t e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) 
 ) ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . b u l k _ j o b s   ( 
     i d   u u i d   p r i m a r y   k e y   d e f a u l t   g e n _ r a n d o m _ u u i d ( ) , 
     o r g a n i z a t i o n _ i d   u u i d   n o t   n u l l   r e f e r e n c e s   p u b l i c . o r g a n i z a t i o n s ( i d )   o n   d e l e t e   c a s c a d e , 
     u s e r _ i d   u u i d   n o t   n u l l   r e f e r e n c e s   a u t h . u s e r s ( i d ) , 
     k i n d   t e x t   n o t   n u l l , 
     s t a t u s   t e x t   n o t   n u l l   d e f a u l t   ' q u e u e d ' , 
     i n p u t   j s o n b   n o t   n u l l , 
     r e s u l t   j s o n b , 
     c r e a t e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) 
 ) ; 
 a l t e r   t a b l e   p u b l i c . b u l k _ j o b s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 d r o p   p o l i c y   i f   e x i s t s   " b j _ o r g _ r e a d "   o n   p u b l i c . b u l k _ j o b s ; 
 c r e a t e   p o l i c y   " b j _ o r g _ r e a d "   o n   p u b l i c . b u l k _ j o b s 
     f o r   s e l e c t   u s i n g   ( h a s _ o r g _ r o l e ( o r g a n i z a t i o n _ i d ,   a r r a y [ ' o w n e r ' , ' a d m i n ' , ' m a n a g e r ' , ' a g e n t ' ] ) ) ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . e v e n t s   ( 
     i d   b i g s e r i a l   p r i m a r y   k e y , 
     o c c u r r e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) , 
     u s e r _ i d   u u i d , 
     k i n d   t e x t   n o t   n u l l , 
     e n t i t y _ t y p e   t e x t   n o t   n u l l , 
     e n t i t y _ i d   t e x t   n o t   n u l l , 
     m e t a d a t a   j s o n b 
 ) ; 
 c r e a t e   i n d e x   i f   n o t   e x i s t s   e v _ e n t i t y _ t i m e   o n   p u b l i c . e v e n t s ( e n t i t y _ t y p e ,   e n t i t y _ i d ,   o c c u r r e d _ a t   d e s c ) ; 
 
 c r e a t e   t a b l e   i f   n o t   e x i s t s   p u b l i c . c o r p o r a t e _ l e a d s   ( 
     i d   u u i d   p r i m a r y   k e y   d e f a u l t   g e n _ r a n d o m _ u u i d ( ) , 
     n a m e   t e x t   n o t   n u l l , 
     c o m p a n y   t e x t   n o t   n u l l , 
     r o l e   t e x t , 
     e m a i l   t e x t   n o t   n u l l , 
     p h o n e   t e x t , 
     o r g _ s i z e   t e x t , 
     m e s s a g e   t e x t , 
     s t a t u s   t e x t   n o t   n u l l   d e f a u l t   ' n e w ' , 
     c r e a t e d _ a t   t i m e s t a m p t z   n o t   n u l l   d e f a u l t   n o w ( ) 
 ) ; 
 a l t e r   t a b l e   p u b l i c . c o r p o r a t e _ l e a d s   e n a b l e   r o w   l e v e l   s e c u r i t y ; 
 d r o p   p o l i c y   i f   e x i s t s   " c l _ i n s e r t _ a n y o n e "   o n   p u b l i c . c o r p o r a t e _ l e a d s ; 
 c r e a t e   p o l i c y   " c l _ i n s e r t _ a n y o n e "   o n   p u b l i c . c o r p o r a t e _ l e a d s   f o r   i n s e r t   w i t h   c h e c k   ( t r u e ) ; 
 
 c r e a t e   o r   r e p l a c e   f u n c t i o n   p u b l i c . o r g _ d a s h b o a r d _ s t a t s ( p _ o r g   u u i d ) 
 r e t u r n s   j s o n b   l a n g u a g e   p l p g s q l   s e c u r i t y   i n v o k e r   s e t   s e a r c h _ p a t h   =   p u b l i c   a s   $ $ 
 b e g i n 
     i f   n o t   h a s _ o r g _ r o l e ( p _ o r g ,   a r r a y [ ' o w n e r ' , ' a d m i n ' , ' m a n a g e r ' , ' a g e n t ' , ' v i e w e r ' ] )   t h e n 
         r a i s e   e x c e p t i o n   ' f o r b i d d e n ' ; 
     e n d   i f ; 
     r e t u r n   j s o n b _ b u i l d _ o b j e c t ( 
         ' t o t a l _ l i s t i n g s ' ,   ( s e l e c t   c o u n t ( * )   f r o m   l i s t i n g s   w h e r e   o r g a n i z a t i o n _ i d   =   p _ o r g ) , 
         ' a c t i v e _ l i s t i n g s ' ,   ( s e l e c t   c o u n t ( * )   f r o m   l i s t i n g s   w h e r e   o r g a n i z a t i o n _ i d   =   p _ o r g   a n d   s t a t u s   =   ' a c t i v e ' ) , 
         ' t o t a l _ v i e w s _ 3 0 d ' ,   0 , 
         ' t o t a l _ l e a d s _ 3 0 d ' ,   0 , 
         ' c o n v e r s i o n _ p c t ' ,   0 , 
         ' a i _ u s e d ' ,   ( s e l e c t   a i _ u s e d _ t h i s _ p e r i o d   f r o m   o r g a n i z a t i o n s   w h e r e   i d   =   p _ o r g ) , 
         ' a i _ q u o t a ' ,   ( s e l e c t   a i _ q u o t a _ m o n t h l y   f r o m   o r g a n i z a t i o n s   w h e r e   i d   =   p _ o r g ) , 
         ' p e n d i n g _ k y c ' ,   ( s e l e c t   c o u n t ( * )   f r o m   k y c _ v e r i f i c a t i o n s   w h e r e   o r g a n i z a t i o n _ i d   =   p _ o r g   a n d   s t a t u s   =   ' i n _ r e v i e w ' ) , 
         ' o p e n _ d i s p u t e s ' ,   0 
     ) ; 
 e n d   $ $ ; 
 g r a n t   e x e c u t e   o n   f u n c t i o n   p u b l i c . o r g _ d a s h b o a r d _ s t a t s ( u u i d )   t o   a u t h e n t i c a t e d ; 
 
 c o m m i t ; 
 

-- ═══ 20260516120400_v2_pgmq_matching.sql ═══

- -   p g m q   h e l p e r s   +   o p t i o n a l   m a t c h i n g   c r o n   ( p g _ c r o n   m u s t   b e   e n a b l e d   i n   D a s h b o a r d ) 
 b e g i n ; 
 
 c r e a t e   e x t e n s i o n   i f   n o t   e x i s t s   p g m q   c a s c a d e ; 
 
 d o   $ $   b e g i n   p e r f o r m   p g m q . c r e a t e ( ' b u l k _ l i s t i n g s ' ) ;   e x c e p t i o n   w h e n   o t h e r s   t h e n   n u l l ;   e n d   $ $ ; 
 d o   $ $   b e g i n   p e r f o r m   p g m q . c r e a t e ( ' k y c _ p r e s c a n ' ) ;   e x c e p t i o n   w h e n   o t h e r s   t h e n   n u l l ;   e n d   $ $ ; 
 
 c r e a t e   o r   r e p l a c e   f u n c t i o n   p u b l i c . p g m q _ s e n d ( q u e u e _ n a m e   t e x t ,   m s g   j s o n b ) 
 r e t u r n s   b i g i n t   l a n g u a g e   s q l   s e c u r i t y   d e f i n e r   s e t   s e a r c h _ p a t h   =   p u b l i c ,   p g m q   a s   $ $ 
     s e l e c t   p g m q . s e n d ( q u e u e _ n a m e ,   m s g ) ; 
 $ $ ; 
 g r a n t   e x e c u t e   o n   f u n c t i o n   p u b l i c . p g m q _ s e n d ( t e x t ,   j s o n b )   t o   a u t h e n t i c a t e d ,   s e r v i c e _ r o l e ; 
 
 c r e a t e   o r   r e p l a c e   f u n c t i o n   p u b l i c . p g m q _ r e a d ( q u e u e _ n a m e   t e x t ,   v t   i n t ,   q t y   i n t ) 
 r e t u r n s   s e t o f   p g m q . m e s s a g e _ r e c o r d 
 l a n g u a g e   s q l   s e c u r i t y   d e f i n e r   s e t   s e a r c h _ p a t h   =   p u b l i c ,   p g m q   a s   $ $ 
     s e l e c t   *   f r o m   p g m q . r e a d ( q u e u e _ n a m e ,   v t ,   q t y ) ; 
 $ $ ; 
 g r a n t   e x e c u t e   o n   f u n c t i o n   p u b l i c . p g m q _ r e a d ( t e x t ,   i n t ,   i n t )   t o   s e r v i c e _ r o l e ; 
 
 c r e a t e   o r   r e p l a c e   f u n c t i o n   p u b l i c . p g m q _ d e l e t e ( q u e u e _ n a m e   t e x t ,   m s g _ i d   b i g i n t ) 
 r e t u r n s   b o o l e a n   l a n g u a g e   s q l   s e c u r i t y   d e f i n e r   s e t   s e a r c h _ p a t h   =   p u b l i c ,   p g m q   a s   $ $ 
     s e l e c t   p g m q . d e l e t e ( q u e u e _ n a m e ,   m s g _ i d ) ; 
 $ $ ; 
 g r a n t   e x e c u t e   o n   f u n c t i o n   p u b l i c . p g m q _ d e l e t e ( t e x t ,   b i g i n t )   t o   s e r v i c e _ r o l e ; 
 
 - -   m a t c h i n g   c r o n :   r e q u i r e s   p g _ c r o n   +   p g _ n e t   +   a p p . f u n c t i o n s _ u r l   +   a p p . c r o n _ s e c r e t 
 d o   $ c r o n $ 
 b e g i n 
     i f   e x i s t s   ( s e l e c t   1   f r o m   p g _ e x t e n s i o n   w h e r e   e x t n a m e   =   ' p g _ c r o n ' )   t h e n 
         b e g i n 
             p e r f o r m   c r o n . u n s c h e d u l e ( j o b i d )   f r o m   c r o n . j o b   w h e r e   j o b n a m e   =   ' m a t c h i n g - f a n o u t - e v e r y - m i n u t e ' ; 
         e x c e p t i o n   w h e n   o t h e r s   t h e n   n u l l ; 
         e n d ; 
         p e r f o r m   c r o n . s c h e d u l e ( 
             ' m a t c h i n g - f a n o u t - e v e r y - m i n u t e ' , 
             ' *   *   *   *   * ' , 
             $ c m d $ 
                 s e l e c t   n e t . h t t p _ p o s t ( 
                     u r l   : =   c u r r e n t _ s e t t i n g ( ' a p p . f u n c t i o n s _ u r l ' ,   t r u e )   | |   ' / m a t c h i n g - f a n o u t ' , 
                     h e a d e r s   : =   j s o n b _ b u i l d _ o b j e c t ( 
                         ' c o n t e n t - t y p e ' ,   ' a p p l i c a t i o n / j s o n ' , 
                         ' x - i n t e r n a l - s e c r e t ' ,   c u r r e n t _ s e t t i n g ( ' a p p . c r o n _ s e c r e t ' ,   t r u e ) 
                     ) , 
                     b o d y   : =   ' { } ' : : j s o n b 
                 ) 
             $ c m d $ 
         ) ; 
     e n d   i f ; 
 e x c e p t i o n   w h e n   o t h e r s   t h e n 
     r a i s e   n o t i c e   ' m a t c h i n g   c r o n   s k i p p e d :   % ' ,   s q l e r r m ; 
 e n d   $ c r o n $ ; 
 
 c o m m i t ; 
 
