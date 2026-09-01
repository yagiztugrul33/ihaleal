import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Crown, ArrowRight, AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRICING_TIERS, type TierId, type BillingCycle, priceFor, formatTry } from "@/lib/pricingTiers";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLocale } from "@/contexts/LocaleContext";

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
  const { t } = useLocale();
  const s = t.payment.success;

  const tierName = t.tierData.byId[tier.id]?.name ?? tier.name;
  const tierTagline = t.tierData.byId[tier.id]?.tagline ?? tier.tagline;
  useEffect(() => {
    document.title = `${s.title} — ${tierName} | ihaleal`;
  }, [tierName, s.title]);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <div className="max-w-2xl mx-auto space-y-6 text-center">
        <div className="mx-auto rounded-full bg-[var(--zemin-yumusak)] w-20 h-20 flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12" style={{ color: "var(--durum-basari)" }} />
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-normal mb-2">{s.title}</h1>
          <p className="text-slate-400">
            <strong className="text-white">{tierName}</strong> {s.activated}
          </p>
        </div>

        <div className="rounded-[20px] border p-6 text-start" style={{ borderColor: "var(--durum-basari)", backgroundColor: "var(--zemin-yumusak)" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-normal flex items-center gap-1.5" style={{ color: "var(--durum-basari)" }}>
                <Crown className="h-3.5 w-3.5" /> {s.activeBadge}
              </p>
              <h2 className="text-2xl font-normal text-white mt-1">{tierName}</h2>
              <p className="text-sm text-slate-400 mt-1">{tierTagline}</p>
            </div>
            <div className="text-end">
              <p className="text-xl font-normal text-white" dir="ltr">{formatTry(price)}</p>
              <p className="text-xs text-slate-400">{period}</p>
              {showFx && (
                <p className="text-[10px] text-slate-400 mt-1" dir="ltr">
                  ≈ {formatFromTry(price)} <span className="text-slate-500">{s.feeNote}</span>
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-3 text-xs space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span>{s.listingLimit}</span>
              <span className="text-white font-normal">{tier.listingLimit === "unlimited" ? s.unlimited : `${tier.listingLimit}/yıl`}</span>
            </div>
            <div className="flex justify-between">
              <span>{s.teamSeats}</span>
              <span className="text-white font-normal">{tier.teamSeats === "unlimited" ? s.unlimited : tier.teamSeats}</span>
            </div>
            <div className="flex justify-between">
              <span>{s.refundLabel}</span>
              <span className="text-white font-normal">{s.refundValue}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border p-4 text-start" style={{ borderColor: "var(--durum-uyari)", backgroundColor: "var(--durum-uyari-zemin)" }}>
          <p className="text-xs font-normal flex items-center gap-1.5" style={{ color: "var(--durum-uyari)" }}>
            <AlertTriangle className="h-3.5 w-3.5" /> {s.sandboxTitle}
          </p>
          <p className="text-[11px] mt-1" style={{ color: "var(--durum-uyari)" }}>
            {s.sandboxBody}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Button onClick={() => navigate("/uyelik")}>
            {s.manageMembership}
            <ArrowRight className="h-4 w-4 ms-1.5 rtl:rotate-180" />
          </Button>
          <Button
            onClick={() => navigate("/ihaleler")}
            variant="outline"
          >
            {s.openExchange}
            <ArrowRight className="h-4 w-4 ms-1.5 rtl:rotate-180" />
          </Button>
        </div>

        <div className="pt-4 border-t border-slate-700 text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            {s.invoiceSent}
          </p>
          <p className="mt-2">
            {s.questions}: <a href="mailto:destek@ihaleal.com" className="underline">destek@ihaleal.com</a>
          </p>
        </div>
      </div>
    </main>
  );
}
