export type NotificationType = "system" | "auction" | "message" | "reminder";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  createdAtIso: string;
};
