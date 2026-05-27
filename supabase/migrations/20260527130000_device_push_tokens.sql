-- ═══════════════════════════════════════════════════════════════════════════
-- DEVICE PUSH TOKENS — mobil push bildirim altyapısı (K1 çözümü)
-- ═══════════════════════════════════════════════════════════════════════════
-- AMAÇ:
--   Cursor'ın mobil push notification ekranı (mobile/features/notifications/
--   pushNotifications.ts:63) `client.from('device_push_tokens').upsert(...)`
--   çağırıyor ama tablo yoktu. Bu migration:
--     1. device_push_tokens tablosunu yaratır (user_id + token unique)
--     2. RLS owner-only (kullanıcı sadece kendi tokenını görür/değiştirir)
--     3. register_push_token / unregister_push_token RPC'leri (SECURITY DEFINER)
--   Cursor'ın .from('device_push_tokens') yerine RPC'yi çağırması önerilir
--   (K4: user_id eksiği RPC içinde auth.uid() ile garanti).
-- ═══════════════════════════════════════════════════════════════════════════

begin;

create table if not exists public.device_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('ios','android','web')),
  device_label text,
  app_version text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

create index if not exists device_push_tokens_user_idx
  on public.device_push_tokens(user_id);

alter table public.device_push_tokens enable row level security;

-- RLS: owner-only
drop policy if exists "dpt_owner_select" on public.device_push_tokens;
create policy "dpt_owner_select" on public.device_push_tokens
  for select using (user_id = auth.uid());

drop policy if exists "dpt_owner_modify" on public.device_push_tokens;
create policy "dpt_owner_modify" on public.device_push_tokens
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- updated_at auto-trigger (eğer Faz 2'den gelen tg_set_updated_at varsa)
do $$ begin
  if exists (select 1 from pg_proc
             where proname='tg_set_updated_at' and pronamespace='public'::regnamespace) then
    drop trigger if exists trg_dpt_updated_at on public.device_push_tokens;
    create trigger trg_dpt_updated_at before update on public.device_push_tokens
      for each row execute function public.tg_set_updated_at();
  end if;
exception when others then null; end $$;

-- RPC: register_push_token
-- Cursor mobil tarafta `register_push_token(token, platform)` çağırmalı.
-- SECURITY DEFINER → auth.uid()'i RPC içinde güvenle alır;
-- istemci tarafında user_id geçirmek YOK (K4 çözüm).
create or replace function public.register_push_token(
  p_token text,
  p_platform text,
  p_device_label text default null,
  p_app_version text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $rpt$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    return jsonb_build_object('status','error','message','Giriş yapmalısınız');
  end if;
  if p_token is null or length(p_token) < 8 then
    return jsonb_build_object('status','error','message','Geçersiz token');
  end if;
  if p_platform not in ('ios','android','web') then
    return jsonb_build_object('status','error','message','Geçersiz platform');
  end if;

  insert into public.device_push_tokens (
    user_id, token, platform, device_label, app_version, last_seen_at, updated_at
  ) values (
    v_uid, p_token, p_platform, p_device_label, p_app_version, now(), now()
  )
  on conflict (user_id, token) do update set
    platform = excluded.platform,
    device_label = coalesce(excluded.device_label, public.device_push_tokens.device_label),
    app_version = coalesce(excluded.app_version, public.device_push_tokens.app_version),
    last_seen_at = now(),
    updated_at = now()
  returning id into v_id;

  return jsonb_build_object('status','ok','id', v_id);
end $rpt$;

revoke all on function public.register_push_token(text, text, text, text) from public;
grant execute on function public.register_push_token(text, text, text, text) to authenticated;

-- RPC: unregister_push_token (logout / device-uninstall)
create or replace function public.unregister_push_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $urt$
declare
  v_uid uuid := auth.uid();
  v_count int;
begin
  if v_uid is null then
    return jsonb_build_object('status','error','message','Giriş yapmalısınız');
  end if;
  delete from public.device_push_tokens
    where user_id = v_uid and token = p_token;
  get diagnostics v_count = row_count;
  return jsonb_build_object('status','ok','deleted', v_count);
end $urt$;

revoke all on function public.unregister_push_token(text) from public;
grant execute on function public.unregister_push_token(text) to authenticated;

commit;
