export type RegionTag = "Yukselen" | "Duragan" | "Riskli" | "Premium";

export type RegionLayerKey =
  | "security"
  | "income"
  | "transport"
  | "education"
  | "health"
  | "earthquake"
  | "priceTrend"
  | "liquidity"
  | "environment";

export type RegionScoreBreakdown = {
  security: number;
  income: number;
  transport: number;
  education: number;
  health: number;
  earthquakeResilience: number;
  priceTrend: number;
  liquidity: number;
};

export type RegionIntelRaw = {
  slug: string;
  label: string;
  city: string;
  district: string;
  securityScore: number;
  incomeScore: number;
  transportScore: number;
  educationScore: number;
  healthScore: number;
  earthquakeRiskScore: number;
  yearlyPriceTrendPct: number;
  liquidityScore: number;
  annualTransactionVolume: number;
};

export type RegionSignalLevel = "info" | "opportunity" | "watch" | "risk";

export type RegionSignal = {
  id: string;
  slug: string;
  title: string;
  detail: string;
  level: RegionSignalLevel;
};

export type RegionIntelScored = RegionIntelRaw & {
  environmentScore: number;
  tag: RegionTag;
  breakdown: RegionScoreBreakdown;
  signals: RegionSignal[];
};

export type RegionSummary = {
  topGainer: RegionIntelScored;
  safest: RegionIntelScored;
  mostLiquid: RegionIntelScored;
  highestTransactions: RegionIntelScored;
};

export type RegionIntelConnector = {
  listRegions(): Promise<RegionIntelRaw[]>;
  getRegionBySlug(slug: string): Promise<RegionIntelRaw | null>;
};
