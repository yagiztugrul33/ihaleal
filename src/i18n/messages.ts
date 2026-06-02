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
