import { calculateEarthquakeScore } from "@/lib/scoring/earthquakeEngine";
import type { PropertyRecord } from "@/types/property";
import type {
  AiDerived,
  Certificates,
  CommunityPrep,
  DamageHistory,
  DisasterData,
  EmergencyData,
  FaultData,
  InsuranceProtection,
  NeighborStructure,
  RetrofitData,
  SoilData,
  StructuralData,
} from "@/types/property/disaster";

function u32(s: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rf(s: string, salt: number): number {
  return u32(s, salt) / 4294967296;
}

function ri(s: string, salt: number, lo: number, hi: number): number {
  return Math.floor(lo + rf(s, salt) * (hi - lo + 1));
}

function refYear(): number {
  return new Date().getFullYear();
}

function constructionYear(property: PropertyRecord): number {
  const y = refYear();
  const b = property.buildingAge;
  if (b === "0-5") return y - ri(property.id, 11, 0, 5);
  if (b === "6-10") return y - ri(property.id, 12, 6, 10);
  if (b === "11-20") return y - ri(property.id, 13, 11, 20);
  if (b === "20+") return y - ri(property.id, 14, 21, 45);
  return y - ri(property.id, 15, 8, 30);
}

/** Demo tohumlama: il, yapi yasi (yil olarak) ve id hash ile deterministik afet + deprem skoru uretir. */
export function seedDisasterForProperty(property: PropertyRecord): PropertyRecord {
  const id = property.id;
  const cn = (property.city ?? "").toLocaleLowerCase("tr-TR");
  const isIst = cn.includes("istanbul");
  const isBodrumCoast = cn.includes("bodrum") || cn.includes("çeşme") || cn.includes("cesme");
  const isHatay = cn.includes("hatay") || cn.includes("antakya") || cn.includes("iskenderun") || cn.includes("defne");

  const yBuild = constructionYear(property);
  const y = yBuild;
  const floors = property.totalFloors ?? 6;
  const h = Math.round((floors * 3.2 + 4 + rf(id, 21) * 6) * 10) / 10;
  const ec = property.earthquakeClass ?? "1B";

  let zClass: SoilData["zeminSinifiTbdly"] = "ZC";
  let vs30 = 520 + ri(id, 31, -40, 80);
  let liq = 18 + ri(id, 32, 0, 25);
  let pga = 0.32 + rf(id, 33) * 0.12;
  let dFault = 14 + rf(id, 34) * 18;
  let faultCode = "KIR";
  let faultName = "Bolgesel fay ozeti";
  let secFaults = ri(id, 35, 0, 3);

  if (isIst) {
    zClass = "ZC";
    vs30 = 480 + ri(id, 36, -30, 40);
    liq = 38 + ri(id, 37, 0, 22);
    pga = 0.44 + rf(id, 38) * 0.09;
    dFault = 5 + rf(id, 39) * 6;
    faultCode = "KAF";
    faultName = "Kuzey Anadolu Fayi (KAF) referans mesafesi";
    secFaults = ri(id, 40, 1, 4);
  } else if (isBodrumCoast) {
    zClass = "ZB";
    vs30 = 860 + ri(id, 41, -60, 120);
    liq = 10 + ri(id, 42, 0, 12);
    pga = 0.24 + rf(id, 43) * 0.08;
    dFault = 35 + rf(id, 44) * 25;
    faultCode = "EGE";
    faultName = "Ege graben / uzak fay etkisi";
    secFaults = ri(id, 45, 0, 2);
  } else if (isHatay) {
    zClass = "ZD";
    vs30 = 310 + ri(id, 46, -40, 50);
    liq = 48 + ri(id, 47, 0, 22);
    pga = 0.48 + rf(id, 48) * 0.1;
    dFault = 3 + rf(id, 49) * 5;
    faultCode = "DAF-EAF";
    faultName = "Olasi DAF-EAF yuksek etki bandi";
    secFaults = ri(id, 50, 2, 5);
  }

  const soil: SoilData = {
    zeminSinifiTbdly: zClass,
    vs30MpsEst: vs30,
    groundwaterDepthM: 1.2 + rf(id, 51) * 6,
    naturalPeriodTSiteS: 0.35 + rf(id, 52) * 0.5,
    plasticityIndexEst: 15 + ri(id, 53, 0, 25),
    fillDepthM: rf(id, 54) * 3.5,
    bedrockDepthEstM: 20 + ri(id, 55, 0, 70),
    slopeAngleDeg: rf(id, 56) * 8,
    liquefactionSusceptibilityIdx: liq,
    landslideSusceptibilityIdx: 6 + ri(id, 57, 0, 35),
    siteAmplificationFaEst: 1 + rf(id, 58) * 0.55,
    geotechReportYear: refYear() - ri(id, 59, 0, 12),
  };

  const fault: FaultData = {
    nearestActiveFaultCode: faultCode,
    nearestFaultNameTr: faultName,
    distanceToFaultKm: Math.round(dFault * 10) / 10,
    faultSlipType: isIst ? "strike_slip" : isHatay ? "strike_slip" : "unknown",
    slipRateMmYr: 4 + rf(id, 60) * 18,
    segmentRuptureProbability10y: 0.04 + rf(id, 61) * 0.12,
    historicalMmax: 7 + rf(id, 62) * 1.2,
    afadDesignPgaG: Math.round(pga * 1000) / 1000,
    spectralAccelerationS1: Math.round(pga * 1.15 * 1000) / 1000,
    secondaryFaultsWithin5km: secFaults,
    microzonationFaultAmplificationNote: isIst
      ? "Istanbul yerel mikro zonasyon hipotezi (demo)."
      : "Genel mikro zonasyon notu.",
    basinEdgeDistanceKm: 5 + rf(id, 63) * 20,
    coastalTsunamiFaultSegment: isBodrumCoast && rf(id, 64) > 0.7,
    creepVsLockedIndicator: rf(id, 65) > 0.55 ? "locked" : "mixed",
    faultTraceMapAccuracyM: 80 + ri(id, 66, 0, 400),
  };

  const structural: StructuralData = {
    structuralSystemType: property.buildingType ?? "Betonarme karkas",
    lateralForceResistingSystem: rf(id, 67) > 0.4 ? "Cerceve + perde" : "Perdeli cerceve",
    planRegularityScore: 55 + ri(id, 68, 0, 38),
    verticalRegularityScore: 58 + ri(id, 69, 0, 35),
    softStoryIndex: 12 + ri(id, 70, 0, 45),
    buildingHeightM: h,
    effectiveStoryCount: floors,
    yearOfConstruction: yBuild,
    apparentMaintenanceScore: 48 + ri(id, 71, 0, 48),
    hammerEarthquakeClass: ec,
    foundationSystem: rf(id, 72) > 0.35 ? "Radye temel" : "Kazikli radye",
    basementLevelCount: property.taxonomy.category === "konut" ? ri(id, 73, 0, 2) : ri(id, 74, 0, 3),
    infillWallOpeningsRatio: 0.2 + rf(id, 75) * 0.45,
    shortColumnIndex: 8 + ri(id, 76, 0, 40),
    massStiffnessIrregularity: 10 + ri(id, 77, 0, 55),
    diaphragmContinuityScore: 58 + ri(id, 78, 0, 35),
    nonstructuralFallRisk: 15 + ri(id, 79, 0, 55),
    poundingRiskWithNeighbor: 12 + ri(id, 80, 0, 50),
    pre1999UnreinforcedConcrete: yBuild < 2000,
  };

  const damageHistory: DamageHistory = {
    knownStrongMotionEventsAfter1999: isHatay ? 2 : isIst ? 1 : rf(id, 81) > 0.5 ? 1 : 0,
    maxObservedPgaG: isHatay ? 0.52 + rf(id, 82) * 0.1 : 0.08 + rf(id, 82) * 0.35,
    crackWidthMmWorst: isHatay ? 1.2 + rf(id, 83) : rf(id, 83) * 1.2,
    structuralAuditPresent: rf(id, 84) > 0.82,
    auditSeverityClass: isHatay && rf(id, 85) > 0.3 ? "light" : "none",
    insuranceClaimFiled: rf(id, 86) > 0.92,
    postEventRepairQuality: "none",
    progressiveDamageFlag: isHatay && rf(id, 87) > 0.55,
    basementLeakageAfterquake: rf(id, 88) > 0.88,
    parapetOrFacadeDamage: isHatay && rf(id, 89) > 0.4,
  };

  const retrofit: RetrofitData = {
    retrofitExecuted: yBuild < 2004 && (isIst || isHatay || rf(id, 90) > 0.85),
    retrofitDesignStandard: yBuild < 2004 ? "TBDY 2018 hedef performans" : "",
    columnJacketEquivalentCount: yBuild < 2004 ? ri(id, 91, 2, 14) : 0,
    shearWallAddedLinearM: yBuild < 2004 ? 8 + rf(id, 92) * 22 : 0,
    fiberWrapAreaM2: rf(id, 93) > 0.75 ? rf(id, 94) * 40 : 0,
    baseIsolationPresent: rf(id, 95) > 0.97,
    softStoryMitigationDone: yBuild < 2000 && rf(id, 96) > 0.7,
    strengtheningPermitReference: yBuild < 2004 ? `R-${u32(id, 97).toString(36)}` : "",
    completionInspectionPassed: yBuild < 2004 && rf(id, 98) > 0.45,
    postRetrofitCapacityPgaG: yBuild < 2004 ? 0.32 + rf(id, 99) * 0.18 : 0,
    annualMaintenanceBudgetTry: 50_000 + ri(id, 100, 0, 400) * 1000,
    contractorSeismicCertified: rf(id, 101) > 0.6,
  };

  const neighbor: NeighborStructure = {
    avgNeighborBuildingHeightM: h - 3 + rf(id, 102) * 18,
    tallAdjacentWithinOneParcel: rf(id, 103) > 0.88,
    commonWallSetbackM: 2 + rf(id, 104) * 6,
    poundingRiskGapCm: 5 + ri(id, 105, 0, 22),
    neighborBuildingAgeSpreadYears: 8 + ri(id, 106, 0, 35),
    clusterSoftStoryFraction: (isIst ? 0.22 : 0.1) + rf(id, 107) * 0.2,
    deepExcavationInfluence5y: rf(id, 108) > 0.92,
    heavyMachineryOrBlastNearby: rf(id, 109) > 0.95,
    aftershockDamageCorrelationIdx: isHatay ? 35 + ri(id, 110, 0, 25) : ri(id, 110, 0, 30),
    interBuildingFireSpreadRisk: 15 + ri(id, 111, 0, 55),
  };

  const emergency: EmergencyData = {
    assemblyAreaWalkDistanceM: 350 + ri(id, 112, 0, 900),
    ambulanceRouteRedundant: rf(id, 113) > 0.25,
    verticalEvacuationStairsCertified: rf(id, 114) > 0.75,
    emergencyWaterLitersOnSite: 80 + ri(id, 115, 0, 600),
    backupCommunicationsSatellite: rf(id, 116) > 0.9,
    familyReunificationPlanScore: 35 + ri(id, 117, 0, 55),
    neighborhoodCoordinatorTrained: isIst || rf(id, 118) > 0.55,
    hazmatRouteBufferM: 150 + ri(id, 119, 0, 600),
    hardenedShelterAccessM: 400 + ri(id, 120, 0, 1400),
    lastCommunityDrillIsoWeek: ri(id, 121, 1, 52),
  };

  const insurance: InsuranceProtection = {
    daskPolicyActive: property.disasterInsurance !== false,
    comprehensiveStructuralRider: rf(id, 122) > 0.15,
    engineeringAllRiskRider: property.taxonomy.category === "endustri",
    indemnityLimitTry: 2_000_000 + ri(id, 123, 0, 120) * 25_000,
    waitingPeriodDays: 15 + ri(id, 124, 0, 45),
    premiumRiskBand: isHatay ? "D" : isIst ? "C" : "B",
    claimsHistoryCount5y: rf(id, 125) > 0.96 ? 1 : 0,
    brokerRiskReviewYear: refYear() - (rf(id, 126) > 0.5 ? 0 : 1),
  };

  const community: CommunityPrep = {
    afadVolunteerTeamNearby: rf(id, 127) > 0.2,
    municipalityMicrozonationUpdateYear: refYear() - ri(id, 128, 0, 8),
    urbanOpenSpacePerCapitaM2: 4 + rf(id, 129) * 14,
    hospitalBedsPer1kResidents: 2 + rf(id, 130) * 3.5,
    fireEngineResponseSlaMin: 7 + ri(id, 131, 0, 12),
    criticalBridgeRedundancyScore: 45 + ri(id, 132, 0, 45),
    temporaryHousingPlanYear: refYear() - ri(id, 133, 0, 4),
    debrisRoutePlanExists: rf(id, 134) > 0.35,
    earlyWarningSubscriptionPctNeighborhood: (isIst ? 26 : 14) + ri(id, 135, 0, 20),
    mutualAidAgreementActive: rf(id, 136) > 0.75,
  };

  const certificates: Certificates = {
    iskanRuhsatiCurrent: property.occupancyPermit !== false,
    depremPerformansRaporuVar: ec.startsWith("1") && rf(id, 137) > 0.55,
    staticProjectApprovalYear: yBuild + ri(id, 138, 0, 3),
    energyPerformanceCertificateId: `EPC-${u32(id, 139).toString(36)}`,
    fireCodeNonconformanceFlag: rf(id, 140) > 0.94,
    tbdyUygunlukEtiketi: ec,
    asbuiltSurveyQrPresent: rf(id, 141) > 0.85,
    municipalPeriodicInspectionScore: 55 + ri(id, 142, 0, 40),
  };

  const ai: AiDerived = {
    neighborhoodRiskRankPercentile:
      (isHatay ? 82 : isIst ? 68 : isBodrumCoast ? 25 : 42) + ri(id, 143, 0, 12),
    districtRiskClusterLabel: isHatay
      ? "DAF-yuksek-stres"
      : isIst
        ? "KAF-proximity-cluster"
        : "Genel-performans",
    remoteSensingSubsidenceMmYr: rf(id, 144) * 12,
    newsSentimentRiskIdx: isHatay ? 55 + ri(id, 145, 0, 20) : 20 + ri(id, 145, 0, 35),
    peerBuildingRetrofitPctEstimate: (isIst ? 20 : 12) + rf(id, 146) * 18,
    priceDiscountUnderStressScenarioPct: isHatay ? 10 + rf(id, 147) * 8 : rf(id, 147) * 10,
    liquidityShockHalflifeDays: 60 + ri(id, 148, 0, 200),
    modelConfidence01: 0.52 + rf(id, 149) * 0.38,
  };

  const disaster: DisasterData = {
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
    dataSourceNoteTr:
      "Demo tohumlama: Kuzey Anadolu (Istanbul), Ege (Bodrum/Çeşme), DAF-EAF (Hatay) profilleri; id hash ile deterministik varyasyon. Resmi veri degildir.",
    lastUpdatedIso: new Date().toISOString(),
  };

  const earthquakeScore = calculateEarthquakeScore({ ...property, disaster });

  return { ...property, disaster, earthquakeScore };
}
