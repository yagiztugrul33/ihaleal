import type { NotificationType } from "./types";

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function notificationBadgeLabel(type: NotificationType): string {
  if (type === "auction") return "İhale";
  if (type === "message") return "Mesaj";
  if (type === "reminder") return "Hatırlatma";
  return "Sistem";
}
