
export type PvgisSolarData = {
  ok: true;
  source: string;
  lat: number;
  lon: number;
  tilt: number;
  aspect: number;
  year: number;
  annualEnergyKwhPerKwp: number;
  annualIrradiationKwhM2: number;
  monthly: { month: number; E_m: number; H_i_m: number }[];
  methodologyUrl: string;
};

export async function fetchPvgisSolar(params: {
  lat: number;
  lon: number;
  tiltDeg?: number;
  aspectDeg?: number;
  year?: number;
}): Promise<PvgisSolarData | null> {
  const tilt = params.tiltDeg ?? 25;
  const aspect = params.aspectDeg ?? 0;
  const year = params.year ?? new Date().getFullYear() - 1;

  const q = new URLSearchParams({
    lat: String(params.lat),
    lon: String(params.lon),
    tilt: String(tilt),
    aspect: String(aspect),
    year: String(year),
  });
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (base) {
    try {
      const res = await fetch(`${base}/functions/v1/pvgis_solar?${q}`, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY ?? ""}`,
        },
      });
      if (res.ok) {
        const json = (await res.json()) as PvgisSolarData & { ok: boolean };
        if (json.ok) return json;
      }
    } catch {
      /* fallback below */
    }
  }

  return fetchPvgisDirect(params.lat, params.lon, tilt, aspect, year);
}

async function fetchPvgisDirect(
  lat: number,
  lon: number,
  tilt: number,
  aspect: number,
  year: number,
): Promise<PvgisSolarData | null> {
  const url = new URL("https://re.jrc.ec.europa.eu/api/v5_2/seriescalc");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("startyear", String(year));
  url.searchParams.set("endyear", String(year));
  url.searchParams.set("pvcalculation", "1");
  url.searchParams.set("peakpower", "1");
  url.searchParams.set("loss", "14");
  url.searchParams.set("angle", String(tilt));
  url.searchParams.set("aspect", String(aspect));
  url.searchParams.set("outputformat", "json");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const json = await res.json();
    const outputs = json?.outputs;
    const monthly = outputs?.monthly?.fixed;
    const totals = outputs?.totals?.fixed;
    if (!monthly?.length || !totals) return null;
    return {
      ok: true,
      source: "PVGIS v5.2 (direct)",
      lat,
      lon,
      tilt,
      aspect,
      year,
      annualEnergyKwhPerKwp: totals.E_y,
      annualIrradiationKwhM2: totals["H(i)_y"] ?? totals.E_y,
      monthly: monthly.map((row: { month: number; E_m: number; "H(i)_m": number }) => ({
        month: row.month,
        E_m: row.E_m,
        H_i_m: row["H(i)_m"],
      })),
      methodologyUrl: "https://joint-research-centre.ec.europa.eu/pvgis_en",
    };
  } catch {
    return null;
  }
}
