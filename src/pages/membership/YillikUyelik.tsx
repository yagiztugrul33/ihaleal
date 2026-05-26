import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { MEMBERSHIP_DURATION_DAYS, MEMBERSHIP_FEES } from "@/lib/fees";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function YillikUyelik() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabaseReady = isSupabaseConfigured();

  const expiresAt = () =>
    new Date(Date.now() + MEMBERSHIP_DURATION_DAYS * 86400000).toISOString();

  const buy = async (type: keyof typeof MEMBERSHIP_FEES, label: string) => {
    setError(null);
    if (!supabaseReady) {
      setError("Demo ödeme şu anda kapalı. Devam etmek için .env.local ile Supabase yapılandırın.");
      return;
    }
    if (!user) {
      navigate("/giris");
      return;
    }
    const amount = MEMBERSHIP_FEES[type];
    setLoading(label);
    const { error: insErr } = await supabase.from("memberships").insert({
      user_id: user.id,
      type,
      amount_paid_try: amount,
      starts_at: new Date().toISOString(),
      expires_at: expiresAt(),
      status: "active",
    });
    setLoading(null);
    if (insErr) {
      setError("Üyelik kaydı şu anda tamamlanamadı. Lütfen daha sonra tekrar deneyin.");
      return;
    }
    navigate("/profil");
  };

  const packs: {
    id: keyof typeof MEMBERSHIP_FEES;
    title: string;
    price: string;
    desc: string;
    highlight?: boolean;
  }[] = [
    {
      id: "seller_yearly",
      title: "Satıcı — yıllık",
      price: "₺5.000",
      desc: "Sınırsız ilan ve ihale açma hedefi; komisyon mahsup çizgisi fees.ts ile uyumlu.",
      highlight: true,
    },
    {
      id: "buyer_yearly",
      title: "Alıcı — yıllık",
      price: "₺1.000",
      desc: "Teklif verme yetkisi; arama ve keşif ücretsiz kalır (hedef ürün politikası).",
    },
    {
      id: "agent_referral",
      title: "Emlakçı — başvuru",
      price: "Ücretsiz",
      desc: "Referans çizgisi; gelir payı komisyon üzerinden (sözleşmede netleşir).",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Yıllık üyelik</h1>
        {!supabaseReady ? (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-sm">
            Demo ödeme şu anda pasif. Paket kaydı için <code className="text-amber-100">.env.local</code> ile Supabase yapılandırın.
          </div>
        ) : null}
        <p className="text-slate-400 mb-8">
          Demo ödeme: seçtiğiniz paket doğrudan Supabase <code className="text-teal-400/90">memberships</code> tablosuna yazılır (iyzico sonraki sprint).
        </p>
        {error ? (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">{error}</div>
        ) : null}
        <div className="grid md:grid-cols-3 gap-6">
          {packs.map((p) => (
            <Card
              key={p.id}
              className={`border-slate-200 bg-slate-900/50 ${p.highlight ? "ring-2 ring-amber-500/40" : ""}`}
            >
              <CardContent className="p-6 flex flex-col gap-4 h-full">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{p.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{p.price}</p>
                  <p className="text-sm text-slate-400 mt-3 leading-relaxed">{p.desc}</p>
                </div>
                <Button
                  type="button"
                  disabled={!supabaseReady || loading !== null}
                  onClick={() => void buy(p.id, p.title)}
                  className="mt-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold"
                >
                  {loading === p.title ? "Kaydediliyor..." : "Bu paketi seç"}
                </Button>
                <p className="text-[11px] text-slate-600 flex items-start gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80 shrink-0 mt-0.5" />
                  Giriş zorunlu; kayıt satırı üzerinden üyelik süresi tutulur.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-8 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
            <h3 className="text-sm font-semibold text-cyan-100">Nedir / neden</h3>
            <p className="mt-2 text-xs text-slate-200">Üyelik ekranı, kullanıcı yaşam döngüsünde plan seçimi ve panel erişim seviyesini netleştirir.</p>
          </article>
          <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <h3 className="text-sm font-semibold text-emerald-100">Onboarding</h3>
            <p className="mt-2 text-xs text-slate-200">Plan seçimi sonrası kullanıcı profil, favori ve teklif adımına yönlendirilir.</p>
          </article>
          <article className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-4">
            <h3 className="text-sm font-semibold text-violet-100">Geri dönüş</h3>
            <p className="mt-2 text-xs text-slate-200">Süre bitimine yaklaşan üyelikler bildirim ve panel kartı ile görünür hale getirilir.</p>
          </article>
        </section>

        <section className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
          <h3 className="text-sm font-semibold text-amber-100">Dürüst sınır + CTA</h3>
          <p className="mt-2 text-xs text-slate-200">
            Demo ödeme kayıtları canlı tahsilat yerine geçmez. Canlıya geçişte ödeme kuruluşu, fatura ve sözleşme süreçleriyle birlikte
            üyelik aktivasyonu tamamlanmalıdır.
          </p>
        </section>
      </div>
    </div>
  );
}
