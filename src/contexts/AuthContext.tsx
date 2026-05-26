import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";

function configAuthError(message: string): AuthError {
  return { name: "AuthError", message, status: 400 } as AuthError;
}
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { dispatchAuthChanged } from "@/lib/auth";
import { persistSupabaseUser } from "@/lib/supabaseAuthBridge";
import { validateStrongPassword, sanitizeEmail, sanitizePhone, sanitizeText } from "@/lib/security/inputGuards";
import { getAuthBlockRemainingMs, markAuthAttempt } from "@/lib/security/authAttemptLimiter";
import { runSecurityGuard } from "@/lib/security/securityGuardClient";

export type SignUpExtra = { phone?: string };

const AUTH_MIN_ATTEMPT_INTERVAL_MS = 1500;
const authAttemptLastSeen = new Map<string, number>();

function authAttemptKey(action: "signin" | "signup", email: string): string {
  return `${action}:${email.trim().toLowerCase()}`;
}

function isAuthAttemptThrottled(action: "signin" | "signup", email: string): boolean {
  const key = authAttemptKey(action, email);
  const now = Date.now();
  const prev = authAttemptLastSeen.get(key) ?? 0;
  authAttemptLastSeen.set(key, now);
  return now - prev < AUTH_MIN_ATTEMPT_INTERVAL_MS;
}

/** `profiles.role` / `is_admin` — admin panel ve Navbar için (Supabase SELECT). */
export type AuthProfile = {
  role: string | null;
  isAdmin: boolean;
};

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Oturum kullanıcısı için `profiles` satırı özeti; Supabase yok veya çıkışta `null`. */
  profile: AuthProfile | null;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    extra?: SignUpExtra
  ) => Promise<{ error: AuthError | null; session: Session | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    void supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) persistSupabaseUser(s.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) persistSupabaseUser(s.user);
      else if (event === "SIGNED_OUT") {
        localStorage.removeItem("ihaleal_user");
        dispatchAuthChanged();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    void supabase
      .from("profiles")
      .select("role,is_admin")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setProfile({ role: null, isAdmin: false });
        } else {
          setProfile({
            role: data?.role ?? null,
            isAdmin: Boolean(data?.is_admin),
          });
        }
        setProfileLoading(false);
      });
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: configAuthError("Supabase yapılandırması eksik (.env.local).") };
    }
    const safeEmail = sanitizeEmail(email);
    if (isAuthAttemptThrottled("signin", safeEmail)) {
      return { error: configAuthError("Çok sık giriş denemesi. Lütfen kısa bir süre bekleyin.") };
    }
    const blockedMs = getAuthBlockRemainingMs("signin", safeEmail);
    if (blockedMs > 0) {
      return { error: configAuthError(`Çok fazla deneme algılandı. ${Math.ceil(blockedMs / 1000)} saniye sonra tekrar deneyin.`) };
    }
    const guard = await runSecurityGuard("login", safeEmail);
    if (!guard.ok) {
      return { error: configAuthError(`Giriş denemesi geçici olarak sınırlandı. ${guard.retryAfterSec ?? 60} saniye bekleyin.`) };
    }

    const { error } = await supabase.auth.signInWithPassword({ email: safeEmail, password });
    markAuthAttempt("signin", safeEmail, !error);
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, extra?: SignUpExtra) => {
    if (!isSupabaseConfigured()) {
      return { error: configAuthError("Supabase yapılandırması eksik (.env.local).") };
    }
    const safeEmail = sanitizeEmail(email);
    const safeName = sanitizeText(fullName, 80);
    const safePhone = extra?.phone ? sanitizePhone(extra.phone) : undefined;
    if (isAuthAttemptThrottled("signup", safeEmail)) {
      return { error: configAuthError("Çok sık kayıt denemesi. Lütfen kısa bir süre bekleyin."), session: null };
    }
    const blockedMs = getAuthBlockRemainingMs("signup", safeEmail);
    if (blockedMs > 0) {
      return { error: configAuthError(`Çok fazla kayıt denemesi algılandı. ${Math.ceil(blockedMs / 1000)} saniye sonra tekrar deneyin.`), session: null };
    }
    const pwPolicy = validateStrongPassword(password);
    if (!pwPolicy.ok) {
      return { error: configAuthError(pwPolicy.error ?? "Şifre politikası sağlanamadı."), session: null };
    }

    const guard = await runSecurityGuard("login", safeEmail);
    if (!guard.ok) {
      return { error: configAuthError(`Kayıt denemesi geçici olarak sınırlandı. ${guard.retryAfterSec ?? 60} saniye bekleyin.`), session: null };
    }

    const meta: Record<string, unknown> = { full_name: safeName };
    if (safePhone?.trim()) meta.phone = safePhone.trim();
    const { data, error } = await supabase.auth.signUp({
      email: safeEmail,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: meta,
      },
    });
    markAuthAttempt("signup", safeEmail, !error);
    if (!error && data.session?.user) persistSupabaseUser(data.session.user);
    return { error, session: data.session ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("ihaleal_user");
    setSession(null);
    setUser(null);
    dispatchAuthChanged();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, profile, profileLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function authIsAdmin(profile: AuthProfile | null | undefined): boolean {
  if (!profile) return false;
  return profile.isAdmin || profile.role === "admin";
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
