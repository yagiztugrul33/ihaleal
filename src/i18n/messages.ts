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
    },
  },
};

export function resolveLocale(raw: string | null): Locale {
  return raw === "tr" ? "tr" : "en";
}
