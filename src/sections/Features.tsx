import { Radio, ShieldCheck, Eye, Zap, Headphones, BarChart3, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const icons = {
  live: <Radio className="w-6 h-6 text-blue-400" />,
  secure: <ShieldCheck className="w-6 h-6 text-teal-400" />,
  transparent: <Eye className="w-6 h-6 text-purple-400" />,
  fast: <Zap className="w-6 h-6 text-amber-400" />,
  support: <Headphones className="w-6 h-6 text-pink-400" />,
  analytics: <BarChart3 className="w-6 h-6 text-green-400" />,
  valuation: <Calculator className="w-6 h-6 text-cyan-300" />,
};

export function Features() {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const items = ["live", "secure", "transparent", "fast", "support", "analytics", "valuation"] as const;
  const titles = {
    live: "Canlı İhale Deneyimi",
    secure: "Banka Düzeyinde Güvenlik",
    transparent: "Şeffaf Süreç",
    fast: "Hızlı Teslimat",
    support: "7/24 Destek",
    analytics: "AI Destekli Analiz",
    valuation: "Degerleme araci",
  };
  const descs = {
    live: "Gerçek zamanlı teklif verme, anlık güncellemeler ve adil rekabet ortamı.",
    secure: "SSL şifreleme, 3D Secure ödeme ve hukuki garanti altında işlemler.",
    transparent: "Her adım açık ve denetlenebilir. Gizli maliyet yok, sürpriz yok.",
    fast: "İhale sonrası tapu ve teslimat süreçlerinde hızlı çözüm ortaklığı.",
    support: "Uzman ekibimiz her an yanınızda. Telefon, e-posta ve canlı sohbet.",
    analytics: "Yapay zeka ile fiyat tahmini, yatırım skoru ve bölge karşılaştırması.",
    valuation: "Il, ilce, m² ve ozelliklerle dakikalar icinde deger ve kira tahmini al.",
  };
  const links = {
    live: undefined,
    secure: undefined,
    transparent: undefined,
    fast: undefined,
    support: undefined,
    analytics: undefined,
    valuation: "/degerleme",
  };

  return (
    <section className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-[#0a0f1e]" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Neden Bizi Tercih Etmelisiniz?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Yatırım dünyasında fark yaratan özelliklerimizle tanışın.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((key, idx) => (
            <div key={key} className={`group relative p-6 rounded-2xl bg-slate-900/45 border border-white/[0.07] hover:border-blue-400/25 hover:bg-slate-900/65 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-20px_rgba(59,130,246,0.18)] ring-1 ring-transparent hover:ring-blue-500/15 motion-reduce:hover:translate-y-0 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${idx * 100}ms` }}>
              <div className="mb-4 p-3 rounded-xl bg-white/[0.06] w-fit ring-1 ring-white/[0.06] group-hover:bg-white/10 group-hover:scale-105 transition-all duration-300 motion-reduce:group-hover:scale-100">{icons[key]}</div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{titles[key]}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{descs[key]}</p>
              {links[key] ? (
                <Link to={links[key]} className="mt-3 inline-flex text-sm text-cyan-300 hover:text-cyan-200">
                  Araci ac
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
