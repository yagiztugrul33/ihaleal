export type MortgageResult = {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
};

/** Konut kredisi — eşit taksit (annuity) formülü. */
export function calcMortgagePayment(
  principalTry: number,
  annualRatePct: number,
  termMonths: number,
): MortgageResult {
  const p = Math.max(0, principalTry);
  const n = Math.max(1, Math.floor(termMonths));
  const r = annualRatePct / 100 / 12;

  if (p === 0) {
    return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0 };
  }
  if (r === 0) {
    const monthly = p / n;
    return { monthlyPayment: monthly, totalPayment: monthly * n, totalInterest: 0 };
  }

  const factor = Math.pow(1 + r, n);
  const monthlyPayment = (p * r * factor) / (factor - 1);
  const totalPayment = monthlyPayment * n;
  return {
    monthlyPayment,
    totalPayment,
    totalInterest: totalPayment - p,
  };
}

export function formatTry(amount: number): string {
  return `₺${Math.round(amount).toLocaleString("tr-TR")}`;
}
