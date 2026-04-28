// src/lib/fees.ts
// TEK KAYNAK: komisyon, KDV, iade penceresi, ödeme süreleri.
// Bu dosya dışında elle yüzde/TL string'i YAZMA — buradan import et.

export const COMMISSION_MODEL = "seller_only" as
  | "seller_only"
  | "buyer_only"
  | "both_sides"; // Karar §D-K1 — kullanıcı onayı bekliyor.

export const FEES = {
  // Yüzdeler 0-1 aralığında (0.05 = %5).
  sellerCommissionRate: 0.05,
  buyerCommissionRate: 0.0,
  vatRate: 0.2, // KDV %20 (2026 itibarıyla; mevzuat değişirse buradan)
  minCommissionTRY: 250,
  /** İhaleye katılım öncesi teminat / bid bond oranı (demo). §D-K1/K8 sonrası güncellenir. */
  bidBondRate: 0.05,
  /** Sabit kapora referansı (TL) — bazı süreçlerde oran yerine taban tutar (demo). */
  depositTRY: 5000,
  /**
   * Demoda kalan sayısal örnekler (test uyumu). Hedef ürün politikası: ilan paketi / vitrin ücreti yok;
   * bu alanlar UI’da teklif edilmez — yalnızca komisyon (+ kira kuralı businessModel’de).
   */
  listingPackages: {
    standart: 199,
    vitrin: 699,
    doping_plus: 1299,
    pro: 2999,
  } as const,
  /** Kapora iadesi (kaybeden) — saat cinsinden bilgilendirme metni için. */
  bidBondRefundHoursLoser: 48,
  /** Kazanan ödeme temerrüdü — saat. */
  bidBondForfeitWinnerHours: 24,
  // Süreler gün cinsinden.
  refundWindowDays: 14,
  payoutHoldDays: 7, // İhale bitiminden sonra escrow tutma süresi.
} as const;

/** Tapu harcı — demo oran; resmi tarife §D / hukuk ile güncellenir. */
export const DEED_DUTY_RATE = 0.04 as const;

/** Sabit masraf kalemi (döner sermaye vb.) — demo. */
export const OTHER_FEES_FIXED_TRY = 1200 as const;

// Yardımcılar — UI'da hesap göstermek için.
export function calcSellerNet(salePriceTRY: number): {
  gross: number;
  commission: number;
  vatOnCommission: number;
  net: number;
} {
  const gross = salePriceTRY;
  const commission = Math.max(
    gross * FEES.sellerCommissionRate,
    FEES.minCommissionTRY
  );
  const vatOnCommission = commission * FEES.vatRate;
  const net = gross - commission - vatOnCommission;
  return { gross, commission, vatOnCommission, net };
}

export function calcBuyerTotal(bidPriceTRY: number): {
  bid: number;
  commission: number;
  vatOnCommission: number;
  total: number;
} {
  const bid = bidPriceTRY;
  const commission =
    COMMISSION_MODEL === "buyer_only" || COMMISSION_MODEL === "both_sides"
      ? bid * FEES.buyerCommissionRate
      : 0;
  const vatOnCommission = commission * FEES.vatRate;
  const total = bid + commission + vatOnCommission;
  return { bid, commission, vatOnCommission, total };
}

/** Kazanan alıcı: teklif + `calcBuyerTotal` + tapu + sabit masraf (demoda tek kaynak). */
export function estimateBuyerClosingCosts(bidTRY: number): {
  bid: number;
  commission: number;
  vatOnCommission: number;
  deed: number;
  fixed: number;
  total: number;
} {
  const { bid, commission, vatOnCommission } = calcBuyerTotal(bidTRY);
  const deed = Math.round(bidTRY * DEED_DUTY_RATE);
  const fixed = OTHER_FEES_FIXED_TRY;
  const total = bid + commission + vatOnCommission + deed + fixed;
  return { bid, commission, vatOnCommission, deed, fixed, total };
}

/** Kısa rozet etiket (UI badge). */
export function feeBadgeLabel(): string {
  return `%${(FEES.sellerCommissionRate * 100).toFixed(0)} + KDV (satıcı)`;
}

export function formatBidBondPercent(): string {
  return `%${(FEES.bidBondRate * 100).toFixed(0)}`;
}

export type ListingPackageTier = keyof typeof FEES.listingPackages;

export function getListingPackagePrice(tier: ListingPackageTier): number {
  return FEES.listingPackages[tier];
}

/** Teklif / ihale tutarı üzerinden teminat (TL, yuvarlanmış). */
export function calcBidBond(bidAmountTRY: number): number {
  return Math.round(bidAmountTRY * FEES.bidBondRate);
}

/** Açılış / liste fiyatının referans piyasaya oranı — üstünde uyarı (demo moderasyon kuralı). */
export const LISTING_PRICE_ANOMALY_RATIO = 1.35 as const;

export function listingPriceAnomalyMessage(startTRY: number, referenceTRY: number): string | null {
  if (!Number.isFinite(startTRY) || !Number.isFinite(referenceTRY) || referenceTRY <= 0 || startTRY <= 0) {
    return null;
  }
  if (startTRY > referenceTRY * LISTING_PRICE_ANOMALY_RATIO) {
    const pct = Math.round((LISTING_PRICE_ANOMALY_RATIO - 1) * 100);
    return `Başlangıç fiyatı, referans değerden yaklaşık %${pct} yüksek. Ekspertiz veya referans fiyatı gözden geçirin; üretimde moderasyon veya onay akışı eklenebilir.`;
  }
  return null;
}

/** @deprecated Tur #4+ için `calcBidBond` kullanın; uyumluluk için alias. */
export function calcBidBondAmount(auctionOrBidTRY: number): number {
  return calcBidBond(auctionOrBidTRY);
}

// Görüntüleme için hazır metin (UI'da elle string yazma).
export const FEE_TEXTS = {
  sellerSummary: () =>
    `Satıcı komisyonu: %${(FEES.sellerCommissionRate * 100).toFixed(1)}` +
    ` (asgari ${FEES.minCommissionTRY} TL) + KDV %${(FEES.vatRate * 100).toFixed(0)}`,
  refundWindow: () => `${FEES.refundWindowDays} gün içinde iade`,
  payoutHold: () => `İhale bitiminden ${FEES.payoutHoldDays} gün sonra ödeme`,
  bidBondLine: () =>
    `İhaleye katılmadan önce ${formatBidBondPercent()} teminat (iadeli, taslak); sabit kapora referansı ${FEES.depositTRY.toLocaleString("tr-TR")} TL (§D-K8 öncesi). Kaybeden iade hedefi: ${FEES.bidBondRefundHoursLoser} saat.`,
  bidBondForfeitLine: () =>
    `Kazanan ödeme yapmazsa ${formatBidBondPercent()} teminat cezası (taslak; ${FEES.bidBondForfeitWinnerHours} saat referansı).`,
  /** Tek cümle gelir modeli — Hero / komisyon sayfası ile hizalı */
  monetizationPrinciples: () =>
    "Hedef: yalnızca başarılı işlem komisyonu; ilan, vitrin veya kullanıcıya satılan reklam ücreti yok. Kira: kiraya verenden bir aylık kira çizgisi (sözleşmede netleşir).",
  /** Komisyon matrahı — taahhüt / kapanış ile ürün dili hizası (hukuki metin değil). */
  commissionMatrahLine: () =>
    "Komisyon (hedef): tapu veya sözleşmede netleşen anlaşılan işlem tutarı üzerinden; taahhüt alt–üst limit bandı varsa matrah bu çerçevede avukat taslağıyla tanımlanır.",
} as const;
