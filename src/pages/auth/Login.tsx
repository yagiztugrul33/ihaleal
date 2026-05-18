import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft, Building2, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase";
import { translateAuthError } from "@/lib/authErrors";
import { useAuth } from "@/contexts/AuthContext";
import { parseKurumsalProfil, postLoginPathForProfil } from "@/lib/authProfile";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const kurumsalProfil = parseKurumsalProfil(searchParams);
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
      setError("Giriş için Supabase ortam değişkenleri gerekir (.env.local; demo).");
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
    navigate(postLoginPathForProfil(kurumsalProfil));
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
                {kurumsalProfil === "emlakçı" ? (
                  <Building2 className="w-6 h-6 text-white" />
                ) : kurumsalProfil === "muteahhit" ? (
                  <Factory className="w-6 h-6 text-white" />
                ) : (
                  <LogIn className="w-6 h-6 text-white" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-white">
                {kurumsalProfil === "emlakçı"
                  ? "Emlakçı / kurumsal giriş"
                  : kurumsalProfil === "muteahhit"
                    ? "Müteahhit / proje girişi"
                    : "Giriş Yap"}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {kurumsalProfil === "emlakçı"
                  ? "Aynı hesap alıcı ve satıcı akışlarıyla da kullanılabilir. Giriş sonrası satıcı merkezine yönlendirilirsiniz."
                  : kurumsalProfil === "muteahhit"
                    ? "Ruhsat / stok ve lansman kilidi kuralları üretimde ayrı modüllerde uygulanır. Giriş sonrası ihale açma akışına yönlendirilirsiniz."
                    : isSupabaseConfigured()
                      ? "Supabase Auth ile güvenli oturum."
                      : "Supabase .env yok — giriş için yapılandırın."}
              </p>
            </div>
            {kurumsalProfil === "emlakçı" ? (
              <div className="rounded-xl border border-teal-500/25 bg-teal-500/5 px-3 py-2.5 text-xs text-teal-100/95 space-y-2 text-left">
                <p className="font-medium text-teal-200">Ortak emlakçı veya ofis temsilcisi misiniz?</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li>
                    <Link to="/emlakçı-ortaklik" className="text-teal-400 hover:underline">
                      B2B ortaklık başvurusu
                    </Link>{" "}
                    (demo form)
                  </li>
                  <li>
                    <Link to="/emlakçıler" className="text-teal-400 hover:underline">
                      Ortak emlakçı vitrini
                    </Link>
                  </li>
                  <li>
                    <Link to="/yasal/agency-contract" className="text-teal-400 hover:underline">
                      agency_contract.md (taslak)
                    </Link>
                  </li>
                  <li>
                    <Link to="/evraklar" className="text-teal-400 hover:underline">
                      Katılım evrakları
                    </Link>
                  </li>
                </ul>
              </div>
            ) : null}
            {kurumsalProfil === "muteahhit" ? (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-100/95 space-y-2 text-left">
                <p className="font-medium text-amber-200">Müteahhit / üretici şirket oturumu</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li>
                    <Link to="/nihai-anayasa" className="text-amber-300 hover:underline">
                      Nihai sistem anayasası
                    </Link>
                  </li>
                  <li>
                    <Link to="/yasal/agency-contract" className="text-amber-300 hover:underline">
                      Ortaklık sözleşmesi (agency_contract taslak)
                    </Link>
                  </li>
                  <li>
                    <Link to="/evraklar" className="text-amber-300 hover:underline">
                      Ön tahsis ve PDF evrak çizgisi
                    </Link>
                  </li>
                  <li>
                    <Link to="/yasal-cerceve" className="text-amber-300 hover:underline">
                      Yasal çerçeve (taslak sayfalar)
                    </Link>
                  </li>
                </ul>
              </div>
            ) : null}
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
                    className="pl-10 bg-slate-950 border-slate-200 text-white placeholder:text-slate-600"
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
                    className="pl-10 pr-10 bg-slate-950 border-slate-200 text-white placeholder:text-slate-600"
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
              <button
                type="button"
                onClick={() =>
                  navigate(
                    kurumsalProfil === "emlakçı"
                      ? "/kayit?profil=emlakçı"
                      : kurumsalProfil === "muteahhit"
                        ? "/kayit?profil=muteahhit"
                        : "/kayit",
                  )
                }
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Kayıt Ol
              </button>
            </div>
            {kurumsalProfil === null ? (
              <div className="text-center text-xs text-slate-500 space-y-1">
                <div>
                  <Link to="/giris?profil=emlakçı" className="text-teal-400 hover:underline">
                    Emlakçı girişi
                  </Link>
                  {" · "}
                  <Link to="/giris?profil=muteahhit" className="text-amber-300 hover:underline">
                    Müteahhit girişi
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 space-y-1">
                <Link to="/giris" className="text-blue-400 hover:underline block">
                  Standart (bireysel) giriş
                </Link>
                {kurumsalProfil === "emlakçı" ? (
                  <Link to="/giris?profil=muteahhit" className="text-amber-300 hover:underline block">
                    Müteahhit girişi
                  </Link>
                ) : (
                  <Link to="/giris?profil=emlakçı" className="text-teal-400 hover:underline block">
                    Emlakçı girişi
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
