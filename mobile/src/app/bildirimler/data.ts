import type { NotificationItem } from "./types";

const now = Date.now();

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-1",
    title: "Yeni teklif güncellemesi",
    body: "Takip ettiğiniz ihale için yeni teklif oluştu.",
    type: "auction",
    read: false,
    createdAtIso: new Date(now - 20 * 60 * 1000).toISOString(),
  },
  {
    id: "n-2",
    title: "Belge hatırlatması",
    body: "Belge geçerlilik süreniz 7 gün içinde doluyor.",
    type: "reminder",
    read: false,
    createdAtIso: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "n-3",
    title: "Sistem duyurusu",
    body: "Planlı bakım pazar 02:00-03:00 arasında yapılacaktır.",
    type: "system",
    read: true,
    createdAtIso: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function fetchMockNotifications(forceError = false): Promise<NotificationItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 240));
  if (forceError) throw new Error("Mock error");
  return MOCK_NOTIFICATIONS;
}
