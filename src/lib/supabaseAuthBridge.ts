import type { User } from "@supabase/supabase-js";
import type { SessionUser } from "@/lib/auth";
import { dispatchAuthChanged } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabaseEnv";

export function isSupabaseAuthAvailable(): boolean {
  return isSupabaseConfigured();
}

export function sessionUserFromSupabaseUser(user: User): SessionUser {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fullName = typeof meta?.full_name === "string" ? meta.full_name.trim() : "";
  const nameRaw =
    fullName || (typeof meta?.name === "string" ? meta.name.trim() : "");
  const name = nameRaw || (user.email?.split("@")[0] ?? "Kullanıcı");
  const phone = typeof meta?.phone === "string" ? meta.phone.trim() : "";
  const avatar = typeof meta?.avatar_url === "string" ? meta.avatar_url : "";
  const created = user.created_at?.split("T")[0] ?? new Date().toISOString().split("T")[0];
  return {
    id: user.id,
    name,
    email: user.email ?? "",
    phone,
    avatar,
    verified: Boolean(user.email_confirmed_at),
    rating: 0,
    auctionsCreated: 0,
    auctionsWon: 0,
    memberSince: created,
    authBackend: "supabase",
  };
}

export function persistSupabaseUser(user: User): void {
  const session = sessionUserFromSupabaseUser(user);
  localStorage.setItem("ihaleal_user", JSON.stringify(session));
  dispatchAuthChanged();
}

export function formatSupabaseAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Geçersiz e-posta veya şifre.";
  if (m.includes("email not confirmed") || m.includes("email_not_confirmed"))
    return "E-posta onayı gerekli; gelen kutundaki doğrulama bağlantısına tıklayın.";
  if (m.includes("user already registered")) return "Bu e-posta adresi zaten kayıtlı.";
  if (m.includes("password")) return "Şifre kurallarına uymuyor veya çok zayıf.";
  if (m.includes("failed to fetch") || m.includes("networkerror") || m.includes("load failed"))
    return "Ağ hatası; internet bağlantını kontrol et veya bir süre sonra tekrar dene.";
  if (m.includes("supabase yapılandırması")) return message;
  return message || "Bir hata oluştu.";
}
