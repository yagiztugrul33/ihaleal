import { describe, expect, it } from "vitest";
import { createEarthquakeMonitorService } from "./earthquakeMonitorService";
import type { EarthquakeEvent, EarthquakeFeedGateway, PropertyLocationProvider, TrackedPropertyLocation } from "./types";

class FakeFeedGateway implements EarthquakeFeedGateway {
  constructor(private readonly events: EarthquakeEvent[]) {}
  async fetchRecentEvents(): Promise<EarthquakeEvent[]> {
    return this.events;
  }
}

class FakePropertyProvider implements PropertyLocationProvider {
  constructor(private readonly properties: TrackedPropertyLocation[]) {}
  async getTrackedProperties(): Promise<TrackedPropertyLocation[]> {
    return this.properties;
  }
}

describe("earthquake monitor service", () => {
  it("returns nearby hits snapshot", async () => {
    const events: EarthquakeEvent[] = [
      {
        id: "eq-1",
        occurredAtIso: "2026-05-27T00:00:00.000Z",
        latitude: 40.99,
        longitude: 29.06,
        depthKm: 5,
        magnitude: 4.8,
        locationName: "Kadikoy",
        provider: "afad",
      },
    ];
    const properties: TrackedPropertyLocation[] = [
      {
        id: "prop-1",
        title: "Demo Property",
        latitude: 40.9833,
        longitude: 29.0661,
      },
    ];

    const monitor = createEarthquakeMonitorService({
      feedGateway: new FakeFeedGateway(events),
      propertyProvider: new FakePropertyProvider(properties),
      thresholdKm: 30,
      now: () => new Date("2026-05-27T01:00:00.000Z"),
    });

    const snapshot = await monitor.checkOnce();
    expect(snapshot.recentEvents).toHaveLength(1);
    expect(snapshot.nearbyHits).toHaveLength(1);
    expect(snapshot.nearbyHits[0].event.id).toBe("eq-1");
    expect(snapshot.checkedAtIso).toBe("2026-05-27T01:00:00.000Z");
  });
});

