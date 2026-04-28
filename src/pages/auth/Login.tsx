import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  verifyPassword,
  migrateUserPasswordIfNeeded,
  stripForSession,
  dispatchAuthChanged,
  createPasswordRecord,
  type StoredUser,
} from "@/lib/auth";
import { readUserFlowsFromStorage } from "@/lib/userFlows";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatSupabaseAuthError } from "@/lib/supabaseAuthBridge";
import { useAuth } from "@/contexts/AuthContext";

const DEMO_LOCAL_EMAIL = "demo@ihaleal.local";
const DEMO_LOCAL_PASSWORD = "Demo1234!";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigateAfterLogin = () => {
    const flows = readUserFlowsFromStorage();
    const next = flows.length ? "/dashboard" : "/onboarding/akis";
    navigate(next);
  };

  const loginWithLocalStorage = async (loginEmail: string, loginPassword: string) => {
    const users = JSON.parse(localStorage.getItem("ihaleal_users") || "[]") as StoredUser[];
    const idx = users.findIndex((u) => u.email === loginEmail);
    if (idx < 0) {
      setError("Geçersiz e-posta veya şifre.");
      return;
    }
    const raw = users[idx];
    const ok = await verifyPassword(raw, loginPassword);
    if (!ok) {
      setError("Geçersiz e-posta veya şifre.");
      return;
    }
    const migrated = await migrateUserPasswordIfNeeded(raw, loginPassword);
    users[idx] = migrated;
    localStorage.setItem("ihaleal_users", JSON.stringify(users));
    localStorage.setItem("ihaleal_user", JSON.stringify(stripForSession(migrated)));
    dispatchAuthChanged();
    setSuccess(true);
    setTimeout(() => navigateAfterLogin(), 600);
  };

  const ensureDemoLocalUser = async () => {
    const users = JSON.parse(localStorage.getItem("ihaleal_users") || "[]") as StoredUser[];
    if (users.some((u) => u.email === DEMO_LOCAL_EMAIL)) return;
    const { passwordSalt, passwordHash } = await createPasswordRecord(DEMO_LOCAL_PASSWORD);
    users.push({
      id: `demo-${Date.now()}`,
      name: "Yerel Demo",
      email: DEMO_LOCAL_EMAIL,
      phone: "5550000000",
      passwordSalt,
      passwordHash,
      avatar: "",
      verified: false,
      rating: 0,
      auctionsCreated: 0,
      auctionsWon: 0,
      memberSince: new Date().toISOString().split("T")[0],
    });
    localStorage.setItem("ihaleal_users", JSON.stringify(users));
  };

  const handleDemoLocal = async () => {
    setError("");
    setSuccess(false);
    await ensureDemoLocalUser();
    setEmail(DEMO_LOCAL_EMAIL);
    setPassword(DEMO_LOCAL_PASSWORD);
    await loginWithLocalStorage(DEMO_LOCAL_EMAIL, DEMO_LOCAL_PASSWORD);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("E-posta ve şifre gereklidir.");
      return;
    }
    if (!isSupabaseConfigured()) {
      setError("Supabase yapılandırması yok (.env.local). Yerel demo için aşağıdaki düğmeyi kullanın.");
      return;
    }
    const { error: authErr } = await signIn(email.trim(), password);
    if (authErr) {
      setError(formatSupabaseAuthError(authErr.message));
      return;
    }
    setSuccess(true);
    setTimeout(() => navigateAfterLogin(), 600);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center" data-demo="true">
      <div className="w-full max-w-md px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>
        <Card className="bg-slate-900/50 border-white/5">
          <CardContent className="p-6 space-y-5">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Giriş Yap</h1>
              <p className="text-sm text-slate-400 mt-1">
                {isSupabaseConfigured() ? "Supabase Auth ile güvenli oturum." : "Supabase .env yok — yalnızca yerel demo kullanılabilir."}
              </p>
            </div>
            {success && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Giriş başarılı! Yönlendiriliyor...</span>
              </div>
            )}
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-950 border-white/10 text-white placeholder:text-slate-600"
                    placeholder="ornek@mail.com"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-950 border-white/10 text-white placeholder:text-slate-600"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={!isSupabaseConfigured()}
                className="w-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-bold h-11 disabled:opacity-50"
              >
                Giriş Yap
              </Button>
            </form>
            <Button type="button" variant="outline" className="w-full border-white/15 text-slate-200 hover:bg-white/5" onClick={() => void handleDemoLocal()}>
              Yerel demo hesabı dene
            </Button>
            <p className="text-[11px] text-slate-500 text-center">Yerel demo: tarayıcıda sahte kullanıcı; üretim oturumu değildir.</p>
            <div className="text-center text-sm text-slate-400">
              Hesabınız yok mu?{" "}
              <button type="button" onClick={() => navigate("/kayit")} className="text-blue-400 hover:text-blue-300 font-medium">
                Kayıt Ol
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
