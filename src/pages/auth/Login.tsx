import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase";
import { translateAuthError } from "@/lib/authErrors";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured()) {
      setError(translateAuthError("Supabase yapılandırması yok (.env.local)."));
      return;
    }
    if (!email || !password) {
      setError("E-posta ve şifre gereklidir.");
      return;
    }
    setLoading(true);
    const { error: authErr } = await signIn(email.trim(), password);
    setLoading(false);

    if (authErr) {
      setError(translateAuthError(authErr.message ?? ""));
      return;
    }
    navigate("/dashboard");
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
                {isSupabaseConfigured() ? "Supabase Auth ile güvenli oturum." : "Supabase .env yok — giriş için yapılandırın."}
              </p>
            </div>
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="mt-2 text-right">
                  <Link to="/sifremi-unuttum" className="text-xs text-slate-500 hover:text-teal-400 transition-colors">
                    Şifremi unuttum
                  </Link>
                </div>
              </div>
              <Button
                type="submit"
                disabled={!isSupabaseConfigured() || loading}
                className="w-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-bold h-11 disabled:opacity-50"
              >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
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
