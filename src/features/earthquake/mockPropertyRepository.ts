import type { PropertyLocationProvider, TrackedPropertyLocation } from "./types";

const MOCK_PROPERTIES: TrackedPropertyLocation[] = [
  { id: "prop-istanbul-kadikoy", title: "Kadikoy Demo Daire", latitude: 40.9833, longitude: 29.0661 },
  { id: "prop-izmir-karsiyaka", title: "Karsiyaka Demo Konut", latitude: 38.4559, longitude: 27.1086 },
  { id: "prop-ankara-cankaya", title: "Cankaya Demo Ofis", latitude: 39.8849, longitude: 32.8463 },
];

export class MockPropertyLocationProvider implements PropertyLocationProvider {
  async getTrackedProperties(): Promise<TrackedPropertyLocation[]> {
    return MOCK_PROPERTIES;
  }
}

