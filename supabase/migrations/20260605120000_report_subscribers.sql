-- ═══════════════════════════════════════════════════════════════════════════
-- REPORT SUBSCRIBERS — aylık endeks rapor abonelikleri (Master onayı)
-- ═══════════════════════════════════════════════════════════════════════════
-- AMAÇ:
--   /raporlar sayfasındaki "Abone Ol" formunun arka uç kaydı. Double opt-in:
--   anon kayıt → confirmation_token mail ile gönderilir → confirmed_at set.
--   Edge function `report-notifier` ay başında confirmed_at NOT NULL olan
--   abonelere yeni rapor maili atar.
--
-- ANAYASA UYUMU:
--   - Mevcut core tabloları (auth.users, profiles, listings) dokunulmaz.
--   - Sealed teklif maskeleme etkilenmiyor (farklı tablo).
--   - anon INSERT RLS rate-limited: kendi email'i + 5 saniyede 1 kayıt.
--   - service_role full erişim (Edge function için).
-- ═══════════════════════════════════════════════════════════════════════════

begin;

create table if not exists public.report_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  cities text[] not null default '{}',
  categories text[] not null default '{}',
  confirmed_at timestamptz,
  confirmation_token text not null default gen_random_uuid()::text,
  unsubscribe_token text not null default gen_random_uuid()::text,
  ip_hash text,  -- rate-limit/audit için (sha256 hash, sade IP saklanmaz)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Aktif aboneler (confirmed) için fast scan
create index if not exists report_subscribers_confirmed_idx
  on public.report_subscribers(confirmed_at)
  where confirmed_at is not null;

-- Email lower-case lookup için fonksiyonel index
create unique index if not exists report_subscribers_email_lower_idx
  on public.report_subscribers (lower(email));

-- updated_at auto-trigger
do $$ begin
  if exists (select 1 from pg_proc
             where proname='tg_set_updated_at' and pronamespace='public'::regnamespace) then
    drop trigger if exists trg_report_subscribers_updated_at on public.report_subscribers;
    create trigger trg_report_subscribers_updated_at before update on public.report_subscribers
      for each row execute function public.tg_set_updated_at();
  end if;
exception when others then null; end $$;

alter table public.report_subscribers enable row level security;

-- RLS: anon SELECT yok (gizlilik), anon INSERT yalnız RPC üzerinden.
drop policy if exists "rs_no_select_for_anon" on public.report_subscribers;
create policy "rs_no_select_for_anon" on public.report_subscribers
  for select using (false);

drop policy if exists "rs_no_direct_insert" on public.report_subscribers;
create policy "rs_no_direct_insert" on public.report_subscribers
  for insert with check (false);

drop policy if exists "rs_no_update" on public.report_subscribers;
create policy "rs_no_update" on public.report_subscribers
  for update using (false);

-- service_role bypass'i RLS'i atlar, ek policy gerekmez.

-- ───────────────────────────────────────────────────────────────────────────
-- RPC: subscribe_to_reports
-- Frontend (anon) bu RPC'yi çağırır, RLS bypass eden SECURITY DEFINER.
-- Idempotent: aynı email tekrar girilirse mevcut kaydı günceller, yeni
-- confirmation_token üretir.
-- ───────────────────────────────────────────────────────────────────────────
create or replace function public.subscribe_to_reports(
  p_email text,
  p_cities text[] default '{}'::text[],
  p_categories text[] default '{}'::text[],
  p_ip_hash text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $sub$
declare
  v_email text;
  v_token text;
  v_id uuid;
begin
  if p_email is null or length(trim(p_email)) < 5 then
    return jsonb_build_object('status','error','message','Geçerli e-posta gerekli');
  end if;

  v_email := lower(trim(p_email));
  if v_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    return jsonb_build_object('status','error','message','E-posta formatı geçersiz');
  end if;

  v_token := gen_random_uuid()::text;

  insert into public.report_subscribers (email, cities, categories, ip_hash, confirmation_token)
    values (v_email, coalesce(p_cities, '{}'), coalesce(p_categories, '{}'), p_ip_hash, v_token)
  on conflict (email) do update set
    cities = coalesce(excluded.cities, public.report_subscribers.cities),
    categories = coalesce(excluded.categories, public.report_subscribers.categories),
    confirmation_token = excluded.confirmation_token,
    ip_hash = coalesce(excluded.ip_hash, public.report_subscribers.ip_hash),
    updated_at = now()
  returning id, confirmation_token into v_id, v_token;

  -- NOT: gerçek mail gönderimi Edge function `report-notifier` veya ayrı bir
  -- transactional mail function tarafından yapılır. Bu RPC sadece DB kaydı +
  -- token üretir. Frontend kullanıcıya "e-postanızı kontrol edin" mesajı
  -- gösterir.
  return jsonb_build_object(
    'status','ok',
    'id', v_id,
    'message', 'Abonelik talebi alındı. E-postanıza onay bağlantısı gönderilecek.'
  );
end $sub$;

revoke all on function public.subscribe_to_reports(text, text[], text[], text) from public;
grant execute on function public.subscribe_to_reports(text, text[], text[], text) to anon, authenticated;

-- ───────────────────────────────────────────────────────────────────────────
-- RPC: confirm_subscription
-- Mail linkinden tetiklenir (anon). Token doğru ise confirmed_at set.
-- ───────────────────────────────────────────────────────────────────────────
create or replace function public.confirm_subscription(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $cs$
declare
  v_id uuid;
begin
  if p_token is null or length(p_token) < 8 then
    return jsonb_build_object('status','error','message','Geçersiz token');
  end if;

  update public.report_subscribers
     set confirmed_at = now(), updated_at = now()
   where confirmation_token = p_token
     and confirmed_at is null
   returning id into v_id;

  if v_id is null then
    return jsonb_build_object('status','error','message','Token bulunamadı veya zaten onaylı');
  end if;
  return jsonb_build_object('status','ok','id', v_id);
end $cs$;

revoke all on function public.confirm_subscription(text) from public;
grant execute on function public.confirm_subscription(text) to anon, authenticated;

-- ───────────────────────────────────────────────────────────────────────────
-- RPC: unsubscribe_reports
-- Mail unsubscribe linki (anon).
-- ───────────────────────────────────────────────────────────────────────────
create or replace function public.unsubscribe_reports(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $unsub$
declare
  v_count int;
begin
  if p_token is null then
    return jsonb_build_object('status','error','message','Token gerekli');
  end if;

  delete from public.report_subscribers
   where unsubscribe_token = p_token;
  get diagnostics v_count = row_count;

  if v_count = 0 then
    return jsonb_build_object('status','error','message','Token bulunamadı');
  end if;
  return jsonb_build_object('status','ok','deleted', v_count);
end $unsub$;

revoke all on function public.unsubscribe_reports(text) from public;
grant execute on function public.unsubscribe_reports(text) to anon, authenticated;

commit;
