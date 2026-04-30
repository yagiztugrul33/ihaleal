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

-- ===== v6 SON =====
