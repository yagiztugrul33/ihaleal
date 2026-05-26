export type MortgageInput = {
  principalTry: number;
  annualInterestRatePct: number;
  termMonths: number;
};

export type MortgageInstallmentRow = {
  month: number;
  installmentTry: number;
  principalPaidTry: number;
  interestPaidTry: number;
  remainingPrincipalTry: number;
};

export type MortgageResult = {
  monthlyRate: number;
  monthlyInstallmentTry: number;
  totalPaymentTry: number;
  totalInterestTry: number;
  schedule: MortgageInstallmentRow[];
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const principal = Math.max(0, input.principalTry);
  const months = Math.max(1, Math.floor(input.termMonths));
  const monthlyRate = Math.max(0, input.annualInterestRatePct) / 100 / 12;

  // Aylık taksit formülü:
  // P × [r(1+r)^n] / [(1+r)^n−1]
  const monthlyInstallmentTry =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

  let remaining = principal;
  const schedule: MortgageInstallmentRow[] = [];

  for (let month = 1; month <= months; month++) {
    const interestPaid = remaining * monthlyRate;
    let principalPaid = monthlyInstallmentTry - interestPaid;
    if (month === months) {
      principalPaid = remaining;
    }
    remaining = Math.max(0, remaining - principalPaid);

    schedule.push({
      month,
      installmentTry: round2(monthlyInstallmentTry),
      principalPaidTry: round2(principalPaid),
      interestPaidTry: round2(interestPaid),
      remainingPrincipalTry: round2(remaining),
    });
  }

  const totalPaymentTry = round2(monthlyInstallmentTry * months);
  const totalInterestTry = round2(totalPaymentTry - principal);

  return {
    monthlyRate,
    monthlyInstallmentTry: round2(monthlyInstallmentTry),
    totalPaymentTry,
    totalInterestTry,
    schedule,
  };
}
