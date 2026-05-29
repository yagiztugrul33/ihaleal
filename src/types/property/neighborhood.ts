/** Mahalle / cevre analizi demo veri modeli. */

export interface NearbySchool {
  name: string;
  type: "ilkokul" | "ortaokul" | "lise" | "universite" | "kres";
  lgsScore?: number;
  yksPlacementPct?: number;
  distanceKm: number;
}

export interface NearbyHospital {
  name: string;
  kind: "kamu" | "ozel";
  emergencyQuality: number;
  distanceKm: number;
}

export interface MetroLineRef {
  name: string;
  stationKm: number;
}

export interface TrafficSlot {
  hour: string;
  congestionIndex: number;
}

export interface CrimeData {
  hirsizlikOrani: number;
  gaspOrani: number;
  trafikKazasi: number;
  asayisSkoru: number;
}

export interface EducationQuality {
  yakinOkullar: NearbySchool[];
  kresErisim: number;
  universiteMesafe: number;
  ozelOkulOrani: number;
}

export interface HealthAccess {
  yakinHastaneler: NearbyHospital[];
  aileHekimi: boolean;
  eczaneSayisi: number;
  disKlinik: number;
}

export interface Transportation {
  metroHat: MetroLineRef[];
  metrobusMesafe: number;
  otobusHat: string[];
  trafikSikisiklik: TrafficSlot[];
  otoparkErisim: number;
  bisikletYolu: boolean;
  yurunebilir: number;
}

export interface LifeQuality {
  parkM2PerKisi: number;
  havaKalitesiPm25: number;
  gurultuDb: number;
  kopekParki: boolean;
  cocukOyunAlani: boolean;
  cafeRestoranYogunluk: number;
  marketErisim: number;
}

export interface Demographics {
  yasDagilimi: { band: string; pct: number }[];
  hanehalkBuyukluk: number;
  egitimSeviyesi: number;
  ortalamaGelir: number;
  yabanciOrani: number;
  eskiYeniKomsuOrani: number;
}

export interface NeighborhoodData {
  crime: CrimeData;
  education: EducationQuality;
  health: HealthAccess;
  transportation: Transportation;
  lifeQuality: LifeQuality;
  demographics: Demographics;
  socioEconomicLevel: 1 | 2 | 3 | 4 | 5;
  jobOpportunityIndex: number;
  livingCostIndex: number;
  aiMahalleOzeti: string;
  nearbyPoints: { icon: string; name: string; distanceKm: number; walkMin: number }[];
}
