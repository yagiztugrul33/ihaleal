import { calculateAirbnbPotential } from "../../../shared/calculators";
import { parseNumericInput } from "./formatters";

type AirbnbPotentialResult = ReturnType<typeof calculateAirbnbPotential>;

export type AirbnbPotentialForm = {
  nightlyRateTry: string;
  occupancyRatePct: string;
  cleaningCostPerStayTry: string;
  expectedStaysPerYear: string;
  platformCommissionRatePct: string;
  annualOperatingCostTry: string;
  vacancyReserveRatePct: string;
  longTermMonthlyRentTry: string;
};

export function getDefaultAirbnbPotentialForm(): AirbnbPotentialForm {
  return {
    nightlyRateTry: "3.500",
    occupancyRatePct: "68",
    cleaningCostPerStayTry: "750",
    expectedStaysPerYear: "85",
    platformCommissionRatePct: "18",
    annualOperatingCostTry: "220.000",
    vacancyReserveRatePct: "7",
    longTermMonthlyRentTry: "48.000",
  };
}

export function validateAirbnbPotentialForm(form: AirbnbPotentialForm): string | null {
  const nightly = parseNumericInput(form.nightlyRateTry);
  const occupancy = parseNumericInput(form.occupancyRatePct);
  const cleaning = parseNumericInput(form.cleaningCostPerStayTry);
  const stays = parseNumericInput(form.expectedStaysPerYear);
  const commission = parseNumericInput(form.platformCommissionRatePct);
  const annualOps = parseNumericInput(form.annualOperatingCostTry);
  const vacancy = parseNumericInput(form.vacancyReserveRatePct);
  const longTerm = parseNumericInput(form.longTermMonthlyRentTry);

  if (!Number.isFinite(nightly) || nightly < 0) return "Gecelik fiyat geçersiz.";
  if (!Number.isFinite(occupancy) || occupancy < 0 || occupancy > 100) return "Doluluk oranı %0-100 arasında olmalı.";
  if (!Number.isFinite(cleaning) || cleaning < 0) return "Temizlik bedeli negatif olamaz.";
  if (!Number.isFinite(stays) || stays < 0 || stays > 365) return "Yıllık konaklama adedi 0-365 olmalı.";
  if (!Number.isFinite(commission) || commission < 0 || commission > 100) return "Platform kesintisi %0-100 arasında olmalı.";
  if (!Number.isFinite(annualOps) || annualOps < 0) return "Yıllık işletme gideri negatif olamaz.";
  if (!Number.isFinite(vacancy) || vacancy < 0 || vacancy > 100) return "Boşluk rezerv oranı %0-100 arasında olmalı.";
  if (!Number.isFinite(longTerm) || longTerm < 0) return "Uzun dönem kira değeri negatif olamaz.";

  return null;
}

export function computeAirbnbPotential(
  form: AirbnbPotentialForm,
): { error: string } | { value: AirbnbPotentialResult } {
  const error = validateAirbnbPotentialForm(form);
  if (error) return { error };

  const result = calculateAirbnbPotential({
    nightlyRateTry: parseNumericInput(form.nightlyRateTry),
    occupancyRatePct: parseNumericInput(form.occupancyRatePct),
    cleaningCostPerStayTry: parseNumericInput(form.cleaningCostPerStayTry),
    expectedStaysPerYear: parseNumericInput(form.expectedStaysPerYear),
    platformCommissionRatePct: parseNumericInput(form.platformCommissionRatePct),
    annualOperatingCostTry: parseNumericInput(form.annualOperatingCostTry),
    vacancyReserveRatePct: parseNumericInput(form.vacancyReserveRatePct),
    longTermMonthlyRentTry: parseNumericInput(form.longTermMonthlyRentTry),
  });

  return { value: result };
}

export function buildAirbnbPotentialRows(result: AirbnbPotentialResult): { label: string; value: number }[] {
  return [
    { label: "Yıllık brüt gelir", value: result.annualGrossRevenueTry },
    { label: "Temizlik maliyeti", value: result.annualCleaningCostTry },
    { label: "Platform kesintisi", value: result.annualCommissionTry },
    { label: "Yıllık net gelir", value: result.annualNetRevenueTry },
    { label: "Uzun dönem kiraya fark", value: result.differenceVsLongTermTry },
  ];
}
