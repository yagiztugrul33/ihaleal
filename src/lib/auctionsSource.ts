import { AUCTIONS } from "@/data/auctions";
import type { Auction } from "@/types/auction";
import { withListingDefaults } from "@/lib/listingPolicy";

/** Statik demo ilanlar + kullanıcının tarayıcıda oluşturduğu ilanlar (arama / modal için). */
export function getAllAuctionsForSearch(): Auction[] {
  try {
    const raw = localStorage.getItem("ihaleal_auctions");
    const extra = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(extra)) return [...AUCTIONS].map(withListingDefaults);
    return [...extra, ...AUCTIONS].map(withListingDefaults);
  } catch {
    return [...AUCTIONS].map(withListingDefaults);
  }
}
