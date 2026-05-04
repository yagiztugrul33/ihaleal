import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, User, Building2, HardHat, LogIn, UserPlus,
  Eye, EyeOff, Mail, Lock, Phone, MapPin, FileText,
  ShieldCheck, CheckCircle2, AlertTriangle, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AccountSegment } from "@/lib/auth";
import { dispatchAuthChanged } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";

type AuthMode = "login" | "register";

function persistLocalSession(params: {
  id: string;
  email: string;
  name: string;
  phone?: string;
  verified: boolean;
  accountSegment: AccountSegment;
}): void {
  const session: SessionUser = {
    id: params.id,
    email: params.email,
    name: params.name,
    phone: params.phone ?? "",
    verified: params.verified,
    authBackend: "local",
    accountSegment: params.accountSegment,
    memberSince: new Date().toISOString().split("T")[0],
  };
  localStorage.setItem("ihaleal_user", JSON.stringify(session));
  dispatchAuthChanged();
}

const userTypes: { id: AccountSegment; label: string; icon: ReactNode; desc: string; badge: string }[] = [
  { id: "individual", label: "Bireysel Kullanıcı", icon: <User className="w-5 h-5" />, desc: "Mülk arayan, kiralayan veya satın alan kullanıcı", badge: "Alıcı / Kiracı" },
  { id: "realtor", label: "Emlakçı / Danışman", icon: <Building2 className="w-5 h-5" />, desc: "Gayrimenkul danışmanı ve aracı kurum yetkilisi", badge: "Aracı" },
  { id: "developer", label: "Müteahhit / Geliştirici", icon: <HardHat className="w-5 h-5" />, desc: "İnşaat firması, proje sahibi veya geliştirici firma", badge: "Satıcı / Proje" },
];

export function EmlakciGiris() {
  const navigate = useNavigate();

  const [activeType, setActiveType] = useState<AccountSegment>("individual");
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register fields — common
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Register fields — realtor specific
  const [regCompany, setRegCompany] = useState("");
  const [regLicense, setRegLicense] = useState("");
  const [regCity, setRegCity] = useState("");

  // Register fields — developer specific
  const [regTaxNo, setRegTaxNo] = useState("");
  const [regRuhsatNo, setRegRuhsatNo] = useState("");
  const [regProjects, setRegProjects] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const currentType = userTypes.find(t => t.id === activeType)!;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginEmail || !loginPassword) { setError("E-posta ve şifre zorunludur."); return; }

    setLoading(true);
    setTimeout(() => {
      persistLocalSession({
        id: "user_" + Math.random().toString(36).slice(2, 10),
        email: loginEmail,
        name: loginEmail.split("@")[0],
        verified: true,
        accountSegment: activeType,
      });
      setLoading(false);
      setSuccess("Giriş başarılı! Yönlendiriliyorsunuz...");
      setTimeout(() => navigate("/"), 1500);
    }, 1200);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!regName || !regEmail || !regPhone || !regPassword) {
      setError("Tüm zorunlu alanları doldurun."); return;
    }
    if (regPassword.length < 6) { setError("Şifre en az 6 karakter olmalıdır."); return; }
    if (regPassword !== regConfirm) { setError("Şifreler eşleşmiyor."); return; }
    if (!agreeTerms) { setError("Kullanım koşullarını kabul etmelisiniz."); return; }

    if (activeType === "realtor" && (!regCompany || !regLicense)) {
      setError("Emlakçı kaydı için firma adı ve yetki belgesi zorunludur."); return;
    }
    if (activeType === "developer" && (!regTaxNo || !regRuhsatNo)) {
      setError("Müteahhit kaydı için vergi no ve ruhsat bilgisi zorunludur."); return;
    }

    setLoading(true);
    setTimeout(() => {
      persistLocalSession({
        id: "user_" + Math.random().toString(36).slice(2, 10),
        email: regEmail,
        name: regName,
        phone: regPhone,
        verified: false,
        accountSegment: activeType,
      });
      setLoading(false);
      setSuccess("Kayıt başarılı! Hoş geldiniz.");
      setTimeout(() => navigate("/"), 1500);
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2 mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Ana Sayfa
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 sm:p-8 border border-white/10"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">İhaleAL Giriş / Kayıt</h1>
            <p className="text-sm text-slate-400 mt-1">Hesap tipinizi seçin ve giriş yapın veya yeni hesap oluşturun</p>
          </div>

          {/* User Type Selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {userTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveType(t.id); setError(""); setSuccess(""); }}
                className={`rounded-xl p-3 text-center border transition-all ${
                  activeType === t.id
                    ? "bg-white/10 border-white/30 shadow-lg shadow-white/5"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                }`}
              >
                <div className={`mx-auto w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                  activeType === t.id ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-slate-500"
                }`}>
                  {t.icon}
                </div>
                <p className="text-xs font-semibold text-white leading-tight">{t.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{t.badge}</p>
              </button>
            ))}
          </div>

          {/* Selected Type Description */}
          <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3 mb-6 flex items-start gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
              {currentType.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{currentType.label}</p>
              <p className="text-xs text-slate-400">{currentType.desc}</p>
            </div>
          </div>

          {/* Auth Mode Toggle */}
          <div className="flex rounded-xl bg-white/[0.05] p-1 mb-6 border border-white/5">
            <button
              onClick={() => setAuthMode("login")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                authMode === "login" ? "bg-white/10 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <LogIn className="w-4 h-4" /> Giriş Yap
            </button>
            <button
              onClick={() => setAuthMode("register")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                authMode === "register" ? "bg-white/10 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus className="w-4 h-4" /> Hesap Oluştur
            </button>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-300">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-300">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <AnimatePresence mode="wait">
            {authMode === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">E-posta Adresi</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="bg-white/[0.05] border-white/10 text-white pl-10 placeholder:text-slate-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Şifre</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      type={showLoginPass ? "text" : "password"} value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••"
                      className="bg-white/[0.05] border-white/10 text-white pl-10 pr-10 placeholder:text-slate-600"
                    />
                    <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                    <input type="checkbox" className="rounded border-white/20 bg-white/5" />
                    Beni hatırla
                  </label>
                  <button type="button" className="text-blue-400 hover:text-blue-300" onClick={() => navigate("/sifremi-unuttum")}>Şifremi unuttum</button>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-5 rounded-xl"
                >
                  {loading ? "Giriş yapılıyor..." : `${currentType.label} olarak Giriş Yap`}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Ad Soyad</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Ahmet Yılmaz" className="bg-white/[0.05] border-white/10 text-white pl-10 placeholder:text-slate-600" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Telefon</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="05XX XXX XX XX" className="bg-white/[0.05] border-white/10 text-white pl-10 placeholder:text-slate-600" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">E-posta</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="ornek@email.com" className="bg-white/[0.05] border-white/10 text-white pl-10 placeholder:text-slate-600" />
                  </div>
                </div>

                {/* Realtor-specific */}
                {activeType === "realtor" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 overflow-hidden">
                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <p className="text-xs font-semibold text-blue-300 mb-2 flex items-center gap-1"><Building2 className="w-3 h-3" /> Emlakçı Bilgileri</p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Firma Adı *</label>
                          <Input value={regCompany} onChange={e => setRegCompany(e.target.value)} placeholder="Örnek Emlak Ltd. Şti." className="bg-white/[0.05] border-white/10 text-white placeholder:text-slate-600" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Yetki Belge No *</label>
                            <Input value={regLicense} onChange={e => setRegLicense(e.target.value)} placeholder="E-XXXX" className="bg-white/[0.05] border-white/10 text-white placeholder:text-slate-600" />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Çalışma Şehri</label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <Input value={regCity} onChange={e => setRegCity(e.target.value)} placeholder="İstanbul" className="bg-white/[0.05] border-white/10 text-white pl-9 placeholder:text-slate-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Developer-specific */}
                {activeType === "developer" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 overflow-hidden">
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <p className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-1"><HardHat className="w-3 h-3" /> Müteahhit / Firma Bilgileri</p>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Vergi No / TCKN *</label>
                            <Input value={regTaxNo} onChange={e => setRegTaxNo(e.target.value)} placeholder="1234567890" className="bg-white/[0.05] border-white/10 text-white placeholder:text-slate-600" />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Yapı Ruhsat No *</label>
                            <Input value={regRuhsatNo} onChange={e => setRegRuhsatNo(e.target.value)} placeholder="Ruhsat No" className="bg-white/[0.05] border-white/10 text-white placeholder:text-slate-600" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Aktif Projeler (opsiyonel)</label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input value={regProjects} onChange={e => setRegProjects(e.target.value)} placeholder="Proje isimleri, ada/parsel bilgisi" className="bg-white/[0.05] border-white/10 text-white pl-9 placeholder:text-slate-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Şifre</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input type={showRegPass ? "text" : "password"} value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="En az 6 karakter" className="bg-white/[0.05] border-white/10 text-white pl-10 pr-10 placeholder:text-slate-600" />
                      <button type="button" onClick={() => setShowRegPass(!showRegPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Şifre Tekrar</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input type={showRegConfirm ? "text" : "password"} value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="••••••" className="bg-white/[0.05] border-white/10 text-white pl-10 pr-10 placeholder:text-slate-600" />
                      <button type="button" onClick={() => setShowRegConfirm(!showRegConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showRegConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="rounded border-white/20 bg-white/5 mt-0.5" />
                  <span><button type="button" onClick={() => navigate("/kullanim-kosullari")} className="text-blue-400 hover:underline">Kullanım Koşulları</button> ve <button type="button" onClick={() => navigate("/aydinlatma-metni")} className="text-blue-400 hover:underline">KVKK Aydınlatma Metni</button>&apos;ni okudum ve kabul ediyorum.</span>
                </label>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-5 rounded-xl"
                >
                  {loading ? "Kayıt oluşturuluyor..." : `${currentType.label} olarak Kaydol`}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-slate-500">
              <Home className="w-3 h-3 inline mr-1" />
              İhaleAL.com — Bireysel, emlakçı ve müteahhit kullanıcılarına özel güvenli platform.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default EmlakciGiris;
