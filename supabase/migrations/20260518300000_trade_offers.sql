-- P2P trade offers on listings (takas teklifi)
begin;

do $$ begin
  create type public.trade_status as enum (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'CANCELLED',
    'LEGAL_REVIEW',
    'COMPLETED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.target_type as enum ('REAL_ESTATE', 'VEHICLE');
exception when duplicate_object then null;
end $$;

create table if not exists public.trade_offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  proposer_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.target_type not null,
  offered_listing_id uuid references public.listings(id) on delete set null,
  offered_asset_details jsonb,
  cash_difference numeric(14, 2) not null default 0,
  currency text not null default 'TRY',
  status public.trade_status not null default 'PENDING',
  is_legal_approved boolean not null default false,
  is_deposit_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trade_offers_asset_xor check (
    offered_listing_id is not null
    or offered_asset_details is not null
  )
);

create index if not exists trade_offers_listing_idx on public.trade_offers (listing_id);
create index if not exists trade_offers_proposer_idx on public.trade_offers (proposer_id);
create index if not exists trade_offers_status_idx on public.trade_offers (status);

create or replace function public.trade_offers_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trade_offers_updated_at on public.trade_offers;
create trigger trade_offers_updated_at
  before update on public.trade_offers
  for each row execute function public.trade_offers_set_updated_at();

alter table public.trade_offers enable row level security;

drop policy if exists trade_offers_select_party on public.trade_offers;
create policy trade_offers_select_party on public.trade_offers
  for select
  using (
    proposer_id = auth.uid()
    or exists (
      select 1 from public.listings l
      where l.id = trade_offers.listing_id and l.seller_id = auth.uid()
    )
  );

-- Inserts/updates via SECURITY DEFINER RPC only (see below).

create or replace function public.create_trade_offer(payload jsonb)
returns public.trade_offers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_listing public.listings%rowtype;
  v_offered public.listings%rowtype;
  v_row public.trade_offers%rowtype;
  v_listing_id uuid := (payload->>'listingId')::uuid;
  v_offered_listing_id uuid := nullif(payload->>'offeredListingId', '')::uuid;
  v_target public.target_type := (payload->>'targetType')::public.target_type;
  v_cash numeric := coalesce((payload->>'cashDifference')::numeric, 0);
begin
  if v_user is null then
    raise exception 'authentication required';
  end if;

  select * into v_listing from public.listings where id = v_listing_id;
  if not found or v_listing.status <> 'active' then
    raise exception 'Hedef ilan aktif değil veya yayından kaldırılmış.';
  end if;
  if v_listing.seller_id = v_user then
    raise exception 'Kendi ilanınıza takas teklifi gönderemezsiniz.';
  end if;

  if v_offered_listing_id is not null then
    select * into v_offered from public.listings where id = v_offered_listing_id;
    if not found or v_offered.status <> 'active' then
      raise exception 'Teklif edilen ilan aktif değil.';
    end if;
    if v_offered.seller_id <> v_user then
      raise exception 'Teklif edilen ilan size ait olmalıdır.';
    end if;
  elsif payload->'offeredAssetDetails' is null then
    raise exception 'offeredListingId veya offeredAssetDetails zorunludur.';
  end if;

  -- Legal pre-check hook (Tapu/UYAP integration placeholder)
  if coalesce((payload->>'skipLegalCheck')::boolean, false) is false then
    if coalesce((payload->'legalFlags'->>'concordat')::boolean, false)
      or coalesce((payload->'legalFlags'->>'lien')::boolean, false)
      or coalesce((payload->'legalFlags'->>'inheritance')::boolean, false) then
      raise exception 'Teklif edilen varlık üzerinde hukuki risk (haciz, şerh, konkordato) tespit edildi.';
    end if;
  end if;

  insert into public.trade_offers (
    listing_id,
    proposer_id,
    target_type,
    offered_listing_id,
    offered_asset_details,
    cash_difference,
    currency,
    status
  ) values (
    v_listing_id,
    v_user,
    v_target,
    v_offered_listing_id,
    payload->'offeredAssetDetails',
    v_cash,
    coalesce(payload->>'currency', 'TRY'),
    'PENDING'
  )
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.respond_trade_offer(p_offer_id uuid, p_accept boolean)
returns public.trade_offers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_offer public.trade_offers%rowtype;
  v_listing public.listings%rowtype;
begin
  if v_user is null then
    raise exception 'authentication required';
  end if;

  select * into v_offer from public.trade_offers where id = p_offer_id for update;
  if not found then
    raise exception 'Takas teklifi bulunamadı.';
  end if;

  select * into v_listing from public.listings where id = v_offer.listing_id;
  if v_listing.seller_id <> v_user then
    raise exception 'Bu işlem için yetkiniz bulunmamaktadır.';
  end if;
  if v_offer.status <> 'PENDING' then
    raise exception 'Bu teklif zaten sonuçlandırılmış.';
  end if;

  update public.trade_offers
  set status = case when p_accept then 'ACCEPTED'::public.trade_status else 'REJECTED'::public.trade_status end
  where id = p_offer_id
  returning * into v_offer;

  return v_offer;
end;
$$;

create or replace function public.cancel_trade_offer(p_offer_id uuid)
returns public.trade_offers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_offer public.trade_offers%rowtype;
begin
  if v_user is null then
    raise exception 'authentication required';
  end if;

  select * into v_offer from public.trade_offers where id = p_offer_id for update;
  if not found then
    raise exception 'Takas teklifi bulunamadı.';
  end if;
  if v_offer.proposer_id <> v_user then
    raise exception 'Bu işlem için yetkiniz bulunmamaktadır.';
  end if;
  if v_offer.status <> 'PENDING' then
    raise exception 'Yalnızca bekleyen teklifler iptal edilebilir.';
  end if;

  update public.trade_offers
  set status = 'CANCELLED'
  where id = p_offer_id
  returning * into v_offer;

  return v_offer;
end;
$$;

revoke all on function public.create_trade_offer(jsonb) from public;
grant execute on function public.create_trade_offer(jsonb) to authenticated;

revoke all on function public.respond_trade_offer(uuid, boolean) from public;
grant execute on function public.respond_trade_offer(uuid, boolean) to authenticated;

revoke all on function public.cancel_trade_offer(uuid) from public;
grant execute on function public.cancel_trade_offer(uuid) to authenticated;

commit;
