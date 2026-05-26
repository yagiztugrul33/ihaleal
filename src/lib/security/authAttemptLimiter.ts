type AuthAction = "signin" | "signup";

type AttemptBucket = {
  count: number;
  firstAt: number;
  blockedUntil: number;
};

const STORAGE_KEY = "ihaleal_auth_attempts_v1";
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const BLOCK_MS = 15 * 60 * 1000;

function now(): number {
  return Date.now();
}

function readAll(): Record<string, AttemptBucket> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, AttemptBucket>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, AttemptBucket>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function keyOf(action: AuthAction, identity: string): string {
  return `${action}:${identity.trim().toLowerCase()}`;
}

export function getAuthBlockRemainingMs(action: AuthAction, identity: string): number {
  const all = readAll();
  const row = all[keyOf(action, identity)];
  if (!row) return 0;
  return Math.max(0, row.blockedUntil - now());
}

export function markAuthAttempt(action: AuthAction, identity: string, success: boolean): void {
  const key = keyOf(action, identity);
  const all = readAll();
  const t = now();
  const prev = all[key];

  if (success) {
    delete all[key];
    writeAll(all);
    return;
  }

  if (!prev || t - prev.firstAt > WINDOW_MS) {
    all[key] = { count: 1, firstAt: t, blockedUntil: 0 };
    writeAll(all);
    return;
  }

  const next = { ...prev, count: prev.count + 1 };
  if (next.count >= MAX_ATTEMPTS) {
    next.blockedUntil = t + BLOCK_MS;
  }
  all[key] = next;
  writeAll(all);
}

