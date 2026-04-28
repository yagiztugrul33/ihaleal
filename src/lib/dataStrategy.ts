/**
 * Demo veri kaynakları — bileşenlerde `true` sabiti yerine buradan sorgula.
 * Yeni demo yüzeyi eklerken anahtarı buraya ekle.
 */
const DEMO_SOURCES = new Set([
  "priceAnalysisDemo",
  "priceIndex",
  "analytics",
  "listingLinkDemo",
  "aiValuation",
  "auctionSeed",
  "footerNavEstimate",
  "footerNavEndeks",
  "demoBanner",
  "flowOnboarding",
  "authMock",
  "dashboardFlow",
]);

export function isDemoData(source: string): boolean {
  return DEMO_SOURCES.has(source);
}
