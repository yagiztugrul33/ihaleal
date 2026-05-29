// src/lib/fees.ts — ihaleal.com komisyon, üyelik, hizmet bedeli merkezi
// Komisyon hedefi: %2 alıcı + %2 satıcı = toplam %4 (matrah üzerinden); KDV komisyon üzerinden.

export const COMMISSION_RATE = 0.02;
/** Tek taraf satıcı yüzdesi — iki taraflı modelde satıcı payı COMMISSION_RATE ile aynı */
export const SELLER_COMMISSION_RATE = COMMISSION_RATE;
export const VAT_RATE = 0.2;
export const COMMISSION_PARTIES: "seller_only" | "both" = "both";
export const MIN_COMMISSION_TRY = 0;

/** Geriye uyumluluk — UI/businessModel eski sabit adı */
export const COMMISSION_MODEL =
  COMMISSION_PARTIES === "both" ? ("both_sides" as const) : ("seller_only" as const);

export const MEMBERSHIP_FEES = {
  seller_yearly: 5000,
  buyer_yearly: 1000,
  agent_referral: 0,
  agent_portfolio: 0,
  agent_full: 0,
} as const;

export const MEMBERSHIP_DURATION_DAYS = 365;

export const SERVICE_FEES = {
  photo: 2500,
  drone: 1500,
  legal: 1000,
  expertise: 3000,
  bid_entry: 250,
  virtual_tour: 1500,
  video: 2000,
  tapu_prep: 750,
} as const;

export const SERVICE_FEE_LABELS: Record<keyof typeof SERVICE_FEES, string> = {
  photo: "Profesyonel Fotoğraf Çekim",
  drone: "Dron Çekim",
  legal: "Hukuki Danışmanlık",
  expertise: "Ekspertiz Raporu",
  bid_entry: "İhaleye Giriş",
  virtual_tour: "Sanal Tur 360°",
  video: "Video Tanıtım",
  tapu_prep: "Tapu Randevu / Dosya",
};

export const AGENT_SHARE_RATES = {
  referral: 0.005,
  portfolio: 0.015,
  full: 0.02,
} as const;

/** Ortak emlakçı B2B payı (matrah üzerinden) — demo varsayılan: tam işbirliği paketi */
export const REALTOR_B2B_RATE = AGENT_SHARE_RATES.full;

export const BID_BOND_RATE = 0.05;
// R12.6.b: Added for CommissionCalculator withdrawal penalty
export const WITHDRAWAL_PENALTY_RATE = 0.05;
export const MIN_INCREMENT_TRY = 100;
export const ANTI_SNIPING_THRESHOLD_SECONDS = 120;
export const ANTI_SNIPING_EXTEND_SECONDS = 120;

export interface CommissionBreakdown {
  saleAmount: number;
  sellerCommission: number;
  buyerCommission: number;
  totalCommission: number;
  totalVAT: number;
  offsetMembership: number;
  offsetServiceFees: number;
  offsetTotal: number;
  agentShare: number;
  platformNet: number;
}

export function calcCommissionBreakdown(
  saleAmount: number,
  paidMembership: number = 0,
  paidServiceFees: number = 0,
  agentShareRate: number = 0,
): CommissionBreakdown {
  const sellerCommission = saleAmount * COMMISSION_RATE;
  const buyerCommission = saleAmount * COMMISSION_RATE;
  const totalCommission = sellerCommission + buyerCommission;
  const totalVAT = totalCommission * VAT_RATE;
  const offsetTotal = paidMembership + paidServiceFees;
  const agentShare = saleAmount * agentShareRate;
  const platformNet = totalCommission - offsetTotal - agentShare;

  return {
    saleAmount,
    sellerCommission,
    buyerCommission,
    totalCommission,
    totalVAT,
    offsetMembership: paidMembership,
    offsetServiceFees: paidServiceFees,
    offsetTotal,
    agentShare,
    platformNet,
  };
}

/** Top-level FEES — mevcut sayfalar (LegalAuctionTerms, Guide, …) ile uyumlu */
export const FEES = {
  sellerCommissionRate: COMMISSION_RATE,
  buyerCommissionRate: COMMISSION_PARTIES === "both" ? COMMISSION_RATE : 0,
  vatRate: VAT_RATE,
  minCommissionTRY: MIN_COMMISSION_TRY,
  bidBondRate: BID_BOND_RATE,
  depositTRY: 5000,
  listingPackages: {
    standart: 0,
    vitrin: 0,
    doping_plus: 0,
    pro: 0,
  } as const,
  bidBondRefundHoursLoser: 48,
  bidBondForfeitWinnerHours: 24,
  refundWindowDays: 14,
  payoutHoldDays: 7,
} as const;

export const DEED_DUTY_RATE = 0.04 as const;
export const OTHER_FEES_FIXED_TRY = 1200 as const;

export function calcSellerNet(salePriceTRY: number): {
  gross: number;
  commission: number;
  vatOnCommission: number;
  net: number;
} {
  const gross = salePriceTRY;
  const commission = Math.max(gross * FEES.sellerCommissionRate, FEES.minCommissionTRY);
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
    COMMISSION_PARTIES === "both" ? bid * FEES.buyerCommissionRate : 0;
  const vatOnCommission = commission * FEES.vatRate;
  const total = bid + commission + vatOnCommission;
  return { bid, commission, vatOnCommission, total };
}

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

export function feeBadgeLabel(): string {
  return `%${(FEES.sellerCommissionRate * 100).toFixed(0)}+%${(FEES.buyerCommissionRate * 100).toFixed(0)} satıcı/alıcı + KDV`;
}

export function formatBidBondPercent(): string {
  return `%${(FEES.bidBondRate * 100).toFixed(0)}`;
}

export type ListingPackageTier = keyof typeof FEES.listingPackages;

/** @deprecated İlan paketi ücreti kaldırıldı — 0 döner */
export function getListingPackagePrice(_tier: ListingPackageTier): number {
  return 0;
}

export function calcBidBond(bidAmountTRY: number): number {
  return Math.round(bidAmountTRY * FEES.bidBondRate * 100) / 100;
}

export const LISTING_PRICE_ANOMALY_RATIO = 1.35 as const;

export function listingPriceAnomalyMessage(startTRY: number, referenceTRY: number): string | null {
  if (
    !Number.isFinite(startTRY) ||
    !Number.isFinite(referenceTRY) ||
    referenceTRY <= 0 ||
    startTRY <= 0
  ) {
    return null;
  }
  if (startTRY > referenceTRY * LISTING_PRICE_ANOMALY_RATIO) {
    const pct = Math.round((LISTING_PRICE_ANOMALY_RATIO - 1) * 100);
    return `Başlangıç fiyatı, referans değerden yaklaşık %${pct} yüksek. Ekspertiz veya referans fiyatı gözden geçirin; üretimde moderasyon veya onay akışı eklenebilir.`;
  }
  return null;
}

export function calcBidBondAmount(auctionOrBidTRY: number): number {
  return calcBidBond(auctionOrBidTRY);
}

export const FEE_TEXTS = {
  sellerSummary: () =>
    `Satıcı komisyonu: %${(FEES.sellerCommissionRate * 100).toFixed(0)} + KDV %${(FEES.vatRate * 100).toFixed(0)}` +
    (COMMISSION_PARTIES === "both"
      ? ` · Alıcı komisyonu: %${(FEES.buyerCommissionRate * 100).toFixed(0)} + KDV (hedef toplam %${((FEES.sellerCommissionRate + FEES.buyerCommissionRate) * 100).toFixed(0)} komisyon matrahı)`
      : ""),
  refundWindow: () => `${FEES.refundWindowDays} gün içinde iade`,
  payoutHold: () => `İhale bitiminden ${FEES.payoutHoldDays} gün sonra ödeme`,
  bidBondLine: () =>
    `İhaleye katılmadan önce ${formatBidBondPercent()} teminat (iadeli, taslak); sabit kapora referansı ${FEES.depositTRY.toLocaleString("tr-TR")} TL. Kaybeden iade hedefi: ${FEES.bidBondRefundHoursLoser} saat.`,
  bidBondForfeitLine: () =>
    `Kazanan ödeme yapmazsa ${formatBidBondPercent()} teminat cezası (taslak; ${FEES.bidBondForfeitWinnerHours} saat referansı).`,
  monetizationPrinciples: () =>
    "Hedef: başarılı işlem komisyonu (alıcı %2 + satıcı %2, KDV hariç matrah); üyelik ve hizmet bedelleri komisyondan mahsup edilir; ilan vitrin ücreti yok.",
  commissionMatrahLine: () =>
    "Komisyon matrahı (hedef): tapu veya sözleşmede netleşen işlem tutarı; üyelik/hizmet kalemleri mahsup sonrası platform neti hesaplanır.",
  commissionExplain: () =>
    "Komisyon: alıcı %2 + satıcı %2 (toplam %4 matrah). KDV komisyon üzerinden. Üyelik ve hizmet bedelleri komisyondan mahsup edilir.",
  sellerMembershipExplain: () =>
    "Satıcı yıllık üyelik: 5.000 TL — sınırsız ilan hakkı (hedef); üyelik tutarı komisyondan düşülür.",
  buyerMembershipExplain: () =>
    "Alıcı yıllık üyelik: 1.000 TL — teklif verme yetkisi (hedef).",
  bidBondExplain: () =>
    "Teminat: teklif tutarının %5'i kadar (hedef). Kazanmazsanız iade süreci sözleşmede netleşir.",
} as const;

/** Stub — eski vitrin paketi metinleri kademeli kaldırılıyor */
export const listingPackages = {} as const;
