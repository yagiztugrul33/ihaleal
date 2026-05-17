import { getMethodology } from "../core/methodology";
import { createPipeline, recordStep } from "../core/pipeline";
import type { EngineeringResult, ScenarioBand } from "../core/types";

export type GesFinancialInput = {
  capexTry: number;
  annualOpexTry: number;
  annualRevenueTryByYear: number[];
  /** Annual kWh series for LCOE — required for credible LCOE */
  annualEnergyKwhByYear?: number[];
  discountRatePct: number;
  inflationOpexPct?: number;
  projectYears: number;
};

export type GesFinancialOutput = {
  npvTry: number;
  irrPct: number | null;
  lcoeTryPerKwh: number;
  paybackYears: number | null;
  scenarios: Record<ScenarioBand["id"], { npvTry: number; irrPct: number | null }>;
};

function discountFactor(rate: number, year: number): number {
  return 1 / Math.pow(1 + rate, year);
}

export function npv(
  capex: number,
  cashflows: number[],
  discountRate: number,
): number {
  let sum = -capex;
  for (let t = 1; t <= cashflows.length; t++) {
    sum += cashflows[t - 1] * discountFactor(discountRate, t);
  }
  return sum;
}

/** IRR via bisection on NPV(r)=0 — returns decimal rate or null if no root */
export function irrBisection(capex: number, cashflows: number[], maxIter = 80): number | null {
  let lo = -0.5;
  let hi = 1.5;
  const npvAt = (r: number) => npv(capex, cashflows, r);
  if (npvAt(lo) * npvAt(hi) > 0) return null;
  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2;
    const v = npvAt(mid);
    if (Math.abs(v) < 1e-6) return mid;
    if (v * npvAt(lo) < 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

export function lcoe(
  capex: number,
  opexByYear: number[],
  energyByYear: number[],
  discountRate: number,
): number {
  let pvCost = capex;
  let pvEnergy = 0;
  for (let t = 1; t <= energyByYear.length; t++) {
    const df = discountFactor(discountRate, t);
    pvCost += (opexByYear[t - 1] ?? 0) * df;
    pvEnergy += (energyByYear[t - 1] ?? 0) * df;
  }
  if (pvEnergy <= 0) return Infinity;
  return pvCost / pvEnergy;
}

export function computeGesFinancials(input: GesFinancialInput): EngineeringResult<GesFinancialOutput> {
  const ctx = createPipeline();
  const r = input.discountRatePct / 100;
  const years = input.projectYears;
  const infl = (input.inflationOpexPct ?? 3) / 100;

  const netCashflows: number[] = [];
  for (let y = 1; y <= years; y++) {
    const rev = input.annualRevenueTryByYear[y - 1] ?? 0;
    const opex = input.annualOpexTry * Math.pow(1 + infl, y - 1);
    netCashflows.push(rev - opex);
  }

  const npvTry = npv(input.capexTry, netCashflows, r);
  const irrDec = irrBisection(input.capexTry, netCashflows);
  const irrPct = irrDec != null ? irrDec * 100 : null;

  const opexSeries = netCashflows.map((_, i) => input.annualOpexTry * Math.pow(1 + infl, i));
  const energySeries =
    input.annualEnergyKwhByYear ??
    input.annualRevenueTryByYear.map(() => 0);
  const lcoeTry = lcoe(input.capexTry, opexSeries, energySeries, r);

  let payback: number | null = null;
  let cum = -input.capexTry;
  for (let y = 1; y <= years; y++) {
    cum += netCashflows[y - 1];
    if (cum >= 0) {
      payback = y;
      break;
    }
  }

  const scenarios: GesFinancialOutput["scenarios"] = {
    pessimistic: { npvTry: 0, irrPct: null },
    base: { npvTry, irrPct },
    optimistic: { npvTry: 0, irrPct: null },
  };
  const bands: ScenarioBand[] = [
    { id: "pessimistic", label: "Pessimistic", multiplier: 0.88 },
    { id: "base", label: "Base", multiplier: 1 },
    { id: "optimistic", label: "Optimistic", multiplier: 1.08 },
  ];
  for (const b of bands) {
    const flows = netCashflows.map((c) => c * b.multiplier);
    scenarios[b.id] = {
      npvTry: npv(input.capexTry, flows, r),
      irrPct: (() => {
        const d = irrBisection(input.capexTry, flows);
        return d != null ? d * 100 : null;
      })(),
    };
  }

  recordStep(ctx, {
    label: "NPV",
    formula: "NPV = −CAPEX + Σ CF_t / (1+r)^t",
    inputs: { CAPEX: input.capexTry, r_pct: input.discountRatePct, years },
    output: npvTry,
    unit: "TRY",
    methodologyId: getMethodology("dcf-npv-irr").id,
  });

  recordStep(ctx, {
    label: "LCOE",
    formula: "LCOE = PV(costs) / PV(energy)",
    inputs: { discount_pct: input.discountRatePct },
    output: lcoeTry,
    unit: "TRY/kWh",
    methodologyId: getMethodology("lcoe").id,
  });

  return {
    value: {
      npvTry,
      irrPct,
      lcoeTryPerKwh: lcoeTry,
      paybackYears: payback,
      scenarios,
    },
    confidence: input.annualRevenueTryByYear.some((x) => x > 0) ? "medium" : "low",
    methodology: getMethodology("dcf-npv-irr"),
    assumptions: [
      {
        id: "revenue-model",
        label: "Revenue",
        value: "PPA / merchant price x annual kWh",
        source: "derived",
        rationale: "User must align tariff with market/PPA assumptions",
      },
    ],
    steps: ctx.steps,
    limitations: [
      "Tax, leverage, and depreciation not modeled in this simplified DCF.",
      "LCOE uses revenue-derived energy proxy if explicit kWh series not passed.",
    ],
  };
}
