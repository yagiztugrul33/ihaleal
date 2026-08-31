import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, X, AlertTriangle, ChevronDown, ChevronUp, BookOpen, Info, Shield,
  CheckCircle2, Sparkles, ScrollText, Scale, RefreshCw, Mail, Building2,
  User, Briefcase, Users, Crown,
} from "lucide-react";
import {
  PRICING_TIERS, type BillingCycle, type TierId, type PricingTier,
  priceFor, earlyPriceFor, dailyEquivalent,
  formatTry, YEARLY_DISCOUNT_RATE,
  EARLY_MEMBER_ACTIVE, EARLY_MEMBER_LABEL, EARLY_MEMBER_NOTE,
} from "@/lib/pricingTiers";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLocale } from "@/contexts/LocaleContext";

/** Tier rengi → tailwind sınıfları */
function accentClasses(accent: PricingTier["accent"]) {
  return {
    // Individual (free) — Bone Card yüzeyi (Factory: açık kart, koyu canvas üstünde).
    // Diğer 4 tier koyu/şeffaf zeminde kaldığı için özel bir vurgu rengine
    // ihtiyaç yok; text/border/bg mevcut kart tokenlarına (bg-card/border-border/
    // text-card-foreground) bağlanır — yeni renk değeri YOK.
    slate: {
      light: true,
      border: "border-border",
      bg: "bg-card",
      text: "text-card-foreground",
      ring: "ring-slate-400/30",
      btn: "bg-slate-700 hover:bg-slate-600 text-white",
      badge: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    },
    // Carbon Lift — emlak_baslangic/emlak_pro/kurumsal artık AYNI nötr koyu yüzeyi
    // paylaşır (Factory: kromatik renk sadece canlı-veri sinyali için ayrılmış,
    // "hangi tier" bilgisi renkle değil metin/yapıyla taşınır). Eskiden
    // emerald/blue/amber/violet olan 4 ayrı renkli yüzey tek "carbon" oldu.
    carbon: {
      light: false,
      border: "border-[var(--cizgi)]",
      bg: "bg-[var(--zemin-yumusak)]",
      text: "text-white",
      ring: "ring-border",
      btn: "bg-primary hover:bg-primary/80 text-white",
      badge: "bg-[var(--zemin)] text-white border-[var(--cizgi)]",
    },
  }[accent];
}

/** Tier ikon */
function TierIcon({ tier }: { tier: PricingTier }) {
  if (tier.segment === "bireysel") return <User className="h-5 w-5" />;
  if (tier.segment === "emlakci" && tier.id === "emlak_pro") return <Crown className="h-5 w-5" />;
  if (tier.segment === "emlakci") return <Users className="h-5 w-5" />;
  return <Building2 className="h-5 w-5" />;
}

interface TierCardProps {
  tier: PricingTier;
  cycle: BillingCycle;
  expanded: boolean;
  onToggle: () => void;
}

function TierCard({ tier, cycle, expanded, onToggle }: TierCardProps) {
  const navigate = useNavigate();
  const cls = accentClasses(tier.accent);
  // Bone Card (Individual) metin renkleri: koyu-kart varsayımıyla yazılmış
  // sabit sınıfların (text-white/slate-400/slate-500/slate-200/slate-600)
  // açık-kart karşılıkları. Diğer 4 tier (!cls.light) BİREBİR eskisi gibi kalır.
  const priceText = cls.light ? "text-card-foreground" : "text-white";
  const mutedText = cls.light ? "text-muted-foreground" : "text-slate-400";
  const subtleText = cls.light ? "text-muted-foreground" : "text-slate-500";
  const featureText = cls.light ? "text-card-foreground" : "text-slate-200";
  const excludedText = cls.light ? "text-muted-foreground" : "text-slate-600";
  // Dahil/sınırlı özellik tikleri ve genişletilmiş liste ayırıcısı da aynı
  // şekilde koyu-kart varsayımıyla yazılmıştı; bugüne kadar yalnızca
  // global-acik.css'in örtük bg-card bağlamı sayesinde doğru görünüyorlardı.
  // Durum renklerini doğrudan token'dan (aynı anlam: dahil/sınırlı) çekiyoruz.
  const includedIconColor = cls.light ? "text-[var(--durum-basari)]" : "text-emerald-400";
  const limitedIconColor = cls.light ? "text-[var(--durum-uyari)]" : "text-amber-400";
  const dividerBorder = cls.light ? "border-border" : "border-slate-700";
  const { try: listPrice, period } = priceFor(tier, cycle);
  const early = earlyPriceFor(tier, cycle);
  const effectivePrice = early?.try ?? listPrice;
  const monthlyEqv = cycle === "yearly" && tier.monthlyTry > 0
    ? Math.round(effectivePrice / 12)
    : null;
  const daily = dailyEquivalent(tier, cycle);
  // Çoklu kur referans gösterim — TAHSILAT ₺, gösterim seçili kurda "≈"
  const { currency, formatFromTry } = useCurrency();
  const showFx = currency !== "TRY" && effectivePrice > 0;
  const fxRef = showFx ? formatFromTry(effectivePrice) : null;
  const { t } = useLocale();
  const p = t.pricing;

  return (
    <div
      className={`relative rounded-2xl border ${tier.highlight ? "border-2 border-foreground/30" : cls.border} ${cls.bg} p-5 flex flex-col`}
    >
      {tier.highlight && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-semibold border ${cls.badge}`}>
          <Sparkles className="h-3 w-3 inline me-1" />
          {tier.highlight}
        </div>
      )}

      <div className={`flex items-center gap-2 ${cls.text} mb-1`}>
        <TierIcon tier={tier} />
        <h3 className="text-lg font-bold">{t.tierData.byId[tier.id]?.name ?? tier.name}</h3>
      </div>
      <p className={`text-xs ${mutedText} mb-4 leading-relaxed min-h-[2rem]`}>{t.tierData.byId[tier.id]?.tagline ?? tier.tagline}</p>

      <div className="mb-4">
        {tier.customPricing ? (
          <div className={`text-3xl font-bold ${priceText}`}>{period}</div>
        ) : listPrice === 0 ? (
          <div className={`text-3xl font-bold ${priceText}`}>{p.tierCard.free}</div>
        ) : early ? (
          <>
            {/* ERKEN ÜYE — Liste fiyatı üst çizili + kuruluş fiyatı vurgulu */}
            <div className="flex items-baseline gap-2" dir="ltr">
              <span className={`text-sm ${subtleText} line-through`}>{formatTry(listPrice)}</span>
              <span className={`text-[10px] font-semibold ${cls.text} bg-white/5 px-1.5 py-0.5 rounded`}>
                {p.tierCard.early}
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1" dir="ltr">
              <span className={`text-3xl font-bold ${priceText}`}>{formatTry(early.try)}</span>
              <span className={`text-sm ${mutedText}`}>{early.period}</span>
            </div>
            {fxRef && (
              <p className="text-[11px] text-amber-300/80 mt-0.5" dir="ltr">≈ {fxRef} <span className={subtleText}>{p.tierCard.feeNote}</span></p>
            )}
            {monthlyEqv !== null && (
              <p className={`text-[11px] ${subtleText} mt-0.5`} dir="ltr">≈ {formatTry(monthlyEqv)}{p.tierCard.monthlyEqv}</p>
            )}
            {daily !== null && (
              <p className="text-[11px] text-emerald-300 mt-0.5" dir="ltr">{p.tierCard.dailyPrefix} {formatTry(daily)}</p>
            )}
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1" dir="ltr">
              <span className={`text-3xl font-bold ${priceText}`}>{formatTry(listPrice)}</span>
              <span className={`text-sm ${mutedText}`}>{period}</span>
            </div>
            {fxRef && (
              <p className="text-[11px] text-amber-300/80 mt-0.5" dir="ltr">≈ {fxRef} <span className={subtleText}>{p.tierCard.feeNote}</span></p>
            )}
            {monthlyEqv !== null && (
              <p className={`text-[11px] ${subtleText} mt-0.5`} dir="ltr">≈ {formatTry(monthlyEqv)}{p.tierCard.monthlyEqv}</p>
            )}
            {daily !== null && (
              <p className="text-[11px] text-emerald-300 mt-0.5" dir="ltr">{p.tierCard.dailyPrefix} {formatTry(daily)}</p>
            )}
          </>
        )}
      </div>

      {/* Top 5 özellik özeti (always visible) */}
      <ul className="space-y-1.5 mb-4 text-xs">
        {tier.features.slice(0, 5).map((f) => (
          <li key={f.label} className="flex items-start gap-2">
            {f.status === "included" ? (
              <Check className={`h-3.5 w-3.5 ${includedIconColor} flex-shrink-0 mt-0.5`} />
            ) : f.status === "limited" ? (
              <CheckCircle2 className={`h-3.5 w-3.5 ${limitedIconColor} flex-shrink-0 mt-0.5`} />
            ) : (
              <X className={`h-3.5 w-3.5 ${excludedText} flex-shrink-0 mt-0.5`} />
            )}
            <span className={f.status === "excluded" ? `${excludedText} line-through` : featureText}>
              {f.label}
              {f.limit && f.status !== "excluded" && (
                <span className={`ms-1 text-[10px] ${cls.text}`}>({f.limit})</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* Drill-down — kalan özellikler */}
      <button
        type="button"
        onClick={onToggle}
        className={`text-xs ${cls.text} flex items-center gap-1 mb-3 hover:underline`}
        aria-expanded={expanded}
        aria-label={expanded ? p.tierCard.hideDetails : p.tierCard.showAll}
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? p.tierCard.hideDetails : `${p.tierCard.showAll} (${tier.features.length})`}
      </button>

      {expanded && (
        <ul className={`space-y-2 mb-4 text-xs border-t ${dividerBorder} pt-3`}>
          {tier.features.map((f) => (
            <li key={f.label} className="space-y-0.5">
              <div className="flex items-start gap-2">
                {f.status === "included" ? (
                  <Check className={`h-3.5 w-3.5 ${includedIconColor} flex-shrink-0 mt-0.5`} />
                ) : f.status === "limited" ? (
                  <CheckCircle2 className={`h-3.5 w-3.5 ${limitedIconColor} flex-shrink-0 mt-0.5`} />
                ) : (
                  <X className={`h-3.5 w-3.5 ${excludedText} flex-shrink-0 mt-0.5`} />
                )}
                <span className={`font-medium ${f.status === "excluded" ? `${excludedText} line-through` : featureText}`}>
                  {f.label}
                  {f.limit && f.status !== "excluded" && (
                    <span className={`ms-1 text-[10px] ${cls.text}`}>({f.limit})</span>
                  )}
                </span>
              </div>
              {f.detail && f.status !== "excluded" && (
                <p className={`text-[11px] ${subtleText} ms-5 leading-relaxed`}>{f.detail}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-2 space-y-2">
        <button
          type="button"
          onClick={() =>
            navigate(
              tier.id === "free"
                ? "/kayit"
                : tier.customPricing
                  ? "/kurumsal/iletisim"
                  : `/odeme/baslat?paket=${tier.id}&periyot=${cycle}`,
            )
          }
          className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm ${cls.btn}`}
        >
          {tier.id === "free" ? p.tierCard.ctaFree : tier.customPricing ? "İletişime Geç" : p.tierCard.ctaSelect}
        </button>
        <p className={`text-[10px] ${subtleText} text-center`}>
          {tier.id === "kurumsal" ? p.tierCard.corporateNote : p.tierCard.cancelNote}
        </p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [expandedTier, setExpandedTier] = useState<TierId | null>(null);
  const { t } = useLocale();
  const p = t.pricing;

  const yearlySavings = useMemo(
    () => PRICING_TIERS.filter((t) => t.monthlyTry > 0 && !t.customPricing).map((t) => ({
      name: t.name,
      saving: Math.round(t.monthlyTry * 12 * YEARLY_DISCOUNT_RATE),
    })),
    [],
  );

  const totalYearlySaving = yearlySavings.reduce((acc, x) => acc + x.saving, 0);

  return (
    <main className="min-h-screen pt-24 pb-16 text-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 mb-4">
            <Sparkles className="h-3.5 w-3.5" /> {p.badge}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {p.title}
          </h1>
          <p className="text-slate-400 leading-relaxed mb-4">
            {p.subtitle}
            <strong className="text-white"> {p.yearlyDiscountNote} −{YEARLY_DISCOUNT_RATE * 100}%</strong>.
          </p>
          {/* ŞEFFAFLIK ŞERİDİ — header altına yakın, güven inşası */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-300">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {p.chips.noCommit}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1">
              <RefreshCw className="h-3.5 w-3.5 text-cyan-400" /> {p.chips.cancelAnytime}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1">
              <Shield className="h-3.5 w-3.5 text-violet-400" /> {p.chips.noHidden}
            </span>
          </div>
        </div>

        {EARLY_MEMBER_ACTIVE && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-300 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-sm font-semibold text-amber-100">{EARLY_MEMBER_LABEL}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-100 text-[10px] font-semibold px-2 py-0.5 border border-amber-500/30">
                    Sınırlı
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{EARLY_MEMBER_NOTE}</p>
              </div>
            </div>
          </div>
        )}

        {/* KATMAN 1 — Eğitici: Hangi paket sana uygun? (Bone Card — monokrom, tek vurgu) */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start gap-3 mb-4">
            <BookOpen className="h-5 w-5 text-card-foreground flex-shrink-0 mt-0.5" />
            <h2 className="text-base font-semibold text-card-foreground">{p.segmentTitle}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Not: bg-black/[…] / bg-white/[…] KULLANMA — global-acik.css bunları
                !important ile koyu zemine (var(--zemin-yumusak)) çeviriyor. Bone
                Card üstünde nötr ayrım için sadece hairline border kullanılır. */}
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold text-card-foreground mb-1 flex items-center gap-1.5">
                <User className="h-4 w-4" /> {p.segments.individual.title}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {p.segments.individual.desc}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold text-card-foreground mb-1 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> {p.segments.investor.title}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {p.segments.investor.desc}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold text-card-foreground mb-1 flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {p.segments.realtor.title}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {p.segments.realtor.desc}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="font-semibold text-card-foreground mb-1 flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> {p.segments.corporate.title}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {p.segments.corporate.desc}
              </p>
            </div>
          </div>
        </div>

        {/* TOGGLE — Aylık/Yıllık */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-slate-700 bg-slate-900/60 p-1">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${cycle === "monthly" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
              aria-pressed={cycle === "monthly"}
            >
              {p.toggle.monthly}
            </button>
            <button
              type="button"
              onClick={() => setCycle("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors relative ${cycle === "yearly" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
              aria-pressed={cycle === "yearly"}
            >
              {p.toggle.yearly}
              <span className="ms-2 text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded">−{YEARLY_DISCOUNT_RATE * 100}%</span>
            </button>
          </div>
        </div>

        {/* KATMAN 2/3 — PAKET TABLOSU (responsive grid) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PRICING_TIERS.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              cycle={cycle}
              expanded={expandedTier === tier.id}
              onToggle={() => setExpandedTier(expandedTier === tier.id ? null : tier.id)}
            />
          ))}
        </div>

        {cycle === "yearly" && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
            <p className="text-sm text-emerald-200">
              <Sparkles className="inline h-4 w-4 me-1" />
              {p.yearlySavings}: <strong className="text-white" dir="ltr">{formatTry(totalYearlySaving)}</strong>
            </p>
          </div>
        )}

        {/* KATMAN 4 — GÜVEN: iade + iptal + SSS + KVKK */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">{p.trustHeader}</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* İade Politikası */}
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/40 p-5">
              <div className="flex items-start gap-2 mb-3">
                <RefreshCw className="h-5 w-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-white">{p.refundTitle}</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{p.refund.d14}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{p.refund.cancel}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{p.refund.upgrade}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{p.refund.delete}</span>
                </li>
              </ul>
            </div>

            {/* SSS */}
            <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/40 p-5">
              <div className="flex items-start gap-2 mb-3">
                <Info className="h-5 w-5 text-cyan-300 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-white">{p.faqTitle}</h3>
              </div>
              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <p className="font-semibold text-cyan-200 mb-1">{p.faq.paymentQ}</p>
                  <p>{p.faq.paymentA}</p>
                </div>
                <div>
                  <p className="font-semibold text-cyan-200 mb-1">{p.faq.commissionQ}</p>
                  <p>{p.faq.commissionA} <button type="button" onClick={() => navigate("/komisyon")} className="text-cyan-300 underline">/komisyon</button>.</p>
                </div>
                <div>
                  <p className="font-semibold text-cyan-200 mb-1">{p.faq.priceQ}</p>
                  <p>{p.faq.priceA}</p>
                </div>
                <div>
                  <p className="font-semibold text-cyan-200 mb-1">{p.faq.kvkkQ}</p>
                  <p>{p.faq.kvkkA} <button type="button" onClick={() => navigate("/kvkk")} className="text-cyan-300 underline">KVKK</button>.</p>
                </div>
              </div>
            </div>

            {/* Mevzuat */}
            <div className="rounded-2xl border border-violet-500/20 bg-slate-900/40 p-5 md:col-span-2">
              <div className="flex items-start gap-2 mb-3">
                <Scale className="h-5 w-5 text-violet-300 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-white">{p.legalTitle}</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg border border-violet-400/15 bg-slate-900/30 p-3">
                  <p className="font-semibold text-violet-300 mb-1">{p.legal.distanceSale.title}</p>
                  <p className="text-slate-300">{p.legal.distanceSale.desc}</p>
                </div>
                <div className="rounded-lg border border-violet-400/15 bg-slate-900/30 p-3">
                  <p className="font-semibold text-violet-300 mb-1">{p.legal.kvkk.title}</p>
                  <p className="text-slate-300">{p.legal.kvkk.desc}</p>
                </div>
                <div className="rounded-lg border border-violet-400/15 bg-slate-900/30 p-3">
                  <p className="font-semibold text-violet-300 mb-1">{p.legal.payment.title}</p>
                  <p className="text-slate-300">{p.legal.payment.desc}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Güven rozetleri */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-slate-900/40 px-3 py-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              {p.trustBadges.refund}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-slate-900/40 px-3 py-1">
              <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
              {p.trustBadges.cancel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-slate-900/40 px-3 py-1">
              <Shield className="h-3.5 w-3.5 text-violet-400" />
              {p.trustBadges.compliant}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-slate-900/40 px-3 py-1">
              <ScrollText className="h-3.5 w-3.5 text-amber-400" />
              {p.trustBadges.noContract}
            </span>
          </div>

          {/* İletişim CTA */}
          <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 text-center">
            <AlertTriangle className="h-6 w-6 text-amber-300 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-white mb-1">{p.corporateTitle}</h3>
            <p className="text-xs text-slate-300 mb-4">
              {p.corporateDesc}
            </p>
            <button
              type="button"
              onClick={() => navigate("/iletisim")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold"
            >
              <Mail className="h-4 w-4" /> {p.corporateCta}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
