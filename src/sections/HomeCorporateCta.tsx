import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES } from "@/constants/routes";
import { ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function HomeCorporateCta() {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section className="ref-section py-16 lg:py-24">
      <motion.div
        ref={ref}
        className={`mx-auto max-w-4xl px-4 sm:px-6 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="ref-cta-panel text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">Kurumsal</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Kurumsal hesabınızı oluşturun
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-400">
            Emlak ofisi, GYO veya yatırım grubu için kurumsal çözümler. 30 dakikalık demo görüşmesi planlayın.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to={ROUTES.SERVICES} className="ref-btn-primary">
              Kurumsal Çözümler
              <ArrowRight className="rtl:rotate-180 h-4 w-4" aria-hidden />
            </Link>
            <Link to="/kurumsal/iletisim" className="ref-btn-secondary">
              Demo Talep Et
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
