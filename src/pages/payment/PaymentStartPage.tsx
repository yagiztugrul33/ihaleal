import { useState, useMemo } from "react";
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

export default function PaymentStartPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setLocalTier } = useMembershipTier();
  const paketParam = params.get("paket") as TierId | null;
  const periyotParam = params.get("periyot") as BillingCycle | null;

  const tier = useMemo(() => PRICING_TIERS.find((t) => t.id === paketParam) ?? PRICING_TIERS[1], [paketParam]);
  const cycle: BillingCycle = periyotParam === "yearly" ? "yearly" : "monthly";
  const { try: price, period } = priceFor(tier, cycle);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = cardName.trim().length >= 3 && cardNumber.replace(/\s/g, "").length >= 12 && expiry.length >= 4 && cvc.length >= 3 && acceptedTerms;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    // MOCK ödeme — gerçek iyzico/PayTR entegrasyonu MASTER hesap açınca eklenecek
    setTimeout(() => {
      setLocalTier(tier.id);
      navigate(`/odeme/basarili?paket=${tier.id}&periyot=${cycle}`);
    }, 1500);
  };

  // Kart numarası formatla (4 digit boşluk)
  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.match(/.{1,4}/g)?.join(" ") ?? digits;
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/fiyatlandirma")}
          className="text-slate-500 hover:text-white gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Paketlere dön
        </Button>

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-cyan-400" />
            Ödeme
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            <strong className="text-amber-300">Demo / Mock</strong> — gerçek ödeme entegrasyonu eklenecek (iyzico / PayTR).
          </p>
        </div>

        {/* MOCK uyarı */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-100">Demo Ödeme Akışı</p>
            <p className="text-xs text-slate-200 mt-1">
              Bu sayfa <strong>gerçek ödeme yapmaz</strong>. Form gönderilince tier'iniz tarayıcı localStorage'ına yazılır
              (test için). Gerçek ödeme entegrasyonu (iyzico / PayTR) MASTER hesap + API key sağlayınca eklenecek.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sol: Form */}
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5 space-y-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-cyan-400" />
                Kart Bilgileri
              </h2>

              <div className="space-y-2">
                <Label htmlFor="cardName" className="text-slate-400">Kart üzerindeki isim</Label>
                <Input
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="AHMET YILMAZ"
                  autoComplete="cc-name"
                  maxLength={50}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-slate-400">Kart numarası</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  autoComplete="cc-number"
                  inputMode="numeric"
                  maxLength={19}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-slate-400">Son kullanım (AA/YY)</Label>
                  <Input
                    id="expiry"
                    value={expiry}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setExpiry(v.length >= 3 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
                    }}
                    placeholder="12/28"
                    autoComplete="cc-exp"
                    inputMode="numeric"
                    maxLength={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc" className="text-slate-400">CVC</Label>
                  <Input
                    id="cvc"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    autoComplete="cc-csc"
                    inputMode="numeric"
                    maxLength={4}
                    required
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
                  <button type="button" onClick={() => navigate("/kvkk")} className="text-cyan-300 underline">KVKK Aydınlatma Metni</button>'ni okudum ve onaylıyorum.
                  Ödeme + abonelik koşullarını (TKHK 14 gün cayma + iptal hakkı) kabul ediyorum.
                </span>
              </label>

              <Button
                type="submit"
                disabled={!canSubmit || loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3"
              >
                {loading ? (
                  <>İşleniyor...</>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-1.5" />
                    {formatTry(price)} {period} öde (demo)
                  </>
                )}
              </Button>

              <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                <Shield className="h-3 w-3" />
                3D Secure + KVKK + 6493 uyumlu — kart bilgileri saklanmaz, doğrudan banka tokenize.
              </p>
            </div>
          </form>

          {/* Sağ: Özet */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-slate-900/50 p-5">
              <p className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Seçilen paket
              </p>
              <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{tier.tagline}</p>

              <div className="border-t border-slate-700 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Periyot</span>
                  <span className="text-white">{cycle === "yearly" ? "Yıllık" : "Aylık"}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>İlan limiti</span>
                  <span className="text-white">{tier.listingLimit === "unlimited" ? "∞" : `${tier.listingLimit}/yıl`}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Ekip</span>
                  <span className="text-white">{tier.teamSeats === "unlimited" ? "∞" : tier.teamSeats}</span>
                </div>
              </div>

              <div className="border-t border-slate-700 mt-3 pt-3 flex items-baseline justify-between">
                <span className="text-slate-400 text-sm">Toplam</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-cyan-300">{formatTry(price)}</span>
                  <span className="text-xs text-slate-400 ml-1">{period}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 space-y-2 text-xs">
              <p className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Güvenceler
              </p>
              <ul className="space-y-1 text-slate-300">
                <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5" /> 14 gün ücretsiz iade (TKHK)</li>
                <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5" /> İstediğin zaman iptal</li>
                <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5" /> KVKK + 6493 uyumlu</li>
                <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5" /> SSL + 3D Secure</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => navigate("/iletisim")}
              className="w-full rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 text-left hover:bg-violet-500/10 transition-colors"
            >
              <p className="text-xs text-violet-300 font-semibold flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Kurumsal teklif?
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                10+ ekip, API entegrasyon, mini-site için özel paket — iletişime geç.
              </p>
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 text-center pt-2 leading-relaxed">
          Bu sayfa <strong className="text-amber-300">DEMO</strong>'dur. Gerçek ödeme entegrasyonu (iyzico / PayTR) Master hesap+API key sağlayınca eklenecek.
          <br />
          Tüm sözleşme + cayma koşulları: <button type="button" onClick={() => navigate("/kvkk")} className="text-cyan-300 underline">KVKK</button> · 6098 BK · 6502 TKHK · 6493 Ödeme · 5549 MASAK.
        </p>
      </div>
    </main>
  );
}
