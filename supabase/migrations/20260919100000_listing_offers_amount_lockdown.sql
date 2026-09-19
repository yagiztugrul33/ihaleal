-- P0: sealed (kapali zarf) teklif tutari satici tarafindan API uzerinden okunabiliyordu.
-- KOK SORUN: listing_offers tablosunda authenticated'a tablo-geneli SELECT verilmisti
-- (20260528170000_grants_restore_systemic.sql: "grant select on all tables ... to authenticated"
-- + default privileges) ve satici RLS politikasi tum kolonlari aciyordu. 20260604120000'deki
-- listing_offers_safe view'i security_invoker=true idi ve istemci tarafindan hic kullanilmiyordu;
-- tablo dogrudan okunabildigi icin view atlanabiliyordu.
--
-- COZUM:
--  1) Tabloda amount_try / counter_amount_try kolonlarini authenticated'dan SELECT icin kapat
--     (kolon bazli GRANT). RLS politikalarina dokunulmuyor, satir gorunurlugu ayni kaliyor.
--  2) Satici UPDATE'ini yalniz status + counter_amount_try ile sinirla
--     (amount_try / buyer_id / is_sealed artik degistirilemez).
--  3) listing_offers_safe view'ini security_invoker=false yap: tutar kolonlarini view sahibi
--     okur, satir filtresi (alici kendi teklifi, satici kendi ilaninin teklifleri) view'in
--     WHERE'inde. Tek okuma yolu bu view.
--
-- UYARI: 20260528170000_grants_restore_systemic.sql yeniden calistirilirsa
-- "grant select on all tables in schema public to authenticated" bu kilidi acar.
-- O migration'dan SONRA bu dosya tekrar uygulanmali.

begin;

revoke select on public.listing_offers from authenticated;
grant select (id, listing_id, buyer_id, status, is_sealed, sealed_until, created_at, updated_at)
  on public.listing_offers to authenticated;

revoke update on public.listing_offers from authenticated;
grant update (status, counter_amount_try) on public.listing_offers to authenticated;
-- insert grant'i degismedi (20260601180000_listing_offers.sql).

drop view if exists public.listing_offers_safe;
create view public.listing_offers_safe
with (security_invoker = false) as
select
  o.id,
  o.listing_id,
  o.buyer_id,
  o.status,
  o.is_sealed,
  o.sealed_until,
  o.created_at,
  o.updated_at,
  case
    -- Alici kendi teklifini her zaman gorur
    when o.buyer_id = auth.uid() then o.amount_try
    -- Sealed + sure dolmadi (veya sure yok) -> maskele
    when o.is_sealed = true and (o.sealed_until is null or o.sealed_until > now()) then null
    else o.amount_try
  end as amount_try,
  -- Karsi teklifi satici kendisi yazar; iki taraf da gorur.
  o.counter_amount_try
from public.listing_offers o
where o.buyer_id = auth.uid()
   or exists (
     select 1 from public.listings l
     where l.id = o.listing_id and l.seller_id = auth.uid()
   );

revoke all on public.listing_offers_safe from public, anon;
grant select on public.listing_offers_safe to authenticated;

comment on view public.listing_offers_safe is
  'Teklif okumanin tek yolu. Satici sealed+suresi dolmamis tekliflerde amount_try=NULL gorur. security_invoker=false; satir filtresi WHERE icinde.';

commit;
