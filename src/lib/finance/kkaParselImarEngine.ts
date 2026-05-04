import { DEFAULT_KKA_IMAR_KEY, KKA_DEMO_IMAR_ROWS, type DemoImarRow } from "@/data/kkaDemoImarProfiles";

export type KkaImarResolutionSource = "ada_parsel_match" | "ilce_fallback" | "default";

export type KkaImarProfile = DemoImarRow & {
  resolutionSource: KkaImarResolutionSource;
  matchedKey: string;
};

export type KkaParselFormInput = {
  il: string;
  ilce: string;
  koy: string;
  mahalle: string;
  ada: string;
  parsel: string;
  landAreaM2: number;
  ownerShareOfSellable: number;
  assumedNetUnitM2: number;
  emsalOverride?: number;
  taksOverride?: number;
  maxStoreysOverride?: number;
};

export type KkaBuildingSummary = {
  profile: KkaImarProfile;
  effectiveEmsal: number;
  effectiveTaks: number;
  effectiveMaxStoreys: number;
  maxFootprintM2: number;
  grossConstructionRightM2: number;
  floorsFromEmsalTaks: number;
  cappedFloorsBuildable: number;
  storeysLimitedByHeight?: number;
  ownerApproxSellableM2: number;
  contractorApproxSellableM2: number;
  ownerEquivalentUnits: number;
  warnings: string[];
};

const TR_MAP: [string, string][] = [
  ["ğ", "g"],
  ["ü", "u"],
  ["ş", "s"],
  ["ı", "i"],
  ["ö", "o"],
  ["ç", "c"],
  ["â", "a"],
  ["î", "i"],
  ["û", "u"],
];

/** Il / ilce / koy / mahalle icin anahtar — ASCII slug */
export function slugifyTr(raw: string): string {
  let s = raw.trim().toLocaleLowerCase("tr-TR");
  for (const [a, b] of TR_MAP) s = s.split(a).join(b);
  return s.replace(/\s+/g, "");
}

function rowToProfile(row: DemoImarRow, resolutionSource: KkaImarResolutionSource, matchedKey: string): KkaImarProfile {
  return { ...row, resolutionSource, matchedKey };
}

export function resolveImarProfile(input: {
  il: string;
  ilce: string;
  ada: string;
  parsel: string;
}): KkaImarProfile {
  const il = slugifyTr(input.il);
  const ilce = slugifyTr(input.ilce);
  const ada = input.ada.trim();
  const parsel = input.parsel.trim();

  const exactKey = `${il}|${ilce}|${ada}|${parsel}`;
  const exact = KKA_DEMO_IMAR_ROWS.find((r) => r.key === exactKey);
  if (exact) return rowToProfile(exact, "ada_parsel_match", exactKey);

  const ilceKey = `${il}|${ilce}|*|*`;
  const fb = KKA_DEMO_IMAR_ROWS.find((r) => r.key === ilceKey);
  if (fb) return rowToProfile(fb, "ilce_fallback", ilceKey);

  const def = KKA_DEMO_IMAR_ROWS.find((r) => r.key === DEFAULT_KKA_IMAR_KEY)!;
  return rowToProfile(def, "default", DEFAULT_KKA_IMAR_KEY);
}

function finitePositive(n: unknown, fallback: number): number {
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function computeKkaBuildingSummary(input: KkaParselFormInput): KkaBuildingSummary {
  const land = finitePositive(input.landAreaM2, 0);
  if (land <= 0) throw new RangeError("landAreaM2");

  const profile = resolveImarProfile(input);
  const effectiveEmsal = finitePositive(input.emsalOverride, profile.emsal);
  const effectiveTaks = finitePositive(input.taksOverride, profile.taks);
  const effectiveMaxStoreys = Math.floor(finitePositive(input.maxStoreysOverride, profile.maxStoreysReg));

  if (effectiveTaks > 1) throw new RangeError("taks");
  if (effectiveEmsal > 5) throw new RangeError("emsal");

  const maxFootprintM2 = land * effectiveTaks;
  const grossConstructionRightM2 = land * effectiveEmsal;

  const floorsFromEmsalTaks =
    effectiveTaks > 1e-9 ? Math.floor(effectiveEmsal / effectiveTaks + 1e-12) : effectiveMaxStoreys;

  let storeysLimitedByHeight: number | undefined;
  if (profile.maxBuildingHeightM && profile.typicalFloorHeightM > 0) {
    storeysLimitedByHeight = Math.floor(profile.maxBuildingHeightM / profile.typicalFloorHeightM);
  }

  const cappedFloorsBuildable = Math.min(
    effectiveMaxStoreys,
    floorsFromEmsalTaks,
    storeysLimitedByHeight ?? 999,
  );

  const share = Math.min(1, Math.max(0, input.ownerShareOfSellable));
  const ownerApproxSellableM2 = grossConstructionRightM2 * share;
  const contractorApproxSellableM2 = Math.max(0, grossConstructionRightM2 - ownerApproxSellableM2);

  const unitM = finitePositive(input.assumedNetUnitM2, 110);
  const ownerEquivalentUnits = Math.round((ownerApproxSellableM2 / unitM) * 100) / 100;

  const warnings: string[] = [];
  if (profile.resolutionSource === "default") {
    warnings.push(
      "Il / ilce demo veritabaninda bulunamadi; varsayilan imar parametreleri kullanildi. Resmi imar durumu sorgulayin.",
    );
  }
  if (floorsFromEmsalTaks > effectiveMaxStoreys) {
    warnings.push(
      `Emsal / TAKS orani teorik olarak ${floorsFromEmsalTaks} kat verir; plan notu ile ust sinir ${effectiveMaxStoreys} kata indirildi.`,
    );
  }
  if (storeysLimitedByHeight != null && cappedFloorsBuildable === storeysLimitedByHeight) {
    warnings.push("Kat adedi yukseklik siniri (Hmax / kat yuksekligi) ile sinirlanmis olabilir.");
  }
  warnings.push(
    "Brut / net, bodrum, siginak, merdiven ve ortak alanlar bu ornekte ayrintilandirilmamistir; muteahhit projesi ile netlesir.",
  );

  return {
    profile,
    effectiveEmsal,
    effectiveTaks,
    effectiveMaxStoreys,
    maxFootprintM2,
    grossConstructionRightM2,
    floorsFromEmsalTaks,
    cappedFloorsBuildable,
    storeysLimitedByHeight,
    ownerApproxSellableM2,
    contractorApproxSellableM2,
    ownerEquivalentUnits,
    warnings,
  };
}
