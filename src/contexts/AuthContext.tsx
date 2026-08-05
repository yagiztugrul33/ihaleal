import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";

function configAuthError(message: string): AuthError {
  return { name: "AuthError", message, status: 400 } as AuthError;
}
import { isSupabaseConfigured } from "@/lib/supabaseEnv";
import { getSupabase } from "@/lib/supabaseLazy";
import { dispatchAuthChanged } from "@/lib/auth";
import { persistSupabaseUser } from "@/lib/supabaseAuthBridge";

export type SignUpExtra = { phone?: string };

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

    // SDK tembel yuklenir (getSupabase). Sira KORUNUR: once onAuthStateChange
    // aboneligi kurulur, sonra getSession okunur — boylece istemci olusturulurken
    // islenen PKCE geri donusu (detectSessionInUrl) kacirilmaz.
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    void (async () => {
      const supabase = await getSupabase();
      if (cancelled) return;

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
      unsubscribe = () => subscription.unsubscribe();
      if (cancelled) {
        unsubscribe();
        unsubscribe = null;
        return;
      }

      const {
        data: { session: s },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) persistSupabaseUser(s.user);
      setLoading(false);
    })().catch((err) => {
      // SDK chunk'i inemezse (offline / cache hatasi) uygulama "yukleniyor"da
      // asili kalmasin — oturumsuz devam et.
      if (cancelled) return;
      console.warn("[auth] Supabase istemcisi yüklenemedi", err);
      setSession(null);
      setUser(null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    let cancelled = false;
    void (async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("profiles")
        .select("role,is_admin")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setProfile({ role: null, isAdmin: false });
      } else {
        setProfile({
          role: data?.role ?? null,
          isAdmin: Boolean(data?.is_admin),
        });
      }
      setProfileLoading(false);
    })().catch(() => {
      if (cancelled) return;
      setProfile({ role: null, isAdmin: false });
      setProfileLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: configAuthError("Supabase yapılandırması eksik (.env.local).") };
    }
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, extra?: SignUpExtra) => {
    if (!isSupabaseConfigured()) {
      return { error: configAuthError("Supabase yapılandırması eksik (.env.local).") };
    }
    const meta: Record<string, unknown> = { full_name: fullName.trim() };
    if (extra?.phone?.trim()) meta.phone = extra.phone.trim();
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: meta,
      },
    });
    if (!error && data.session?.user) persistSupabaseUser(data.session.user);
    return { error, session: data.session ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      await supabase.auth.signOut();
    }
    localStorage.removeItem("ihaleal_user");
    setSession(null);
    setUser(null);
    dispatchAuthChanged();
  }, []);

  return (
    <AuthContext.Provider
      // signUp return type union narrow — TS sağlık sprint 3'te düzeltilecek
      value={{ user, session, loading, profile, profileLoading, signIn, signUp, signOut } as unknown as React.ContextType<typeof AuthContext>}
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
