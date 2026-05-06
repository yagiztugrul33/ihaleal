const CHAT_MAX = 8000;

/** Plain text for chat: trim, strip ASCII controls, max length. */
export function sanitizeChatPlainText(input: string): string {
  const s = String(input ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  if (!s) return "";
  return s.length > CHAT_MAX ? s.slice(0, CHAT_MAX) : s;
}