import { getMethodology } from "../core/methodology";
import { createPipeline, recordStep } from "../core/pipeline";
import type { EngineeringResult } from "../core/types";
import { resolveRegionalGhi } from "./constants";

export type IrradianceInput = {
  annualGhiKwhM2?: number;
  annualPoaKwhM2?: number;
  regionKey?: string;
  tiltDeg?: number;
  azimuthDeg?: number;
};

export type IrradianceOutput = {
  annualGhiKwhM2: number;
  annualPoaKwhM2: number;
  peakSunHours: number;
  monthlyPoaKwhM2: number[];
};

/** Simplified POA factor from tilt — PVGIS recommended for bankable studies */
function poaFactorFromTilt(tiltDeg: number): number {
  const t = Math.max(0, Math.min(60, tiltDeg));
  return 1.02 + t * 0.0035;
}

const MONTHLY_FRACTION = [
  0.055, 0.065, 0.085, 0.095, 0.11, 0.12, 0.125, 0.115, 0.095, 0.075, 0.055, 0.05,
];

export function computeIrradiance(input: IrradianceInput): EngineeringResult<IrradianceOutput> {
  const ctx = createPipeline();
  const methodology = getMethodology("pvgis-ghi-poa");
  const ghi = input.annualGhiKwhM2 ?? resolveRegionalGhi(input.regionKey);
  const tilt = input.tiltDeg ?? 25;
  const poa =
    input.annualPoaKwhM2 ?? ghi * poaFactorFromTilt(tilt);
  const peakSunHours = poa / 1000;
  const monthlyPoaKwhM2 = MONTHLY_FRACTION.map((f) => poa * f);

  recordStep(ctx, {
    label: "Annual POA",
    formula: "H_POA ≈ GHI × f_tilt(β)  [simplified]",
    inputs: { GHI: ghi, tilt_deg: tilt, f_tilt: poaFactorFromTilt(tilt) },
    output: poa,
    unit: "kWh/m²/year",
    methodologyId: methodology.id,
  });

  return {
    value: { annualGhiKwhM2: ghi, annualPoaKwhM2: poa, peakSunHours, monthlyPoaKwhM2 },
    confidence: input.annualPoaKwhM2 ? "medium" : "low",
    methodology,
    assumptions: [
      {
        id: "poa-model",
        label: "POA model",
        value: "Tilt factor heuristic",
        source: "default",
        rationale: "Replace with PVGIS POA for coordinates",
      },
    ],
    steps: ctx.steps,
    limitations: ["DNI/DHI split not modeled; no horizon shading."],
  };
}
