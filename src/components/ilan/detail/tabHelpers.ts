import type { PropertyRecord } from "@/types/property";
import { formatTry } from "@/lib/valuation/valuationEngine";
import type { DataRow } from "./shared";

function fmtBool(v: boolean | undefined): string | undefined {
  if (v == null) return undefined;
  return v ? "Evet" : "Hayır";
}

function fmtNum(v: number | undefined, suffix = ""): string | undefined {
  if (v == null || Number.isNaN(v)) return undefined;
  return `${v.toLocaleString("tr-TR")}${suffix}`;
}

function detailStr(details: Record<string, unknown>, key: string): string | undefined {
  const v = details[key];
  if (v == null || v === "") return undefined;
  if (typeof v === "boolean") return v ? "Evet" : "Hayır";
  if (typeof v === "number") return v.toLocaleString("tr-TR");
  return String(v);
}

export function buildYapiRows(property: PropertyRecord): DataRow[] {
  const d = (property.details ?? {}) as Record<string, unknown>;
  const rows: Array<{ label: string; value?: string }> = [
    { label: "Bina tipi", value: property.buildingType },
    { label: "Yapı tipi", value: property.constructionType },
    { label: "Isıtma", value: property.heatingType },
    { label: "Soğutma", value: property.coolingType },
    { label: "Yalıtım", value: property.insulation },
    { label: "Deprem sınıfı", value: property.earthquakeClass },
    { label: "Kat", value: property.floor },
    { label: "Toplam kat", value: fmtNum(property.totalFloors) },
    { label: "Bina yaşı", value: property.buildingAge },
    { label: "Tavan yüksekliği", value: fmtNum(property.ceilingHeightM, " m") },
    { label: "Cephe", value: property.facade },
    { label: "Yön", value: property.orientation },
    { label: "Asansör", value: fmtBool(property.elevator) },
    { label: "Asansör adedi", value: fmtNum(property.elevatorCount) },
    { label: "Otopark", value: fmtBool(property.parking) },
    { label: "Otopark adedi", value: fmtNum(property.parkingSpots) },
    { label: "Kapalı otopark", value: fmtBool(property.indoorParking) },
    { label: "Açık otopark", value: fmtBool(property.outdoorParking) },
    { label: "Balkon", value: fmtBool(property.balcony) },
    { label: "Balkon m²", value: fmtNum(property.balconySqm, " m²") },
    { label: "Eşyalı", value: fmtBool(property.furnished) },
    { label: "Kullanım durumu", value: property.usageStatus },
    { label: "Oda sayısı", value: property.roomCount },
    { label: "Banyo", value: fmtNum(property.bathroomCount) },
    { label: "Yatak odası", value: fmtNum(property.bedroomCount) },
    { label: "Sığınak / kapalı alan", value: detailStr(d, "shelter") ?? detailStr(d, "bombShelter") },
    { label: "Yangın bölmeleri", value: fmtBool(property.fireCompartment) },
    { label: "Acil çıkış", value: fmtBool(property.emergencyExit) },
    { label: "Sprinkler", value: fmtBool(property.sprinklerSystem) },
  ];
  return rows
    .filter((r) => r.value != null && r.value !== "")
    .map((r) => ({ label: r.label, value: r.value! }));
}

export function istanbulCoords(property: PropertyRecord): [number, number] {
  const lat = property.latitude ?? 41.0082;
  const lng = property.longitude ?? 28.9784;
  return [lat, lng];
}

export function dealLabel(property: PropertyRecord): string {
  if (property.dealType === "rent") return "Kiralık";
  if (property.dealType === "transfer") return "Devren";
  return "Satılık";
}

export function priceOf(property: PropertyRecord): number {
  return (
    property.priceTry ??
    property.currentBidTry ??
    property.aiPredictedPriceTry ??
    property.buyNowPriceTry ??
    0
  );
}

export { fmtBool, fmtNum, detailStr, formatTry };
