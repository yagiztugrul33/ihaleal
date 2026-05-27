import { DEMO_LISTINGS } from '../../shared/demoMarket';
import * as ExpoLocation from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import MapView, { Circle, Marker } from 'react-native-maps';
import {
  DEMO_DISTRICT_PROFILES,
  calculateCompositeLocationScore,
  type DemoLocationKey,
} from '../../shared/locationIntelligence';

export type RadarPoint = {
  id: string;
  title: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  score: number;
};

const DEMO_COORDS: Record<DemoLocationKey, { lat: number; lng: number }> = {
  'istanbul-kadikoy': { lat: 40.9833, lng: 29.0661 },
  'istanbul-besiktas': { lat: 41.043, lng: 29.0083 },
  'ankara-cankaya': { lat: 39.886, lng: 32.833 },
  'izmir-karsiyaka': { lat: 38.4569, lng: 27.1143 },
  'antalya-muratpasa': { lat: 36.8869, lng: 30.7033 },
};

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const sa = Math.sin(dLat / 2) ** 2 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(sa)));
}

export function buildRadarPoints(userLat: number, userLng: number): RadarPoint[] {
  const out: RadarPoint[] = [];
  for (const listing of DEMO_LISTINGS) {
    const profile = DEMO_DISTRICT_PROFILES.find(
      (p) => p.city.toLowerCase().includes(listing.city.toLowerCase().replace('ı', 'i')) &&
        p.district.toLowerCase().includes(listing.district.toLowerCase().replace('ş', 's')),
    );
    if (!profile) continue;
    const coords = DEMO_COORDS[profile.key];
    const distanceKm = haversineKm(userLat, userLng, coords.lat, coords.lng);
    const result = calculateCompositeLocationScore({
      city: profile.city,
      district: profile.district,
      neighborhood: profile.defaultNeighborhood,
      ...profile.baseline,
    });
    out.push({
      id: listing.id,
      title: listing.title,
      city: listing.city,
      district: listing.district,
      latitude: coords.lat,
      longitude: coords.lng,
      distanceKm: Number(distanceKm.toFixed(2)),
      score: result.locationScore,
    });
  }
  return out.sort((a, b) => a.distanceKm - b.distanceKm || b.score - a.score);
}

export type LocationPermissionResult = {
  ok: boolean;
  message: string;
  coords?: { latitude: number; longitude: number };
};

export async function requestLocationWithConsent(kvkkOptIn: boolean): Promise<LocationPermissionResult> {
  if (!kvkkOptIn) {
    return { ok: false, message: 'KVKK konum onayı olmadan radar açılamaz.' };
  }
  try {
    const fg = await ExpoLocation.requestForegroundPermissionsAsync();
    if (fg.status !== 'granted') {
      return { ok: false, message: 'Konum izni verilmedi.' };
    }
    const loc = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced });
    return { ok: true, message: 'Konum alındı.', coords: loc.coords };
  } catch {
    return { ok: false, message: 'expo-location modülü bulunamadı. `npx expo install expo-location` gerekir.' };
  }
}

export async function startRadarGeofencing(regionId: string, lat: number, lng: number): Promise<string> {
  try {
    const taskName = `ihaleal-geofence-${regionId}`;

    if (!TaskManager.isTaskDefined(taskName)) {
      TaskManager.defineTask(taskName, async (body) => {
        if (body.error) return;
      });
    }

    await ExpoLocation.startGeofencingAsync(taskName, [
      {
        identifier: regionId,
        latitude: lat,
        longitude: lng,
        radius: 700,
        notifyOnEnter: true,
        notifyOnExit: false,
      },
    ]);

    return `Geofencing aktif: ${regionId}`;
  } catch {
    return 'Geofencing başlatılamadı (expo-location/expo-task-manager eksik olabilir).';
  }
}

export function getMapModule():
  | {
      MapView: typeof MapView;
      Marker: typeof Marker;
      Circle: typeof Circle;
      moduleReady: true;
    }
  | { moduleReady: false } {
  try {
    return {
      MapView,
      Marker,
      Circle,
      moduleReady: true,
    };
  } catch {
    return { moduleReady: false };
  }
}

