import {
  DEMO_WARNING,
  EXPERT_WARNING,
  KNOWLEDGE_TOPICS,
  LIVE_AI_NOTE,
  type AssistantAction,
} from "@/lib/ai/knowledgeBase";
import { BID_BOND_RATE, COMMISSION_RATE } from "@/lib/fees";

export type AssistantReply = {
  text: string;
  actions: AssistantAction[];
};

export const CHAT_GUIDE_CHIPS = [
  { label: "Nasıl teklif veririm", fill: "nasıl teklif veririm" },
  { label: "Mülkümü sat", fill: "mülkümü satmak istiyorum" },
  { label: "Komisyon hesapla", fill: "komisyon ne kadar" },
  { label: "Borsa nedir", fill: "borsa nedir neden kullanılır" },
] as const;

const DEFAULT_ACTIONS: AssistantAction[] = [
  { label: "İlanlara geç", to: "/ilanlar" },
  { label: "Borsa ekranı", to: "/borsa" },
];

const toPercent = (rate: number): string => `%${Math.round(rate * 100)}`;

function normalizeTr(text: string): string {
  const map: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
  };
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (c) => map[c] ?? c)
    .replace(/\s+/g, " ")
    .trim();
}

function withTail(text: string, expertWarning = false): string {
  return [text, "", DEMO_WARNING, expertWarning ? EXPERT_WARNING : null, `Altyapı notu: ${LIVE_AI_NOTE}`]
    .filter(Boolean)
    .join("\n");
}

function actionReply(text: string, actions: AssistantAction[], expertWarning = false): AssistantReply {
  return {
    text: withTail(text, expertWarning),
    actions: actions.length ? actions : DEFAULT_ACTIONS,
  };
}

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(normalizeTr(needle)));
}

function routeByIntent(rawInput: string): AssistantReply | null {
  const input = normalizeTr(rawInput);

  if (includesAny(input, ["daire ariyorum", "ev ariyorum", "ilan ariyorum", "mulk bakiyorum"])) {
    return actionReply(
      "Şu kriterlerle ilerleyelim: şehir, bütçe, m² ve oda tipini netleyip katalogdan filtreleyelim. Bu akış seni doğrudan uygun ilanlara götürür.",
      [
        { label: "İlan kataloğu (filtrele)", to: "/ilanlar" },
        { label: "Haritada keşfet", to: "/harita" },
        { label: "İlan karşılaştır", to: "/karsilastir" },
      ],
    );
  }

  if (includesAny(input, ["nasil teklif veririm", "teklif nasil", "teklif vermek istiyorum"])) {
    return actionReply(
      [
        "Teklif adımları:",
        `1) Uygun ilanı seç (/ihaleler veya /borsa).`,
        `2) Kimlik/uygunluk ve teminat akışını tamamla (blokaj hedefi ${toPercent(BID_BOND_RATE)}).`,
        "3) Teklifi onayla, sonuç ekranında ödeme/escrow adımını takip et.",
        "4) Hukuki koşulları ve cayma/yedek alıcı maddelerini ihale koşullarından kontrol et.",
      ].join("\n"),
      [
        { label: "Borsa terminali", to: "/borsa" },
        { label: "Canlı ihaleler", to: "/ihaleler" },
        { label: "İhale koşulları", to: "/ihale-kosullari" },
      ],
      true,
    );
  }

  if (includesAny(input, ["mulkumu satmak istiyorum", "evimi satmak istiyorum", "satisa basla"])) {
    return actionReply(
      "Satıcı akışını başlatalım: önce satış başlat ekranına geç, ardından değerleme ve borsa stratejisini birlikte kur.",
      [
        { label: "Satışa başla", to: "/sat-basla" },
        { label: "Değerleme", to: "/degerleme" },
        { label: "Borsa stratejisi", to: "/borsa" },
      ],
      true,
    );
  }

  if (includesAny(input, ["komisyon ne kadar", "komisyon", "ucret", "bedel"])) {
    return actionReply(
      [
        `Satış tarafında referans komisyon çerçevesi ${toPercent(COMMISSION_RATE)} + ${toPercent(COMMISSION_RATE)} modelidir; KDV ve sözleşme maddeleri ayrıca değerlendirilir.`,
        "Örnek yaklaşım: işlem matrahını hesaplayıcıya gir, hizmet kalemlerini ekle ve net dağılımı gör.",
      ].join("\n"),
      [
        { label: "Komisyon hesaplayıcı", to: "/komisyon-hesaplayici" },
        { label: "Gelir modeli", to: "/komisyon-modeli" },
        { label: "Hizmet bedelleri", to: "/hizmet-bedelleri" },
      ],
      true,
    );
  }

  if (includesAny(input, ["guvenli mi", "güvenli mi", "dolandiricilik", "escrow", "kyc"])) {
    return actionReply(
      [
        "Güvenlik çerçevesi özet: KYC doğrulama, teklif teminat blokajı, kayıtlı işlem izi ve koşullu ödeme (escrow) birlikte çalışır.",
        "Platform dışı kapora/IBAN yerine resmi akışları kullan; sözleşme ve güvenlik metinlerini işlem öncesi kontrol et.",
      ].join("\n"),
      [
        { label: "Güvenlik merkezi", to: "/guvenlik" },
        { label: "Dolandırıcılık savunması", to: "/yasal/dolandiricilik-savunmasi" },
        { label: "İhale koşulları", to: "/ihale-kosullari" },
      ],
      true,
    );
  }

  return null;
}

function topicReply(rawInput: string): AssistantReply | null {
  const input = normalizeTr(rawInput);
  for (const topic of KNOWLEDGE_TOPICS) {
    if (!includesAny(input, topic.keywords)) continue;
    const summary = [
      `${topic.title}:`,
      ...topic.summaryLines.map((line) => `- ${line}`),
      "",
      `Kaynaklar: ${topic.sources.join(" · ")}`,
      "",
      "Sonraki adım: aşağıdaki aksiyonlardan birini seç.",
    ].join("\n");
    return actionReply(summary, topic.actions, topic.expertWarning);
  }
  return null;
}

export function buildAssistantReply(input: string): AssistantReply {
  const intent = routeByIntent(input);
  if (intent) return intent;

  const topic = topicReply(input);
  if (topic) return topic;

  return actionReply(
    [
      "Sorunu bu haliyle kesin bir başlıkla eşleştiremedim; uydurma cevap vermiyorum.",
      "İstersen hedefini şu formatla yaz: 'şehir + bütçe + amaç' veya 'teklif/komisyon/imar' konusu.",
      "Sonraki adım: aşağıdaki yönlendirmelerle başlayabiliriz.",
    ].join("\n"),
    DEFAULT_ACTIONS,
    true,
  );
}
