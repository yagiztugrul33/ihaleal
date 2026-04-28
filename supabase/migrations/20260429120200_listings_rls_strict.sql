-- ADIM 13.3 — Listings INSERT gevşek moddan sıkı moda (TUR #12 `listings_insert_authenticated` yerine).
-- Paket / abonelik kapısı şemada yok; ileride WITH CHECK genişletilebilir.

drop policy if exists "listings_insert_authenticated" on public.listings;
drop policy if exists "listings_insert_kyc" on public.listings;

create policy "listings_insert_kyc_edevlet" on public.listings
  for insert with check (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.kyc_status = 'verified'
        and coalesce(p.e_devlet_status, 'none') = 'verified'
    )
  );
