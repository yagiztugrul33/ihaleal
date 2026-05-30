import { haversineDistanceM } from "@/lib/geo/haversine";

export type GeofenceListing = {
  id: string;
  auctionId: string;
  title: string;
  lat: number;
  lng: number;
  dealType: "sale" | "rent";
  city: string;
  district: string;
};

export type GeofencePrefs = {
  radiusMeters: number;
  dealFilter: "all" | "sale" | "rent";
};

export function findNearbyListings(
  userLat: number,
  userLng: number,
  listings: GeofenceListing[],
  prefs: GeofencePrefs,
): GeofenceListing[] {
  return listings.filter((item) => {
    if (prefs.dealFilter !== "all" && item.dealType !== prefs.dealFilter) return false;
    const dist = haversineDistanceM(userLat, userLng, item.lat, item.lng);
    return dist <= prefs.radiusMeters;
  });
}
