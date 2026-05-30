-- ACİL FIX — tg_listing_saved_search_match() 42846 cast hatası
-- Kök neden: 20260601210000 satır 72 `r record` → satır 94'te saved_searches composite bekleniyor
-- CC-apply: Claude Code canlı Supabase'e uygulayacak (listings INSERT bloklayıcı)

begin;

create or replace function public.tg_listing_saved_search_match()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.saved_searches%ROWTYPE;
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

-- Trigger zaten var; fonksiyon replace yeterli. Idempotent yeniden bağlama:
drop trigger if exists listings_saved_search_match on public.listings;
create trigger listings_saved_search_match
  after insert or update of status on public.listings
  for each row execute function public.tg_listing_saved_search_match();

commit;

select proname, prorettype::regtype
from pg_proc
where proname = 'tg_listing_saved_search_match'
  and pronamespace = 'public'::regnamespace;
