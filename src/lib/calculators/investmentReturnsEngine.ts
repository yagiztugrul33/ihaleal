export type InvestmentReturnsInput = {
  propertyPriceTry: number;
  monthlyRentTry: number;
  annualExpensesTry: number;
  annualAppreciationPct: number;
  holdingYears: number;
  city: "istanbul" | "tr";
};

export type InvestmentReturnsResult = {
  annualGrossRentTry: number;
  annualNetRentTry: number;
  grossYieldPct: number;
  netYieldPct: number;
  rentMultiplierMonths: number;
  referenceMultiplierMonths: number;
  multiplierDeltaMonths: number;
  paybackYears: number;
  roiPct: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateInvestmentReturns(input: InvestmentReturnsInput): InvestmentReturnsResult {
  const price = Math.max(1, input.propertyPriceTry);
  const monthlyRent = Math.max(0, input.monthlyRentTry);
  const annualExpenses = Math.max(0, input.annualExpensesTry);
  const years = Math.max(1, Math.floor(input.holdingYears));
  const appreciationPct = Math.max(-100, input.annualAppreciationPct);

  const annualGrossRent = monthlyRent * 12;
  const annualNetRent = Math.max(0, annualGrossRent - annualExpenses);
  const grossYieldPct = (annualGrossRent / price) * 100;
  const netYieldPct = (annualNetRent / price) * 100;
  const rentMultiplierMonths = monthlyRent > 0 ? price / monthlyRent : Number.POSITIVE_INFINITY;
  const referenceMultiplierMonths = input.city === "istanbul" ? 212 : 214;
  const multiplierDeltaMonths = rentMultiplierMonths - referenceMultiplierMonths;
  const paybackYears = annualNetRent > 0 ? price / annualNetRent : Number.POSITIVE_INFINITY;

  const valueAtExit = price * Math.pow(1 + appreciationPct / 100, years);
  const valueGain = valueAtExit - price;
  const totalNetRent = annualNetRent * years;
  const roiPct = ((totalNetRent + valueGain) / price) * 100;

  return {
    annualGrossRentTry: round2(annualGrossRent),
    annualNetRentTry: round2(annualNetRent),
    grossYieldPct: round2(grossYieldPct),
    netYieldPct: round2(netYieldPct),
    rentMultiplierMonths: round2(rentMultiplierMonths),
    referenceMultiplierMonths,
    multiplierDeltaMonths: round2(multiplierDeltaMonths),
    paybackYears: round2(paybackYears),
    roiPct: round2(roiPct),
  };
}
