import { calculateRealFxReturn } from "../../../shared/calculators";
import { parseNumericInput } from "./formatters";

type RealFxReturnResult = ReturnType<typeof calculateRealFxReturn>;

export type RealFxReturnForm = {
  initialTry: string;
  finalTry: string;
  annualInflationPct: string;
  startUsdTry: string;
  endUsdTry: string;
};

export function getDefaultRealFxReturnForm(): RealFxReturnForm {
  return {
    initialTry: "1.000.000",
    finalTry: "1.370.000",
    annualInflationPct: "41,1",
    startUsdTry: "32,4",
    endUsdTry: "38,7",
  };
}

export function validateRealFxReturnForm(form: RealFxReturnForm): string | null {
  const initial = parseNumericInput(form.initialTry);
  const final = parseNumericInput(form.finalTry);
  const inflation = parseNumericInput(form.annualInflationPct);
  const usdStart = parseNumericInput(form.startUsdTry);
  const usdEnd = parseNumericInput(form.endUsdTry);

  if (!Number.isFinite(initial) || initial <= 0) return "Başlangıç tutarı 0'dan büyük olmalı.";
  if (!Number.isFinite(final) || final < 0) return "Bitiş tutarı negatif olamaz.";
  if (!Number.isFinite(inflation) || inflation < -99.99 || inflation > 500)
    return "Enflasyon oranı %-99.99 ile %500 arasında olmalı.";
  if (!Number.isFinite(usdStart) || usdStart <= 0) return "Başlangıç USD kuru 0'dan büyük olmalı.";
  if (!Number.isFinite(usdEnd) || usdEnd <= 0) return "Bitiş USD kuru 0'dan büyük olmalı.";

  return null;
}

export function computeRealFxReturn(form: RealFxReturnForm): { error: string } | { value: RealFxReturnResult } {
  const error = validateRealFxReturnForm(form);
  if (error) return { error };

  const result = calculateRealFxReturn({
    initialTry: parseNumericInput(form.initialTry),
    finalTry: parseNumericInput(form.finalTry),
    annualInflationPct: parseNumericInput(form.annualInflationPct),
    startUsdTry: parseNumericInput(form.startUsdTry),
    endUsdTry: parseNumericInput(form.endUsdTry),
  });

  return { value: result };
}

export function buildRealFxReturnRows(result: RealFxReturnResult): { label: string; value: number }[] {
  return [
    { label: "Nominal getiri", value: result.nominalReturnPct },
    { label: "Reel getiri", value: result.realReturnPct },
    { label: "USD bazlı getiri", value: result.usdReturnPct },
    { label: "Başlangıç USD karşılığı", value: result.initialUsdAmount },
    { label: "Bitiş USD karşılığı", value: result.finalUsdAmount },
  ];
}
