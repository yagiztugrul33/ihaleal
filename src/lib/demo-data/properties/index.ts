import type { CategoryKey, PropertyRecord } from "@/types/property";
import { buildDemoProperties } from "./generate";
import { seedDisasterForProperty } from "@/lib/demo-data/disaster/seedDisasterData";

export { buildDemoProperties, DEMO_PROPERTY_COUNT } from "./generate";

let cache: PropertyRecord[] | null = null;

function getCache(): PropertyRecord[] {
  if (!cache) {
    cache = buildDemoProperties().map(seedDisasterForProperty);
  }
  return cache;
}

export function getAllProperties(): PropertyRecord[] {
  return getCache();
}

export function getPropertyById(id: string): PropertyRecord | undefined {
  return getCache().find((p) => p.id === id);
}

export function getPropertiesByCategory(cat: CategoryKey | string): PropertyRecord[] {
  return getCache().filter((p) => p.taxonomy.category === cat);
}

export function getPropertiesByTaxonomy(
  cat: CategoryKey | string,
  sub?: string,
  type?: string
): PropertyRecord[] {
  return getCache().filter((p) => {
    if (p.taxonomy.category !== cat) return false;
    if (sub != null && p.taxonomy.sub !== sub) return false;
    if (type != null && p.taxonomy.type !== type) return false;
    return true;
  });
}

export function getFeaturedAuctions(n: number): PropertyRecord[] {
  const live = getCache().filter(
    (p) =>
      p.marketingMode === "auction" &&
      p.status === "active" &&
      (p.details?.auctionStatus === "live" || p.currentBidTry != null)
  );
  return [...live]
    .sort((a, b) => (b.bidCount ?? 0) - (a.bidCount ?? 0))
    .slice(0, Math.max(0, n));
}

export function getRelatedProperties(
  property: PropertyRecord,
  n: number
): PropertyRecord[] {
  const all = getCache().filter((p) => p.id !== property.id);
  const scored = all.map((p) => {
    let score = 0;
    if (p.taxonomy.category === property.taxonomy.category) score += 3;
    if (p.taxonomy.sub === property.taxonomy.sub) score += 2;
    if (p.city === property.city) score += 2;
    if (p.district === property.district) score += 1;
    return { p, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, n))
    .map((row) => row.p);
}

const DETAIL_ID_RE = /^prop-\d{3}$/;

export function isPropertyDetailId(segment: string): boolean {
  return DETAIL_ID_RE.test(segment.trim());
}