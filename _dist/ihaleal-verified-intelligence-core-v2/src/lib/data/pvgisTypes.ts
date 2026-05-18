/** PVGIS API response types — browser calls proxy only (Supabase Edge Function) */

export type PvgisMonthlyPoint = {
  month: number;
  irradiationKwhM2: number;
};

export type PvgisSolarResponse = {
  source: "pvgis_live" | "pvgis_cache" | "manual_fallback";
  lat: number;
  lon: number;
  tiltDeg: number;
  annualIrradiationKwhM2: number;
  monthlyIrradiationKwhM2: number[];
  fetchedAt: string;
  providerAvailable: boolean;
};

export type PvgisProxyError = {
  code: "PROVIDER_UNAVAILABLE" | "INVALID_COORDS" | "TIMEOUT" | "PARSE_ERROR";
  message: string;
};

export function isPvgisSolarResponse(v: unknown): v is PvgisSolarResponse {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.annualIrradiationKwhM2 === "number" &&
    Array.isArray(o.monthlyIrradiationKwhM2) &&
    o.monthlyIrradiationKwhM2.length === 12 &&
    o.monthlyIrradiationKwhM2.every((x) => typeof x === "number" && Number.isFinite(x))
  );
}

export function normalizePvgisMonthly(raw: number[]): number[] {
  if (raw.length !== 12) throw new Error("PVGIS aylik dizi 12 eleman olmalidir");
  return raw.map((v, i) => {
    if (!Number.isFinite(v) || v < 0) throw new Error(`PVGIS ay ${i + 1} gecersiz`);
    return v;
  });
}