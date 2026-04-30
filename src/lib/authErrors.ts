export function translateAuthError(error: string | null | undefined): string {
  if (!error) return "Bilinmeyen bir hata oluştu";

  const map: Record<string, string> = {
    "Invalid login credentials": "E-posta veya şifre hatalı",
    "Email not confirmed": "E-posta adresiniz onaylanmamış. Lütfen e-postanızı kontrol edin",
    "User already registered": "Bu e-posta ile zaten kayıtlı bir hesap var",
    "Password should be at least": "Şifre en az 8 karakter olmalı",
    "Invalid email": "Geçersiz e-posta adresi",
    "Email rate limit exceeded": "Çok fazla deneme yaptınız, lütfen biraz bekleyin",
    "User not found": "Bu e-posta ile kayıtlı kullanıcı bulunamadı",
    "Token has expired": "Oturum süresi dolmuş, lütfen tekrar giriş yapın",
    "Network request failed": "İnternet bağlantınızı kontrol edin",
    "Database error": "Veritabanı hatası, lütfen tekrar deneyin",
    weak_password: "Şifreniz çok zayıf, daha güçlü bir şifre seçin",
    same_password: "Yeni şifre eskisiyle aynı olamaz",
    signup_disabled: "Kayıt şu anda devre dışı",
    captcha_failed: "Doğrulama başarısız, lütfen tekrar deneyin",
    over_email_send_rate_limit: "Çok fazla e-posta gönderildi, biraz bekleyin",
    anonymous_provider_disabled: "Anonim giriş devre dışı",
    phone_provider_disabled: "Telefon ile giriş devre dışı",
    email_provider_disabled: "E-posta ile giriş devre dışı",
    validation_failed: "Bilgiler doğrulanamadı",
    session_not_found: "Oturum bulunamadı",
    user_banned: "Hesabınız askıya alınmış",
    "Failed to fetch": "Bağlantı kurulamadı, internetinizi kontrol edin",
  };

  for (const [key, value] of Object.entries(map)) {
    if (error.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return error;
}
