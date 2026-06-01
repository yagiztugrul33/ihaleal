import type { Auction, PropertyMarketingMode } from "@/types/auction";
import { normalizeAuctionImages } from "@/lib/listingImage";
import { FRAUD_DEFENSE_PRODUCT_RULES } from "@/legal/fraudDefenseFramework";
import { computeListingNumber } from "@/lib/listingNumber";

/** Listede gösterilen aracılık — büyük emlak ağında ofis kartında danışman adı göründüğü gibi burada yetkili adı ihaleal.com’dur. */
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
    hint: "Fiyat ilanda görünür; doğrudan alıcı–satıcı hattı yok. Talepler ihaleal.com üzerinden (büyük emlak ağında ofis kartındaki danışman adı gibi kartta platform adı).",
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

/** Ortak bütünlük satırları (satış ve kiralık / devren). */
const INTEGRITY_RULES_COMMON_TRAIL: string[] = [
  "Gerçek satıcı / kiraya veren ve gerçek alıcı / kiracı: tapu veya yetki doğrulaması olmadan sürece girilememesi hedeflenir.",
  "Sahte teklif, oyun amaçlı ihaleye girme veya gerçeğe aykırı fiyat bildirimi yasaktır; tespitte hesap dondurma, teminat iradı ve sözleşmedeki cezai şartlar (avukat taslağı).",
  "Referans veya piyasa bandı dışında aşırı açılışlar moderasyon veya ret ile kontrol edilir (fees.ts + politika).",
  "Teklif ve ihaleye katılım: Findeks / KYC çizgisi tamamlanmadan son adım yok (hedef).",
];

/** Satış (ve satışa özgü SPK / tapu vurgusu). */
const INTEGRITY_RULES_SALE_TRAIL: string[] = [
  "İlanda SPK uzmanı ekspertiz raporu çizgisi: şerh, ipotek, haciz ve benzeri hukuki durumlar raporda yer alır; evrak sahteciliği riskine karşı AI destekli ön tarama + insan onayı hedeflenir (hukuki son söz uzman/avukat).",
  "Taahhüt edilen alt/üst limit bandında anlaşma matrahı; limite ulaşıldığında işlemi tamamlama yükümlülüğü ve ihlalde cezai şartlar sözleşmede (satıcı, alıcı, kiracı, kiraya veren simetrisi — üretim).",
  "Belediye / imar planı / resmi karar özeti alıcıya ayrı butonla gösterilir; tapu sonrası sürpriz kalmaması hedeflenir.",
  "Lansman ve ön satış: ilan metni ile teknik şartname ve ruhsat özeti aynı versiyon zinciriyle eşlenir; platform dışı kapora, şahsi IBAN veya mesajla aradan kapanma politika ve sözleşmede yasaktır; özet çerçeve /yasal/dolandiricilik-savunmasi (hedef operasyon + avukat metni).",
];

/** Kiralık (normal); satış SPK / tapu sonrası cümleleri bu hatta yok. */
const INTEGRITY_RULES_RENT_TRAIL: string[] = [
  "Kiralık hattında: platform hizmet bedeli matrahı hedef olarak 1 aylık kira + KDV; kampanya varsa ilan politikasina göre (agency_contract, rentalCommissionEngine ile uyum hedefi).",
  "Taahhüt edilen alt/üst limit bandı kiralıkta da geçerlidir; ihlalde cezai şartlar sözleşmede (kiracı–kiraya veren simetrisi — üretim).",
  "Durum / ekspertiz özeti: şerh, ipotek (kiralanan üzerinde), demirbas ve kullanım uygunluğu bilgilendirilir; evrak sahteciliğine karşı AI ön tarama + insan onayı (hedef).",
  "Belediye / imar / işyeri ruhsatı özeti kiracıya ayrı butonla gösterilir; teslim ve kira başlangıcı öncesi sürpriz kalmaması hedeflenir.",
];

/** Devren kiralık ek satırlar (devir bedeli ≠ komisyon matrahı). */
const INTEGRITY_RULES_DEVREN_APPEND: string[] = [
  "Devren kiralık: devir / key bedeli ile aylık kira ayrı tutulur; platform komisyonu yalnızca kira matrahına bağlıdır. E-provizyon hesabı (kira + devir) toplamına göre yapılır; detay rentalConstitutionTexts ve rentalCommissionEngine (hedef).",
];

export type IntegrityDealContext = "sale" | "rent" | "rent_devren";

function buildIntegrityRulesSummary(ctx: IntegrityDealContext): string[] {
  const base = [...FRAUD_DEFENSE_PRODUCT_RULES, ...INTEGRITY_RULES_COMMON_TRAIL];
  if (ctx === "sale") return [...base, ...INTEGRITY_RULES_SALE_TRAIL];
  if (ctx === "rent_devren") return [...base, ...INTEGRITY_RULES_RENT_TRAIL, ...INTEGRITY_RULES_DEVREN_APPEND];
  return [...base, ...INTEGRITY_RULES_RENT_TRAIL];
}

/**
 * İlan kartı / detay: kiralık ve devren hattında satışa özgü SPK–tapu cümlelerini göstermez.
 * `devren`: kiralık ilanda başlık veya kategoride "devren" geçmesi (ör. "Devren kafe").
 */
export function resolveIntegrityDealContext(a: Pick<Auction, "dealType" | "category" | "title">): IntegrityDealContext {
  const dealType = a.dealType ?? (a.category === "Kiralık" ? "rent" : "sale");
  if (dealType !== "rent") return "sale";
  const hay = `${a.category ?? ""} ${a.title ?? ""}`.toLowerCase();
  if (hay.includes("devren")) return "rent_devren";
  return "rent";
}

export function integrityRulesSummaryForAuction(a: Pick<Auction, "dealType" | "category" | "title">): string[] {
  return buildIntegrityRulesSummary(resolveIntegrityDealContext(a));
}

/** Varsayılan satış hattı (yasal sayfa referansı ve geriye dönük import). */
export const INTEGRITY_RULES_SUMMARY = buildIntegrityRulesSummary("sale");

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
  const listingNumber =
    typeof a.listingNumber === "string" && a.listingNumber.trim().length > 0
      ? a.listingNumber.trim()
      : computeListingNumber(a.id, a.endDate);
  return {
    ...a,
    images: normalizeAuctionImages(a.images),
    contactViaPlatform: a.contactViaPlatform !== false,
    dealType,
    marketingMode,
    negotiationMode,
    buyNowPriceTry,
    listingNumber,
  };
}
