-- N5 — Kayıtlı arama eşleşmesi (yeni ilan → notifications)
-- CC-apply: Claude Code canlı Supabase'e uygulayacak

begin;

create or replace function public.saved_search_listing_matches(
  p_search public.saved_searches,
  p_listing public.listings
) returns boolean
language plpgsql
immutable
as $$
declare
  v_q text;
  v_price numeric;
  v_cat text;
begin
  if p_listing.status not in ('active', 'review') then
    return false;
  end if;

  if p_search.user_id = p_listing.seller_id then
    return false;
  end if;

  v_price := coalesce(p_listing.start_price_try, 0);
  v_q := lower(trim(coalesce(p_search.query_text, '')));

  if length(v_q) >= 2 then
    if not (
      lower(coalesce(p_listing.title, '')) like '%' || v_q || '%'
      or lower(coalesce(p_listing.city, '')) like '%' || v_q || '%'
      or lower(coalesce(p_listing.district, '')) like '%' || v_q || '%'
      or lower(coalesce(p_listing.body->>'category', '')) like '%' || v_q || '%'
    ) then
      return false;
    end if;
  end if;

  if p_search.city is not null and p_search.city <> '' and lower(p_search.city) <> 'all' then
    if lower(coalesce(p_listing.city, '')) <> lower(p_search.city) then
      return false;
    end if;
  end if;

  if p_search.category is not null and p_search.category <> '' and lower(p_search.category) <> 'all' then
    v_cat := lower(coalesce(p_listing.body->>'category', p_listing.category, ''));
    if v_cat <> lower(p_search.category) then
      return false;
    end if;
  end if;

  if p_search.price_min is not null and v_price < p_search.price_min then
    return false;
  end if;

  if p_search.price_max is not null and v_price > p_search.price_max then
    return false;
  end if;

  return true;
end;
$$;

create or replace function public.tg_listing_saved_search_match()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_known jsonb;
  v_listing_id text;
begin
  if TG_OP = 'INSERT' then
    if new.status not in ('active', 'review') then
      return new;
    end if;
  elsif TG_OP = 'UPDATE' then
    if new.status not in ('active', 'review') then
      return new;
    end if;
    if old.status in ('active', 'review') and old.status = new.status then
      return new;
    end if;
  else
    return new;
  end if;

  v_listing_id := new.id::text;

  for r in select * from public.saved_searches loop
    if not public.saved_search_listing_matches(r, new) then
      continue;
    end if;

    v_known := coalesce(r.criteria->'matchedListingIds', '[]'::jsonb);
    if v_known @> to_jsonb(v_listing_id) then
      continue;
    end if;

    insert into public.notifications (user_id, type, channel, payload, state)
    values (
      r.user_id,
      'saved_search_match',
      'in_app',
      jsonb_build_object(
        'title', 'Kayıtlı arama eşleşmesi',
        'body', '"' || r.name || '" kriterlerinize yeni ilan: ' || coalesce(new.title, 'İlan') || '.',
        'searchName', r.name,
        'listingId', new.id,
        'newCount', 1
      ),
      'pending'
    );

    update public.saved_searches
    set
      criteria = jsonb_set(
        coalesce(criteria, '{}'::jsonb),
        '{matchedListingIds}',
        v_known || to_jsonb(v_listing_id)
      ),
      last_notified_at = now()
    where id = r.id;
  end loop;

  return new;
end;
$$;

drop trigger if exists listings_saved_search_match on public.listings;
create trigger listings_saved_search_match
  after insert or update of status on public.listings
  for each row execute function public.tg_listing_saved_search_match();

commit;

select tgname
from pg_trigger
where tgname = 'listings_saved_search_match';
