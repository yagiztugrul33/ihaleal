/**
 * Teklif verme öncesi zorunlu onay metinleri (taslak).
 * Canlıya çıkmadan avukat incelemesi şarttır.
 */

export type BidGateAckId =
  | "auction_terms"
  | "usage_terms"
  | "binding_bid"
  | "anti_fraud"
  | "aml_kyc"
  | "records_evidence";

export const BID_GATE_ORDER: BidGateAckId[] = [
  "auction_terms",
  "usage_terms",
  "binding_bid",
  "anti_fraud",
  "aml_kyc",
  "records_evidence",
];

export type BidGateCheckboxRow = {
  id: BidGateAckId;
  label: string;
  to?: string;
  linkLabel?: string;
};

export const BID_GATE_CHECKBOXES: BidGateCheckboxRow[] = [
  {
    id: "auction_terms",
    label:
      "Bu ilana özgü süre, minimum artış, uzatma, teminat ve ücret kurallarını içeren ihale katılım koşullarını okudum; teklifimin bu koşullara tabi olduğunu kabul ediyorum.",
    to: "/ihale-kosullari",
    linkLabel: "İhale katılım koşulları",
  },
  {
    id: "usage_terms",
    label:
      "Platform kullanım koşullarında yer alan teklif bağlayıcılığı, yasak davranışlar ve hesap sonlandırma hükümlerini okudum ve kabul ediyorum.",
    to: "/kullanim-kosullari",
    linkLabel: "Kullanım koşulları",
  },
  {
    id: "binding_bid",
    label:
      "Girdiğim teklif tutarının, sistem tarafından zaman damgası ve kayıt altına alınarak bağlayıcı niyet beyanı sayılacağını; kazanırsam sözleşme ve ödeme adımlarına uymayı taahhüt ettiğimi biliyorum (üretim hedefi; demo ortamda kayıt sınırlı olabilir).",
  },
  {
    id: "anti_fraud",
    label:
      "Sahte veya yanıltıcı teklif vermeyeceğimi; manipülasyon, bot, çoklu hesap veya üçüncü kişi adına izinsiz teklif kullanmayacağımı beyan ederim. İhlal halinde teminat ıradı, hesap dondurma ve sözleşmedeki yaptırımlara rıza gösteririm.",
  },
  {
    id: "aml_kyc",
    label:
      "5549 (MASAK) ve mevzuat kapsamında kimlik doğrulama, şüpheli işlem incelemesi ve ek belge talebine uyacağımı; yüksek riskte işlemin durdurulabileceğini kabul ederim.",
  },
  {
    id: "records_evidence",
    label:
      "Uyuşmazlık halinde platform teklif günlükleri, ön yetki referansı ve oturum kayıtlarının (KVKK’ye uygun saklama ile) delil oluşturabileceğini kabul ederim.",
  },
];

export function initialBidGateAck(): Record<BidGateAckId, boolean> {
  return {
    auction_terms: false,
    usage_terms: false,
    binding_bid: false,
    anti_fraud: false,
    aml_kyc: false,
    records_evidence: false,
  };
}

export function isBidGateComplete(ack: Record<BidGateAckId, boolean>): boolean {
  return BID_GATE_ORDER.every((id) => ack[id] === true);
}
