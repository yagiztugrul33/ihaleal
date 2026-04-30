/** Pratik e-posta kontrolü (tam RFC yerine UI doğrulaması). */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(value: string): boolean {
  const s = value.trim();
  return s.length >= 5 && EMAIL_REGEX.test(s);
}
