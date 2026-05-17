import type { MethodologyRef } from "./types";

const REGISTRY: Record<string, MethodologyRef> = {
  "pvgis-ghi-poa": {
    id: "pvgis-ghi-poa",
    name: "PVGIS GHI to POA (simplified)",
    standard: "PVGIS / JRC",
    sourceUrl: "https://joint-research-centre.ec.europa.eu/pvgis_en",
    notes: "Bankable studies should use PVGIS hourly POA for site coordinates.",
  },
  "iec-pv-performance": {
    id: "iec-pv-performance",
    name: "PV performance ratio loss stack",
    standard: "IEC 61724",
    notes: "PR from inverter, cable, soiling, shading, availability losses.",
  },
  "dcf-npv-irr": {
    id: "dcf-npv-irr",
    name: "Discounted cash flow — NPV / IRR",
    standard: "Corporate finance / IEA project economics",
    notes: "Simplified; excludes tax shield and debt schedule.",
  },
  lcoe: {
    id: "lcoe",
    name: "Levelized cost of energy",
    standard: "NREL LCOE methodology (simplified)",
    sourceUrl: "https://www.nrel.gov/analysis/tech-lcoe.html",
  },
  "zoning-probability": {
    id: "zoning-probability",
    name: "Probabilistic zoning transition index",
    notes: "Weighted heuristic — not municipal approval prediction.",
  },
  "geotech-soil": {
    id: "geotech-soil",
    name: "Geotechnical soil classification",
    standard: "TBDY 2018 / Eurocode 8 site class",
    notes: "Vs30 bands; liquefaction index is indicative heuristic only.",
  },
  "seismic-tbdy": {
    id: "seismic-tbdy",
    name: "Seismic hazard amplification",
    standard: "TBDY 2018 / NEHRP site amplification (simplified)",
  },
  "disaster-composite": {
    id: "disaster-composite",
    name: "Multi-hazard composite index",
    standard: "FEMA / ISO risk layering (simplified)",
  },
  "fire-safety": {
    id: "fire-safety",
    name: "Fire egress screening",
    standard: "Turkiye BYKHY (indicative screening)",
  },
};

export function getMethodology(id: string): MethodologyRef {
  return REGISTRY[id] ?? { id, name: id };
}

export function listMethodologies(): MethodologyRef[] {
  return Object.values(REGISTRY);
}
