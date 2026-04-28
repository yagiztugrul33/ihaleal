/**
 * Çoklu kullanıcı akışı — UI / taslak. Backend yok (§D-K3).
 * Kimi brief ile hizalı: A ilan, B satıcı ihale, C teklif, D izleyici.
 */

export type UserFlow = "listing_only" | "auction_seller" | "auction_bidder" | "browser_only";

const ALL_FLOW_IDS: UserFlow[] = ["browser_only", "listing_only", "auction_seller", "auction_bidder"];

export const USER_FLOWS_STORAGE_KEY = "ihaleal_user_flows";

export function readUserFlowsFromStorage(): UserFlow[] {
  try {
    const raw = localStorage.getItem(USER_FLOWS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is UserFlow => ALL_FLOW_IDS.includes(x as UserFlow));
  } catch {
    return [];
  }
}

export function writeUserFlowsToStorage(flows: UserFlow[]): void {
  localStorage.setItem(USER_FLOWS_STORAGE_KEY, JSON.stringify(flows));
  window.dispatchEvent(new Event("ihaleal-user-flows"));
}

export type FlowPermissions = {
  canOpenAuction: boolean;
  canCreateListing: boolean;
  canBid: boolean;
};

/** Tek akış — çoklu seçimde `mergedFlowPermissions` ile birleştirilir. */
export const FLOW_PERMISSIONS: Record<UserFlow, FlowPermissions> = {
  browser_only: { canOpenAuction: false, canCreateListing: false, canBid: false },
  listing_only: { canOpenAuction: false, canCreateListing: true, canBid: false },
  auction_seller: { canOpenAuction: true, canCreateListing: true, canBid: false },
  auction_bidder: { canOpenAuction: false, canCreateListing: false, canBid: true },
};

export function mergedFlowPermissions(flows: UserFlow[]): FlowPermissions {
  const out: FlowPermissions = { canOpenAuction: false, canCreateListing: false, canBid: false };
  for (const f of flows) {
    const p = FLOW_PERMISSIONS[f];
    out.canOpenAuction ||= p.canOpenAuction;
    out.canCreateListing ||= p.canCreateListing;
    out.canBid ||= p.canBid;
  }
  return out;
}

export type DocumentRequirement = {
  id: string;
  label: string;
  required: boolean;
  /** Kullanıcıya kısa açıklama */
  hint?: string;
};

export const FLOW_LABELS: Record<UserFlow, { title: string; description: string }> = {
  browser_only: {
    title: "Sadece izle",
    description: "E-posta + telefon doğrulama; teklif ve ilan yok.",
  },
  listing_only: {
    title: "İlan veren (Sahibinden tarzı)",
    description: "Vitrin ilanı; iletişim ve paket ücreti (üretimde §D-K8).",
  },
  auction_seller: {
    title: "İhaleden satan (yetki)",
    description: "e-Devlet / vekalet ile platform yetkisi (taslak; §D-K9). Ek evrak: tapu, ekspertiz, ipotek özeti.",
  },
  auction_bidder: {
    title: "İhaleye katılan (alıcı)",
    description: "Findeks, AML/KYC, teminat (bid bond), banka referansı (hedef liste).",
  },
};

export const FLOW_REQUIREMENTS: Record<UserFlow, DocumentRequirement[]> = {
  browser_only: [
    { id: "email", label: "E-posta doğrulama", required: true },
    { id: "phone", label: "Telefon OTP", required: true },
  ],
  listing_only: [
    { id: "id", label: "Kimlik / vergi bilgisi", required: true, hint: "İlan sahibi doğrulama" },
    { id: "deed", label: "Tapu özeti veya ilan bağlantısı", required: true },
    { id: "package", label: "İlan paketi seçimi (demo)", required: false, hint: "§D-K8 fiyat matrisi sonrası" },
  ],
  auction_seller: [
    { id: "deed_full", label: "Güncel tapu kaydı", required: true },
    { id: "expertise", label: "SPK uyumlu ekspertiz (hedef)", required: true, hint: "CreateAuction: «SPK uzmanı ekspertiz raporu zorunlu» + PDF adı ile aynı çizgi" },
    { id: "encumbrance", label: "İpotek / haciz durumu özeti", required: true },
    { id: "kvkk_consent", label: "KVKK + yetki beyanı (avukat metni)", required: true, hint: "§D-K5/K9" },
    { id: "edevis_mock", label: "e-Devlet yetki (DEMO akışı)", required: false, hint: "/auth/edevis-mock" },
  ],
  auction_bidder: [
    { id: "findeks", label: "Findeks / kredi notu (üretim entegrasyonu yok)", required: true },
    { id: "aml", label: "AML / KYC formu (taslak)", required: true },
    { id: "bid_bond", label: "Teminat / bid bond", required: true, hint: "fees.ts — bidBondRate" },
    { id: "bank_ref", label: "Banka referansı (opsiyonel)", required: false },
  ],
};

/** Seçilen akışların birleşik evrak listesi (id tekil). */
export function mergedRequirements(flows: UserFlow[]): DocumentRequirement[] {
  const seen = new Set<string>();
  const out: DocumentRequirement[] = [];
  for (const f of flows) {
    for (const d of FLOW_REQUIREMENTS[f]) {
      if (seen.has(d.id)) continue;
      seen.add(d.id);
      out.push(d);
    }
  }
  return out;
}
