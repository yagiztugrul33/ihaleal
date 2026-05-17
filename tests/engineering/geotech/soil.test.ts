import { describe, expect, it } from "vitest";
import { analyzeSoil } from "@/lib/engineering/geotech/soilAnalysis";
import { analyzeSeismic } from "@/lib/engineering/seismic/seismicEngine";

describe("geotech & seismic", () => {
  it("classifies ZC soil and recommends foundation", () => {
    const r = analyzeSoil({ zeminSinifi: "ZC", groundwaterDepthM: 5 });
    expect(r.value.vs30Mps).toBeGreaterThan(300);
    expect(r.value.recommendations.length).toBeGreaterThan(0);
  });

  it("amplifies PGA for soft soil", () => {
    const soil = analyzeSoil({ vs30Mps: 200 });
    const r = analyzeSeismic({ vs30Mps: soil.value.vs30Mps, pgaG: 0.3 });
    expect(r.value.designPgaG).toBeGreaterThan(0.3);
    expect(r.value.seismicRiskScore).toBeGreaterThan(0);
  });
});
