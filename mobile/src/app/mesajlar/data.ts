// MOCK DATA — sentetik, gerçek değil
import type { ConversationItem } from "./types";

const now = Date.now();

export const MOCK_CONVERSATIONS: ConversationItem[] = [
  {
    id: "c-1",
    participant: "Emlak Danışmanı - TEST KULLANICI 1",
    lastMessage: "Ekspertiz raporunu bugün paylaşacağım.",
    unreadCount: 2,
    updatedAtIso: new Date(now - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "c-2",
    participant: "Destek Ekibi",
    lastMessage: "Talebiniz inceleniyor.",
    unreadCount: 0,
    updatedAtIso: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "c-3",
    participant: "Portföy Sahibi - TEST KULLANICI 2",
    lastMessage: "Yarın için uygun saatlerinizi iletebilir misiniz?",
    unreadCount: 1,
    updatedAtIso: new Date(now - 27 * 60 * 60 * 1000).toISOString(),
  },
];

export async function fetchMockConversations(forceError = false): Promise<ConversationItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  if (forceError) throw new Error("Mock error");
  return MOCK_CONVERSATIONS;
}
