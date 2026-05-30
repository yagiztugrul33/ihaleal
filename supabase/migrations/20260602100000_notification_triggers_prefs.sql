-- N16 — Bildirim tetikleyicileri + tercihler + okundu güncelleme
-- CC-apply: Claude Code canlı Supabase'e uygulayacak

begin;

-- Okundu işaretleme (istemci markRead)
drop policy if exists "notif_owner_update" on public.notifications;
create policy "notif_owner_update"
  on public.notifications
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant update on public.notifications to authenticated;

-- Bildirim tercihleri
create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  offer_enabled boolean not null default true,
  search_match_enabled boolean not null default true,
  message_enabled boolean not null default true,
  favorite_enabled boolean not null default true,
  kyc_enabled boolean not null default true,
  auction_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

drop policy if exists "notif_prefs_owner" on public.notification_preferences;
create policy "notif_prefs_owner"
  on public.notification_preferences
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.notification_preferences to authenticated;

create or replace function public.should_notify(p_user_id uuid, p_kind text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    case p_kind
      when 'offer' then np.offer_enabled
      when 'search_match' then np.search_match_enabled
      when 'message' then np.message_enabled
      when 'favorite' then np.favorite_enabled
      when 'kyc' then np.kyc_enabled
      when 'auction' then np.auction_enabled
      else true
    end,
    true
  )
  from public.notification_preferences np
  where np.user_id = p_user_id
  union all
  select true
  limit 1;
$$;

-- Yeni mesaj bildirimi
create or replace function public.tg_chat_message_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient uuid;
  v_listing_title text;
begin
  select cp.user_id into v_recipient
  from public.chat_thread_participants cp
  where cp.thread_id = new.thread_id
    and cp.user_id <> new.sender_id
  limit 1;

  if v_recipient is null then
    return new;
  end if;

  if not public.should_notify(v_recipient, 'message') then
    return new;
  end if;

  select l.title into v_listing_title
  from public.chat_threads ct
  join public.listings l on l.id = ct.listing_id
  where ct.id = new.thread_id;

  insert into public.notifications (user_id, type, channel, payload, state)
  values (
    v_recipient,
    'chat_message',
    'in_app',
    jsonb_build_object(
      'title', 'Yeni mesaj',
      'body', coalesce(v_listing_title, 'İlan') || ' sohbetinde yeni mesaj.',
      'threadId', new.thread_id
    ),
    'pending'
  );

  return new;
end;
$$;

drop trigger if exists chat_messages_notify on public.chat_messages;
create trigger chat_messages_notify
  after insert on public.chat_messages
  for each row execute function public.tg_chat_message_notify();

-- Favori bildirimi (satıcıya)
create or replace function public.tg_watchlist_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seller_id uuid;
  v_title text;
begin
  select l.seller_id, l.title into v_seller_id, v_title
  from public.listings l
  where l.id = new.listing_id;

  if v_seller_id is null or v_seller_id = new.user_id then
    return new;
  end if;

  if not public.should_notify(v_seller_id, 'favorite') then
    return new;
  end if;

  insert into public.notifications (user_id, type, channel, payload, state)
  values (
    v_seller_id,
    'listing_favorited',
    'in_app',
    jsonb_build_object(
      'title', 'İlan favorilere eklendi',
      'body', coalesce(v_title, 'İlanınız') || ' bir kullanıcı tarafından favorilere alındı.',
      'listingId', new.listing_id
    ),
    'pending'
  );

  return new;
end;
$$;

drop trigger if exists watchlist_notify on public.watchlist;
create trigger watchlist_notify
  after insert on public.watchlist
  for each row execute function public.tg_watchlist_notify();

commit;

select tgname from pg_trigger where tgname in ('chat_messages_notify', 'watchlist_notify');
