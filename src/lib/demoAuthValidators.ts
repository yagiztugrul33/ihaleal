/** Demo kayıt / giriş — üretimde backend + KVKK akışı (§D-K3). */

export function validateDemoPassword(plain: string): string | null {
  if (plain.length < 10) return "Şifre en az 10 karakter olmalıdır.";
  if (!/[a-z]/.test(plain)) return "En az bir küçük harf (a-z).";
  if (!/[A-Z]/.test(plain)) return "En az bir büyük harf (A-Z).";
  if (!/[0-9]/.test(plain)) return "En az bir rakam.";
  if (!/[^A-Za-z0-9]/.test(plain)) return "En az bir sembol.";
  return null;
}

/** 5XXXXXXXXX veya +90 5XX… veya 05XX… */
export function isValidTRPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  const n = digits.startsWith("90") && digits.length >= 12 ? digits.slice(2) : digits.startsWith("0") ? digits.slice(1) : digits;
  return /^5[0-9]{9}$/.test(n);
}
