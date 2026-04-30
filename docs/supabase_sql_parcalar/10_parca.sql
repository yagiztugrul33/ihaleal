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

-- place_bid v2 — teminat zorunlu + anti-sniping
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
