export type DemoLocationKey = "istanbul-kadikoy" | "istanbul-besiktas" | "ankara-cankaya" | "izmir-karsiyaka" | "antalya-muratpasa";

export interface LocationIntelligenceInput {
  city: string;
  district: string;
  neighborhood: string;
  parcelRef?: string;
  segeScore: number;
  medianIncomeIndex: number;
  higherEducationRate: number;
  whiteCollarRate: number;
  educationAttainmentIndex?: number;
  formalEmploymentRate?: number;
  youthDependencyRatio?: number;
  populationDensityIndex?: number;
  marketDistanceM: number;
  schoolDistanceM: number;
  hospitalDistanceM: number;
  metroDistanceM: number;
  parkDistanceM: number;
  poiDensityPerKm2: number;
  transitLineCount: number;
  schoolCountNearby: number;
  schoolQualityIndex?: number;
  responseTimeMinutes: number;
  lightingIndex: number;
  incidentRiskProxy: number;
  socialCohesionIndex: number;
  cameraCoverageIndex?: number;
}

export interface LayerContribution {
  key: "ses" | "poi" | "education" | "safety";
  label: string;
  score: number;
  weightPct: number;
  contributionPts: number;
  note: string;
}

export interface LocationLayerResult {
  score: number;
  note: string;
}

export interface LocationIntelligenceResult {
  locationScore: number;
  livabilityScore: number;
  investmentScore: number;
  ses: LocationLayerResult;
  poiAccessibility: LocationLayerResult;
  education: LocationLayerResult;
  safety: LocationLayerResult;
  contributions: LayerContribution[];
  disclaimer: string;
  dataQualityNote: string;
  tags: string[];
  weightModel: {
    method: "fahp-weighted";
    ses: number;
    poi: number;
    education: number;
    safety: number;
  };
}

interface DemoDistrictProfile {
  key: DemoLocationKey;
  city: string;
  district: string;
  defaultNeighborhood: string;
  baseline: Omit<LocationIntelligenceInput, "city" | "district" | "neighborhood" | "parcelRef">;
}

export const DEMO_DISTRICT_PROFILES: DemoDistrictProfile[] = [
  {
    key: "istanbul-kadikoy",
    city: "Istanbul",
    district: "Kadikoy",
    defaultNeighborhood: "Feneryolu",
    baseline: {
      segeScore: 90,
      medianIncomeIndex: 86,
      higherEducationRate: 74,
      whiteCollarRate: 71,
      educationAttainmentIndex: 77,
      formalEmploymentRate: 81,
      youthDependencyRatio: 39,
      populationDensityIndex: 73,
      marketDistanceM: 260,
      schoolDistanceM: 410,
      hospitalDistanceM: 1150,
      metroDistanceM: 360,
      parkDistanceM: 520,
      poiDensityPerKm2: 68,
      transitLineCount: 8,
      schoolCountNearby: 17,
      schoolQualityIndex: 79,
      responseTimeMinutes: 9,
      lightingIndex: 82,
      incidentRiskProxy: 33,
      socialCohesionIndex: 76,
      cameraCoverageIndex: 73,
    },
  },
  {
    key: "istanbul-besiktas",
    city: "Istanbul",
    district: "Besiktas",
    defaultNeighborhood: "Levent",
    baseline: {
      segeScore: 92,
      medianIncomeIndex: 91,
      higherEducationRate: 77,
      whiteCollarRate: 82,
      educationAttainmentIndex: 81,
      formalEmploymentRate: 86,
      youthDependencyRatio: 33,
      populationDensityIndex: 81,
      marketDistanceM: 210,
      schoolDistanceM: 450,
      hospitalDistanceM: 980,
      metroDistanceM: 260,
      parkDistanceM: 590,
      poiDensityPerKm2: 73,
      transitLineCount: 10,
      schoolCountNearby: 14,
      schoolQualityIndex: 82,
      responseTimeMinutes: 8,
      lightingIndex: 84,
      incidentRiskProxy: 35,
      socialCohesionIndex: 73,
      cameraCoverageIndex: 76,
    },
  },
  {
    key: "ankara-cankaya",
    city: "Ankara",
    district: "Cankaya",
    defaultNeighborhood: "Birlik",
    baseline: {
      segeScore: 84,
      medianIncomeIndex: 79,
      higherEducationRate: 69,
      whiteCollarRate: 67,
      educationAttainmentIndex: 72,
      formalEmploymentRate: 75,
      youthDependencyRatio: 44,
      populationDensityIndex: 67,
      marketDistanceM: 340,
      schoolDistanceM: 520,
      hospitalDistanceM: 1300,
      metroDistanceM: 740,
      parkDistanceM: 610,
      poiDensityPerKm2: 56,
      transitLineCount: 6,
      schoolCountNearby: 13,
      schoolQualityIndex: 72,
      responseTimeMinutes: 11,
      lightingIndex: 78,
      incidentRiskProxy: 37,
      socialCohesionIndex: 74,
      cameraCoverageIndex: 67,
    },
  },
  {
    key: "izmir-karsiyaka",
    city: "Izmir",
    district: "Karsiyaka",
    defaultNeighborhood: "Mavisehir",
    baseline: {
      segeScore: 81,
      medianIncomeIndex: 75,
      higherEducationRate: 66,
      whiteCollarRate: 62,
      educationAttainmentIndex: 69,
      formalEmploymentRate: 71,
      youthDependencyRatio: 45,
      populationDensityIndex: 64,
      marketDistanceM: 290,
      schoolDistanceM: 460,
      hospitalDistanceM: 1270,
      metroDistanceM: 680,
      parkDistanceM: 470,
      poiDensityPerKm2: 53,
      transitLineCount: 5,
      schoolCountNearby: 12,
      schoolQualityIndex: 71,
      responseTimeMinutes: 12,
      lightingIndex: 76,
      incidentRiskProxy: 39,
      socialCohesionIndex: 72,
      cameraCoverageIndex: 64,
    },
  },
  {
    key: "antalya-muratpasa",
    city: "Antalya",
    district: "Muratpasa",
    defaultNeighborhood: "Fener",
    baseline: {
      segeScore: 72,
      medianIncomeIndex: 68,
      higherEducationRate: 58,
      whiteCollarRate: 52,
      educationAttainmentIndex: 61,
      formalEmploymentRate: 63,
      youthDependencyRatio: 51,
      populationDensityIndex: 57,
      marketDistanceM: 380,
      schoolDistanceM: 620,
      hospitalDistanceM: 1400,
      metroDistanceM: 1700,
      parkDistanceM: 700,
      poiDensityPerKm2: 45,
      transitLineCount: 4,
      schoolCountNearby: 9,
      schoolQualityIndex: 63,
      responseTimeMinutes: 13,
      lightingIndex: 71,
      incidentRiskProxy: 43,
      socialCohesionIndex: 67,
      cameraCoverageIndex: 58,
    },
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function ratioToScore(value: number, maxGood: number): number {
  if (maxGood <= 0) return 0;
  return clamp(100 - (value / maxGood) * 100, 0, 100);
}

function distanceToScore(distanceM: number, halfLifeM: number): number {
  if (distanceM <= 0) return 100;
  const score = 100 * Math.exp(-(Math.log(2) * distanceM) / Math.max(50, halfLifeM));
  return clamp(score, 8, 100);
}

function geometricMean(values: number[]): number {
  const product = values.reduce((acc, item) => acc * Math.max(item, 0.0001), 1);
  return product ** (1 / values.length);
}

function deriveFahpWeights() {
  // Demo veri / ön analiz: FAHP benzeri ağırlık üretimi için uzman pairwise matrisi.
  const matrix = [
    [1, 0.9, 1.4, 1.2], // SES
    [1 / 0.9, 1, 1.35, 1.25], // POI
    [1 / 1.4, 1 / 1.35, 1, 0.95], // Education
    [1 / 1.2, 1 / 1.25, 1 / 0.95, 1], // Safety
  ];
  const gm = matrix.map((row) => geometricMean(row));
  const sum = gm.reduce((acc, item) => acc + item, 0);
  return {
    ses: gm[0] / sum,
    poi: gm[1] / sum,
    education: gm[2] / sum,
    safety: gm[3] / sum,
  } as const;
}

const LAYER_WEIGHTS = deriveFahpWeights();

function withDefaults(input: LocationIntelligenceInput): Required<LocationIntelligenceInput> {
  return {
    ...input,
    parcelRef: input.parcelRef ?? "",
    educationAttainmentIndex: input.educationAttainmentIndex ?? input.higherEducationRate,
    formalEmploymentRate: input.formalEmploymentRate ?? input.whiteCollarRate,
    youthDependencyRatio: input.youthDependencyRatio ?? 46,
    populationDensityIndex: input.populationDensityIndex ?? 62,
    schoolQualityIndex: input.schoolQualityIndex ?? 68,
    cameraCoverageIndex: input.cameraCoverageIndex ?? 61,
  };
}

export function buildLocationInputFromProfile(
  key: DemoLocationKey,
  overrides?: Partial<LocationIntelligenceInput>,
): LocationIntelligenceInput {
  const profile = DEMO_DISTRICT_PROFILES.find((item) => item.key === key);
  if (!profile) {
    throw new Error("Profil bulunamadi.");
  }
  return {
    city: profile.city,
    district: profile.district,
    neighborhood: profile.defaultNeighborhood,
    parcelRef: "",
    ...profile.baseline,
    ...overrides,
  };
}

export function calculateSesLayer(input: LocationIntelligenceInput): LocationLayerResult {
  const normalized = withDefaults(input);
  const dependencyScore = ratioToScore(normalized.youthDependencyRatio, 72);
  const densityBalance = 100 - Math.abs(normalized.populationDensityIndex - 65);
  const score = clamp(
    normalized.segeScore * 0.28 +
      normalized.medianIncomeIndex * 0.19 +
      normalized.higherEducationRate * 0.13 +
      normalized.educationAttainmentIndex * 0.16 +
      normalized.formalEmploymentRate * 0.12 +
      dependencyScore * 0.07 +
      densityBalance * 0.05,
    0,
    100,
  );
  return {
    score: round(score),
    note: "Demo veri / ön analiz: SES skoru SEGE + gelir + eğitim + istihdam + nüfus yaş kompozisyonu ile hesaplandı.",
  };
}

export function calculatePoiAccessibilityLayer(input: LocationIntelligenceInput): LocationLayerResult {
  const normalized = withDefaults(input);
  const market = distanceToScore(normalized.marketDistanceM, 420);
  const school = distanceToScore(normalized.schoolDistanceM, 560);
  const hospital = distanceToScore(normalized.hospitalDistanceM, 1100);
  const metro = distanceToScore(normalized.metroDistanceM, 650);
  const park = distanceToScore(normalized.parkDistanceM, 500);
  const densityScore = clamp(normalized.poiDensityPerKm2 * 1.45, 18, 100);
  const transitStrength = clamp(normalized.transitLineCount * 10.5, 8, 100);

  const score = clamp(
    metro * 0.31 + transitStrength * 0.23 + school * 0.11 + hospital * 0.11 + market * 0.1 + park * 0.05 + densityScore * 0.09,
    0,
    100,
  );

  return {
    score: round(score),
    note: "Demo veri / ön analiz: Walk Score mantığıyla mesafe + yoğunluk skoru üretildi; toplu taşıma en güçlü pozitif ağırlıkta.",
  };
}

export function calculateEducationLayer(input: LocationIntelligenceInput): LocationLayerResult {
  const normalized = withDefaults(input);
  const schoolDistanceScore = distanceToScore(normalized.schoolDistanceM, 620);
  const schoolDensityScore = clamp(normalized.schoolCountNearby * 6.3, 25, 100);
  const regionalEduScore = clamp(normalized.higherEducationRate * 1.12, 18, 100);
  const attainmentScore = clamp(normalized.educationAttainmentIndex * 1.05, 20, 100);
  const qualityScore = clamp(normalized.schoolQualityIndex, 20, 100);
  const score = clamp(
    schoolDistanceScore * 0.24 + schoolDensityScore * 0.22 + regionalEduScore * 0.24 + attainmentScore * 0.16 + qualityScore * 0.14,
    0,
    100,
  );
  return {
    score: round(score),
    note: "Demo veri / ön analiz: okul erişimi, okul yoğunluğu ve bölgesel eğitim düzeyi birlikte modellendi.",
  };
}

export function calculateSafetyLayer(input: LocationIntelligenceInput): LocationLayerResult {
  const normalized = withDefaults(input);
  const responseScore = clamp(100 - normalized.responseTimeMinutes * 4.8, 18, 100);
  const riskScore = clamp(100 - normalized.incidentRiskProxy, 10, 100);
  const score = clamp(
    responseScore * 0.28 +
      riskScore * 0.31 +
      normalized.lightingIndex * 0.17 +
      normalized.cameraCoverageIndex * 0.14 +
      normalized.socialCohesionIndex * 0.1,
    0,
    100,
  );
  return {
    score: round(score),
    note: "Demo veri / ön analiz: Türkiye'de mahalle suç verisi sınırlı; proxy + beyan verileriyle güvenlik skoru üretildi.",
  };
}

export function calculateCompositeLocationScore(input: LocationIntelligenceInput): LocationIntelligenceResult {
  const ses = calculateSesLayer(input);
  const poiAccessibility = calculatePoiAccessibilityLayer(input);
  const education = calculateEducationLayer(input);
  const safety = calculateSafetyLayer(input);

  const weighted =
    ses.score * LAYER_WEIGHTS.ses +
    poiAccessibility.score * LAYER_WEIGHTS.poi +
    education.score * LAYER_WEIGHTS.education +
    safety.score * LAYER_WEIGHTS.safety;

  const livabilityScore = clamp(
    poiAccessibility.score * 0.36 + education.score * 0.27 + safety.score * 0.24 + ses.score * 0.13,
    0,
    100,
  );
  const investmentScore = clamp(
    ses.score * 0.35 + poiAccessibility.score * 0.33 + safety.score * 0.18 + education.score * 0.14,
    0,
    100,
  );

  const contributions: LayerContribution[] = [
    {
      key: "ses",
      label: "SES (SEGE + TÜİK proxy)",
      score: ses.score,
      weightPct: round(LAYER_WEIGHTS.ses * 100),
      contributionPts: round(ses.score * LAYER_WEIGHTS.ses),
      note: ses.note,
    },
    {
      key: "poi",
      label: "POI / erişilebilirlik",
      score: poiAccessibility.score,
      weightPct: round(LAYER_WEIGHTS.poi * 100),
      contributionPts: round(poiAccessibility.score * LAYER_WEIGHTS.poi),
      note: poiAccessibility.note,
    },
    {
      key: "education",
      label: "Eğitim katmanı",
      score: education.score,
      weightPct: round(LAYER_WEIGHTS.education * 100),
      contributionPts: round(education.score * LAYER_WEIGHTS.education),
      note: education.note,
    },
    {
      key: "safety",
      label: "Güvenlik katmanı",
      score: safety.score,
      weightPct: round(LAYER_WEIGHTS.safety * 100),
      contributionPts: round(safety.score * LAYER_WEIGHTS.safety),
      note: safety.note,
    },
  ];

  const tags = [
    poiAccessibility.score >= 75 ? "Yüksek erişilebilirlik" : "Erişilebilirlik geliştirilebilir",
    safety.score >= 70 ? "Güvenlik görünümü güçlü" : "Güvenlik teyidi önerilir",
    ses.score >= 78 ? "SES potansiyeli yüksek" : "SES orta segment",
  ];

  return {
    locationScore: round(weighted),
    livabilityScore: round(livabilityScore),
    investmentScore: round(investmentScore),
    ses,
    poiAccessibility,
    education,
    safety,
    contributions,
    disclaimer:
      "Demo + kamuya açık veri mantığıyla ön analiz üretilir. Türkiye'de mahalle suç verisi sınırlı olduğundan güvenlik skoru proxy+beyan içerir; kesin değildir.",
    dataQualityNote: "Canlı sürümde TÜİK/SEGE ve resmi kurum API entegrasyonu ile kalibrasyon gerekir.",
    tags,
    weightModel: {
      method: "fahp-weighted",
      ses: round(LAYER_WEIGHTS.ses * 100),
      poi: round(LAYER_WEIGHTS.poi * 100),
      education: round(LAYER_WEIGHTS.education * 100),
      safety: round(LAYER_WEIGHTS.safety * 100),
    },
  };
}
