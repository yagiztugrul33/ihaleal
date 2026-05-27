export type IlanAiConsentState = {
  illuminationAccepted: boolean;
  explicitConsentAccepted: boolean;
};

export type IlanRecord = {
  id: string;
  title: string;
  city: string;
  district: string;
  priceTry: number;
  estimatedValueTry: number;
  aiScore: number;
};

export type IlanAiAnalysisInput = {
  ilan: IlanRecord;
  consent: IlanAiConsentState;
};

export type IlanAiAnalysisResult = {
  providerName: string;
  summary: string;
  riskScore: number;
  riskLabel: "Düşük" | "Orta" | "Yüksek";
  priceFairness: "Uygun" | "Sınırda" | "Yüksek";
  highlights: string[];
};
