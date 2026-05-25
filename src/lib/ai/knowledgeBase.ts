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
      `Teklif akışı özet: 1) İlan/ihale seçimi, 2) Kimlik ve uygunluk doğrulama (KYC), 3) Teklif onayı, 4) Sonuç ve ödeme adımı.`,
      `Teminat modelinde teklif güvenliği için kart blokajı hedef oranı ${pct(BID_BOND_RATE)} olarak kullanılır (demo kuralı).`,
      `Komisyon çerçevesi satış tarafında ${pct(COMMISSION_RATE)} + alım tarafında ${pct(COMMISSION_RATE)} şeklindedir (KDV ve sözleşme hükümleri ayrıca değerlendirilir).`,
      "Escrow/emanet ödeme akışında tutar koşullar tamamlanana kadar güvenli süreçte tutulur; platform dışı ödeme önerilmez.",
      "Açık artırma ve standart ilan farkında fiyat keşfi, rekabet ve zaman penceresi dinamikleri belirleyicidir.",
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
    id: "gayrimenkul-uzmanlik",
    title: "Gayrimenkul Uzmanlık Başlıkları",
    keywords: [
      "emsal",
      "kaks",
      "gabari",
      "imar",
      "kat karsiligi",
      "kka",
      "tapu",
      "ipotek",
      "serh",
      "zemin",
      "deprem",
      "ruhsat",
      "parsel",
      "arsa",
      "tarla",
      "ges",
      "degerleme",
    ],
    summaryLines: [
      "Emsal (KAKS), gabari ve imar durumu bir arada yorumlanır; tek bir parametreyle karar verilmez.",
      "KKA senaryolarında hakediş, sözleşme ve yükümlülük paylaşımı resmi metinlerle netleştirilmelidir.",
      "Tapu, ipotek, şerh, ruhsat ve teknik raporlar (zemin/beton/deprem uygunluğu) işlem güvenliğinin temelidir.",
      "Arsa/tarla ve GES fizibilitesinde imar + bağlantı + maliyet + gelir varsayımları birlikte değerlendirilir.",
      "Değerleme yaklaşımında emsal karşılaştırma, bölgesel likidite ve maliyet bileşenleri birlikte okunur.",
    ],
    actions: [
      { label: "İmar Stüdyosu", to: "/imar-studyo" },
      { label: "Kat Karşılığı Modülü", to: "/kat-karsiligi" },
      { label: "Vergi Simülatörü", to: "/araclar/vergi-simulator" },
    ],
    expertWarning: true,
    sources: ["/imar-studyo", "/kat-karsiligi", "/degerleme", "/araclar/ges-analizi"],
  },
  {
    id: "site-haritasi",
    title: "Site Haritası ve Modül Rehberi",
    keywords: ["site haritasi", "hangi sayfa", "nereye gideyim", "modul", "rehber", "rota"],
    summaryLines: [
      "İlan keşfi için: /ilanlar",
      "Borsa ve canlı teklif için: /borsa ve /ihaleler",
      "Satış başlatmak için: /sat-basla",
      "Komisyon/maliyet için: /komisyon-hesaplayici",
      "Güvenlik ve uyum için: /guvenlik, /ihale-kosullari, /yasal/*",
    ],
    actions: [
      { label: "İlan kataloğu", to: "/ilanlar" },
      { label: "Satışa başla", to: "/sat-basla" },
      { label: "Güvenlik merkezi", to: "/guvenlik" },
    ],
    sources: ["/ilanlar", "/borsa", "/sat-basla", "/komisyon-hesaplayici", "/guvenlik"],
  },
];
