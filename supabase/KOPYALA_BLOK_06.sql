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

-- service_fees INSERT
grant insert on public.service_fees to authenticated;

drop policy if exists "service_fees_select_own" on public.service_fees;
drop policy if exists "service_fees_select_self" on public.service_fees;
create policy "service_fees_select_self" on public.service_fees
  for select using (auth.uid() = user_id);

drop policy if exists "service_fees_insert_self" on public.service_fees;
create policy "service_fees_insert_self" on public.service_fees
  for insert with check (auth.uid() = user_id);

-- authorizations INSERT
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

-- bid_bonds yeniden adlandırma
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
