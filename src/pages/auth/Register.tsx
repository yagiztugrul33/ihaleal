import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserPlus, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, User, Phone, Building2, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase";
import { translateAuthError } from "@/lib/authErrors";
import { useAuth } from "@/contexts/AuthContext";
import { parseKurumsalProfil, postLoginPathForProfil } from "@/lib/authProfile";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const kurumsalProfil = parseKurumsalProfil(searchParams);
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!isSupabaseConfigured()) {
      setError("Kayıt için Supabase ortam değişkenleri gerekir (.env.local; demo).");
      return;
    }
    if (!name.trim() || !email.trim() || !password) {
      setError("Ad soyad, e-posta ve şifre zorunludur.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (!kvkkAccepted) {
      setError("Devam etmek için KVKK ve gizlilik metnini onaylayın.");
      return;
    }
    setLoading(true);
    const { error: supaErr, session } = await signUp(email.trim(), password, name.trim(), {
      phone: phone.trim() || undefined,
    });
    setLoading(false);

    if (supaErr) {
      setError(translateAuthError(supaErr.message ?? ""));
      return;
    }
    if (session?.user) {
      navigate(postLoginPathForProfil(kurumsalProfil));
      return;
    }
    setInfo("Kayıt tamam! E-postanıza gelen onay bağlantısını tıklayın.");
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center" data-demo="true">
      <div className="w-full max-w-md px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-6 space-y-5">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center mx-auto mb-4">
                {kurumsalProfil === "emlakci" ? (
                  <Building2 className="w-6 h-6 text-white" />
                ) : kurumsalProfil === "muteahhit" ? (
                  <Factory className="w-6 h-6 text-white" />
                ) : (
                  <UserPlus className="w-6 h-6 text-white" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-white">
                {kurumsalProfil === "emlakci"
                  ? "Kurumsal / emlakçı kaydı"
                  : kurumsalProfil === "muteahhit"
                    ? "Müteahhit / proje kaydı"
                    : "Kayıt Ol"}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {kurumsalProfil === "emlakci"
                  ? "Ofis veya yetkili temsilci hesabı; doğrulama ve B2B sözleşme üretimde tamamlanır."
                  : kurumsalProfil === "muteahhit"
                    ? "Ruhsat ve ön tahsis evrak çizgisi üretimde tamamlanır; kayıt sonrası ihale açma ekranına yönlendirilirsiniz."
                    : isSupabaseConfigured()
                      ? "Supabase Auth; profil satırı sunucuda otomatik oluşur."
                      : "Kayıt için Supabase .env yapılandırın."}
              </p>
            </div>
            {info && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{info}</span>
              </div>
            )}
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Ad Soyad</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-slate-950 border-slate-200 text-white placeholder:text-slate-600"
                    placeholder="Ali Veli"
                    autoComplete="name"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-950 border-slate-200 text-white placeholder:text-slate-600"
                    placeholder="ornek@mail.com"
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Telefon (isteğe bağlı)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 bg-slate-950 border-slate-200 text-white placeholder:text-slate-600"
                    placeholder="5XX XXX XX XX"
                    autoComplete="tel"
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
                    className="pl-10 pr-10 bg-slate-950 border-slate-200 text-white placeholder:text-slate-600"
                    placeholder="En az 6 karakter"
                    autoComplete="new-password"
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
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Şifre tekrar</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="pl-10 bg-slate-950 border-slate-200 text-white placeholder:text-slate-600"
                    placeholder="Şifreyi tekrarla"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer">
                <input type="checkbox" checked={kvkkAccepted} onChange={(e) => setKvkkAccepted(e.target.checked)} className="mt-0.5 accent-teal-500" />
                <span>
                  <button type="button" className="text-teal-400 hover:underline" onClick={() => navigate("/kvkk")}>
                    KVKK
                  </button>{" "}
                  ve{" "}
                  <button type="button" className="text-teal-400 hover:underline" onClick={() => navigate("/gizlilik")}>
                    gizlilik
                  </button>{" "}
                  metnini okudum; kişisel verilerimin bu kapsamda işlenmesini kabul ediyorum.
                </span>
              </label>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-bold h-11 disabled:opacity-70">
                {loading ? "Kaydediliyor..." : "Kayıt Ol"}
              </Button>
            </form>
            <div className="text-center text-sm text-slate-400">
              Zaten hesabınız var mı?{" "}
              <button
                type="button"
                onClick={() =>
                  navigate(
                    kurumsalProfil === "emlakci"
                      ? "/giris?profil=emlakci"
                      : kurumsalProfil === "muteahhit"
                        ? "/giris?profil=muteahhit"
                        : "/giris",
                  )
                }
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Giriş Yap
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
