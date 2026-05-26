const TAG_TOKENS = /[<>]/g;
const MULTI_SPACE = /\s+/g;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function stripControlChars(value: string): string {
  let out = "";
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if ((code >= 0 && code < 32) || code === 127) continue;
    out += ch;
  }
  return out;
}

export function sanitizeText(value: string, maxLen = 256): string {
  return stripControlChars(value)
    .replace(/\r?\n/g, " ")
    .replace(/\t/g, " ")
    .trim()
    .slice(0, maxLen + 8)
    .replace(TAG_TOKENS, "")
    .replace(MULTI_SPACE, " ")
    .trim()
    .slice(0, maxLen);
}

export function sanitizeEmail(value: string): string {
  const cleaned = sanitizeText(value.toLowerCase(), 254);
  return EMAIL_RE.test(cleaned) ? cleaned : cleaned.replace(/[^\w.+@-]/g, "");
}

export function sanitizePhone(value: string): string {
  return value.replace(/[^\d+\s()-]/g, "").trim().slice(0, 32);
}

export type PasswordPolicyResult = {
  ok: boolean;
  error?: string;
};

export function validateStrongPassword(password: string): PasswordPolicyResult {
  if (password.length < 10) {
    return { ok: false, error: "Şifre en az 10 karakter olmalıdır." };
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return { ok: false, error: "Şifre küçük ve büyük harf içermelidir." };
  }
  if (!/\d/.test(password)) {
    return { ok: false, error: "Şifre en az bir rakam içermelidir." };
  }
  if (!/[^\w\s]/.test(password)) {
    return { ok: false, error: "Şifre en az bir özel karakter içermelidir." };
  }
  return { ok: true };
}

