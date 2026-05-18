/** PVGIS API response types — browser calls proxy only (Supabase Edge Function) */

/** Monthly global irradiation on the inclined plane (kWh/m2) */
export interface PvgisMonthlyData {
  month: number;
  irradiationKwhM2: number;
}

/** Structured PVGIS calculation payload (peak power + losses + monthly series) */
export interface PvgisResponse {
  inputs: {
    latitude: number;
    longitude: number;
    peakPowerKwp: number;
    systemLossesPercent: number;
  };
  outputs: {
    monthly: PvgisMonthlyData[];
  };
}

/** @deprecated Use PvgisMonthlyData */
export type PvgisMonthlyPoint = PvgisMonthlyData;

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

export function isPvgisResponse(v: unknown): v is PvgisResponse {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  const inputs = o.inputs as Record<string, unknown> | undefined;
  const outputs = o.outputs as Record<string, unknown> | undefined;
  const monthly = outputs?.monthly;
  return (
    !!inputs &&
    typeof inputs.latitude === "number" &&
    typeof inputs.longitude === "number" &&
    typeof inputs.peakPowerKwp === "number" &&
    typeof inputs.systemLossesPercent === "number" &&
    Array.isArray(monthly) &&
    monthly.length === 12 &&
    monthly.every(
      (m) =>
        m &&
        typeof m === "object" &&
        typeof (m as PvgisMonthlyData).month === "number" &&
        typeof (m as PvgisMonthlyData).irradiationKwhM2 === "number",
    )
  );
}

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

export function pvgisMonthlyFromSolarResponse(res: PvgisSolarResponse): PvgisMonthlyData[] {
  return res.monthlyIrradiationKwhM2.map((irradiationKwhM2, i) => ({
    month: i + 1,
    irradiationKwhM2,
  }));
}

export function annualIrradiationKwhM2(monthly: PvgisMonthlyData[]): number {
  return monthly.reduce((sum, m) => sum + m.irradiationKwhM2, 0);
}