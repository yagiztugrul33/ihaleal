/** Gayrimenkulü satış/kiralama kanalı (üçlü model). */
export type PropertyMarketingMode = "listing_only" | "sealed_offers" | "auction";

export interface Auction {
  id: string;
  /** Insan okunur ilan numarasi (or. ILN-2026-W05-A1B2C3); yoksa withListingDefaults turetir. */
  listingNumber?: string;
  title: string;
  description: string;
  location: string;
  district: string;
  city: string;
  currentBid: number;
  startingBid: number;
  /** İsteğe bağlı: ekspertiz / referans değer (demo denetim). */
  referenceValueTRY?: number;
  estimatedValue: number;
  aiPredictedPrice: number;
  investmentScore: number;
  pricePerSqm: number;
  bidderCount: number;
  /** Doğrudan satın al (satıcı belirler veya demo varsayılanı). ₺ */
  buyNowPriceTry?: number;
  endDate: string;
  images: string[];
  virtualTour?: string;
  mapLat: number;
  mapLng: number;
  category: string;
  /** Satış veya kiralık. */
  dealType?: "sale" | "rent";
  /**
   * Üç mod: yalnız ilan (kartta platform adı, müşteri bizimle), kapalı teklif, ihale.
   * Eski kayıtlarda yoksa `negotiationMode` ile türetilir.
   */
  marketingMode?: PropertyMarketingMode;
  /** Eski alan — `marketingMode` ile hizalı tutulur; yeni kod önce `marketingMode` kullanır. */
  negotiationMode?: "auction" | "sealed_offer";
  /** Doğrudan ilan sahibi telefonu gösterilmez; platform kanalı (varsayılan true). */
  contactViaPlatform?: boolean;
  /** Üçüncü taraf piyasa / değerleme PDF’i — yükleme demo: yalnızca dosya adı (sunucuya gitmez). */
  marketReportPdfName?: string;
  /** SPK uzmanı ekspertiz raporu — dosya adı demo. */
  expertisePdfName?: string;
  /** İlanda ekspertiz zorunluluğu beyanı. */
  expertiseRequired?: boolean;
  /** Satıcı/kiraya veren: taahhüt alt limit (₺). */
  commitmentFloorTRY?: number;
  /** Satıcı/kiraya veren: taahhüt üst limit — bu limite ulaşıldığında işlem yükümlülüğü (sözleşme taslağı). */
  commitmentCeilingTRY?: number;
  /** Taahhüt + cezai şart metnini okudum (kayıt). */
  bindingCommitmentAccepted?: boolean;
  /** İmar / belediye / resmi karar paketi alıcıya gösterilecek beyanı. */
  officialDocumentsForBuyer?: boolean;
  status: "live" | "upcoming" | "ended";
  tags: string[];
  propertyDetails: PropertyDetails;
  features: string[];
  nearbyFacilities: NearbyFacility[];
  priceHistory: PricePoint[];
  areaStats: AreaStats;
  agent: AgentInfo;
}

export interface PropertyDetails {
  roomCount: string;
  livingRoom: number;
  bathroom: number;
  grossSqm: number;
  netSqm: number;
  floor: string;
  totalFloors: number;
  buildingAge: string;
  heating: string;
  facade: string;
  balcony: boolean;
  elevator: boolean;
  parking: boolean;
  furnished: boolean;
  usingStatus: string;
  deedStatus: string;
  swap: boolean;
  eligibility: string;
}

export interface NearbyFacility {
  name: string;
  type: "transport" | "education" | "health" | "shopping" | "other";
  distance: number;
}

export interface PricePoint {
  date: string;
  price: number;
  event: string;
}

export interface AreaStats {
  avgPricePerSqm: number;
  priceChangeMonthly: number;
  priceChangeYearly: number;
  rentalYield: number;
  demandIndex: number;
  supplyCount: number;
  avgDaysOnMarket: number;
}

export interface AgentInfo {
  name: string;
  company: string;
  phone: string;
  rating: number;
  reviewCount: number;
  image: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidder: string;
  amount: number;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  verified: boolean;
  rating: number;
  auctionsCreated: number;
  auctionsWon: number;
  memberSince: string;
}
