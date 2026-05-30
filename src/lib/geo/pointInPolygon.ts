/** Ray-casting point-in-polygon (WGS84 lat/lng). */
export function pointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function parsePolygonParam(raw: string | null): [number, number][] | null {
  if (!raw) return null;
  try {
    const pairs = raw.split("|").map((p) => p.split(",").map(Number));
    if (pairs.some((p) => p.length !== 2 || p.some(Number.isNaN))) return null;
    return pairs as [number, number][];
  } catch {
    return null;
  }
}

export function encodePolygonParam(polygon: [number, number][]): string {
  return polygon.map(([lat, lng]) => `${lat},${lng}`).join("|");
}
