/** Deprem uygunlugu skoru tipleri. */

export type EarthquakeBand =
  | "critical"
  | "low"
  | "moderate"
  | "good"
  | "excellent";

export interface EarthquakeSubScore {
  id: string;
  label: string;
  score: number;
  weight: number;
  inputs: { label: string; value: string }[];
  formula: string;
  explanation: string;
  improvementTips: string[];
}

export interface EarthquakeFacets {
  faultDistanceKm: number;
  soilBand: "kayalik" | "siki_kill" | "gevsek" | "dolgu";
  buildingAgeBand: "yeni" | "orta" | "eski" | "bilinmiyor";
  seismicClassGuess: "a_sinifi" | "b_sinifi" | "c_sinifi" | "bilinmiyor";
  reinforcement: "tamamlandi" | "kismen" | "yok" | "bilinmiyor";
  damageVisible: "yok" | "hafif" | "orta" | "bilinmiyor";
  assemblyWalkMinutes: number;
  daskLikelyKnown: boolean;
  verticalRisk: "alcak" | "orta" | "yuksek";
  regionalHazard: "dusuk" | "orta" | "yuksek";
  softStoryFlag: boolean;
  liquefactionFlag: boolean;
}

export type EarthquakeFacetKey = keyof EarthquakeFacets;

export interface EarthquakeScorePayload {
  composite: number;
  band: EarthquakeBand;
  bandLabelTR: string;
  subScores: EarthquakeSubScore[];
  facets: EarthquakeFacets;
  updatedAtDemo: string;
}
