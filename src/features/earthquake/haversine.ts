import type { EarthquakeEvent, NearbyEarthquakeHit, TrackedPropertyLocation } from "./types";

const EARTH_RADIUS_KM = 6371;

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function findNearbyEarthquakes(
  events: EarthquakeEvent[],
  properties: TrackedPropertyLocation[],
  thresholdKm: number,
): NearbyEarthquakeHit[] {
  const hits: NearbyEarthquakeHit[] = [];
  for (const event of events) {
    for (const property of properties) {
      const distanceKm = haversineKm(
        { latitude: event.latitude, longitude: event.longitude },
        { latitude: property.latitude, longitude: property.longitude },
      );
      if (distanceKm <= thresholdKm) {
        hits.push({
          event,
          property,
          distanceKm: Number(distanceKm.toFixed(2)),
        });
      }
    }
  }
  return hits.sort((a, b) => a.distanceKm - b.distanceKm || b.event.magnitude - a.event.magnitude);
}

