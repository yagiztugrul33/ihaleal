import { MockRegionIntelConnector } from "@/intel/connectors";
import { scoreRegion } from "@/intel/signals";
import type { RegionIntelRaw, RegionIntelScored, RegionLayerKey, RegionSummary } from "@/intel/types";

const MOCK_REGIONS: RegionIntelRaw[] = [
  {
    slug: "kadikoy",
    label: "Kadikoy",
    city: "Istanbul",
    district: "Kadikoy",
    securityScore: 76,
    incomeScore: 82,
    transportScore: 90,
    educationScore: 84,
    healthScore: 81,
    earthquakeRiskScore: 58,
    yearlyPriceTrendPct: 8.4,
    liquidityScore: 79,
    annualTransactionVolume: 5420,
  },
  {
    slug: "besiktas",
    label: "Besiktas",
    city: "Istanbul",
    district: "Besiktas",
    securityScore: 79,
    incomeScore: 88,
    transportScore: 87,
    educationScore: 86,
    healthScore: 84,
    earthquakeRiskScore: 54,
    yearlyPriceTrendPct: 7.2,
    liquidityScore: 75,
    annualTransactionVolume: 5110,
  },
  {
    slug: "levent",
    label: "Levent",
    city: "Istanbul",
    district: "Levent",
    securityScore: 83,
    incomeScore: 92,
    transportScore: 86,
    educationScore: 78,
    healthScore: 80,
    earthquakeRiskScore: 49,
    yearlyPriceTrendPct: 9.1,
    liquidityScore: 73,
    annualTransactionVolume: 4820,
  },
  {
    slug: "cesme",
    label: "Cesme",
    city: "Izmir",
    district: "Cesme",
    securityScore: 71,
    incomeScore: 75,
    transportScore: 63,
    educationScore: 64,
    healthScore: 66,
    earthquakeRiskScore: 43,
    yearlyPriceTrendPct: 11.6,
    liquidityScore: 70,
    annualTransactionVolume: 3360,
  },
  {
    slug: "bodrum",
    label: "Bodrum",
    city: "Mugla",
    district: "Bodrum",
    securityScore: 74,
    incomeScore: 86,
    transportScore: 68,
    educationScore: 65,
    healthScore: 69,
    earthquakeRiskScore: 47,
    yearlyPriceTrendPct: 13.2,
    liquidityScore: 77,
    annualTransactionVolume: 3985,
  },
  {
    slug: "izmir-alsancak",
    label: "Izmir Alsancak",
    city: "Izmir",
    district: "Alsancak",
    securityScore: 77,
    incomeScore: 80,
    transportScore: 88,
    educationScore: 79,
    healthScore: 76,
    earthquakeRiskScore: 45,
    yearlyPriceTrendPct: 10.4,
    liquidityScore: 83,
    annualTransactionVolume: 4620,
  },
  {
    slug: "ankara-cankaya",
    label: "Ankara Cankaya",
    city: "Ankara",
    district: "Cankaya",
    securityScore: 82,
    incomeScore: 84,
    transportScore: 79,
    educationScore: 88,
    healthScore: 85,
    earthquakeRiskScore: 24,
    yearlyPriceTrendPct: 6.1,
    liquidityScore: 74,
    annualTransactionVolume: 4375,
  },
];

const connector = new MockRegionIntelConnector({ regions: MOCK_REGIONS });

function normalize(value: string): string {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const LOCATION_ALIAS_TO_REGION_SLUG: Record<string, string> = {
  kadikoy: "kadikoy",
  besiktas: "besiktas",
  levent: "levent",
  cesme: "cesme",
  bodrum: "bodrum",
  alsancak: "izmir-alsancak",
  cankaya: "ankara-cankaya",
  izmir: "izmir-alsancak",
  ankara: "ankara-cankaya",
  istanbul: "kadikoy",
  mugla: "bodrum",
};

export async function listRegionIntel(): Promise<RegionIntelScored[]> {
  const raw = await connector.listRegions();
  return raw.map(scoreRegion);
}

export async function getRegionIntelBySlug(slug: string): Promise<RegionIntelScored | null> {
  const raw = await connector.getRegionBySlug(slug);
  return raw ? scoreRegion(raw) : null;
}

export async function getRegionSummary(): Promise<RegionSummary> {
  const rows = await listRegionIntel();
  const sortedByTrend = [...rows].sort((a, b) => b.yearlyPriceTrendPct - a.yearlyPriceTrendPct);
  const sortedBySecurity = [...rows].sort((a, b) => b.securityScore - a.securityScore);
  const sortedByLiquidity = [...rows].sort((a, b) => b.liquidityScore - a.liquidityScore);
  const sortedByVolume = [...rows].sort((a, b) => b.annualTransactionVolume - a.annualTransactionVolume);
  return {
    topGainer: sortedByTrend[0],
    safest: sortedBySecurity[0],
    mostLiquid: sortedByLiquidity[0],
    highestTransactions: sortedByVolume[0],
  };
}

export function resolveRegionSlugByLocation(input: { city?: string; district?: string; neighborhood?: string }): string {
  const keys = [input.neighborhood, input.district, input.city]
    .map((v) => normalize(v || ""))
    .filter(Boolean);
  for (const key of keys) {
    const resolved = LOCATION_ALIAS_TO_REGION_SLUG[key];
    if (resolved) return resolved;
  }
  return "kadikoy";
}

export function getRegionLabelBySlug(slug: string): string {
  const row = MOCK_REGIONS.find((r) => r.slug === slug);
  return row?.label ?? "Bolge";
}

export function getRegionLayerValue(region: RegionIntelScored, layer: RegionLayerKey): number {
  switch (layer) {
    case "security":
      return region.securityScore;
    case "income":
      return region.incomeScore;
    case "transport":
      return region.transportScore;
    case "education":
      return region.educationScore;
    case "health":
      return region.healthScore;
    case "earthquake":
      return 100 - region.earthquakeRiskScore;
    case "priceTrend":
      return Math.max(0, Math.min(100, 55 + region.yearlyPriceTrendPct * 3.1));
    case "liquidity":
      return region.liquidityScore;
    case "environment":
    default:
      return region.environmentScore;
  }
}
