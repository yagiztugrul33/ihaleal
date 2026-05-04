import type { Auction, PropertyMarketingMode } from "@/types/auction";
import { normalizeAuctionImages } from "@/lib/listingImage";

/** Listede gösterilen aracılık — RE/MAX’ta ofis kartında danışman adı göründüğü gibi burada yetkili adı ihaleal.com’dur. */
export const PLATFORM_LISTING_CONTACT = {
  displayName: "ihaleal.com",
  roleLine: "Yetkili aracılık — iletişim platform üzerinden",
  detailLine:
    "Alıcı, satıcı, kiracı ve kiraya veren; ilanda doğrudan telefon yerine ihaleal.com ile muhatap olur. Teklif ve ihale süreçlerinde platform teklifleri size iletir; yetki sözleşmesi ile taraflar süreci platform dışına taşımadan yürütür (üretim hedefi; şu an demo).",
} as const;

export const MARKETING_MODE_LABELS: Record<
  PropertyMarketingMode,
  { badge: string; headline: string; hint: string }
> = {
  listing_only: {
    badge: "Sadece ilan",
    headline: "Yalnız ilan yayını",
    hint: "Fiyat ilanda görünür; doğrudan alıcı–satıcı hattı yok. Talepler ihaleal.com üzerinden (RE/MAX ofis kartındaki danışman adı gibi kartta platform adı).",
  },
  sealed_offers: {
    badge: "Teklif al",
    headline: "Kapalı teklif süreci",
    hint: "Teklifler kayıt altında; kimlik bilgileri ilanda yer almaz. Kabul sonrası sözleşme ve evrak platform çizgisinde (hedef).",
  },
  auction: {
    badge: "İhale",
    headline: "Açık artırma",
    hint: "Teklifler sıralı ve kurallı; sahte veya keyfi teklif için hesap kısıtı ve cezai şartlar sözleşmede (hedef).",
  },
};

/** Sahte / keyfi davranışa karşı ürün özeti (hukuki metin değil). */
export const INTEGRITY_RULES_SUMMARY = [
  "Gerçek satıcı / kiraya veren ve gerçek alıcı / kiracı: tapu veya yetki doğrulaması olmadan sürece girilememesi hedeflenir.",
  "Sahte teklif, oyun amaçlı ihaleye girme veya gerçeğe aykırı fiyat bildirimi yasaktır; tespitte hesap dondurma, teminat iradı ve sözleşmedeki cezai şartlar (avukat taslağı).",
  "Referans veya piyasa bandı dışında aşırı açılışlar moderasyon veya ret ile kontrol edilir (fees.ts + politika).",
  "Teklif ve ihaleye katılım: Findeks / KYC çizgisi tamamlanmadan son adım yok (hedef).",
  "İlanda SPK uzmanı ekspertiz raporu çizgisi: şerh, ipotek, haciz ve benzeri hukuki durumlar raporda yer alır; evrak sahteciliği riskine karşı AI destekli ön tarama + insan onayı hedeflenir (hukuki son söz uzman/avukat).",
  "Taahhüt edilen alt/üst limit bandında anlaşma matrahı; limite ulaşıldığında işlemi tamamlama yükümlülüğü ve ihlalde cezai şartlar sözleşmede (satıcı, alıcı, kiracı, kiraya veren simetrisi — üretim).",
  "Belediye / imar planı / resmi karar özeti alıcı veya kiracıya ayrı butonla gösterilir; tapu sonrası sürpriz kalmaması hedeflenir.",
];

export function resolveMarketingMode(a: Auction): PropertyMarketingMode {
  if (a.marketingMode) return a.marketingMode;
  if (a.negotiationMode === "sealed_offer") return "sealed_offers";
  return "auction";
}

/** Eski kayıtlar: alan yoksa platform iletişimi ve varsayılan mod. */
export function withListingDefaults<T extends Auction>(a: T): T {
  const dealType = a.dealType ?? (a.category === "Kiralık" ? "rent" : "sale");
  const marketingMode = resolveMarketingMode(a);
  const negotiationMode = a.negotiationMode ?? (marketingMode === "sealed_offers" ? "sealed_offer" : "auction");
  const buyNowPriceTry =
    a.buyNowPriceTry ??
    (marketingMode === "auction" && dealType !== "rent" && a.status === "live"
      ? Math.round(a.currentBid * 1.28)
      : undefined);
  return {
    ...a,
    images: normalizeAuctionImages(a.images),
    contactViaPlatform: a.contactViaPlatform !== false,
    dealType,
    marketingMode,
    negotiationMode,
    buyNowPriceTry,
  };
}
