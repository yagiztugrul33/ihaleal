import { Search, Handshake, Trophy, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
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
    { key: "discover" as const, num: "01", title: "Keşfet", desc: "İlanları inceleyin, AI analiz raporlarını okuyun" },
    { key: "bid" as const, num: "02", title: "Teklif Ver", desc: "Canlı ihaleye katılın veya kapalı teklif gönderin" },
    { key: "win" as const, num: "03", title: "Kazan", desc: "En yüksek teklifi verdiğinizde anında bildirim alın" },
    { key: "handover" as const, num: "04", title: "Teslim Al", desc: "Hukuki süreçlerde rehberlik ve tapu desteği" },
  ];

  return (
    <section id="howItWorks" className="ref-section py-20 lg:py-28">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mb-14 text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="ref-section-title">Nasıl Çalışır?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Dört adımda şeffaf, güvenli ve veri odaklı ihale deneyimi.
          </p>
        </div>

        <div className="ref-steps-grid relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, idx) => {
            const Icon = StepIcon[s.key];
            return (
              <button
                type="button"
                key={s.key}
                onClick={() => navigate(ROUTES.HOW_IT_WORKS)}
                className={`ref-step-card group text-left transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <span className="ref-step-num">{s.num}</span>
                <div className="ref-step-icon-wrap">
                  <Icon className="h-7 w-7 text-blue-400" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
