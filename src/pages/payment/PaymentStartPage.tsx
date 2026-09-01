import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, CreditCard, Lock, Shield, CheckCircle2, AlertTriangle, Sparkles,
  Building2, ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PRICING_TIERS, type TierId, type BillingCycle, priceFor, formatTry,
} from "@/lib/pricingTiers";
import { useMembershipTier } from "@/hooks/useMembershipTier";
import { createSubscription, getProviderStatus } from "@/lib/payments/paymentClient";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLocale } from "@/contexts/LocaleContext";

export default function PaymentStartPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setLocalTier } = useMembershipTier();
  const paketParam = params.get("paket") as TierId | null;
  const periyotParam = params.get("periyot") as BillingCycle | null;

  const tier = useMemo(() => PRICING_TIERS.find((t) => t.id === paketParam) ?? PRICING_TIERS[1], [paketParam]);
  const cycle: BillingCycle = periyotParam === "yearly" ? "yearly" : "monthly";
  const { try: price, period } = priceFor(tier, cycle);
  // Çoklu kur referans gösterim — TAHSILAT iyzico üzerinden ₺
  const { currency, formatFromTry } = useCurrency();
  const showFx = currency !== "TRY" && price > 0;
  const fxRef = showFx ? formatFromTry(price) : null;
  const { t } = useLocale();
  const s = t.payment.start;

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [providerStage, setProviderStage] = useState<"sandbox" | "production" | "unknown">("unknown");
  const [paymentsEnabled, setPaymentsEnabled] = useState(true);

  // Edge function durumunu öğren (sandbox vs production banner + genel ödeme anahtarı için)
  useEffect(() => {
    void getProviderStatus().then((s) => {
      setProviderStage(s.stage);
      setPaymentsEnabled(s.payments_enabled);
    });
  }, []);

  // Kurumsal (customPricing) — self-checkout yok, gerçek fiyat yok. Eski/bookmark'lı
  // /odeme/baslat?paket=kurumsal bağlantılarını iletişim formuna yönlendir; bu sayfa
  // hiçbir zaman özel fiyatlı bir tier'a tahsilat denemesin.
  useEffect(() => {
    if (tier.customPricing) {
      navigate("/kurumsal/iletisim", { replace: true });
    }
  }, [tier, navigate]);

  const canSubmit = cardName.trim().length >= 3 && cardNumber.replace(/\s/g, "").length >= 12 && expiry.length >= 4 && cvc.length >= 3 && acceptedTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    // GERÇEK Edge function — createSubscription iyzico'ya başvurur (sandbox veya prod)
    const result = await createSubscription({ tierId: tier.id, cycle });

    if (!result.ok) {
      setError(
        result.error === "already_subscribed"
          ? s.errors.alreadySubscribed
          : result.error === "unauthorized"
            ? s.errors.unauthorized
            : `${s.errors.generic}: ${result.detail ?? result.error ?? "—"}`,
      );
      setLoading(false);
      return;
    }

    // Ödeme sistemi demo modunda (PAYMENTS_ENABLED=false) — gerçek tahsilat hiç
    // denenmedi, sahte bir "başarılı" sayfasına yönlendirmeden burada net bilgilendir.
    if (result.demo_mode) {
      setInfoMessage(s.demoDisabledMessage);
      setLoading(false);
      return;
    }

    // Sandbox modunda subscription anında "active" oldu — UI tier'ı güncelle
    if (result.status === "active") {
      setLocalTier(tier.id);
    }

    // Production'da iyzico 3D Secure URL'ine yönlendir
    // Alan CreateSubscriptionResult'ta tanimli degil; zorunlu alanli cast TS2352
    // veriyordu. Opsiyonel cast bir kez yapilip daraltiliyor — davranis ayni.
    const paymentPageUrl = (result as { payment_page_url?: string }).payment_page_url;
    if (result.status === "pending" && paymentPageUrl) {
      window.location.href = paymentPageUrl;
      return;
    }

    setLoading(false);
    navigate(`/odeme/basarili?paket=${tier.id}&periyot=${cycle}${result.sandbox ? "&sandbox=1" : ""}`);
  };

  // Kart numarası formatla (4 digit boşluk)
  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.match(/.{1,4}/g)?.join(" ") ?? digits;
  };

  // customPricing tier'a doğrudan/bookmark ile gelinmişse yönlendirme effect'i
  // tetiklenene kadar bu sayfayı render etme (yukarıdaki useEffect'e bakınız).
  if (tier.customPricing) {
    return null;
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/fiyatlandirma")}
          className="text-slate-500 hover:text-white gap-2"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {s.back}
        </Button>

        <div>
          <h1 className="text-3xl font-normal flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-cyan-400" />
            {s.title}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {s.demoSubtitle}
          </p>
        </div>

        {/* Sandbox/Production durum bandı */}
        {providerStage === "sandbox" || providerStage === "unknown" ? (
          <div className="rounded-[20px] border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3" data-testid="payment-stage-banner">
            <AlertTriangle className="h-5 w-5 text-amber-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-normal text-amber-100">{s.sandboxBannerTitle}</p>
              <p className="text-xs text-slate-200 mt-1">
                {s.sandboxBannerBody}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-[20px] border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3" data-testid="payment-stage-banner">
            <CheckCircle2 className="h-5 w-5 text-emerald-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-normal text-emerald-100">{s.prodBannerTitle}</p>
              <p className="text-xs text-slate-200 mt-1">
                {s.prodBannerBody}
              </p>
            </div>
          </div>
        )}

        {/* Hata mesajı */}
        {error ? (
          <div className="rounded-[20px] border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3" data-testid="payment-error">
            <AlertTriangle className="h-5 w-5 text-rose-300 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-100">{error}</p>
          </div>
        ) : null}

        {/* Demo modu bilgi mesajı — hata değil, bilgilendirme */}
        {infoMessage ? (
          <div className="rounded-[20px] border border-cyan-500/30 bg-cyan-500/10 p-4 flex items-start gap-3" data-testid="payment-demo-info">
            <Sparkles className="h-5 w-5 text-cyan-300 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-cyan-100">{infoMessage}</p>
          </div>
        ) : null}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sol: Form */}
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
            <div className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-5 space-y-4">
              <h2 className="text-base font-normal text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-cyan-400" />
                {s.cardSectionTitle}
              </h2>

              <div className="space-y-2">
                <Label htmlFor="cardName" className="text-slate-400">{s.cardName}</Label>
                <Input
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder={s.cardNamePlaceholder}
                  autoComplete="cc-name"
                  maxLength={50}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-slate-400">{s.cardNumber}</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder={s.cardNumberPlaceholder}
                  autoComplete="cc-number"
                  inputMode="numeric"
                  maxLength={19}
                  required
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-slate-400">{s.cardExpiry}</Label>
                  <Input
                    id="expiry"
                    value={expiry}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setExpiry(v.length >= 3 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
                    }}
                    placeholder={s.cardExpiryPlaceholder}
                    autoComplete="cc-exp"
                    inputMode="numeric"
                    maxLength={5}
                    required
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc" className="text-slate-400">{s.cardCvc}</Label>
                  <Input
                    id="cvc"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder={s.cardCvcPlaceholder}
                    autoComplete="cc-csc"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5"
                  required
                />
                <span className="text-xs text-slate-300 leading-relaxed">
                  <button type="button" onClick={() => navigate("/kvkk")} className="text-cyan-300 underline">KVKK</button> — {s.acceptKvkk}
                </span>
              </label>

              <Button
                type="submit"
                disabled={!canSubmit || loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-normal py-3"
                data-testid="payment-submit-btn"
              >
                {loading ? (
                  <>{s.paying}</>
                ) : (
                  <>
                    <Lock className="h-4 w-4 me-1.5" />
                    <span dir="ltr">{formatTry(price)} {period}</span>&nbsp;{s.payBtn}
                  </>
                )}
              </Button>
              {!paymentsEnabled ? (
                <p className="text-[11px] text-cyan-300 text-center flex items-center justify-center gap-1" data-testid="payment-disabled-note">
                  <Sparkles className="h-3 w-3" /> {s.demoDisabledMessage}
                </p>
              ) : null}

              <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                <Shield className="h-3 w-3" />
                {s.pciNote}
              </p>
            </div>
          </form>

          {/* Sağ: Özet */}
          <div className="space-y-4">
            <div className="rounded-[20px] border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-slate-900/50 p-5">
              <p className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> {s.summarySelected}
              </p>
              <h3 className="text-xl font-normal text-white mb-1">{t.tierData.byId[tier.id]?.name ?? tier.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{t.tierData.byId[tier.id]?.tagline ?? tier.tagline}</p>

              <div className="border-t border-slate-700 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>{s.summaryPeriod}</span>
                  <span className="text-white">{cycle === "yearly" ? s.cycleYearly : s.cycleMonthly}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>{s.summaryListingLimit}</span>
                  <span className="text-white">{tier.listingLimit === "unlimited" ? "∞" : `${tier.listingLimit}/yıl`}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>{s.summaryTeam}</span>
                  <span className="text-white">{tier.teamSeats === "unlimited" ? "∞" : tier.teamSeats}</span>
                </div>
              </div>

              <div className="border-t border-slate-700 mt-3 pt-3 space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-400 text-sm">{s.summaryTotal}</span>
                  <div className="text-end" dir="ltr">
                    <span className="text-2xl font-normal text-cyan-300">{formatTry(price)}</span>
                    <span className="text-xs text-slate-400 ms-1">{period}</span>
                  </div>
                </div>
                {fxRef && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-500">{s.summaryFxRef} ({currency})</span>
                    <p className="text-[11px] text-amber-300/80" dir="ltr">
                      ≈ {fxRef} <span className="text-slate-500">{s.feeNote}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-4 space-y-2 text-xs">
              <p className="font-normal text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> {s.guaranteesTitle}
              </p>
              <ul className="space-y-1 text-slate-300">
                <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5" /> {s.guarantees.d14}</li>
                <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5" /> {s.guarantees.cancel}</li>
                <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5" /> {s.guarantees.kvkk}</li>
                <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5" /> {s.guarantees.ssl}</li>
              </ul>
            </div>

            {/* Apple App Store Review 5.1.1 + Google Play uyumlu — auto-renewal disclosure */}
            <div className="rounded-[20px] border border-amber-500/30 bg-amber-500/5 p-4 space-y-2 text-xs" data-testid="auto-renewal-disclosure">
              <p className="font-normal text-amber-200 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" /> {s.autoRenewalTitle}
              </p>
              <ul className="space-y-1.5 text-slate-300 leading-relaxed">
                <li>{s.autoRenewal.renewal}</li>
                <li>{s.autoRenewal.cancel}</li>
                <li>{s.autoRenewal.refund}</li>
              </ul>
              <p className="text-[10px] text-slate-500 italic pt-2 border-t border-amber-500/20">
                {s.autoRenewalLaw}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/iletisim")}
              className="w-full rounded-[20px] border border-violet-500/30 bg-violet-500/5 p-3 text-start hover:bg-violet-500/10 transition-colors"
            >
              <p className="text-xs text-violet-300 font-normal flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> {s.corporateTitle}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {s.corporateDesc}
              </p>
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 text-center pt-2 leading-relaxed">
          {s.footerDemo}
        </p>
      </div>
    </main>
  );
}
