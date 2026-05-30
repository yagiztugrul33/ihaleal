import { describe, expect, it } from "vitest";
import { buildPvgisInvokeBody } from "./pvgisClient";

describe("buildPvgisInvokeBody", () => {
  it("maps tiltDeg to tilt for edge POST", () => {
    const body = buildPvgisInvokeBody({ lat: 41, lon: 29, tiltDeg: 30 });
    expect(body.tilt).toBe(30);
    expect(body.lat).toBe(41);
    expect(body.lon).toBe(29);
  });
});
