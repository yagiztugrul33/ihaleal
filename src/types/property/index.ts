import type { PropertyBase } from "./base";
import type { CategoryKey } from "./taxonomy";
import type { EarthquakeScorePayload } from "./earthquake";

export type {
  PropertyBase,
  IdentityFields,
  LocationFields,
  PhysicalFields,
  StructureFields,
  DisasterFields,
  InfrastructureFields,
  EnvironmentFields,
  SocialFields,
  OwnershipFields,
  ExpertiseFields,
  MediaFields,
  AiFields,
  EngagementFields,
  ModalityFields,
} from "./base";

export type {
  DisasterData,
  FaultData,
  SoilData,
  StructuralData,
  DamageHistory,
  RetrofitData,
  NeighborStructure,
  EmergencyData,
  InsuranceProtection,
  CommunityPrep,
  Certificates,
  AiDerived,
  EarthquakeSubScoreKey,
  SubScoreBreakdown,
  ScoreBand,
  EarthquakeScore12,
} from "./disaster";

export { SUB_SCORE_WEIGHTS, assertSubScoreWeightsSum } from "./disaster";

export type {
  CategoryKey,
  CategoryMeta,
  SubCategoryMeta,
  TypeMeta,
} from "./taxonomy";

export {
  CATEGORY_KEYS,
  TAXONOMY,
  isCategoryKey,
  isSubCategoryKey,
  getCategory,
  listCategoryPaths,
  getTypeMeta,
} from "./taxonomy";

export type { KonutDetay } from "./variants/konut";
export type { VillaDetay } from "./variants/villa";
export type { OtelDetay } from "./variants/otel";
export type { FabrikaDetay } from "./variants/fabrika";
export type { TarlaDetay } from "./variants/tarla";
export type { GesDetay } from "./variants/ges";
export type { ArsaDetay } from "./variants/arsa";
export type { AvmMagazaDetay } from "./variants/avm_magaza";
export type { DevrenDetay } from "./variants/devren";
export type { DepoDetay } from "./variants/depo";
export type { RezidansDetay } from "./variants/rezidans";
export type { MustakilDetay } from "./variants/mustakil";
export type { YaliDetay } from "./variants/yali";
export type { TarihiDetay } from "./variants/tarihi";
export type { MadenDetay } from "./variants/maden";
export type { OfisDetay } from "./variants/ofis";
export type { RestoranDetay } from "./variants/restoran";
export type { AtolyeDetay } from "./variants/atolye";
export type { YazlikDetay } from "./variants/yazlik";
export type { KompleBinaDetay } from "./variants/komple_bina";
export type { ResDetay } from "./variants/res";
export type { TokenizeDetay } from "./variants/tokenize";

export type {
  EarthquakeBand,
  EarthquakeFacets,
  EarthquakeFacetKey,
  EarthquakeScorePayload,
  EarthquakeSubScore,
} from "./earthquake";

export interface PropertyTaxonomy {
  category: CategoryKey | string;
  sub: string;
  type: string;
  variant?: string;
}

export type PropertyRecord = PropertyBase & {
  taxonomy: PropertyTaxonomy;
  details: Partial<Record<string, unknown>>;
  /** Demo deprem / afet uygunluğu çıktıları; eksik ise `calculateEarthquakeScore`. */
  earthquakeScore?: import("@/types/property/disaster").EarthquakeScore12;
};

export function isKonutVilla(p: PropertyRecord): boolean {
  return (
    p.taxonomy.category === "konut" &&
    (p.taxonomy.sub === "villa" ||
      p.taxonomy.variant === "villa" ||
      p.taxonomy.type === "mustakil" ||
      p.taxonomy.type === "ikiz")
  );
}

export function isFabrika(p: PropertyRecord): boolean {
  return (
    p.taxonomy.category === "endustri" &&
    (p.taxonomy.sub === "fabrika" || p.taxonomy.variant === "fabrika")
  );
}

export function isOtel(p: PropertyRecord): boolean {
  return (
    p.taxonomy.category === "konaklama" &&
    (p.taxonomy.sub === "otel" || p.taxonomy.variant === "otel")
  );
}

export function isTarla(p: PropertyRecord): boolean {
  return (
    p.taxonomy.category === "arsa" &&
    (p.taxonomy.sub === "tarla" || p.taxonomy.variant === "tarla")
  );
}

export function isGes(p: PropertyRecord): boolean {
  return (
    p.taxonomy.category === "altyapi" &&
    (p.taxonomy.sub === "ges" || p.taxonomy.variant === "ges")
  );
}

export function getPropertyTitle(p: PropertyRecord): string {
  return p.title.trim();
}

export function getPropertyHero(p: PropertyRecord): string | undefined {
  return p.heroImage ?? p.images?.[0];
}

export function getPropertyPrice(p: PropertyRecord): number | undefined {
  if (p.dealType === "rent") {
    return p.rentTry;
  }
  return (
    p.priceTry ??
    p.currentBidTry ??
    p.buyNowPriceTry ??
    p.aiPredictedPriceTry
  );
}

export function getPropertyLocation(p: PropertyRecord): string {
  const parts = [p.neighborhood, p.district, p.city, p.country].filter(
    (part): part is string => Boolean(part && part.trim())
  );
  if (parts.length > 0) {
    return parts.join(", ");
  }
  return p.address?.trim() ?? "";
}
