import { motion } from "framer-motion";
import { Shield, Lock, Award } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const BADGE_ICONS = [Shield, Lock, Award] as const;
const TRUST_FACTS = [
  { label: "İşlem Hacmi", value: "₺12.8B+" },
  { label: "Doğrulanmış Kullanıcı", value: "68.9K+" },
  { label: "Escrow/KYC Uyum", value: "%96.4" },
  { label: "Denetim Sertifikası", value: "ISO 27001 (Demo)" },
] as const;

export function TrustStrip() {
  const { t } = useLocale();
  const trusted = t.home.trusted;

  return (
    <section className="trust-strip-section border-y border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="trust-strip-label text-center">{trusted.title}</p>
        <p className="mt-2 text-center text-xs text-slate-400">
          Kurumsal güven göstergeleri (demo): yanıltıcı marka logosu yerine ölçülebilir metrikler paylaşılır.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_FACTS.map((fact) => (
            <div key={fact.label} className="rounded-2xl border border-white/10 bg-slate-900/65 px-4 py-4 text-center">
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">{fact.label}</p>
              <strong className="mt-1 block text-xl font-black text-white">{fact.value}</strong>
            </div>
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
                  <p className="text-sm font-bold text-white">{cert.title}</p>
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
