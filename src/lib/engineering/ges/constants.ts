export const DEFAULT_PERFORMANCE_RATIO = 0.82;
export const DEFAULT_TEMP_COEFF_PCT_PER_C = -0.35;
export const DEFAULT_DEGRADATION_PCT_YEAR = 0.55;
export const SCT_TEMP_C = 25;
export const HOURS_PER_YEAR = 8760;

export const REGIONAL_GHI_KWH_M2_YEAR: Record<string, number> = {
  default: 1560,
  antalya: 1850,
  konya: 1780,
  ankara: 1660,
  izmir: 1720,
  istanbul: 1450,
  mersin: 1820,
  sanliurfa: 1900,
};

export function resolveRegionalGhi(regionKey?: string): number {
  const k = regionKey?.trim().toLowerCase().replace(/\s+/g, "") ?? "default";
  return REGIONAL_GHI_KWH_M2_YEAR[k] ?? REGIONAL_GHI_KWH_M2_YEAR.default;
}
