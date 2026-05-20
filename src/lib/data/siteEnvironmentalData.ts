import { fetchElevation } from "./elevationClient";
import { fetchOpenMeteoClimate } from "./openMeteoClient";
import { fetchPvgisSolar, type PvgisSolarData } from "./pvgisClient";

export type SiteEnvironmentalBundle = {
  fetchedAt: string;
  lat: number;
  lon: number;
  pvgis: PvgisSolarData | null;
  climate: Awaited<ReturnType<typeof fetchOpenMeteoClimate>>;
  elevation: Awaited<ReturnType<typeof fetchElevation>>;
  dataQuality: "high" | "partial" | "low";
  limitations: string[];
};

async function withTimeout<T>(task: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race([
      task,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), ms);
      }),
    ]);
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function fetchSiteEnvironmentalData(params: {
  lat: number;
  lon: number;
  tiltDeg?: number;
  aspectDeg?: number;
}): Promise<SiteEnvironmentalBundle> {
  const [pvgis, climate, elevation] = await Promise.all([
    withTimeout(fetchPvgisSolar(params), 8000),
    withTimeout(fetchOpenMeteoClimate(params.lat, params.lon), 8000),
    withTimeout(fetchElevation(params.lat, params.lon), 8000),
  ]);

  const limitations: string[] = [];
  if (!pvgis) limitations.push("PVGIS verisi alinamadi — bolgesel GHI varsayimi kullanilacak.");
  if (!climate) limitations.push("Iklim arsivi alinamadi.");
  if (!elevation) limitations.push("Yukseklik verisi alinamadi.");

  let dataQuality: SiteEnvironmentalBundle["dataQuality"] = "high";
  const count = [pvgis, climate, elevation].filter(Boolean).length;
  if (count === 0) dataQuality = "low";
  else if (count < 3) dataQuality = "partial";

  return {
    fetchedAt: new Date().toISOString(),
    lat: params.lat,
    lon: params.lon,
    pvgis,
    climate,
    elevation,
    dataQuality,
    limitations,
  };
}
