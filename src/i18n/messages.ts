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
};

export type Messages = {
  nav: NavMessages;
  home: HomeMessages;
  common: CommonMessages;
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
    valuation: "Оценка",
    faq: "ЧаВо",
    search: "Поиск аукционов, объектов…",
    logIn: "Войти",
    signUp: "Регистрация",
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    langEn: "Английский",
    langTr: "Турецкий",
    langRu: "Русский",
    langAr: "Арабский",
  },
};

const _arOverrides: PartialDeep<Messages> = {
  nav: {
    auctions: "المزادات",
    howItWorks: "كيف يعمل",
    services: "الخدمات",
    resources: "الموارد",
    company: "الشركة",
    valuation: "التقييم",
    faq: "الأسئلة الشائعة",
    search: "ابحث عن المزادات، العقارات…",
    logIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    langEn: "الإنجليزية",
    langTr: "التركية",
    langRu: "الروسية",
    langAr: "العربية",
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
