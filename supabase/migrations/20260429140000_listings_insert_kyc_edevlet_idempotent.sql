-- listings_insert_kyc_edevlet — yeniden çalıştırılabilir (42710: policy already exists önlenir)
-- Önceki INSERT politikasıyla uyumlu: doğrulanmış KYC + satıcı = giriş yapmış kullanıcı

DROP POLICY IF EXISTS "listings_insert_kyc_edevlet" ON public.listings;

CREATE POLICY "listings_insert_kyc_edevlet" ON public.listings
  FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND kyc_status = 'verified'
    )
  );
