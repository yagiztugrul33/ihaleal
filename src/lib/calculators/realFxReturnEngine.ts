export type RealFxReturnInput = {
  initialTry: number;
  finalTry: number;
  annualInflationPct: number;
  startUsdTry: number;
  endUsdTry: number;
};

export type RealFxReturnResult = {
  nominalReturnPct: number;
  realReturnPct: number;
  usdReturnPct: number;
  initialUsdAmount: number;
  finalUsdAmount: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateRealFxReturn(input: RealFxReturnInput): RealFxReturnResult {
  const initial = Math.max(1, input.initialTry);
  const final = Math.max(0, input.finalTry);
  const inflation = Math.max(-99.99, input.annualInflationPct);
  const usdStart = Math.max(0.0001, input.startUsdTry);
  const usdEnd = Math.max(0.0001, input.endUsdTry);

  const nominal = final / initial - 1;
  const real = (1 + nominal) / (1 + inflation / 100) - 1;
  const initialUsdAmount = initial / usdStart;
  const finalUsdAmount = final / usdEnd;
  const usdReturn = finalUsdAmount / initialUsdAmount - 1;

  return {
    nominalReturnPct: round2(nominal * 100),
    realReturnPct: round2(real * 100),
    usdReturnPct: round2(usdReturn * 100),
    initialUsdAmount: round2(initialUsdAmount),
    finalUsdAmount: round2(finalUsdAmount),
  };
}
