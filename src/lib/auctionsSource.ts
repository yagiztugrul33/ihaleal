import { AUCTIONS } from "@/data/auctions";
import type { Auction } from "@/types/auction";
import { withListingDefaults } from "@/lib/listingPolicy";
import { fetchRemoteAuctionsCatalog } from "@/lib/supabaseAuctionsFetch";

/** Yerel kullanıcı ilanları + statik demo (Supabase hariç). */
export function getLocalAndStaticAuctions(): Auction[] {
  try {
    const raw = localStorage.getItem("ihaleal_auctions");
    const extra = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(extra)) return [...AUCTIONS].map(withListingDefaults);
    return [...extra, ...AUCTIONS].map(withListingDefaults);
  } catch {
    return [...AUCTIONS].map(withListingDefaults);
  }
}

/**
 * @deprecated Yalnız yerel + statik. Arama ve detay için `loadAllAuctionsForSearch` kullanın.
 */
export function getAllAuctionsForSearch(): Auction[] {
  return getLocalAndStaticAuctions();
}

let catalogCache: { t: number; data: Auction[] } | null = null;
const CATALOG_TTL_MS = 45_000;

export function invalidateAuctionsCatalogCache(): void {
  catalogCache = null;
}

async function loadAllAuctionsForSearchImpl(): Promise<Auction[]> {
  const [remote, base] = await Promise.all([fetchRemoteAuctionsCatalog(), Promise.resolve(getLocalAndStaticAuctions())]);
  const byId = new Map<string, Auction>();
  for (const r of remote) byId.set(r.id, r);
  for (const a of base) byId.set(a.id, a);
  return Array.from(byId.values()).map(withListingDefaults);
}

/** Uzak (Supabase) + yerel + statik birleşik katalog; kısa TTL önbellekli. */
export async function loadAllAuctionsForSearch(): Promise<Auction[]> {
  if (catalogCache && Date.now() - catalogCache.t < CATALOG_TTL_MS) {
    return catalogCache.data;
  }
  const data = await loadAllAuctionsForSearchImpl();
  catalogCache = { t: Date.now(), data };
  return data;
}
