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
