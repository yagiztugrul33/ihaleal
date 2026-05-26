const CSRF_COOKIE_NAME = "ihaleal_csrf";
const CSRF_STORAGE_KEY = "ihaleal_csrf_token";
const CSRF_BYTES = 24;

function randomToken(): string {
  const bytes = new Uint8Array(CSRF_BYTES);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const found = document.cookie
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(prefix));
  if (!found) return null;
  return decodeURIComponent(found.slice(prefix.length));
}

function writeCookie(name: string, value: string): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Strict${secure}`;
}

export function ensureCsrfToken(): string {
  const existingCookie = readCookie(CSRF_COOKIE_NAME);
  const existingStorage = sessionStorage.getItem(CSRF_STORAGE_KEY);
  if (existingCookie && existingStorage && existingCookie === existingStorage) {
    return existingCookie;
  }
  const token = randomToken();
  writeCookie(CSRF_COOKIE_NAME, token);
  sessionStorage.setItem(CSRF_STORAGE_KEY, token);
  return token;
}

export function getCsrfToken(): string {
  return ensureCsrfToken();
}

export function verifyCsrfToken(candidate: string): boolean {
  if (!candidate) return false;
  const cookie = readCookie(CSRF_COOKIE_NAME);
  const stored = sessionStorage.getItem(CSRF_STORAGE_KEY);
  return Boolean(cookie && stored && candidate === cookie && candidate === stored);
}

