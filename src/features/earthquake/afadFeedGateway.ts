import type { EarthquakeEvent, EarthquakeFeedGateway } from "./types";

export const AFAD_DEFAULT_FEED_URL = "https://deprem.afad.gov.tr/EventData/GetEventsByFilter";

type AfadRow = {
  eventID?: string;
  date?: string;
  latitude?: string | number;
  longitude?: string | number;
  depth?: string | number;
  magnitude?: string | number;
  location?: string;
};

function asNumber(value: string | number | undefined): number {
  if (typeof value === "number") return value;
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toIso(value?: string): string {
  if (!value) return new Date().toISOString();
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString();
}

function mapAfadRow(row: AfadRow): EarthquakeEvent {
  const idBase = row.eventID?.trim() || `${row.date ?? "unknown"}:${row.latitude}:${row.longitude}`;
  return {
    id: `afad:${idBase}`,
    occurredAtIso: toIso(row.date),
    latitude: asNumber(row.latitude),
    longitude: asNumber(row.longitude),
    depthKm: asNumber(row.depth),
    magnitude: asNumber(row.magnitude),
    locationName: row.location?.trim() || "Bilinmeyen Konum",
    provider: "afad",
  };
}

/**
 * Skeleton gateway for AFAD public feed.
 * This fetches recent events and normalizes output for downstream distance filtering.
 */
export class AfadEarthquakeFeedGateway implements EarthquakeFeedGateway {
  constructor(
    private readonly feedUrl: string = AFAD_DEFAULT_FEED_URL,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async fetchRecentEvents(sinceIso?: string): Promise<EarthquakeEvent[]> {
    const body = {
      MinMagnitude: 0,
      MaxMagnitude: 10,
      LastDay: 2,
      Since: sinceIso ?? null,
    };

    const resp = await this.fetchImpl(this.feedUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      throw new Error(`AFAD feed request failed (${resp.status})`);
    }

    const raw = (await resp.json()) as AfadRow[] | { result?: AfadRow[] };
    const rows = Array.isArray(raw) ? raw : Array.isArray(raw.result) ? raw.result : [];
    return rows.map(mapAfadRow).filter((event) => event.latitude !== 0 || event.longitude !== 0);
  }
}

