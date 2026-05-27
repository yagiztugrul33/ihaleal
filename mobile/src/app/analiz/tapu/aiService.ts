import { maskOwnerName, maskParcel, maskTckn } from "./privacy";
import type {
  TapuAiAnalysisInput,
  TapuAiAnalysisResult,
  TapuDocumentSelection,
} from "./types";

export interface TapuAiAnalysisService {
  analyzeTapu(input: TapuAiAnalysisInput): Promise<TapuAiAnalysisResult>;
}

function deriveRisk(document: TapuDocumentSelection): "Düşük" | "Orta" | "Yüksek" {
  if (document.name.toLowerCase().includes("eksik")) {
    return "Yüksek";
  }
  if (document.kind === "pdf") {
    return "Düşük";
  }
  return "Orta";
}

export const mockTapuAiService: TapuAiAnalysisService = {
  async analyzeTapu(input) {
    const risk = deriveRisk(input.document);
    const owner = "Ahmet Demir";
    const tckn = "12345678910";
    const parcel = "123 Ada 45 Parsel";

    await new Promise((resolve) => setTimeout(resolve, 450));

    return {
      providerName: "MockAI Secure",
      summary:
        "Belge metni örnek kurallar ile tarandı. Sonuç yalnız bilgilendirme amaçlıdır, hukuki karar için uzman görüşü gerekir.",
      riskLevel: risk,
      ownerMasked: maskOwnerName(owner),
      tcknMasked: maskTckn(tckn),
      parcelMasked: maskParcel(parcel),
      notes: [
        "Tapu sahibine ait kimlik bilgisi maskeleme uygulanarak işlendi.",
        "Ham dosya kalıcı olarak saklanmadı; analiz sonrası bellekten temizlendi.",
        "Bu sonuç çekirdek AI entegrasyonu bağlanana kadar mock üretimidir.",
      ],
    };
  },
};
