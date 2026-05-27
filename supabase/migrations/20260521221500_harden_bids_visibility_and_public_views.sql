-- Harden bid visibility:
-- 1) raw bids are readable only by bidder or listing owner
-- 2) public market depth/summary must flow through masked aggregate views

drop policy if exists "bids_select_public" on public.bids;
drop policy if exists "bids_select_bidder_or_listing_owner" on public.bids;

create policy "bids_select_bidder_or_listing_owner" on public.bids
  for select using (
    auth.uid() = bidder_id
    or exists (
      select 1
      from public.auctions a
      join public.listings l on l.id = a.listing_id
      where a.id = bids.auction_id
        and l.seller_id = auth.uid()
    )
  );

create or replace view public.auction_bid_public_summary as
select
  b.auction_id,
  count(*)::int as bid_count,
  max(b.amount_try) as highest_bid_try,
  max(b.created_at) as last_bid_at
from public.bids b
group by b.auction_id;

create or replace view public.auction_bid_public_tape as
with ranked as (
  select
    b.auction_id,
    b.id as bid_id,
    b.amount_try,
    b.created_at,
    (
      left(replace(coalesce(b.bidder_id::text, ''), '-', ''), 1)
      || '***' ||
      right(replace(coalesce(b.bidder_id::text, ''), '-', ''), 1)
    ) as bidder_mask,
    row_number() over (
      partition by b.auction_id
      order by b.amount_try desc, b.created_at desc
    ) as depth_rank
  from public.bids b
)
select
  auction_id,
  bid_id,
  amount_try,
  created_at,
  bidder_mask,
  depth_rank
from ranked
where depth_rank <= 20;

grant select on public.auction_bid_public_summary to anon, authenticated;
grant select on public.auction_bid_public_tape to anon, authenticated;
