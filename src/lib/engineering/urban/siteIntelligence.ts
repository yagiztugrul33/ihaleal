import type { SiteEnvironmentalBundle } from "@/lib/data/siteEnvironmentalData";
import { analyzeDisasterRisk } from "../disaster/disasterRisk";
import { analyzeSoil } from "../geotech/soilAnalysis";
import { runGesAnalysis, type GesAnalysisInput } from "../ges/gesEngine";
import { computeIrradiance } from "../ges/irradiance";
import { runParcelIntelligence, type ParcelIntelligenceInput } from "../land/parcelIntelligence";
import { analyzeSeismic } from "../seismic/seismicEngine";
import { analyzeFireSafety } from "../structural/fireSafety";
import { DEFAULT_DISCLAIMER } from "../core/types";

export type SiteIntelligenceInput = {
  lat: number;
  lon: number;
  label?: string;
  environmental?: SiteEnvironmentalBundle | null;
  parcel?: ParcelIntelligenceInput;
  ges?: GesAnalysisInput;
  geotech?: Parameters<typeof analyzeSoil>[0];
  seismic?: Omit<Parameters<typeof analyzeSeismic>[0], "vs30Mps">;
  fire?: Parameters<typeof analyzeFireSafety>[0];
  buildingHeightM?: number;
};

export type SiteIntelligenceResult = {
  label: string;
  environmental: SiteEnvironmentalBundle | null;
  parcel?: ReturnType<typeof runParcelIntelligence>;
  ges?: ReturnType<typeof runGesAnalysis>;
  soil: ReturnType<typeof analyzeSoil>;
  seismic: ReturnType<typeof analyzeSeismic>;
  disaster: ReturnType<typeof analyzeDisasterRisk>;
  fire: ReturnType<typeof analyzeFireSafety>;
  strategicScore: number;
  executiveSummary: string[];
  aiReasoning: string[];
  disclaimer: typeof DEFAULT_DISCLAIMER;
};

export function runSiteIntelligence(input: SiteIntelligenceInput): SiteIntelligenceResult {
  const soil = analyzeSoil({
    ...input.geotech,
    slopeDeg: input.geotech?.slopeDeg ?? input.environmental?.elevation?.slopeDegEstimate ?? 2,
  });

  const seismic = analyzeSeismic({
    vs30Mps: soil.value.vs30Mps,
    ...input.seismic,
  });

  const disaster = analyzeDisasterRisk({
    seismicRiskScore: seismic.value.seismicRiskScore,
    floodRiskScore: input.geotech?.groundwaterDepthM != null && input.geotech.groundwaterDepthM < 4 ? 55 : 28,
    landslideRiskScore:
      (input.environmental?.elevation?.slopeDegEstimate ?? 0) > 12 ? 60 : 22,
    elevationM: input.environmental?.elevation?.elevationM,
    slopeDeg: input.environmental?.elevation?.slopeDegEstimate ?? undefined,
  });

  const fire = analyzeFireSafety(
    input.fire ?? {
      buildingHeightM: input.buildingHeightM ?? 30,
      floors: Math.ceil((input.buildingHeightM ?? 30) / 3),
      unitsPerFloor: 4,
    },
  );

  let ges = input.ges ? runGesAnalysis(input.ges) : undefined;
  if (input.ges && input.environmental?.pvgis) {
    const poa = input.environmental.pvgis.annualIrradiationKwhM2;
    const irr = computeIrradiance({
      annualPoaKwhM2: poa,
      annualGhiKwhM2: poa * 0.95,
      tiltDeg: input.ges.site.tiltDeg,
    });
    ges = runGesAnalysis({
      ...input.ges,
      site: {
        ...input.ges.site,
        annualGhiKwhM2: irr.value.annualGhiKwhM2,
        annualPoaKwhM2: poa,
      },
    });
  }

  const parcel = input.parcel ? runParcelIntelligence(input.parcel) : undefined;

  const strategicScore = Math.round(
    (parcel?.compositeScore ?? 50) * 0.25 +
      (ges?.scorecard.overall ?? 50) * 0.2 +
      seismic.value.resilienceScore * 0.2 +
      (100 - disaster.value.compositeHazardScore) * 0.2 +
      fire.value.complianceScore * 0.15,
  );

  const executiveSummary = [
    input.label ?? `Konum ${input.lat.toFixed(4)}, ${input.lon.toFixed(4)}`,
    `Stratejik skor (indikatif): ${strategicScore}/100.`,
    soil.value.narrative[0],
    seismic.value.narrative[0],
    disaster.value.narrative[0],
    ges ? `GES genel skor: ${ges.scorecard.overall}/100.` : "",
  ].filter(Boolean);

  const aiReasoning = [
    ...soil.value.narrative,
    ...seismic.value.narrative,
    ...disaster.value.narrative,
  ];
  if (input.environmental?.pvgis) {
    aiReasoning.push(
      `PVGIS dogrulanmis yillik isinim: ${input.environmental.pvgis.annualIrradiationKwhM2.toFixed(0)} kWh/m².`,
    );
  }
  if (input.environmental?.climate) {
    aiReasoning.push(
      `Ortalama sicaklik ${input.environmental.climate.annualTempMeanC.toFixed(1)}°C; yillik yagis ${input.environmental.climate.annualPrecipMm.toFixed(0)} mm.`,
    );
  }

  return {
    label: input.label ?? "Site analizi",
    environmental: input.environmental ?? null,
    parcel,
    ges,
    soil,
    seismic,
    disaster,
    fire,
    strategicScore,
    executiveSummary,
    aiReasoning,
    disclaimer: DEFAULT_DISCLAIMER,
  };
}
