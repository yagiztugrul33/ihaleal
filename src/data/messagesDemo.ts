/** Demo mesajlaşma — emlakçı / alıcı / satıcı rolleri (simülasyon). */

export type ChatRole = "emlakci" | "alici" | "satici" | "platform";

export type ChatParticipant = {
  id: string;
  role: ChatRole;
  displayName: string;
};

/** Demo: gönderim sonrası yerel uyum NLP çıktısı (üretimde sunucu kuyruğu). */
export type ChatMessageComplianceScan = {
  severity: "low" | "medium" | "high";
  flaggedKeywords: string[];
  modelScore: number;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  authorId: string;
  body: string;
  /** Ek dosya simülasyonu (ör. ekspertiz pdf adı) */
  attachmentName?: string;
  sentAt: string;
  /** Yerel demo: ComplianceNlpService skoru (işaretli kelime yoksa genelde düşük şiddet). */
  complianceScan?: ChatMessageComplianceScan;
  /** Mesajın kaynağı: Edge RPC zinciri veya yalnızca yerel demo. */
  remoteSource?: "edge" | "local";
};

export type ChatThread = {
  id: string;
  title: string;
  listingSnippet: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
};

export const DEMO_CHAT_THREADS: ChatThread[] = [
  {
    id: "t1",
    title: "Kadıköy · Site içi konut",
    listingSnippet: "İlan #14 — teklif süreci",
    participants: [
      { id: "p1", role: "emlakci", displayName: "Ayşe Y. (Ortak emlakçı)" },
      { id: "p2", role: "alici", displayName: "Siz (alıcı)" },
      { id: "p3", role: "satici", displayName: "Satıcı temsilcisi" },
    ],
    messages: [
      {
        id: "m1",
        threadId: "t1",
        authorId: "p1",
        body: "Merhaba, ihale öncesi tapu özeti ve güncel ekspertiz talebimizi ilettik. Platform üzerinden paylaşılıyor.",
        sentAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "m2",
        threadId: "t1",
        authorId: "p3",
        body: "Ekspertiz tarihi bu hafta; rapor gelince sisteme yükleyeceğiz.",
        sentAt: new Date(Date.now() - 7000000).toISOString(),
      },
      {
        id: "m3",
        threadId: "t1",
        authorId: "p2",
        body: "Finansman tarafını netleştirdim; kapalı teklif üst limitimi güncelledim.",
        sentAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "m4",
        threadId: "t1",
        authorId: "p1",
        body: "Örnek ekspertiz özeti ektedir (demo dosya adı).",
        attachmentName: "ekspertiz-ozet-demo.pdf",
        sentAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
  },
  {
    id: "t2",
    title: "Çankaya · Ofis",
    listingSnippet: "İlan #21 — görüşme",
    participants: [
      { id: "p4", role: "emlakci", displayName: "Mehmet K." },
      { id: "p2", role: "alici", displayName: "Siz (alıcı)" },
    ],
    messages: [
      {
        id: "m5",
        threadId: "t2",
        authorId: "p4",
        body: "Yarın saat 15:00 için platform görüşmesi oluşturabilirsiniz.",
        sentAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "m6",
        threadId: "t2",
        authorId: "p2",
        body: "Uygunum, KYC evraklarımda eksik var mı kontrol eder misiniz?",
        sentAt: new Date(Date.now() - 85000000).toISOString(),
      },
    ],
  },
];

export function getParticipant(threads: ChatThread[], authorId: string): ChatParticipant | undefined {
  for (const t of threads) {
    const p = t.participants.find((x) => x.id === authorId);
    if (p) return p;
  }
  return undefined;
}
