import { DEED_DUTY_RATE } from "@/lib/fees";

export type PortfolioTaxInput = {
  purchaseTry: number;
  currentTry: number;
  purchasedAt: string;
  sellMode: "yeniden_ihale" | "sabit_satis" | "kiraya_ver" | "takasa_ac" | "devren";
};

export type PortfolioTaxEstimate = {
  yearsHeld: number;
  titleDeedFeeTry: number;
  estimatedValueGainTaxTry: number;
  tradeInDoubleLiabilityWarning: boolean;
  notes: string[];
};

export function estimatePortfolioTax(input: PortfolioTaxInput): PortfolioTaxEstimate {
  const purchaseDate = new Date(input.purchasedAt);
  const yearsHeld = Number.isFinite(purchaseDate.getTime())
    ? Math.max(0, (Date.now() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 0;
  const roundedYears = Number(yearsHeld.toFixed(1));

  const gain = Math.max(0, input.currentTry - input.purchaseTry);
  const overFiveYears = yearsHeld >= 5;
  const estimatedValueGainTaxTry = overFiveYears ? 0 : Math.round(gain * 0.15);
  const titleDeedFeeTry = Math.round(input.currentTry * DEED_DUTY_RATE);
  const tradeInDoubleLiabilityWarning = input.sellMode === "takasa_ac";

  const notes: string[] = [
    "Tahmini vergi görünümüdür; nihai hesap için mali müşavire danışın.",
    overFiveYears
      ? "5 yıl üzeri elde tutma varsayımı ile değer artışı vergisi 0 kabul edilmiştir."
      : "5 yıl altı elde tutma için tahmini değer artışı vergisi hesaplanmıştır.",
    `Tapu harcı yaklaşık %${Math.round(DEED_DUTY_RATE * 100)} oranı ile hesaplanmıştır.`,
  ];

  if (tradeInDoubleLiabilityWarning) {
    notes.push("Takas senaryosunda taraflar için çift yükümlülük ve ek masraf doğabilir.");
  }

  return {
    yearsHeld: roundedYears,
    titleDeedFeeTry,
    estimatedValueGainTaxTry,
    tradeInDoubleLiabilityWarning,
    notes,
  };
}
