import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createPasswordRecord, stripForSession, dispatchAuthChanged, type StoredUser } from "@/lib/auth";
import { isValidTRPhone, validateDemoPassword } from "@/lib/demoAuthValidators";
import { isSupabaseConfigured } from "@/lib/supabase";
import { formatSupabaseAuthError } from "@/lib/supabaseAuthBridge";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [info, setInfo] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!name.trim() || !email.trim() || !password) {
      setError("Ad soyad, e-posta ve şifre zorunludur.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    if (isSupabaseConfigured()) {
      const pwdErr = validateDemoPassword(password);
      if (pwdErr) {
        setError(pwdErr);
        return;
      }
      if (!kvkkAccepted) {
        setError("Devam etmek için KVKK ve gizlilik metnini onaylayın.");
        return;
      }
      const { error: supaErr, session } = await signUp(email.trim(), password, name.trim(), {
        phone: phone.trim() || undefined,
      });
      if (supaErr) {
        setError(formatSupabaseAuthError(supaErr.message));
        return;
      }
      if (session?.user) {
        setSuccess(true);
        setTimeout(() => navigate("/onboarding/akis"), 800);
        return;
      }
      setInfo(
        "Kayıt tamamlandı. E-posta onaylama bağlantısı için gelen kutunuzu kontrol edin. Onay sonrası giriş yapabilirsiniz."
      );
      setSuccess(false);
      return;
    }

    if (!phone.trim()) {
      setError("Telefon zorunludur (yerel demo kuralı).");
      return;
    }
    if (!isValidTRPhone(phone)) {
      setError("Geçerli bir Türkiye cep telefonu girin (örn. 5XXXXXXXXX).");
      return;
    }
    const pwdErr = validateDemoPassword(password);
    if (pwdErr) {
      setError(pwdErr);
      return;
    }
    if (!kvkkAccepted) {
      setError("Devam etmek için KVKK ve gizlilik metnini onaylayın.");
      return;
    }
    const users = JSON.parse(localStorage.getItem("ihaleal_users") || "[]") as StoredUser[];
    if (users.find((u) => u.email === email.trim())) {
      setError("Bu e-posta adresi zaten kayıtlı.");
      return;
    }
    const { passwordSalt, passwordHash } = await createPasswordRecord(password);
    const newUser: StoredUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      passwordSalt,
      passwordHash,
      avatar: "",
      verified: false,
      rating: 0,
      auctionsCreated: 0,
      auctionsWon: 0,
      memberSince: new Date().toISOString().split("T")[0],
    };
    users.push(newUser);
    localStorage.setItem("ihaleal_users", JSON.stringify(users));
    localStorage.setItem("ihaleal_user", JSON.stringify(stripForSession(newUser)));
    dispatchAuthChanged();
    setSuccess(true);
    setTimeout(() => navigate("/onboarding/akis"), 800);
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
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Kayıt Ol</h1>
              <p className="text-sm text-slate-400 mt-1">
                {isSupabaseConfigured() ? "Supabase Auth; profil satırı sunucuda otomatik oluşur." : "Kayıt sonrası akış seçimi (yerel demo)."}
              </p>
            </div>
            {success && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Kayıt başarılı! Akış seçimine yönlendiriliyorsunuz...</span>
              </div>
            )}
            {info && (
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-sm">{info}</div>
            )}
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Ad Soyad</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-slate-950 border-white/10 text-white placeholder:text-slate-600"
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
                    className="pl-10 bg-slate-950 border-white/10 text-white placeholder:text-slate-600"
                    placeholder="ornek@mail.com"
                    autoComplete="email"
                  />
                </div>
              </div>
              {!isSupabaseConfigured() ? (
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Telefon</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 bg-slate-950 border-white/10 text-white placeholder:text-slate-600"
                      placeholder="5XX XXX XX XX"
                      autoComplete="tel"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Telefon (isteğe bağlı)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 bg-slate-950 border-white/10 text-white placeholder:text-slate-600"
                      placeholder="5XX XXX XX XX"
                      autoComplete="tel"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-950 border-white/10 text-white placeholder:text-slate-600"
                    placeholder="En az 10 karakter + büyük/küçük/rakam/sembol"
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
                    className="pl-10 bg-slate-950 border-white/10 text-white placeholder:text-slate-600"
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
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-bold h-11">
                Kayıt Ol
              </Button>
            </form>
            <div className="text-center text-sm text-slate-400">
              Zaten hesabınız var mı?{" "}
              <button type="button" onClick={() => navigate("/giris")} className="text-blue-400 hover:text-blue-300 font-medium">
                Giriş Yap
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
