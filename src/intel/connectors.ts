import type { RegionIntelConnector, RegionIntelRaw } from "@/intel/types";

type ConnectorData = {
  regions: RegionIntelRaw[];
};

/**
 * Future-ready connector shape.
 * Replace with adapters for TUIK/AFAD/TCMB without changing UI callers.
 */
export class MockRegionIntelConnector implements RegionIntelConnector {
  constructor(private readonly data: ConnectorData) {}

  async listRegions(): Promise<RegionIntelRaw[]> {
    return this.data.regions;
  }

  async getRegionBySlug(slug: string): Promise<RegionIntelRaw | null> {
    const key = String(slug || "").trim().toLowerCase();
    return this.data.regions.find((r) => r.slug === key) ?? null;
  }
}
