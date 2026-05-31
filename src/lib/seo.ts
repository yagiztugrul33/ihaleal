import { SEO_LANDING_PAGES } from "@/data/seoLandings";
import { resolveProgrammaticRoute, buildSeoTitle, buildSeoDescription, findProvince } from "@/lib/seo/programmaticSeo";
import { findGuideBySlug } from "@/data/realEstateGuides";
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
  "/yasal/agency-contract": {
    title: "Acentelik sözleşmesi taslağı — ihaleal.com",
    description: "agency_contract.md genel çerçeve (demo, avukat onayı gerekir).",
  },
  "/ihale-ac": { title: "İlan / ihale aç — ihaleal.com", description: "Satıcı olarak ilan oluşturma akışı (demo, tarayıcıda saklama)." },
  "/ekspertiz": { title: "Ekspertiz ve uzman görüşü — ihaleal.com", description: "Değerleme ve rapor süreçleri hakkında bilgilendirme." },
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
  "/konut-kredisi-hesaplayici": {
    title: "Konut kredisi hesaplayıcı — ihaleal.com",
    description: "Kredi tutarı, vade ve faiz oranına göre aylık taksit ve toplam geri ödeme tahmini.",
  },
  "/borsa": {
    title: "İhaleal Borsa — canlı piyasa endeksi — ihaleal.com",
    description: "Bölgesel fiyat endeksi, işlem hacmi ve canlı ilan sinyalleri.",
  },
  "/bildirimler": {
    title: "Bildirimler — ihaleal.com",
    description: "Hesap ve ilan bildirimleriniz.",
  },
  "/modul/parsel-zekasi": {
    title: "Parsel zekası modülü — ihaleal.com",
    description: "Parsel ve imar zekası analiz modülü.",
  },
  "/modul/ges-analizi": {
    title: "GES analizi modülü — ihaleal.com",
    description: "Güneş enerjisi arazi ve proje analizi modülü.",
  },
  "/modul/degerleme": {
    title: "Değerleme modülü — ihaleal.com",
    description: "Gayrimenkul değerleme ve rapor modülü.",
  },
  "/modul/kentsel-donusum": {
    title: "Kentsel dönüşüm modülü — ihaleal.com",
    description: "Kentsel dönüşüm bölgeleri ve proje haritası.",
  },
  "/modul/afet-risk-haritasi": {
    title: "Afet risk haritası — ihaleal.com",
    description: "Bölgesel afet risk katmanları ve harita görünümü.",
  },
  "/modul/afet-toplanma-alanlari": {
    title: "Afet toplanma alanları — ihaleal.com",
    description: "Yakın toplanma alanları haritası ve listesi.",
  },
  "/sifremi-unuttum": {
    title: "Şifre sıfırlama — ihaleal.com",
    description: "Hesap kurtarma akışı (taslak / demo).",
  },
  "/yasal-master-brief": {
    title: "Yasal özet brif — ihaleal.com",
    description: "Master hukuk özeti ve bağlantılı politikalar (taslak).",
  },
  "/kampanyalar": {
    title: "Kampanyalar — ihaleal.com",
    description: "Gayrimenkul yatırım ve ihale kampanyaları.",
  },
  "/proje": {
    title: "Lansman projesi — ihaleal.com",
    description: "Müteahhit lansman projesi, birim listesi ve konum bilgisi.",
  },
  "/kyc": {
    title: "Kimlik doğrulama — ihaleal.com",
    description: "KYC ve hesap doğrulama adımları.",
  },
  "/hizmet-bedelleri": {
    title: "Hizmet bedelleri — ihaleal.com",
    description: "Platform üyelik ve hizmet bedeli özeti.",
  },
  "/uluslararasi": {
    title: "Uluslararası yatırımcı — ihaleal.com",
    description: "Yabancı yatırımcılar için Türkiye gayrimenkul rehberi.",
  },
};

export function getSeoForPath(pathname: string) {
  const landing = SEO_LANDING_PAGES.find((p) => p.path === pathname);
  if (landing) {
    return { title: landing.title, description: landing.description };
  }
  const progMatch = pathname.match(/^\/(satilik|kiralik)\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);
  if (progMatch) {
    const route = resolveProgrammaticRoute(progMatch[1], progMatch[2], progMatch[3], progMatch[4]);
    if (route) {
      return { title: buildSeoTitle(route), description: buildSeoDescription(route) };
    }
  }
  const borsaCity = pathname.match(/^\/borsa\/sehir\/([^/]+)$/);
  if (borsaCity) {
    const p = findProvince(borsaCity[1]);
    if (p) {
      return {
        title: `${p.name} gayrimenkul fiyat endeksi — ihaleal.com`,
        description: `${p.name} bölgesi price_index ve güncel ilanlar.`,
      };
    }
  }
  const rehberMatch = pathname.match(/^\/rehber\/([^/]+)$/);
  if (rehberMatch) {
    const g = findGuideBySlug(rehberMatch[1]);
    if (g) {
      return { title: `${g.title} — ihaleal.com`, description: g.seoDescription };
    }
  }
  if (pathname.startsWith("/ilan/")) {
    return ROUTE_SEO["/ilan"] ?? DEFAULT_SEO;
  }
  if (pathname.startsWith("/proje/")) {
    return ROUTE_SEO["/proje"] ?? DEFAULT_SEO;
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
  if (pathname.startsWith("/modul/")) {
    return (
      ROUTE_SEO[pathname] ?? {
        title: "Analiz modülü — ihaleal.com",
        description: "Gayrimenkul analiz ve bilgi modülü.",
      }
    );
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

/**
 * Per-route OG image override. Default /og-image.png; rotaya özel
 * varlığı public/'te varsa burada eşlenir. Sosyal paylaşımda her sayfanın
 * kendi bağlamı görünür (LinkedIn/Twitter/WhatsApp önizleme kalitesi).
 *
 * Gelecek: /ilan/:id ve /proje/:id için Edge function ile dinamik
 * OG generator (mülk fotoğrafı + fiyat + lokasyon overlay).
 */
type OgImageConfig = { path: string; width: number; height: number; alt?: string };

const ROUTE_OG_IMAGE: Record<string, OgImageConfig> = {
  "/borsa": {
    path: "/social/share-card-1200.png",
    width: 1200,
    height: 630,
    alt: "İhaleal Borsa — canlı gayrimenkul piyasa terminali",
  },
};

function getOgImageFor(pathname: string): { url: string; width: number; height: number; alt: string } {
  const override = ROUTE_OG_IMAGE[pathname];
  if (override) {
    return {
      url: `${SITE_ORIGIN}${override.path}`,
      width: override.width,
      height: override.height,
      alt: override.alt ?? OG_IMAGE_ALT,
    };
  }
  return {
    url: `${SITE_ORIGIN}${OG_IMAGE.path}`,
    width: OG_IMAGE.width,
    height: OG_IMAGE.height,
    alt: OG_IMAGE_ALT,
  };
}

// SEO-temizleyici: prod'da meta/title'dan "demo" ibarelerini çıkarır.
// Geliştirme/dev ortamında olduğu gibi bırakır (test sırasında uyari ihtiyacı).
function sanitizeForProd(text: string): string {
  if (!import.meta.env.PROD) return text;
  return text
    .replace(/\s*\(demo[^)]*\)\s*/gi, " ")
    .replace(/\s*[—-]\s*demo[^—\n]*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Iç doküman sayfaları — kullanıcı linklerinden çıkarıldı + SEO noindex.
// Route hala çalışır (URL bilen iç ekip erişebilir) ama Google ve preview
// crawler'larına "indekslenmesin" sinyali gider.
const NOINDEX_PATHS = new Set<string>([
  "/nihai-anayasa",
  "/platform-cerceve",
  "/anayasa",
  "/anayasa-400",
]);

export function applySeoToDocument(pathname: string, search: string) {
  const raw = getSeoForPath(pathname);
  const title = sanitizeForProd(raw.title);
  const description = sanitizeForProd(raw.description);
  document.title = title;
  setMeta("name", "description", description);
  const shareUrl = getShareUrlForPath(pathname, search);
  const og = getOgImageFor(pathname);
  const canonicalRoot = getCanonicalHref(pathname);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", shareUrl);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:image", og.url);
  setMeta("property", "og:image:width", String(og.width));
  setMeta("property", "og:image:height", String(og.height));
  setMeta("property", "og:image:alt", og.alt);
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:url", shareUrl);
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", og.url);
  setMeta("name", "twitter:image:alt", og.alt);
  // robots meta — iç doküman rotalarinda noindex/nofollow
  if (NOINDEX_PATHS.has(pathname)) {
    setMeta("name", "robots", "noindex, nofollow");
  } else {
    setMeta("name", "robots", "index, follow");
  }
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = canonicalRoot;
}
