import { DEMO_LISTINGS, type DemoListing } from "../../../shared/demoMarket";

export type FavoriteItem = {
  id: string;
  title: string;
  city: string;
  district: string;
  priceTry: number;
  estimatedValueTry: number;
  source: "ilan" | "ihale";
};

function toFavorite(item: DemoListing, idx: number): FavoriteItem {
  return {
    id: item.id,
    title: item.title,
    city: item.city,
    district: item.district,
    priceTry: item.priceTry,
    estimatedValueTry: item.estimatedValueTry,
    source: idx % 2 === 0 ? "ilan" : "ihale",
  };
}

export const MOCK_FAVORITES: FavoriteItem[] = DEMO_LISTINGS.slice(0, 5).map(toFavorite);

export async function fetchMockFavorites(forceError = false): Promise<FavoriteItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 220));
  if (forceError) throw new Error("Mock error");
  return MOCK_FAVORITES;
}
