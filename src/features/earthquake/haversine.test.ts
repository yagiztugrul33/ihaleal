import { describe, expect, it } from "vitest";
import { findNearbyEarthquakes, haversineKm } from "./haversine";
import type { EarthquakeEvent, TrackedPropertyLocation } from "./types";

describe("haversine helpers", () => {
  it("calculates distance in km", () => {
    const km = haversineKm(
      { latitude: 41.0082, longitude: 28.9784 },
      { latitude: 40.9833, longitude: 29.0661 },
    );
    expect(km).toBeGreaterThan(7);
    expect(km).toBeLessThan(10);
  });

  it("filters events by threshold and sorts by nearest first", () => {
    const eventNear: EarthquakeEvent = {
      id: "eq-near",
      occurredAtIso: "2026-05-27T00:00:00.000Z",
      latitude: 40.99,
      longitude: 29.06,
      depthKm: 7,
      magnitude: 4.2,
      locationName: "Near Zone",
      provider: "afad",
    };
    const eventFar: EarthquakeEvent = {
      ...eventNear,
      id: "eq-far",
      latitude: 39.92,
      longitude: 32.85,
      locationName: "Far Zone",
    };
    const property: TrackedPropertyLocation = {
      id: "prop-1",
      title: "Demo Property",
      latitude: 40.9833,
      longitude: 29.0661,
    };

    const hits = findNearbyEarthquakes([eventFar, eventNear], [property], 50);
    expect(hits).toHaveLength(1);
    expect(hits[0].event.id).toBe("eq-near");
  });
});

