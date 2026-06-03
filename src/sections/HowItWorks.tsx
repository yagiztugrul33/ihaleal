import { Search, Shield, Gavel, Trophy } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const STEP_ICONS = [Search, Shield, Gavel, Trophy] as const;

export function HowItWorks() {
  const { t } = useLocale();
  const how = t.home.how;
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section id="howItWorks" className="ref-section section-shell py-20 lg:py-28">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mb-14 text-center transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <h2 className="ref-section-title">{how.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">{how.subtitle}</p>
        </div>

        <div className="ref-steps-grid relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {how.steps.map((step, idx) => {
            const Icon = STEP_ICONS[idx] ?? Search;
            const num = String(idx + 1).padStart(2, "0");
            return (
              <div
                key={step.title}
                className={`ref-step-card glass-card group text-start transition-all duration-500 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <span className="ref-step-num">{num}</span>
                <div className="ref-step-icon-wrap ref-step-icon-glow">
                  <Icon className="h-7 w-7 text-blue-400" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-bold text-white transition-colors group-hover:text-blue-300">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
