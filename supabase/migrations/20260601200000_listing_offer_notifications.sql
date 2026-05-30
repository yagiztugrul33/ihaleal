-- N4 — Teklif bildirimi (listing_offers → notifications)
-- CC-apply: Claude Code canlı Supabase'e uygulayacak

begin;

create or replace function public.tg_listing_offer_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seller_id uuid;
  v_listing_title text;
begin
  if TG_OP = 'INSERT' then
    select l.seller_id, l.title into v_seller_id, v_listing_title
    from public.listings l
    where l.id = new.listing_id;

    if v_seller_id is not null and v_seller_id <> new.buyer_id then
      insert into public.notifications (user_id, type, channel, payload, state)
      values (
        v_seller_id,
        'listing_offer_new',
        'in_app',
        jsonb_build_object(
          'title', 'Yeni teklif',
          'body', coalesce(v_listing_title, 'İlan') || ' için yeni teklif alındı.',
          'listingId', new.listing_id,
          'offerId', new.id,
          'isSealed', new.is_sealed
        ),
        'pending'
      );
    end if;
    return new;
  end if;

  if TG_OP = 'UPDATE' and old.status is distinct from new.status then
    if new.status in ('accepted', 'rejected', 'countered') then
      select l.title into v_listing_title
      from public.listings l
      where l.id = new.listing_id;

      insert into public.notifications (user_id, type, channel, payload, state)
      values (
        new.buyer_id,
        'listing_offer_status',
        'in_app',
        jsonb_build_object(
          'title', case new.status
            when 'accepted' then 'Teklifiniz kabul edildi'
            when 'rejected' then 'Teklifiniz reddedildi'
            else 'Karşı teklif alındı'
          end,
          'body', coalesce(v_listing_title, 'İlan') || ' — teklif durumu güncellendi.',
          'listingId', new.listing_id,
          'offerId', new.id,
          'status', new.status,
          'counterAmountTry', new.counter_amount_try
        ),
        'pending'
      );
    end if;
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists listing_offers_notify on public.listing_offers;
create trigger listing_offers_notify
  after insert or update on public.listing_offers
  for each row execute function public.tg_listing_offer_notify();

commit;

select tgname
from pg_trigger
where tgname = 'listing_offers_notify';
