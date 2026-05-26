const envBase = process.env.EXPO_PUBLIC_WEB_BASE_URL ?? "https://ihaleal.com";

export const WEB_BASE_URL = envBase.replace(/\/+$/, "");

const baseHost = new URL(WEB_BASE_URL).hostname.toLowerCase();
const altHost = baseHost.startsWith("www.") ? baseHost.slice(4) : `www.${baseHost}`;
const ALLOWED_HOSTS = new Set([baseHost, altHost]);

const BLOCKED_PATH_PREFIXES = [
  "/giris",
  "/kayit",
  "/sifremi-unuttum",
  "/ihale",
  "/ihaleler",
  "/borsa",
  "/teklif-al",
  "/kapali-teklif",
  "/sat-basla",
  "/ihale-ac",
  "/aninda-teklif",
  "/kyc",
  "/takas",
];

export function toAbsoluteWebUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${WEB_BASE_URL}${normalized}`;
}

export function getPathnameFromUrl(url: string): string | null {
  try {
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

export function isAllowedWebUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol.startsWith("http") && ALLOWED_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function isBlockedInWebView(pathname: string): boolean {
  return BLOCKED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function mapBlockedPathToNative(pathname: string): string | null {
  if (pathname === "/giris") return "/login";
  if (pathname === "/kayit") return "/register";
  if (pathname === "/sifremi-unuttum") return "/reset-password";
  return null;
}
