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

-- Mahsup + komisyon kaydı RPC (KOMİSYON %2 + %2 matrah)
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
