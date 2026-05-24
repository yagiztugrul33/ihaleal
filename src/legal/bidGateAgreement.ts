/**
 * Teklif verme öncesi zorunlu onay metinleri (taslak).
 * Canlıya çıkmadan avukat incelemesi şarttır.
 */
import {
  PLATFORM_PENALTY_RATE,
  VICTIM_COMPENSATION_RATE,
  WITHDRAWAL_PENALTY_RATE,
} from "@/lib/fees";

export type BidGateAckId =
  | "auction_terms"
  | "usage_terms"
  | "binding_bid"
  | "mode_validity_rules"
  | "mode_price_change_rules"
  | "mode_withdrawal_rules"
  | "anti_fraud"
  | "aml_kyc"
  | "records_evidence"
  | "withdraw_penalty_split"
  | "winner_payment_deadline"
  | "backup_bidders_flow";

export const BID_GATE_ORDER: BidGateAckId[] = [
  "auction_terms",
  "usage_terms",
  "binding_bid",
  "mode_validity_rules",
  "mode_price_change_rules",
  "mode_withdrawal_rules",
  "anti_fraud",
  "aml_kyc",
  "records_evidence",
  "withdraw_penalty_split",
  "winner_payment_deadline",
  "backup_bidders_flow",
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
    id: "mode_validity_rules",
    label:
      "Geçerlilik kuralını okudum: borsa modunda teklif ihale süresince geçerlidir; standart teklifte geçerlilik 48 saat; karşı teklifte geçerlilik 24 saattir.",
  },
  {
    id: "mode_price_change_rules",
    label:
      "Fiyat değişikliği kuralını okudum: borsa modunda ihale başladıktan sonra açılış fiyatı sabittir; standart ilanda satıcı fiyat düşürebilir, aktif teklif varken yükseltme kısıtına tabidir.",
  },
  {
    id: "mode_withdrawal_rules",
    label:
      "Geri çekme kuralını okudum: borsa modunda teklif bağlayıcıdır ve geri alınamaz; teklif geldikten sonra satıcı çekmesi cayma cezasına tabidir. Standart modda kabul öncesi geri çekme serbest, kabul sonrası ceza uygulanır.",
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
  {
    id: "withdraw_penalty_split",
    label:
      `Cayma cezası politikasını baştan kabul ediyorum: toplam %${(
        WITHDRAWAL_PENALTY_RATE * 100
      ).toFixed(0)} ceza; %${(VICTIM_COMPENSATION_RATE * 100).toFixed(0)} mağdura tazminat, %${(
        PLATFORM_PENALTY_RATE * 100
      ).toFixed(0)} + KDV platform hizmet bedeli olarak işlenir (taslak; uzman onayı bekliyor).`,
    to: "/iade-iptal",
    linkLabel: "Cayma/ceza politikası",
  },
  {
    id: "winner_payment_deadline",
    label:
      "Kazananın 3 iş günü içinde ödeme adımını tamamlaması gerektiğini; sürede tamamlanmazsa cayma süreci ve teminat iradı uygulanabileceğini (taslak) kabul ediyorum.",
  },
  {
    id: "backup_bidders_flow",
    label:
      "Yedek alıcı akışını okudum: kazanan cayarsa 2. ve 3. en yüksek teklif sahibine sırayla 3’er iş günü öncelik tanınır; süre ve bildirimler işlem öncesi gösterilir.",
  },
];

export function initialBidGateAck(): Record<BidGateAckId, boolean> {
  return {
    auction_terms: false,
    usage_terms: false,
    binding_bid: false,
    mode_validity_rules: false,
    mode_price_change_rules: false,
    mode_withdrawal_rules: false,
    anti_fraud: false,
    aml_kyc: false,
    records_evidence: false,
    withdraw_penalty_split: false,
    winner_payment_deadline: false,
    backup_bidders_flow: false,
  };
}

export function isBidGateComplete(ack: Record<BidGateAckId, boolean>): boolean {
  return BID_GATE_ORDER.every((id) => ack[id] === true);
}
