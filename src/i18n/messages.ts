export type Locale = "en" | "tr";

export const LOCALE_STORAGE_KEY = "ihaleal_locale";

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
  stats: Array<{ label: string; value: string; delta: string; vs: string }>;
  search: { placeholder: string; aria: string };
  categories: {
    heading: string;
    items: Array<{ name: string; count: string }>;
  };
  testimonials: {
    heading: string;
    items: Array<{ name: string; role: string; quote: string }>;
  };
  cta: {
    title: string;
    subtitle: string;
    primary: string;
    secondary: string;
  };
  featured: {
    heading: string;
    viewAll: string;
  };
  investor: {
    heading: string;
    items: Array<{ title: string; text: string }>;
  };
  aria: {
    trustRow: string;
    statRail: string;
    heroVisual: string;
    lower: string;
  };
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
};

export type Messages = {
  nav: NavMessages;
  home: HomeMessages;
};

export const messages: Record<Locale, Messages> = {
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
        { label: "Total Open Auctions", value: "12,458", delta: "+12.5%", vs: "vs last month" },
        { label: "Successful Sales", value: "3,127", delta: "+8.3%", vs: "vs last month" },
        { label: "Active Investors", value: "10,843", delta: "+15.2%", vs: "vs last month" },
        { label: "Satisfaction Rate", value: "98%", delta: "+2.1%", vs: "vs last month" },
      ],
      search: {
        placeholder: "Search auctions or regions…",
        aria: "Property search",
      },
      categories: {
        heading: "Browse by Category",
        items: [
          { name: "Villa", count: "842 listings" },
          { name: "Apartment", count: "3,240 listings" },
          { name: "Office", count: "1,105 listings" },
          { name: "Land", count: "620 listings" },
          { name: "Warehouse", count: "188 listings" },
          { name: "Whole Building", count: "94 listings" },
        ],
      },
      testimonials: {
        heading: "What Our Investors Say",
        items: [
          {
            name: "Ayşe Korkmaz",
            role: "Institutional Investor",
            quote:
              "Transparent bid history and AI analytics on ihaleal.com helped me grow my portfolio with confidence.",
          },
          {
            name: "Mehmet Yıldız",
            role: "Property Developer",
            quote:
              "Fast live auction infrastructure and clear KYC. We sold our Bodrum villa at target price.",
          },
          {
            name: "Zeynep Arslan",
            role: "Individual Buyer",
            quote:
              "Even on my first digital auction I was guided step by step; the process felt highly professional.",
          },
        ],
      },
      cta: {
        title: "Join the Future of Real Estate Investment",
        subtitle: "Institutional-grade security, AI analysis, and live auctions — one platform.",
        primary: "Get Started",
        secondary: "Request Demo",
      },
      featured: {
        heading: "Featured Live Auctions",
        viewAll: "View All →",
      },
      investor: {
        heading: "Why ihaleal Corporate Infrastructure?",
        items: [
          { title: "Bank-Grade Security", text: "High-standard data protection infrastructure." },
          { title: "AI-Powered Analytics", text: "Ground investment decisions in rational data." },
          { title: "Transparent Bid History", text: "Open, traceable process without manipulation." },
          { title: "Global Access", text: "Join auctions online from anywhere in the world." },
        ],
      },
      aria: {
        trustRow: "Trust parameters",
        statRail: "Platform statistics",
        heroVisual: "Luxury property visual area",
        lower: "Process and listings",
      },
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
        title: "Featured Live Auctions",
        viewAll: "View All →",
        currentBid: "Current Highest Bid",
        live: "LIVE",
        items: [
          {
            title: "Premium Sea View Villa",
            location: "Bodrum, Muğla",
            price: "₺45,000,000",
            change: "+12.5%",
            time: "2h 14m left",
            bids: "18 bids",
          },
          {
            title: "Central Business Plaza Office",
            location: "Çankaya, Ankara",
            price: "₺28,500,000",
            change: "+8.2%",
            time: "1d 5h left",
            bids: "12 bids",
          },
          {
            title: "Luxury Residence Apartment",
            location: "Levent, Istanbul",
            price: "₺19,250,000",
            change: "+15.7%",
            time: "5h 45m left",
            bids: "24 bids",
          },
          {
            title: "Urban Renewal Commercial Land",
            location: "Yenimahalle, Ankara",
            price: "₺62,000,000",
            change: "+10.3%",
            time: "3d 12h left",
            bids: "31 bids",
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
        { label: "Toplam Açık Artırma", value: "12.458", delta: "+%12,5", vs: "geçen aya göre" },
        { label: "Başarılı Satışlar", value: "3.127", delta: "+%8,3", vs: "geçen aya göre" },
        { label: "Aktif Yatırımcılar", value: "10.843", delta: "+%15,2", vs: "geçen aya göre" },
        { label: "Memnuniyet Oranı", value: "%98", delta: "+%2,1", vs: "geçen aya göre" },
      ],
      search: {
        placeholder: "Müzayede veya bölge ara...",
        aria: "Mülk arama",
      },
      categories: {
        heading: "Kategorilere Göre Keşfet",
        items: [
          { name: "Villa", count: "842 ilan" },
          { name: "Daire", count: "3.240 ilan" },
          { name: "Ofis", count: "1.105 ilan" },
          { name: "Arsa", count: "620 ilan" },
          { name: "Depo", count: "188 ilan" },
          { name: "Komple Bina", count: "94 ilan" },
        ],
      },
      testimonials: {
        heading: "Yatırımcılarımız Ne Diyor?",
        items: [
          {
            name: "Ayşe Korkmaz",
            role: "Kurumsal Yatırımcı",
            quote:
              "ihaleal.com üzerindeki şeffaf teklif geçmişi ve AI analizleri sayesinde portföyümü güvenle büyüttüm.",
          },
          {
            name: "Mehmet Yıldız",
            role: "Gayrimenkul Geliştirici",
            quote:
              "Canlı müzayede altyapısı hızlı, kurumsal KYC süreci net. Bodrum villamızı hedef fiyata sattık.",
          },
          {
            name: "Zeynep Arslan",
            role: "Bireysel Alıcı",
            quote:
              "İlk dijital müzayedemde bile adım adım yönlendirildim; süreç son derece profesyoneldi.",
          },
        ],
      },
      cta: {
        title: "Gayrimenkul Yatırımının Geleceğine Katılın",
        subtitle: "Kurumsal güvence, yapay zeka analizi ve canlı müzayede — tek platformda.",
        primary: "Hemen Başla",
        secondary: "Demo Talep",
      },
      featured: {
        heading: "Öne Çıkan Canlı Müzayedeler",
        viewAll: "Tümünü Gör →",
      },
      investor: {
        heading: "Neden ihaleal Kurumsal Altyapısı?",
        items: [
          { title: "Banka Düzeyinde Güvenlik", text: "Yüksek standartlı veri koruma altyapısı." },
          { title: "Yapay Zeka Destekli Analiz", text: "Yatırım kararlarınızı rasyonel verilere dayandırın." },
          { title: "Şeffaf Teklif Geçmişi", text: "Manipülasyondan uzak, tamamen açık ve izlenebilir süreç." },
          { title: "Küresel Erişim", text: "Dünyanın her yerinden ihalelere online katılım imkanı." },
        ],
      },
      aria: {
        trustRow: "Güven parametreleri",
        statRail: "Platform istatistikleri",
        heroVisual: "Lüks gayrimenkul görsel alanı",
        lower: "Süreç ve listelemeler",
      },
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
        title: "Öne Çıkan Canlı Müzayedeler",
        viewAll: "Tümünü Gör →",
        currentBid: "Mevcut En Yüksek Teklif",
        live: "CANLI",
        items: [
          {
            title: "Premium Deniz Manzaralı Villa",
            location: "Bodrum, Muğla",
            price: "₺45.000.000",
            change: "+%12,5",
            time: "2sa 14dk kaldı",
            bids: "18 teklif",
          },
          {
            title: "Merkezi İş Alanında Plaza Ofisi",
            location: "Çankaya, Ankara",
            price: "₺28.500.000",
            change: "+%8,2",
            time: "1g 05sa kaldı",
            bids: "12 teklif",
          },
          {
            title: "Lüks Rezidans Dairesi",
            location: "Levent, İstanbul",
            price: "₺19.250.000",
            change: "+%15,7",
            time: "5sa 45dk kaldı",
            bids: "24 teklif",
          },
          {
            title: "Kentsel Dönüşüm Ticari Arsa",
            location: "Yenimahalle, Ankara",
            price: "₺62.000.000",
            change: "+%10,3",
            time: "3g 12sa kaldı",
            bids: "31 teklif",
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
    },
  },
};

export function resolveLocale(raw: string | null): Locale {
  return raw === "tr" ? "tr" : "en";
}
