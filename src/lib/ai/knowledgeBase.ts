import { BID_BOND_RATE, COMMISSION_RATE } from "@/lib/fees";

export type AssistantAction = {
  label: string;
  to: string;
};

export type KnowledgeTopic = {
  id: string;
  title: string;
  keywords: string[];
  summaryLines: string[];
  actions: AssistantAction[];
  expertWarning?: boolean;
  sources: string[];
};

export const LIVE_AI_NOTE =
  "Canlıda gerçek AI (Claude/GPT API) entegrasyonu ile dinamik cevap üretilecek; mevcut sürüm kural tabanlı demodur.";
export const LIVE_AI_LEVEL2_NOTE =
  "Seviye 2 notu: Bu bilgi bankası canlıda AI API + kurumsal veri katmanına beslenecek şekilde yapılandırıldı.";

export const DEMO_WARNING =
  "Demo notu: Bu cevap kural tabanlı bilgi bankasından üretilir, bağlayıcı nihai görüş değildir.";

export const EXPERT_WARNING =
  "Uyarı: Hukuki/vergisel/teknik kesinlik için avukat, mali müşavir ve lisanslı uzman görüşü şarttır.";

const pct = (v: number) => `%${Math.round(v * 100)}`;

export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  {
    id: "borsa-aksi",
    title: "Borsa ve İşlem Akışı",
    keywords: [
      "borsa",
      "teklif",
      "blokaj",
      "escrow",
      "cayma",
      "yedek alici",
      "kyc",
      "hemen al",
      "acik artirma",
      "standart ilan",
    ],
    summaryLines: [
      "Teklif akışı: varlık seçimi → KYC uygunluğu → teklif teyidi → sonuç ekranı → sözleşme/ödeme adımı.",
      `Teminat/blokaj hedef oranı demo modelde ${pct(BID_BOND_RATE)} olarak hesaplanır.`,
      `Komisyon çerçevesi satış ${pct(COMMISSION_RATE)} + alım ${pct(COMMISSION_RATE)} modelidir (KDV ve sözleşme maddeleri ayrıca değerlendirilir).`,
      "Escrow akışı, koşullar tamamlanana kadar fonu kontrollü süreçte tutar; platform dışı ödeme önerilmez.",
      "Açık artırma fiyat keşfi ve süre dinamiği taşır; sabit satışta fiyat sabitlenir, hız ve netlik öne çıkar.",
    ],
    actions: [
      { label: "Borsa ekranına git", to: "/borsa" },
      { label: "Canlı ihaleleri gör", to: "/ihaleler" },
      { label: "İhale koşullarını incele", to: "/ihale-kosullari" },
    ],
    expertWarning: true,
    sources: ["/borsa", "/ihale-kosullari", "/evraklar", "/guvenlik"],
  },
  {
    id: "order-book-strateji",
    title: "Emir Defteri, Alış-Satış Aralığı (Spread), Likidite, Volatilite",
    keywords: [
      "order book",
      "emir defteri",
      "spread",
      "likidite",
      "volatilite",
      "derinlik",
      "teklif stratejisi",
      "outbid",
      "soft close",
      "proxy bid",
    ],
    summaryLines: [
      "Emir defteri okumada alış/satış kademesi, lot ve kümülatif derinlik birlikte yorumlanır; tek satıra bakarak karar verilmez.",
      "Alış-satış aralığı (spread) dar ise likidite daha güçlüdür; spread açıldıkça fiyat kayması ve maliyet riski artar.",
      "Volatilite yükseldiğinde teklif adımı ve tavan teklif (proxy bid) disiplinli belirlenmelidir.",
      "Outbid sinyali geldiğinde kör yükseltme yerine süre, spread ve kalan rakip kademesini kontrol ederek aksiyon alınır.",
      "Soft close (anti-sniping) senaryolarında bitişe yakın teklifler süreyi uzatabilir; son saniye stratejisi tek başına yeterli değildir.",
    ],
    actions: [
      { label: "Varlık listesi/order book", to: "/borsa/varliklar" },
      { label: "İzleme ve alarmlar", to: "/borsa/izleme" },
      { label: "Veri/analiz ekranı", to: "/borsa/veri" },
    ],
    expertWarning: true,
    sources: ["/borsa", "/borsa/varliklar", "/borsa/izleme", "/borsa/veri"],
  },
  {
    id: "teknik-hukuki-istatistik",
    title: "Teknik + Hukuki + İstatistik Uzmanlık",
    keywords: [
      "emsal",
      "kaks",
      "gabari",
      "imar",
      "tapu",
      "ipotek",
      "serh",
      "zemin",
      "beton",
      "deprem",
      "endeks",
      "trend",
      "hacim",
      "istatistik",
      "degerleme",
    ],
    summaryLines: [
      "Hukuki tarafta tapu, ipotek, şerh, takyidat ve imar belgesi birlikte okunur; tek belgeyle karar verilmez.",
      "Teknik tarafta zemin etüdü, beton sınıfı, deprem yönetmeliği uyumu ve ruhsat geçmişi kritik kontrol noktalarıdır.",
      "İstatistik tarafta endeks yönü, hacim artışı ve trend kalitesi birlikte değerlendirilir; anlık sıçrama yanıltıcı olabilir.",
      "Emsal/KAKS/gabari verileri proje potansiyelini etkiler; hukuki uygunluk ve teknik uygulanabilirlik ile çapraz kontrol gerekir.",
      "Değerleme yorumu her zaman senaryo bazlı yapılır: baz, iyimser, temkinli.",
    ],
    actions: [
      { label: "Veri ve endeks", to: "/borsa/veri" },
      { label: "İmar sorgu modülü", to: "/modul/imar-sorgu" },
      { label: "Güvenlik ve yasal", to: "/guvenlik" },
    ],
    expertWarning: true,
    sources: ["/borsa/veri", "/modul/imar-sorgu", "/degerleme", "/guvenlik"],
  },
  {
    id: "site-haritasi",
    title: "Site Haritası ve Modül Rehberi",
    keywords: ["site haritasi", "hangi sayfa", "nereye gideyim", "modul", "rehber", "rota"],
    summaryLines: [
      "İlan keşfi için: /ilanlar",
      "Borsa ve canlı teklif için: /borsa, /borsa/izleme, /borsa/veri ve /ihaleler",
      "Satış başlatmak için: /sat-basla",
      "Komisyon/maliyet için: /komisyon-hesaplayici",
      "Güvenlik ve uyum için: /guvenlik, /ihale-kosullari, /yasal/*",
    ],
    actions: [
      { label: "İlan kataloğu", to: "/ilanlar" },
      { label: "Satışa başla", to: "/sat-basla" },
      { label: "Borsa izleme", to: "/borsa/izleme" },
      { label: "Borsa veri/analiz", to: "/borsa/veri" },
      { label: "Güvenlik merkezi", to: "/guvenlik" },
    ],
    sources: ["/ilanlar", "/borsa", "/borsa/izleme", "/borsa/veri", "/sat-basla", "/komisyon-hesaplayici", "/guvenlik"],
  },
];
