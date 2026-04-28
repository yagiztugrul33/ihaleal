-- Atomik teklif — doğrudan INSERT yerine SECURITY DEFINER RPC (RLS ile uyumlu).

create or replace function public.place_bid(
  p_auction_id uuid,
  p_amount numeric,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_high numeric;
  v_end timestamptz;
  v_status text;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 8 then
    return jsonb_build_object('ok', false, 'error', 'invalid_idempotency_key');
  end if;

  select a.current_high, a.ends_at, a.status
    into v_high, v_end, v_status
  from public.auctions a
  where a.id = p_auction_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'auction_not_found');
  end if;

  if v_status is distinct from 'live' then
    return jsonb_build_object('ok', false, 'error', 'auction_not_live');
  end if;

  if v_end <= now() then
    return jsonb_build_object('ok', false, 'error', 'auction_ended');
  end if;

  if p_amount <= v_high then
    return jsonb_build_object('ok', false, 'error', 'bid_too_low');
  end if;

  insert into public.bids (auction_id, bidder_id, amount, idempotency_key)
  values (p_auction_id, v_uid, p_amount, p_idempotency_key);

  update public.auctions
    set current_high = p_amount
  where id = p_auction_id;

  return jsonb_build_object('ok', true);
exception
  when unique_violation then
    return jsonb_build_object('ok', true, 'deduped', true);
end;
$$;

revoke all on function public.place_bid(uuid, numeric, text) from public;
grant execute on function public.place_bid(uuid, numeric, text) to authenticated;
grant execute on function public.place_bid(uuid, numeric, text) to service_role;
