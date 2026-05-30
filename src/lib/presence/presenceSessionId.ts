const STORAGE_KEY = "ihaleal_presence_id";

export function getPresenceSessionId(userId?: string | null): string {
  if (userId) return `user_${userId}`;
  if (typeof sessionStorage === "undefined") return `anon_${Date.now()}`;
  try {
    let id = sessionStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = `anon_${crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`}`;
      sessionStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `anon_${Date.now()}`;
  }
}
