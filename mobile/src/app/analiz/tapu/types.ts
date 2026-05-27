export type TapuDocumentKind = "pdf" | "image";

export type TapuDocumentSelection = {
  uri: string;
  name: string;
  mimeType: string;
  kind: TapuDocumentKind;
};

export type TapuAiConsentState = {
  illuminationAccepted: boolean;
  explicitConsentAccepted: boolean;
};

export type TapuAiAnalysisInput = {
  document: TapuDocumentSelection;
  consent: TapuAiConsentState;
};

export type TapuAiAnalysisResult = {
  summary: string;
  riskLevel: "Düşük" | "Orta" | "Yüksek";
  ownerMasked: string;
  tcknMasked: string;
  parcelMasked: string;
  notes: string[];
  providerName: string;
};
