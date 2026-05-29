import { getAllProperties } from "@/lib/demo-data";

export function getSponsoredListings(limit = 4) {
  const source = getAllProperties();
  return source
    .filter((item, idx) => idx % 7 === 0 || item.marketingMode === "auction")
    .slice(0, limit);
}

export const SPONSORED_DISCLOSURE =
  "Sponsorlu/Reklam içerikler demo amaçlıdır; içerik akışını kapatmaz ve pop-up içermez.";
