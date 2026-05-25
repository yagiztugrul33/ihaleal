import {
  DEMO_WARNING,
  EXPERT_WARNING,
  KNOWLEDGE_TOPICS,
  LIVE_AI_LEVEL2_NOTE,
  LIVE_AI_NOTE,
  type AssistantAction,
} from "@/lib/ai/knowledgeBase";
import { BID_BOND_RATE, COMMISSION_RATE } from "@/lib/fees";
import { INITIAL_MARKET_ASSETS } from "@/borsa/useLiveMarket";

export type AssistantReply = {
  text: string;
  actions: AssistantAction[];
};

export const CHAT_GUIDE_CHIPS = [
  { label: "Nasıl teklif veririm", fill: "nasıl teklif veririm" },
  { label: "Emir defteri nasıl okunur", fill: "order book nasıl okunur" },
  { label: "Alış-satış aralığı ve likidite", fill: "spread ve likidite nedir" },
  { label: "Mülkümü sat", fill: "mülkümü satmak istiyorum" },
  { label: "Komisyon hesapla", fill: "komisyon ne kadar" },
  { label: "Kadıköy fırsat var mı", fill: "kadıköyde fırsat var mı" },
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
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function withTail(text: string, expertWarning = false): string {
  return [text, "", DEMO_WARNING, expertWarning ? EXPERT_WARNING : null, `Altyapı notu: ${LIVE_AI_NOTE}`, LIVE_AI_LEVEL2_NOTE]
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

type DynamicBidTarget =
  | { type: "asset"; action: AssistantAction; guidance: string }
  | { type: "region"; action: AssistantAction; guidance: string }
  | null;

const REGION_QUERY_HINTS = [
  { raw: "kadikoy", query: "KADIKÖY" },
  { raw: "besiktas", query: "BEŞİKTAŞ" },
  { raw: "levent", query: "LEVENT" },
  { raw: "sariyer", query: "SARIYER" },
  { raw: "cesme", query: "ÇEŞME" },
  { raw: "alacati", query: "ALACATI" },
  { raw: "izmir", query: "İZMİR" },
  { raw: "ankara", query: "ANKARA" },
  { raw: "bodrum", query: "BODRUM" },
  { raw: "antalya", query: "ANTALYA" },
] as const;

function extractDynamicBidTarget(input: string): DynamicBidTarget {
  let bestMatch: { id: string; code: string; score: number } | null = null;
  for (const asset of INITIAL_MARKET_ASSETS) {
    const code = normalizeTr(asset.code);
    const property = normalizeTr(asset.property);
    const propertyTokens = property.split(" ").filter((token) => token.length >= 4);

    let score = 0;
    if (input.includes(code)) score += 4;
    if (property && input.includes(property)) score += 3;
    score += propertyTokens.filter((token) => input.includes(token)).length;

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { id: asset.id, code: asset.code, score };
    }
  }

  if (bestMatch && bestMatch.score >= 3) {
    return {
      type: "asset",
      action: { label: `${bestMatch.code} detay`, to: `/borsa/varlik/${bestMatch.id}?intent=bid` },
      guidance: `${bestMatch.code} için detay ekranına geçip teklif panelinde ilerleyelim.`,
    };
  }

  const region = REGION_QUERY_HINTS.find((hint) => input.includes(normalizeTr(hint.raw)));
  if (!region) return null;
  return {
    type: "region",
    action: { label: `${region.query} varlıkları`, to: `/borsa/varliklar?q=${encodeURIComponent(region.query)}` },
    guidance: `${region.query} filtresiyle varlık listesini açıp uygun ilanı seçelim.`,
  };
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

  if (
    includesAny(input, [
      "su varliga nasil teklif veririm",
      "bu varliga nasil teklif",
      "varliga nasil teklif",
      "varligina nasil teklif veririm",
      "varliga teklif nasil verilir",
    ]) ||
    (input.includes("varlig") && input.includes("teklif") && input.includes("nasil"))
  ) {
    const dynamicTarget = extractDynamicBidTarget(input);
    const primaryAction =
      dynamicTarget?.action ??
      ({ label: "Varlık listesi", to: "/borsa/varliklar" } satisfies AssistantAction);
    const guidanceLine =
      dynamicTarget?.guidance ?? "Önce varlık listesinden doğru ilanı seçip sonra detay panelinden teklif verelim.";
    return actionReply(
      [
        "Varlık bazlı teklif adımı:",
        "1) Önce ilgili varlığın detay ekranını aç ve order book + süreyi kontrol et.",
        "2) Hedef teklifini spread ve likiditeye göre belirle; son saniye yerine kontrollü adımla ilerle.",
        `3) Blokaj/teminat ve sözleşme maddelerini doğrula (demo modelde blokaj hedefi ${toPercent(BID_BOND_RATE)}).`,
        `4) ${guidanceLine}`,
      ].join("\n"),
      [
        primaryAction,
        { label: "İzleme ve alarm", to: "/borsa/izleme" },
        { label: "Borsa terminali", to: "/borsa" },
      ],
      true,
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

  if (includesAny(input, ["kadikoyde firsat var mi", "kadikoy de firsat var mi", "kadikoy firsat", "kadikoyde ne var"])) {
    return actionReply(
      "Kadıköy fırsat taraması için borsa/piyasa ekranını Kadıköy filtresiyle açalım; hacim, değişim ve bitiş süresini birlikte yorumlayalım.",
      [
        { label: "Kadıköy filtreli piyasa", to: "/borsa?q=KADIKÖY" },
        { label: "İzleme listesine ekle", to: "/borsa/izleme" },
        { label: "Varlık karşılaştır", to: "/karsilastir" },
      ],
      true,
    );
  }

  if (includesAny(input, ["portfoyumu nasil satarim", "portfoy satmak", "portfoyden satis"])) {
    return actionReply(
      "Portföy satışı için önce portföy ekranından doğru aksiyonu seçelim: Borsaya Koy / Sabit Satış / Kiraya Ver / Takas / Devren.",
      [
        { label: "Portföy ekranı", to: "/borsa/portfoy" },
        { label: "Borsa satış stratejisi", to: "/borsa" },
        { label: "Satışa başla", to: "/sat-basla" },
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
