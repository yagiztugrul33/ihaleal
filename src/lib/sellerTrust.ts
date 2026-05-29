export type SellerTrustProfile = {
  slug: string;
  displayName: string;
  verified: boolean;
  membershipMonths: number;
  completedDeals: number;
  score: number;
  badges: string[];
};

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function buildSellerTrustProfile(listingId: string): SellerTrustProfile {
  const seed = hash(listingId);
  return {
    slug: "demo-emlakci",
    displayName: "Demo Satıcı Ofisi",
    verified: true,
    membershipMonths: 12 + (seed % 24),
    completedDeals: 18 + (seed % 64),
    score: 4.2 + ((seed % 8) / 10),
    badges: ["Doğrulanmış Satıcı", "Güvenli İşlem", "Belge Kontrolü"],
  };
}
