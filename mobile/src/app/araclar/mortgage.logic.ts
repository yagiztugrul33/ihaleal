import { calculateMortgage, type MortgageResult } from "../../../shared/calculators";
import { parseNumericInput } from "./formatters";

export type MortgageForm = {
  propertyPrice: string;
  downPaymentPct: string;
  annualRatePct: string;
  termMonths: string;
};

export type MortgageComputed = {
  principalTry: number;
  result: MortgageResult;
};

export function getDefaultMortgageForm(): MortgageForm {
  return {
    propertyPrice: "5.000.000",
    downPaymentPct: "20",
    annualRatePct: "36",
    termMonths: "120",
  };
}

export function validateMortgageForm(form: MortgageForm): string | null {
  const propertyPrice = parseNumericInput(form.propertyPrice);
  const downPaymentPct = parseNumericInput(form.downPaymentPct);
  const annualRatePct = parseNumericInput(form.annualRatePct);
  const termMonths = parseNumericInput(form.termMonths);

  if (!Number.isFinite(propertyPrice) || propertyPrice <= 0) return "Gayrimenkul fiyatı 0'dan büyük olmalı.";
  if (!Number.isFinite(downPaymentPct) || downPaymentPct < 0 || downPaymentPct >= 100)
    return "Peşinat oranı 0-99 arasında olmalı.";
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0 || annualRatePct > 200)
    return "Yıllık faiz %0 ile %200 arasında olmalı.";
  if (!Number.isFinite(termMonths) || termMonths < 1 || termMonths > 600) return "Vade 1-600 ay arasında olmalı.";

  return null;
}

export function computeMortgage(form: MortgageForm): { error: string } | { value: MortgageComputed } {
  const error = validateMortgageForm(form);
  if (error) return { error };

  const propertyPrice = parseNumericInput(form.propertyPrice);
  const downPaymentPct = parseNumericInput(form.downPaymentPct);
  const annualRatePct = parseNumericInput(form.annualRatePct);
  const termMonths = parseNumericInput(form.termMonths);
  const principalTry = propertyPrice * (1 - downPaymentPct / 100);

  const result = calculateMortgage({
    principalTry,
    annualInterestRatePct: annualRatePct,
    termMonths: Math.round(termMonths),
  });

  if (result.monthlyInstallmentTry <= 0) {
    return { error: "Hesap sonucu geçersiz. Girdi değerlerini kontrol edin." };
  }

  return { value: { principalTry, result } };
}

export function buildMortgageSummaryRows(result: MortgageResult): { label: string; value: number }[] {
  return [
    { label: "Aylık taksit", value: result.monthlyInstallmentTry },
    { label: "Toplam ödeme", value: result.totalPaymentTry },
    { label: "Toplam faiz", value: result.totalInterestTry },
    { label: "Aylık faiz oranı (%)", value: result.monthlyRate * 100 },
  ];
}
