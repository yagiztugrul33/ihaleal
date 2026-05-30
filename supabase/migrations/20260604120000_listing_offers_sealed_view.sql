-- Pentest 2 KISMI fix: sealed teklif amount maskeleme.
-- KOK SORUN: listing_offers tablosu satıcı için amount_try ve counter_amount_try
-- gosterimini policy ile kolon-bazli maskelemiyor (PostgreSQL'de column-level RLS
-- yoktur). Sealed (is_sealed=true) + sealed_until > NOW() olan tekliflerde
-- satici amount'u erken gormus olur.
--
-- COZUM: Tablonun yanina VIEW ekle. Buyer kendi teklifini her zaman amount ile gorur;
-- satici sealed + zaman dolmadiysa amount'u NULL gorur. Frontend yeni VIEW'i kullanir
-- (mevcut tablo erisimi geri-uyum icin acik birakildi).
--
-- security_invoker=true: VIEW caller'in RLS'sini kullanir, base table policy'leri
-- normalde calisir (yetki bypass yok).

CREATE OR REPLACE VIEW public.listing_offers_safe
WITH (security_invoker = true) AS
SELECT
  id,
  listing_id,
  buyer_id,
  status,
  is_sealed,
  sealed_until,
  created_at,
  updated_at,
  CASE
    -- Alici kendi teklifini her zaman gorur
    WHEN buyer_id = auth.uid() THEN amount_try
    -- Sealed + sure dolmadi -> maskele
    WHEN is_sealed = true AND (sealed_until IS NULL OR sealed_until > NOW()) THEN NULL
    -- Sealed olmayan veya sealed_until gecmis -> goster
    ELSE amount_try
  END AS amount_try,
  CASE
    WHEN buyer_id = auth.uid() THEN counter_amount_try
    WHEN is_sealed = true AND (sealed_until IS NULL OR sealed_until > NOW()) THEN NULL
    ELSE counter_amount_try
  END AS counter_amount_try
FROM public.listing_offers;

-- VIEW base table'in RLS'sini taşır; ek GRANT yine de gerekir.
GRANT SELECT ON public.listing_offers_safe TO authenticated;

COMMENT ON VIEW public.listing_offers_safe IS
  'Sealed teklif amount maskeleme VIEW. Satici sealed_until > NOW() olan tekliflerde amount_try=NULL gorur. Buyer kendi teklifini her zaman gorur. Frontend bu VIEW uzerinden okumali.';
