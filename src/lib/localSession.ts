import type { SessionUser } from "@/lib/auth";
import { dispatchAuthChanged } from "@/lib/auth";
import { localAuthEnabled } from "@/lib/runtimeFlags";

const SESSION_KEY = "ihaleal_user";

export function readLocalSessionUser(): SessionUser | null {
  if (!localAuthEnabled) return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionUser;
    if (parsed?.authBackend && parsed.authBackend !== "local") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function persistLocalSessionUser(session: SessionUser): void {
  if (!localAuthEnabled) {
    console.warn("[ihaleal] Yerel oturum uretimde devre disi.");
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, authBackend: "local" }));
  dispatchAuthChanged();
}

export function clearLocalSessionUser(): void {
  localStorage.removeItem(SESSION_KEY);
  dispatchAuthChanged();
}