import type { PropertyRecord } from "@/types/property";
import type { ScoreBand } from "@/types/property/disaster";
import { getEarthquakeScore } from "@/lib/scoring/getEarthquakeScore";

/** URL deprem filtreleri icin property'den turetilen alanlar (tek skor kaynagi). */
export interface EarthquakeFilterSnapshot {
  totalScore: number;
  band: ScoreBand;
  faultDistanceKm: number;
  soilBand: "kayalik" | "siki_kill" | "gevsek" | "dolgu";
  buildingAgeBand: "yeni" | "orta" | "eski" | "bilinmiyor";
  seismicClassGuess: "a_sinifi" | "b_sinifi" | "c_sinifi" | "bilinmiyor";
  regionalHazard: "dusuk" | "orta" | "yuksek";
  verticalRisk: "alcak" | "orta" | "yuksek";
  reinforcement: "tamamlandi" | "kismen" | "yok" | "bilinmiyor";
  damageVisible: "yok" | "hafif" | "orta" | "bilinmiyor";
  assemblyWalkMinutes: number;
  daskLikelyKnown: boolean;
  softStoryFlag: boolean;
}

function zeminToSoil(z: string | undefined): EarthquakeFilterSnapshot["soilBand"] {
  if (!z) return "gevsek";
  if (z === "ZA" || z === "ZB") return "kayalik";
  if (z === "ZC") return "siki_kill";
  if (z === "ZD") return "dolgu";
  return "gevsek";
}

function ageBand(y: number | undefined): EarthquakeFilterSnapshot["buildingAgeBand"] {
  if (y == null) return "bilinmiyor";
  const age = new Date().getFullYear() - y;
  if (age <= 10) return "yeni";
  if (age <= 25) return "orta";
  return "eski";
}

function hammerToClass(h: string | undefined): EarthquakeFilterSnapshot["seismicClassGuess"] {
  const c = (h ?? "").toUpperCase();
  if (c.startsWith("1")) return "a_sinifi";
  if (c.startsWith("2")) return "b_sinifi";
  if (c.startsWith("3")) return "c_sinifi";
  return "bilinmiyor";
}

export function getEarthquakeFilterSnapshot(p: PropertyRecord): EarthquakeFilterSnapshot {
  const score = getEarthquakeScore(p);
  const d = p.disaster;
  const y = d?.structural.yearOfConstruction;
  const pga = d?.fault.afadDesignPgaG ?? 0.35;
  const regionalHazard: EarthquakeFilterSnapshot["regionalHazard"] =
    pga >= 0.45 ? "yuksek" : pga >= 0.32 ? "orta" : "dusuk";
  const floors = d?.structural.effectiveStoryCount ?? p.totalFloors ?? 5;
  const verticalRisk: EarthquakeFilterSnapshot["verticalRisk"] =
    floors <= 4 ? "alcak" : floors <= 9 ? "orta" : "yuksek";
  const retro = d?.retrofit.retrofitExecuted;
  const reinforcement: EarthquakeFilterSnapshot["reinforcement"] = retro
    ? "tamamlandi"
    : d?.retrofit.softStoryMitigationDone
      ? "kismen"
      : "yok";
  const sev = d?.damageHistory.auditSeverityClass;
  const damageVisible: EarthquakeFilterSnapshot["damageVisible"] =
    sev === "none" || sev === "light"
      ? sev === "none"
        ? "yok"
        : "hafif"
      : sev === "moderate" || sev === "severe"
        ? "orta"
        : "bilinmiyor";

  return {
    totalScore: score.totalScore,
    band: score.band,
    faultDistanceKm: d?.fault.distanceToFaultKm ?? 20,
    soilBand: zeminToSoil(d?.soil.zeminSinifiTbdly),
    buildingAgeBand: ageBand(y),
    seismicClassGuess: hammerToClass(d?.structural.hammerEarthquakeClass ?? p.earthquakeClass),
    regionalHazard,
    verticalRisk,
    reinforcement,
    damageVisible,
    assemblyWalkMinutes: Math.round((d?.emergency.assemblyAreaWalkDistanceM ?? 800) / 80),
    daskLikelyKnown: d?.insurance.daskPolicyActive ?? false,
    softStoryFlag: (d?.structural.softStoryIndex ?? 0) > 0.35,
  };
}
