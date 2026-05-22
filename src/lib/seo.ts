import { SEO_LANDING_PAGES } from "@/data/seoLandings";
import { HOME_SEO, OG_IMAGE } from "@/data/homeSeo";
import {
  SITE_ORIGIN,
  getCanonicalHref,
  getShareUrlForPath,
} from "@/data/siteOrigin";

/**
 * Tek cümle — müşteri seçimi (hibrit): kanonik her zaman kök URL;
 * og:url ve twitter:url ilgili rotanın tam hash adresidir.
 */
export const SEO_CANONICAL_POLICY_TR =
  "HashRouter demo (hibrit): kanonik her zaman kök URL; og:url ve twitter:url ilgili rotanın tam hash adresidir.";

/** HashRouter: paylaşım ve `og:url` için taban; kanonik ayrı (kök URL). */
export { SITE_ORIGIN, getCanonicalHref, getShareUrlForPath };

/** `ROUTES["/"]` ile aynı nesne (`HOME_SEO`), drift yok. */
export const DEFAULT_SEO = HOME_SEO;

const ROUTE_SEO: Record<string, { title: string; description: string }> = {
  "/": HOME_SEO,
  "/arama": {
    title: "İlan arama — ihaleal.com",
    description: "Şehir, semt ve kategoriye göre gayrimenkul ihale ilanlarında arama yapın.",
  },
  "/ihaleler": {
    title: "İhaleler — ihaleal.com",
    description: "Aktif gayrimenkul ihale ve ilanları keşfedin (demo veri).",
  },
  "/analiz": {
    title: "İhaleal Endeksi — AI analiz ve fiyat tahmini — ihaleal.com",
    description:
      "Teklif ve bölge sinyalleriyle zenginleştirilmiş demo analiz; kesin değer için resmi ekspertiz gerekir.",
  },
  "/karsilastir": {
    title: "İlan karşılaştırma — ihaleal.com",
    description: "Seçtiğiniz ilanları yan yana karşılaştırın.",
  },
  "/mortgage": {
    title: "Mortgage / kredi hesaplayıcı — ihaleal.com",
    description: "Taksit ve faiz tahmini için örnek hesaplama aracı.",
  },
  "/evraklar": {
    title: "Katılım evrakları — ihaleal.com",
    description: "İhale ve tapu süreçlerinde sık istenen belgelerin kontrol listesi (bilgilendirme).",
  },
  "/ihale-kosullari": {
    title: "İhale koşulları ve komisyon — ihaleal.com",
    description: "Platform kuralları ve komisyon çerçevesi için taslak metinler.",
  },
  "/kvkk": {
    title: "KVKK aydınlatma — ihaleal.com",
    description: "Kişisel verilerin işlenmesine ilişkin bilgilendirme metni.",
  },
  "/gizlilik": {
    title: "Gizlilik politikası — ihaleal.com",
    description: "Veri saklama, çerezler ve üçüncü taraflar hakkında bilgi.",
  },
  "/cerez-politikasi": {
    title: "Çerez politikası — ihaleal.com",
    description: "Çerez türleri ve tercihleriniz hakkında bilgilendirme.",
  },
  "/guvenlik": {
    title: "Güvenlik merkezi — ihaleal.com",
    description: "Hesap güvenliği ve en iyi uygulamalar (bilgilendirme).",
  },
  "/reklam": {
    title: "Reklam ve tanıtım videoları — ihaleal.com",
    description: "Platform tanıtımı ve kısa video içerikleri.",
  },
  "/sat-basla": {
    title: "Satıcı modu — ihaleal.com",
    description: "İlan ve ihale ile satış için başlangıç rehberi.",
  },
  "/giris": { title: "Giriş — ihaleal.com", description: "Hesabınıza giriş yapın (demo, yerel tarayıcı)." },
  "/kayit": { title: "Kayıt — ihaleal.com", description: "Yeni hesap oluşturun (demo, yerel tarayıcı)." },
  "/profil": { title: "Profil — ihaleal.com", description: "Hesap bilgileriniz ve güvenlik özeti (demo)." },
  "/favoriler": { title: "Favori ilanlar — ihaleal.com", description: "Kaydettiğiniz gayrimenkul ihale ve ilanları görüntüleyin." },
  "/harita": { title: "Harita — ihaleal.com", description: "İlanları harita üzerinde keşfedin (demo veri)." },
  "/dashboard": {
    title: "Hesap paneli — ihaleal.com",
    description: "Seçilen kullanıcı akışına göre kısayollar; demo oturum.",
  },
  "/dashboard/yatirimci": {
    title: "Yatırımcı portföyü — ihaleal.com",
    description: "Favori ilanlar ve grafik özetleri (demo veri).",
  },
  "/sehirler": { title: "Şehir rehberi — ihaleal.com", description: "Şehirlere göre ilan ve bölge notları." },
  "/rehber": { title: "Yardım rehberi — ihaleal.com", description: "İhale ve platform kullanımı için rehber." },
  "/nasil-calisir": {
    title: "Nasıl çalışır — ihaleal.com",
    description: "İlan, teklif ve ihale akışları; demo ve taslak metinler.",
  },
  "/how-it-works": {
    title: "Nasıl çalışır — ihaleal.com",
    description: "Platform tanıtımı, dört adım, beş rol yolculuğu, belgeler ve sözleşmeler.",
  },
  "/how-it-works/adim/kesfet": {
    title: "Adım 1: Keşfet — ihaleal.com",
    description: "İlan keşfi, analiz ve karar destek araçları.",
  },
  "/how-it-works/adim/teklif": {
    title: "Adım 2: Teklif ver — ihaleal.com",
    description: "Canlı ihale ve kapalı teklif süreçleri.",
  },
  "/how-it-works/adim/kazan": {
    title: "Adım 3: Kazan — ihaleal.com",
    description: "Kapanış, bildirim ve sözleşme adımları.",
  },
  "/how-it-works/adim/teslim": {
    title: "Adım 4: Teslim al — ihaleal.com",
    description: "Ödeme, tapu ve teslim rehberi.",
  },
  "/yasal/agency-contract": {
    title: "Acentelik sözleşmesi taslağı — ihaleal.com",
    description: "agency_contract.md genel çerçeve (demo, avukat onayı gerekir).",
  },
  "/ihale-ac": { title: "İlan / ihale aç — ihaleal.com", description: "Satıcı olarak ilan oluşturma akışı (demo, tarayıcıda saklama)." },
  "/ekspertiz": { title: "Ekspertiz ve uzman görüşü — ihaleal.com", description: "Değerleme ve rapor süreçleri hakkında bilgilendirme." },
  "/degisiklikler": { title: "Değişiklik kayıtları — ihaleal.com", description: "Sürüm ve özellik güncellemeleri özeti." },
  "/karsilastir-rakipler": { title: "Rakip karşılaştırma — ihaleal.com", description: "Pazar ve özellik karşılaştırması (bilgilendirme)." },
  "/yedekleme": { title: "Yedekleme ve felaket kurtarma — ihaleal.com", description: "Veri dayanıklılığı hedefleri (taslak)." },
  "/yasal-cerceve": { title: "Yasal çerçeve — ihaleal.com", description: "Platform hukuki çerçeve taslağı." },
  "/canliya-hazirlik": { title: "Canlıya hazırlık — ihaleal.com", description: "Kontrol listesi ve operasyonel hazırlık." },
  "/komisyon-modeli": {
    title: "Komisyon modeli — ihaleal.com",
    description: "Yalnızca komisyon: ilan, vitrin ve kullanıcıya satılan reklam ücreti yok (hedef). Kira: kiraya verenden bir aylık kira çizgisi (taslak).",
  },
  "/veri-ve-endeks": {
    title: "İhaleal Endeksi ve veri stratejisi — ihaleal.com",
    description:
      "İhale akışına bağlı çoklu sinyal: bölge bandı, talep ve yapay zeka özetleri; lisanslı veri entegrasyon planı ve demo sınırları.",
  },
  "/onboarding/akis": {
    title: "Kullanıcı akışı seçimi — ihaleal.com",
    description: "İlan, ihale satıcı, teklif veren veya izleyici akışları için evrak taslağı (demo).",
  },
  "/auth/edevis-mock": {
    title: "e-Devlet yetki (demo) — ihaleal.com",
    description: "Akış B için yetki simülasyonu; gerçek e-Devlet yok.",
  },
  "/ilan": {
    title: "İlan detayı — ihaleal.com",
    description: "Gayrimenkul ilanı, fiyat, konum ve ihale bilgileri (demo içerik).",
  },
  "/ilanlar": {
    title: "Tüm ihaleler — ihaleal.com",
    description: "Şehir, tip ve duruma göre filtrelenmiş demo ihale listesi.",
  },
  "/iletisim": {
    title: "İletişim — ihaleal.com",
    description: "Destek ve iş birliği için iletişim kanalları (demo).",
  },
  "/hakkimizda": {
    title: "Hakkımızda — ihaleal.com",
    description: "ihaleal.com vizyonu ve platform özeti (bilgilendirme).",
  },
  "/raporlar": {
    title: "Analiz belgeleri — ihaleal.com",
    description: "Piyasa ve operasyon özetleri (demo içerik).",
  },
  "/blog": {
    title: "Blog — ihaleal.com",
    description: "Gayrimenkul ve ihale ekosistemine dair yazılar (demo).",
  },
  "/emlakciler": {
    title: "Ortak emlakçılar — ihaleal.com",
    description: "Demo emlakçı profilleri ve performans özetleri.",
  },
  "/panel": {
    title: "Hesap paneli — ihaleal.com",
    description: "Özet, mesajlar ve evraklar için kullanıcı alanı (demo).",
  },
  "/mesajlar": {
    title: "Mesajlar — ihaleal.com",
    description: "Teklif ve görüşme kutusu (demo akış).",
  },
  "/belgeler": {
    title: "Belgelerim — ihaleal.com",
    description: "Yüklenen evrakların özeti (demo).",
  },
  "/ayarlar": {
    title: "Ayarlar — ihaleal.com",
    description: "Hesap ve bildirim tercihleri (demo).",
  },
  "/komisyon-hesaplayici": {
    title: "Komisyon hesaplayıcı — ihaleal.com",
    description: "Üyelik, hizmet bedeli ve satış komisyonu tahmini (demo).",
  },
  "/sifremi-unuttum": {
    title: "Şifre sıfırlama — ihaleal.com",
    description: "Hesap kurtarma akışı (taslak / demo).",
  },
  "/yasal-master-brief": {
    title: "Yasal özet brif — ihaleal.com",
    description: "Master hukuk özeti ve bağlantılı politikalar (taslak).",
  },
};

export function getSeoForPath(pathname: string) {
  const landing = SEO_LANDING_PAGES.find((p) => p.path === pathname);
  if (landing) {
    return { title: landing.title, description: landing.description };
  }
  if (pathname.startsWith("/ilan/")) {
    return ROUTE_SEO["/ilan"] ?? DEFAULT_SEO;
  }
  if (pathname.startsWith("/sehir/")) {
    return {
      title: "Şehir sayfası — ihaleal.com",
      description: "Seçilen şehir için ilanlar ve bölge notları (demo).",
    };
  }
  if (pathname.startsWith("/rapor/")) {
    return {
      title: "Belge detayı — ihaleal.com",
      description: "Analiz ve bilgilendirme metni (demo).",
    };
  }
  if (pathname.startsWith("/blog/")) {
    return {
      title: "Blog yazısı — ihaleal.com",
      description: "Gayrimenkul ve ihale ekosistemine dair yazı (demo).",
    };
  }
  if (pathname.startsWith("/emlakci/")) {
    return {
      title: "Emlakçı profili — ihaleal.com",
      description: "Ofis özeti ve demo performans göstergeleri.",
    };
  }
  if (pathname.startsWith("/panel/")) {
    return ROUTE_SEO["/panel"] ?? DEFAULT_SEO;
  }
  return ROUTE_SEO[pathname] ?? DEFAULT_SEO;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

const OG_IMAGE_ALT = "ihaleal.com — gayrimenkul ihale ve analiz platformu ön izleme görseli";

function upsertJsonLd(id: string, json: Record<string, unknown>) {
  const prev = document.getElementById(id);
  prev?.remove();
  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.text = JSON.stringify(json);
  document.head.appendChild(script);
}

function humanizeSegment(segment: string): string {
  return decodeURIComponent(segment)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function injectStructuredData(pathname: string, search: string, title: string, description: string) {
  const shareUrl = getShareUrlForPath(pathname, search);
  const pathSegments = pathname.split("/").filter(Boolean);
  const itemListElement = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Ana Sayfa",
      item: getShareUrlForPath("/", ""),
    },
    ...pathSegments.map((segment, index) => ({
      "@type": "ListItem",
      position: index + 2,
      name: humanizeSegment(segment),
      item: getShareUrlForPath(`/${pathSegments.slice(0, index + 1).join("/")}`, ""),
    })),
  ];

  upsertJsonLd("jsonld-breadcrumb", {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  });

  upsertJsonLd("jsonld-organization", {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ihaleal.com",
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/ihaleal_com_logo.png`,
    sameAs: [SITE_ORIGIN],
    description:
      "Yapay zeka destekli gayrimenkul ihale, analiz ve operasyon platformu.",
  });

  if (pathname.startsWith("/ilan/") || pathname.startsWith("/ihale/")) {
    const fallbackName = title.replace(/\s—\sihaleal\.com$/i, "").trim();
    const domName =
      document.querySelector("h1")?.textContent?.trim() ||
      document.querySelector("[data-listing-title]")?.textContent?.trim() ||
      fallbackName ||
      "Gayrimenkul ilanı";
    upsertJsonLd("jsonld-real-estate-listing", {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: domName,
      description,
      url: shareUrl,
      image: `${SITE_ORIGIN}${OG_IMAGE.path}`,
      offers: {
        "@type": "Offer",
        priceCurrency: "TRY",
        availability: "https://schema.org/InStock",
      },
    });
    return;
  }

  document.getElementById("jsonld-real-estate-listing")?.remove();
}

export function applySeoToDocument(pathname: string, search: string) {
  const { title, description } = getSeoForPath(pathname);
  document.title = title;
  setMeta("name", "description", description);
  const shareUrl = getShareUrlForPath(pathname, search);
  const ogImageUrl = `${SITE_ORIGIN}${OG_IMAGE.path}`;
  const canonicalRoot = getCanonicalHref();
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", shareUrl);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:image", ogImageUrl);
  setMeta("property", "og:image:width", String(OG_IMAGE.width));
  setMeta("property", "og:image:height", String(OG_IMAGE.height));
  setMeta("property", "og:image:alt", OG_IMAGE_ALT);
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:url", shareUrl);
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", ogImageUrl);
  setMeta("name", "twitter:image:alt", OG_IMAGE_ALT);
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = canonicalRoot;
  injectStructuredData(pathname, search, title, description);
}
