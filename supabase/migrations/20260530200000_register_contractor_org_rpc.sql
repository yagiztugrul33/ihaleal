-- R14 P0+1 — register_contractor_org RPC (SECURITY DEFINER atomic)
--
-- KOK NEDEN: PostgREST'in INSERT + RETURNING (.select() ile) RLS chicken-egg:
--   org_select_member SELECT policy "user organization_members'ta active" ister.
--   Yeni olusturulan org'da hicbir member yok -> RETURNING reddedilir -> 403.
--
-- COZUM: SECURITY DEFINER fonksiyon atomic transaction icinde org + members
-- ekler, RLS bypass eder. Anon engeli + org_type hardcode + slug guvenli.

CREATE OR REPLACE FUNCTION public.register_contractor_org(
  p_legal_name  text,
  p_tax_number  text,
  p_address     text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_org_id  uuid;
  v_slug    text;
  v_safe    text;
BEGIN
  -- 1) Anon kullanici engeli (SECURITY DEFINER ile RLS bypass yapilirken acik kapi olmasin)
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthenticated' USING ERRCODE = '42501';
  END IF;

  -- 2) Input validation
  IF p_legal_name IS NULL OR length(trim(p_legal_name)) < 2 THEN
    RAISE EXCEPTION 'invalid_legal_name' USING ERRCODE = '22023';
  END IF;
  IF p_tax_number IS NULL OR length(trim(p_tax_number)) < 5 THEN
    RAISE EXCEPTION 'invalid_tax_number' USING ERRCODE = '22023';
  END IF;

  -- 3) Slug uretici: lowercase ASCII + suffix (TR karakter sade)
  v_safe := lower(trim(p_legal_name));
  v_safe := translate(v_safe, 'çğıöşüâî', 'cgiosuai');
  v_safe := regexp_replace(v_safe, '[^a-z0-9]+', '-', 'g');
  v_safe := regexp_replace(v_safe, '^-+|-+$', '', 'g');
  v_safe := substring(v_safe FROM 1 FOR 48);
  IF length(v_safe) = 0 THEN v_safe := 'muteahhit'; END IF;
  v_slug := v_safe || '-' || substring(gen_random_uuid()::text FROM 1 FOR 8);

  -- 4) organizations INSERT (org_type HARDCODE 'contractor' — enjekte engeli)
  INSERT INTO public.organizations (
    slug,
    legal_name,
    display_name,
    org_type,
    tax_number,
    settings
  )
  VALUES (
    v_slug,
    trim(p_legal_name),
    trim(p_legal_name),
    'contractor',
    trim(p_tax_number),
    jsonb_build_object(
      'ruhsat_pending', true,
      'company_address', COALESCE(trim(p_address), ''),
      'created_via', 'self_register'
    )
  )
  RETURNING id INTO v_org_id;

  -- 5) organization_members INSERT — kullaniciyi owner olarak ekle
  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role,
    status
  )
  VALUES (
    v_org_id,
    v_user_id,
    'owner',
    'active'
  );

  RETURN v_org_id;
END;
$$;

-- GRANT yalniz authenticated'a (anon caginca yine de auth.uid()=null -> exception)
REVOKE ALL ON FUNCTION public.register_contractor_org(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_contractor_org(text, text, text) TO authenticated;

-- KANIT ipucu (master Dashboard SQL veya benim db query ile):
-- 1) authenticated context: SELECT register_contractor_org('TestCo','1234567890','Adres') -> uuid
-- 2) anon context: yine REVOKE PUBLIC ile reddedilir; gercek anon JWT'siz cagri 42501 raise.
