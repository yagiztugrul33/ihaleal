import { ArrowRight, Search, Handshake, Trophy, KeyRound, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const StepIcon = {
  discover: Search,
  bid: Handshake,
  win: Trophy,
  handover: KeyRound,
} as const;

const STEP_GUIDE_SLUG = {
  discover: "kesfet",
  bid: "teklif",
  win: "kazan",
  handover: "teslim",
} as const;

export function HowItWorks() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.1);
  const steps = [
    {
      key: "discover" as const,
      title: "Keşfet",
      desc: "İlanları inceleyin, AI analiz raporlarını okuyun",
    },
    {
      key: "bid" as const,
      title: "Teklif Ver",
      desc: "Canlı ihaleye katılın veya kapalı teklif gönderin",
    },
    {
      key: "win" as const,
      title: "Kazan",
      desc: "En yüksek teklifi verdiğinizde anında bildirim",
    },
    {
      key: "handover" as const,
      title: "Teslim Al",
      desc: "Hukuki süreçlerde rehberlik, tapu işlemleri",
    },
  ];

  return (
    <section id="howItWorks" className="relative py-24 lg:py-32">
      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="badge-corp mb-4">Süreç</p>
          <h2 className="section-heading mb-4 tracking-tight">Nasıl Çalışır?</h2>
          <p className="section-subtitle mx-auto">Dört adımda kurumsal ihale yolculuğunuzu tamamlayın — şeffaf, güvenli ve veri odaklı.</p>
        </div>
        <div className="steps-rail grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-[5rem] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent motion-reduce:hidden" aria-hidden />
          {steps.map((s, idx) => {
            const Icon = StepIcon[s.key];
            const guideSlug = STEP_GUIDE_SLUG[s.key];
            return (
              <button
                type="button"
                key={s.key}
                onClick={() => navigate(`/nasil-calisir?adim=${guideSlug}`)}
                className={`step-card-premium relative text-left w-full group card-luxury p-6 transition-all duration-500 hover:-translate-y-1.5 motion-reduce:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: `${idx * 120}ms`, transitionDuration: "700ms" }}
              >
                <div className="flex justify-center mb-4">
                  <div className="step-icon-ring group-hover:scale-105 transition-transform duration-300 motion-reduce:group-hover:scale-100">
                    <Icon className="w-8 h-8 text-blue-400" aria-hidden />
                  </div>
                </div>
                <div className="text-xs font-bold mb-2 uppercase tracking-wider text-center text-blue-400">Adım {idx + 1}</div>
                <h3 className="text-lg font-bold mb-2 text-center text-white group-hover:text-blue-300 transition-colors">{s.title}</h3>
                <p className="text-sm leading-relaxed text-center text-slate-400">{s.desc}</p>
                <div className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-blue-400">
                  Detaylı rehber
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden />
                </div>
              </button>
            );
          })}
        </div>
        <div className={`text-center mt-16 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/nasil-calisir?from=cta")}
              className="btn-primary inline-flex items-center gap-2"
            >
              Hemen İhalelere Göz At
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => navigate("/ihaleler")}
              className="btn-ghost inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm"
            >
              Doğrudan ihale listesi
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-500 max-w-xl mx-auto">
            Birinci düğme platform sürecinin tamamını (adımlar, mimari, süreler, SSS) anlatır; içeriden canlı listeye geçebilirsiniz. Liste sayfasına doğrudan gitmek için ikinci düğmeyi kullanın.
          </p>
        </div>
      </div>
    </section>
  );
}
