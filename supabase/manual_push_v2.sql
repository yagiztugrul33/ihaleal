-- ihaleal.com — TUR #12 manuel SQL (Supabase SQL Editor → Run)
-- db push kullanılmıyor; bu dosya tek seferde yapıştırılır.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) profiles — ek alanlar (migration ile aynı)
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists e_devlet_status text default 'none'
    check (e_devlet_status in ('none','pending','verified','rejected')),
  add column if not exists iban text,
  add column if not exists tc_kimlik_no text,
  add column if not exists role text default 'individual'
    check (role in ('individual','agent','bank','admin'));

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_tc_idx on public.profiles(tc_kimlik_no)
  where tc_kimlik_no is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) listings — geçici test politikası (KYC şartsız INSERT)
--    TUR #13’te sıkılaştırılacak (KYC + e-Devlet + paket).
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "listings_insert_kyc" on public.listings;
create policy "listings_insert_authenticated" on public.listings
  for insert with check (auth.uid() = seller_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) auctions — satıcı kendi ilanı için INSERT (önceki şemada yalnızca SELECT vardı)
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "auctions_insert_listing_owner" on public.auctions;
create policy "auctions_insert_listing_owner" on public.auctions
  for insert with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );
