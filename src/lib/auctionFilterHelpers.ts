import type { Auction } from "@/types/auction";

/** Oda sayısı için ilk rakam (örn. "3+1" → 3). */
export function parseRoomMain(roomCount: string): number | null {
  const m = roomCount.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

/** Bina yaşı üst sınır tahmini (örn. "5-10 yıl" → 10; "Sıfır" → 0). */
export function parseBuildingAgeUpper(age: string): number {
  const a = age.trim().toLowerCase();
  if (/sıfır|yeni|0\s*yıl/.test(a)) return 0;
  const nums = age.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length === 0) return 35;
  return Math.max(...nums);
}

/** Kat sırası yaklaşık (bahçe/zemin → 0). */
export function parseFloorIndex(floor: string): number {
  const f = floor.trim().toLowerCase();
  if (/bahçe|zemin|giriş|kot\s*1/.test(f)) return 0;
  const m = f.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 5;
}

export type FloorBand = "all" | "low" | "mid" | "high";

export function floorMatchesBand(floor: string, band: FloorBand): boolean {
  if (band === "all") return true;
  const n = parseFloorIndex(floor);
  if (band === "low") return n <= 2;
  if (band === "mid") return n >= 3 && n <= 10;
  return n >= 11;
}

export type SiteFilter = "any" | "yes" | "no";

export function auctionIsSiteInside(a: Auction): boolean {
  const t = `${a.title} ${a.tags.join(" ")}`.toLowerCase();
  return t.includes("site içi") || t.includes("site ici") || t.includes("kapalı site");
}

export type ViewFilter =
  | "all"
  | "sea"
  | "city"
  | "green"
  | "north"
  | "south";

export function auctionMatchesView(a: Auction, view: ViewFilter): boolean {
  if (view === "all") return true;
  const blob = `${a.propertyDetails.facade || ""} ${a.title}`.toLowerCase();
  const checks: Record<Exclude<ViewFilter, "all">, RegExp> = {
    sea: /deniz|boğaz|sahil|manzara/,
    city: /şehir|cadde|kent|panoramik/,
    green: /yeşil|orman|park|bahçe/,
    north: /kuzey/,
    south: /güney/,
  };
  return checks[view].test(blob);
}

export type RoomFilter = "all" | "1" | "2" | "3" | "4" | "5p";

export function auctionMatchesRoom(a: Auction, room: RoomFilter): boolean {
  if (room === "all") return true;
  const n = parseRoomMain(a.propertyDetails.roomCount);
  if (n === null) return true;
  if (room === "5p") return n >= 5;
  const minRooms = parseInt(room, 10);
  return n >= minRooms;
}
