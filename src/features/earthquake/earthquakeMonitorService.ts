import { findNearbyEarthquakes } from "./haversine";
import type {
  EarthquakeFeedGateway,
  EarthquakeMonitorSnapshot,
  PropertyLocationProvider,
} from "./types";

export interface EarthquakeMonitorDeps {
  feedGateway: EarthquakeFeedGateway;
  propertyProvider: PropertyLocationProvider;
  thresholdKm: number;
  now?: () => Date;
}

/**
 * Polling-based "yakinda deprem oldu" monitor.
 * Not an early warning system; only checks public feed updates.
 */
export function createEarthquakeMonitorService(deps: EarthquakeMonitorDeps) {
  const now = deps.now ?? (() => new Date());
  let lastCheckedIso: string | undefined;

  async function checkOnce(): Promise<EarthquakeMonitorSnapshot> {
    const [events, properties] = await Promise.all([
      deps.feedGateway.fetchRecentEvents(lastCheckedIso),
      deps.propertyProvider.getTrackedProperties(),
    ]);
    const nearbyHits = findNearbyEarthquakes(events, properties, deps.thresholdKm);
    const checkedAtIso = now().toISOString();
    lastCheckedIso = checkedAtIso;

    return {
      checkedAtIso,
      thresholdKm: deps.thresholdKm,
      recentEvents: events,
      nearbyHits,
    };
  }

  return {
    checkOnce,
    resetCheckpoint(): void {
      lastCheckedIso = undefined;
    },
  };
}

