import type { IlanAiAnalysisInput, IlanAiAnalysisResult } from "./types";

export interface IlanAiAnalysisService {
  analyzeIlan(input: IlanAiAnalysisInput): Promise<IlanAiAnalysisResult>;
}

export const mockIlanAiService: IlanAiAnalysisService = {
  async analyzeIlan(input) {
    const gapRatio = input.ilan.priceTry / Math.max(1, input.ilan.estimatedValueTry);
    const riskScore = Math.min(100, Math.max(5, Math.round((1.2 - gapRatio) * 100)));

    const riskLabel = riskScore >= 65 ? "Yüksek" : riskScore >= 35 ? "Orta" : "Düşük";
    const priceFairness =
      gapRatio <= 0.95 ? "Uygun" : gapRatio <= 1.08 ? "Sınırda" : "Yüksek";

    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      providerName: "MockAI Secure",
      summary:
        "İlan verisi iç veri kaynağından çekildi ve mock risk/fiyat analizi üretildi. Sonuç yatırım tavsiyesi değildir.",
      riskScore,
      riskLabel,
      priceFairness,
      highlights: [
        `AI skor referansı: ${input.ilan.aiScore}/100`,
        `Fiyat: ${input.ilan.priceTry.toLocaleString("tr-TR")} TL`,
        `Tahmini değer: ${input.ilan.estimatedValueTry.toLocaleString("tr-TR")} TL`,
      ],
    };
  },
};
