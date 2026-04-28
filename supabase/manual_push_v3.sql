-- ihaleal.com — TUR #13 manuel SQL (Supabase SQL Editor → Run)
-- Önce TUR #12 `manual_push_v2.sql` uygulanmış olmalı.
-- db push kullanılmıyorsa bu dosyayı tek seferde yapıştırın.
-- Dosya sonunda ADIM 13.3 (listings RLS sıkı) yer alır.

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

-- ─────────────────────────────────────────────────────────────────────────────
-- ADIM 13.3 — Listings RLS sıkı mod (TUR #12 gevşetmesinin geri alınması)
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "listings_insert_authenticated" on public.listings;
drop policy if exists "listings_insert_kyc" on public.listings;

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
