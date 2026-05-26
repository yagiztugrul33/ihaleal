export type AirbnbInput = {
  nightlyRateTry: number;
  occupancyRatePct: number;
  cleaningCostPerStayTry: number;
  expectedStaysPerYear: number;
  platformCommissionRatePct: number;
  annualOperatingCostTry: number;
  vacancyReserveRatePct: number;
  longTermMonthlyRentTry: number;
};

export type AirbnbResult = {
  annualGrossRevenueTry: number;
  annualCleaningCostTry: number;
  annualCommissionTry: number;
  annualVacancyReserveTry: number;
  annualNetRevenueTry: number;
  longTermAnnualRentTry: number;
  differenceVsLongTermTry: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateAirbnbPotential(input: AirbnbInput): AirbnbResult {
  const nightlyRate = Math.max(0, input.nightlyRateTry);
  const occupancyRate = Math.max(0, Math.min(100, input.occupancyRatePct));
  const stays = Math.max(0, input.expectedStaysPerYear);
  const cleaningCostPerStay = Math.max(0, input.cleaningCostPerStayTry);
  const commissionRate = Math.max(0, Math.min(100, input.platformCommissionRatePct));
  const annualOperatingCost = Math.max(0, input.annualOperatingCostTry);
  const vacancyReserveRate = Math.max(0, Math.min(100, input.vacancyReserveRatePct));
  const longTermMonthlyRent = Math.max(0, input.longTermMonthlyRentTry);

  const annualGrossRevenue = nightlyRate * (occupancyRate / 100) * 365;
  const annualCleaningCost = cleaningCostPerStay * stays;
  const annualCommission = annualGrossRevenue * (commissionRate / 100);
  const annualVacancyReserve = annualGrossRevenue * (vacancyReserveRate / 100);
  const annualNetRevenue =
    annualGrossRevenue - annualCleaningCost - annualCommission - annualOperatingCost - annualVacancyReserve;
  const longTermAnnualRent = longTermMonthlyRent * 12;
  const differenceVsLongTerm = annualNetRevenue - longTermAnnualRent;

  return {
    annualGrossRevenueTry: round2(annualGrossRevenue),
    annualCleaningCostTry: round2(annualCleaningCost),
    annualCommissionTry: round2(annualCommission),
    annualVacancyReserveTry: round2(annualVacancyReserve),
    annualNetRevenueTry: round2(annualNetRevenue),
    longTermAnnualRentTry: round2(longTermAnnualRent),
    differenceVsLongTermTry: round2(differenceVsLongTerm),
  };
}
