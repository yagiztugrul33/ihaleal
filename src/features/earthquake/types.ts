export interface EarthquakeEvent {
  id: string;
  occurredAtIso: string;
  latitude: number;
  longitude: number;
  depthKm: number;
  magnitude: number;
  locationName: string;
  provider: "afad" | "kandilli";
}

export interface TrackedPropertyLocation {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
}

export interface NearbyEarthquakeHit {
  event: EarthquakeEvent;
  property: TrackedPropertyLocation;
  distanceKm: number;
}

export interface PropertyLocationProvider {
  getTrackedProperties(): Promise<TrackedPropertyLocation[]>;
}

export interface EarthquakeFeedGateway {
  fetchRecentEvents(sinceIso?: string): Promise<EarthquakeEvent[]>;
}

export interface EarthquakeMonitorSnapshot {
  checkedAtIso: string;
  thresholdKm: number;
  recentEvents: EarthquakeEvent[];
  nearbyHits: NearbyEarthquakeHit[];
}

