/** UI doğrulama yardımcıları. Canonical kaynak: `@/lib/security/inputGuards`. */
import { EMAIL_REGEX } from "@/lib/security/inputGuards";

export { EMAIL_REGEX };
export const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(value: string): boolean {
  const s = value.trim();
  return s.length >= 5 && EMAIL_REGEX.test(s);
}
