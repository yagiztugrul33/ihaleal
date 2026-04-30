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
