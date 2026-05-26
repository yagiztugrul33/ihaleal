import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    window.dispatchEvent(
      new CustomEvent("ihaleal:add-toast", {
        detail: {
          message:
            "Şifre sıfırlama bağlantısı gerçekte gönderilmez; üretimde e-posta sağlayıcısı eklenir.",
          type: "info",
        },
      }),
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-slate-900/60 p-8 shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-blue-500/15 p-3">
            <Mail className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <h1 className="text-center text-xl font-semibold text-white">Şifre sıfırlama</h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Hesabınıza bağlı e-postayı girin; demo ortamında yalnızca bildirim simülasyonu gösterilir.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="reset-email" className="text-slate-300">
              E-posta
            </Label>
            <Input
              id="reset-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@alan.com"
              className="mt-1.5 border-slate-200 bg-slate-950/50 text-white"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            {sent ? "Tekrar gönder" : "Bağlantı gönder (demo)"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link to="/giris" className="text-blue-400 hover:text-blue-300">
            Girişe dön
          </Link>
        </p>
      </div>

      <div className="mt-6 w-full max-w-2xl space-y-3">
        <section className="grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
            <h2 className="text-xs font-semibold text-cyan-100">Nedir?</h2>
            <p className="mt-2 text-xs text-slate-200">Şifre sıfırlama, kullanıcı yaşam döngüsünde hesap geri kazanım kapısıdır.</p>
          </article>
          <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <h2 className="text-xs font-semibold text-emerald-100">Onboarding</h2>
            <p className="mt-2 text-xs text-slate-200">İlk kullanımda kullanıcıya güvenli parola ve doğrulama önerileri gösterilir.</p>
          </article>
          <article className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-4">
            <h2 className="text-xs font-semibold text-violet-100">Geri dönüş</h2>
            <p className="mt-2 text-xs text-slate-200">Bağlantı sonrası kullanıcı güvenli girişe yönlendirilip panel akışına geri taşınır.</p>
          </article>
        </section>

        <section className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
          <h3 className="text-xs font-semibold text-amber-100">Dürüst sınır + CTA</h3>
          <p className="mt-2 text-xs text-slate-200">
            Demo ortamda e-posta gönderimi simüledir. Canlıda e-posta sağlayıcısı, tek kullanımlık token ve süreli doğrulama zorunludur.
          </p>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-semibold text-slate-100">Sık sorulanlar</h3>
          <div className="mt-2 space-y-1 text-xs text-slate-300">
            <p>Bağlantı gelmediyse spam kutusunu kontrol edin ve e-posta adresini doğrulayın.</p>
            <p>Aynı hesap için çok sık deneme yapılırsa geçici bekleme süresi uygulanabilir.</p>
            <p>Şifre sıfırlama sonrası güçlü parola ve iki adımlı doğrulama önerilir.</p>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-semibold text-slate-100">Adım adım akış</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-slate-300">
            <li>E-posta adresi girilir ve istek gönderilir.</li>
            <li>Kullanıcı bağlantıdan yeni şifre ekranına yönlendirilir.</li>
            <li>Yeni şifre doğrulanır ve güvenlik önerileri gösterilir.</li>
            <li>Kullanıcı giriş ve panel ekranına güvenli şekilde döner.</li>
          </ol>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-semibold text-slate-100">Güvenlik kontrol noktaları</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-300">
            <li>Şifre sıfırlama isteği oturum ve cihaz bilgisiyle loglanır.</li>
            <li>Tek kullanımlık bağlantı süresi dolduğunda yeni istek gerekir.</li>
            <li>Ardışık başarısız denemelerde bekleme politikası uygulanır.</li>
            <li>Parola politikası minimum uzunluk ve karmaşıklık kontrolü içerir.</li>
            <li>İsteğe bağlı iki adımlı doğrulama sonrası giriş önerilir.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-semibold text-slate-100">Kime göre / CTA</h3>
          <p className="mt-2 text-xs text-slate-300">
            Hesabına geri dönmek isteyen kullanıcılar için bu ekran hızlı kurtarma sağlar. Şifre yenileme sonrası profil, ayarlar ve
            bildirim tercihlerini kontrol ederek yaşam döngüsünü güvenli biçimde tamamlayın.
          </p>
        </section>
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-xs font-semibold text-slate-100">Operasyon notu</h3>
          <p className="mt-2 text-xs text-slate-300">
            Destek ekibi, kullanıcı talebi geldiğinde zaman damgalı sıfırlama kayıtlarını kontrol ederek hesap kurtarma sürecini doğrular.
          </p>
          <p className="mt-2 text-xs text-slate-300">
            Hesap güvenliği için şüpheli durumlarda kullanıcıya ek kimlik doğrulama adımı uygulanabilir.
          </p>
        </section>
      </div>
    </div>
  );
}
