export type ElevationSample = {
  source: string;
  lat: number;
  lon: number;
  elevationM: number;
  slopeDegEstimate: number | null;
};

export async function fetchElevation(lat: number, lon: number): Promise<ElevationSample | null> {
  try {
    const res = await fetch("https://api.open-elevation.com/api/v1/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locations: [{ latitude: lat, longitude: lon }] }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const elev = json?.results?.[0]?.elevation;
    if (typeof elev !== "number") return null;

    const neighbors = [
      { latitude: lat + 0.002, longitude: lon },
      { latitude: lat - 0.002, longitude: lon },
    ];
    let slopeDegEstimate: number | null = null;
    try {
      const nRes = await fetch("https://api.open-elevation.com/api/v1/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations: neighbors }),
      });
      if (nRes.ok) {
        const nJson = await nRes.json();
        const e1 = nJson?.results?.[0]?.elevation;
        const e2 = nJson?.results?.[1]?.elevation;
        if (typeof e1 === "number" && typeof e2 === "number") {
          const rise = Math.abs(e1 - e2);
          const run = 444;
          slopeDegEstimate = (Math.atan(rise / run) * 180) / Math.PI;
        }
      }
    } catch {
      slopeDegEstimate = null;
    }

    return {
      source: "Open-Elevation API",
      lat,
      lon,
      elevationM: elev,
      slopeDegEstimate,
    };
  } catch {
    return null;
  }
}
