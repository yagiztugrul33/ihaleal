import { useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function PreLaunch() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseReady = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseReady) {
      setError("Lansman kaydı şu anda kapalı. Devam etmek için .env.local ile Supabase yapılandırın.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: insErr } = await supabase.from("pre_launch_signups").insert({
      email: email.trim(),
      name: name.trim() || null,
      phone: phone.trim() || null,
      source: "website",
    });
    setLoading(false);
    if (insErr) {
      setError("Lansman kaydı şu anda tamamlanamadı. Lütfen daha sonra tekrar deneyin.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1F44] to-slate-900 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-white mb-4">Teşekkürler!</h1>
          <p className="text-slate-300">Lansman duyurularımızı e-postanıza göndereceğiz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1F44] via-slate-900 to-[#F59E0B]/25 flex items-center justify-center p-6">
      <div className="bg-slate-950/90 border border-slate-200 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
          ihaleal.com
        </h1>
        <p className="text-xl text-slate-300 mb-6">Türkiye&apos;nin gayrimenkul ihale deneyimi yakında.</p>
        <p className="mb-6 text-slate-400 text-sm leading-relaxed">
          Lansman listesi için kayıt olun; ilk haberdar olanlar arasında olun.
        </p>
        {error ? <div className="mb-4 text-sm text-red-400">{error}</div> : null}
        {!supabaseReady ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            Lansman kaydı için <code className="text-amber-100">.env.local</code> ile Supabase yapılandırın.
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <input
              type="text"
              placeholder="Ad Soyad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-900 border border-white/15 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-slate-900 border border-white/15 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <input
              type="tel"
              placeholder="Telefon (isteğe bağlı)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-900 border border-white/15 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-amber-500 text-slate-950 rounded-lg font-bold hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Listeye katıl"}
            </button>
          </form>
        )}
        <p className="text-xs text-slate-500 mt-6 text-center leading-relaxed">
          KVKK kapsamında verileriniz yalnızca lansman bildirimleri için kullanılır.
        </p>
      </div>
    </div>
  );
}
