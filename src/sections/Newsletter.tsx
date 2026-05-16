import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const SUB_KEY = "ihaleal_newsletter_subscribers_v1";

export function Newsletter() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);
  const { ref, isVisible } = useScrollAnimation(0.1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (!consent) return;
    try {
      const list = JSON.parse(localStorage.getItem(SUB_KEY) || "[]") as { email: string; at: string }[];
      if (!list.some((x) => x.email.toLowerCase() === email.trim().toLowerCase())) {
        list.push({ email: email.trim().toLowerCase(), at: new Date().toISOString() });
        localStorage.setItem(SUB_KEY, JSON.stringify(list));
      }
    } catch {
      /* ignore */
    }
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section ref={ref} className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-teal-600/20 border border-slate-200 p-8 md:p-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&fit=crop')] bg-cover bg-center opacity-10" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, var(--color-bg-soft) 0%, var(--color-bg) 100%)" }} />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Yeni Ihalelerden Haberdar Olun
            </h2>
            <p className="text-slate-400 mb-6">
              Size ozel secilmis gayrimenkul firsatlarini ve piyasa analizlerini haftalik olarak gonderelim.
            </p>

            {submitted ? (
              <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-sm text-center">
                  Kaydınız bu cihazda saklandı (demo). Üretimde e-posta onayı ve gönderim altyapısı gerekir.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                    required
                    className="flex-1 bg-slate-950/50 border-slate-200 text-white placeholder:text-slate-500 h-12"
                  />
                  <Button type="submit" disabled={!consent} className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-semibold h-12 px-6 disabled:opacity-40">
                    <Send className="w-4 h-4 mr-2" /> Abone Ol
                  </Button>
                </div>
                <label className="flex items-start gap-2 text-xs text-slate-500 text-left cursor-pointer">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-teal-500" />
                  <span>
                    <button type="button" className="text-teal-400 hover:underline" onClick={() => navigate("/gizlilik")}>Aydınlatma metni</button>
                    {" "}kapsamında iletişim için e-postamın işlenmesini istiyorum.
                  </span>
                </label>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
