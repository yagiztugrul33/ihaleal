import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check, X, AlertTriangle, ChevronDown, ChevronUp, BookOpen, Info, Shield,
  CheckCircle2, Sparkles, ScrollText, Scale, RefreshCw, Mail, Building2,
  User, Briefcase, Users, Crown,
} from "lucide-react";
import {
  PRICING_TIERS, type BillingCycle, type TierId, type PricingTier,
  priceFor, formatTry, YEARLY_DISCOUNT_RATE,
} from "@/lib/pricingTiers";

/** Tier rengi → tailwind sınıfları */
function accentClasses(accent: PricingTier["accent"]) {
  return {
    slate: {
      border: "border-slate-500/30",
      bg: "from-slate-500/5",
      text: "text-slate-300",
      ring: "ring-slate-400/30",
      btn: "bg-slate-700 hover:bg-slate-600 text-white",
      badge: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    },
    emerald: {
      border: "border-emerald-500/30",
      bg: "from-emerald-500/5",
      text: "text-emerald-300",
      ring: "ring-emerald-400/30",
      btn: "bg-emerald-600 hover:bg-emerald-500 text-white",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
    blue: {
      border: "border-blue-500/30",
      bg: "from-blue-500/5",
      text: "text-blue-300",
      ring: "ring-blue-400/30",
      btn: "bg-blue-600 hover:bg-blue-500 text-white",
      badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    amber: {
      border: "border-amber-500/30",
      bg: "from-amber-500/5",
      text: "text-amber-300",
      ring: "ring-amber-400/30",
      btn: "bg-amber-600 hover:bg-amber-500 text-white",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    violet: {
      border: "border-violet-500/30",
      bg: "from-violet-500/5",
      text: "text-violet-300",
      ring: "ring-violet-400/30",
      btn: "bg-violet-600 hover:bg-violet-500 text-white",
      badge: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    },
  }[accent];
}

/** Tier ikon */
function TierIcon({ tier }: { tier: PricingTier }) {
  if (tier.segment === "bireysel") return <User className="h-5 w-5" />;
  if (tier.segment === "yatirimci") return <Briefcase className="h-5 w-5" />;
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
  const { try: price, period } = priceFor(tier, cycle);
  const monthlyEqv = cycle === "yearly" && tier.monthlyTry > 0
    ? Math.round(price / 12)
    : null;

  return (
    <div
      className={`relative rounded-2xl border ${cls.border} bg-gradient-to-br ${cls.bg} to-slate-900/60 p-5 flex flex-col ${tier.highlight ? `ring-2 ${cls.ring} shadow-xl` : ""}`}
    >
      {tier.highlight && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-semibold border ${cls.badge}`}>
          <Sparkles className="h-3 w-3 inline mr-1" />
          {tier.highlight}
        </div>
      )}

      <div className={`flex items-center gap-2 ${cls.text} mb-1`}>
        <TierIcon tier={tier} />
        <h3 className="text-lg font-bold">{tier.name}</h3>
      </div>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed min-h-[2rem]">{tier.tagline}</p>

      <div className="mb-4">
        {price === 0 ? (
          <div className="text-3xl font-bold text-white">Ücretsiz</div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">{formatTry(price)}</span>
              <span className="text-sm text-slate-400">{period}</span>
            </div>
            {monthlyEqv !== null && (
              <p className="text-[11px] text-slate-500 mt-0.5">≈ {formatTry(monthlyEqv)}/ay (yıllık -%20)</p>
            )}
          </>
        )}
      </div>

      {/* Top 5 özellik özeti (always visible) */}
      <ul className="space-y-1.5 mb-4 text-xs">
        {tier.features.slice(0, 5).map((f) => (
          <li key={f.label} className="flex items-start gap-2">
            {f.status === "included" ? (
              <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : f.status === "limited" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <X className="h-3.5 w-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
            )}
            <span className={f.status === "excluded" ? "text-slate-600 line-through" : "text-slate-200"}>
              {f.label}
              {f.limit && f.status !== "excluded" && (
                <span className={`ml-1 text-[10px] ${cls.text}`}>({f.limit})</span>
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
        aria-label={expanded ? "Detayları gizle" : "Detayları göster"}
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? "Detayları gizle" : `Tüm özellikleri gör (${tier.features.length})`}
      </button>

      {expanded && (
        <ul className="space-y-2 mb-4 text-xs border-t border-slate-700 pt-3">
          {tier.features.map((f) => (
            <li key={f.label} className="space-y-0.5">
              <div className="flex items-start gap-2">
                {f.status === "included" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : f.status === "limited" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="h-3.5 w-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
                )}
                <span className={`font-medium ${f.status === "excluded" ? "text-slate-600 line-through" : "text-slate-200"}`}>
                  {f.label}
                  {f.limit && f.status !== "excluded" && (
                    <span className={`ml-1 text-[10px] ${cls.text}`}>({f.limit})</span>
                  )}
                </span>
              </div>
              {f.detail && f.status !== "excluded" && (
                <p className="text-[11px] text-slate-500 ml-5 leading-relaxed">{f.detail}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-2 space-y-2">
        <button
          type="button"
          onClick={() => navigate(tier.id === "free" ? "/kayit" : `/odeme/baslat?paket=${tier.id}&periyot=${cycle}`)}
          className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm ${cls.btn}`}
        >
          {tier.id === "free" ? "Ücretsiz Başla" : "Paketi Seç"}
        </button>
        <p className="text-[10px] text-slate-500 text-center">
          {tier.id === "kurumsal" ? "Demo + özel teklif için iletişime geç" : "İstediğin zaman iptal — sözleşme yok"}
        </p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [expandedTier, setExpandedTier] = useState<TierId | null>(null);

  const yearlySavings = useMemo(
    () => PRICING_TIERS.filter((t) => t.monthlyTry > 0).map((t) => ({
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
            <Sparkles className="h-3.5 w-3.5" /> Fiyatlandırma
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            İhtiyacına göre paket seç
          </h1>
          <p className="text-slate-400 leading-relaxed">
            Bireyselden kurumsala 5 paket — istediğin zaman yükselt, düşür veya iptal et.
            <strong className="text-white"> Yıllık ödemede %{YEARLY_DISCOUNT_RATE * 100} indirim</strong>.
          </p>
        </div>

        {/* KATMAN 1 — Eğitici: Hangi paket sana uygun? */}
        <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/5 to-slate-900/40 p-5">
          <div className="flex items-start gap-3 mb-4">
            <BookOpen className="h-5 w-5 text-cyan-300 flex-shrink-0 mt-0.5" />
            <h2 className="text-base font-semibold text-white">Hangi paket sana uygun?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg border border-slate-500/15 bg-slate-900/30 p-3">
              <p className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="h-4 w-4" /> Bireysel alıcı/satıcı
              </p>
              <p className="text-slate-400 leading-relaxed">
                Evini satıp ihaleye çıkarmak veya ihalede ev/arsa almak isteyenler.
                Bireysel paket yeterli.
              </p>
            </div>
            <div className="rounded-lg border border-blue-500/15 bg-slate-900/30 p-3">
              <p className="font-semibold text-blue-300 mb-1 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> Yatırımcı
              </p>
              <p className="text-slate-400 leading-relaxed">
                Düzenli yatırım kararı veren — borsa terminel + sınırsız rapor + gerçek kapanış verisi
                + AI fırsat bildirimi gerekli.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-500/15 bg-slate-900/30 p-3">
              <p className="font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Emlakçı / Ofis
              </p>
              <p className="text-slate-400 leading-relaxed">
                Yeni başlayan ofis → <strong>Başlangıç</strong>, büyüyen profesyonel ofis → <strong>Pro</strong>.
                Doping + öncelik + ekip yönetimi.
              </p>
            </div>
            <div className="rounded-lg border border-violet-500/15 bg-slate-900/30 p-3">
              <p className="font-semibold text-violet-300 mb-1 flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> Kurumsal
              </p>
              <p className="text-slate-400 leading-relaxed">
                Zincir ofisi, portföy fonu, müteahhit firma → API + mini-site + beyaz etiket PDF + 10 ekip + öncelikli destek.
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
              Aylık
            </button>
            <button
              type="button"
              onClick={() => setCycle("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors relative ${cycle === "yearly" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
              aria-pressed={cycle === "yearly"}
            >
              Yıllık
              <span className="ml-2 text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded">-%{YEARLY_DISCOUNT_RATE * 100}</span>
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
              <Sparkles className="inline h-4 w-4 mr-1" />
              Yıllık ödemede tüm paketlerde <strong className="text-white">toplam {formatTry(totalYearlySaving)}</strong> indirim — peşin ödeme.
            </p>
          </div>
        )}

        {/* KATMAN 4 — GÜVEN: iade + iptal + SSS + KVKK */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Güven, İade ve Sıkça Sorulanlar</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* İade Politikası */}
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/40 p-5">
              <div className="flex items-start gap-2 mb-3">
                <RefreshCw className="h-5 w-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-white">İade Politikası</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-emerald-200">14 gün ücretsiz iade:</strong> Yeni aboneliklerde
                    ilk 14 gün içinde iade hakkı (TKHK 16. madde — mesafeli satış).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-emerald-200">İstediğin zaman iptal:</strong> Sözleşme yok, kullanım
                    dönemini bitir, otomatik yenilenmesin.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-emerald-200">Yükselt/Düşür:</strong> Tier değişimi anında geçerli;
                    aradaki fark prorate edilir.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-emerald-200">Hesap silme:</strong> Verilerin KVKK kapsamında 30 gün
                    içinde anonimleştirilir (faturalar yasal 10 yıl saklanır).
                  </span>
                </li>
              </ul>
            </div>

            {/* SSS */}
            <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/40 p-5">
              <div className="flex items-start gap-2 mb-3">
                <Info className="h-5 w-5 text-cyan-300 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-white">Sıkça Sorulanlar</h3>
              </div>
              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <p className="font-semibold text-cyan-200 mb-1">Ödeme nasıl alınacak?</p>
                  <p>iyzico / PayTR (gelecek). Kredi kartı + havale opsiyonu. 3D Secure zorunlu.</p>
                </div>
                <div>
                  <p className="font-semibold text-cyan-200 mb-1">Komisyon nasıl çalışıyor?</p>
                  <p>Satış değerine kademeli: 0-3M %3, 3-10M %2.5, 10M+ %2. Üyelik fiyatlarına ek.</p>
                </div>
                <div>
                  <p className="font-semibold text-cyan-200 mb-1">Fiyat değişir mi?</p>
                  <p>Pazar testi süresinde — şimdilik bu fiyatlar. Mevcut abonelerin fiyatı 12 ay sabit.</p>
                </div>
                <div>
                  <p className="font-semibold text-cyan-200 mb-1">KVKK?</p>
                  <p>Tam uyumlu — Supabase EU Frankfurt, sızıntı bildirimi 72 saat, veri imha 30 gün.
                    Detay: <button type="button" onClick={() => navigate("/kvkk")} className="text-cyan-300 underline">KVKK metni</button>.</p>
                </div>
              </div>
            </div>

            {/* Mevzuat */}
            <div className="rounded-2xl border border-violet-500/20 bg-slate-900/40 p-5 md:col-span-2">
              <div className="flex items-start gap-2 mb-3">
                <Scale className="h-5 w-5 text-violet-300 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-white">Yasal Çerçeve</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg border border-violet-400/15 bg-slate-900/30 p-3">
                  <p className="font-semibold text-violet-300 mb-1">Mesafeli Satış</p>
                  <p className="text-slate-300">
                    6502 sayılı TKHK m. 48 — 14 gün cayma hakkı yazılı tüketici bildirimi ile.
                  </p>
                </div>
                <div className="rounded-lg border border-violet-400/15 bg-slate-900/30 p-3">
                  <p className="font-semibold text-violet-300 mb-1">KVKK Uyum</p>
                  <p className="text-slate-300">
                    6698 sayılı KVKK — kişisel veri saklama, anonimleştirme, ihlal bildirimi 72 saat.
                  </p>
                </div>
                <div className="rounded-lg border border-violet-400/15 bg-slate-900/30 p-3">
                  <p className="font-semibold text-violet-300 mb-1">Ödeme Hizmeti</p>
                  <p className="text-slate-300">
                    6493 sayılı Ödeme + Menkul Kıymet Mutabakat Sistemleri Kanunu — emanet/escrow uyumlu.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Güven rozetleri */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-slate-900/40 px-3 py-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              14 gün ücretsiz iade
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-slate-900/40 px-3 py-1">
              <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
              İstediğin zaman iptal
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-slate-900/40 px-3 py-1">
              <Shield className="h-3.5 w-3.5 text-violet-400" />
              KVKK + 6493 uyumlu
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-slate-900/40 px-3 py-1">
              <ScrollText className="h-3.5 w-3.5 text-amber-400" />
              Sözleşme yok
            </span>
          </div>

          {/* İletişim CTA */}
          <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 text-center">
            <AlertTriangle className="h-6 w-6 text-amber-300 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-white mb-1">Kurumsal teklif veya özel pazarlık?</h3>
            <p className="text-xs text-slate-300 mb-4">
              50+ kullanıcı / API entegrasyonu / mini-site / beyaz etiket PDF için özel paket — bizimle iletişime geç.
            </p>
            <button
              type="button"
              onClick={() => navigate("/iletisim")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold"
            >
              <Mail className="h-4 w-4" /> İletişime geç
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
