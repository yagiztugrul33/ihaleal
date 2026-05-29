-- R14 Müteahhit Lansman Sprint — schema (developer_projects + project_units + listings FK)
-- Master 2026-05-30 onayı (X tüm Cursor önerileri kabul)
-- Tasarım kararları: D1 ayrı tablo, E1 unit→listing, H1 mock PDF + admin queue

-- ============================================================
-- 1) profiles.role enum genişlet — muteahhit ekle
-- ============================================================

-- Mevcut profiles tablosu: role text (constraint var mı kontrol)
-- Sprint 3 sonrası: individual/agent/bank/admin enum
-- Genişlet: + muteahhit

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'profiles' AND constraint_type = 'CHECK' AND constraint_name LIKE '%role%'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IS NULL OR role IN ('individual', 'agent', 'bank', 'admin', 'muteahhit'));

-- ============================================================
-- 2) developer_projects tablo
-- ============================================================

CREATE TABLE IF NOT EXISTS public.developer_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  ruhsat_no TEXT,
  ada_parsel TEXT,
  province TEXT,
  district TEXT,
  neighborhood TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  stage TEXT CHECK (stage IN ('planning', 'foundation', 'construction', 'finishing', 'ready', 'delivered')) DEFAULT 'planning',
  total_units INTEGER DEFAULT 0,
  units_sold INTEGER DEFAULT 0,
  units_reserved INTEGER DEFAULT 0,
  progress_pct INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  description TEXT,
  ruhsat_document_url TEXT,
  ruhsat_status TEXT CHECK (ruhsat_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3) project_units tablo
-- ============================================================

CREATE TABLE IF NOT EXISTS public.project_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.developer_projects(id) ON DELETE CASCADE NOT NULL,
  unit_no TEXT NOT NULL,
  block TEXT,
  floor INTEGER,
  unit_type TEXT,
  m2_brut NUMERIC,
  m2_net NUMERIC,
  price_try NUMERIC,
  status TEXT CHECK (status IN ('available', 'reserved', 'sold', 'cancelled')) DEFAULT 'available',
  reserved_by UUID REFERENCES auth.users(id),
  sold_to UUID REFERENCES auth.users(id),
  listing_id UUID,  -- listings FK, sonra eklenir (cycle önleme)
  reserved_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, unit_no)
);

-- ============================================================
-- 4) listings tablosuna project_id + unit_id + is_lansman ekle
-- ============================================================

ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.developer_projects(id) ON DELETE SET NULL;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.project_units(id) ON DELETE SET NULL;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS is_lansman BOOLEAN DEFAULT FALSE;

-- project_units.listing_id FK ekle (cycle önlendi)
ALTER TABLE public.project_units
  DROP CONSTRAINT IF EXISTS project_units_listing_id_fkey;
ALTER TABLE public.project_units
  ADD CONSTRAINT project_units_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE SET NULL;

-- ============================================================
-- 5) Index'ler
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_developer_projects_org ON public.developer_projects(org_id);
CREATE INDEX IF NOT EXISTS idx_developer_projects_owner ON public.developer_projects(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_developer_projects_ruhsat_status ON public.developer_projects(ruhsat_status);
CREATE INDEX IF NOT EXISTS idx_project_units_project ON public.project_units(project_id);
CREATE INDEX IF NOT EXISTS idx_project_units_status ON public.project_units(status);
CREATE INDEX IF NOT EXISTS idx_project_units_listing ON public.project_units(listing_id);
CREATE INDEX IF NOT EXISTS idx_listings_project ON public.listings(project_id);
CREATE INDEX IF NOT EXISTS idx_listings_lansman ON public.listings(is_lansman) WHERE is_lansman = TRUE;

-- ============================================================
-- 6) RLS — developer_projects
-- ============================================================

ALTER TABLE public.developer_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "developer_view_own_projects" ON public.developer_projects;
CREATE POLICY "developer_view_own_projects"
  ON public.developer_projects FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "public_view_verified_projects" ON public.developer_projects;
CREATE POLICY "public_view_verified_projects"
  ON public.developer_projects FOR SELECT
  TO anon, authenticated
  USING (ruhsat_status = 'verified');

DROP POLICY IF EXISTS "developer_insert_own_projects" ON public.developer_projects;
CREATE POLICY "developer_insert_own_projects"
  ON public.developer_projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "developer_update_own_projects" ON public.developer_projects;
CREATE POLICY "developer_update_own_projects"
  ON public.developer_projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_user_id);

-- Admin onay için ayrı policy (admin role check)
DROP POLICY IF EXISTS "admin_manage_projects" ON public.developer_projects;
CREATE POLICY "admin_manage_projects"
  ON public.developer_projects FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 7) RLS — project_units
-- ============================================================

ALTER TABLE public.project_units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "developer_manage_own_units" ON public.project_units;
CREATE POLICY "developer_manage_own_units"
  ON public.project_units FOR ALL
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.developer_projects WHERE owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.developer_projects WHERE owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "public_view_available_units" ON public.project_units;
CREATE POLICY "public_view_available_units"
  ON public.project_units FOR SELECT
  TO anon, authenticated
  USING (
    status IN ('available', 'reserved') AND
    project_id IN (
      SELECT id FROM public.developer_projects WHERE ruhsat_status = 'verified'
    )
  );

-- ============================================================
-- 8) Grants
-- ============================================================

GRANT SELECT ON public.developer_projects TO anon, authenticated;
GRANT INSERT, UPDATE ON public.developer_projects TO authenticated;
GRANT SELECT ON public.project_units TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.project_units TO authenticated;

-- Service role tüm yetki
GRANT ALL ON public.developer_projects TO service_role;
GRANT ALL ON public.project_units TO service_role;

-- ============================================================
-- 9) updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_developer_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS developer_projects_updated_at_trigger ON public.developer_projects;
CREATE TRIGGER developer_projects_updated_at_trigger
  BEFORE UPDATE ON public.developer_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_developer_projects_updated_at();

-- ============================================================
-- 10) Smoke test
-- ============================================================

DO $$
DECLARE
  v_proj_count INT;
  v_unit_count INT;
BEGIN
  SELECT COUNT(*) INTO v_proj_count FROM public.developer_projects;
  SELECT COUNT(*) INTO v_unit_count FROM public.project_units;
  RAISE NOTICE 'R14 schema OK — developer_projects=%, project_units=%', v_proj_count, v_unit_count;
END $$;
