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

