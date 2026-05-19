/** Universal property field groups combined into PropertyBase. */

export interface IdentityFields {
  id: string;
  title: string;
  listingNumber?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  status?: "draft" | "active" | "paused" | "sold" | "rented" | "archived";
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  ownerId?: string;
  agencyId?: string;
}

export interface LocationFields {
  country?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  address?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  mapZoom?: number;
  parcelNo?: string;
  blockNo?: string;
  ada?: string;
  pafta?: string;
}

export interface PhysicalFields {
  grossSqm?: number;
  netSqm?: number;
  landSqm?: number;
  balconySqm?: number;
  gardenSqm?: number;
  terraceSqm?: number;
  roomCount?: string;
  livingRoomCount?: number;
  bathroomCount?: number;
  bedroomCount?: number;
  floor?: string;
  totalFloors?: number;
  buildingAge?: string;
  ceilingHeightM?: number;
  facade?: string;
  orientation?: string;
}

export interface StructureFields {
  buildingType?: string;
  constructionType?: string;
  heatingType?: string;
  coolingType?: string;
  insulation?: string;
  earthquakeClass?: string;
  elevator?: boolean;
  elevatorCount?: number;
  parking?: boolean;
  parkingSpots?: number;
  indoorParking?: boolean;
  outdoorParking?: boolean;
  balcony?: boolean;
  furnished?: boolean;
  usageStatus?: "empty" | "tenant" | "owner";
}

export interface DisasterFields {
  earthquakeRiskZone?: string;
  floodRisk?: boolean;
  landslideRisk?: boolean;
  fireCompartment?: boolean;
  emergencyExit?: boolean;
  sprinklerSystem?: boolean;
  disasterInsurance?: boolean;
}

export interface InfrastructureFields {
  electricity?: boolean;
  threePhasePower?: boolean;
  powerKva?: number;
  naturalGas?: boolean;
  water?: boolean;
  sewage?: boolean;
  fiberInternet?: boolean;
  generator?: boolean;
  solarReady?: boolean;
  craneCapacityTon?: number;
  loadingDock?: boolean;
  truckAccess?: boolean;
}

export interface EnvironmentFields {
  seaView?: boolean;
  cityView?: boolean;
  forestView?: boolean;
  greenAreaRatio?: number;
  noiseLevel?: "low" | "medium" | "high";
  airQualityIndex?: number;
  carbonFootprintKg?: number;
  leedLevel?: string;
  breeamLevel?: string;
}

export interface SocialFields {
  siteName?: string;
  siteFeeTry?: number;
  security24h?: boolean;
  concierge?: boolean;
  pool?: boolean;
  gym?: boolean;
  playground?: boolean;
  socialFacilities?: string[];
  nearbySchools?: string[];
  nearbyHospitals?: string[];
  nearbyTransport?: string[];
}

export interface OwnershipFields {
  titleDeedType?: string;
  occupancyPermit?: boolean;
  zoningStatus?: string;
  easement?: boolean;
  mortgage?: boolean;
  lien?: boolean;
  sharedOwnership?: boolean;
  katIrtifaki?: boolean;
  tapuDurumu?: string;
  eligibleForCredit?: boolean;
}

export interface ExpertiseFields {
  expertiseRequired?: boolean;
  expertiseDate?: string;
  expertiseValueTry?: number;
  expertisePdfUrl?: string;
  marketReportPdfUrl?: string;
  appraiserName?: string;
  spkLicenseNo?: string;
}

export interface MediaFields {
  images?: string[];
  heroImage?: string;
  videoUrl?: string;
  virtualTourUrl?: string;
  floorPlanUrls?: string[];
  droneVideoUrl?: string;
  documentUrls?: string[];
}

export interface AiFields {
  aiPredictedPriceTry?: number;
  aiConfidence?: number;
  aiInvestmentScore?: number;
  aiPricePerSqm?: number;
  aiTags?: string[];
  aiSummary?: string;
  aiRiskFlags?: string[];
}

export interface EngagementFields {
  viewCount?: number;
  favoriteCount?: number;
  inquiryCount?: number;
  bidCount?: number;
  lastViewedAt?: string;
  featured?: boolean;
  boostLevel?: number;
}

export interface ModalityFields {
  dealType?: "sale" | "rent" | "transfer";
  marketingMode?: "listing_only" | "sealed_offers" | "auction";
  currency?: string;
  priceTry?: number;
  rentTry?: number;
  depositTry?: number;
  duesTry?: number;
  pricePerSqmTry?: number;
  buyNowPriceTry?: number;
  startingBidTry?: number;
  currentBidTry?: number;
  commitmentFloorTry?: number;
  commitmentCeilingTry?: number;
  negotiable?: boolean;
  contactViaPlatform?: boolean;
}

export interface PropertyBase
  extends IdentityFields,
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
    ModalityFields {}
