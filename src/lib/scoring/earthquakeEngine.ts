import type { PropertyRecord } from "@/types/property";
import type {
  AiDerived,
  Certificates,
  CommunityPrep,
  DamageHistory,
  DisasterData,
  EarthquakeScore12,
  EarthquakeSubScoreKey,
  EmergencyData,
  FaultData,
  InsuranceProtection,
  NeighborStructure,
  RetrofitData,
  SoilData,
  StructuralData,
  SubScoreBreakdown,
  ScoreBand,
} from "@/types/property/disaster";
import { SUB_SCORE_WEIGHTS, assertSubScoreWeightsSum } from "@/types/property/disaster";

assertSubScoreWeightsSum();

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function rnd1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** TBDY zemin sinifi baz puani: ZA=100 ... ZE=40 (demo; yuksek= daha iyi zemin-dayanim profili). */
export const SOIL_CLASS_SCORE_TABLE: Record<string, number> = {
  ZA: 100,
  ZB: 85,
  ZC: 70,
  ZD: 55,
  ZE: 40,
};

function normalizeSoilKey(s: string): string {
  return (s ?? "ZC").toUpperCase().replace(/\s+/g, "").slice(0, 2);
}

function scoreFaultProximity(f: FaultData): { score: number; inputs: Record<string, string | number | boolean | null> } {
  const d = Math.max(0, f.distanceToFaultKm);
  const base = 100 * (d / (d + 12));
  const secPen = Math.min(25, f.secondaryFaultsWithin5km * 4);
  const pgaPen = f.afadDesignPgaG > 0.45 ? (f.afadDesignPgaG - 0.45) * 80 : 0;
  const score = clamp(base - secPen - pgaPen + (f.basinEdgeDistanceKm > 8 ? 3 : 0), 0, 100);
  return {
    score: rnd1(score),
    inputs: {
      distanceToFaultKm: d,
      afadDesignPgaG: f.afadDesignPgaG,
      secondaryFaultsWithin5km: f.secondaryFaultsWithin5km,
      basinEdgeDistanceKm: f.basinEdgeDistanceKm,
    },
  };
}

function scoreSoil(soil: SoilData): { score: number; inputs: Record<string, string | number | boolean | null> } {
  const k = normalizeSoilKey(soil.zeminSinifiTbdly);
  const base = SOIL_CLASS_SCORE_TABLE[k] ?? SOIL_CLASS_SCORE_TABLE.ZC;
  const liq = Math.min(20, soil.liquefactionSusceptibilityIdx * 0.22);
  const slide = Math.min(12, soil.landslideSusceptibilityIdx * 0.15);
  const fa = soil.siteAmplificationFaEst;
  const faPen = fa > 1 ? Math.min(18, (fa - 1) * 22) : 0;
  const deepGW = soil.groundwaterDepthM < 2.5 ? 6 : 0;
  const score = clamp(base - liq - slide - faPen - deepGW, 0, 100);
  return {
    score: rnd1(score),
    inputs: {
      zeminSinifiTbdly: k,
      zeminBazPuani: base,
      liquefactionSusceptibilityIdx: soil.liquefactionSusceptibilityIdx,
      landslideSusceptibilityIdx: soil.landslideSusceptibilityIdx,
      siteAmplificationFaEst: fa,
      groundwaterDepthM: soil.groundwaterDepthM,
    },
  };
}

function hammerBonus(cls: string): number {
  const c = (cls ?? "").toUpperCase().replace(/\s/g, "");
  if (c.includes("1A")) return 18;
  if (c.includes("1B")) return 12;
  if (c.includes("2")) return 4;
  if (c.includes("3")) return -8;
  return 0;
}

function scoreStructural(s: StructuralData): { score: number; inputs: Record<string, string | number | boolean | null> } {
  const reg = (clamp(s.planRegularityScore, 0, 100) + clamp(s.verticalRegularityScore, 0, 100)) / 2;
  const softPen = s.softStoryIndex * 0.45;
  const shortPen = s.shortColumnIndex * 0.35;
  const irrPen = s.massStiffnessIrregularity * 0.25;
  const diaphragm = clamp(s.diaphragmContinuityScore, 0, 100) * 0.15;
  const nst = s.nonstructuralFallRisk * 0.2;
  const pound = s.poundingRiskWithNeighbor * 0.15;
  const pre99 = s.pre1999UnreinforcedConcrete ? 12 : 0;
  const hb = s.buildingHeightM > 45 ? 5 : s.buildingHeightM > 28 ? 2 : 0;
  const score = clamp(reg + hammerBonus(s.hammerEarthquakeClass) + diaphragm - softPen - shortPen - irrPen - nst - pound - pre99 - hb, 0, 100);
  return {
    score: rnd1(score),
    inputs: {
      planRegularityScore: s.planRegularityScore,
      verticalRegularityScore: s.verticalRegularityScore,
      softStoryIndex: s.softStoryIndex,
      shortColumnIndex: s.shortColumnIndex,
      hammerEarthquakeClass: s.hammerEarthquakeClass,
      pre1999UnreinforcedConcrete: s.pre1999UnreinforcedConcrete,
      buildingHeightM: s.buildingHeightM,
    },
  };
}

function scoreAge(struct: StructuralData): { score: number; inputs: Record<string, string | number | boolean | null> } {
  const y = struct.yearOfConstruction;
  const age = Math.max(0, new Date().getFullYear() - y);
  const agePart = clamp(100 - age * 1.15, 0, 100);
  const maint = clamp(struct.apparentMaintenanceScore, 0, 100);
  const score = clamp(agePart * 0.65 + maint * 0.35, 0, 100);
  return {
    score: rnd1(score),
    inputs: { yearOfConstruction: y, binaYasi: age, apparentMaintenanceScore: maint },
  };
}

const AUDIT_PEN: Record<DamageHistory["auditSeverityClass"], number> = {
  none: 0,
  light: 6,
  moderate: 16,
  severe: 32,
  unknown: 4,
};

function scoreDamage(dh: DamageHistory): { score: number; inputs: Record<string, string | number | boolean | null> } {
  let score = 92;
  score -= dh.knownStrongMotionEventsAfter1999 * 8;
  score -= Math.min(24, dh.maxObservedPgaG * 40);
  score -= Math.min(18, dh.crackWidthMmWorst * 1.8);
  score -= AUDIT_PEN[dh.auditSeverityClass] ?? 4;
  if (dh.structuralAuditPresent) score += 6;
  if (dh.progressiveDamageFlag) score -= 14;
  if (dh.basementLeakageAfterquake) score -= 6;
  if (dh.parapetOrFacadeDamage) score -= 5;
  if (dh.insuranceClaimFiled) score -= 3;
  score = clamp(score, 0, 100);
  return {
    score: rnd1(score),
    inputs: {
      auditSeverityClass: dh.auditSeverityClass,
      crackWidthMmWorst: dh.crackWidthMmWorst,
      knownStrongMotionEventsAfter1999: dh.knownStrongMotionEventsAfter1999,
      structuralAuditPresent: dh.structuralAuditPresent,
    },
  };
}

function scoreRetrofit(r: RetrofitData, _s: StructuralData): { score: number; inputs: Record<string, string | number | boolean | null> } {
  let score = 38;
  if (r.retrofitExecuted) score += 28;
  if (r.baseIsolationPresent) score += 14;
  if (r.softStoryMitigationDone) score += 9;
  score += Math.min(14, r.columnJacketEquivalentCount * 2.2);
  score += Math.min(10, r.shearWallAddedLinearM * 0.35);
  score += Math.min(8, r.fiberWrapAreaM2 * 0.05);
  if (r.completionInspectionPassed) score += 6;
  if (r.contractorSeismicCertified) score += 4;
  const cap = r.postRetrofitCapacityPgaG;
  score += cap > 0 ? clamp(cap * 28, 0, 14) : 0;
  score = clamp(score, 0, 100);
  return {
    score: rnd1(score),
    inputs: {
      retrofitExecuted: r.retrofitExecuted,
      baseIsolationPresent: r.baseIsolationPresent,
      postRetrofitCapacityPgaG: cap,
      softStoryMitigationDone: r.softStoryMitigationDone,
    },
  };
}

function scoreNeighbor(n: NeighborStructure): { score: number; inputs: Record<string, string | number | boolean | null> } {
  let score = 72;
  if (n.tallAdjacentWithinOneParcel) score -= 12;
  if (n.deepExcavationInfluence5y) score -= 9;
  if (n.heavyMachineryOrBlastNearby) score -= 6;
  score -= clamp(n.clusterSoftStoryFraction, 0, 1) * 22;
  score -= clamp(n.aftershockDamageCorrelationIdx, 0, 100) * 0.12;
  score -= clamp(n.interBuildingFireSpreadRisk, 0, 100) * 0.1;
  score += clamp(12 - n.poundingRiskGapCm / 5, -8, 8);
  score -= Math.max(0, n.avgNeighborBuildingHeightM - 28) * 0.15;
  score = clamp(score, 0, 100);
  return {
    score: rnd1(score),
    inputs: {
      tallAdjacentWithinOneParcel: n.tallAdjacentWithinOneParcel,
      clusterSoftStoryFraction: n.clusterSoftStoryFraction,
      poundingRiskGapCm: n.poundingRiskGapCm,
      avgNeighborBuildingHeightM: n.avgNeighborBuildingHeightM,
    },
  };
}

function scoreEmergency(e: EmergencyData): { score: number; inputs: Record<string, string | number | boolean | null> } {
  let score = 50;
  score += clamp(40 - e.assemblyAreaWalkDistanceM / 35, 0, 28);
  if (e.ambulanceRouteRedundant) score += 6;
  if (e.verticalEvacuationStairsCertified) score += 5;
  score += clamp(e.emergencyWaterLitersOnSite / 40, 0, 12);
  if (e.backupCommunicationsSatellite) score += 5;
  score += clamp(e.familyReunificationPlanScore, 0, 100) * 0.08;
  if (e.neighborhoodCoordinatorTrained) score += 4;
  score -= e.hazmatRouteBufferM < 200 ? 8 : 0;
  score -= e.hardenedShelterAccessM > 1200 ? 6 : 0;
  score += e.lastCommunityDrillIsoWeek > 0 ? 3 : 0;
  score = clamp(score, 0, 100);
  return {
    score: rnd1(score),
    inputs: {
      assemblyAreaWalkDistanceM: e.assemblyAreaWalkDistanceM,
      ambulanceRouteRedundant: e.ambulanceRouteRedundant,
      emergencyWaterLitersOnSite: e.emergencyWaterLitersOnSite,
    },
  };
}

const PREM_W: Record<InsuranceProtection["premiumRiskBand"], number> = {
  A: 10,
  B: 6,
  C: 2,
  D: -4,
  E: -10,
};

function scoreInsurance(i: InsuranceProtection): { score: number; inputs: Record<string, string | number | boolean | null> } {
  let score = 44;
  if (i.daskPolicyActive) score += 22;
  if (i.comprehensiveStructuralRider) score += 12;
  if (i.engineeringAllRiskRider) score += 8;
  score += PREM_W[i.premiumRiskBand] ?? 0;
  score -= i.claimsHistoryCount5y * 4;
  score += clamp(i.indemnityLimitTry / 5_000_000, 0, 14);
  score -= i.waitingPeriodDays > 45 ? 4 : 0;
  score = clamp(score, 0, 100);
  return {
    score: rnd1(score),
    inputs: {
      daskPolicyActive: i.daskPolicyActive,
      premiumRiskBand: i.premiumRiskBand,
      claimsHistoryCount5y: i.claimsHistoryCount5y,
    },
  };
}

function scoreCommunity(c: CommunityPrep): { score: number; inputs: Record<string, string | number | boolean | null> } {
  let score = 48;
  if (c.afadVolunteerTeamNearby) score += 8;
  if (c.debrisRoutePlanExists) score += 6;
  if (c.mutualAidAgreementActive) score += 5;
  score += clamp(c.criticalBridgeRedundancyScore, 0, 100) * 0.14;
  score += clamp(c.hospitalBedsPer1kResidents * 4, 0, 18);
  score += clamp(c.urbanOpenSpacePerCapitaM2 / 3, 0, 12);
  score -= clamp(c.fireEngineResponseSlaMin / 5, 0, 14);
  score += clamp((new Date().getFullYear() - c.municipalityMicrozonationUpdateYear) * -0.4, -10, 0);
  score += clamp(c.earlyWarningSubscriptionPctNeighborhood * 0.12, 0, 10);
  score = clamp(score, 0, 100);
  return {
    score: rnd1(score),
    inputs: {
      afadVolunteerTeamNearby: c.afadVolunteerTeamNearby,
      criticalBridgeRedundancyScore: c.criticalBridgeRedundancyScore,
      fireEngineResponseSlaMin: c.fireEngineResponseSlaMin,
    },
  };
}

function scoreCertificates(cert: Certificates): { score: number; inputs: Record<string, string | number | boolean | null> } {
  let score = 52;
  if (cert.iskanRuhsatiCurrent) score += 14;
  if (cert.depremPerformansRaporuVar) score += 16;
  if (cert.asbuiltSurveyQrPresent) score += 6;
  if (!cert.fireCodeNonconformanceFlag) score += 6;
  score += clamp(cert.municipalPeriodicInspectionScore, 0, 100) * 0.14;
  if (cert.staticProjectApprovalYear > 2000) score += 4;
  score = clamp(score, 0, 100);
  return {
    score: rnd1(score),
    inputs: {
      iskanRuhsatiCurrent: cert.iskanRuhsatiCurrent,
      depremPerformansRaporuVar: cert.depremPerformansRaporuVar,
      municipalPeriodicInspectionScore: cert.municipalPeriodicInspectionScore,
    },
  };
}

function scoreAi(ai: AiDerived): { score: number; inputs: Record<string, string | number | boolean | null> } {
  const rank = clamp(ai.neighborhoodRiskRankPercentile, 0, 100);
  let score = clamp(100 - rank + 8, 0, 100);
  score -= clamp(ai.newsSentimentRiskIdx, 0, 100) * 0.12;
  score += clamp(ai.peerBuildingRetrofitPctEstimate, 0, 100) * 0.1;
  score -= clamp(ai.priceDiscountUnderStressScenarioPct, 0, 50) * 0.35;
  score -= clamp(ai.remoteSensingSubsidenceMmYr, 0, 40) * 0.15;
  score *= 0.75 + clamp(ai.modelConfidence01, 0, 1) * 0.25;
  score = clamp(score, 0, 100);
  return {
    score: rnd1(score),
    inputs: {
      neighborhoodRiskRankPercentile: rank,
      modelConfidence01: ai.modelConfidence01,
      districtRiskClusterLabel: ai.districtRiskClusterLabel,
    },
  };
}

function totalBand(total: number): ScoreBand {
  if (total >= 80) return "A";
  if (total >= 65) return "B";
  if (total >= 50) return "C";
  if (total >= 35) return "D";
  return "E";
}

function mkBreak(
  key: EarthquakeSubScoreKey,
  labelTr: string,
  score: number,
  weight: number,
  inputs: Record<string, string | number | boolean | null>,
  formulaTr: string,
  explanationTr: string
): SubScoreBreakdown {
  const weightedPoints = rnd1(score * weight);
  return { key, labelTr, score: rnd1(score), weight, weightedPoints, inputs, formulaTr, explanationTr };
}

function synthesizeDisasterFallback(property: PropertyRecord): DisasterData {
  const refY = new Date().getFullYear();
  const band = property.buildingAge;
  let y = refY - 12;
  if (band === "0-5") y = refY - 3;
  else if (band === "6-10") y = refY - 8;
  else if (band === "11-20") y = refY - 15;
  else if (band === "20+") y = refY - 32;
  const floors = property.totalFloors ?? 6;
  const h = Math.round((floors * 3.2 + 4) * 10) / 10;
  const ec = property.earthquakeClass ?? "1B";
  const city = property.city ?? "";
  const cn = city.toLocaleLowerCase("tr-TR");
  const isIst = cn.includes("istanbul");
  const isBodrumCoast = cn.includes("bodrum") || cn.includes("çeşme") || cn.includes("cesme");
  const isHatay = cn.includes("hatay") || cn.includes("antakya") || cn.includes("iskenderun") || cn.includes("defne");
  const soil: SoilData = {
    zeminSinifiTbdly: "ZC",
    vs30MpsEst: 520,
    groundwaterDepthM: 4,
    naturalPeriodTSiteS: 0.45,
    plasticityIndexEst: 22,
    fillDepthM: 0.4,
    bedrockDepthEstM: 35,
    slopeAngleDeg: 1.2,
    liquefactionSusceptibilityIdx: 18,
    landslideSusceptibilityIdx: 8,
    siteAmplificationFaEst: 1.15,
    geotechReportYear: refY - 4,
  };
  const fault: FaultData = {
    nearestActiveFaultCode: "GEN",
    nearestFaultNameTr: "Genel bolgesel fay modeli",
    distanceToFaultKm: 22,
    faultSlipType: "unknown",
    slipRateMmYr: 8,
    segmentRuptureProbability10y: 0.08,
    historicalMmax: 7.2,
    afadDesignPgaG: 0.35,
    spectralAccelerationS1: 0.42,
    secondaryFaultsWithin5km: 1,
    microzonationFaultAmplificationNote: "Varsayim: mikro bolgeleme raporu yok.",
    basinEdgeDistanceKm: 12,
    coastalTsunamiFaultSegment: false,
    creepVsLockedIndicator: "unknown",
    faultTraceMapAccuracyM: 250,
  };
  if (isIst) {
    soil.zeminSinifiTbdly = "ZC";
    soil.liquefactionSusceptibilityIdx = 42;
    fault.nearestActiveFaultCode = "KAF";
    fault.nearestFaultNameTr = "Kuzey Anadolu Fayi (referans segment)";
    fault.distanceToFaultKm = 9;
    fault.afadDesignPgaG = 0.48;
  } else if (isBodrumCoast) {
    soil.zeminSinifiTbdly = "ZB";
    soil.vs30MpsEst = 880;
    soil.liquefactionSusceptibilityIdx = 14;
    fault.distanceToFaultKm = 42;
    fault.afadDesignPgaG = 0.28;
  } else if (isHatay) {
    soil.zeminSinifiTbdly = "ZD";
    soil.liquefactionSusceptibilityIdx = 55;
    fault.nearestActiveFaultCode = "DAF-EAF";
    fault.nearestFaultNameTr = "Suriye / Dogu Anadolu fay sistemi (ozet)";
    fault.distanceToFaultKm = 6;
    fault.afadDesignPgaG = 0.52;
  }
  const structural: StructuralData = {
    structuralSystemType: property.buildingType ?? "Betonarme karkas",
    lateralForceResistingSystem: "Perdeli cerceve",
    planRegularityScore: 68,
    verticalRegularityScore: 71,
    softStoryIndex: 22,
    buildingHeightM: h,
    effectiveStoryCount: floors,
    yearOfConstruction: y,
    apparentMaintenanceScore: 74,
    hammerEarthquakeClass: ec,
    foundationSystem: "Radye temel (tahmini)",
    basementLevelCount: property.taxonomy.category === "konut" ? 1 : 0,
    infillWallOpeningsRatio: 0.35,
    shortColumnIndex: 18,
    massStiffnessIrregularity: 20,
    diaphragmContinuityScore: 72,
    nonstructuralFallRisk: 28,
    poundingRiskWithNeighbor: 22,
    pre1999UnreinforcedConcrete: y < 2000,
  };
  const damageHistory: DamageHistory = {
    knownStrongMotionEventsAfter1999: isHatay ? 2 : 1,
    maxObservedPgaG: isHatay ? 0.55 : 0.22,
    crackWidthMmWorst: isHatay ? 1.8 : 0.2,
    structuralAuditPresent: false,
    auditSeverityClass: isHatay ? "light" : "none",
    insuranceClaimFiled: false,
    postEventRepairQuality: "none",
    progressiveDamageFlag: false,
    basementLeakageAfterquake: false,
    parapetOrFacadeDamage: isHatay,
  };
  const retrofit: RetrofitData = {
    retrofitExecuted: y < 2004 && (isIst || isHatay),
    retrofitDesignStandard: y < 2004 ? "TBDY 2018 guclendirme hedefi" : "",
    columnJacketEquivalentCount: y < 2004 ? 6 : 0,
    shearWallAddedLinearM: y < 2004 ? 14 : 0,
    fiberWrapAreaM2: 0,
    baseIsolationPresent: false,
    softStoryMitigationDone: false,
    strengtheningPermitReference: "",
    completionInspectionPassed: y < 2004,
    postRetrofitCapacityPgaG: y < 2004 ? 0.42 : 0,
    annualMaintenanceBudgetTry: 120_000,
    contractorSeismicCertified: y < 2004,
  };
  const neighbor: NeighborStructure = {
    avgNeighborBuildingHeightM: h + 4,
    tallAdjacentWithinOneParcel: false,
    commonWallSetbackM: 4.5,
    poundingRiskGapCm: 12,
    neighborBuildingAgeSpreadYears: 18,
    clusterSoftStoryFraction: isIst ? 0.22 : 0.12,
    deepExcavationInfluence5y: false,
    heavyMachineryOrBlastNearby: false,
    aftershockDamageCorrelationIdx: isHatay ? 38 : 14,
    interBuildingFireSpreadRisk: 24,
  };
  const emergency: EmergencyData = {
    assemblyAreaWalkDistanceM: 650,
    ambulanceRouteRedundant: true,
    verticalEvacuationStairsCertified: false,
    emergencyWaterLitersOnSite: 180,
    backupCommunicationsSatellite: false,
    familyReunificationPlanScore: 55,
    neighborhoodCoordinatorTrained: isIst,
    hazmatRouteBufferM: 420,
    hardenedShelterAccessM: 900,
    lastCommunityDrillIsoWeek: 12,
  };
  const insurance: InsuranceProtection = {
    daskPolicyActive: property.disasterInsurance !== false,
    comprehensiveStructuralRider: true,
    engineeringAllRiskRider: property.taxonomy.category === "endustri",
    indemnityLimitTry: 4_500_000,
    waitingPeriodDays: 30,
    premiumRiskBand: isHatay ? "D" : isIst ? "C" : "B",
    claimsHistoryCount5y: 0,
    brokerRiskReviewYear: refY - 1,
  };
  const community: CommunityPrep = {
    afadVolunteerTeamNearby: true,
    municipalityMicrozonationUpdateYear: refY - 3,
    urbanOpenSpacePerCapitaM2: 8.2,
    hospitalBedsPer1kResidents: 3.1,
    fireEngineResponseSlaMin: 11,
    criticalBridgeRedundancyScore: 62,
    temporaryHousingPlanYear: refY - 1,
    debrisRoutePlanExists: true,
    earlyWarningSubscriptionPctNeighborhood: isIst ? 28 : 18,
    mutualAidAgreementActive: false,
  };
  const certificates: Certificates = {
    iskanRuhsatiCurrent: property.occupancyPermit !== false,
    depremPerformansRaporuVar: ec.startsWith("1"),
    staticProjectApprovalYear: y + 1,
    energyPerformanceCertificateId: "demo-epc",
    fireCodeNonconformanceFlag: false,
    tbdyUygunlukEtiketi: ec,
    asbuiltSurveyQrPresent: false,
    municipalPeriodicInspectionScore: 72,
  };
  const ai: AiDerived = {
    neighborhoodRiskRankPercentile: isHatay ? 88 : isIst ? 72 : cn.includes("bodrum") ? 28 : 45,
    districtRiskClusterLabel: isHatay ? "Yuksek-stres kusagi" : "Standart-cluster",
    remoteSensingSubsidenceMmYr: 4,
    newsSentimentRiskIdx: isHatay ? 62 : 30,
    peerBuildingRetrofitPctEstimate: isIst ? 22 : 15,
    priceDiscountUnderStressScenarioPct: isHatay ? 12 : 6,
    liquidityShockHalflifeDays: 120,
    modelConfidence01: 0.62,
  };
  return {
    fault,
    soil,
    structural,
    damageHistory,
    retrofit,
    neighbor,
    emergency,
    insurance,
    community,
    certificates,
    ai,
    dataSourceNoteTr: "Sentez: ilan alanlari + demografik demo; resmi rapor degildir.",
    lastUpdatedIso: new Date().toISOString(),
  };
}

export function calculateEarthquakeScore(property: PropertyRecord): EarthquakeScore12 {
  const data = property.disaster ?? synthesizeDisasterFallback(property);
  const f = scoreFaultProximity(data.fault);
  const z = scoreSoil(data.soil);
  const st = scoreStructural(data.structural);
  const ag = scoreAge(data.structural);
  const dm = scoreDamage(data.damageHistory);
  const rt = scoreRetrofit(data.retrofit, data.structural);
  const nb = scoreNeighbor(data.neighbor);
  const em = scoreEmergency(data.emergency);
  const ins = scoreInsurance(data.insurance);
  const cm = scoreCommunity(data.community);
  const ce = scoreCertificates(data.certificates);
  const ai = scoreAi(data.ai);

  const pieces: Array<{
    key: EarthquakeSubScoreKey;
    labelTr: string;
    r: { score: number; inputs: Record<string, string | number | boolean | null> };
    formulaTr: string;
    explanationTr: string;
  }> = [
    {
      key: "faultProximity",
      labelTr: "Fay mesafesi ve PGA etkisi",
      r: f,
      formulaTr: "Skor = clip(100*d/(d+12) - 4*n2 - max(0,PGA-0.45)*80 + sinir bonusu, 0, 100). Agirlik w=0.14.",
      explanationTr:
        "Fay hattina yakin konumlar daha yuksek ivme ve daha sik ana fay etkisi nedeniyle puan kirir; ikincil fay sayisi ve tasarim PGA degeri cezalandirilir.",
    },
    {
      key: "soilClass",
      labelTr: "Zemin sinifi ve zayiflik",
      r: z,
      formulaTr:
        "Baz: ZA=100, ZB=85, ZC=70, ZD=55, ZE=40; svisslasma ve heyelan indeksleri ile Fa asiriyukselmesi cezasi; yuksek yeralti suyu ek puan kirar.",
      explanationTr:
        "TBDY zemin siniflari daha zayif zeminde spektral buyutme ve svisslasma riskini temsil eden baz puandan dusulerek oyalanir.",
    },
    {
      key: "structuralSystem",
      labelTr: "Tasiyici sistem ve duzensizlik",
      r: st,
      formulaTr:
        "Skor = clip((duzensizlik_ortalama) + hummer_bonusu - yumusak_kat - kisa_kiris - duzensizlik - dis_malzeme - yukseklik, 0, 100), w=0.13.",
      explanationTr:
        "Plank ve dusey duzenlilik ortalamasi tasiyici performans temelini olusturur; yumusak kat, kisa kiris ve yuksek bina cezalandirilir.",
    },
    {
      key: "ageCondition",
      labelTr: "Yas ve bakim",
      r: ag,
      formulaTr: "Skor = clip((100 - yas*1.15)*0.65 + bakim*0.35, 0, 100), w=0.08.",
      explanationTr: "Eski binalarda malzeme yorgunlugu ve kod uyumsuzlugu beklenir; gorunur bakim puani riski yumusatir.",
    },
    {
      key: "damageHistory",
      labelTr: "Hasar ve denetim gecmisi",
      r: dm,
      formulaTr:
        "92 baz; siddetli olay, PGA, catlak, denetim sinifi ve ilerlemeli hasar bayraklari ile cezalar; denetim mevcudu bonus.",
      explanationTr: "Gozlemlenen hasar ve muhendis raporu siddeti performans ongorusunu korelasyonlar.",
    },
    {
      key: "retrofit",
      labelTr: "Guclendirme ve kapasite",
      r: rt,
      formulaTr: "38 baz + izolasyon/perde/gonne/kapasite(PGA) katkilari; clip 0-100, w=0.10.",
      explanationTr: "Guclendirme ve kapasite artisi dayaniklilik profilini dogrudan yukseltir.",
    },
    {
      key: "neighborRisk",
      labelTr: "Komsu etkilesim",
      r: nb,
      formulaTr: "72 baz; yumusak kat orani, carpisma payi ve yuksek komsu cezalari.",
      explanationTr: "Titresim ve carpisma riski komsu envanterinden turetilir.",
    },
    {
      key: "emergency",
      labelTr: "Acil durum ve erisim",
      r: em,
      formulaTr: "Toplanma mesafesi ve su rezervi puanlari; kopru ve hazmat tamponu etkileri.",
      explanationTr: "Deprem sonrasi erisim ve temel ihtiyac hazirligi o skorunu belirler.",
    },
    {
      key: "insurance",
      labelTr: "Sigorta kapsami",
      r: ins,
      formulaTr: "DASK ve tamamlayici terminat; prim bandi ve hasar gecmisi ayarlamalari.",
      explanationTr: "Finansal direnc ve hasar sonrasi toparlanma kapasitesi gostergesi (demo).",
    },
    {
      key: "community",
      labelTr: "Toplum ve altyapi dayanikliligi",
      r: cm,
      formulaTr: "Gonullu ekip, saglik kapasitesi, yangin SLO, kopru yedekliligi ve acil uyari penetrasyonu.",
      explanationTr: "Mahalle olceginde kurtarma ve lojistik kapasite.",
    },
    {
      key: "certificates",
      labelTr: "Belge ve uyumluluk",
      r: ce,
      formulaTr: "Iskan, performans raporu ve belediye denetim skorunun agirlikli toplami.",
      explanationTr: "Resmi izin ve denetim izleri yapisal guven tesis eder.",
    },
    {
      key: "aiContext",
      labelTr: "YZ / mahalle siralamasi",
      r: ai,
      formulaTr: "100 - risk yuzdelik + komsu retrofit - stres iskontosu; model guveni ile olcekle.",
      explanationTr: "Yapay zeka ve uzaktan algilama ile zenginlestirilmis bolge risk siralamasi.",
    },
  ];

  const breakdown: SubScoreBreakdown[] = pieces.map((p) =>
    mkBreak(p.key, p.labelTr, p.r.score, SUB_SCORE_WEIGHTS[p.key], p.r.inputs, p.formulaTr, p.explanationTr)
  );

  const totalScore = rnd1(
    breakdown.reduce((s, b) => s + b.score * SUB_SCORE_WEIGHTS[b.key], 0)
  );
  const subScores = Object.fromEntries(breakdown.map((b) => [b.key, b.score])) as Record<EarthquakeSubScoreKey, number>;

  return {
    totalScore: clamp(totalScore, 0, 100),
    band: totalBand(totalScore),
    subScores,
    breakdown,
    computedAtIso: new Date().toISOString(),
  };
}
