import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Crown, ArrowRight, AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRICING_TIERS, type TierId, type BillingCycle, priceFor, formatTry } from "@/lib/pricingTiers";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const paketParam = params.get("paket") as TierId | null;
  const periyot = params.get("periyot") as BillingCycle | null;
  const tier = PRICING_TIERS.find((t) => t.id === paketParam) ?? PRICING_TIERS[1];
  const cycle: BillingCycle = periyot === "yearly" ? "yearly" : "monthly";
  const { try: price, period } = priceFor(tier, cycle);
  // Çoklu kur referans — TAHSILAT iyzico ₺
  const { currency, formatFromTry } = useCurrency();
  const showFx = currency !== "TRY" && price > 0;

  // Confetti effect (CSS animation; no layout shift)
  useEffect(() => {
    document.title = `Ödeme başarılı — ${tier.name} | ihaleal`;
  }, [tier.name]);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <div className="max-w-2xl mx-auto space-y-6 text-center">
        <div className="mx-auto rounded-full bg-emerald-500/20 w-20 h-20 flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400" />
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Hoş geldin!</h1>
          <p className="text-slate-400">
            <strong className="text-white">{tier.name}</strong> paketin aktif edildi.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-slate-900/50 p-6 text-left">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5" /> Aktif paket
              </p>
              <h2 className="text-2xl font-bold text-white mt-1">{tier.name}</h2>
              <p className="text-sm text-slate-400 mt-1">{tier.tagline}</p>
            </div>
            <div className="text-end">
              <p className="text-xl font-bold text-emerald-300">{formatTry(price)}</p>
              <p className="text-xs text-slate-400">{period}</p>
              {showFx && (
                <p className="text-[10px] text-amber-300/80 mt-1">
                  ≈ {formatFromTry(price)} <span className="text-slate-500">(tahsilat ₺)</span>
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3 text-xs space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span>İlan limiti</span>
              <span className="text-white font-semibold">{tier.listingLimit === "unlimited" ? "Sınırsız" : `${tier.listingLimit}/yıl`}</span>
            </div>
            <div className="flex justify-between">
              <span>Ekip üye</span>
              <span className="text-white font-semibold">{tier.teamSeats === "unlimited" ? "Sınırsız" : tier.teamSeats}</span>
            </div>
            <div className="flex justify-between">
              <span>İptal/iade</span>
              <span className="text-white font-semibold">14 gün ücretsiz</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-left">
          <p className="text-xs font-semibold text-amber-100 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Sandbox Ödeme Onayı
          </p>
          <p className="text-[11px] text-slate-300 mt-1">
            Bu ödeme <strong className="text-amber-200">iyzico sandbox</strong> üzerinden tamamlandı —
            gerçek para çekilmedi (test ortamı). Aboneliğiniz Supabase <code className="text-cyan-300">subscriptions</code>
            tablosuna kaydedildi ve premium özellikler aktif edildi. Production tahsilat için iyzico
            merchant API anahtarları Master tarafından secret olarak girilmelidir.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Button
            onClick={() => navigate("/uyelik")}
            className="bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            Üyeliğimi Yönet
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
          <Button
            onClick={() => navigate("/ihaleler")}
            variant="outline"
            className="border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10"
          >
            Borsa Terminalini Aç
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>

        <div className="pt-4 border-t border-slate-700 text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Faturanız <strong className="text-slate-200">destek@ihaleal.com</strong>'a gönderildi (mock).
          </p>
          <p className="mt-2">
            Sorular: <a href="mailto:destek@ihaleal.com" className="text-cyan-300 underline">destek@ihaleal.com</a>
          </p>
        </div>
      </div>
    </main>
  );
}
