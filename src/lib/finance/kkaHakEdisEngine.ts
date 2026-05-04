/**
 * Kat karsiligi (arsa karsiligi konut) — basit hak edis / gelir projeksiyonu.
 */

export type KkaScenarioId = "pessimistic" | "realistic" | "optimistic";

export interface KkaHakEdisInput {
  ownerIndependentUnits: number;
  expectedUnitSaleTry: number;
  scenario: KkaScenarioId;
}

export interface KkaHakEdisResult {
  scenario: KkaScenarioId;
  nominalGrossTry: number;
  scenarioAdjustedTry: number;
  factorApplied: number;
  notes: string;
}

const SCENARIO_FACTOR: Record<KkaScenarioId, number> = {
  pessimistic: 0.88,
  realistic: 1,
  optimistic: 1.06,
};

function roundTry(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeKkaOwnerHakEdisProjection(input: KkaHakEdisInput): KkaHakEdisResult {
  const u = input.ownerIndependentUnits;
  const p = input.expectedUnitSaleTry;
  if (!Number.isFinite(u) || u <= 0 || u > 1e6) throw new RangeError("ownerIndependentUnits");
  if (!Number.isFinite(p) || p <= 0 || p > 1e12) throw new RangeError("expectedUnitSaleTry");

  const nominal = roundTry(u * p);
  const factor = SCENARIO_FACTOR[input.scenario];
  const adjusted = roundTry(nominal * factor);

  const notes =
    input.scenario === "pessimistic"
      ? "Kotumser: piyasa yumusamasi / gec teslim riski icin ornek kesinti."
      : input.scenario === "optimistic"
        ? "Iyimser: segment talebi ve hizli satis varsayimiyla sinirli artis."
        : "Gercekci: baz birim fiyat ile dogrudan carpim.";

  return {
    scenario: input.scenario,
    nominalGrossTry: nominal,
    scenarioAdjustedTry: adjusted,
    factorApplied: factor,
    notes,
  };
}

export function computeKkaShareByRatio(input: {
  totalSellableUnits: number;
  ownerShareRatio: number;
  averageUnitSaleTry: number;
  scenario: KkaScenarioId;
}): KkaHakEdisResult & { ownerUnitsEquivalent: number } {
  if (!Number.isFinite(input.totalSellableUnits) || input.totalSellableUnits <= 0 || input.totalSellableUnits > 1e6) {
    throw new RangeError("totalSellableUnits");
  }
  if (!Number.isFinite(input.ownerShareRatio) || input.ownerShareRatio <= 0 || input.ownerShareRatio > 1) {
    throw new RangeError("ownerShareRatio");
  }
  const ownerUnits = input.totalSellableUnits * input.ownerShareRatio;
  return {
    ...computeKkaOwnerHakEdisProjection({
      ownerIndependentUnits: ownerUnits,
      expectedUnitSaleTry: input.averageUnitSaleTry,
      scenario: input.scenario,
    }),
    ownerUnitsEquivalent: roundTry(ownerUnits),
  };
}