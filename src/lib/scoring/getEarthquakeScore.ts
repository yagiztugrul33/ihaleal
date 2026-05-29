import type { PropertyRecord } from "@/types/property";
import type { EarthquakeScore12, ScoreBand } from "@/types/property/disaster";
import { calculateEarthquakeScore } from "@/lib/scoring/earthquakeEngine";

/** Tek kaynak: seed veya anlik hesaplama. */
export function getEarthquakeScore(property: PropertyRecord): EarthquakeScore12 {
  if (property.earthquakeScore?.breakdown?.length) {
    return property.earthquakeScore;
  }
  return calculateEarthquakeScore(property);
}

export function scoreBandLabelTr(band: ScoreBand): string {
  if (band === "A") return "Yuksek guvenli";
  if (band === "B") return "Guvenli";
  if (band === "C") return "Orta";
  if (band === "D") return "Riskli";
  return "Yuksek risk";
}

export function topSubScores(score: EarthquakeScore12, n = 4) {
  return [...score.breakdown].sort((a, b) => b.score - a.score).slice(0, n);
}
