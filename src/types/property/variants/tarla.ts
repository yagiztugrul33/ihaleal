/** Tarla / agricultural land variant details. */

export interface TarlaDetay {
  landSqm?: number;
  irrigation?: boolean;
  waterSource?: string;
  cropType?: string;
  soilClass?: string;
  slopePercent?: number;
  roadFrontageM?: number;
  zoningNote?: string;
  harvestYieldKg?: number;
}
