-- ════════════════════════════════════════════════════════════════════════════
-- EK MIGRATION — DEVICE PUSH TOKENS (K1+K4 çözümü)
-- Hedef: production wsjifesrdaeorrdzbvmk
-- Migration: 20260527130000_device_push_tokens.sql
-- Risk: 🟢 DÜŞÜK (tamamen yeni tablo + RPC; mevcut hiçbir şeyi etkilemez)
-- Süre: <3 dakika
-- ────────────────────────────────────────────────────────────────────────────
-- KAYNAK: müfettiş raporu K1 (mobile/features/notifications/pushNotifications.ts:63
-- direkt .from('device_push_tokens').upsert çağırıyor — tablo yoktu).
-- ÇÖZÜM: tablo + RLS owner-only + register_push_token RPC (SECURITY DEFINER).
-- Cursor mobil tarafta `client.from(...).upsert()` yerine `client.rpc('register_push_token', ...)` çağırmalı.
-- ────────────────────────────────────────────────────────────────────────────
-- ÖNERİLEN SIRA: Faz 2'DEN SONRA bas — Faz 2'deki tg_set_updated_at fonksiyonu
-- updated_at trigger'ı için kullanılır. Faz 2'den önce basarsanız trigger
-- atlanır (DO bloku exception ile geçer); updated_at default ile sabit kalır.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

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

create index if not exists device_push_tokens_user_idx on public.device_push_tokens(user_id);

alter table public.device_push_tokens enable row level security;

drop policy if exists "dpt_owner_select" on public.device_push_tokens;
create policy "dpt_owner_select" on public.device_push_tokens
  for select using (user_id = auth.uid());

drop policy if exists "dpt_owner_modify" on public.device_push_tokens;
create policy "dpt_owner_modify" on public.device_push_tokens
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- updated_at auto-trigger (Faz 2 sonrası anlamlı; öncesi atlanır)
do $$ begin
  if exists (select 1 from pg_proc
             where proname='tg_set_updated_at' and pronamespace='public'::regnamespace) then
    drop trigger if exists trg_dpt_updated_at on public.device_push_tokens;
    create trigger trg_dpt_updated_at before update on public.device_push_tokens
      for each row execute function public.tg_set_updated_at();
  end if;
exception when others then null; end $$;

-- RPC: register_push_token
create or replace function public.register_push_token(
  p_token text,
  p_platform text,
  p_device_label text default null,
  p_app_version text default null
) returns jsonb language plpgsql security definer set search_path = public as $rpt$
declare v_uid uuid := auth.uid(); v_id uuid;
begin
  if v_uid is null then return jsonb_build_object('status','error','message','Giriş yapmalısınız'); end if;
  if p_token is null or length(p_token) < 8 then return jsonb_build_object('status','error','message','Geçersiz token'); end if;
  if p_platform not in ('ios','android','web') then return jsonb_build_object('status','error','message','Geçersiz platform'); end if;

  insert into public.device_push_tokens (
    user_id, token, platform, device_label, app_version, last_seen_at, updated_at
  ) values (v_uid, p_token, p_platform, p_device_label, p_app_version, now(), now())
  on conflict (user_id, token) do update set
    platform = excluded.platform,
    device_label = coalesce(excluded.device_label, public.device_push_tokens.device_label),
    app_version = coalesce(excluded.app_version, public.device_push_tokens.app_version),
    last_seen_at = now(), updated_at = now()
  returning id into v_id;

  return jsonb_build_object('status','ok','id', v_id);
end $rpt$;

revoke all on function public.register_push_token(text, text, text, text) from public;
grant execute on function public.register_push_token(text, text, text, text) to authenticated;

create or replace function public.unregister_push_token(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $urt$
declare v_uid uuid := auth.uid(); v_count int;
begin
  if v_uid is null then return jsonb_build_object('status','error','message','Giriş yapmalısınız'); end if;
  delete from public.device_push_tokens where user_id = v_uid and token = p_token;
  get diagnostics v_count = row_count;
  return jsonb_build_object('status','ok','deleted', v_count);
end $urt$;

revoke all on function public.unregister_push_token(text) from public;
grant execute on function public.unregister_push_token(text) to authenticated;

-- schema_migrations tracking
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES (
  '20260527130000',
  'device_push_tokens',
  ARRAY['-- Deployed via CLI on 2026-05-27. Mobile push token storage + register_push_token RPC.']::text[]
) ON CONFLICT (version) DO NOTHING;

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
-- SMOKE
-- ════════════════════════════════════════════════════════════════════════════

-- (S1) Tablo + index var mı?
SELECT 'S1 table+index' AS check,
       EXISTS(SELECT 1 FROM information_schema.tables
              WHERE table_schema='public' AND table_name='device_push_tokens') AS table_exists,
       EXISTS(SELECT 1 FROM pg_indexes
              WHERE schemaname='public' AND indexname='device_push_tokens_user_idx') AS index_exists,
       (SELECT relrowsecurity FROM pg_class WHERE relname='device_push_tokens' AND relnamespace='public'::regnamespace) AS rls_on;

-- (S2) Policy'ler var mı?
SELECT 'S2 policies' AS check, string_agg(policyname, ',' ORDER BY policyname) AS present
FROM pg_policies WHERE schemaname='public' AND tablename='device_push_tokens';

-- (S3) RPC'ler var mı?
SELECT 'S3 RPCs' AS check, string_agg(proname, ',' ORDER BY proname) AS present
FROM pg_proc WHERE pronamespace='public'::regnamespace
  AND proname IN ('register_push_token','unregister_push_token');

-- (S4) Behavioral smoke: anon (auth.uid()=null) ile çağrı → error
DO $$ DECLARE v_result jsonb; BEGIN
  -- Reset JWT to no user
  PERFORM set_config('request.jwt.claim.sub', '', true);
  SELECT public.register_push_token('test-token-1234567890', 'ios', 'TestDevice', '1.0.0') INTO v_result;
  IF v_result->>'status' = 'error' THEN
    RAISE NOTICE 'S4 anon rejected OK';
  ELSE
    RAISE EXCEPTION 'S4 FAIL — anon kabul edildi: %', v_result;
  END IF;
END $$;

-- (S5) Behavioral smoke: random UID ile çağrı → fail (auth.users'da satır yok, FK)
-- NOT: bu ASLA üretim user'ı değil — gen_random_uuid() rastgele.
-- auth.users FK ihlali bekleniyor (fonksiyon catch etmiyor — exception fırlar).
-- Test bunu yapmıyor (FK exception transaction'ı abort eder), atlandı.

-- (S6) schema_migrations
SELECT 'S6 tracking' AS check, version, name
FROM supabase_migrations.schema_migrations WHERE version='20260527130000';

-- (S7) REGRESSION
DO $$ DECLARE v_result json; BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-aaaa-bbbb-cccc-000000099003', true);
  SELECT public.execute_buy_now(gen_random_uuid(), gen_random_uuid(), 'smoke-push-tokens') INTO v_result;
  IF v_result->>'code' = 'kyc_required' THEN RAISE NOTICE 'S7 REGRESSION OK';
  ELSE RAISE EXCEPTION 'S7 REGRESSION FAIL'; END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════════
-- REVERSE
-- ════════════════════════════════════════════════════════════════════════════
/*
BEGIN;
drop function if exists public.unregister_push_token(text);
drop function if exists public.register_push_token(text, text, text, text);
drop trigger if exists trg_dpt_updated_at on public.device_push_tokens;
drop table if exists public.device_push_tokens;
DELETE FROM supabase_migrations.schema_migrations WHERE version='20260527130000';
COMMIT;
*/
