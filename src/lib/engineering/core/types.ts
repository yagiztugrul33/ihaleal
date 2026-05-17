/** Traceable engineering calculation types — institutional intelligence engine */

export type ConfidenceLevel = "high" | "medium" | "low" | "indicative";

export type MethodologyRef = {
  id: string;
  name: string;
  standard?: string;
  sourceUrl?: string;
  notes?: string;
};

export type EngineeringAssumption = {
  id: string;
  label: string;
  value: number | string | boolean;
  unit?: string;
  source: "user" | "default" | "dataset" | "derived";
  rationale?: string;
};

export type CalculationStep = {
  id: string;
  label: string;
  formula: string;
  inputs: Record<string, number | string>;
  output: number | string;
  unit?: string;
  methodologyId: string;
};

export type RiskFactor = {
  id: string;
  label: string;
  score: number;
  weight: number;
  rationale: string;
  confidence: ConfidenceLevel;
};

export type ScenarioBand = {
  id: "pessimistic" | "base" | "optimistic";
  label: string;
  multiplier: number;
};

export type EngineeringResult<T> = {
  value: T;
  unit?: string;
  confidence: ConfidenceLevel;
  methodology: MethodologyRef;
  assumptions: EngineeringAssumption[];
  steps: CalculationStep[];
  limitations: string[];
};

export type AnalysisDisclaimer = {
  legal: string;
  scientific: string;
  dataFreshness?: string;
};

export const DEFAULT_DISCLAIMER: AnalysisDisclaimer = {
  legal:
    "Bu analiz bilgilendirme amaclidir; yatirim, imar veya baglayici muhendislik karari degildir. Resmi imar plani, TIEKAS/EDAS basvurusu ve bagimsiz muhendislik raporu olmadan yatirim karari verilmemelidir.",
  scientific:
    "Sonuclar kullanici girdileri ve indikatif modellerle uretilir; gercek uran, vergi, borc ve ag maliyetleri dahil degildir.",
};