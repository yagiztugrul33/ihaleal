-- R13.2 — Nearby POI cache table (OSM Overpass + Google Places hybrid prep)
-- Master onayı: Sıralama C — POI cache 7-30 gün TTL
-- Edge function: nearby-poi (lat_grid/lng_grid 4 decimal precision ~11m)

CREATE TABLE IF NOT EXISTS public.nearby_poi_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lat_grid NUMERIC(10, 4) NOT NULL,
  lng_grid NUMERIC(10, 4) NOT NULL,
  radius_m INTEGER NOT NULL DEFAULT 1000,
  category TEXT NOT NULL,
  pois JSONB NOT NULL DEFAULT '[]'::jsonb,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT DEFAULT 'osm',
  UNIQUE (lat_grid, lng_grid, radius_m, category)
);

CREATE INDEX IF NOT EXISTS idx_nearby_poi_location
  ON public.nearby_poi_cache (lat_grid, lng_grid, radius_m, category);

CREATE INDEX IF NOT EXISTS idx_nearby_poi_cached_at
  ON public.nearby_poi_cache (cached_at DESC);

-- RLS: anonim read (UI tüketir), service role write (edge function)
ALTER TABLE public.nearby_poi_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_nearby_poi" ON public.nearby_poi_cache;
CREATE POLICY "anon_read_nearby_poi"
  ON public.nearby_poi_cache
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "service_role_write_nearby_poi" ON public.nearby_poi_cache;
CREATE POLICY "service_role_write_nearby_poi"
  ON public.nearby_poi_cache
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- Grants
GRANT SELECT ON public.nearby_poi_cache TO anon, authenticated;
GRANT ALL ON public.nearby_poi_cache TO service_role;
