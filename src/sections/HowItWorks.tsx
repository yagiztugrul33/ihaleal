import { ArrowRight, Search, Handshake, Trophy, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const StepIcon = {
  discover: Search,
  bid: Handshake,
  win: Trophy,
  handover: KeyRound,
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
    <section id="howItWorks" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#071022] via-[#0a0f1e] to-[#061428]" />
      <div className="absolute bottom-0 left-0 w-[560px] h-[440px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-breathe motion-reduce:animate-none opacity-70" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">Nasıl Çalışır?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">Dört adımda gayrimenkul ihale yolculuğunuzu tamamlayın.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-[5rem] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent motion-reduce:hidden" />
          {steps.map((s, idx) => {
            const Icon = StepIcon[s.key];
            return (
              <div
                key={s.key}
                className={`relative text-center group rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 hover:border-cyan-400/35 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-16px_rgba(34,211,238,0.18)] motion-reduce:hover:translate-y-0 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: `${idx * 120}ms`, transitionDuration: "700ms" }}
              >
                <div className="flex justify-center mb-4">
                  <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] p-4 ring-1 ring-white/10 group-hover:ring-cyan-400/25 group-hover:scale-105 transition-all duration-300 motion-reduce:group-hover:scale-100">
                    <Icon className="w-9 h-9 text-cyan-300" aria-hidden />
                  </div>
                </div>
                <div className="text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider">Adım {idx + 1}</div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-100 transition-colors">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
        <div className={`text-center mt-16 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <button
            type="button"
            onClick={() => navigate("/ihaleler")}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-cyan-500/25 border border-white/10 hover:shadow-cyan-400/35 hover:scale-[1.02] active:scale-[0.99] motion-reduce:hover:scale-100"
          >
            Hemen İhalelere Göz At
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
