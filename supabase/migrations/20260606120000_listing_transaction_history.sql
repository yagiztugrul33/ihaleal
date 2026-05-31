-- ═══════════════════════════════════════════════════════════════════════════
-- LISTING TRANSACTION HISTORY — mülk sicili (geçmiş işlem)
-- ═══════════════════════════════════════════════════════════════════════════
-- AMAÇ:
--   İhaleal Endeks Raporu (mülke özel künye PDF) için "geçmiş el değiştirme +
--   fiyat trendi" bölümü. Bir ilan için sıralı işlem geçmişi.
--
-- ANAYASA UYUMU:
--   - auth.users / listings DOKUNMA — sadece YENİ tablo + FK.
--   - Sealed teklif maskeleme (listing_offers_safe) DOKUNMA.
--   - public SELECT: mülk geçmişi pazar şeffaflığı için açık (sahip/alıcı bilgisi
--     YOK, sadece tarih + tutar + işlem tipi).
--   - INSERT yalnız authenticated platform admin veya service_role.
--
-- DEMO SEED:
--   - Demo seed bu migration'da DEĞİL — runtime'da catalog tabanlı deterministic
--     fallback üretilir (src/lib/reports/transactionHistory.ts).
-- ═══════════════════════════════════════════════════════════════════════════

begin;

create table if not exists public.listing_transaction_history (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null,            -- catalog id veya listings.id (UUID veya prop-XXX)
  transaction_date timestamptz not null,
  transaction_type text not null check (transaction_type in ('listing','sale','price_change')),
  price_try numeric(18,2) not null,
  owner_changed boolean not null default false,
  source text not null default 'platform',  -- platform | tkgm | external
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists lth_listing_date_idx
  on public.listing_transaction_history(listing_id, transaction_date desc);

alter table public.listing_transaction_history enable row level security;

-- public SELECT — pazar şeffaflığı, sahip bilgisi maskeli
drop policy if exists "lth_public_read" on public.listing_transaction_history;
create policy "lth_public_read" on public.listing_transaction_history
  for select using (true);

-- anon / authenticated INSERT yok — sadece service_role
drop policy if exists "lth_no_anon_insert" on public.listing_transaction_history;
create policy "lth_no_anon_insert" on public.listing_transaction_history
  for insert with check (false);

drop policy if exists "lth_no_anon_update" on public.listing_transaction_history;
create policy "lth_no_anon_update" on public.listing_transaction_history
  for update using (false);

drop policy if exists "lth_no_anon_delete" on public.listing_transaction_history;
create policy "lth_no_anon_delete" on public.listing_transaction_history
  for delete using (false);

-- ───────────────────────────────────────────────────────────────────────────
-- RPC: get_listing_history(listing_id)
-- Frontend deterministic fallback gerekiyorsa içerir — boş döndüğünde
-- src/lib/reports/transactionHistory.ts catalog-based demo üretir.
-- ───────────────────────────────────────────────────────────────────────────
create or replace function public.get_listing_history(p_listing_id text)
returns table (
  id uuid,
  transaction_date timestamptz,
  transaction_type text,
  price_try numeric,
  owner_changed boolean,
  source text,
  notes text
)
language sql
stable
security invoker
set search_path = public
as $$
  select id, transaction_date, transaction_type, price_try, owner_changed, source, notes
    from public.listing_transaction_history
   where listing_id = p_listing_id
   order by transaction_date asc;
$$;

grant execute on function public.get_listing_history(text) to anon, authenticated;

commit;
