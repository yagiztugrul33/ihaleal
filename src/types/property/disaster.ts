/** Deprem / afet riski veri modeli — alanlar demo ve şeffaf skorlama için birleşik yapı. */

/** 15 — Aktif fay ve yer hareketi bağlamı */
export interface FaultData {
  nearestActiveFaultCode: string;
  nearestFaultNameTr: string;
  distanceToFaultKm: number;
  faultSlipType: "strike_slip" | "thrust" | "normal" | "oblique" | "unknown";
  slipRateMmYr: number;
  segmentRuptureProbability10y: number;
  historicalMmax: number;
  afadDesignPgaG: number;
  spectralAccelerationS1: number;
  secondaryFaultsWithin5km: number;
  microzonationFaultAmplificationNote: string;
  basinEdgeDistanceKm: number;
  coastalTsunamiFaultSegment: boolean;
  creepVsLockedIndicator: "creep" | "locked" | "mixed" | "unknown";
  faultTraceMapAccuracyM: number;
}

/** 12 — Zemin / jeoteknik */
export interface SoilData {
  zeminSinifiTbdly: "ZA" | "ZB" | "ZC" | "ZD" | "ZE" | string;
  vs30MpsEst: number;
  groundwaterDepthM: number;
  naturalPeriodTSiteS: number;
  plasticityIndexEst: number;
  fillDepthM: number;
  bedrockDepthEstM: number;
  slopeAngleDeg: number;
  liquefactionSusceptibilityIdx: number;
  landslideSusceptibilityIdx: number;
  siteAmplificationFaEst: number;
  geotechReportYear: number;
}

/** 18 — Taşıyıcı sistem ve bina geometrisi */
export interface StructuralData {
  structuralSystemType: string;
  lateralForceResistingSystem: string;
  planRegularityScore: number;
  verticalRegularityScore: number;
  softStoryIndex: number;
  buildingHeightM: number;
  effectiveStoryCount: number;
  yearOfConstruction: number;
  apparentMaintenanceScore: number;
  hammerEarthquakeClass: string;
  foundationSystem: string;
  basementLevelCount: number;
  infillWallOpeningsRatio: number;
  shortColumnIndex: number;
  massStiffnessIrregularity: number;
  diaphragmContinuityScore: number;
  nonstructuralFallRisk: number;
  poundingRiskWithNeighbor: number;
  pre1999UnreinforcedConcrete: boolean;
}

/** 10 — Geçmiş olay ve hasar */
export interface DamageHistory {
  knownStrongMotionEventsAfter1999: number;
  maxObservedPgaG: number;
  crackWidthMmWorst: number;
  structuralAuditPresent: boolean;
  auditSeverityClass: "none" | "light" | "moderate" | "severe" | "unknown";
  insuranceClaimFiled: boolean;
  postEventRepairQuality: "none" | "partial" | "full" | "unknown";
  progressiveDamageFlag: boolean;
  basementLeakageAfterquake: boolean;
  parapetOrFacadeDamage: boolean;
}

/** 12 — Güçlendirme */
export interface RetrofitData {
  retrofitExecuted: boolean;
  retrofitDesignStandard: string;
  columnJacketEquivalentCount: number;
  shearWallAddedLinearM: number;
  fiberWrapAreaM2: number;
  baseIsolationPresent: boolean;
  softStoryMitigationDone: boolean;
  strengtheningPermitReference: string;
  completionInspectionPassed: boolean;
  postRetrofitCapacityPgaG: number;
  annualMaintenanceBudgetTry: number;
  contractorSeismicCertified: boolean;
}

/** 10 — Komşu yapı etkileşimi */
export interface NeighborStructure {
  avgNeighborBuildingHeightM: number;
  tallAdjacentWithinOneParcel: boolean;
  commonWallSetbackM: number;
  poundingRiskGapCm: number;
  neighborBuildingAgeSpreadYears: number;
  clusterSoftStoryFraction: number;
  deepExcavationInfluence5y: boolean;
  heavyMachineryOrBlastNearby: boolean;
  aftershockDamageCorrelationIdx: number;
  interBuildingFireSpreadRisk: number;
}

/** 10 — Acil durum hazırlığı */
export interface EmergencyData {
  assemblyAreaWalkDistanceM: number;
  ambulanceRouteRedundant: boolean;
  verticalEvacuationStairsCertified: boolean;
  emergencyWaterLitersOnSite: number;
  backupCommunicationsSatellite: boolean;
  familyReunificationPlanScore: number;
  neighborhoodCoordinatorTrained: boolean;
  hazmatRouteBufferM: number;
  hardenedShelterAccessM: number;
  lastCommunityDrillIsoWeek: number;
}

/** 8 — Sigorta */
export interface InsuranceProtection {
  daskPolicyActive: boolean;
  comprehensiveStructuralRider: boolean;
  engineeringAllRiskRider: boolean;
  indemnityLimitTry: number;
  waitingPeriodDays: number;
  premiumRiskBand: "A" | "B" | "C" | "D" | "E";
  claimsHistoryCount5y: number;
  brokerRiskReviewYear: number;
}

/** 10 — Toplum / belediye dayanıklılığı */
export interface CommunityPrep {
  afadVolunteerTeamNearby: boolean;
  municipalityMicrozonationUpdateYear: number;
  urbanOpenSpacePerCapitaM2: number;
  hospitalBedsPer1kResidents: number;
  fireEngineResponseSlaMin: number;
  criticalBridgeRedundancyScore: number;
  temporaryHousingPlanYear: number;
  debrisRoutePlanExists: boolean;
  earlyWarningSubscriptionPctNeighborhood: number;
  mutualAidAgreementActive: boolean;
}

/** 8 — Belgeler ve uyumluluk */
export interface Certificates {
  iskanRuhsatiCurrent: boolean;
  depremPerformansRaporuVar: boolean;
  staticProjectApprovalYear: number;
  energyPerformanceCertificateId: string;
  fireCodeNonconformanceFlag: boolean;
  tbdyUygunlukEtiketi: string;
  asbuiltSurveyQrPresent: boolean;
  municipalPeriodicInspectionScore: number;
}

/** 8 — Yapay zekâ / mahalle sıralamaları */
export interface AiDerived {
  neighborhoodRiskRankPercentile: number;
  districtRiskClusterLabel: string;
  remoteSensingSubsidenceMmYr: number;
  newsSentimentRiskIdx: number;
  peerBuildingRetrofitPctEstimate: number;
  priceDiscountUnderStressScenarioPct: number;
  liquidityShockHalflifeDays: number;
  modelConfidence01: number;
}

export interface DisasterData {
  fault: FaultData;
  soil: SoilData;
  structural: StructuralData;
  damageHistory: DamageHistory;
  retrofit: RetrofitData;
  neighbor: NeighborStructure;
  emergency: EmergencyData;
  insurance: InsuranceProtection;
  community: CommunityPrep;
  certificates: Certificates;
  ai: AiDerived;
  dataSourceNoteTr: string;
  lastUpdatedIso: string;
}

export type EarthquakeSubScoreKey =
  | "faultProximity"
  | "soilClass"
  | "structuralSystem"
  | "ageCondition"
  | "damageHistory"
  | "retrofit"
  | "neighborRisk"
  | "emergency"
  | "insurance"
  | "community"
  | "certificates"
  | "aiContext";

export interface SubScoreBreakdown {
  key: EarthquakeSubScoreKey;
  labelTr: string;
  score: number;
  weight: number;
  weightedPoints: number;
  inputs: Record<string, string | number | boolean | null>;
  formulaTr: string;
  explanationTr: string;
}

export type ScoreBand = "A" | "B" | "C" | "D" | "E";

export interface EarthquakeScore12 {
  /** 0–100, yüksek = daha dayanıklı / daha güvenli profil (demo endeks). */
  totalScore: number;
  band: ScoreBand;
  subScores: Record<EarthquakeSubScoreKey, number>;
  breakdown: SubScoreBreakdown[];
  computedAtIso: string;
}

/** 12 alt skor ağırlıkları — toplam 1,0; fay %14. */
export const SUB_SCORE_WEIGHTS: Record<EarthquakeSubScoreKey, number> = {
  faultProximity: 0.14,
  soilClass: 0.12,
  structuralSystem: 0.13,
  ageCondition: 0.08,
  damageHistory: 0.08,
  retrofit: 0.1,
  neighborRisk: 0.07,
  emergency: 0.06,
  insurance: 0.06,
  community: 0.05,
  certificates: 0.06,
  aiContext: 0.05,
} as const;

export function assertSubScoreWeightsSum(): void {
  const s = Object.values(SUB_SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
  if (Math.abs(s - 1) > 1e-6) {
    throw new Error(`SUB_SCORE_WEIGHTS must sum to 1, got ${s}`);
  }
}