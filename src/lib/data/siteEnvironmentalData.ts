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

export async function fetchSiteEnvironmentalData(params: {
  lat: number;
  lon: number;
  tiltDeg?: number;
  aspectDeg?: number;
}): Promise<SiteEnvironmentalBundle> {
  const [pvgis, climate, elevation] = await Promise.all([
    fetchPvgisSolar(params),
    fetchOpenMeteoClimate(params.lat, params.lon),
    fetchElevation(params.lat, params.lon),
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
