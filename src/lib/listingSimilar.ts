import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Auction } from "@/types/auction";
import { normalizeAuctionImages } from "@/lib/listingImage";

export type SimilarListingItem = {
  id: string;
  title: string;
  city: string;
  district: string;
  price: number;
  image?: string;
};

function isMissingSchemaError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const code = err.code ?? "";
  const msg = (err.message ?? "").toLowerCase();
  return code === "PGRST205" || code === "42P01" || msg.includes("does not exist") || msg.includes("could not find");
}

function parseImages(body: unknown): string[] {
  if (body == null || typeof body !== "object") return [];
  const images = (body as { images?: unknown }).images;
  if (!Array.isArray(images)) return [];
  return normalizeAuctionImages(images.filter((x) => typeof x === "string") as string[]);
}

function scoreCatalogRow(
  a: Auction,
  ctx: { city?: string; category?: string; priceTry: number },
): number {
  let score = 0;
  if (ctx.city && a.city === ctx.city) score += 3;
  if (ctx.category && a.category === ctx.category) score += 2;
  const band = ctx.priceTry * 0.35;
  if (Math.abs(a.currentBid - ctx.priceTry) <= band) score += 2;
  if (a.dealType !== "rent") score += 1;
  return score;
}

export function pickSimilarFromCatalog(
  catalog: Auction[],
  currentId: string,
  ctx: { city?: string; category?: string; priceTry: number },
  limit = 4,
): SimilarListingItem[] {
  return catalog
    .filter((a) => a.id !== currentId)
    .map((a) => ({ a, score: scoreCatalogRow(a, ctx) }))
    .filter((row) => row.score > 0)
    .sort((x, y) => y.score - x.score || y.a.investmentScore - x.a.investmentScore)
    .slice(0, limit)
    .map(({ a }) => ({
      id: a.id,
      title: a.title,
      city: a.city,
      district: a.district,
      price: a.currentBid,
      image: a.images[0],
    }));
}

export async function fetchSimilarListings(input: {
  currentId: string;
  city?: string;
  district?: string;
  category?: string;
  priceTry: number;
  limit?: number;
}): Promise<SimilarListingItem[]> {
  const limit = input.limit ?? 4;
  if (!isSupabaseConfigured()) return [];

  const minPrice = Math.max(0, input.priceTry * 0.65);
  const maxPrice = input.priceTry * 1.35;

  let query = supabase
    .from("listings")
    .select("id, title, city, district, start_price_try, body, category")
    .neq("id", input.currentId)
    .in("status", ["active", "closed"])
    .gte("start_price_try", minPrice)
    .lte("start_price_try", maxPrice)
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  if (input.city) query = query.eq("city", input.city);

  const { data, error } = await query;
  if (error && isMissingSchemaError(error)) return [];
  if (error || !data?.length) return [];

  const rows = data
    .filter((row) => !input.category || row.category === input.category || !row.category)
    .slice(0, limit);

  return rows.map((row) => {
    const imgs = parseImages(row.body);
    return {
      id: String(row.id),
      title: String(row.title ?? "İlan"),
      city: String(row.city ?? ""),
      district: String(row.district ?? ""),
      price: Number(row.start_price_try ?? 0),
      image: imgs[0],
    };
  });
}
