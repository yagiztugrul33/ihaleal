import { motion } from "framer-motion";
import { Building2, Lock, Scale, ShieldCheck } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motionProps } from "@/lib/motion/presets";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Banka düzeyi güvenlik",
    detail: "Şifreleme, 3DS ve AML/KYC katmanları kurumsal standartta hedeflenir.",
  },
  {
    icon: Scale,
    title: "Şeffaf ihale süreci",
    detail: "Her adım denetlenebilir; gizli maliyet ve sürpriz yükümlülük yok.",
  },
  {
    icon: Building2,
    title: "Kurumsal altyapı",
    detail: "GYO, banka ve emlak ofisleri için çok kiracılı portföy yönetimi.",
  },
  {
    icon: Lock,
    title: "Uyumluluk hazırlığı",
    detail: "KVKK, MASAK ve sözleşme paketleri üretim yol haritasında.",
  },
];

export function InvestorTrustStrip({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  const mp = motionProps(reduced);

  return (
    <motion.section
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-6 ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={mp.staggerContainer}
    >
      <motion.div variants={mp.staggerItem} className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">Kurumsal güven</p>
        <h3 className="text-xl font-bold text-white mt-1">Yatırımcılar ve kurumlar için tasarlandı</h3>
      </motion.div>
      <motion.div className="grid sm:grid-cols-2 gap-4">
        {TRUST_ITEMS.map((item) => (
          <motion.div key={item.title} variants={mp.staggerItem}>
            <div className="flex gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.03]">
              <item.icon className="w-5 h-5 text-blue-400 shrink-0" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-200">{item.detail}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
