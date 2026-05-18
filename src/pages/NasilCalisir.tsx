import { useLayoutEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Layers,
  Search,
  Handshake,
  Trophy,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  NASIL_CALISIR_ARCHITECTURE,
  NASIL_CALISIR_INTRO,
  NASIL_CALISIR_STEPS,
  type NasilCalisirStepSlug,
} from "@/data/nasilCalisirContent";
import { FEES, formatBidBondPercent } from "@/lib/fees";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const STEP_ICONS = {
  kesfet: Search,
  teklif: Handshake,
  kazan: Trophy,
  teslim: KeyRound,
} as const;

function isStepSlug(v: string | null): v is NasilCalisirStepSlug {
  return v === "kesfet" || v === "teklif" || v === "kazan" || v === "teslim";
}

export default function NasilCalisir() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const adımParam = searchParams.get("adım");
  const fromCta = searchParams.get("from") === "cta";
  const { ref: heroRef, isVisible } = useScrollAnimation(0.08);
  const scrolledRef = useRef(false);

  useLayoutEffect(() => {
    if (!isStepSlug(adımParam)) return;
    const id = `step-${adımParam}`;
    const el = document.getElementById(id);
    if (!el) return;
    const t = window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: scrolledRef.current ? "smooth" : "auto", block: "start" });
      scrolledRef.current = true;
    });
    return () => window.cancelAnimationFrame(t);
  }, [adımParam]);

  const setAdim = (slug: NasilCalisirStepSlug) => {
    setSearchParams({ adım: slug }, { replace: false });
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] pt-20 pb-20 text-slate-200">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

      <div ref={heroRef} className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="text-slate-500 hover:text-slate-900 gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Ana sayfa
        </Button>

        <div
          className={`mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <Badge className="mb-2 bg-white/10 text-cyan-200 border-cyan-400/30">Rehber</Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {NASIL_CALISIR_INTRO.title}
              </h1>
              <p className="text-slate-400 mt-3 text-lg leading-relaxed max-w-3xl">{NASIL_CALISIR_INTRO.lead}</p>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-3xl">{NASIL_CALISIR_INTRO.audience}</p>
            </div>
          </div>

          {fromCta && (
            <Card className="mb-8 border-amber-500/25 bg-amber-500/5">
              <CardContent className="pt-6 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-100">İhale listesine geçmeden önce</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Bu sayfa platformun dört adımını, rolleri ve referans süreleri özetler. Hazır olduğunuzda aşağıdaki
                    düğme ile canlı ilanlara gidebilirsiniz.
                  </p>
                  <Button
                    className="mt-4 gap-2 bg-gradient-to-r from-blue-600 to-cyan-400"
                    onClick={() => navigate("/ihaleler")}
                  >
                    İhale listesine git
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="secondary" className="gap-2 bg-white/10 hover:bg-white/15 border border-slate-200" asChild>
              <Link to="/ihaleler">
                Canlı ihaleler <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="ghost" className="text-slate-300" asChild>
              <Link to="/rehber">Yardım merkezi</Link>
            </Button>
            <Button variant="ghost" className="text-slate-300" asChild>
              <Link to="/ihale-kosullari">İhale koşulları</Link>
            </Button>
          </div>
        </div>

        <Card className="mb-12 border-slate-200 bg-white/[0.03] backdrop-blur-sm">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Referans iş kuralları (yapılandırma)
            </h2>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Arayüz ve yardım metinleri aşağıdaki merkezi sabitlerle uyumludur; üretim öncesi hukuk ve muhasebe onayı
              gerekir.
            </p>
            <ul className="text-sm text-slate-300 space-y-2 list-disc pl-5">
              <li>
                Kazanan taraf için teminat referansı: <strong className="text-white">{formatBidBondPercent()}</strong>{" "}
                (bid bond yüzdesi; detay <code className="text-cyan-300 text-xs">fees.ts</code>)
              </li>
              <li>
                Bakiye tamamlama penceresi (taslak referans):{" "}
                <strong className="text-white">{FEES.refundWindowDays} gün</strong>
              </li>
              <li>Son dakika tekliflerinde süre uzatma ve beraberlik kuralları ilan şartnamesinde netleştirilir.</li>
            </ul>
          </CardContent>
        </Card>

        <section className="mb-16" id="mimari">
          <h2 className="text-2xl font-bold text-white mb-2">{NASIL_CALISIR_ARCHITECTURE.title}</h2>
          <p className="text-slate-400 mb-6 leading-relaxed">{NASIL_CALISIR_ARCHITECTURE.flowSummary}</p>
          <div className="grid md:grid-cols-2 gap-4">
            {NASIL_CALISIR_ARCHITECTURE.layers.map((layer) => (
              <Card key={layer.name} className="border-slate-200 bg-white/[0.04]">
                <CardContent className="pt-5 pb-5">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Katman</div>
                  <h3 className="text-white font-semibold mb-2">{layer.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{layer.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <pre className="mt-6 p-4 rounded-xl bg-black/40 border border-slate-200 text-xs text-slate-400 overflow-x-auto font-mono leading-relaxed">
            {`[Kullanıcı] → [Web istemcisi] → [Kural motoru + doğrulama]
                    ↓
            [İlan / teklif kaydı] ←→ [Bildirim servisi] → e-posta / uygulama içi
                    ↓
            [Kapanış] → [Kazanan atama] → [Ödeme ve tapu süreçleri — sözleşme]`}
          </pre>
        </section>

        <div className="sticky top-20 z-20 -mx-4 px-4 py-3 mb-10 bg-[#0f1729]/90 backdrop-blur-md border border-slate-700/50 rounded-xl">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Adımlar</p>
          <div className="flex flex-wrap gap-2">
            {NASIL_CALISIR_STEPS.map((s) => {
              const Icon = STEP_ICONS[s.slug];
              const active = adımParam === s.slug;
              return (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => setAdim(s.slug)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/40"
                      : "bg-white/5 text-slate-500 hover:text-slate-900 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {s.stepNum}. {s.title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-20">
          {NASIL_CALISIR_STEPS.map((step) => {
            const Icon = STEP_ICONS[step.slug];
            return (
              <section key={step.slug} id={`step-${step.slug}`} className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center ring-1 ring-white/10">
                    <Icon className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Adım {step.stepNum}</div>
                    <h2 className="text-2xl font-bold text-white">{step.title}</h2>
                    <p className="text-slate-400 text-sm">{step.tagline}</p>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed mb-8">{step.intro}</p>

                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  {step.userJourney.map((block) => (
                    <Card key={block.title} className="border-slate-200 bg-white/[0.03]">
                      <CardContent className="pt-5 pb-5">
                        <h3 className="text-white font-semibold mb-3">{block.title}</h3>
                        <ul className="space-y-2 text-sm text-slate-400 list-disc pl-5">
                          {block.bullets.map((b) => (
                            <li key={b} className="leading-relaxed">
                              {b}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {step.platformSide.map((block) => (
                  <Card key={block.title} className="border-cyan-500/20 bg-cyan-500/5 mb-6">
                    <CardContent className="pt-5 pb-5">
                      <h3 className="text-cyan-100 font-semibold mb-3">{block.title}</h3>
                      {block.paragraphs.map((p) => (
                        <p key={p} className="text-sm text-slate-400 leading-relaxed mb-2 last:mb-0">
                          {p}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                ))}

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <Card className="border-slate-200">
                    <CardContent className="pt-5 pb-5">
                      <h3 className="text-white font-semibold mb-2 text-sm">Veri ve güven</h3>
                      <ul className="text-sm text-slate-400 space-y-2 list-disc pl-5">
                        {step.dataAndTrust.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-amber-500/15 bg-amber-500/[0.03]">
                    <CardContent className="pt-5 pb-5">
                      <h3 className="text-amber-100 font-semibold mb-2 text-sm">Risk ve sınırlar</h3>
                      <ul className="text-sm text-slate-400 space-y-2 list-disc pl-5">
                        {step.risksAndLimits.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">İlgili sayfalar</h3>
                  <div className="flex flex-wrap gap-2">
                    {step.relatedRoutes.map((r) => (
                      <Button key={r.path + r.label} variant="secondary" size="sm" className="bg-white/5 border-slate-200" asChild>
                        <Link to={r.path}>
                          {r.label}
                          {r.note ? ` (${r.note})` : ""}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sık sorulanlar</h3>
                  {step.faq.map((f) => (
                    <details key={f.q} className="group border border-slate-200 rounded-lg bg-white/[0.02] open:bg-white/[0.04]">
                      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-200 list-none flex justify-between items-center">
                        {f.q}
                        <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="px-4 pb-4 text-sm text-slate-400 leading-relaxed border-t border-slate-200/80 pt-3">{f.a}</div>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <Card className="mt-16 border-slate-200 bg-gradient-to-br from-blue-600/20 to-cyan-500/10">
          <CardContent className="pt-8 pb-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Hazırsanız ilanlara geçin</h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto mb-6">
              Filtreleri kullanın, ilan detayını okuyun ve kurallara uygun teklif verin. Sorularınız için yardım merkezine
              göz atın.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-400" asChild>
                <Link to="/ihaleler">
                  İhalelere göz at <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                <Link to="/rehber">SSS ve yardım</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
