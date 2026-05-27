-- ═══════════════════════════════════════════════════════════════════════════
-- KYC GUARD — execute_buy_now + register_bid_deposit (sert sunucu enforcement)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- AMAÇ:
--   Denetim sonucu: bu iki RPC istemci-tarafı KYC kontrolüne (BuyNow.tsx /
--   AuctionDetail.tsx içinde `profiles.kyc_status` select) güveniyordu. RPC'ler
--   doğrudan çağrıldığında KYC'siz bypass edilebiliyordu. Bu migration sunucu
--   tarafına SERT enforcement ekler: profiles.kyc_status != 'verified' ise RPC
--   doğrudan reddeder.
--
-- KAYNAK FONKSİYON GÖVDELERİ (değiştirilmeden kopyalanır, ekleme YALNIZ KYC
-- bloğudur; auth check'ten sonra, rate_limit'ten önce):
--   - register_bid_deposit: 20260501120000_ai_buynow_deposit.sql:305-372
--   - execute_buy_now:      20260501120000_ai_buynow_deposit.sql:377-489
--
-- KOLON DOĞRULAMA:
--   public.profiles.kyc_status — 20260428120000_initial_schema.sql:9-10
--   `text not null default 'none' check (kyc_status in ('none','pending','verified','rejected'))`
--
-- DAVRANIŞ:
--   - kyc_status = 'verified'  → mevcut precondition zinciri AYNEN devam (no-op)
--   - aksi her durumda (null/none/pending/rejected) → typed error:
--       { status: 'error', code: 'kyc_required', message: '<TR mesaj>' }
--
-- ROLLBACK:
--   PostgreSQL `CREATE OR REPLACE FUNCTION` kalıcı bir yer-değiştirmedir; otomatik
--   geri alma yoktur. Bu migration'ı geri almak için:
--     1. Önceki gövdeleri (20260501120000_ai_buynow_deposit.sql:305-372 ve 377-489)
--        ayrı bir reverse-migration dosyasına `create or replace function …` ile
--        aynısı şekilde yapıştır, deploy et.
--     2. Veya bu migration'ı düzenleyip yeni bir sürümünü deploy et.
--   GRANT'ler değişmediği için ayrıca revoke gerekmez.
--
-- DEPLOY ADIMI (kullanıcı tetikleyecek; bu dosya yalnız repo'ya alındı):
--   1. `supabase db push --include-all` veya CI pipeline migration'ı uygular.
--   2. Smoke: kyc_status='none' bir kullanıcı ile RPC çağırıp `kyc_required` döndüğü
--      doğrulanmalı.
-- ═══════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────────
-- 1) register_bid_deposit — KYC guard EKLENDİ (auth sonrası, rate_limit öncesi)
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.register_bid_deposit(
  p_listing_id uuid,
  p_auction_id uuid,
  p_base_amount_try numeric,
  p_deposit_amount_try numeric,
  p_pre_auth_ref text,
  p_context text,
  p_idempotency_key text
) returns json
language plpgsql
security definer
set search_path = public
as $dep$
declare
  v_uid uuid := auth.uid();
  v_rl json;
  v_id uuid;
  v_kyc_status text;
begin
  if v_uid is null then
    return json_build_object('status','error','message','Giriş yapmalısınız');
  end if;

  -- ═══ KYC GUARD (sert; istemci atlatılamaz) ═══
  select kyc_status into v_kyc_status from public.profiles where id = v_uid;
  if v_kyc_status is null or v_kyc_status <> 'verified' then
    return json_build_object(
      'status','error',
      'code','kyc_required',
      'message','Teminat/ödeme yetkisi için KYC doğrulaması zorunlu. Profilinizden kimlik doğrulamayı tamamlayın.'
    );
  end if;

  if p_context is null or p_context not in ('bid','buy_now') then
    return json_build_object('status','error','message','Geçersiz işlem bağlamı');
  end if;

  v_rl := public.rate_limit_check(
    case when p_context = 'buy_now' then 'buy_now_attempts' else 'pre_auth_attempts' end,
    case when p_context = 'buy_now' then 5 else 10 end
  );
  if coalesce((v_rl->>'ok')::boolean, false) is not true then
    return json_build_object('status','error','message','Çok sık deneme — lütfen daha sonra tekrar deneyin');
  end if;

  if not exists (select 1 from public.listings l where l.id = p_listing_id) then
    return json_build_object('status','error','message','İlan bulunamadı');
  end if;

  insert into public.bid_deposits (
    listing_id,
    auction_id,
    buyer_id,
    base_amount_try,
    deposit_rate,
    deposit_amount_try,
    status,
    iyzico_pre_auth_ref,
    pre_auth_at,
    context,
    metadata
  ) values (
    p_listing_id,
    p_auction_id,
    v_uid,
    p_base_amount_try,
    0.015,
    p_deposit_amount_try,
    'authorized',
    p_pre_auth_ref,
    now(),
    p_context,
    jsonb_build_object('idempotency_key', p_idempotency_key, 'is_mock', true)
  )
  returning id into v_id;

  return json_build_object('status','ok','deposit_id', v_id);
end;
$dep$;

-- ──────────────────────────────────────────────────────────────────────────
-- 2) execute_buy_now — KYC guard EKLENDİ (auth sonrası, rate_limit öncesi)
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.execute_buy_now(
  p_listing_id uuid,
  p_deposit_id uuid,
  p_idempotency_key text
) returns json
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_buyer_id uuid := auth.uid();
  v_listing record;
  v_auction record;
  v_buy_now_id uuid;
  v_deposit record;
  v_report_approved boolean;
  v_rl json;
  v_kyc_status text;
begin
  if v_buyer_id is null then
    return json_build_object('status','error','message','Giriş yapmalısınız');
  end if;

  -- ═══ KYC GUARD (sert; istemci atlatılamaz) ═══
  select kyc_status into v_kyc_status from public.profiles where id = v_buyer_id;
  if v_kyc_status is null or v_kyc_status <> 'verified' then
    return json_build_object(
      'status','error',
      'code','kyc_required',
      'message','Hemen Al için KYC doğrulaması zorunlu. Profilinizden kimlik doğrulamayı tamamlayın.'
    );
  end if;

  v_rl := public.rate_limit_check('buy_now_attempts', 5);
  if coalesce((v_rl->>'ok')::boolean, false) is not true then
    return json_build_object('status','error','message','Çok sık deneme — lütfen daha sonra tekrar deneyin');
  end if;

  if exists (
    select 1 from public.buy_now_purchases
    where listing_id = p_listing_id
      and buyer_id = v_buyer_id
      and status in ('pending_payment','confirmed')
  ) then
    return json_build_object('status','duplicate','message','Bu ilan için zaten Hemen Al işleminiz var');
  end if;

  select * into v_listing from public.listings
    where id = p_listing_id for update;

  if not found then
    return json_build_object('status','error','message','İlan bulunamadı');
  end if;

  if v_listing.status != 'active' then
    return json_build_object('status','error','message','İlan aktif değil');
  end if;

  if v_listing.buy_now_price_try is null then
    return json_build_object('status','error','message','Bu ilanda Hemen Al fiyatı yok');
  end if;

  if coalesce(v_listing.buy_now_disabled, false) then
    return json_build_object('status','error','message','Hemen Al kapatıldı');
  end if;

  select * into v_auction from public.auctions
    where listing_id = p_listing_id
    order by created_at desc nulls last
    limit 1
    for update;

  if not found then
    return json_build_object('status','error','message','İhale kaydı bulunamadı');
  end if;

  if v_auction.status not in ('scheduled','live') then
    return json_build_object('status','error','message','İhale tamamlanmış veya iptal');
  end if;

  select exists(
    select 1 from public.report_approvals ra
    join public.property_analysis_reports r on r.id = ra.report_id
    where r.listing_id = p_listing_id and ra.user_id = v_buyer_id
  ) into v_report_approved;

  if not v_report_approved then
    return json_build_object('status','error','message','Önce AI analiz raporunu onaylamalısınız');
  end if;

  select * into v_deposit from public.bid_deposits
    where id = p_deposit_id
      and buyer_id = v_buyer_id
      and listing_id = p_listing_id
      and status = 'authorized'
      and context = 'buy_now';

  if not found then
    return json_build_object('status','error','message','Geçerli blokaj bulunamadı');
  end if;

  insert into public.buy_now_purchases (
    listing_id, auction_id, buyer_id, amount_try, deposit_id,
    buyer_report_approved_at, buyer_terms_accepted_at,
    status
  ) values (
    p_listing_id, v_auction.id, v_buyer_id, v_listing.buy_now_price_try, p_deposit_id,
    now(), now(),
    'pending_payment'
  ) returning id into v_buy_now_id;

  update public.auctions set status = 'ended'
    where listing_id = p_listing_id;

  update public.listings set status = 'sold', updated_at = now()
    where id = p_listing_id;

  return json_build_object(
    'status','ok',
    'buy_now_id', v_buy_now_id,
    'amount', v_listing.buy_now_price_try
  );
end;
$fn$;

-- ──────────────────────────────────────────────────────────────────────────
-- GRANT'ler — orijinaliyle aynı; CREATE OR REPLACE grant'leri korur ama
-- defensive olarak yeniden grant ediyoruz.
-- ──────────────────────────────────────────────────────────────────────────

grant execute on function public.register_bid_deposit(uuid, uuid, numeric, numeric, text, text, text) to authenticated;
grant execute on function public.execute_buy_now(uuid, uuid, text) to authenticated;
