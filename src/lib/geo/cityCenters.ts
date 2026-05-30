/** Türkiye şehir merkezi koordinatları — lat/lng yoksa harita fallback. */
const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  istanbul: { lat: 41.0082, lng: 28.9784 },
  ankara: { lat: 39.9334, lng: 32.8597 },
  izmir: { lat: 38.4192, lng: 27.1287 },
  antalya: { lat: 36.8969, lng: 30.7133 },
  bursa: { lat: 40.1885, lng: 29.0610 },
  adana: { lat: 37.0, lng: 35.3213 },
  gaziantep: { lat: 37.0662, lng: 37.3833 },
  konya: { lat: 37.8746, lng: 32.4932 },
  mersin: { lat: 36.8121, lng: 34.6415 },
  bodrum: { lat: 37.0344, lng: 27.4305 },
  mugla: { lat: 37.2153, lng: 28.3636 },
};

function normalizeCityKey(city: string): string {
  return city
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

export function resolveListingCoords(
  mapLat: number | undefined | null,
  mapLng: number | undefined | null,
  city: string,
): { lat: number; lng: number; fromFallback: boolean } {
  if (
    typeof mapLat === "number" &&
    typeof mapLng === "number" &&
    Number.isFinite(mapLat) &&
    Number.isFinite(mapLng) &&
    !(mapLat === 0 && mapLng === 0)
  ) {
    return { lat: mapLat, lng: mapLng, fromFallback: false };
  }
  const key = normalizeCityKey(city);
  for (const [name, coords] of Object.entries(CITY_CENTERS)) {
    if (key.includes(name)) return { ...coords, fromFallback: true };
  }
  return { lat: 39.0, lng: 35.0, fromFallback: true };
}
