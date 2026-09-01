import { motion } from "framer-motion";
import { Shield, Lock, Award } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const PARTNERS = ["JLL", "CBRE", "Colliers", "Knight Frank", "Cushman & Wakefield", "Savills", "EY"] as const;
const BADGE_ICONS = [Shield, Lock, Award] as const;

export function TrustStrip() {
  const { t } = useLocale();
  const trusted = t.home.trusted;

  return (
    <section className="trust-strip-section border-y border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="trust-strip-label text-center">{trusted.title}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 opacity-50 md:gap-10">
          {PARTNERS.map((name) => (
            <span key={name} className="text-sm font-normal tracking-widest text-slate-400 md:text-base">
              {name}
            </span>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {trusted.certs.map((cert, i) => {
            const Icon = BADGE_ICONS[i] ?? Shield;
            return (
              <motion.div
                key={cert.title}
                className="trust-badge flex-row gap-3 px-5 py-4"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Icon className="h-5 w-5 shrink-0 text-blue-400" aria-hidden />
                <div>
                  <p className="text-sm font-normal text-white">{cert.title}</p>
                  <p className="text-xs text-slate-400">{cert.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
