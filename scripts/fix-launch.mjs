import fs from "fs";
const trust = `import { motion } from "framer-motion";
import { Shield, Lock, Award, Globe2 } from "lucide-react";

const BADGES = [
  { icon: Shield, label: "ISO 27001", sub: "Bilgi g\u00fcvenli\u011fi" },
  { icon: Lock, label: "SOC 2 Type II", sub: "Operasyonel g\u00fcven" },
  { icon: Award, label: "KVKK uyumlu", sub: "Veri koruma" },
  { icon: Globe2, label: "Kurumsal SLA", sub: "7/24 altyap\u0131" },
] as const;

const PARTNERS = ["JLL", "CBRE", "Colliers", "Knight Frank", "Savills", "EY"] as const;

export function TrustStrip() {
  return (
    <section className="trust-strip-section border-y border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="trust-strip-label text-center">D\u00fcnya \u00e7ap\u0131nda kurumlar\u0131n g\u00fcvendi\u011fi altyap\u0131</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 md:gap-10 opacity-50">
          {PARTNERS.map((name) => (
            <span key={name} className="text-sm font-semibold tracking-widest text-slate-400 md:text-base">{name}</span>
          ))}
        </div>
        <motion.div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BADGES.map(({ icon: Icon, label, sub }) => (
            <motion.div key={label} className="trust-badge-card" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Icon className="h-5 w-5 shrink-0 text-blue-400" aria-hidden />
              <div>
                <p className="text-sm font-bold text-white">{label}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
`.replace(/<motion\.motion\.motion\.motion\.motion\.div/g,'<motion.div').replace(/motion\.div/g,'motion.div');
fs.writeFileSync("src/sections/TrustStrip.tsx", trust, "utf8");

const land = `import { Navigate } from "react-router-dom";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";

export default function LandInvestmentPage() {
  return <Navigate to={INTELLIGENCE_HUB_PATH} replace />;
}
`;
fs.writeFileSync("src/pages/intelligence/LandInvestmentPage.tsx", land, "utf8");
console.log("ok");