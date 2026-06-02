export type Locale = "en" | "tr" | "ru" | "ar";

export const LOCALE_STORAGE_KEY = "ihaleal_locale";

/**
 * Dil yönü — `dir` HTML attribute için.
 * Arapça RTL (sağdan sola), kalan üçü LTR (soldan sağa).
 */
export const LOCALE_DIRECTION: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  tr: "ltr",
  ru: "ltr",
  ar: "rtl",
};

/**
 * RU/AR FAZ 0: SADECE altyapı. Çoğu metin TR fallback.
 * Eklenen kanıt string'leri sadece nav.* öğelerinde (4 dil seçici görünür).
 * Tam çeviri sonraki fazlarda (sayfa sayfa).
 */


export type HomeMessages = {
  hero: {
    badge: string;
    titleLead: string;
    titleAccent: string;
    subtitle: string;
    ctaExplore: string;
    ctaHow: string;
  };
  live: {
    title: string;
    live: string;
    growth: string;
    view: string;
  };
  trust: Array<{ title: string; sub: string }>;
  stats: Array<{ label: string; vs: string }>;
  how: {
    title: string;
    subtitle: string;
    steps: Array<{ title: string; desc: string }>;
    sidebarTitle: string;
    sidebar: Array<{ title: string; sub: string }>;
    certs: Array<{ title: string; sub: string; flag?: string }>;
  };
  auctions: {
    title: string;
    viewAll: string;
    currentBid: string;
    live: string;
    items: Array<{
      title: string;
      location: string;
      price: string;
      change: string;
      time: string;
      bids: string;
    }>;
  };
  trusted: {
    title: string;
    certs: Array<{ title: string; sub: string }>;
  };
  investor: {
    heading: string;
  };
  terminal: {
    eyebrow: string;
    prompt: string;
    askPlaceholder: string;
    askSubmit: string;
    options: {
      rent: string;
      sale: string;
      auction: string;
      launch: string;
    };
    borsaCta: string;
    aiUnavailable: string;
    hints: string[];
  };
};

export type CommonMessages = {
  loading: string;
  loadingListings: string;
  errorLoad: string;
  retry: string;
  emptySearch: string;
  emptyResults: string;
  notFoundListing: string;
};

export type NavMessages = {
  auctions: string;
  howItWorks: string;
  services: string;
  resources: string;
  company: string;
  gesLand: string;
  valuation: string;
  researchHub: string;
  corporate: string;
  faq: string;
  search: string;
  logIn: string;
  signUp: string;
  openMenu: string;
  closeMenu: string;
  langEn: string;
  langTr: string;
  langRu: string;
  langAr: string;
  borsaCta: string;
};

export type OnboardingMessages = {
  title: string;
  subtitle: string;
  back: string;
  skip: string;
  skipNote: string;
  discover: { title: string; subtitle: string; cta: string };
  sell: { title: string; subtitle: string; cta: string };
  buy: { title: string; subtitle: string; cta: string };
};

export type PricingMessages = {
  badge: string;
  title: string;
  subtitle: string;
  yearlyDiscountNote: string;
  chips: { noCommit: string; cancelAnytime: string; noHidden: string };
  segmentTitle: string;
  segments: {
    individual: { title: string; desc: string };
    investor: { title: string; desc: string };
    realtor: { title: string; desc: string };
    corporate: { title: string; desc: string };
  };
  toggle: { monthly: string; yearly: string };
  tierCard: {
    free: string;
    early: string;
    feeNote: string;
    monthlyEqv: string;
    dailyPrefix: string;
    showAll: string;
    hideDetails: string;
    ctaFree: string;
    ctaSelect: string;
    cancelNote: string;
    corporateNote: string;
  };
  yearlySavings: string;
  trustHeader: string;
  refundTitle: string;
  refund: { d14: string; cancel: string; upgrade: string; delete: string };
  faqTitle: string;
  faq: {
    paymentQ: string; paymentA: string;
    commissionQ: string; commissionA: string;
    priceQ: string; priceA: string;
    kvkkQ: string; kvkkA: string;
  };
  legalTitle: string;
  legal: {
    distanceSale: { title: string; desc: string };
    kvkk: { title: string; desc: string };
    payment: { title: string; desc: string };
  };
  trustBadges: { refund: string; cancel: string; compliant: string; noContract: string };
  corporateTitle: string;
  corporateDesc: string;
  corporateCta: string;
};

export type GesFormMessages = {
  stepLabel: string;             // "Adım"
  step1Title: string;            // "Konum ve arazi"
  city: string;
  district: string;
  neighborhood: string;
  adaParcel: string;
  adaPlaceholder: string;
  parcelPlaceholder: string;
  totalAreaM2: string;           // "Toplam alan (m²)"
  solarIrradiance: string;       // "Güneşlenme (kWh/m²)"
  continueBtn: string;
  step2Title: string;            // "Şebeke ve mevzuat"
  preScore: string;              // "Ön skor"
  trafoDistance: string;
  trafoCapacity: string;
  slopeDegree: string;
  slopeAspect: string;
  agriculturalClass: string;
  chkMarginal: string;
  chkCadastralRoad: string;
  chkSitConflict: string;
  chkMilitaryZone: string;
  chkArchaeological: string;
  backBtn: string;
  computingBtn: string;
  completeBtn: string;
  retryBtn: string;
  errSubmit: string;
  // Step 3 sonuç
  scoreLabel: string;
  capacityLabel: string;
  annualLabel: string;
  capexLabel: string;
  paybackLabel: string;
  paybackYearSuffix: string;
  paybackDefaultPriceNote: string;
  newEvaluation: string;
  // Status
  statusHigh: string;
  statusReject: string;
  statusSubmitted: string;
  statusEngineering: string;
  statusGathering: string;
};

export type ProfileMessages = {
  // No-user
  guestTitle: string;
  guestDesc: string;
  guestLogin: string;
  // Genel
  back: string;
  logout: string;
  profileUpdated: string;
  // Sticky kart
  ratingSuffix: string;       // "puan"
  noRating: string;           // "Henüz puan yok"
  reviewSuffix: string;       // "yorum"
  memberSince: string;        // "Üyelik"
  auctionsCreated: string;    // "Açılan İhale"
  auctionsWon: string;        // "Kazanılan"
  kycStart: string;           // "KYC başlat"
  // Profil bilgileri kart
  profileInfoTitle: string;
  edit: string;
  cancel: string;
  fullName: string;
  emailLabel: string;
  phoneLabel: string;
  phoneNotSet: string;
  phoneNote: string;
  saveChanges: string;
  // Güvenlik kart
  securityTitle: string;
  emailVerification: string;
  phoneVerification: string;
  twoFactor: string;
  kycVerification: string;
  statusVerified: string;
  statusPending: string;
  statusSoon: string;
  // Hesabım özeti
  accountSummaryTitle: string;
  summaryFavorites: string;
  summarySavedSearch: string;
  summaryActiveOffers: string;
  summaryGoToPanel: string;
  // Bildirim tercihleri
  notifyTitle: string;
  notifyDesc: string;
  notifyEmail: string;
  notifyEmailDesc: string;
  notifyPush: string;
  notifyPushDesc: string;
  notifyMatches: string;
  notifyMatchesDesc: string;
  notifyBids: string;
  notifyBidsDesc: string;
};

export type InvestorDashboardMessages = {
  badge: string;
  title: string;
  subtitle: string;
  back: string;
  marketAnalysis: string;
  loading: string;
  emptyTitle: string;
  emptyDesc: string;
  emptyCta: string;
  kpiPortfolioValue: string;
  kpiListingsHint: string;        // "{n} ilan" → suffix " ilan"
  kpiPredictedValue: string;
  kpiAvgYield: string;
  kpiAvgYieldHint: string;        // "Yıllık kira"
  kpiPotential: string;
  kpiPotentialHint: string;       // "Tahmini fark"
  chartGrowthTitle: string;
  chartGrowthSubtitle: string;    // "Son 6 ay (tahmini)"
  chartCategoryTitle: string;
  chartCategorySubtitle: string;  // "Milyon ₺"
  chartYieldTitle: string;
  chartYieldSubtitle: string;     // "İlçe bazlı"
  barRentPct: string;             // "Kira %"
  barAiScore: string;             // "AI skor"
  portfolioListings: string;
  cardCurrent: string;
  cardPredicted: string;
  cardYield: string;
  months: string[];               // 6 ay kısaltması
};

export type DashboardMessages = {
  back: string;
  title: string;
  subtitle: string;
  changeFlows: string;
  cardListingsTitle: string;
  cardListingsBody: string;
  cardListingsCta: string;
  cardAuctionTitle: string;
  cardAuctionBody: string;
  cardAuctionCta: string;
  cardBidsTitle: string;
  cardBidsBody: string;
  cardBidsCta: string;
  cardFavoritesTitle: string;
  cardFavoritesCta: string;
  cardSavedSearchTitle: string;
  cardSavedSearchCta: string;
  cardAuthorityTitle: string;
  cardAuthorityCta: string;
  cardProfileTitle: string;
  cardProfileCta: string;
  investorPortfolioNote: string;
  investorPortfolioCta: string;
};

export type DataAnalysisMessages = {
  eyebrow: string;
  title: string;
  subtitle: string;
  bannerWarning: string;
  avgPriceHistory: string;          // "Ortalama Fiyat Geçmişi (₺)"
  regionAvg: string;                // line name: "Bölge ort. fiyat (₺)"
  segmentAvg: string;
  platformAvg: string;
  captionSelected: string;          // "Seçili bölge: X · seçili segment: Y"
  assetVsPlatform: string;          // H2 "Varlık vs Platform Ortalaması (₺)"
  assetPriceSuffix: string;         // "{code} fiyat (₺)" → suffix: "fiyat (₺)"
  comparisonSelection: string;      // "Karşılaştırma seçimi"
  segmentTrendAnalysis: string;
  volumeLabel: string;              // "Hacim:"
  volumeUnit: string;               // "lot"
  depthScore: string;
  marketShare: string;
  regionHeatmap: string;
  downloadReport: string;
  avgPriceShort: string;            // heatmap card: "Ort. fiyat"
  demoReportFootnote: string;
  // Segment kategori isimleri (opsiyonel — dropdown option label)
  segmentResidential: string;       // Konut
  segmentLand: string;              // Arsa
  segmentCommercial: string;        // Ticari
  segmentTourism: string;           // Turizm
};

export type ValuationFormMessages = {
  headerSubtitle: string;
  explainableModel: string;
  cityLabel: string;
  districtLabel: string;
  districtNoData: string;
  grossM2Label: string;
  roomCountLabel: string;
  floorLabel: string;
  totalFloorsLabel: string;
  buildingAgeLabel: string;
  heatingLabel: string;
  heatingDistrict: string;
  heatingCentral: string;
  heatingCombi: string;
  heatingUnderfloor: string;
  heatingStove: string;
  locationTierLabel: string;
  tierPrime: string;
  tierStrong: string;
  tierBalanced: string;
  tierEmerging: string;
  conditionLabel: string;
  conditionNew: string;
  conditionGood: string;
  conditionNeedsRenovation: string;
  transactionTypeLabel: string;
  txSale: string;
  txRent: string;
  hasElevator: string;
  hasParking: string;
  errorTotalFloorsMin: string;
  errorFloorNegative: string;
  finalReviewBanner: string;
  startValuationCta: string;
};

export type MortgageMessages = {
  title: string;
  subtitle: string;
  loanParameters: string;
  propertyValueLabel: string;
  downPaymentPercent: string;
  downPaymentValue: string;
  loanValue: string;
  termSelect: string;          // "Vade" - veya lv.termLabel ile aynı
  yearShort: string;           // "Yıl" (12 Yıl select option içinde — ama option'a hardcoded yıl/ay korunabilir)
  monthShort: string;          // "Ay"
  annualRate: string;          // "Faiz Oranı (Yıllık)"
  bankRequirements: string;
  minMonthlyIncome: string;
  minLabel: string;            // "Min %20" — "Min"
  maxLabel: string;            // "Max %80" — "Max"
  loanToValueRatio: string;
  loanSummary: string;
  subEvenPay: string;          // "Düzgün ödeme"
  subOfCost: string;           // "maliyet"
  paymentPlanGraphTitle: string;
  monthSuffix: string;         // "ay" (tickFormatter)
  remainingDebt: string;
  totalInterestLegend: string;
  yearlyPaymentSummary: string;
  everyYearEnd: string;
  yearColumn: string;
  principalColumn: string;
  interestColumn: string;
  remainingColumn: string;
  yearRowPrefix: string;       // "{n}. Yıl" — sadece " Yıl" suffix
  tipLowInterestTitle: string;
  tipLowInterestDesc: string;
  tipDownPaymentTitle: string;
  tipDownPaymentDesc: string;
  disclaimer: string;
};

export type LoanValuationMessages = {
  // Geri butonu (paylaşılan)
  back: string;
  // Konut Kredisi Hesaplayıcı + Mortgage sayfası
  loanTitle: string;
  loanSubtitle: string;
  loanAmount: string;
  monthlyRate: string;
  termLabel: string;          // "Vade: {n} ay ({y} yıl)" — format ile birleştirilecek
  yearLabel: string;          // "yıl" preset chip
  monthlyInstallment: string;
  totalRepayment: string;
  totalInterest: string;
  loanAmountField: string;    // "Kredi Tutarı" (Mortgage sayfası)
  downPayment: string;
  propertyValue: string;
  loanDisclaimerEqual: string;
  loanDisclaimerInfo: string;
  // ListingMortgageWidget
  widgetTitle: string;
  widgetEstimate: string;     // "{financingPct}% finansman, {months} ay, {rate}% aylık faiz tahmini:"
  widgetCalculate: string;
  widgetBankNote: string;
  // ValuationWorkbench
  valuationTitle: string;
  estimatedValueApprox: string;
  confidenceRange: string;
  uncertaintyBand: string;
  modelScore: string;
  modelScoreHigh: string;
  modelScoreMedium: string;
  shapTitle: string;
  shapImpact: string;
  layerSummary: string;
  startValuation: string;
  resetForm: string;
  // Genel dürüstlük
  disclaimerInfo: string;       // "Bilgilendirme amaçlıdır"
  disclaimerNotOffer: string;   // "Kesin teklif değildir"
  disclaimerApprox: string;     // "Yaklaşık değer"
};

export type TierDataMessages = {
  byId: {
    free: { name: string; tagline: string };
    yatirimci: { name: string; tagline: string };
    emlak_baslangic: { name: string; tagline: string };
    emlak_pro: { name: string; tagline: string };
    kurumsal: { name: string; tagline: string };
  };
};

export type MegaMenuMessages = {
  // Segment başlıkları
  segmentInvestor: string;
  segmentRealtor: string;
  segmentContractor: string;
  // Yatırımcı items
  liveAuctions: string;
  aiValuation: string;
  investorPanel: string;
  rewards: string;
  campaigns: string;
  intlInvestor: string;
  // Emlakçı items
  realtorShowcase: string;
  officePanel: string;
  realtorLogin: string;
  b2bPartnership: string;
  // Müteahhit items
  contractorLaunch: string;
  projectPanel: string;
  openAuction: string;
  floorBarter: string;
};

export type FooterMessages = {
  tagline: string;
  taglineShort: string;
  workingHours: string;
  // Column headers
  colPlatform: string;
  colTools: string;
  colCorporateLegal: string;
  colNewsletter: string;
  // Newsletter
  newsletterDesc: string;
  newsletterPlaceholder: string;
  newsletterSubmit: string;
  // Copyright
  allRightsReserved: string;
  langLabel: string;
  // Platform links
  auctionsLink: string;
  aiAnalysis: string;
  compare: string;
  revenueModel: string;
  mortgage: string;
  favorites: string;
  realtorLoginFooter: string;
  realtorPartnership: string;
  researchTerminal: string;
  // Tools links
  priceEstimate: string;
  loanCalculator: string;
  listingCompare: string;
  cityGuide: string;
  howItWorksFooter: string;
  platformGuide: string;
  commissionCalc: string;
  taxSimulator: string;
  financeCompliance: string;
  // Legal links (most visible)
  legalHub: string;
  auctionTermsCommission: string;
  participationDocs: string;
  kvkkInfo: string;
  termsOfUse: string;
  privacyPolicy: string;
  cookiePolicy: string;
  distanceSaleAgreement: string;
  refundCancellation: string;
  disclosure: string;
  contactFooter: string;
  aboutUs: string;
  sitemap: string;
  faqFooter: string;
  securityCenter: string;
  sellerMode: string;
  commissionModel: string;
  ihalealIndex: string;
};

export type BorsaMessages = {
  // BorsaPage (ticker + piyasa özeti + emir defteri)
  marketTicker: string;
  marketSummary: string;
  totalVolume: string;
  tradeCount: string;
  activeOrders: string;
  openClose: string;
  marketBreadth: string;
  bidStream: string;
  orderBookPreviewMasked: string;
  marketDataSummary: string;
  bidder: string;
  // Portfolio
  portfolioEyebrow: string;
  portfolioTitle: string;
  portfolioDesc: string;
  totalPurchase: string;
  currentValue: string;
  pnlLabel: string;
  portfolioTrend: string;
  distributionSegment: string;
  distributionRegion: string;
  tooltipValue: string;
  periodPrefix: string;
  auditableLog: string;
  encrypted: string;
  howSecure: string;
  verified: string;
  // Watchlist
  watchlistEyebrow: string;
  watchlistTitle: string;
  watchAdd: string;
  watchRemove: string;
  watchAddedToast: string;
  watchRemovedToast: string;
  // AssetDetail
  high24: string;
  low24: string;
  volumeLabel: string;
  orderBook: string;
  bidColumn: string;
  askColumn: string;
  priceColumn: string;
  maLabel: string;
};

export type ListingDetailMessages = {
  // Top bar
  back: string;
  favoriteAdd: string;
  favoriteRemove: string;
  compareLabel: string;
  printLabel: string;
  openMap: string;
  pdfReport: string;
  // Mode badges
  badgeRent: string;
  badgeSale: string;
  badgeAuction: string;
  badgeSealed: string;
  // Price labels
  priceCurrentBid: string;
  priceListing: string;
  priceStartingBid: string;
  // Sticky özet kart (ADIM 5)
  estimatedValueTitle: string;
  estimatedAbove: string;
  estimatedBelow: string;
  verifiedListing: string;
  feeNote: string;
  // CTA
  ctaBid: string;
  ctaSealedBid: string;
  ctaSealedBidShort: string;
  ctaNegotiate: string;
  ctaInfoRequest: string;
  ctaBuyNow: string;
  ctaBidSubmitting: string;
  ctaBidSubmit: string;
  ctaSealedSubmit: string;
  mobileBidShort: string;
  // Tabs
  tabFeatures: string;
  tabLocation: string;
  // Status / Disabled
  auctionEnded: string;
  loginRequired: string;
  reportApproval: string;
  depositRequired: string;
  cantBidOwn: string;
  // Misc
  activeListing: string;
  featuresListMissing: string;
  bidLoginRequired: string;
  bidAcceptRequired: string;
  // ── 11-G: states (loading / not found) ──
  loading: string;
  notFoundTitle: string;
  notFoundDesc: string;
  notFoundBackAuctions: string;
  notFoundSearch: string;
  // ── 11-G: breadcrumbs ──
  bcHome: string;
  bcListings: string;
  bcListingFallback: string;
  cityAreaListingsSuffix: string;
  // ── 11-G: gallery badges ──
  badgeLive: string;
  badgeUpcoming: string;
  badgeLansman: string;
  // ── 11-G: hero meta ──
  viewCountSuffix: string;
  lansmanUnitBadge: string;
  lansmanCardTitle: string;
  lansmanDeveloperLabel: string;
  lansmanProjectFallback: string;
  lansmanUnitPrefix: string;
  lansmanProjectPage: string;
  weeklyScheduleTitle: string;
  participationDocsLabel: string;
  participationDocsNote: string;
  // ── 11-G: price cards ──
  priceCardAiPredicted: string;
  priceCardInvestmentScore: string;
  // ── 11-G: doc buttons ──
  marketReportBtn: string;
  officialDocsBtn: string;
  // ── 11-G: AI buy recommendation ──
  aiRecoTitle: string;
  aiRecoStrongBuy: string;
  aiRecoBuy: string;
  aiRecoHold: string;
  aiRecoAvoid: string;
  // ── 11-G: tabs (extra) ──
  tabOverview: string;
  tabDetails: string;
  tabPriceHistory: string;
  tabAi: string;
  tabMandatory: string;
  // ── 11-G: countdown (CountdownTimer) ──
  countdownEnded: string;
  countdownUpcomingLabel: string;
  countdownLastHour: string;
  countdownRemaining: string;
  countdownDays: string;
  countdownHours: string;
  countdownMinutes: string;
  countdownSeconds: string;
  // ── 11-G: sidebar price/value ──
  estValueBelowText: string;
  estValueAboveText: string;
  // ── 11-G: sidebar CTA buttons ──
  depositDemo: string;
  evaluateSeller: string;
  supportEmail: string;
  expertOpinion: string;
  expertOpinionDesc: string;
  // ── 11-G: commission calculator ──
  commissionTitle: string;
  commissionRefListing: string;
  commissionRefAuction: string;
  commissionPlatformBuyer: string;
  commissionVat: string;
  commissionDeedDuty: string;
  commissionRevolvingCapital: string;
  commissionTotal: string;
  commissionDetailLink: string;
  // ── 11-G: security verification card ──
  securityTitle: string;
  secIdentity: string;
  secFindeks: string;
  sec2fa: string;
  secBankApi: string;
  secAmlKyc: string;
  secLawNote: string;
  // ── 11-G-2: overview tab ──
  ovProfRules: string;
  ovCommitmentTitle: string;
  ovCommitmentFloor: string;
  ovCommitmentCeiling: string;
  ovCommitmentNote: string;
  ovCommitmentPending: string;
  ovExpertiseTitle: string;
  ovExpertiseRequiredNote: string;
  ovExpertiseFileLabel: string;
  ovExpertiseFileNote: string;
  ovDescriptionTitle: string;
  ovDetailRoom: string;
  ovDetailNetSqm: string;
  ovDetailFloor: string;
  ovDetailBuildingAge: string;
  ovVirtualTourTitle: string;
  ovVirtualTourDesc: string;
  ovVirtualTourStart: string;
  // ── 11-G-2: details tab ──
  detRoomLiving: string;
  detGrossSqm: string;
  detNetSqm: string;
  detCurrentFloor: string;
  detTotalFloors: string;
  detBuildingAge: string;
  detBuildingAgeUnit: string;
  detHeating: string;
  detFacade: string;
  detBathroom: string;
  detBalcony: string;
  detElevator: string;
  detParking: string;
  detFurnished: string;
  detUsage: string;
  detDeedStatus: string;
  detEligibility: string;
  // ── 11-G-2: location tab ──
  locNearby: string;
  locDistanceSuffix: string;
  locMapLoading: string;
  locMapFallbackNote: string;
  // ── 11-G-2: AI tab ──
  aiGateNote: string;
  aiRadarScore: string;
  aiCommentTitle: string;
  aiCommentUnder: string;
  aiCommentFair: string;
  aiBadgeRentalYield: string;
  aiBadgeDemandIndex: string;
  aiBadgeYearlyGrowth: string;
  aiRegionStatsTitle: string;
  statAvgSqmPrice: string;
  statMonthlyChange: string;
  statYearlyChange: string;
  statAvgDaysOnMarket: string;
  statDaysUnit: string;
  // ── 11-G-2: AI suggestion panel (sidebar) ──
  aiSuggestTitle: string;
  aiSuggestThinking: string;
  aiSuggestRetry: string;
  aiSuggestGet: string;
  aiSuggestError: string;
  aiSuggestPlaceholder: string;
  // ── 11-G-2: expertise panel (sidebar) ──
  expPanelTitle: string;
  expPanelPreparing: string;
  expPanelDownload: string;
  expPanelDesc: string;
  // ── 11-G-3: bid dialog (teklif modal) ──
  cancel: string;
  bidCostTitle: string;
  bidCostNote: string;
  bidAmountLabel: string;
  bidAmountPlaceholder: string;
  proxyTitle: string;
  proxyDesc: string;
  proxyEnableAria: string;
  proxyMaxLabel: string;
  proxyMaxPlaceholderPrefix: string;
  proxyDemoNote: string;
  bidGateTitle: string;
  bidGateTooltip: string;
  // ── 11-G-3: bid flow toasts ──
  toastAuctionEnded: string;
  toastInvalidBid: string;
  toastMinBid: string;
  toastBidGate: string;
  toastDuplicate: string;
  toastBidSaved: string;
  toastDemoBid: string;
  toastOfferSubmitted: string;
  toastLogin: string;
};

export type PaymentMessages = {
  start: {
    back: string;
    title: string;
    demoSubtitle: string;
    sandboxBannerTitle: string;
    sandboxBannerBody: string;
    prodBannerTitle: string;
    prodBannerBody: string;
    errors: {
      alreadySubscribed: string;
      unauthorized: string;
      generic: string;
    };
    cardSectionTitle: string;
    cardName: string;
    cardNumber: string;
    cardExpiry: string;
    cardCvc: string;
    cardNamePlaceholder: string;
    cardNumberPlaceholder: string;
    cardExpiryPlaceholder: string;
    cardCvcPlaceholder: string;
    acceptKvkk: string;
    payBtn: string;
    paying: string;
    pciNote: string;
    summarySelected: string;
    summaryPeriod: string;
    summaryListingLimit: string;
    summaryTeam: string;
    summaryTotal: string;
    summaryFxRef: string;
    feeNote: string;
    guaranteesTitle: string;
    guarantees: { d14: string; cancel: string; kvkk: string; ssl: string };
    autoRenewalTitle: string;
    autoRenewal: { renewal: string; cancel: string; refund: string };
    autoRenewalLaw: string;
    corporateTitle: string;
    corporateDesc: string;
    cycleMonthly: string;
    cycleYearly: string;
    footerDemo: string;
  };
  success: {
    title: string;
    activated: string;
    activeBadge: string;
    listingLimit: string;
    teamSeats: string;
    refundLabel: string;
    refundValue: string;
    unlimited: string;
    sandboxTitle: string;
    sandboxBody: string;
    feeNote: string;
    manageMembership: string;
    openExchange: string;
    invoiceSent: string;
    questions: string;
  };
};

export type Messages = {
  nav: NavMessages;
  home: HomeMessages;
  common: CommonMessages;
  onboarding: OnboardingMessages;
  pricing: PricingMessages;
  payment: PaymentMessages;
  listingDetail: ListingDetailMessages;
  borsa: BorsaMessages;
  megaMenu: MegaMenuMessages;
  footer: FooterMessages;
  tierData: TierDataMessages;
  loanValuation: LoanValuationMessages;
  mortgage: MortgageMessages;
  valuationForm: ValuationFormMessages;
  dataAnalysis: DataAnalysisMessages;
  gesForm: GesFormMessages;
  dashboard: DashboardMessages;
  investorDashboard: InvestorDashboardMessages;
  profile: ProfileMessages;
};

/**
 * Tam çeviri tabanı: en + tr (mevcut). RU/AR FAZ 0'da `getMessagesFor()` ile
 * runtime TR fallback üzerine override edilir. Type cast'i `"en" | "tr"`
 * yaptık çünkü ru/ar henüz tam Messages değil — lazy merge'le üretilir.
 */
export const messages: Record<"en" | "tr", Messages> = {
  en: {
    nav: {
      auctions: "Auctions",
      howItWorks: "How It Works",
      services: "Services",
      resources: "Resources",
      company: "Company",
      gesLand: "GES Land",
      valuation: "Valuation",
      researchHub: "Research Hub",
      corporate: "Corporate",
      faq: "FAQ",
      search: "Search auctions, properties…",
      logIn: "Log In",
      signUp: "Sign Up",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      langEn: "English",
      langTr: "Türkçe",
      langRu: "Russian",
      langAr: "Arabic",
      borsaCta: "Go to Exchange",
    },
    home: {
      hero: {
        badge: "Secure. Transparent. Intelligent.",
        titleLead: "The Future of",
        titleAccent: "Real Estate Auctions",
        subtitle:
          "AI-powered platform for secure, transparent and efficient real estate auctions worldwide.",
        ctaExplore: "Explore Auctions",
        ctaHow: "How It Works",
      },
      live: {
        title: "Live Auctions",
        live: "Live",
        growth: "+18% from last month",
        view: "View Live",
      },
      trust: [
        { title: "Bank-Level Security", sub: "256-bit SSL encryption" },
        { title: "10,000+", sub: "Active Investors" },
        { title: "4.9/5", sub: "Customer Rating" },
        { title: "24/7 Support", sub: "Always here to help" },
      ],
      stats: [
        { label: "Total Auctions", vs: "vs last month" },
        { label: "Successful Sales", vs: "vs last month" },
        { label: "Active Investors", vs: "vs last month" },
        { label: "Satisfaction Rate", vs: "vs last month" },
      ],
      how: {
        title: "How It Works?",
        subtitle: "Four simple steps to participate in real estate auctions",
        steps: [
          { title: "Discover", desc: "Browse verified properties and detailed analytics." },
          { title: "Register & Verify", desc: "Complete your KYC and verification process." },
          { title: "Place Your Bid", desc: "Participate in live auctions with real-time updates." },
          { title: "Win & Complete", desc: "Win the auction and complete securely." },
        ],
        sidebarTitle: "Why Investors Trust iHaleal",
        sidebar: [
          { title: "Bank-Level Security", sub: "256-bit SSL & data protection" },
          { title: "AI-Powered Analytics", sub: "AI insights for smarter decisions" },
          { title: "Transparent Process", sub: "100% transparent bidding" },
          { title: "Global Access", sub: "Worldwide property auctions" },
          { title: "24/7 Support", sub: "Always here when you need us" },
        ],
        certs: [
          { title: "ISO 27001", sub: "Certified" },
          { title: "SOC 2", sub: "Type II Compliant" },
          { title: "GDPR", sub: "Compliant", flag: "EU" },
        ],
      },
      auctions: {
        title: "Live Auctions",
        viewAll: "View All Auctions",
        currentBid: "Current Bid",
        live: "LIVE",
        items: [
          {
            title: "Luxury Villa in Dubai Hills",
            location: "Dubai, UAE",
            price: "$2,450,000",
            change: "+12.5%",
            time: "15h 24m left",
            bids: "32 bids",
          },
          {
            title: "Modern Office Building",
            location: "London, UK",
            price: "$1,850,000",
            change: "+8.2%",
            time: "1d 5h left",
            bids: "28 bids",
          },
          {
            title: "Premium Apartment",
            location: "Istanbul, Turkey",
            price: "$950,000",
            change: "+15.7%",
            time: "2h 15m left",
            bids: "18 bids",
          },
          {
            title: "Commercial Complex",
            location: "New York, USA",
            price: "$4,250,000",
            change: "+10.3%",
            time: "3d 12h left",
            bids: "45 bids",
          },
        ],
      },
      trusted: {
        title: "Trusted by leading institutions worldwide",
        certs: [
          { title: "ISO 27001", sub: "Certified" },
          { title: "SOC 2", sub: "Type II Compliant" },
          { title: "GDPR", sub: "Compliant" },
        ],
      },
      investor: {
        heading: "Investor Panel",
      },
      terminal: {
        eyebrow: "iHaleal Terminal",
        prompt: "How can we help you?",
        askPlaceholder: "Ask anything…",
        askSubmit: "Ask",
        options: {
          rent: "FOR RENT",
          sale: "FOR SALE",
          auction: "AUCTION",
          launch: "LAUNCH",
        },
        borsaCta: "Go to exchange terminal →",
        aiUnavailable:
          "AI assistant is temporarily unavailable (quota or configuration pending). Try the quick links below.",
        hints: [
          "How to bid on auctions? → /how-it-works",
          "Live auctions → /auctions",
          "Exchange terminal → /borsa",
        ],
      },
    },
    common: {
      loading: "Loading…",
      loadingListings: "Loading listings…",
      errorLoad: "Could not load remote data; showing local demo records.",
      retry: "Try again",
      emptySearch: "Enter a search",
      emptyResults: "No results found",
      notFoundListing: "Listing not found",
    },
    onboarding: {
      title: "Welcome!",
      subtitle: "Where would you like to start?",
      back: "Back",
      skip: "Skip for now →",
      skipNote: "You can change this anytime.",
      discover: {
        title: "Explore",
        subtitle: "Browse auctions, listings, and market data.",
        cta: "View auctions",
      },
      sell: {
        title: "Sell / List",
        subtitle: "List your property for auction or sale.",
        cta: "Create listing",
      },
      buy: {
        title: "Buy / Bid",
        subtitle: "Join live auctions, catch the opportunities.",
        cta: "Active auctions",
      },
    },
    pricing: {
      badge: "Pricing",
      title: "Choose the plan that fits you",
      subtitle: "5 tiers from individual to enterprise — upgrade, downgrade or cancel anytime.",
      yearlyDiscountNote: "Save on annual billing",
      chips: { noCommit: "No commitment", cancelAnytime: "Cancel anytime", noHidden: "No hidden fees" },
      segmentTitle: "Which plan suits you?",
      segments: {
        individual: { title: "Individual buyer/seller", desc: "Selling your home, putting it up for auction or bidding for one. The individual plan is enough." },
        investor: { title: "Investor", desc: "For regular investment decisions — exchange terminal + unlimited reports + real closing data + AI opportunity alerts." },
        realtor: { title: "Realtor / Office", desc: "New office → Starter, growing professional office → Pro. Boost + priority + team management." },
        corporate: { title: "Enterprise", desc: "Chain offices, portfolio funds, contractors → API + mini-site + white-label PDF + 10 seats + priority support." },
      },
      toggle: { monthly: "Monthly", yearly: "Yearly" },
      tierCard: {
        free: "Free",
        early: "Founding",
        feeNote: "(charged in ₺)",
        monthlyEqv: "/mo (yearly −20%)",
        dailyPrefix: "≈ per day",
        showAll: "View all features",
        hideDetails: "Hide details",
        ctaFree: "Start Free",
        ctaSelect: "Select plan",
        cancelNote: "Cancel anytime — no contract",
        corporateNote: "Contact us for a demo and custom quote",
      },
      yearlySavings: "Total savings on yearly billing",
      trustHeader: "Trust, Refunds and FAQ",
      refundTitle: "Refund Policy",
      refund: {
        d14: "14-day free refund: full refund within the first 14 days of new subscriptions (Turkish CPL art. 16 — distance sale).",
        cancel: "Cancel anytime: no contract, finish the active period, disable auto-renewal.",
        upgrade: "Upgrade/Downgrade: tier changes effective immediately; difference is prorated.",
        delete: "Account deletion: data anonymized within 30 days under KVKK (invoices kept for legal 10 years).",
      },
      faqTitle: "Frequently Asked Questions",
      faq: {
        paymentQ: "How is payment processed?",
        paymentA: "iyzico / PayTR (upcoming). Credit card + wire transfer. 3D Secure required.",
        commissionQ: "How does commission work?",
        commissionA: "2% buyer + 2% seller = 4% total (VAT excluded base). VAT 20% applied on commission. Legal cap: Real Estate Trade Regulation art. 20.",
        priceQ: "Will prices change?",
        priceA: "During the market test — these prices for now. Existing subscribers' prices locked for 12 months.",
        kvkkQ: "KVKK compliance?",
        kvkkA: "Fully compliant — Supabase EU Frankfurt, breach notification within 72 hours, data erasure in 30 days.",
      },
      legalTitle: "Legal Framework",
      legal: {
        distanceSale: { title: "Distance Sale", desc: "Turkish CPL 6502 art. 48 — 14-day withdrawal with written notice." },
        kvkk: { title: "KVKK Compliance", desc: "Turkish PDPL 6698 — personal data retention, anonymization, breach notification 72h." },
        payment: { title: "Payment Service", desc: "Turkish Payment Services Law 6493 — escrow-compatible." },
      },
      trustBadges: { refund: "14-day free refund", cancel: "Cancel anytime", compliant: "KVKK + 6493 compliant", noContract: "No contract" },
      corporateTitle: "Enterprise quote or custom deal?",
      corporateDesc: "50+ users / API integration / mini-site / white-label PDF — contact us for a custom plan.",
      corporateCta: "Get in touch",
    },
    payment: {
      start: {
        back: "Back to plans",
        title: "Payment",
        demoSubtitle: "Demo / Mock — real payment integration coming (iyzico / PayTR).",
        sandboxBannerTitle: "Sandbox / Test Mode",
        sandboxBannerBody: "Payment is currently running on iyzico sandbox. When the form is submitted, the Supabase Edge function payments-iyzico is called and a subscription record is created — no real money is charged. For production, IYZICO_API_KEY and IYZICO_SECRET_KEY must be added to Supabase secrets.",
        prodBannerTitle: "Production — Real Payment Active",
        prodBannerBody: "iyzico Merchant integration is live. After submitting the form, you'll be redirected to 3D Secure. Card details NEVER reach iHaleal servers (PCI-DSS compliant).",
        errors: {
          alreadySubscribed: "There is already an active subscription on this account. Please cancel it first.",
          unauthorized: "You must be logged in.",
          generic: "Could not start payment",
        },
        cardSectionTitle: "Card Details",
        cardName: "Cardholder name",
        cardNumber: "Card number",
        cardExpiry: "Expiry (MM/YY)",
        cardCvc: "CVC",
        cardNamePlaceholder: "JOHN DOE",
        cardNumberPlaceholder: "0000 0000 0000 0000",
        cardExpiryPlaceholder: "12/28",
        cardCvcPlaceholder: "123",
        acceptKvkk: "I have read and accept the KVKK Privacy Notice. I accept the payment and subscription terms (Turkish CPL 14-day withdrawal + cancellation right).",
        payBtn: "Pay (demo)",
        paying: "Processing...",
        pciNote: "3D Secure + KVKK + Law 6493 compliant — card details are not stored, directly tokenized by the bank.",
        summarySelected: "Selected plan",
        summaryPeriod: "Billing period",
        summaryListingLimit: "Listing limit",
        summaryTeam: "Team",
        summaryTotal: "Total",
        summaryFxRef: "Reference",
        feeNote: "(charged in ₺)",
        guaranteesTitle: "Guarantees",
        guarantees: {
          d14: "14-day free refund (Turkish CPL)",
          cancel: "Cancel anytime",
          kvkk: "KVKK + Law 6493 compliant",
          ssl: "SSL + 3D Secure",
        },
        autoRenewalTitle: "Auto-Renewal and Cancellation",
        autoRenewal: {
          renewal: "Renewal: Subscription auto-renews at the end of each billing period. Email reminder sent 7 days before renewal.",
          cancel: "Cancellation: Cancel anytime. Web: My Membership → \"Cancel subscription\". iOS: Settings → Apple ID → Subscriptions. Android: Google Play → Profile → Subscriptions.",
          refund: "Refund: Full refund within first 14 days (Turkish CPL art. 48 withdrawal). Plan features remain active until end of paid period.",
        },
        autoRenewalLaw: "Regulation: Turkish CPL 6502 art. 48 + KVKK 6698 + Law 6493 + Apple/Google store terms (mobile).",
        corporateTitle: "Enterprise quote?",
        corporateDesc: "10+ team, API integration, mini-site — contact us for custom plan.",
        cycleMonthly: "Monthly",
        cycleYearly: "Yearly",
        footerDemo: "This page is a DEMO. Real payment integration (iyzico / PayTR) will be added once Master provides the merchant + API keys.",
      },
      success: {
        title: "Welcome!",
        activated: "Your plan has been activated.",
        activeBadge: "Active plan",
        listingLimit: "Listing limit",
        teamSeats: "Team seats",
        refundLabel: "Refund/Cancellation",
        refundValue: "14 days free",
        unlimited: "Unlimited",
        sandboxTitle: "Sandbox Payment Confirmation",
        sandboxBody: "This payment was completed via iyzico sandbox — no real money was charged (test environment). Your subscription was saved to the Supabase subscriptions table and premium features are now active. For production billing, iyzico merchant API keys must be added as secrets by Master.",
        feeNote: "(charged in ₺)",
        manageMembership: "Manage My Membership",
        openExchange: "Open Exchange Terminal",
        invoiceSent: "Your invoice was sent to support@ihaleal.com (mock).",
        questions: "Questions",
      },
    },
    listingDetail: {
      back: "Back",
      favoriteAdd: "Add to favorites",
      favoriteRemove: "Remove from favorites",
      compareLabel: "Compare",
      printLabel: "Print",
      openMap: "Open map",
      pdfReport: "iHaleal Index Report",
      badgeRent: "For Rent",
      badgeSale: "For Sale",
      badgeAuction: "Auction",
      badgeSealed: "Sealed bid",
      priceCurrentBid: "Current bid",
      priceListing: "Listing price",
      priceStartingBid: "Starting / asking",
      estimatedValueTitle: "Estimated value (AI · approximate)",
      estimatedAbove: "% above estimated value",
      estimatedBelow: "% below estimated value",
      verifiedListing: "Verified listing",
      feeNote: "(charged in ₺)",
      ctaBid: "Place bid",
      ctaSealedBid: "Place sealed bid",
      ctaSealedBidShort: "Sealed bid",
      ctaNegotiate: "Offer / negotiate",
      ctaInfoRequest: "Request info",
      ctaBuyNow: "Buy now",
      ctaBidSubmitting: "Submitting...",
      ctaBidSubmit: "Submit Bid",
      ctaSealedSubmit: "Submit sealed bid",
      mobileBidShort: "Bid",
      tabFeatures: "Features",
      tabLocation: "Location",
      auctionEnded: "Auction ended",
      loginRequired: "Login required",
      reportApproval: "Approve the AI report first",
      depositRequired: "Pre-authorization required",
      cantBidOwn: "You can't bid on your own listing",
      activeListing: "Active listing",
      featuresListMissing: "No feature list available.",
      bidLoginRequired: "Log in to place a bid.",
      bidAcceptRequired: "Check all contract and declaration boxes to submit your bid.",
      // ── 11-G ──
      loading: "Loading listing…",
      notFoundTitle: "Listing not found",
      notFoundDesc:
        "The listing you're looking for may have been removed, the link may be broken, or it may never have existed. You can browse open auctions or find a new listing from the search page.",
      notFoundBackAuctions: "Back to auctions",
      notFoundSearch: "Search page",
      bcHome: "Home",
      bcListings: "Listings",
      bcListingFallback: "Listing",
      cityAreaListingsSuffix: "area listings",
      badgeLive: "Live",
      badgeUpcoming: "Upcoming",
      badgeLansman: "🏗️ LAUNCH",
      viewCountSuffix: "views",
      lansmanUnitBadge: "🏗️ Launch unit",
      lansmanCardTitle: "This listing is a unit of a launch project",
      lansmanDeveloperLabel: "Developer project:",
      lansmanProjectFallback: "Launch project",
      lansmanUnitPrefix: "Unit",
      lansmanProjectPage: "Project page",
      weeklyScheduleTitle: "Weekly auction calendar (target)",
      participationDocsLabel: "Participation documents and categories:",
      participationDocsNote:
        "(ID, Findeks, appraisal, title-deed summary, deposit, etc.; the contract and a lawyer have the final legal say).",
      priceCardAiPredicted: "AI Estimate",
      priceCardInvestmentScore: "Investment Score",
      marketReportBtn: "iHaleal Index — market report analysis",
      officialDocsBtn: "Official documents (zoning, municipality…)",
      aiRecoTitle: "AI Buy Recommendation",
      aiRecoStrongBuy: "Strong buying opportunity. Price is below the AI estimate.",
      aiRecoBuy: "Reasonable buying opportunity.",
      aiRecoHold: "Waiting makes more sense.",
      aiRecoAvoid: "Be careful, the price is high.",
      tabOverview: "Overview",
      tabDetails: "Details",
      tabPriceHistory: "Price History",
      tabAi: "AI Analysis",
      tabMandatory: "REQUIRED",
      countdownEnded: "Auction ended",
      countdownUpcomingLabel: "Time to start",
      countdownLastHour: "FINAL HOUR",
      countdownRemaining: "Time left",
      countdownDays: "Days",
      countdownHours: "Hours",
      countdownMinutes: "Minutes",
      countdownSeconds: "Seconds",
      estValueBelowText: "{pct}% below estimated value",
      estValueAboveText: "{pct}% above estimated value",
      depositDemo: "Pre-auth (demo)",
      evaluateSeller: "Rate the seller",
      supportEmail: "Support request (email)",
      expertOpinion: "Get an expert opinion",
      expertOpinionDesc: "Request a professional appraisal report",
      commissionTitle: "Commission Calculator",
      commissionRefListing: "Listing amount (reference)",
      commissionRefAuction: "Auction / bid amount (estimated)",
      commissionPlatformBuyer: "Platform (buyer)",
      commissionVat: "VAT (platform)",
      commissionDeedDuty: "Title deed duty",
      commissionRevolvingCapital: "Revolving fund",
      commissionTotal: "Total Cost",
      commissionDetailLink: "Review the commission structure in detail",
      securityTitle: "Security Verification",
      secIdentity: "Identity verification required",
      secFindeks: "Findeks credit score check",
      sec2fa: "Two-step verification via SMS",
      secBankApi: "Payment guarantee via bank API",
      secAmlKyc: "AML/KYC compliance",
      secLawNote: "ihaleal.com operates under Law No. 7263.",
      // ── 11-G-2 ──
      ovProfRules: "Professional rules (summary)",
      ovCommitmentTitle: "Commitment limit band (seller / lessor)",
      ovCommitmentFloor: "Floor:",
      ovCommitmentCeiling: "Ceiling:",
      ovCommitmentNote:
        "— once the upper limit is reached, the transaction obligation and commission base are set in the contract (target). Symmetric rules apply to buyer and tenant in the same package.",
      ovCommitmentPending: "Commitment approval recorded; limit values are finalized in production.",
      ovExpertiseTitle: "Appraisal report (annotation / mortgage / lien)",
      ovExpertiseRequiredNote: "This listing has an appraisal-requirement declaration. ",
      ovExpertiseFileLabel: "File (demo):",
      ovExpertiseFileNote:
        "The PDF is verified in production; AI pre-screening + human approval are targeted against forgery risk.",
      ovDescriptionTitle: "Description",
      ovDetailRoom: "Rooms",
      ovDetailNetSqm: "Net m²",
      ovDetailFloor: "Floor",
      ovDetailBuildingAge: "Building Age",
      ovVirtualTourTitle: "360° Virtual Tour",
      ovVirtualTourDesc: "You can tour this property virtually.",
      ovVirtualTourStart: "Start Virtual Tour",
      detRoomLiving: "Rooms + Living",
      detGrossSqm: "Gross m²",
      detNetSqm: "Net m²",
      detCurrentFloor: "Floor",
      detTotalFloors: "Total Floors",
      detBuildingAge: "Building Age",
      detBuildingAgeUnit: "yrs",
      detHeating: "Heating",
      detFacade: "Facade",
      detBathroom: "Bathroom",
      detBalcony: "Balcony",
      detElevator: "Elevator",
      detParking: "Parking",
      detFurnished: "Furnished",
      detUsage: "Occupancy Status",
      detDeedStatus: "Title Deed Status",
      detEligibility: "Eligibility",
      locNearby: "Nearby",
      locDistanceSuffix: "away",
      locMapLoading: "Loading map…",
      locMapFallbackNote: "No exact location; the map is shown centered on {city}.",
      aiGateNote: "To place a bid, first approve the report and then complete the pre-authorization hold.",
      aiRadarScore: "Score",
      aiCommentTitle: "AI Commentary",
      aiCommentUnder:
        "According to our AI valuation model, this property is priced {pct}% below its value. The average price per m² in the {location} area is ₺{avgSqm}, while this listing is at ₺{sqm} / m².",
      aiCommentFair:
        "According to our AI valuation model, this property is priced close to the market average. Demand index {demand}/100.",
      aiBadgeRentalYield: "Rental Yield",
      aiBadgeDemandIndex: "Demand Index",
      aiBadgeYearlyGrowth: "Yearly Growth",
      aiRegionStatsTitle: "Area Statistics",
      statAvgSqmPrice: "Avg. m² Price",
      statMonthlyChange: "Monthly Change",
      statYearlyChange: "Yearly Change",
      statAvgDaysOnMarket: "Avg. Time to Sell",
      statDaysUnit: "days",
      aiSuggestTitle: "AI Bid Suggestion",
      aiSuggestThinking: "Thinking…",
      aiSuggestRetry: "Ask again",
      aiSuggestGet: "Get suggestion",
      aiSuggestError: "AI suggestion is unavailable right now. Please try again in a few minutes.",
      aiSuggestPlaceholder:
        "With one click, the suggested bid range, its rationale and risk points are generated by AI for this property.",
      expPanelTitle: "Appraisal Report",
      expPanelPreparing: "Preparing…",
      expPanelDownload: "Download PDF",
      expPanelDesc:
        "Property description, price valuation, area analysis, features and nearby amenities — a professional PDF summary.",
      // ── 11-G-3 ──
      cancel: "Cancel",
      bidCostTitle: "Estimated Total Cost (Commission + Duties Included)",
      bidCostNote: "Buyer platform: fees.ts · title deed %{pct} + fixed cost (demo)",
      bidAmountLabel: "Bid amount (₺)",
      bidAmountPlaceholder: "e.g. 3000000 or 3.000.000",
      proxyTitle: "Automatic bid (proxy bid)",
      proxyDesc: "On your behalf, it automatically raises up to your maximum amount as others bid.",
      proxyEnableAria: "Enable automatic bid",
      proxyMaxLabel: "Maximum bid amount (₺)",
      proxyMaxPlaceholderPrefix: "e.g.",
      proxyDemoNote:
        "Demo: the max amount is stored locally (user preference). Automatic raising activates once the backend side (auction_proxy_bids table + RLS + sealed-masking compliance) is complete. For now, submission is processed as a normal one-click bid.",
      bidGateTitle: "Required approvals",
      bidGateTooltip: "Check all approval boxes",
      toastAuctionEnded: "This auction has ended.",
      toastInvalidBid: "Enter a valid bid amount (positive integer, within a reasonable upper limit).",
      toastMinBid: "Bid must be at least ₺{amount}.",
      toastBidGate: "First approve the AI report, then complete the deposit (pre-authorization) step.",
      toastDuplicate: "This bid is already recorded.",
      toastBidSaved: "Bid recorded: ₺{amount}",
      toastDemoBid:
        "Demo listing: the bid is not written to the database. On live auctions (Supabase UUID) the bid is stored on the server.",
      toastOfferSubmitted: "Your offer has been recorded. You can track it from the My Offers panel.",
      toastLogin: "Please log in.",
    },
    borsa: {
      marketTicker: "Market Ticker",
      marketSummary: "Market Summary",
      totalVolume: "Total volume",
      tradeCount: "Trade count",
      activeOrders: "Active orders",
      openClose: "Open/Close",
      marketBreadth: "Market Breadth",
      bidStream: "Bid Stream",
      orderBookPreviewMasked: "Order Book Preview (Masked)",
      marketDataSummary: "Market Data Summary",
      bidder: "Bidder",
      portfolioEyebrow: "Exchange Portfolio",
      portfolioTitle: "Portfolio Terminal",
      portfolioDesc: "Manage portfolio assets under the trust band: auction, fixed sale, lease, swap and assignment flows in one panel.",
      totalPurchase: "Total Purchase",
      currentValue: "Current Value",
      pnlLabel: "P/L (%)",
      portfolioTrend: "Portfolio Trend",
      distributionSegment: "Distribution · Segment",
      distributionRegion: "Distribution · Region",
      tooltipValue: "Value",
      periodPrefix: "Period",
      auditableLog: "Auditable transaction log",
      encrypted: "Encrypted",
      howSecure: "How is it secured?",
      verified: "Verified",
      watchlistEyebrow: "Watch Terminal",
      watchlistTitle: "Watchlist + Alert Center",
      watchAdd: "Watch",
      watchRemove: "Unwatch",
      watchAddedToast: "Added to watchlist.",
      watchRemovedToast: "Removed from watchlist.",
      high24: "24h High",
      low24: "24h Low",
      volumeLabel: "Volume",
      orderBook: "Order Book",
      bidColumn: "Bid",
      askColumn: "Ask",
      priceColumn: "Price",
      maLabel: "MA(5)",
    },
    megaMenu: {
      segmentInvestor: "Investor",
      segmentRealtor: "Realtor",
      segmentContractor: "Contractor",
      liveAuctions: "Live auctions",
      aiValuation: "AI valuation",
      investorPanel: "Investor panel",
      rewards: "Rewards",
      campaigns: "Campaigns",
      intlInvestor: "International investor",
      realtorShowcase: "Realtor showcase",
      officePanel: "Office panel",
      realtorLogin: "Realtor login",
      b2bPartnership: "B2B partnership",
      contractorLaunch: "Contractor launch",
      projectPanel: "Project panel",
      openAuction: "Open auction",
      floorBarter: "Floor barter",
    },
    footer: {
      tagline: "AI-powered valuation, transparent auction process and secure transaction infrastructure.",
      taglineShort: "AI-powered real estate platform",
      workingHours: "Weekdays 09:00 - 18:00 (UTC+3)",
      colPlatform: "Platform",
      colTools: "Tools",
      colCorporateLegal: "Corporate & Legal",
      colNewsletter: "Newsletter",
      newsletterDesc: "Be the first to know about new auctions.",
      newsletterPlaceholder: "Email",
      newsletterSubmit: "Subscribe",
      allRightsReserved: "All rights reserved.",
      langLabel: "Language",
      auctionsLink: "Auctions",
      aiAnalysis: "AI Analysis",
      compare: "Compare",
      revenueModel: "Revenue model",
      mortgage: "Mortgage",
      favorites: "Favorites",
      realtorLoginFooter: "Realtor login",
      realtorPartnership: "Realtor partnership",
      researchTerminal: "Research terminal",
      priceEstimate: "Price Estimate",
      loanCalculator: "Loan Calculator",
      listingCompare: "Listing Comparison",
      cityGuide: "City Guide",
      howItWorksFooter: "How it works",
      platformGuide: "Platform guide",
      commissionCalc: "Commission calculator",
      taxSimulator: "Tax simulator",
      financeCompliance: "Finance / compliance",
      legalHub: "Legal Hub (all)",
      auctionTermsCommission: "Auction Terms & Commission",
      participationDocs: "Participation Documents",
      kvkkInfo: "KVKK Privacy Notice",
      termsOfUse: "Terms of Use",
      privacyPolicy: "Privacy Policy",
      cookiePolicy: "Cookie Policy",
      distanceSaleAgreement: "Distance Sale Agreement",
      refundCancellation: "Refund and Cancellation",
      disclosure: "Disclosure Notice",
      contactFooter: "Contact",
      aboutUs: "About Us",
      sitemap: "Sitemap",
      faqFooter: "FAQ",
      securityCenter: "Security Center",
      sellerMode: "Seller mode",
      commissionModel: "Commission model",
      ihalealIndex: "iHaleal Index",
    },
    tierData: {
      byId: {
        free: { name: "Individual", tagline: "Auction tracking + 1 free listing" },
        yatirimci: { name: "Investor", tagline: "Full exchange terminal + unlimited reports" },
        emlak_baslangic: { name: "Realtor Starter", tagline: "New realtor / small office" },
        emlak_pro: { name: "Realtor Pro", tagline: "Professional realty office — growth" },
        kurumsal: { name: "Enterprise", tagline: "Chain offices + portfolio funds + contractors" },
      },
    },
    loanValuation: {
      back: "Back",
      loanTitle: "Mortgage Calculator",
      loanSubtitle: "Estimated installment and total repayment based on loan amount, term and monthly interest rate (informational).",
      loanAmount: "Loan amount (₺)",
      monthlyRate: "Monthly interest rate (%)",
      termLabel: "Term",
      yearLabel: "yr",
      monthlyInstallment: "Monthly installment",
      totalRepayment: "Total repayment",
      totalInterest: "Total interest",
      loanAmountField: "Loan Amount",
      downPayment: "Down payment",
      propertyValue: "Property value",
      loanDisclaimerEqual: "This calculation uses the equal-installment formula; file fees, insurance and bank campaigns are not included. Contact your bank for a binding offer.",
      loanDisclaimerInfo: "For informational purposes only.",
      widgetTitle: "Calculate a loan for this listing",
      widgetEstimate: "estimate:",
      widgetCalculate: "Calculate",
      widgetBankNote: "For information only; bank approval required.",
      valuationTitle: "Property Valuation",
      estimatedValueApprox: "Estimated value (approximate)",
      confidenceRange: "Confidence range",
      uncertaintyBand: "Uncertainty band",
      modelScore: "Model score",
      modelScoreHigh: "High",
      modelScoreMedium: "Medium",
      shapTitle: "SHAP contribution breakdown",
      shapImpact: "Impact",
      layerSummary: "Layer summary",
      startValuation: "Start valuation",
      resetForm: "Reset form",
      disclaimerInfo: "For informational purposes",
      disclaimerNotOffer: "Not a binding offer",
      disclaimerApprox: "Approximate",
    },
    mortgage: {
      title: "Mortgage / Loan Calculator",
      subtitle: "Calculate the monthly installment and total cost when buying property.",
      loanParameters: "Loan Parameters",
      propertyValueLabel: "Property Value",
      downPaymentPercent: "Down Payment Rate",
      downPaymentValue: "Down payment",
      loanValue: "Loan",
      termSelect: "Term",
      yearShort: "Year",
      monthShort: "Month",
      annualRate: "Annual Interest Rate",
      bankRequirements: "Bank Requirements",
      minMonthlyIncome: "Min. Monthly Income",
      minLabel: "Min",
      maxLabel: "Max",
      loanToValueRatio: "Loan-to-Value Ratio",
      loanSummary: "Loan Summary",
      subEvenPay: "Even payment",
      subOfCost: "of cost",
      paymentPlanGraphTitle: "Payment Plan — Remaining Debt Chart",
      monthSuffix: "mo",
      remainingDebt: "Remaining Debt",
      totalInterestLegend: "Total Interest",
      yearlyPaymentSummary: "Yearly Payment Summary",
      everyYearEnd: "End of each year",
      yearColumn: "Year",
      principalColumn: "Principal",
      interestColumn: "Interest",
      remainingColumn: "Remaining Debt",
      yearRowPrefix: " yr",
      tipLowInterestTitle: "Low Interest Tips",
      tipLowInterestDesc: "If you choose a shorter term, the total interest cost decreases. Compared to a 10-year term, a 5-year term saves approximately 40% in interest.",
      tipDownPaymentTitle: "Increase Down Payment",
      tipDownPaymentDesc: "Raising the down payment to 30% reduces the monthly installment by approximately 15% and decreases total interest cost by 25%.",
      disclaimer: "* This calculation is for informational purposes. Actual loan conditions may vary based on the bank and your credit score.",
    },
    valuationForm: {
      headerSubtitle: "Demo data / pre-analysis: hedonic + comparable + spatial adjustment work together.",
      explainableModel: "Explainable model",
      cityLabel: "City",
      districtLabel: "District",
      districtNoData: "No district data",
      grossM2Label: "Gross m²",
      roomCountLabel: "Room count",
      floorLabel: "Floor",
      totalFloorsLabel: "Total floors",
      buildingAgeLabel: "Building age",
      heatingLabel: "Heating",
      heatingDistrict: "District system",
      heatingCentral: "Central per apartment",
      heatingCombi: "Combi boiler",
      heatingUnderfloor: "Underfloor heating",
      heatingStove: "Stove",
      locationTierLabel: "Location quality",
      tierPrime: "Prime",
      tierStrong: "Strong",
      tierBalanced: "Balanced",
      tierEmerging: "Emerging",
      conditionLabel: "Physical condition",
      conditionNew: "New",
      conditionGood: "Good",
      conditionNeedsRenovation: "Needs renovation",
      transactionTypeLabel: "Transaction type",
      txSale: "Sale value",
      txRent: "Rental value",
      hasElevator: "Elevator",
      hasParking: "Parking",
      errorTotalFloorsMin: "Total floors must be at least 1.",
      errorFloorNegative: "Floor cannot be negative.",
      finalReviewBanner: "Pre-valuation complete. For an official valuation, SPK-licensed appraiser (TDUB) confirmation is required.",
      startValuationCta: "Start valuation",
    },
    dataAnalysis: {
      eyebrow: "Data / Analysis Terminal",
      title: "Market Overview + Average Price Panel",
      subtitle: "Track region/segment average price history, asset-vs-average comparison, and heatmap depth in one screen.",
      bannerWarning: "Values shown here are region/segment ₺ average prices (not official statistics; an indicator produced from platform demo data). For the actual iHaleal Index score, see the live index on the Exchange homepage.",
      avgPriceHistory: "Average Price History (₺)",
      regionAvg: "Region avg. price (₺)",
      segmentAvg: "Segment avg. price (₺)",
      platformAvg: "Platform avg. price (₺)",
      captionSelected: "Selected region",
      assetVsPlatform: "Asset vs Platform Average (₺)",
      assetPriceSuffix: "price (₺)",
      comparisonSelection: "Comparison selection",
      segmentTrendAnalysis: "Segment Trend Analysis",
      volumeLabel: "Volume",
      volumeUnit: "lot",
      depthScore: "Depth score",
      marketShare: "Market share",
      regionHeatmap: "Region Heatmap",
      downloadReport: "Download Report (Demo)",
      avgPriceShort: "Avg. price",
      demoReportFootnote: "The downloadable report is a demo; independent financial/legal advisor opinion is required for professional investment decisions.",
      segmentResidential: "Residential",
      segmentLand: "Land",
      segmentCommercial: "Commercial",
      segmentTourism: "Tourism",
    },
    gesForm: {
      stepLabel: "Step",
      step1Title: "Location and land",
      city: "City",
      district: "District",
      neighborhood: "Neighborhood",
      adaParcel: "Block / Parcel",
      adaPlaceholder: "Block",
      parcelPlaceholder: "Parcel",
      totalAreaM2: "Total area (m²)",
      solarIrradiance: "Solar irradiance (kWh/m²)",
      continueBtn: "Continue",
      step2Title: "Grid and regulations",
      preScore: "Pre-score",
      trafoDistance: "Substation distance (km)",
      trafoCapacity: "Substation capacity (MW)",
      slopeDegree: "Slope (degrees)",
      slopeAspect: "Aspect",
      agriculturalClass: "Agricultural class",
      chkMarginal: "Marginal agriculture / GEPA approval available",
      chkCadastralRoad: "Cadastral road exists",
      chkSitConflict: "Protected area (SIT) conflict",
      chkMilitaryZone: "Military restricted zone",
      chkArchaeological: "Archaeological site",
      backBtn: "Back",
      computingBtn: "Calculating...",
      completeBtn: "Complete evaluation",
      retryBtn: "Try again",
      errSubmit: "Evaluation could not be submitted.",
      scoreLabel: "Score",
      capacityLabel: "Capacity",
      annualLabel: "Annual",
      capexLabel: "CAPEX",
      paybackLabel: "Payback",
      paybackYearSuffix: "yr",
      paybackDefaultPriceNote: "(default price)",
      newEvaluation: "New evaluation",
      statusHigh: "High feasibility",
      statusReject: "Technical rejection",
      statusSubmitted: "Submitted to investors",
      statusEngineering: "Engineering calculation",
      statusGathering: "Data gathering",
    },
    dashboard: {
      back: "Home",
      title: "Account panel",
      subtitle: "Shortcuts based on your selected flows (demo; no backend).",
      changeFlows: "Change flows",
      cardListingsTitle: "My listings",
      cardListingsBody: "Plan prices are placeholders in `fees.ts` (§D-K8).",
      cardListingsCta: "Seller center",
      cardAuctionTitle: "Open auction",
      cardAuctionBody: "Flow B — authority and documents demo.",
      cardAuctionCta: "Create auction",
      cardBidsTitle: "My bids / deposit",
      cardBidsBody: "Findeks, AML, bid bond — production in K3.",
      cardBidsCta: "Document list",
      cardFavoritesTitle: "Favorites",
      cardFavoritesCta: "Favorite listings",
      cardSavedSearchTitle: "Saved searches",
      cardSavedSearchCta: "Search page",
      cardAuthorityTitle: "Authority documents",
      cardAuthorityCta: "e-Government (DEMO)",
      cardProfileTitle: "Profile",
      cardProfileCta: "Account info",
      investorPortfolioNote: "Investor portfolio charts (favorites)",
      investorPortfolioCta: "Go to portfolio view",
    },
    investorDashboard: {
      badge: "Investor",
      title: "Investor panel",
      subtitle: "Portfolio performance, AI forecasts and distribution analytics.",
      back: "Back to panel",
      marketAnalysis: "Market analysis",
      loading: "Loading portfolio…",
      emptyTitle: "Your portfolio is empty",
      emptyDesc: "Browse listings and add them to favorites to build your enterprise portfolio view.",
      emptyCta: "Explore listings",
      kpiPortfolioValue: "Portfolio value",
      kpiListingsHint: "listings",
      kpiPredictedValue: "Predicted value",
      kpiAvgYield: "Avg. yield",
      kpiAvgYieldHint: "Annual rent",
      kpiPotential: "Potential",
      kpiPotentialHint: "Predicted difference",
      chartGrowthTitle: "Portfolio value growth",
      chartGrowthSubtitle: "Last 6 months (estimated)",
      chartCategoryTitle: "Category distribution",
      chartCategorySubtitle: "Million ₺",
      chartYieldTitle: "Yield and AI score",
      chartYieldSubtitle: "By district",
      barRentPct: "Rent %",
      barAiScore: "AI score",
      portfolioListings: "Portfolio listings",
      cardCurrent: "Current",
      cardPredicted: "Predicted",
      cardYield: "Yield",
      months: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
    },
    profile: {
      guestTitle: "Account Profile",
      guestDesc: "Log in to view your profile info, KYC status and seller rating.",
      guestLogin: "Log In",
      back: "Back",
      logout: "Log Out",
      profileUpdated: "Profile updated!",
      ratingSuffix: "rating",
      noRating: "No rating yet",
      reviewSuffix: "reviews",
      memberSince: "Member since",
      auctionsCreated: "Auctions opened",
      auctionsWon: "Won",
      kycStart: "Start KYC",
      profileInfoTitle: "Profile Information",
      edit: "Edit",
      cancel: "Cancel",
      fullName: "Full name",
      emailLabel: "Email",
      phoneLabel: "Phone",
      phoneNotSet: "Not provided",
      phoneNote: "Your phone number is not shown in listings; contact is handled via platform messages.",
      saveChanges: "Save Changes",
      securityTitle: "Security",
      emailVerification: "Email Verification",
      phoneVerification: "Phone Verification",
      twoFactor: "Two-Factor Authentication",
      kycVerification: "KYC (Identity) Verification",
      statusVerified: "Verified",
      statusPending: "Pending",
      statusSoon: "Coming soon",
      accountSummaryTitle: "Account Summary",
      summaryFavorites: "Favorites",
      summarySavedSearch: "Saved searches",
      summaryActiveOffers: "Active offers",
      summaryGoToPanel: "Go to full panel",
      notifyTitle: "Notification Preferences",
      notifyDesc: "Your preferences are stored in the browser. Server-side notification integration works with push tokens in the live version.",
      notifyEmail: "Email notification",
      notifyEmailDesc: "New match, offer, accept/reject",
      notifyPush: "Browser push",
      notifyPushDesc: "Instant notifications",
      notifyMatches: "Saved search match",
      notifyMatchesDesc: "When a new listing meets your criteria",
      notifyBids: "Bid status update",
      notifyBidsDesc: "Outbid / won / counter-offer",
    },
  },
  tr: {
    nav: {
      auctions: "İhaleler",
      howItWorks: "Nasıl Çalışır",
      services: "Hizmetler",
      resources: "Kaynaklar",
      company: "Kurumsal",
      gesLand: "GES Arazi",
      valuation: "Değerleme",
      researchHub: "Araştırma",
      corporate: "Kurumsal",
      faq: "SSS",
      search: "İhale, lokasyon ara…",
      logIn: "Giriş",
      signUp: "Kayıt Ol",
      openMenu: "Menüyü aç",
      closeMenu: "Menüyü kapat",
      langEn: "English",
      langTr: "Türkçe",
      langRu: "Rusça",
      langAr: "Arapça",
      borsaCta: "Borsaya Gir",
    },
    home: {
      hero: {
        badge: "Şeffaf. Güvenli. Akıllı.",
        titleLead: "Gayrimenkul",
        titleAccent: "İhalelerinin Geleceği",
        subtitle:
          "AI destekli platform — güvenli, şeffaf ve verimli gayrimenkul ihaleleri için.",
        ctaExplore: "İhaleleri Keşfet",
        ctaHow: "Nasıl Çalışır",
      },
      live: {
        title: "Canlı İhaleler",
        live: "Canlı",
        growth: "+%18 geçen aydan",
        view: "Canlı Görüntüle",
      },
      trust: [
        { title: "Bank Düzeyi Güvenlik", sub: "256-bit SSL şifreleme" },
        { title: "10.000+", sub: "Aktif yatırımcı" },
        { title: "4.9/5", sub: "Müşteri puanı" },
        { title: "7/24 Destek", sub: "Her zaman yanınızda" },
      ],
      stats: [
        { label: "Toplam İhale", vs: "vs geçen ay" },
        { label: "Başarılı Satış", vs: "vs geçen ay" },
        { label: "Aktif Yatırımcı", vs: "vs geçen ay" },
        { label: "Memnuniyet", vs: "vs geçen ay" },
      ],
      how: {
        title: "Nasıl Çalışır?",
        subtitle: "4 basit adımda gayrimenkul ihalelerine katılın",
        steps: [
          { title: "Keşfet", desc: "Doğrulanmış ilanlar ve detaylı analitik." },
          { title: "Kayıt & Doğrulama", desc: "KYC doğrulama sürecini tamamla." },
          { title: "Teklif Ver", desc: "Canlı ihalelere gerçek zamanlı katıl." },
          { title: "Kazan", desc: "İhaleyi kazan, güvenli teslimat." },
        ],
        sidebarTitle: "Neden Yatırımcılar iHaleal'e Güveniyor",
        sidebar: [
          { title: "Bank Düzeyi Güvenlik", sub: "256-bit SSL & veri koruması" },
          { title: "AI Destekli Analitik", sub: "AI ile akıllı kararlar" },
          { title: "Şeffaf Süreç", sub: "%100 şeffaf teklif süreci" },
          { title: "Küresel Erişim", sub: "Türkiye geneli ihaleler" },
          { title: "7/24 Destek", sub: "Her zaman yanınızdayız" },
        ],
        certs: [
          { title: "ISO 27001", sub: "Sertifikalı" },
          { title: "SOC 2", sub: "Type II Uyumlu" },
          { title: "KVKK", sub: "Uyumlu", flag: "TR" },
        ],
      },
      auctions: {
        title: "Canlı İhaleler",
        viewAll: "Tüm İhaleleri Gör",
        currentBid: "Mevcut Teklif",
        live: "CANLI",
        items: [
          {
            title: "Lüks Villa",
            location: "İstanbul, Sarıyer",
            price: "₺12.450.000",
            change: "+%12.5",
            time: "15s 24dk",
            bids: "32 teklif",
          },
          {
            title: "Modern Ofis Binası",
            location: "Ankara, Çankaya",
            price: "₺8.850.000",
            change: "+%8.2",
            time: "1g 5s",
            bids: "28 teklif",
          },
          {
            title: "Premium Daire",
            location: "İzmir, Konak",
            price: "₺3.950.000",
            change: "+%15.7",
            time: "2s 15dk",
            bids: "18 teklif",
          },
          {
            title: "Ticari Kompleks",
            location: "Bursa, Nilüfer",
            price: "₺14.250.000",
            change: "+%10.3",
            time: "3g 12s",
            bids: "45 teklif",
          },
        ],
      },
      trusted: {
        title: "Dünyanın önde gelen kurumları tarafından güveniliyor",
        certs: [
          { title: "ISO 27001", sub: "Sertifikalı" },
          { title: "SOC 2", sub: "Type II Uyumlu" },
          { title: "KVKK", sub: "Uyumlu" },
        ],
      },
      investor: {
        heading: "Yatırımcı Paneli",
      },
      terminal: {
        eyebrow: "İhaleal Terminal",
        prompt: "Size nasıl yardımcı olabiliriz?",
        askPlaceholder: "Her şeyi sorun…",
        askSubmit: "Sor",
        options: {
          rent: "KİRALIK",
          sale: "SATILIK",
          auction: "İHALE",
          launch: "LANSMAN",
        },
        borsaCta: "Borsa terminaline geç →",
        aiUnavailable:
          "AI asistanı şu an kullanılamıyor (kotası veya yapılandırma bekleniyor). Aşağıdaki hızlı yönlendirmeleri deneyin.",
        hints: [
          "İhaleye nasıl teklif verilir? → /nasil-calisir",
          "Canlı müzayede → /ihaleler",
          "Borsa terminali → /borsa",
        ],
      },
    },
    common: {
      loading: "Yükleniyor…",
      loadingListings: "İlanlar yükleniyor…",
      errorLoad: "Uzak liste alınamadı; yerel demo kayıtları gösteriliyor.",
      retry: "Tekrar dene",
      emptySearch: "Arama yapın",
      emptyResults: "Sonuç bulunamadı",
      notFoundListing: "İlan bulunamadı",
    },
    onboarding: {
      title: "Hoş geldin!",
      subtitle: "Nereden başlamak istersin?",
      back: "Geri",
      skip: "Şimdilik geç →",
      skipNote: "Bunu istediğin zaman değiştirebilirsin.",
      discover: {
        title: "Keşfet",
        subtitle: "İhaleleri, ilanları ve piyasa verisini incele.",
        cta: "İhaleleri gör",
      },
      sell: {
        title: "Sat / İlan ver",
        subtitle: "Mülkünü ihaleye ya da satışa çıkar.",
        cta: "İlan oluştur",
      },
      buy: {
        title: "Al / Teklif ver",
        subtitle: "Açık artırmalara katıl, fırsatları yakala.",
        cta: "Aktif ihaleler",
      },
    },
    pricing: {
      badge: "Fiyatlandırma",
      title: "İhtiyacına göre paket seç",
      subtitle: "Bireyselden kurumsala 5 paket — istediğin zaman yükselt, düşür veya iptal et.",
      yearlyDiscountNote: "Yıllık ödemede indirim",
      chips: { noCommit: "Taahhüt yok", cancelAnytime: "İstediğin zaman iptal", noHidden: "Gizli ücret yok" },
      segmentTitle: "Hangi paket sana uygun?",
      segments: {
        individual: { title: "Bireysel alıcı/satıcı", desc: "Evini satıp ihaleye çıkarmak veya ihalede ev/arsa almak isteyenler. Bireysel paket yeterli." },
        investor: { title: "Yatırımcı", desc: "Düzenli yatırım kararı veren — borsa terminel + sınırsız rapor + gerçek kapanış verisi + AI fırsat bildirimi gerekli." },
        realtor: { title: "Emlakçı / Ofis", desc: "Yeni başlayan ofis → Başlangıç, büyüyen profesyonel ofis → Pro. Doping + öncelik + ekip yönetimi." },
        corporate: { title: "Kurumsal", desc: "Zincir ofisi, portföy fonu, müteahhit firma → API + mini-site + beyaz etiket PDF + 10 ekip + öncelikli destek." },
      },
      toggle: { monthly: "Aylık", yearly: "Yıllık" },
      tierCard: {
        free: "Ücretsiz",
        early: "Kuruluş",
        feeNote: "(tahsilat ₺)",
        monthlyEqv: "/ay (yıllık -%20)",
        dailyPrefix: "≈ günde",
        showAll: "Tüm özellikleri gör",
        hideDetails: "Detayları gizle",
        ctaFree: "Ücretsiz Başla",
        ctaSelect: "Paketi Seç",
        cancelNote: "İstediğin zaman iptal — sözleşme yok",
        corporateNote: "Demo + özel teklif için iletişime geç",
      },
      yearlySavings: "Yıllık ödemede toplam tasarruf",
      trustHeader: "Güven, İade ve Sıkça Sorulanlar",
      refundTitle: "İade Politikası",
      refund: {
        d14: "14 gün ücretsiz iade: Yeni aboneliklerde ilk 14 gün içinde iade hakkı (TKHK 16. madde — mesafeli satış).",
        cancel: "İstediğin zaman iptal: Sözleşme yok, kullanım dönemini bitir, otomatik yenilenmesin.",
        upgrade: "Yükselt/Düşür: Tier değişimi anında geçerli; aradaki fark prorate edilir.",
        delete: "Hesap silme: Verilerin KVKK kapsamında 30 gün içinde anonimleştirilir (faturalar yasal 10 yıl saklanır).",
      },
      faqTitle: "Sıkça Sorulanlar",
      faq: {
        paymentQ: "Ödeme nasıl alınacak?",
        paymentA: "iyzico / PayTR (gelecek). Kredi kartı + havale opsiyonu. 3D Secure zorunlu.",
        commissionQ: "Komisyon nasıl çalışıyor?",
        commissionA: "%2 alıcı + %2 satıcı = toplam %4 (KDV hariç matrah). KDV %20 komisyon üzerine. Yasal tavan: Taşınmaz Ticareti Yönetmeliği md.20.",
        priceQ: "Fiyat değişir mi?",
        priceA: "Pazar testi süresinde — şimdilik bu fiyatlar. Mevcut abonelerin fiyatı 12 ay sabit.",
        kvkkQ: "KVKK?",
        kvkkA: "Tam uyumlu — Supabase EU Frankfurt, sızıntı bildirimi 72 saat, veri imha 30 gün.",
      },
      legalTitle: "Yasal Çerçeve",
      legal: {
        distanceSale: { title: "Mesafeli Satış", desc: "6502 sayılı TKHK m. 48 — 14 gün cayma hakkı yazılı tüketici bildirimi ile." },
        kvkk: { title: "KVKK Uyum", desc: "6698 sayılı KVKK — kişisel veri saklama, anonimleştirme, ihlal bildirimi 72 saat." },
        payment: { title: "Ödeme Hizmeti", desc: "6493 sayılı Ödeme + Menkul Kıymet Mutabakat Sistemleri Kanunu — emanet/escrow uyumlu." },
      },
      trustBadges: { refund: "14 gün ücretsiz iade", cancel: "İstediğin zaman iptal", compliant: "KVKK + 6493 uyumlu", noContract: "Sözleşme yok" },
      corporateTitle: "Kurumsal teklif veya özel pazarlık?",
      corporateDesc: "50+ kullanıcı / API entegrasyonu / mini-site / beyaz etiket PDF için özel paket — bizimle iletişime geç.",
      corporateCta: "İletişime geç",
    },
    payment: {
      start: {
        back: "Paketlere dön",
        title: "Ödeme",
        demoSubtitle: "Demo / Mock — gerçek ödeme entegrasyonu eklenecek (iyzico / PayTR).",
        sandboxBannerTitle: "Sandbox / Test Modu",
        sandboxBannerBody: "Ödeme şu anda iyzico sandbox üzerinde çalışıyor. Form gönderildiğinde Supabase Edge function payments-iyzico çağrılır + abonelik kaydı oluşturulur — gerçek para çekilmez. Production için IYZICO_API_KEY + IYZICO_SECRET_KEY Supabase secret'a girilmeli.",
        prodBannerTitle: "Production — Gerçek Ödeme Aktif",
        prodBannerBody: "iyzico Merchant entegrasyonu aktif. Form gönderince 3D Secure sayfasına yönlendirileceksiniz. Kart bilgileri ihaleal sunucularına ASLA gelmez (PCI-DSS uyumlu).",
        errors: {
          alreadySubscribed: "Bu hesapta zaten aktif bir abonelik var. Lütfen önce iptal edin.",
          unauthorized: "Giriş yapmanız gerekir.",
          generic: "Ödeme başlatılamadı",
        },
        cardSectionTitle: "Kart Bilgileri",
        cardName: "Kart üzerindeki isim",
        cardNumber: "Kart numarası",
        cardExpiry: "Son kullanım (AA/YY)",
        cardCvc: "CVC",
        cardNamePlaceholder: "AHMET YILMAZ",
        cardNumberPlaceholder: "0000 0000 0000 0000",
        cardExpiryPlaceholder: "12/28",
        cardCvcPlaceholder: "123",
        acceptKvkk: "KVKK Aydınlatma Metni'ni okudum ve onaylıyorum. Ödeme + abonelik koşullarını (TKHK 14 gün cayma + iptal hakkı) kabul ediyorum.",
        payBtn: "öde (demo)",
        paying: "İşleniyor...",
        pciNote: "3D Secure + KVKK + 6493 uyumlu — kart bilgileri saklanmaz, doğrudan banka tokenize.",
        summarySelected: "Seçilen paket",
        summaryPeriod: "Periyot",
        summaryListingLimit: "İlan limiti",
        summaryTeam: "Ekip",
        summaryTotal: "Toplam",
        summaryFxRef: "Referans",
        feeNote: "(tahsilat ₺)",
        guaranteesTitle: "Güvenceler",
        guarantees: {
          d14: "14 gün ücretsiz iade (TKHK)",
          cancel: "İstediğin zaman iptal",
          kvkk: "KVKK + 6493 uyumlu",
          ssl: "SSL + 3D Secure",
        },
        autoRenewalTitle: "Otomatik Yenileme ve İptal",
        autoRenewal: {
          renewal: "Yenileme: Abonelik dönem sonunda otomatik yenilenir. Yenileme tarihinden 7 gün önce e-posta bildirimi gönderilir.",
          cancel: "İptal: İstediğiniz zaman iptal edebilirsiniz. Web: Üyeliğim → \"Aboneliği iptal et\". iOS: Ayarlar → Apple ID → Abonelikler. Android: Google Play → Profil → Abonelikler.",
          refund: "İade: İlk 14 gün içinde tam iade (TKHK m. 48 cayma). Aktif dönem bitimine kadar paket özellikleri açık kalır.",
        },
        autoRenewalLaw: "Mevzuat: 6502 TKHK m. 48 + KVKK 6698 + 6493 Ödeme + Apple/Google mağaza şartları (mobil).",
        corporateTitle: "Kurumsal teklif?",
        corporateDesc: "10+ ekip, API entegrasyon, mini-site için özel paket — iletişime geç.",
        cycleMonthly: "Aylık",
        cycleYearly: "Yıllık",
        footerDemo: "Bu sayfa DEMO'dur. Gerçek ödeme entegrasyonu (iyzico / PayTR) Master hesap+API key sağlayınca eklenecek.",
      },
      success: {
        title: "Hoş geldin!",
        activated: "paketin aktif edildi.",
        activeBadge: "Aktif paket",
        listingLimit: "İlan limiti",
        teamSeats: "Ekip üye",
        refundLabel: "İptal/iade",
        refundValue: "14 gün ücretsiz",
        unlimited: "Sınırsız",
        sandboxTitle: "Sandbox Ödeme Onayı",
        sandboxBody: "Bu ödeme iyzico sandbox üzerinden tamamlandı — gerçek para çekilmedi (test ortamı). Aboneliğiniz Supabase subscriptions tablosuna kaydedildi ve premium özellikler aktif edildi. Production tahsilat için iyzico merchant API anahtarları Master tarafından secret olarak girilmelidir.",
        feeNote: "(tahsilat ₺)",
        manageMembership: "Üyeliğimi Yönet",
        openExchange: "Borsa Terminalini Aç",
        invoiceSent: "Faturanız destek@ihaleal.com'a gönderildi (mock).",
        questions: "Sorular",
      },
    },
    listingDetail: {
      back: "Geri",
      favoriteAdd: "Favoriye ekle",
      favoriteRemove: "Favoriden çıkar",
      compareLabel: "Karşılaştır",
      printLabel: "Yazdır",
      openMap: "Haritayı aç",
      pdfReport: "İhaleal Endeks Raporu",
      badgeRent: "Kiralık",
      badgeSale: "Satılık",
      badgeAuction: "İhale",
      badgeSealed: "Kapalı teklif",
      priceCurrentBid: "Güncel teklif",
      priceListing: "İlan fiyatı",
      priceStartingBid: "Başlangıç / talep",
      estimatedValueTitle: "Tahmini değer (AI · yaklaşık)",
      estimatedAbove: "% üstünde",
      estimatedBelow: "% altında",
      verifiedListing: "Doğrulanmış ilan",
      feeNote: "(tahsilat ₺)",
      ctaBid: "Teklif ver",
      ctaSealedBid: "Kapalı teklif ver",
      ctaSealedBidShort: "Kapalı teklif",
      ctaNegotiate: "Teklif / pazarlık",
      ctaInfoRequest: "Bilgi talebi",
      ctaBuyNow: "Hemen Al",
      ctaBidSubmitting: "Gönderiliyor...",
      ctaBidSubmit: "Teklif Ver",
      ctaSealedSubmit: "Kapalı teklifi gönder",
      mobileBidShort: "Teklif",
      tabFeatures: "Özellikler",
      tabLocation: "Konum",
      auctionEnded: "Açık artırma sona erdi",
      loginRequired: "Giriş gerekli",
      reportApproval: "Önce AI raporunu onaylayın",
      depositRequired: "Blokaj ön yetkisi gerekli",
      cantBidOwn: "Kendi ilanınıza teklif veremezsiniz",
      activeListing: "Aktif İlan",
      featuresListMissing: "Özellik listesi mevcut değil.",
      bidLoginRequired: "Teklif için giriş yapın.",
      bidAcceptRequired: "Teklifi göndermek için tüm sözleşme ve beyan kutularını işaretleyin.",
      // ── 11-G ──
      loading: "İlan yükleniyor…",
      notFoundTitle: "İlan bulunamadı",
      notFoundDesc:
        "Aradığınız ilan kaldırılmış, bağlantı bozuk olabilir veya hiç var olmamış olabilir. Açık ihaleleri inceleyebilir ya da arama sayfasından yeni bir ilan bulabilirsiniz.",
      notFoundBackAuctions: "İhalelere dön",
      notFoundSearch: "Arama sayfası",
      bcHome: "Ana sayfa",
      bcListings: "İlanlar",
      bcListingFallback: "İlan",
      cityAreaListingsSuffix: "bölge ilanları",
      badgeLive: "Canlı",
      badgeUpcoming: "Yaklaşan",
      badgeLansman: "🏗️ LANSMAN",
      viewCountSuffix: "görüntülenme",
      lansmanUnitBadge: "🏗️ Lansman birimi",
      lansmanCardTitle: "Bu ilan bir lansman projesinin birimidir",
      lansmanDeveloperLabel: "Müteahhit projesi:",
      lansmanProjectFallback: "Lansman projesi",
      lansmanUnitPrefix: "Birim",
      lansmanProjectPage: "Proje sayfası",
      weeklyScheduleTitle: "Haftalık ihale takvimi (hedef)",
      participationDocsLabel: "Katılım evrakları ve kategoriler:",
      participationDocsNote:
        "(kimlik, Findeks, ekspertiz, tapu özeti, teminat vb.; hukuki son söz sözleşme ve avukat).",
      priceCardAiPredicted: "AI Tahmini",
      priceCardInvestmentScore: "Yatırım Skoru",
      marketReportBtn: "İhaleal Endeksi — piyasa raporu analizi",
      officialDocsBtn: "Resmi belgeler (imar, belediye…)",
      aiRecoTitle: "AI Alım Tavsiyesi",
      aiRecoStrongBuy: "Güçlü alım fırsatı. Fiyat AI tahmininin altında.",
      aiRecoBuy: "Makul alım fırsatı.",
      aiRecoHold: "Beklemek daha mantıklı.",
      aiRecoAvoid: "Dikkatli olun, fiyat yüksek.",
      tabOverview: "Genel Bakış",
      tabDetails: "Detaylar",
      tabPriceHistory: "Fiyat Geçmişi",
      tabAi: "AI Analiz",
      tabMandatory: "ZORUNLU",
      countdownEnded: "İhale sona erdi",
      countdownUpcomingLabel: "Başlamaya kalan",
      countdownLastHour: "SON SAAT",
      countdownRemaining: "Bitişe kalan",
      countdownDays: "Gün",
      countdownHours: "Saat",
      countdownMinutes: "Dakika",
      countdownSeconds: "Saniye",
      estValueBelowText: "Tahmini değerin %{pct} altında",
      estValueAboveText: "Tahmini değerin %{pct} üzerinde",
      depositDemo: "Blokaj (demo)",
      evaluateSeller: "Satıcıyı değerlendir",
      supportEmail: "Destek talebi (e-posta)",
      expertOpinion: "Uzman Görüşü Al",
      expertOpinionDesc: "Profesyonel ekspertiz raporu talep edin",
      commissionTitle: "Komisyon Hesaplayıcı",
      commissionRefListing: "İlan tutarı (referans)",
      commissionRefAuction: "İhale / teklif tutarı (tahmini)",
      commissionPlatformBuyer: "Platform (alıcı)",
      commissionVat: "KDV (platform)",
      commissionDeedDuty: "Tapu Harcı",
      commissionRevolvingCapital: "Döner Sermaye",
      commissionTotal: "Toplam Maliyet",
      commissionDetailLink: "Komisyon yapısını detaylı incele",
      securityTitle: "Güvenlik Doğrulaması",
      secIdentity: "Kimlik doğrulaması zorunlu",
      secFindeks: "Findeks kredi notu kontrolü",
      sec2fa: "SMS ile iki aşamalı doğrulama",
      secBankApi: "Banka API ile ödeme garantisi",
      secAmlKyc: "AML/KYC uyumu",
      secLawNote: "ihaleal.com, 7263 sayılı Kanun kapsamında faaliyet gösterir.",
      // ── 11-G-2 ──
      ovProfRules: "Profesyonel kurallar (özet)",
      ovCommitmentTitle: "Taahhüt limit bandı (satıcı / kiraya veren)",
      ovCommitmentFloor: "Alt:",
      ovCommitmentCeiling: "Üst:",
      ovCommitmentNote:
        "— üst limite ulaşıldığında işlem yükümlülüğü ve komisyon matrahı sözleşmede (hedef). Alıcı ve kiracı için simetrik kurallar aynı pakette.",
      ovCommitmentPending: "Taahhüt onayı kayıtlı; limit değerleri üretimde tamamlanır.",
      ovExpertiseTitle: "Ekspertiz raporu (şerh / ipotek / haciz)",
      ovExpertiseRequiredNote: "Bu ilanda ekspertiz zorunluluğu beyanı var. ",
      ovExpertiseFileLabel: "Dosya (demo):",
      ovExpertiseFileNote:
        "PDF üretimde doğrulanır; sahtecilik riskine karşı AI ön tarama + insan onayı hedeflenir.",
      ovDescriptionTitle: "Açıklama",
      ovDetailRoom: "Oda",
      ovDetailNetSqm: "Net m²",
      ovDetailFloor: "Kat",
      ovDetailBuildingAge: "Bina Yaşı",
      ovVirtualTourTitle: "360° Sanal Tur",
      ovVirtualTourDesc: "Bu mülkü sanal olarak gezebilirsiniz.",
      ovVirtualTourStart: "Sanal Turu Başlat",
      detRoomLiving: "Oda + Salon",
      detGrossSqm: "Brüt m²",
      detNetSqm: "Net m²",
      detCurrentFloor: "Bulunduğu Kat",
      detTotalFloors: "Toplam Kat",
      detBuildingAge: "Bina Yaşı",
      detBuildingAgeUnit: "Yıl",
      detHeating: "Isıtma",
      detFacade: "Cephe",
      detBathroom: "Banyo",
      detBalcony: "Balkon",
      detElevator: "Asansör",
      detParking: "Otopark",
      detFurnished: "Eşyalı",
      detUsage: "Kullanım Durumu",
      detDeedStatus: "Tapu Durumu",
      detEligibility: "Uygunluk",
      locNearby: "Yakın Çevre",
      locDistanceSuffix: "mesafe",
      locMapLoading: "Harita yükleniyor…",
      locMapFallbackNote: "Kesin konum yok; harita {city} merkezine göre gösteriliyor.",
      aiGateNote: "Teklif verebilmek için önce raporu onaylayın ve ardından blokaj ön yetkisini tamamlayın.",
      aiRadarScore: "Skor",
      aiCommentTitle: "AI Yorumu",
      aiCommentUnder:
        "Bu gayrimenkul AI değerleme modelimize göre %{pct} oranında değerinin altında fiyatlandırılmış. {location} bölgesinde ortalama m² fiyatı ₺{avgSqm} iken, bu ilan ₺{sqm} / m² fiyatla listeleniyor.",
      aiCommentFair:
        "Bu gayrimenkul AI değerleme modelimize göre piyasa ortalamasına yakın fiyatlandırılmış. Talep endeksi {demand}/100.",
      aiBadgeRentalYield: "Kira Getirisi",
      aiBadgeDemandIndex: "Talep Endeksi",
      aiBadgeYearlyGrowth: "Yıllık Artış",
      aiRegionStatsTitle: "Bölge İstatistikleri",
      statAvgSqmPrice: "Ort. m² Fiyat",
      statMonthlyChange: "Aylık Değişim",
      statYearlyChange: "Yıllık Değişim",
      statAvgDaysOnMarket: "Ort. Satış Süresi",
      statDaysUnit: "gün",
      aiSuggestTitle: "AI Teklif Önerisi",
      aiSuggestThinking: "Düşünüyor…",
      aiSuggestRetry: "Tekrar sor",
      aiSuggestGet: "Öneri al",
      aiSuggestError: "AI önerisi şu an alınamadı. Lütfen birkaç dakika sonra tekrar deneyin.",
      aiSuggestPlaceholder:
        "Tek tıkla bu mülk için önerilen teklif aralığı, dayanağı ve risk noktası AI tarafından üretilir.",
      expPanelTitle: "Ekspertiz Raporu",
      expPanelPreparing: "Hazırlanıyor…",
      expPanelDownload: "PDF İndir",
      expPanelDesc:
        "Mülk tanımı, fiyat değerleme, bölge analizi, özellikler ve çevre olanakları — Roboto Türkçe font ile profesyonel PDF özet.",
      // ── 11-G-3 ──
      cancel: "Vazgeç",
      bidCostTitle: "Tahmini Toplam Maliyet (Komisyon + Harçlar Dahil)",
      bidCostNote: "Alıcı platform: fees.ts · tapu %{pct} + sabit masraf (demo)",
      bidAmountLabel: "Teklif tutarı (₺)",
      bidAmountPlaceholder: "örn: 3000000 veya 3.000.000",
      proxyTitle: "Otomatik teklif (proxy bid)",
      proxyDesc: "Sizin adınıza, başkalarının teklifleri geldikçe maksimum tutara kadar otomatik artırır.",
      proxyEnableAria: "Otomatik teklifi etkinleştir",
      proxyMaxLabel: "Maksimum teklif tutarı (₺)",
      proxyMaxPlaceholderPrefix: "örn:",
      proxyDemoNote:
        "Demo: max tutar yerel olarak kaydedilir (kullanıcı tercihi). Otomatik artırma backend tarafı (auction_proxy_bids tablosu + RLS + sealed maskeleme uyumu) tamamlandığında devreye girer. Şu an gönderim normal tek-tıkla teklif olarak işlenir.",
      bidGateTitle: "Zorunlu onaylar",
      bidGateTooltip: "Tüm onay kutularını işaretleyin",
      toastAuctionEnded: "Bu ihale sona ermiş.",
      toastInvalidBid: "Geçerli bir teklif tutarı girin (pozitif tam sayı, makul üst sınır içinde).",
      toastMinBid: "Teklif en az ₺{amount} olmalı.",
      toastBidGate: "Önce AI raporunu onaylayın ve teminat (ön yetki) adımını tamamlayın.",
      toastDuplicate: "Bu teklif zaten kayıtlı.",
      toastBidSaved: "Teklif kaydedildi: ₺{amount}",
      toastDemoBid:
        "Demo ilan: teklif veritabanına yazılmaz. Canlı ihalelerde (Supabase UUID) teklif sunucuda saklanır.",
      toastOfferSubmitted: "Teklifiniz kaydedildi. Tekliflerim panelinden takip edebilirsiniz.",
      toastLogin: "Giriş yapın.",
    },
    borsa: {
      marketTicker: "Piyasa Ticker",
      marketSummary: "Piyasa Özeti",
      totalVolume: "Toplam hacim",
      tradeCount: "İşlem adedi",
      activeOrders: "Aktif emir",
      openClose: "Açılış/Kapanış",
      marketBreadth: "Piyasa Genişliği",
      bidStream: "Teklif Akışı",
      orderBookPreviewMasked: "Emir Defteri Önizleme (Maskeli)",
      marketDataSummary: "Piyasa Verisi Özeti",
      bidder: "Teklifçi",
      portfolioEyebrow: "Borsa Portföy",
      portfolioTitle: "Portföy Terminali",
      portfolioDesc: "Portföydeki varlıkları güven şeridi altında yönetin: açık artırma, sabit satış, kiralama, takas ve devren akışları tek panelde.",
      totalPurchase: "Toplam Alış",
      currentValue: "Güncel Değer",
      pnlLabel: "K/Z (%)",
      portfolioTrend: "Portföy Trendi",
      distributionSegment: "Dağılım · Segment",
      distributionRegion: "Dağılım · Bölge",
      tooltipValue: "Değer",
      periodPrefix: "Periyot",
      auditableLog: "Denetlenebilir işlem kaydı",
      encrypted: "Şifreli",
      howSecure: "Nasıl güvende?",
      verified: "Doğrulandı",
      watchlistEyebrow: "İzleme Terminali",
      watchlistTitle: "İzleme Listesi + Alarm Merkezi",
      watchAdd: "İzle",
      watchRemove: "İzlemeden Çıkar",
      watchAddedToast: "İzleme listesine eklendi.",
      watchRemovedToast: "İzleme listesinden kaldırıldı.",
      high24: "24s Yüksek",
      low24: "24s Düşük",
      volumeLabel: "Hacim",
      orderBook: "Emir Defteri (Order Book)",
      bidColumn: "Alış",
      askColumn: "Satış",
      priceColumn: "Fiyat",
      maLabel: "MA(5)",
    },
    megaMenu: {
      segmentInvestor: "Yatırımcı",
      segmentRealtor: "Emlakçı",
      segmentContractor: "Müteahhit",
      liveAuctions: "Canlı ihaleler",
      aiValuation: "AI değerleme",
      investorPanel: "Yatırımcı paneli",
      rewards: "Ödüller",
      campaigns: "Kampanyalar",
      intlInvestor: "Uluslararası yatırımcı",
      realtorShowcase: "Emlakçı vitrini",
      officePanel: "Ofis paneli",
      realtorLogin: "Emlakçı girişi",
      b2bPartnership: "B2B ortaklık",
      contractorLaunch: "Müteahhit lansman",
      projectPanel: "Proje paneli",
      openAuction: "İhale aç",
      floorBarter: "Kat karşılığı",
    },
    footer: {
      tagline: "AI destekli değerleme, şeffaf ihale süreci ve güvenli işlem altyapısı.",
      taglineShort: "Yapay zeka destekli gayrimenkul platformu",
      workingHours: "Hafta içi 09:00 - 18:00 (UTC+3)",
      colPlatform: "Platform",
      colTools: "Araçlar",
      colCorporateLegal: "Kurumsal & Hukuki",
      colNewsletter: "Bülten",
      newsletterDesc: "Yeni ihalelerden ilk siz haberdar olun.",
      newsletterPlaceholder: "E-posta",
      newsletterSubmit: "Abone",
      allRightsReserved: "Tüm hakları saklıdır.",
      langLabel: "Dil",
      auctionsLink: "İhaleler",
      aiAnalysis: "AI Analiz",
      compare: "Karşılaştır",
      revenueModel: "Gelir modeli",
      mortgage: "Mortgage",
      favorites: "Favoriler",
      realtorLoginFooter: "Emlakçı girişi",
      realtorPartnership: "Emlakçı ortaklığı",
      researchTerminal: "Araştırma terminali",
      priceEstimate: "Fiyat Tahmini",
      loanCalculator: "Kredi Hesaplayıcı",
      listingCompare: "İlan Karşılaştırma",
      cityGuide: "Şehir Rehberi",
      howItWorksFooter: "Nasıl çalışır",
      platformGuide: "Platform rehberi",
      commissionCalc: "Komisyon hesaplayıcı",
      taxSimulator: "Vergi simülatörü",
      financeCompliance: "Finans / uyumluluk",
      legalHub: "Yasal Hub (tümü)",
      auctionTermsCommission: "İhale Koşulları & Komisyon",
      participationDocs: "Katılım Evrakları",
      kvkkInfo: "KVKK Aydınlatma Metni",
      termsOfUse: "Kullanım Koşulları",
      privacyPolicy: "Gizlilik Politikası",
      cookiePolicy: "Çerez Politikası",
      distanceSaleAgreement: "Mesafeli Satış Sözleşmesi",
      refundCancellation: "İade ve İptal",
      disclosure: "Aydınlatma Metni",
      contactFooter: "İletişim",
      aboutUs: "Hakkımızda",
      sitemap: "Site Haritası",
      faqFooter: "SSS",
      securityCenter: "Güvenlik Merkezi",
      sellerMode: "Satıcı modu",
      commissionModel: "Komisyon modeli",
      ihalealIndex: "İhaleal Endeksi",
    },
    tierData: {
      byId: {
        free: { name: "Bireysel", tagline: "İhale takibi + 1 ücretsiz ilan" },
        yatirimci: { name: "Yatırımcı", tagline: "Borsa terminali tam + sınırsız rapor" },
        emlak_baslangic: { name: "Emlak Başlangıç", tagline: "Yeni başlayan emlakçı / küçük ofis" },
        emlak_pro: { name: "Emlak Pro", tagline: "Profesyonel emlak ofisi — büyüme" },
        kurumsal: { name: "Kurumsal", tagline: "Zincir ofisleri + portföy fonları + müteahhitler" },
      },
    },
    loanValuation: {
      back: "Geri",
      loanTitle: "Konut Kredisi Hesaplayıcı",
      loanSubtitle: "Kredi tutarı, vade ve aylık faiz oranına göre taksit ve toplam geri ödeme tahmini (bilgilendirme amaçlı).",
      loanAmount: "Kredi tutarı (₺)",
      monthlyRate: "Aylık faiz oranı (%)",
      termLabel: "Vade",
      yearLabel: "yıl",
      monthlyInstallment: "Aylık taksit",
      totalRepayment: "Toplam geri ödeme",
      totalInterest: "Toplam faiz",
      loanAmountField: "Kredi Tutarı",
      downPayment: "Peşinat",
      propertyValue: "Konut bedeli",
      loanDisclaimerEqual: "Bu hesaplama eşit taksit formülüne dayanır; dosya masrafı, sigorta ve banka kampanyaları dahil değildir. Kesin teklif için bankanıza başvurun.",
      loanDisclaimerInfo: "Sadece bilgilendirme amaçlıdır.",
      widgetTitle: "Bu ilan için kredi hesapla",
      widgetEstimate: "tahmini:",
      widgetCalculate: "Hesapla",
      widgetBankNote: "Bilgilendirme amaçlı; banka onayı gerekir.",
      valuationTitle: "Gayrimenkul Değerleme",
      estimatedValueApprox: "Tahmini değer (yaklaşık)",
      confidenceRange: "Güven aralığı",
      uncertaintyBand: "Belirsizlik bandı",
      modelScore: "Model skoru",
      modelScoreHigh: "Yüksek",
      modelScoreMedium: "Orta",
      shapTitle: "SHAP katkı dökümü",
      shapImpact: "Etkisi",
      layerSummary: "Katman özeti",
      startValuation: "Değerleme başlat",
      resetForm: "Formu sıfırla",
      disclaimerInfo: "Bilgilendirme amaçlıdır",
      disclaimerNotOffer: "Kesin teklif değildir",
      disclaimerApprox: "Yaklaşık",
    },
    mortgage: {
      title: "Mortgage / Kredi Hesaplayıcı",
      subtitle: "Gayrimenkul alımında aylık taksit ve toplam maliyeti hesaplayın.",
      loanParameters: "Kredi Parametreleri",
      propertyValueLabel: "Gayrimenkul Değeri",
      downPaymentPercent: "Peşinat Oranı",
      downPaymentValue: "Peşinat",
      loanValue: "Kredi",
      termSelect: "Vade",
      yearShort: "Yıl",
      monthShort: "Ay",
      annualRate: "Faiz Oranı (Yıllık)",
      bankRequirements: "Banka Gereksinimleri",
      minMonthlyIncome: "Min. Aylık Gelir",
      minLabel: "Min",
      maxLabel: "Max",
      loanToValueRatio: "Kredi/Tapu Oranı",
      loanSummary: "Kredi Özeti",
      subEvenPay: "Düzgün ödeme",
      subOfCost: "maliyet",
      paymentPlanGraphTitle: "Ödeme Planı — Kalan Borç Grafiği",
      monthSuffix: "ay",
      remainingDebt: "Kalan Borç",
      totalInterestLegend: "Toplam Faiz",
      yearlyPaymentSummary: "Yıllık Ödeme Özeti",
      everyYearEnd: "Her yıl sonu",
      yearColumn: "Yıl",
      principalColumn: "Anapara",
      interestColumn: "Faiz",
      remainingColumn: "Kalan Borç",
      yearRowPrefix: ". Yıl",
      tipLowInterestTitle: "Düşük Faiz İpuçları",
      tipLowInterestDesc: "Daha kısa vade seçerseniz toplam faiz maliyeti düşer. 10 yıl yerine 5 yıl vade ile yaklaşık %40 daha az faiz ödersiniz.",
      tipDownPaymentTitle: "Peşinat Artırma",
      tipDownPaymentDesc: "Peşinatı %30'a çıkarmak aylık taksiti yaklaşık %15 düşürür ve toplam faiz maliyetini %25 azaltır.",
      disclaimer: "* Bu hesaplama bilgilendirme amaçlıdır. Gerçek kredi koşulları bankaya ve kredi notunuza göre değişiklik gösterebilir.",
    },
    valuationForm: {
      headerSubtitle: "Demo veri / ön analiz: hedonik + emsal + mekansal düzeltme birlikte çalışır.",
      explainableModel: "Açıklanabilir model",
      cityLabel: "İl",
      districtLabel: "İlçe",
      districtNoData: "İlçe verisi yok",
      grossM2Label: "Brüt m²",
      roomCountLabel: "Oda sayısı",
      floorLabel: "Kat",
      totalFloorsLabel: "Toplam kat",
      buildingAgeLabel: "Bina yaşı",
      heatingLabel: "Isıtma",
      heatingDistrict: "Merkezi sistem",
      heatingCentral: "Merkezi daire",
      heatingCombi: "Kombi",
      heatingUnderfloor: "Yerden ısıtma",
      heatingStove: "Soba",
      locationTierLabel: "Konum kalitesi",
      tierPrime: "Prime",
      tierStrong: "Güçlü",
      tierBalanced: "Dengeli",
      tierEmerging: "Gelişen",
      conditionLabel: "Fiziksel durum",
      conditionNew: "Yeni",
      conditionGood: "İyi",
      conditionNeedsRenovation: "Tadilat gerekli",
      transactionTypeLabel: "İşlem tipi",
      txSale: "Satış değeri",
      txRent: "Kira değeri",
      hasElevator: "Asansör",
      hasParking: "Otopark",
      errorTotalFloorsMin: "Toplam kat en az 1 olmalı.",
      errorFloorNegative: "Kat bilgisi negatif olamaz.",
      finalReviewBanner: "Ön değerleme tamamlandı. Resmi değer için SPK lisanslı değerleme uzmanı (TDUB) teyidi gerekir.",
      startValuationCta: "Değerleme başlat",
    },
    dataAnalysis: {
      eyebrow: "Veri / Analiz Terminali",
      title: "Piyasa Genel Görünüm + Ortalama Fiyat Paneli",
      subtitle: "Bölge/segment ortalama fiyat geçmişini, varlık-ortalama karşılaştırmasını ve ısı haritası derinliğini tek ekranda izleyin.",
      bannerWarning: "Burada gösterilen değerler bölge/segment ₺ ortalama fiyatlarıdır (resmi istatistik değildir, platform demo verisinden üretilen göstergedir). Gerçek İhaleal Endeksi puanı için Borsa ana sayfasındaki canlı endeksi izleyin.",
      avgPriceHistory: "Ortalama Fiyat Geçmişi (₺)",
      regionAvg: "Bölge ort. fiyat (₺)",
      segmentAvg: "Segment ort. fiyat (₺)",
      platformAvg: "Platform ort. fiyat (₺)",
      captionSelected: "Seçili bölge",
      assetVsPlatform: "Varlık vs Platform Ortalaması (₺)",
      assetPriceSuffix: "fiyat (₺)",
      comparisonSelection: "Karşılaştırma seçimi",
      segmentTrendAnalysis: "Segment Trend Analizi",
      volumeLabel: "Hacim",
      volumeUnit: "lot",
      depthScore: "Derinlik puanı",
      marketShare: "Pazar payı",
      regionHeatmap: "Bölge Isı Haritası",
      downloadReport: "Raporu İndir (Demo)",
      avgPriceShort: "Ort. fiyat",
      demoReportFootnote: "İndirilebilir rapor demodur; profesyonel yatırım kararları için bağımsız finansal/hukuki danışman görüşü gereklidir.",
      segmentResidential: "Konut",
      segmentLand: "Arsa",
      segmentCommercial: "Ticari",
      segmentTourism: "Turizm",
    },
    gesForm: {
      stepLabel: "Adım",
      step1Title: "Konum ve arazi",
      city: "İl",
      district: "İlçe",
      neighborhood: "Mahalle",
      adaParcel: "Ada / Parsel",
      adaPlaceholder: "Ada",
      parcelPlaceholder: "Parsel",
      totalAreaM2: "Toplam alan (m²)",
      solarIrradiance: "Güneşlenme (kWh/m²)",
      continueBtn: "Devam",
      step2Title: "Şebeke ve mevzuat",
      preScore: "Ön skor",
      trafoDistance: "Trafo mesafesi (km)",
      trafoCapacity: "Trafo kapasitesi (MW)",
      slopeDegree: "Eğim (derece)",
      slopeAspect: "Bakı",
      agriculturalClass: "Tarım sınıfı",
      chkMarginal: "Marjinal tarım / GEPA onayı mevcut",
      chkCadastralRoad: "Kadastro yolu var",
      chkSitConflict: "SİT alanı çakışması",
      chkMilitaryZone: "Askeri yasak bölge",
      chkArchaeological: "Arkeolojik sit",
      backBtn: "Geri",
      computingBtn: "Hesaplanıyor...",
      completeBtn: "Değerlendirmeyi tamamla",
      retryBtn: "Tekrar dene",
      errSubmit: "Değerlendirme gönderilemedi.",
      scoreLabel: "Skor",
      capacityLabel: "Kapasite",
      annualLabel: "Yıllık",
      capexLabel: "CAPEX",
      paybackLabel: "Geri ödeme",
      paybackYearSuffix: "yıl",
      paybackDefaultPriceNote: "(varsayılan fiyat)",
      newEvaluation: "Yeni değerlendirme",
      statusHigh: "Yüksek fizibilite",
      statusReject: "Teknik red",
      statusSubmitted: "Yatırımcıya iletildi",
      statusEngineering: "Mühendislik hesabı",
      statusGathering: "Veri toplama",
    },
    dashboard: {
      back: "Ana sayfa",
      title: "Hesap paneli",
      subtitle: "Seçtiğiniz akışlara göre kısayollar (demo; backend yok).",
      changeFlows: "Akışları değiştir",
      cardListingsTitle: "İlanlarım",
      cardListingsBody: "Paket fiyatları `fees.ts` placeholder (§D-K8).",
      cardListingsCta: "Satıcı merkezi",
      cardAuctionTitle: "İhale aç",
      cardAuctionBody: "Akış B — yetki ve evrak demo.",
      cardAuctionCta: "İhale oluştur",
      cardBidsTitle: "Tekliflerim / teminat",
      cardBidsBody: "Findeks, AML, bid bond — üretimde K3.",
      cardBidsCta: "Evrak listesi",
      cardFavoritesTitle: "Favoriler",
      cardFavoritesCta: "Favori ilanlar",
      cardSavedSearchTitle: "Kayıtlı aramalar",
      cardSavedSearchCta: "Arama sayfası",
      cardAuthorityTitle: "Yetki belgeleri",
      cardAuthorityCta: "e-Devlet (DEMO)",
      cardProfileTitle: "Profil",
      cardProfileCta: "Hesap bilgileri",
      investorPortfolioNote: "Yatırımcı portföy grafikleri (favoriler)",
      investorPortfolioCta: "Portföy görünümüne git",
    },
    investorDashboard: {
      badge: "Yatırımcı",
      title: "Yatırımcı paneli",
      subtitle: "Portföy performansı, AI tahminleri ve dağılım analitiği.",
      back: "Panele dön",
      marketAnalysis: "Piyasa analizi",
      loading: "Portföy yükleniyor…",
      emptyTitle: "Portföyünüz boş",
      emptyDesc: "İlanları inceleyip favorilere ekleyerek kurumsal portföy görünümünüzü oluşturun.",
      emptyCta: "İlanları keşfet",
      kpiPortfolioValue: "Portföy değeri",
      kpiListingsHint: "ilan",
      kpiPredictedValue: "Tahmini değer",
      kpiAvgYield: "Ort. getiri",
      kpiAvgYieldHint: "Yıllık kira",
      kpiPotential: "Potansiyel",
      kpiPotentialHint: "Tahmini fark",
      chartGrowthTitle: "Portföy değer artışı",
      chartGrowthSubtitle: "Son 6 ay (tahmini)",
      chartCategoryTitle: "Kategori dağılımı",
      chartCategorySubtitle: "Milyon ₺",
      chartYieldTitle: "Getiri ve AI skoru",
      chartYieldSubtitle: "İlçe bazlı",
      barRentPct: "Kira %",
      barAiScore: "AI skor",
      portfolioListings: "Portföy ilanları",
      cardCurrent: "Mevcut",
      cardPredicted: "Tahmini",
      cardYield: "Getiri",
      months: ["Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas"],
    },
    profile: {
      guestTitle: "Hesap Profili",
      guestDesc: "Profil bilgileri, KYC durumu ve satıcı puanını görmek için giriş yapın.",
      guestLogin: "Giriş Yap",
      back: "Geri",
      logout: "Çıkış Yap",
      profileUpdated: "Profil güncellendi!",
      ratingSuffix: "puan",
      noRating: "Henüz puan yok",
      reviewSuffix: "yorum",
      memberSince: "Üyelik",
      auctionsCreated: "Açılan İhale",
      auctionsWon: "Kazanılan",
      kycStart: "KYC başlat",
      profileInfoTitle: "Profil Bilgileri",
      edit: "Düzenle",
      cancel: "İptal",
      fullName: "Ad Soyad",
      emailLabel: "E-posta",
      phoneLabel: "Telefon",
      phoneNotSet: "Belirtilmemiş",
      phoneNote: "Telefon numaranız ilanlarda gösterilmez; iletişim platform mesajları üzerinden yürür.",
      saveChanges: "Değişiklikleri Kaydet",
      securityTitle: "Güvenlik",
      emailVerification: "E-posta Doğrulama",
      phoneVerification: "Telefon Doğrulama",
      twoFactor: "İki Faktörlü Doğrulama",
      kycVerification: "KYC (Kimlik) Doğrulama",
      statusVerified: "Doğrulandı",
      statusPending: "Bekliyor",
      statusSoon: "Yakında",
      accountSummaryTitle: "Hesabım Özeti",
      summaryFavorites: "Favoriler",
      summarySavedSearch: "Kayıtlı arama",
      summaryActiveOffers: "Aktif tekliflerim",
      summaryGoToPanel: "Tüm panele git",
      notifyTitle: "Bildirim Tercihleri",
      notifyDesc: "Tercihleriniz tarayıcıda saklanır. Sunucu tarafı bildirim entegrasyonu canlı sürümde push token ile çalışır.",
      notifyEmail: "E-posta bildirimi",
      notifyEmailDesc: "Yeni eşleşme, teklif, kabul/ret",
      notifyPush: "Tarayıcı push",
      notifyPushDesc: "Anlık bildirimler",
      notifyMatches: "Kayıtlı arama eşleşmesi",
      notifyMatchesDesc: "Yeni ilan kriterlerinize uyduğunda",
      notifyBids: "Teklif durum güncellemesi",
      notifyBidsDesc: "Outbid / kazandın / karşı teklif",
    },
  },
};

/**
 * 4 dil kabul eder. Bilinmeyen → "tr" (TR ana pazar).
 */
export function resolveLocale(raw: string | null): Locale {
  if (raw === "tr" || raw === "en" || raw === "ru" || raw === "ar") return raw;
  return "tr";
}

// ───────── RU/AR FAZ 0 — kanıt çevirileri (sadece nav.*) ─────────
// Geri kalan tüm metinler `getMessagesFor()` ile TR'den fallback alır.
// Tam çeviri sonraki fazlarda (sayfa sayfa).

type PartialDeep<T> = T extends object ? { [K in keyof T]?: PartialDeep<T[K]> } : T;

const _ruOverrides: PartialDeep<Messages> = {
  nav: {
    auctions: "Аукционы",
    howItWorks: "Как это работает",
    services: "Услуги",
    resources: "Ресурсы",
    company: "Компания",
    gesLand: "Земля для СЭС",
    valuation: "Оценка",
    researchHub: "Центр исследований",
    corporate: "Корпоративный",
    faq: "Частые вопросы",
    search: "Поиск аукционов и объектов недвижимости…",
    logIn: "Войти",
    signUp: "Регистрация",
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    langEn: "Английский",
    langTr: "Турецкий",
    langRu: "Русский",
    langAr: "Арабский",
    borsaCta: "Перейти на биржу",
  },
  home: {
    terminal: {
      eyebrow: "Терминал iHaleal",
      prompt: "Чем мы можем помочь?",
      askPlaceholder: "Спросите что угодно…",
      askSubmit: "Спросить",
      options: {
        rent: "АРЕНДА",
        sale: "ПРОДАЖА",
        auction: "АУКЦИОН",
        launch: "ЗАПУСК",
      },
      borsaCta: "Перейти на терминал биржи →",
      aiUnavailable:
        "ИИ-ассистент временно недоступен (ожидается квота или настройка). Воспользуйтесь быстрыми ссылками ниже.",
      hints: [
        "Как сделать ставку на аукционе? → /nasil-calisir",
        "Прямые торги → /ihaleler",
        "Терминал биржи → /borsa",
      ],
    },
  },
  onboarding: {
    title: "Добро пожаловать!",
    subtitle: "С чего хотите начать?",
    back: "Назад",
    skip: "Пропустить →",
    skipNote: "Это можно изменить в любое время.",
    discover: {
      title: "Исследовать",
      subtitle: "Просматривайте аукционы, объявления и рыночные данные.",
      cta: "Смотреть аукционы",
    },
    sell: {
      title: "Продать / разместить",
      subtitle: "Выставьте недвижимость на аукцион или продажу.",
      cta: "Создать объявление",
    },
    buy: {
      title: "Купить / сделать ставку",
      subtitle: "Участвуйте в открытых торгах, ловите возможности.",
      cta: "Активные аукционы",
    },
  },
  pricing: {
    badge: "Тарифы",
    title: "Выберите подходящий тариф",
    subtitle: "5 тарифов — от частного лица до корпоративного — повышайте, понижайте или отменяйте в любое время.",
    yearlyDiscountNote: "Скидка при годовой оплате",
    chips: { noCommit: "Без обязательств", cancelAnytime: "Отмена в любой момент", noHidden: "Без скрытых платежей" },
    segmentTitle: "Какой тариф вам подходит?",
    segments: {
      individual: { title: "Частный покупатель/продавец", desc: "Продажа дома, выставление на аукцион или покупка с аукциона. Достаточно частного тарифа." },
      investor: { title: "Инвестор", desc: "Для регулярных инвестиционных решений — терминал биржи + безлимитные отчёты + реальные данные закрытий + ИИ-уведомления о возможностях." },
      realtor: { title: "Риелтор / агентство", desc: "Новое агентство → Старт, растущее профессиональное агентство → Pro. Продвижение + приоритет + управление командой." },
      corporate: { title: "Корпоративный", desc: "Сеть агентств, портфельные фонды, застройщики → API + мини-сайт + PDF white-label + 10 мест + приоритетная поддержка." },
    },
    toggle: { monthly: "Ежемесячно", yearly: "Ежегодно" },
    tierCard: {
      free: "Бесплатно",
      early: "Основатель",
      feeNote: "(списание в ₺)",
      monthlyEqv: "/мес (за год −20%)",
      dailyPrefix: "≈ в день",
      showAll: "Все функции",
      hideDetails: "Скрыть детали",
      ctaFree: "Начать бесплатно",
      ctaSelect: "Выбрать тариф",
      cancelNote: "Отмена в любое время — без договора",
      corporateNote: "Свяжитесь для демо и индивидуального предложения",
    },
    yearlySavings: "Общая экономия при годовой оплате",
    trustHeader: "Доверие, возврат и частые вопросы",
    refundTitle: "Политика возврата",
    refund: {
      d14: "Возврат в течение 14 дней: полный возврат для новых подписок в первые 14 дней (Закон о защите потребителей Турции, ст. 16 — дистанционная продажа).",
      cancel: "Отмена в любое время: без договора, завершите активный период, отключите автопродление.",
      upgrade: "Повышение/понижение тарифа: вступает в силу немедленно; разница рассчитывается пропорционально.",
      delete: "Удаление аккаунта: данные анонимизируются в течение 30 дней согласно турецкому закону KVKK (счета хранятся 10 лет по закону).",
    },
    faqTitle: "Частые вопросы",
    faq: {
      paymentQ: "Как происходит оплата?",
      paymentA: "iyzico / PayTR (скоро). Кредитная карта + банковский перевод. 3D Secure обязателен.",
      commissionQ: "Как работает комиссия?",
      commissionA: "2% покупатель + 2% продавец = всего 4% (без НДС). НДС 20% на комиссию. Законный максимум: Положение о торговле недвижимостью, ст. 20.",
      priceQ: "Изменятся ли цены?",
      priceA: "В период рыночного тестирования — пока эти цены. Цены текущих подписчиков фиксированы на 12 месяцев.",
      kvkkQ: "Соответствие KVKK?",
      kvkkA: "Полное соответствие — Supabase EU Франкфурт, уведомление о нарушениях в течение 72 часов, удаление данных за 30 дней.",
    },
    legalTitle: "Юридическая база",
    legal: {
      distanceSale: { title: "Дистанционная продажа", desc: "Закон Турции о защите потребителей 6502, ст. 48 — 14-дневное право отказа при письменном уведомлении." },
      kvkk: { title: "Соответствие KVKK", desc: "Закон Турции о защите персональных данных 6698 — хранение данных, анонимизация, уведомление о нарушениях 72 часа." },
      payment: { title: "Платёжные услуги", desc: "Закон Турции о платёжных услугах 6493 — совместимо с эскроу." },
    },
    trustBadges: { refund: "Возврат за 14 дней", cancel: "Отмена в любой момент", compliant: "KVKK + 6493 соответствие", noContract: "Без договора" },
    corporateTitle: "Корпоративное предложение или индивидуальный договор?",
    corporateDesc: "50+ пользователей / API / мини-сайт / PDF white-label — свяжитесь для индивидуального тарифа.",
    corporateCta: "Связаться",
  },
  payment: {
    start: {
      back: "К тарифам",
      title: "Оплата",
      demoSubtitle: "Демо / Mock — реальная интеграция оплаты будет добавлена (iyzico / PayTR).",
      sandboxBannerTitle: "Тестовый режим (Sandbox)",
      sandboxBannerBody: "Сейчас оплата работает в тестовой среде iyzico. После отправки формы вызывается Supabase Edge function payments-iyzico и создаётся запись подписки — реальные деньги не списываются. Для production-режима необходимо добавить IYZICO_API_KEY и IYZICO_SECRET_KEY в secrets Supabase.",
      prodBannerTitle: "Production — реальная оплата активна",
      prodBannerBody: "Интеграция iyzico Merchant активна. После отправки формы вас перенаправит на 3D Secure. Данные карты НИКОГДА не попадают на серверы iHaleal (соответствие PCI-DSS).",
      errors: {
        alreadySubscribed: "На этом аккаунте уже есть активная подписка. Сначала отмените её.",
        unauthorized: "Необходимо войти в аккаунт.",
        generic: "Не удалось начать оплату",
      },
      cardSectionTitle: "Данные карты",
      cardName: "Имя на карте",
      cardNumber: "Номер карты",
      cardExpiry: "Срок (ММ/ГГ)",
      cardCvc: "CVC",
      cardNamePlaceholder: "IVAN IVANOV",
      cardNumberPlaceholder: "0000 0000 0000 0000",
      cardExpiryPlaceholder: "12/28",
      cardCvcPlaceholder: "123",
      acceptKvkk: "Я прочитал(а) и принимаю Уведомление о защите персональных данных (KVKK). Принимаю условия оплаты и подписки (14 дней на отказ + право отмены по закону Турции).",
      payBtn: "оплатить (демо)",
      paying: "Обработка...",
      pciNote: "3D Secure + KVKK + Закон 6493 — данные карты не сохраняются, токенизируются банком напрямую.",
      summarySelected: "Выбранный тариф",
      summaryPeriod: "Период оплаты",
      summaryListingLimit: "Лимит объявлений",
      summaryTeam: "Команда",
      summaryTotal: "Итого",
      summaryFxRef: "Справочно",
      feeNote: "(списание в ₺)",
      guaranteesTitle: "Гарантии",
      guarantees: {
        d14: "Возврат за 14 дней (закон Турции)",
        cancel: "Отмена в любое время",
        kvkk: "KVKK + 6493 соответствие",
        ssl: "SSL + 3D Secure",
      },
      autoRenewalTitle: "Автопродление и отмена",
      autoRenewal: {
        renewal: "Продление: подписка автопродлевается в конце каждого периода. Уведомление по e-mail отправляется за 7 дней до продления.",
        cancel: "Отмена: можно отменить в любое время. Веб: Моё членство → \"Отменить подписку\". iOS: Настройки → Apple ID → Подписки. Android: Google Play → Профиль → Подписки.",
        refund: "Возврат: полный возврат в первые 14 дней (закон Турции 6502 ст. 48). Функции тарифа активны до конца оплаченного периода.",
      },
      autoRenewalLaw: "Нормативная база: Закон Турции 6502 ст. 48 + KVKK 6698 + Закон 6493 + условия Apple/Google (мобильные приложения).",
      corporateTitle: "Корпоративное предложение?",
      corporateDesc: "Команда 10+, API, мини-сайт — свяжитесь для индивидуального тарифа.",
      cycleMonthly: "Ежемесячно",
      cycleYearly: "Ежегодно",
      footerDemo: "Эта страница — ДЕМО. Реальная интеграция оплаты (iyzico / PayTR) будет добавлена, когда Master предоставит ключи мерчанта и API.",
    },
    success: {
      title: "Добро пожаловать!",
      activated: "тариф активирован.",
      activeBadge: "Активный тариф",
      listingLimit: "Лимит объявлений",
      teamSeats: "Места в команде",
      refundLabel: "Отмена/возврат",
      refundValue: "14 дней бесплатно",
      unlimited: "Без ограничений",
      sandboxTitle: "Подтверждение оплаты (Sandbox)",
      sandboxBody: "Эта оплата прошла через iyzico sandbox — реальные деньги не списаны (тестовая среда). Подписка сохранена в таблице Supabase subscriptions, премиум-функции активированы. Для production-режима ключи iyzico merchant API должны быть добавлены Master как secrets.",
      feeNote: "(списание в ₺)",
      manageMembership: "Управление членством",
      openExchange: "Открыть терминал биржи",
      invoiceSent: "Счёт отправлен на support@ihaleal.com (mock).",
      questions: "Вопросы",
    },
  },
  listingDetail: {
    back: "Назад",
    favoriteAdd: "Добавить в избранное",
    favoriteRemove: "Удалить из избранного",
    compareLabel: "Сравнить",
    printLabel: "Печать",
    openMap: "Открыть карту",
    pdfReport: "Отчёт индекса iHaleal",
    badgeRent: "Аренда",
    badgeSale: "Продажа",
    badgeAuction: "Аукцион",
    badgeSealed: "Закрытая ставка",
    priceCurrentBid: "Текущая ставка",
    priceListing: "Цена объявления",
    priceStartingBid: "Стартовая / запрашиваемая",
    estimatedValueTitle: "Оценочная стоимость (ИИ · примерно)",
    estimatedAbove: "% выше оценочной",
    estimatedBelow: "% ниже оценочной",
    verifiedListing: "Проверенное объявление",
    feeNote: "(списание в ₺)",
    ctaBid: "Сделать ставку",
    ctaSealedBid: "Закрытая ставка",
    ctaSealedBidShort: "Закрытая",
    ctaNegotiate: "Предложение / переговоры",
    ctaInfoRequest: "Запрос информации",
    ctaBuyNow: "Купить сейчас",
    ctaBidSubmitting: "Отправка...",
    ctaBidSubmit: "Отправить ставку",
    ctaSealedSubmit: "Отправить закрытую ставку",
    mobileBidShort: "Ставка",
    tabFeatures: "Характеристики",
    tabLocation: "Местоположение",
    auctionEnded: "Аукцион завершён",
    loginRequired: "Необходимо войти",
    reportApproval: "Сначала одобрите отчёт ИИ",
    depositRequired: "Требуется предавторизация",
    cantBidOwn: "Нельзя делать ставку на своё объявление",
    activeListing: "Активное объявление",
    featuresListMissing: "Список характеристик отсутствует.",
    bidLoginRequired: "Войдите, чтобы сделать ставку.",
    bidAcceptRequired: "Отметьте все договорные и заявленные пункты, чтобы отправить ставку.",
    // ── 11-G ──
    loading: "Загрузка объявления…",
    notFoundTitle: "Объявление не найдено",
    notFoundDesc:
      "Объявление, которое вы ищете, могло быть удалено, ссылка может быть недействительной или объявление никогда не существовало. Вы можете посмотреть открытые аукционы или найти новое объявление на странице поиска.",
    notFoundBackAuctions: "К аукционам",
    notFoundSearch: "Страница поиска",
    bcHome: "Главная",
    bcListings: "Объявления",
    bcListingFallback: "Объявление",
    cityAreaListingsSuffix: "— объявления по региону",
    badgeLive: "Идёт",
    badgeUpcoming: "Скоро",
    badgeLansman: "🏗️ СТАРТ ПРОДАЖ",
    viewCountSuffix: "просмотров",
    lansmanUnitBadge: "🏗️ Юнит проекта",
    lansmanCardTitle: "Это объявление — юнит проекта на старте продаж",
    lansmanDeveloperLabel: "Проект застройщика:",
    lansmanProjectFallback: "Проект на старте продаж",
    lansmanUnitPrefix: "Юнит",
    lansmanProjectPage: "Страница проекта",
    weeklyScheduleTitle: "Еженедельный календарь аукционов (цель)",
    participationDocsLabel: "Документы и категории для участия:",
    participationDocsNote:
      "(удостоверение личности, Findeks, оценка, выписка из тапу, залог и т. д.; окончательное юридическое слово — за договором и юристом).",
    priceCardAiPredicted: "Прогноз ИИ",
    priceCardInvestmentScore: "Инвест-балл",
    marketReportBtn: "Индекс iHaleal — анализ рыночного отчёта",
    officialDocsBtn: "Официальные документы (зонирование, муниципалитет…)",
    aiRecoTitle: "Рекомендация ИИ по покупке",
    aiRecoStrongBuy: "Сильная возможность для покупки. Цена ниже прогноза ИИ.",
    aiRecoBuy: "Разумная возможность для покупки.",
    aiRecoHold: "Разумнее подождать.",
    aiRecoAvoid: "Будьте осторожны, цена высокая.",
    tabOverview: "Обзор",
    tabDetails: "Детали",
    tabPriceHistory: "История цен",
    tabAi: "ИИ-анализ",
    tabMandatory: "ОБЯЗАТЕЛЬНО",
    countdownEnded: "Аукцион завершён",
    countdownUpcomingLabel: "До старта",
    countdownLastHour: "ПОСЛЕДНИЙ ЧАС",
    countdownRemaining: "До конца",
    countdownDays: "Дней",
    countdownHours: "Часов",
    countdownMinutes: "Минут",
    countdownSeconds: "Секунд",
    estValueBelowText: "На {pct}% ниже оценочной стоимости",
    estValueAboveText: "На {pct}% выше оценочной стоимости",
    depositDemo: "Блокировка (демо)",
    evaluateSeller: "Оценить продавца",
    supportEmail: "Запрос в поддержку (эл. почта)",
    expertOpinion: "Получить мнение эксперта",
    expertOpinionDesc: "Запросите профессиональный отчёт об оценке",
    commissionTitle: "Калькулятор комиссии",
    commissionRefListing: "Сумма объявления (справочно)",
    commissionRefAuction: "Сумма аукциона / ставки (оценочно)",
    commissionPlatformBuyer: "Платформа (покупатель)",
    commissionVat: "НДС (платформа)",
    commissionDeedDuty: "Пошлина за тапу",
    commissionRevolvingCapital: "Оборотный сбор",
    commissionTotal: "Итоговая стоимость",
    commissionDetailLink: "Подробно о структуре комиссии",
    securityTitle: "Проверка безопасности",
    secIdentity: "Обязательная проверка личности",
    secFindeks: "Проверка кредитного рейтинга Findeks",
    sec2fa: "Двухэтапная проверка по SMS",
    secBankApi: "Гарантия оплаты через банковский API",
    secAmlKyc: "Соответствие AML/KYC",
    secLawNote: "ihaleal.com работает в рамках Закона № 7263.",
    // ── 11-G-2 ──
    ovProfRules: "Профессиональные правила (кратко)",
    ovCommitmentTitle: "Диапазон лимита обязательства (продавец / арендодатель)",
    ovCommitmentFloor: "Нижний:",
    ovCommitmentCeiling: "Верхний:",
    ovCommitmentNote:
      "— при достижении верхнего предела обязательство по сделке и база комиссии закрепляются в договоре (цель). Симметричные правила действуют для покупателя и арендатора в одном пакете.",
    ovCommitmentPending: "Подтверждение обязательства записано; значения лимитов финализируются в продакшене.",
    ovExpertiseTitle: "Отчёт об оценке (отметка / ипотека / арест)",
    ovExpertiseRequiredNote: "В этом объявлении есть заявление об обязательной оценке. ",
    ovExpertiseFileLabel: "Файл (демо):",
    ovExpertiseFileNote:
      "PDF проверяется в продакшене; против риска подделки предусмотрены предварительная ИИ-проверка + одобрение человеком.",
    ovDescriptionTitle: "Описание",
    ovDetailRoom: "Комнаты",
    ovDetailNetSqm: "Чистая м²",
    ovDetailFloor: "Этаж",
    ovDetailBuildingAge: "Возраст здания",
    ovVirtualTourTitle: "360° Виртуальный тур",
    ovVirtualTourDesc: "Вы можете осмотреть эту недвижимость виртуально.",
    ovVirtualTourStart: "Начать виртуальный тур",
    detRoomLiving: "Комнаты + гостиная",
    detGrossSqm: "Общая м²",
    detNetSqm: "Чистая м²",
    detCurrentFloor: "Этаж",
    detTotalFloors: "Всего этажей",
    detBuildingAge: "Возраст здания",
    detBuildingAgeUnit: "лет",
    detHeating: "Отопление",
    detFacade: "Фасад",
    detBathroom: "Санузел",
    detBalcony: "Балкон",
    detElevator: "Лифт",
    detParking: "Парковка",
    detFurnished: "С мебелью",
    detUsage: "Статус занятости",
    detDeedStatus: "Статус тапу",
    detEligibility: "Пригодность",
    locNearby: "Поблизости",
    locDistanceSuffix: "до объекта",
    locMapLoading: "Загрузка карты…",
    locMapFallbackNote: "Точное местоположение отсутствует; карта показана по центру {city}.",
    aiGateNote: "Чтобы сделать ставку, сначала одобрите отчёт, затем завершите предавторизационную блокировку.",
    aiRadarScore: "Балл",
    aiCommentTitle: "Комментарий ИИ",
    aiCommentUnder:
      "По нашей ИИ-модели оценки этот объект оценён на {pct}% ниже его стоимости. Средняя цена за м² в районе {location} составляет ₺{avgSqm}, тогда как это объявление выставлено по ₺{sqm} / м².",
    aiCommentFair:
      "По нашей ИИ-модели оценки этот объект оценён близко к среднерыночному уровню. Индекс спроса {demand}/100.",
    aiBadgeRentalYield: "Доходность аренды",
    aiBadgeDemandIndex: "Индекс спроса",
    aiBadgeYearlyGrowth: "Годовой рост",
    aiRegionStatsTitle: "Статистика района",
    statAvgSqmPrice: "Ср. цена за м²",
    statMonthlyChange: "Изменение за месяц",
    statYearlyChange: "Изменение за год",
    statAvgDaysOnMarket: "Ср. срок продажи",
    statDaysUnit: "дн.",
    aiSuggestTitle: "ИИ-совет по ставке",
    aiSuggestThinking: "Думает…",
    aiSuggestRetry: "Спросить ещё",
    aiSuggestGet: "Получить совет",
    aiSuggestError: "Совет ИИ сейчас недоступен. Попробуйте через несколько минут.",
    aiSuggestPlaceholder:
      "Одним кликом ИИ генерирует рекомендуемый диапазон ставки, его обоснование и точки риска для этого объекта.",
    expPanelTitle: "Отчёт об оценке",
    expPanelPreparing: "Подготовка…",
    expPanelDownload: "Скачать PDF",
    expPanelDesc:
      "Описание объекта, оценка цены, анализ района, характеристики и окружающая инфраструктура — профессиональная PDF-сводка.",
    // ── 11-G-3 ──
    cancel: "Отмена",
    bidCostTitle: "Ориентировочная итоговая стоимость (включая комиссию и пошлины)",
    bidCostNote: "Платформа покупателя: fees.ts · пошлина за тапу %{pct} + фиксированный сбор (демо)",
    bidAmountLabel: "Сумма ставки (₺)",
    bidAmountPlaceholder: "напр.: 3000000 или 3.000.000",
    proxyTitle: "Автоматическая ставка (прокси-ставка)",
    proxyDesc: "От вашего имени автоматически повышает ставку до вашего максимума по мере поступления ставок других.",
    proxyEnableAria: "Включить автоматическую ставку",
    proxyMaxLabel: "Максимальная сумма ставки (₺)",
    proxyMaxPlaceholderPrefix: "напр.:",
    proxyDemoNote:
      "Демо: максимальная сумма сохраняется локально (предпочтение пользователя). Автоповышение включится после завершения серверной части (таблица auction_proxy_bids + RLS + совместимость с закрытым маскированием). Сейчас отправка обрабатывается как обычная ставка в один клик.",
    bidGateTitle: "Обязательные согласия",
    bidGateTooltip: "Отметьте все поля согласия",
    toastAuctionEnded: "Этот аукцион завершён.",
    toastInvalidBid: "Введите корректную сумму ставки (целое положительное число, в разумных пределах).",
    toastMinBid: "Ставка должна быть не менее ₺{amount}.",
    toastBidGate: "Сначала одобрите отчёт ИИ, затем завершите шаг залога (предавторизации).",
    toastDuplicate: "Эта ставка уже зарегистрирована.",
    toastBidSaved: "Ставка зарегистрирована: ₺{amount}",
    toastDemoBid:
      "Демо-объявление: ставка не записывается в базу данных. На реальных аукционах (Supabase UUID) ставка хранится на сервере.",
    toastOfferSubmitted: "Ваше предложение зарегистрировано. Вы можете отслеживать его в панели «Мои предложения».",
    toastLogin: "Войдите в аккаунт.",
  },
  borsa: {
    marketTicker: "Лента рынка",
    marketSummary: "Сводка рынка",
    totalVolume: "Общий объём",
    tradeCount: "Количество сделок",
    activeOrders: "Активные заявки",
    openClose: "Открытие/Закрытие",
    marketBreadth: "Широта рынка",
    bidStream: "Поток ставок",
    orderBookPreviewMasked: "Книга заявок (предпросмотр, маскированная)",
    marketDataSummary: "Сводка рыночных данных",
    bidder: "Участник",
    portfolioEyebrow: "Биржа · портфель",
    portfolioTitle: "Терминал портфеля",
    portfolioDesc: "Управляйте активами портфеля под защитой: аукцион, фиксированная продажа, аренда, обмен и переуступка — в одной панели.",
    totalPurchase: "Сумма покупки",
    currentValue: "Текущая стоимость",
    pnlLabel: "Прибыль/Убыток (%)",
    portfolioTrend: "Тренд портфеля",
    distributionSegment: "Распределение · Сегмент",
    distributionRegion: "Распределение · Регион",
    tooltipValue: "Стоимость",
    periodPrefix: "Период",
    auditableLog: "Проверяемый журнал транзакций",
    encrypted: "Зашифровано",
    howSecure: "Как обеспечена безопасность?",
    verified: "Проверено",
    watchlistEyebrow: "Терминал отслеживания",
    watchlistTitle: "Список отслеживания + Центр уведомлений",
    watchAdd: "Отслеживать",
    watchRemove: "Прекратить отслеживание",
    watchAddedToast: "Добавлено в список отслеживания.",
    watchRemovedToast: "Удалено из списка отслеживания.",
    high24: "Макс. за 24ч",
    low24: "Мин. за 24ч",
    volumeLabel: "Объём",
    orderBook: "Книга заявок (Order Book)",
    bidColumn: "Покупка",
    askColumn: "Продажа",
    priceColumn: "Цена",
    maLabel: "MA(5)",
  },
  megaMenu: {
    segmentInvestor: "Инвестор",
    segmentRealtor: "Риелтор",
    segmentContractor: "Подрядчик",
    liveAuctions: "Прямые аукционы",
    aiValuation: "ИИ-оценка",
    investorPanel: "Панель инвестора",
    rewards: "Награды",
    campaigns: "Акции",
    intlInvestor: "Международный инвестор",
    realtorShowcase: "Витрина риелтора",
    officePanel: "Панель офиса",
    realtorLogin: "Вход для риелтора",
    b2bPartnership: "B2B-партнёрство",
    contractorLaunch: "Запуск подрядчика",
    projectPanel: "Панель проектов",
    openAuction: "Открыть аукцион",
    floorBarter: "Бартер этажей",
  },
  footer: {
    tagline: "ИИ-оценка, прозрачный процесс аукциона и безопасная инфраструктура сделок.",
    taglineShort: "ИИ-платформа недвижимости",
    workingHours: "Будние дни 09:00 — 18:00 (UTC+3)",
    colPlatform: "Платформа",
    colTools: "Инструменты",
    colCorporateLegal: "Корпоративное и юридическое",
    colNewsletter: "Рассылка",
    newsletterDesc: "Будьте первыми, кто узнаёт о новых аукционах.",
    newsletterPlaceholder: "Электронная почта",
    newsletterSubmit: "Подписаться",
    allRightsReserved: "Все права защищены.",
    langLabel: "Язык",
    auctionsLink: "Аукционы",
    aiAnalysis: "ИИ-анализ",
    compare: "Сравнить",
    revenueModel: "Модель дохода",
    mortgage: "Ипотека",
    favorites: "Избранное",
    realtorLoginFooter: "Вход для риелтора",
    realtorPartnership: "Партнёрство риелторов",
    researchTerminal: "Исследовательский терминал",
    priceEstimate: "Оценка цены",
    loanCalculator: "Кредитный калькулятор",
    listingCompare: "Сравнение объявлений",
    cityGuide: "Гид по городам",
    howItWorksFooter: "Как это работает",
    platformGuide: "Руководство по платформе",
    commissionCalc: "Калькулятор комиссии",
    taxSimulator: "Налоговый симулятор",
    financeCompliance: "Финансы / комплаенс",
    legalHub: "Юридический хаб (всё)",
    auctionTermsCommission: "Условия аукциона и комиссия",
    participationDocs: "Документы для участия",
    kvkkInfo: "Уведомление KVKK",
    termsOfUse: "Условия использования",
    privacyPolicy: "Политика конфиденциальности",
    cookiePolicy: "Политика использования cookie",
    distanceSaleAgreement: "Договор дистанционной продажи",
    refundCancellation: "Возврат и отмена",
    disclosure: "Уведомление об обработке данных",
    contactFooter: "Контакты",
    aboutUs: "О нас",
    sitemap: "Карта сайта",
    faqFooter: "Частые вопросы",
    securityCenter: "Центр безопасности",
    sellerMode: "Режим продавца",
    commissionModel: "Модель комиссии",
    ihalealIndex: "Индекс iHaleal",
  },
  tierData: {
    byId: {
      free: { name: "Частный", tagline: "Отслеживание аукционов + 1 бесплатное объявление" },
      yatirimci: { name: "Инвестор", tagline: "Полный терминал биржи + безлимитные отчёты" },
      emlak_baslangic: { name: "Старт риелтора", tagline: "Начинающий риелтор / небольшой офис" },
      emlak_pro: { name: "Профи риелтор", tagline: "Профессиональное агентство — рост" },
      kurumsal: { name: "Корпоративный", tagline: "Сети агентств + портфельные фонды + подрядчики" },
    },
  },
  loanValuation: {
    back: "Назад",
    loanTitle: "Ипотечный калькулятор",
    loanSubtitle: "Оценка ежемесячного платежа и общей суммы выплат на основе суммы кредита, срока и месячной процентной ставки (в информационных целях).",
    loanAmount: "Сумма кредита (₺)",
    monthlyRate: "Месячная процентная ставка (%)",
    termLabel: "Срок",
    yearLabel: "г.",
    monthlyInstallment: "Ежемесячный платёж",
    totalRepayment: "Общая сумма выплат",
    totalInterest: "Общие проценты",
    loanAmountField: "Сумма кредита",
    downPayment: "Первоначальный взнос",
    propertyValue: "Стоимость недвижимости",
    loanDisclaimerEqual: "Расчёт основан на формуле равных платежей; сборы за оформление, страхование и банковские акции не учтены. Для окончательного предложения обратитесь в свой банк.",
    loanDisclaimerInfo: "Только в информационных целях.",
    widgetTitle: "Рассчитать кредит для этого объявления",
    widgetEstimate: "оценка:",
    widgetCalculate: "Рассчитать",
    widgetBankNote: "В информационных целях; требуется одобрение банка.",
    valuationTitle: "Оценка недвижимости",
    estimatedValueApprox: "Оценочная стоимость (примерно)",
    confidenceRange: "Доверительный диапазон",
    uncertaintyBand: "Полоса неопределённости",
    modelScore: "Оценка модели",
    modelScoreHigh: "Высокая",
    modelScoreMedium: "Средняя",
    shapTitle: "Разбор вклада SHAP",
    shapImpact: "Влияние",
    layerSummary: "Сводка слоёв",
    startValuation: "Начать оценку",
    resetForm: "Сбросить форму",
    disclaimerInfo: "В информационных целях",
    disclaimerNotOffer: "Не является окончательным предложением",
    disclaimerApprox: "Примерно",
  },
  mortgage: {
    title: "Ипотека / Кредитный калькулятор",
    subtitle: "Рассчитайте ежемесячный платёж и общую стоимость при покупке недвижимости.",
    loanParameters: "Параметры кредита",
    propertyValueLabel: "Стоимость недвижимости",
    downPaymentPercent: "Размер первоначального взноса",
    downPaymentValue: "Первоначальный взнос",
    loanValue: "Кредит",
    termSelect: "Срок",
    yearShort: "год",
    monthShort: "мес",
    annualRate: "Годовая процентная ставка",
    bankRequirements: "Требования банка",
    minMonthlyIncome: "Мин. ежемесячный доход",
    minLabel: "Мин",
    maxLabel: "Макс",
    loanToValueRatio: "Соотношение кредита к стоимости",
    loanSummary: "Сводка по кредиту",
    subEvenPay: "Равный платёж",
    subOfCost: "от стоимости",
    paymentPlanGraphTitle: "График платежей — Остаток долга",
    monthSuffix: "мес",
    remainingDebt: "Остаток долга",
    totalInterestLegend: "Общие проценты",
    yearlyPaymentSummary: "Сводка платежей по годам",
    everyYearEnd: "Конец каждого года",
    yearColumn: "Год",
    principalColumn: "Основной долг",
    interestColumn: "Проценты",
    remainingColumn: "Остаток долга",
    yearRowPrefix: " год",
    tipLowInterestTitle: "Советы по снижению процентов",
    tipLowInterestDesc: "Выбор более короткого срока снижает общую стоимость процентов. Срок 5 лет вместо 10 лет экономит около 40% процентов.",
    tipDownPaymentTitle: "Увеличение первоначального взноса",
    tipDownPaymentDesc: "Увеличение первоначального взноса до 30% снижает ежемесячный платёж примерно на 15% и уменьшает общую стоимость процентов на 25%.",
    disclaimer: "* Этот расчёт носит информационный характер. Фактические условия кредита могут отличаться в зависимости от банка и вашей кредитной истории.",
  },
  valuationForm: {
    headerSubtitle: "Демо-данные / предварительный анализ: гедонический + сравнительный + пространственная коррекция работают вместе.",
    explainableModel: "Объяснимая модель",
    cityLabel: "Город",
    districtLabel: "Район",
    districtNoData: "Нет данных по району",
    grossM2Label: "Площадь брутто (м²)",
    roomCountLabel: "Количество комнат",
    floorLabel: "Этаж",
    totalFloorsLabel: "Всего этажей",
    buildingAgeLabel: "Возраст здания",
    heatingLabel: "Отопление",
    heatingDistrict: "Центральная система",
    heatingCentral: "Центральное на квартиру",
    heatingCombi: "Двухконтурный котёл",
    heatingUnderfloor: "Тёплый пол",
    heatingStove: "Печное",
    locationTierLabel: "Качество местоположения",
    tierPrime: "Премиум",
    tierStrong: "Сильное",
    tierBalanced: "Сбалансированное",
    tierEmerging: "Развивающееся",
    conditionLabel: "Физическое состояние",
    conditionNew: "Новое",
    conditionGood: "Хорошее",
    conditionNeedsRenovation: "Требует ремонта",
    transactionTypeLabel: "Тип сделки",
    txSale: "Стоимость продажи",
    txRent: "Стоимость аренды",
    hasElevator: "Лифт",
    hasParking: "Парковка",
    errorTotalFloorsMin: "Всего этажей должно быть не менее 1.",
    errorFloorNegative: "Этаж не может быть отрицательным.",
    finalReviewBanner: "Предварительная оценка завершена. Для официальной оценки требуется подтверждение лицензированного оценщика SPK (TDUB).",
    startValuationCta: "Начать оценку",
  },
  dataAnalysis: {
    eyebrow: "Терминал данных / анализа",
    title: "Обзор рынка + панель средних цен",
    subtitle: "Отслеживайте историю средних цен по региону/сегменту, сравнение «актив против среднего» и тепловую карту глубины — на одном экране.",
    bannerWarning: "Показанные значения — это средние цены в ₺ по региону/сегменту (не официальная статистика; индикатор, рассчитанный из демо-данных платформы). Реальный балл индекса iHaleal смотрите на главной странице биржи.",
    avgPriceHistory: "История средних цен (₺)",
    regionAvg: "Средняя цена по региону (₺)",
    segmentAvg: "Средняя цена по сегменту (₺)",
    platformAvg: "Среднее по платформе (₺)",
    captionSelected: "Выбранный регион",
    assetVsPlatform: "Актив против среднего по платформе (₺)",
    assetPriceSuffix: "цена (₺)",
    comparisonSelection: "Выбор для сравнения",
    segmentTrendAnalysis: "Анализ трендов сегмента",
    volumeLabel: "Объём",
    volumeUnit: "лот",
    depthScore: "Балл глубины",
    marketShare: "Доля рынка",
    regionHeatmap: "Тепловая карта регионов",
    downloadReport: "Скачать отчёт (демо)",
    avgPriceShort: "Ср. цена",
    demoReportFootnote: "Скачиваемый отчёт является демонстрационным; для профессиональных инвестиционных решений требуется мнение независимого финансового/юридического консультанта.",
    segmentResidential: "Жилая",
    segmentLand: "Земля",
    segmentCommercial: "Коммерческая",
    segmentTourism: "Туристическая",
  },
  gesForm: {
    stepLabel: "Шаг",
    step1Title: "Местоположение и участок",
    city: "Город",
    district: "Район",
    neighborhood: "Квартал",
    adaParcel: "Квартал / Участок",
    adaPlaceholder: "Квартал",
    parcelPlaceholder: "Участок",
    totalAreaM2: "Общая площадь (м²)",
    solarIrradiance: "Солнечное излучение (кВт·ч/м²)",
    continueBtn: "Продолжить",
    step2Title: "Сеть и регулирование",
    preScore: "Предв. балл",
    trafoDistance: "Расстояние до подстанции (км)",
    trafoCapacity: "Мощность подстанции (МВт)",
    slopeDegree: "Уклон (градусы)",
    slopeAspect: "Экспозиция",
    agriculturalClass: "Сельскохозяйственный класс",
    chkMarginal: "Маргинальное с/х / одобрение GEPA",
    chkCadastralRoad: "Кадастровая дорога есть",
    chkSitConflict: "Конфликт с охраняемой зоной (SIT)",
    chkMilitaryZone: "Военная запретная зона",
    chkArchaeological: "Археологический памятник",
    backBtn: "Назад",
    computingBtn: "Расчёт...",
    completeBtn: "Завершить оценку",
    retryBtn: "Повторить",
    errSubmit: "Не удалось отправить оценку.",
    scoreLabel: "Балл",
    capacityLabel: "Мощность",
    annualLabel: "Годовая",
    capexLabel: "CAPEX",
    paybackLabel: "Окупаемость",
    paybackYearSuffix: "г.",
    paybackDefaultPriceNote: "(базовая цена)",
    newEvaluation: "Новая оценка",
    statusHigh: "Высокая осуществимость",
    statusReject: "Технический отказ",
    statusSubmitted: "Передано инвесторам",
    statusEngineering: "Инженерный расчёт",
    statusGathering: "Сбор данных",
  },
  dashboard: {
    back: "На главную",
    title: "Панель аккаунта",
    subtitle: "Ярлыки на основе выбранных вами потоков (демо; без бэкенда).",
    changeFlows: "Изменить потоки",
    cardListingsTitle: "Мои объявления",
    cardListingsBody: "Цены пакетов — заглушки в `fees.ts` (§D-K8).",
    cardListingsCta: "Центр продавца",
    cardAuctionTitle: "Открыть аукцион",
    cardAuctionBody: "Поток B — права и документы (демо).",
    cardAuctionCta: "Создать аукцион",
    cardBidsTitle: "Мои ставки / залог",
    cardBidsBody: "Findeks, AML, гарантия ставки — production в K3.",
    cardBidsCta: "Список документов",
    cardFavoritesTitle: "Избранное",
    cardFavoritesCta: "Избранные объявления",
    cardSavedSearchTitle: "Сохранённые запросы",
    cardSavedSearchCta: "Страница поиска",
    cardAuthorityTitle: "Документы полномочий",
    cardAuthorityCta: "e-Government (ДЕМО)",
    cardProfileTitle: "Профиль",
    cardProfileCta: "Информация об аккаунте",
    investorPortfolioNote: "Графики портфеля инвестора (избранное)",
    investorPortfolioCta: "Перейти к портфелю",
  },
  investorDashboard: {
    badge: "Инвестор",
    title: "Панель инвестора",
    subtitle: "Эффективность портфеля, ИИ-прогнозы и аналитика распределения.",
    back: "Назад к панели",
    marketAnalysis: "Анализ рынка",
    loading: "Загрузка портфеля…",
    emptyTitle: "Ваш портфель пуст",
    emptyDesc: "Просматривайте объявления и добавляйте их в избранное, чтобы создать корпоративный обзор портфеля.",
    emptyCta: "Смотреть объявления",
    kpiPortfolioValue: "Стоимость портфеля",
    kpiListingsHint: "объявлений",
    kpiPredictedValue: "Прогнозная стоимость",
    kpiAvgYield: "Сред. доходность",
    kpiAvgYieldHint: "Годовая аренда",
    kpiPotential: "Потенциал",
    kpiPotentialHint: "Прогнозная разница",
    chartGrowthTitle: "Рост стоимости портфеля",
    chartGrowthSubtitle: "Последние 6 месяцев (прогноз)",
    chartCategoryTitle: "Распределение по категориям",
    chartCategorySubtitle: "Млн ₺",
    chartYieldTitle: "Доходность и ИИ-оценка",
    chartYieldSubtitle: "По районам",
    barRentPct: "Аренда %",
    barAiScore: "ИИ-оценка",
    portfolioListings: "Объявления портфеля",
    cardCurrent: "Текущая",
    cardPredicted: "Прогноз",
    cardYield: "Доходность",
    months: ["Июн", "Июл", "Авг", "Сен", "Окт", "Ноя"],
  },
  profile: {
    guestTitle: "Профиль аккаунта",
    guestDesc: "Войдите, чтобы просмотреть информацию профиля, статус KYC и рейтинг продавца.",
    guestLogin: "Войти",
    back: "Назад",
    logout: "Выйти",
    profileUpdated: "Профиль обновлён!",
    ratingSuffix: "рейтинг",
    noRating: "Пока нет рейтинга",
    reviewSuffix: "отзывов",
    memberSince: "Участник с",
    auctionsCreated: "Открыто аукционов",
    auctionsWon: "Выиграно",
    kycStart: "Начать KYC",
    profileInfoTitle: "Информация профиля",
    edit: "Редактировать",
    cancel: "Отмена",
    fullName: "Имя и фамилия",
    emailLabel: "Эл. почта",
    phoneLabel: "Телефон",
    phoneNotSet: "Не указан",
    phoneNote: "Ваш номер телефона не отображается в объявлениях; связь осуществляется через сообщения платформы.",
    saveChanges: "Сохранить изменения",
    securityTitle: "Безопасность",
    emailVerification: "Подтверждение эл. почты",
    phoneVerification: "Подтверждение телефона",
    twoFactor: "Двухфакторная аутентификация",
    kycVerification: "Проверка личности (KYC)",
    statusVerified: "Проверено",
    statusPending: "В ожидании",
    statusSoon: "Скоро",
    accountSummaryTitle: "Сводка аккаунта",
    summaryFavorites: "Избранное",
    summarySavedSearch: "Сохранённые запросы",
    summaryActiveOffers: "Активные ставки",
    summaryGoToPanel: "Перейти к полной панели",
    notifyTitle: "Настройки уведомлений",
    notifyDesc: "Ваши настройки хранятся в браузере. Серверная интеграция уведомлений работает с push-токенами в рабочей версии.",
    notifyEmail: "Уведомление по эл. почте",
    notifyEmailDesc: "Новое совпадение, ставка, принятие/отказ",
    notifyPush: "Push в браузере",
    notifyPushDesc: "Мгновенные уведомления",
    notifyMatches: "Совпадение сохранённого запроса",
    notifyMatchesDesc: "Когда новое объявление соответствует вашим критериям",
    notifyBids: "Обновление статуса ставки",
    notifyBidsDesc: "Перебита / выиграна / встречное предложение",
  },
};

const _arOverrides: PartialDeep<Messages> = {
  nav: {
    auctions: "المزادات",
    howItWorks: "كيف يعمل",
    services: "الخدمات",
    resources: "الموارد",
    company: "الشركة",
    gesLand: "أراضي الطاقة الشمسية",
    valuation: "التقييم",
    researchHub: "مركز الأبحاث",
    corporate: "قسم الشركات",
    faq: "الأسئلة الشائعة",
    search: "ابحث عن المزادات والعقارات…",
    logIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    langEn: "الإنجليزية",
    langTr: "التركية",
    langRu: "الروسية",
    langAr: "العربية",
    borsaCta: "الذهاب إلى البورصة",
  },
  home: {
    terminal: {
      eyebrow: "محطة iHaleal",
      prompt: "كيف يمكننا مساعدتك؟",
      askPlaceholder: "اسأل أي شيء…",
      askSubmit: "اسأل",
      options: {
        rent: "للإيجار",
        sale: "للبيع",
        auction: "مزاد",
        launch: "إطلاق",
      },
      borsaCta: "الانتقال إلى محطة البورصة →",
      aiUnavailable:
        "المساعد الذكي غير متاح حالياً (في انتظار الحصة أو الإعدادات). يمكنك تجربة الروابط السريعة أدناه.",
      hints: [
        "كيف تقدّم عرضاً في المزاد؟ → /nasil-calisir",
        "المزادات المباشرة → /ihaleler",
        "محطة البورصة → /borsa",
      ],
    },
  },
  onboarding: {
    title: "مرحباً بك!",
    subtitle: "من أين تريد أن تبدأ؟",
    back: "رجوع",
    skip: "تخطّي الآن →",
    skipNote: "يمكنك تغيير هذا في أي وقت.",
    discover: {
      title: "استكشاف",
      subtitle: "تصفّح المزادات والإعلانات وبيانات السوق.",
      cta: "عرض المزادات",
    },
    sell: {
      title: "بيع / نشر إعلان",
      subtitle: "اعرض عقارك في المزاد أو للبيع.",
      cta: "إنشاء إعلان",
    },
    buy: {
      title: "شراء / تقديم عرض",
      subtitle: "شارك في المزادات المباشرة واغتنم الفرص.",
      cta: "المزادات النشطة",
    },
  },
  pricing: {
    badge: "الأسعار",
    title: "اختر الباقة المناسبة لك",
    subtitle: "5 باقات من الفرد إلى المؤسسات — يمكنك الترقية أو التخفيض أو الإلغاء في أي وقت.",
    yearlyDiscountNote: "خصم على الدفع السنوي",
    chips: { noCommit: "بدون التزام", cancelAnytime: "إلغاء في أي وقت", noHidden: "بدون رسوم خفية" },
    segmentTitle: "أيّ باقة تناسبك؟",
    segments: {
      individual: { title: "مشتري/بائع فردي", desc: "لمن يريد بيع منزله أو طرحه في المزاد أو الشراء من المزاد. باقة الفرد كافية." },
      investor: { title: "مستثمر", desc: "لاتخاذ قرارات استثمارية منتظمة — محطة البورصة + تقارير غير محدودة + بيانات إغلاق حقيقية + تنبيهات الفرص بالذكاء الاصطناعي." },
      realtor: { title: "وسيط عقاري / مكتب", desc: "مكتب جديد → باقة المبتدئ، مكتب احترافي متنامي → Pro. تعزيز + أولوية + إدارة الفريق." },
      corporate: { title: "للشركات", desc: "سلاسل المكاتب، صناديق المحافظ، المقاولون → API + موقع مصغّر + PDF بعلامة بيضاء + 10 مقاعد + دعم أولوية." },
    },
    toggle: { monthly: "شهري", yearly: "سنوي" },
    tierCard: {
      free: "مجاني",
      early: "مؤسس",
      feeNote: "(يُحصَّل بالليرة التركية)",
      monthlyEqv: "/شهر (سنوياً −20%)",
      dailyPrefix: "≈ يومياً",
      showAll: "جميع المزايا",
      hideDetails: "إخفاء التفاصيل",
      ctaFree: "ابدأ مجاناً",
      ctaSelect: "اختر الباقة",
      cancelNote: "إلغاء في أي وقت — بدون عقد",
      corporateNote: "تواصل معنا للحصول على عرض توضيحي وعرض مخصّص",
    },
    yearlySavings: "إجمالي التوفير عند الدفع السنوي",
    trustHeader: "الثقة، الاسترداد والأسئلة الشائعة",
    refundTitle: "سياسة الاسترداد",
    refund: {
      d14: "استرداد مجاني خلال 14 يوماً: استرداد كامل في أول 14 يوماً من الاشتراكات الجديدة (قانون حماية المستهلك التركي، المادة 16 — البيع عن بُعد).",
      cancel: "إلغاء في أي وقت: بدون عقد، أكمل الفترة الحالية وعطّل التجديد التلقائي.",
      upgrade: "ترقية/تخفيض: التغيير ساري الفعل فوراً؛ يُحسب الفرق بالتناسب.",
      delete: "حذف الحساب: تُجهَّل بياناتك خلال 30 يوماً وفقاً لقانون KVKK (الفواتير تُحفَظ 10 سنوات بحكم القانون).",
    },
    faqTitle: "الأسئلة الشائعة",
    faq: {
      paymentQ: "كيف تتم عملية الدفع؟",
      paymentA: "iyzico / PayTR (قريباً). بطاقة ائتمان + حوالة بنكية. 3D Secure إلزامي.",
      commissionQ: "كيف تعمل العمولة؟",
      commissionA: "2% للمشتري + 2% للبائع = 4% إجمالاً (الأساس بدون ضريبة القيمة المضافة). ضريبة القيمة المضافة 20% على العمولة. الحد الأقصى القانوني: لائحة تجارة العقارات، المادة 20.",
      priceQ: "هل ستتغيّر الأسعار؟",
      priceA: "خلال فترة اختبار السوق — هذه الأسعار حالياً. أسعار المشتركين الحاليين مثبّتة لمدة 12 شهراً.",
      kvkkQ: "الامتثال لقانون KVKK؟",
      kvkkA: "امتثال كامل — Supabase EU في فرانكفورت، إشعار بالاختراق خلال 72 ساعة، حذف البيانات خلال 30 يوماً.",
    },
    legalTitle: "الإطار القانوني",
    legal: {
      distanceSale: { title: "البيع عن بُعد", desc: "قانون حماية المستهلك التركي 6502 المادة 48 — حق الانسحاب خلال 14 يوماً بإشعار مكتوب." },
      kvkk: { title: "الامتثال لقانون KVKK", desc: "قانون حماية البيانات الشخصية التركي 6698 — حفظ البيانات، التجهيل، الإشعار بالاختراق خلال 72 ساعة." },
      payment: { title: "خدمة الدفع", desc: "قانون خدمات الدفع التركي 6493 — متوافق مع الضمان (إسكرو)." },
    },
    trustBadges: { refund: "استرداد مجاني 14 يوماً", cancel: "إلغاء في أي وقت", compliant: "متوافق مع KVKK + 6493", noContract: "بدون عقد" },
    corporateTitle: "عرض للشركات أو اتفاق مخصّص؟",
    corporateDesc: "50+ مستخدم / تكامل API / موقع مصغّر / PDF بعلامة بيضاء — تواصل معنا للحصول على باقة مخصّصة.",
    corporateCta: "تواصل معنا",
  },
  payment: {
    start: {
      back: "العودة إلى الباقات",
      title: "الدفع",
      demoSubtitle: "تجريبي / Mock — سيتم إضافة تكامل دفع حقيقي قريباً (iyzico / PayTR).",
      sandboxBannerTitle: "الوضع التجريبي (Sandbox)",
      sandboxBannerBody: "يعمل الدفع حالياً على iyzico sandbox. عند إرسال النموذج، يتم استدعاء Supabase Edge function payments-iyzico وإنشاء سجل اشتراك — لن يُخصم أي مبلغ حقيقي. للإنتاج، يجب إضافة IYZICO_API_KEY وIYZICO_SECRET_KEY إلى أسرار Supabase.",
      prodBannerTitle: "الإنتاج — الدفع الحقيقي مفعّل",
      prodBannerBody: "تكامل iyzico Merchant مفعّل. بعد إرسال النموذج، ستُحوَّل إلى صفحة 3D Secure. بيانات البطاقة لا تصل أبداً إلى خوادم iHaleal (متوافق مع PCI-DSS).",
      errors: {
        alreadySubscribed: "يوجد اشتراك نشط بالفعل على هذا الحساب. يرجى إلغاؤه أولاً.",
        unauthorized: "يجب تسجيل الدخول.",
        generic: "تعذّر بدء عملية الدفع",
      },
      cardSectionTitle: "بيانات البطاقة",
      cardName: "الاسم على البطاقة",
      cardNumber: "رقم البطاقة",
      cardExpiry: "تاريخ الانتهاء (شش/سس)",
      cardCvc: "CVC",
      cardNamePlaceholder: "AHMAD MOHAMMED",
      cardNumberPlaceholder: "0000 0000 0000 0000",
      cardExpiryPlaceholder: "12/28",
      cardCvcPlaceholder: "123",
      acceptKvkk: "لقد قرأت ووافقت على إشعار حماية البيانات الشخصية (KVKK). أوافق على شروط الدفع والاشتراك (14 يوماً للانسحاب + حق الإلغاء بموجب القانون التركي).",
      payBtn: "ادفع (تجريبي)",
      paying: "جاري المعالجة...",
      pciNote: "متوافق مع 3D Secure + KVKK + القانون 6493 — بيانات البطاقة لا تُحفَظ، يتم ترميزها مباشرة من البنك.",
      summarySelected: "الباقة المختارة",
      summaryPeriod: "فترة الدفع",
      summaryListingLimit: "حد الإعلانات",
      summaryTeam: "الفريق",
      summaryTotal: "المجموع",
      summaryFxRef: "مرجع",
      feeNote: "(يُحصَّل بالليرة التركية)",
      guaranteesTitle: "الضمانات",
      guarantees: {
        d14: "استرداد مجاني 14 يوماً (قانون تركي)",
        cancel: "إلغاء في أي وقت",
        kvkk: "متوافق مع KVKK + 6493",
        ssl: "SSL + 3D Secure",
      },
      autoRenewalTitle: "التجديد التلقائي والإلغاء",
      autoRenewal: {
        renewal: "التجديد: يتجدد الاشتراك تلقائياً في نهاية كل فترة. يُرسَل إشعار بالبريد الإلكتروني قبل التجديد بـ 7 أيام.",
        cancel: "الإلغاء: يمكنك الإلغاء في أي وقت. الويب: عضويتي → \"إلغاء الاشتراك\". iOS: الإعدادات → Apple ID → الاشتراكات. Android: Google Play → الملف الشخصي → الاشتراكات.",
        refund: "الاسترداد: استرداد كامل خلال أول 14 يوماً (قانون تركي 6502 المادة 48 الانسحاب). تبقى مزايا الباقة مفعّلة حتى نهاية الفترة المدفوعة.",
      },
      autoRenewalLaw: "اللائحة: قانون تركي 6502 المادة 48 + KVKK 6698 + القانون 6493 + شروط متجر Apple/Google (للهواتف).",
      corporateTitle: "عرض للشركات؟",
      corporateDesc: "فريق 10+، تكامل API، موقع مصغّر — تواصل للحصول على باقة مخصّصة.",
      cycleMonthly: "شهري",
      cycleYearly: "سنوي",
      footerDemo: "هذه الصفحة تجريبية. سيتم إضافة تكامل الدفع الحقيقي (iyzico / PayTR) عندما يوفّر Master الحساب التجاري ومفاتيح API.",
    },
    success: {
      title: "مرحباً بك!",
      activated: "تم تفعيل باقتك.",
      activeBadge: "الباقة النشطة",
      listingLimit: "حد الإعلانات",
      teamSeats: "مقاعد الفريق",
      refundLabel: "الإلغاء/الاسترداد",
      refundValue: "14 يوماً مجاناً",
      unlimited: "غير محدود",
      sandboxTitle: "تأكيد الدفع التجريبي",
      sandboxBody: "تم إتمام هذا الدفع عبر iyzico sandbox — لم يُخصم أي مبلغ حقيقي (بيئة اختبار). تم حفظ اشتراكك في جدول Supabase subscriptions وتفعيل مزايا premium. للتحصيل الإنتاجي، يجب أن يقوم Master بإدخال مفاتيح iyzico merchant API كأسرار.",
      feeNote: "(يُحصَّل بالليرة التركية)",
      manageMembership: "إدارة عضويتي",
      openExchange: "فتح محطة البورصة",
      invoiceSent: "تم إرسال فاتورتك إلى support@ihaleal.com (تجريبي).",
      questions: "أسئلة",
    },
  },
  listingDetail: {
    back: "رجوع",
    favoriteAdd: "إضافة إلى المفضلة",
    favoriteRemove: "إزالة من المفضلة",
    compareLabel: "مقارنة",
    printLabel: "طباعة",
    openMap: "فتح الخريطة",
    pdfReport: "تقرير مؤشر iHaleal",
    badgeRent: "للإيجار",
    badgeSale: "للبيع",
    badgeAuction: "مزاد",
    badgeSealed: "عرض مغلق",
    priceCurrentBid: "العرض الحالي",
    priceListing: "سعر الإعلان",
    priceStartingBid: "البداية / المطلوب",
    estimatedValueTitle: "القيمة التقديرية (ذكاء اصطناعي · تقريبية)",
    estimatedAbove: "% أعلى من التقديرية",
    estimatedBelow: "% أقل من التقديرية",
    verifiedListing: "إعلان موثّق",
    feeNote: "(يُحصَّل بالليرة التركية)",
    ctaBid: "تقديم عرض",
    ctaSealedBid: "تقديم عرض مغلق",
    ctaSealedBidShort: "عرض مغلق",
    ctaNegotiate: "عرض / تفاوض",
    ctaInfoRequest: "طلب معلومات",
    ctaBuyNow: "اشتر الآن",
    ctaBidSubmitting: "جارٍ الإرسال...",
    ctaBidSubmit: "إرسال العرض",
    ctaSealedSubmit: "إرسال العرض المغلق",
    mobileBidShort: "عرض",
    tabFeatures: "المواصفات",
    tabLocation: "الموقع",
    auctionEnded: "انتهى المزاد",
    loginRequired: "يجب تسجيل الدخول",
    reportApproval: "وافق على تقرير الذكاء الاصطناعي أولاً",
    depositRequired: "يلزم التفويض المسبق",
    cantBidOwn: "لا يمكنك تقديم عرض على إعلانك الخاص",
    activeListing: "إعلان نشط",
    featuresListMissing: "لا توجد قائمة مواصفات.",
    bidLoginRequired: "سجّل الدخول لتقديم عرض.",
    bidAcceptRequired: "حدّد جميع مربّعات العقد والإقرار لإرسال عرضك.",
    // ── 11-G ──
    loading: "جارٍ تحميل الإعلان…",
    notFoundTitle: "الإعلان غير موجود",
    notFoundDesc:
      "قد يكون الإعلان الذي تبحث عنه قد أُزيل، أو الرابط معطوباً، أو أنه لم يكن موجوداً أصلاً. يمكنك تصفّح المزادات المفتوحة أو العثور على إعلان جديد من صفحة البحث.",
    notFoundBackAuctions: "العودة إلى المزادات",
    notFoundSearch: "صفحة البحث",
    bcHome: "الرئيسية",
    bcListings: "الإعلانات",
    bcListingFallback: "إعلان",
    cityAreaListingsSuffix: "— إعلانات المنطقة",
    badgeLive: "جارٍ الآن",
    badgeUpcoming: "قريباً",
    badgeLansman: "🏗️ إطلاق",
    viewCountSuffix: "مشاهدة",
    lansmanUnitBadge: "🏗️ وحدة إطلاق",
    lansmanCardTitle: "هذا الإعلان وحدة ضمن مشروع قيد الإطلاق",
    lansmanDeveloperLabel: "مشروع المطوّر:",
    lansmanProjectFallback: "مشروع إطلاق",
    lansmanUnitPrefix: "وحدة",
    lansmanProjectPage: "صفحة المشروع",
    weeklyScheduleTitle: "تقويم المزادات الأسبوعي (مستهدف)",
    participationDocsLabel: "مستندات المشاركة والفئات:",
    participationDocsNote:
      "(الهوية، Findeks، التقييم، ملخص سند الملكية، التأمين، إلخ؛ الكلمة القانونية الأخيرة للعقد والمحامي).",
    priceCardAiPredicted: "تقدير الذكاء الاصطناعي",
    priceCardInvestmentScore: "درجة الاستثمار",
    marketReportBtn: "مؤشر iHaleal — تحليل تقرير السوق",
    officialDocsBtn: "المستندات الرسمية (التنظيم العمراني، البلدية…)",
    aiRecoTitle: "توصية الذكاء الاصطناعي بالشراء",
    aiRecoStrongBuy: "فرصة شراء قوية. السعر أقل من تقدير الذكاء الاصطناعي.",
    aiRecoBuy: "فرصة شراء معقولة.",
    aiRecoHold: "الانتظار أكثر منطقية.",
    aiRecoAvoid: "كن حذراً، السعر مرتفع.",
    tabOverview: "نظرة عامة",
    tabDetails: "التفاصيل",
    tabPriceHistory: "سجل الأسعار",
    tabAi: "تحليل الذكاء الاصطناعي",
    tabMandatory: "إلزامي",
    countdownEnded: "انتهى المزاد",
    countdownUpcomingLabel: "حتى البدء",
    countdownLastHour: "الساعة الأخيرة",
    countdownRemaining: "حتى الانتهاء",
    countdownDays: "أيام",
    countdownHours: "ساعات",
    countdownMinutes: "دقائق",
    countdownSeconds: "ثوانٍ",
    estValueBelowText: "أقل بنسبة {pct}% من القيمة التقديرية",
    estValueAboveText: "أعلى بنسبة {pct}% من القيمة التقديرية",
    depositDemo: "حجز مبدئي (تجريبي)",
    evaluateSeller: "قيّم البائع",
    supportEmail: "طلب دعم (بريد إلكتروني)",
    expertOpinion: "احصل على رأي خبير",
    expertOpinionDesc: "اطلب تقرير تقييم احترافي",
    commissionTitle: "حاسبة العمولة",
    commissionRefListing: "مبلغ الإعلان (مرجعي)",
    commissionRefAuction: "مبلغ المزاد / العرض (تقديري)",
    commissionPlatformBuyer: "المنصة (المشتري)",
    commissionVat: "ضريبة القيمة المضافة (المنصة)",
    commissionDeedDuty: "رسم سند الملكية",
    commissionRevolvingCapital: "رأس المال المتداول",
    commissionTotal: "التكلفة الإجمالية",
    commissionDetailLink: "اطّلع على هيكل العمولة بالتفصيل",
    securityTitle: "التحقق الأمني",
    secIdentity: "التحقق من الهوية إلزامي",
    secFindeks: "فحص درجة ائتمان Findeks",
    sec2fa: "تحقق بخطوتين عبر الرسائل القصيرة",
    secBankApi: "ضمان الدفع عبر واجهة البنك",
    secAmlKyc: "الامتثال لـ AML/KYC",
    secLawNote: "تعمل ihaleal.com بموجب القانون رقم 7263.",
    // ── 11-G-2 ──
    ovProfRules: "القواعد المهنية (ملخّص)",
    ovCommitmentTitle: "نطاق حدّ التعهّد (البائع / المؤجِّر)",
    ovCommitmentFloor: "الحد الأدنى:",
    ovCommitmentCeiling: "الحد الأعلى:",
    ovCommitmentNote:
      "— عند بلوغ الحد الأعلى، يُحدَّد التزام المعاملة وأساس العمولة في العقد (مستهدف). تنطبق قواعد متماثلة على المشتري والمستأجر ضمن الحزمة نفسها.",
    ovCommitmentPending: "تم تسجيل موافقة التعهّد؛ تُستكمل قيم الحدود في الإصدار النهائي.",
    ovExpertiseTitle: "تقرير التقييم (إشارة / رهن / حجز)",
    ovExpertiseRequiredNote: "يتضمّن هذا الإعلان إقراراً بإلزامية التقييم. ",
    ovExpertiseFileLabel: "الملف (تجريبي):",
    ovExpertiseFileNote:
      "يُتحقَّق من ملف PDF في الإصدار النهائي؛ ولمواجهة خطر التزوير يُستهدف فحص أوّلي بالذكاء الاصطناعي + موافقة بشرية.",
    ovDescriptionTitle: "الوصف",
    ovDetailRoom: "الغرف",
    ovDetailNetSqm: "م² صافٍ",
    ovDetailFloor: "الطابق",
    ovDetailBuildingAge: "عمر المبنى",
    ovVirtualTourTitle: "جولة افتراضية 360°",
    ovVirtualTourDesc: "يمكنك تفقّد هذا العقار افتراضياً.",
    ovVirtualTourStart: "ابدأ الجولة الافتراضية",
    detRoomLiving: "غرف + صالة",
    detGrossSqm: "م² إجمالي",
    detNetSqm: "م² صافٍ",
    detCurrentFloor: "الطابق",
    detTotalFloors: "إجمالي الطوابق",
    detBuildingAge: "عمر المبنى",
    detBuildingAgeUnit: "سنة",
    detHeating: "التدفئة",
    detFacade: "الواجهة",
    detBathroom: "الحمّام",
    detBalcony: "الشرفة",
    detElevator: "المصعد",
    detParking: "موقف السيارات",
    detFurnished: "مفروش",
    detUsage: "حالة الإشغال",
    detDeedStatus: "حالة سند الملكية",
    detEligibility: "الأهلية",
    locNearby: "الجوار",
    locDistanceSuffix: "المسافة",
    locMapLoading: "جارٍ تحميل الخريطة…",
    locMapFallbackNote: "لا يوجد موقع دقيق؛ تُعرض الخريطة على مركز {city}.",
    aiGateNote: "لتقديم عرض، وافق على التقرير أولاً ثم أكمل خطوة الحجز المسبق.",
    aiRadarScore: "الدرجة",
    aiCommentTitle: "تعليق الذكاء الاصطناعي",
    aiCommentUnder:
      "وفقاً لنموذج التقييم بالذكاء الاصطناعي، سعر هذا العقار أقل من قيمته بنسبة {pct}%. متوسط سعر المتر في منطقة {location} هو ₺{avgSqm}، بينما يُعرض هذا الإعلان بسعر ₺{sqm} / م².",
    aiCommentFair:
      "وفقاً لنموذج التقييم بالذكاء الاصطناعي، سعر هذا العقار قريب من متوسط السوق. مؤشر الطلب {demand}/100.",
    aiBadgeRentalYield: "عائد الإيجار",
    aiBadgeDemandIndex: "مؤشر الطلب",
    aiBadgeYearlyGrowth: "النمو السنوي",
    aiRegionStatsTitle: "إحصاءات المنطقة",
    statAvgSqmPrice: "متوسط سعر م²",
    statMonthlyChange: "التغيّر الشهري",
    statYearlyChange: "التغيّر السنوي",
    statAvgDaysOnMarket: "متوسط مدة البيع",
    statDaysUnit: "يوم",
    aiSuggestTitle: "اقتراح العرض بالذكاء الاصطناعي",
    aiSuggestThinking: "يفكّر…",
    aiSuggestRetry: "اسأل مجدداً",
    aiSuggestGet: "احصل على اقتراح",
    aiSuggestError: "اقتراح الذكاء الاصطناعي غير متاح حالياً. يُرجى المحاولة بعد دقائق.",
    aiSuggestPlaceholder:
      "بنقرة واحدة يولّد الذكاء الاصطناعي نطاق العرض المقترح ومبرّره ونقاط الخطر لهذا العقار.",
    expPanelTitle: "تقرير التقييم",
    expPanelPreparing: "جارٍ التحضير…",
    expPanelDownload: "تنزيل PDF",
    expPanelDesc:
      "وصف العقار، تقييم السعر، تحليل المنطقة، المواصفات والمرافق المجاورة — ملخّص PDF احترافي.",
    // ── 11-G-3 ──
    cancel: "إلغاء",
    bidCostTitle: "التكلفة الإجمالية التقديرية (شاملة العمولة والرسوم)",
    bidCostNote: "منصة المشتري: fees.ts · رسم سند الملكية %{pct} + تكلفة ثابتة (تجريبي)",
    bidAmountLabel: "مبلغ العرض (₺)",
    bidAmountPlaceholder: "مثال: 3000000 أو 3.000.000",
    proxyTitle: "عرض تلقائي (عرض وكيل)",
    proxyDesc: "ينوب عنك ويرفع العرض تلقائياً حتى حدّك الأقصى كلما قدّم آخرون عروضاً.",
    proxyEnableAria: "تفعيل العرض التلقائي",
    proxyMaxLabel: "الحد الأقصى لمبلغ العرض (₺)",
    proxyMaxPlaceholderPrefix: "مثال:",
    proxyDemoNote:
      "تجريبي: يُحفظ الحد الأقصى محلياً (تفضيل المستخدم). يبدأ الرفع التلقائي عند اكتمال الجانب الخلفي (جدول auction_proxy_bids + RLS + توافق الإخفاء المغلق). حالياً تُعالَج العملية كعرض عادي بنقرة واحدة.",
    bidGateTitle: "الموافقات الإلزامية",
    bidGateTooltip: "حدّد جميع مربّعات الموافقة",
    toastAuctionEnded: "انتهى هذا المزاد.",
    toastInvalidBid: "أدخل مبلغ عرض صالحاً (عدد صحيح موجب، ضمن حد أعلى معقول).",
    toastMinBid: "يجب ألا يقل العرض عن ₺{amount}.",
    toastBidGate: "وافق أولاً على تقرير الذكاء الاصطناعي، ثم أكمل خطوة التأمين (التفويض المسبق).",
    toastDuplicate: "هذا العرض مسجّل بالفعل.",
    toastBidSaved: "تم تسجيل العرض: ₺{amount}",
    toastDemoBid:
      "إعلان تجريبي: لا يُسجَّل العرض في قاعدة البيانات. في المزادات الحيّة (Supabase UUID) يُخزَّن العرض على الخادم.",
    toastOfferSubmitted: "تم تسجيل عرضك. يمكنك متابعته من لوحة «عروضي».",
    toastLogin: "يُرجى تسجيل الدخول.",
  },
  borsa: {
    marketTicker: "شريط السوق",
    marketSummary: "ملخّص السوق",
    totalVolume: "إجمالي الحجم",
    tradeCount: "عدد الصفقات",
    activeOrders: "الأوامر النشطة",
    openClose: "الافتتاح/الإغلاق",
    marketBreadth: "اتّساع السوق",
    bidStream: "تدفّق العروض",
    orderBookPreviewMasked: "دفتر الأوامر (معاينة، مُخفّاة)",
    marketDataSummary: "ملخّص بيانات السوق",
    bidder: "مقدّم العرض",
    portfolioEyebrow: "البورصة · المحفظة",
    portfolioTitle: "محطة المحفظة",
    portfolioDesc: "أدر أصول المحفظة تحت شريط الثقة: المزاد، البيع الثابت، التأجير، المقايضة والتنازل — في لوحة واحدة.",
    totalPurchase: "إجمالي الشراء",
    currentValue: "القيمة الحالية",
    pnlLabel: "الربح/الخسارة (%)",
    portfolioTrend: "اتجاه المحفظة",
    distributionSegment: "التوزيع · القطاع",
    distributionRegion: "التوزيع · المنطقة",
    tooltipValue: "القيمة",
    periodPrefix: "الفترة",
    auditableLog: "سجل معاملات قابل للتدقيق",
    encrypted: "مشفّر",
    howSecure: "كيف تتم الحماية؟",
    verified: "موثّق",
    watchlistEyebrow: "محطة المتابعة",
    watchlistTitle: "قائمة المتابعة + مركز التنبيهات",
    watchAdd: "متابعة",
    watchRemove: "إلغاء المتابعة",
    watchAddedToast: "تمت الإضافة إلى قائمة المتابعة.",
    watchRemovedToast: "تمت الإزالة من قائمة المتابعة.",
    high24: "الأعلى خلال 24س",
    low24: "الأدنى خلال 24س",
    volumeLabel: "الحجم",
    orderBook: "دفتر الأوامر (Order Book)",
    bidColumn: "شراء",
    askColumn: "بيع",
    priceColumn: "السعر",
    maLabel: "MA(5)",
  },
  megaMenu: {
    segmentInvestor: "مستثمر",
    segmentRealtor: "وسيط عقاري",
    segmentContractor: "مقاول",
    liveAuctions: "مزادات مباشرة",
    aiValuation: "تقييم بالذكاء الاصطناعي",
    investorPanel: "لوحة المستثمر",
    rewards: "المكافآت",
    campaigns: "العروض",
    intlInvestor: "مستثمر دولي",
    realtorShowcase: "واجهة الوسيط",
    officePanel: "لوحة المكتب",
    realtorLogin: "تسجيل دخول الوسيط",
    b2bPartnership: "شراكة B2B",
    contractorLaunch: "إطلاق المقاول",
    projectPanel: "لوحة المشاريع",
    openAuction: "فتح مزاد",
    floorBarter: "مقابل الأدوار",
  },
  footer: {
    tagline: "تقييم بالذكاء الاصطناعي، عملية مزاد شفّافة وبنية تحتية آمنة للمعاملات.",
    taglineShort: "منصة عقارية مدعومة بالذكاء الاصطناعي",
    workingHours: "أيام الأسبوع 09:00 — 18:00 (UTC+3)",
    colPlatform: "المنصة",
    colTools: "الأدوات",
    colCorporateLegal: "الشركة والقانوني",
    colNewsletter: "النشرة",
    newsletterDesc: "كن أوّل من يعلم بالمزادات الجديدة.",
    newsletterPlaceholder: "البريد الإلكتروني",
    newsletterSubmit: "اشترك",
    allRightsReserved: "جميع الحقوق محفوظة.",
    langLabel: "اللغة",
    auctionsLink: "المزادات",
    aiAnalysis: "تحليل بالذكاء الاصطناعي",
    compare: "مقارنة",
    revenueModel: "نموذج الإيرادات",
    mortgage: "تمويل عقاري",
    favorites: "المفضلة",
    realtorLoginFooter: "تسجيل دخول الوسيط",
    realtorPartnership: "شراكة الوسطاء",
    researchTerminal: "محطة البحث",
    priceEstimate: "تقدير السعر",
    loanCalculator: "حاسبة القرض",
    listingCompare: "مقارنة الإعلانات",
    cityGuide: "دليل المدن",
    howItWorksFooter: "كيف يعمل",
    platformGuide: "دليل المنصة",
    commissionCalc: "حاسبة العمولة",
    taxSimulator: "محاكي الضرائب",
    financeCompliance: "المالية / الامتثال",
    legalHub: "المركز القانوني (الكل)",
    auctionTermsCommission: "شروط المزاد والعمولة",
    participationDocs: "وثائق المشاركة",
    kvkkInfo: "إشعار KVKK",
    termsOfUse: "شروط الاستخدام",
    privacyPolicy: "سياسة الخصوصية",
    cookiePolicy: "سياسة ملفات الارتباط",
    distanceSaleAgreement: "عقد البيع عن بُعد",
    refundCancellation: "الاسترداد والإلغاء",
    disclosure: "إشعار الإفصاح",
    contactFooter: "اتصل بنا",
    aboutUs: "من نحن",
    sitemap: "خريطة الموقع",
    faqFooter: "الأسئلة الشائعة",
    securityCenter: "مركز الأمان",
    sellerMode: "وضع البائع",
    commissionModel: "نموذج العمولة",
    ihalealIndex: "مؤشر iHaleal",
  },
  tierData: {
    byId: {
      free: { name: "فردي", tagline: "متابعة المزادات + إعلان مجاني واحد" },
      yatirimci: { name: "مستثمر", tagline: "محطة بورصة كاملة + تقارير غير محدودة" },
      emlak_baslangic: { name: "وسيط مبتدئ", tagline: "وسيط جديد / مكتب صغير" },
      emlak_pro: { name: "وسيط احترافي", tagline: "وكالة عقارية احترافية — نمو" },
      kurumsal: { name: "للشركات", tagline: "سلاسل المكاتب + صناديق المحافظ + المقاولون" },
    },
  },
  loanValuation: {
    back: "رجوع",
    loanTitle: "حاسبة القرض العقاري",
    loanSubtitle: "تقدير القسط الشهري وإجمالي السداد بناءً على مبلغ القرض والمدة ومعدل الفائدة الشهري (لأغراض إعلامية).",
    loanAmount: "مبلغ القرض (₺)",
    monthlyRate: "معدل الفائدة الشهري (%)",
    termLabel: "المدة",
    yearLabel: "سنة",
    monthlyInstallment: "القسط الشهري",
    totalRepayment: "إجمالي السداد",
    totalInterest: "إجمالي الفوائد",
    loanAmountField: "مبلغ القرض",
    downPayment: "الدفعة الأولى",
    propertyValue: "قيمة العقار",
    loanDisclaimerEqual: "يستند هذا الحساب إلى صيغة الأقساط المتساوية؛ لا تشمل رسوم الملف والتأمين وعروض البنوك. للحصول على عرض نهائي يُرجى مراجعة البنك.",
    loanDisclaimerInfo: "لأغراض إعلامية فقط.",
    widgetTitle: "احسب قرضاً لهذا الإعلان",
    widgetEstimate: "تقدير:",
    widgetCalculate: "احسب",
    widgetBankNote: "لأغراض إعلامية؛ يلزم موافقة البنك.",
    valuationTitle: "تقييم العقار",
    estimatedValueApprox: "القيمة التقديرية (تقريبية)",
    confidenceRange: "نطاق الثقة",
    uncertaintyBand: "نطاق عدم اليقين",
    modelScore: "درجة النموذج",
    modelScoreHigh: "عالية",
    modelScoreMedium: "متوسطة",
    shapTitle: "تفصيل مساهمة SHAP",
    shapImpact: "التأثير",
    layerSummary: "ملخص الطبقات",
    startValuation: "بدء التقييم",
    resetForm: "إعادة تعيين النموذج",
    disclaimerInfo: "لأغراض إعلامية",
    disclaimerNotOffer: "ليس عرضاً نهائياً",
    disclaimerApprox: "تقريباً",
  },
  mortgage: {
    title: "قرض عقاري / حاسبة القرض",
    subtitle: "احسب القسط الشهري والتكلفة الإجمالية عند شراء عقار.",
    loanParameters: "معاملات القرض",
    propertyValueLabel: "قيمة العقار",
    downPaymentPercent: "نسبة الدفعة الأولى",
    downPaymentValue: "الدفعة الأولى",
    loanValue: "القرض",
    termSelect: "المدة",
    yearShort: "سنة",
    monthShort: "شهر",
    annualRate: "معدل الفائدة السنوي",
    bankRequirements: "متطلبات البنك",
    minMonthlyIncome: "الحد الأدنى للدخل الشهري",
    minLabel: "الحد الأدنى",
    maxLabel: "الحد الأقصى",
    loanToValueRatio: "نسبة القرض إلى القيمة",
    loanSummary: "ملخص القرض",
    subEvenPay: "قسط متساوٍ",
    subOfCost: "من التكلفة",
    paymentPlanGraphTitle: "جدول السداد — الدين المتبقي",
    monthSuffix: "شهر",
    remainingDebt: "الدين المتبقي",
    totalInterestLegend: "إجمالي الفوائد",
    yearlyPaymentSummary: "ملخص السداد السنوي",
    everyYearEnd: "نهاية كل سنة",
    yearColumn: "السنة",
    principalColumn: "أصل الدين",
    interestColumn: "الفوائد",
    remainingColumn: "الدين المتبقي",
    yearRowPrefix: " سنة",
    tipLowInterestTitle: "نصائح لخفض الفوائد",
    tipLowInterestDesc: "اختيار مدة أقصر يخفض إجمالي تكلفة الفوائد. مع مدة 5 سنوات بدلاً من 10 سنوات تدفع فوائد أقل بحوالي 40%.",
    tipDownPaymentTitle: "زيادة الدفعة الأولى",
    tipDownPaymentDesc: "رفع الدفعة الأولى إلى 30% يخفض القسط الشهري بنحو 15% ويقلل إجمالي تكلفة الفوائد بنسبة 25%.",
    disclaimer: "* هذا الحساب لأغراض إعلامية. شروط القرض الفعلية قد تختلف حسب البنك ودرجة ائتمانك.",
  },
  valuationForm: {
    headerSubtitle: "بيانات تجريبية / تحليل أولي: المنهج الهيدوني + المقارن + التصحيح المكاني تعمل معاً.",
    explainableModel: "نموذج قابل للتفسير",
    cityLabel: "المدينة",
    districtLabel: "المنطقة",
    districtNoData: "لا توجد بيانات للمنطقة",
    grossM2Label: "المساحة الإجمالية (م²)",
    roomCountLabel: "عدد الغرف",
    floorLabel: "الطابق",
    totalFloorsLabel: "إجمالي الطوابق",
    buildingAgeLabel: "عمر المبنى",
    heatingLabel: "التدفئة",
    heatingDistrict: "نظام مركزي",
    heatingCentral: "مركزي لكل شقة",
    heatingCombi: "غلاية ثنائية",
    heatingUnderfloor: "تدفئة أرضية",
    heatingStove: "موقد",
    locationTierLabel: "جودة الموقع",
    tierPrime: "ممتاز",
    tierStrong: "قوي",
    tierBalanced: "متوازن",
    tierEmerging: "صاعد",
    conditionLabel: "الحالة الفيزيائية",
    conditionNew: "جديد",
    conditionGood: "جيد",
    conditionNeedsRenovation: "يحتاج إلى تجديد",
    transactionTypeLabel: "نوع المعاملة",
    txSale: "قيمة البيع",
    txRent: "قيمة الإيجار",
    hasElevator: "مصعد",
    hasParking: "موقف سيارات",
    errorTotalFloorsMin: "يجب أن يكون إجمالي الطوابق 1 على الأقل.",
    errorFloorNegative: "لا يمكن أن يكون الطابق سالباً.",
    finalReviewBanner: "اكتمل التقييم الأولي. للحصول على تقييم رسمي يلزم تأكيد مقيِّم مرخّص من SPK (TDUB).",
    startValuationCta: "بدء التقييم",
  },
  dataAnalysis: {
    eyebrow: "محطة البيانات / التحليل",
    title: "نظرة عامة على السوق + لوحة متوسط الأسعار",
    subtitle: "تابع سجل متوسط الأسعار حسب المنطقة/القطاع، ومقارنة «الأصل مقابل المتوسط»، وعمق الخريطة الحرارية في شاشة واحدة.",
    bannerWarning: "القيم المعروضة هنا هي متوسطات الأسعار بالليرة التركية حسب المنطقة/القطاع (ليست إحصائيات رسمية؛ مؤشّر مُستخرَج من بيانات تجريبية للمنصة). للحصول على درجة مؤشر iHaleal الحقيقية، راجع المؤشّر المباشر على الصفحة الرئيسية للبورصة.",
    avgPriceHistory: "سجل متوسط الأسعار (₺)",
    regionAvg: "متوسط سعر المنطقة (₺)",
    segmentAvg: "متوسط سعر القطاع (₺)",
    platformAvg: "متوسط المنصة (₺)",
    captionSelected: "المنطقة المختارة",
    assetVsPlatform: "الأصل مقابل متوسط المنصة (₺)",
    assetPriceSuffix: "السعر (₺)",
    comparisonSelection: "اختيار المقارنة",
    segmentTrendAnalysis: "تحليل اتجاهات القطاع",
    volumeLabel: "الحجم",
    volumeUnit: "لوت",
    depthScore: "درجة العمق",
    marketShare: "حصة السوق",
    regionHeatmap: "الخريطة الحرارية للمناطق",
    downloadReport: "تنزيل التقرير (تجريبي)",
    avgPriceShort: "متوسط السعر",
    demoReportFootnote: "التقرير القابل للتنزيل تجريبي؛ للقرارات الاستثمارية المهنية يلزم رأي مستشار مالي/قانوني مستقل.",
    segmentResidential: "سكني",
    segmentLand: "أرض",
    segmentCommercial: "تجاري",
    segmentTourism: "سياحي",
  },
  gesForm: {
    stepLabel: "خطوة",
    step1Title: "الموقع والأرض",
    city: "المدينة",
    district: "المنطقة",
    neighborhood: "الحي",
    adaParcel: "البلوك / القطعة",
    adaPlaceholder: "البلوك",
    parcelPlaceholder: "القطعة",
    totalAreaM2: "المساحة الإجمالية (م²)",
    solarIrradiance: "الإشعاع الشمسي (كيلوواط·س/م²)",
    continueBtn: "متابعة",
    step2Title: "الشبكة واللوائح",
    preScore: "النتيجة الأولية",
    trafoDistance: "بُعد المحطة الفرعية (كم)",
    trafoCapacity: "سعة المحطة الفرعية (ميغاواط)",
    slopeDegree: "الانحدار (درجة)",
    slopeAspect: "الاتجاه",
    agriculturalClass: "التصنيف الزراعي",
    chkMarginal: "زراعة هامشية / موافقة GEPA متوفرة",
    chkCadastralRoad: "يوجد طريق مساحي",
    chkSitConflict: "تعارض مع منطقة محمية (SIT)",
    chkMilitaryZone: "منطقة عسكرية محظورة",
    chkArchaeological: "موقع أثري",
    backBtn: "رجوع",
    computingBtn: "جارٍ الحساب...",
    completeBtn: "إكمال التقييم",
    retryBtn: "إعادة المحاولة",
    errSubmit: "تعذّر إرسال التقييم.",
    scoreLabel: "النتيجة",
    capacityLabel: "القدرة",
    annualLabel: "السنوي",
    capexLabel: "CAPEX",
    paybackLabel: "فترة الاسترداد",
    paybackYearSuffix: "سنة",
    paybackDefaultPriceNote: "(السعر الافتراضي)",
    newEvaluation: "تقييم جديد",
    statusHigh: "جدوى عالية",
    statusReject: "رفض فني",
    statusSubmitted: "أُرسل إلى المستثمرين",
    statusEngineering: "حساب هندسي",
    statusGathering: "جمع البيانات",
  },
  dashboard: {
    back: "الرئيسية",
    title: "لوحة الحساب",
    subtitle: "اختصارات استناداً إلى مساراتك المختارة (تجريبي؛ بلا واجهة خلفية).",
    changeFlows: "تغيير المسارات",
    cardListingsTitle: "إعلاناتي",
    cardListingsBody: "أسعار الباقات نائبة في `fees.ts` (§D-K8).",
    cardListingsCta: "مركز البائع",
    cardAuctionTitle: "فتح مزاد",
    cardAuctionBody: "المسار B — الصلاحيات والوثائق (تجريبي).",
    cardAuctionCta: "إنشاء مزاد",
    cardBidsTitle: "عروضي / الضمان",
    cardBidsBody: "Findeks، AML، ضمان العرض — الإنتاج في K3.",
    cardBidsCta: "قائمة الوثائق",
    cardFavoritesTitle: "المفضلة",
    cardFavoritesCta: "الإعلانات المفضّلة",
    cardSavedSearchTitle: "عمليات البحث المحفوظة",
    cardSavedSearchCta: "صفحة البحث",
    cardAuthorityTitle: "وثائق التفويض",
    cardAuthorityCta: "البوابة الحكومية (تجريبي)",
    cardProfileTitle: "الملف الشخصي",
    cardProfileCta: "معلومات الحساب",
    investorPortfolioNote: "رسوم محفظة المستثمر (المفضلة)",
    investorPortfolioCta: "الانتقال إلى عرض المحفظة",
  },
  investorDashboard: {
    badge: "مستثمر",
    title: "لوحة المستثمر",
    subtitle: "أداء المحفظة، توقعات الذكاء الاصطناعي وتحليلات التوزيع.",
    back: "العودة إلى اللوحة",
    marketAnalysis: "تحليل السوق",
    loading: "جارٍ تحميل المحفظة…",
    emptyTitle: "محفظتك فارغة",
    emptyDesc: "تصفّح الإعلانات وأضفها إلى المفضلة لإنشاء عرض محفظتك المؤسسي.",
    emptyCta: "استكشاف الإعلانات",
    kpiPortfolioValue: "قيمة المحفظة",
    kpiListingsHint: "إعلان",
    kpiPredictedValue: "القيمة المتوقعة",
    kpiAvgYield: "متوسط العائد",
    kpiAvgYieldHint: "إيجار سنوي",
    kpiPotential: "الإمكانية",
    kpiPotentialHint: "الفرق المتوقع",
    chartGrowthTitle: "نمو قيمة المحفظة",
    chartGrowthSubtitle: "آخر 6 أشهر (تقديري)",
    chartCategoryTitle: "التوزيع حسب الفئة",
    chartCategorySubtitle: "مليون ₺",
    chartYieldTitle: "العائد ودرجة الذكاء الاصطناعي",
    chartYieldSubtitle: "حسب المنطقة",
    barRentPct: "إيجار %",
    barAiScore: "درجة AI",
    portfolioListings: "إعلانات المحفظة",
    cardCurrent: "الحالي",
    cardPredicted: "متوقع",
    cardYield: "العائد",
    months: ["يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر"],
  },
  profile: {
    guestTitle: "ملف الحساب",
    guestDesc: "سجّل الدخول لعرض معلومات ملفك، حالة KYC وتقييم البائع.",
    guestLogin: "تسجيل الدخول",
    back: "رجوع",
    logout: "تسجيل الخروج",
    profileUpdated: "تم تحديث الملف!",
    ratingSuffix: "تقييم",
    noRating: "لا يوجد تقييم بعد",
    reviewSuffix: "مراجعة",
    memberSince: "عضو منذ",
    auctionsCreated: "المزادات المفتوحة",
    auctionsWon: "الفائزة",
    kycStart: "بدء KYC",
    profileInfoTitle: "معلومات الملف الشخصي",
    edit: "تعديل",
    cancel: "إلغاء",
    fullName: "الاسم الكامل",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "الهاتف",
    phoneNotSet: "غير محدد",
    phoneNote: "رقم هاتفك لا يظهر في الإعلانات؛ يتم التواصل عبر رسائل المنصة.",
    saveChanges: "حفظ التغييرات",
    securityTitle: "الأمان",
    emailVerification: "التحقق من البريد الإلكتروني",
    phoneVerification: "التحقق من الهاتف",
    twoFactor: "المصادقة الثنائية",
    kycVerification: "التحقق من الهوية (KYC)",
    statusVerified: "موثّق",
    statusPending: "قيد الانتظار",
    statusSoon: "قريباً",
    accountSummaryTitle: "ملخص الحساب",
    summaryFavorites: "المفضلة",
    summarySavedSearch: "عمليات البحث المحفوظة",
    summaryActiveOffers: "العروض النشطة",
    summaryGoToPanel: "الانتقال إلى اللوحة الكاملة",
    notifyTitle: "تفضيلات الإشعارات",
    notifyDesc: "تُحفظ تفضيلاتك في المتصفح. يعمل تكامل الإشعارات من جهة الخادم برموز الدفع في النسخة المباشرة.",
    notifyEmail: "إشعار بالبريد الإلكتروني",
    notifyEmailDesc: "تطابق جديد، عرض، قبول/رفض",
    notifyPush: "إشعار المتصفح",
    notifyPushDesc: "إشعارات فورية",
    notifyMatches: "تطابق البحث المحفوظ",
    notifyMatchesDesc: "عندما يطابق إعلان جديد معاييرك",
    notifyBids: "تحديث حالة العرض",
    notifyBidsDesc: "تم تجاوزه / فزت / عرض مقابل",
  },
};

/**
 * Saf JSON deep merge — base üzerine override uygular, override'da yoksa
 * base değeri kalır. Diziler override edilir (parça parça birleştirmez —
 * çevirilerde dizi yapısı korunmalı, biz sadece nav.* için string override
 * ediyoruz, dizi override etmiyoruz, sorun yok).
 */
function _mergeMessages<T extends object>(base: T, override: PartialDeep<T>): T {
  if (override == null || typeof override !== "object") return base;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(base) as Array<keyof T>) {
    const baseVal = base[key];
    const overrideVal = (override as Record<string, unknown>)[key as string];
    if (
      baseVal !== null &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal) &&
      overrideVal !== null &&
      typeof overrideVal === "object" &&
      !Array.isArray(overrideVal)
    ) {
      result[key as string] = _mergeMessages(baseVal as object, overrideVal as PartialDeep<object>);
    } else if (overrideVal !== undefined) {
      result[key as string] = overrideVal;
    } else {
      result[key as string] = baseVal;
    }
  }
  return result as T;
}

// Lazy cache — modül seviyesinde tek hesap, sonraki çağrılar O(1).
let _cachedRu: Messages | null = null;
let _cachedAr: Messages | null = null;

/**
 * Locale → Messages map'i. EN/TR direkt; RU/AR TR üzerine partial override.
 * RU/AR'da çevirisi olmayan metinler TR fallback olarak görünür (kırık değil).
 */
export function getMessagesFor(locale: Locale): Messages {
  if (locale === "en") return messages.en;
  if (locale === "tr") return messages.tr;
  if (locale === "ru") {
    if (!_cachedRu) _cachedRu = _mergeMessages(messages.tr, _ruOverrides);
    return _cachedRu;
  }
  // ar
  if (!_cachedAr) _cachedAr = _mergeMessages(messages.tr, _arOverrides);
  return _cachedAr;
}
