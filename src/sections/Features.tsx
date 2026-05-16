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
    <section className="relative py-24 lg:py-32 section-warm-alt">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/15 rounded-full blur-[120px]" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="section-heading mb-4">Neden Bizi Tercih Etmelisiniz?</h2>
          <p className="section-subtitle mx-auto">Yatırım dünyasında fark yaratan özelliklerimizle tanışın.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((key, idx) => (
            <div key={key} className={`card-warm group ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${idx * 100}ms` }}>
              <div className="mb-4 p-3 rounded-xl w-fit" style={{ background: "var(--color-bg-soft)" }}>{icons[key]}</div>
              <h3 className="text-lg font-bold mb-2 text-slate-900">{titles[key]}</h3>
              <p className="text-sm leading-relaxed text-slate-700">{descs[key]}</p>
              {links[key] ? (
                <Link to={links[key]} className="mt-3 inline-flex text-sm font-medium" style={{ color: "var(--color-primary)" }}>
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
