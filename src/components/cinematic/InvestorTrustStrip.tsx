import { motion } from "framer-motion";
import { Building2, Lock, Scale, ShieldCheck } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motionProps } from "@/lib/motion/presets";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Banka düzeyi güvenlik",
    detail: "Sifreleme, 3DS ve AML/KYC katmanlari kurumsal standartta hedeflenir.",
  },
  {
    icon: Scale,
    title: "Seffaf ihale sureci",
    detail: "Her adım denetlenebilir; gizli maliyet ve surpriz yukumluluk yok.",
  },
  {
    icon: Building2,
    title: "Kurumsal altyapi",
    detail: "GYO, banka ve emlak ofisleri icin cok kiracili portfoy yonetimi.",
  },
  {
    icon: Lock,
    title: "Uyumluluk hazirligi",
    detail: "KVKK, MASAK ve sozlesme paketleri uretim yol haritasinda.",
  },
];

export function InvestorTrustStrip({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const mp = motionProps(reduced);

  return (
    <motion.section
      className={`rounded-[20px] border border-white/10 bg-white/[0.03] p-6 ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={mp.staggerContainer}
    >
      <motion.div variants={mp.staggerItem} className="mb-6">
        <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-slate-500">Kurumsal güven</p>
        <h3 className="text-xl font-normal text-white mt-1">Yatirimcilar ve kurumlar icin tasarlandi</h3>
      </motion.div>
      <motion.div className="grid sm:grid-cols-2 gap-4">
        {TRUST_ITEMS.map((item) => (
          <motion.div key={item.title} variants={mp.staggerItem}>
            <div className="flex gap-3 p-4 rounded-[20px] border border-white/10 bg-white/[0.03]">
              <item.icon className="w-5 h-5 text-[var(--metin-ikincil)] shrink-0" aria-hidden />
              <div>
                <p className="text-sm font-normal text-white">{item.title}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.detail}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
