import { Radio, ShieldCheck, Eye, Zap, Headphones, BarChart3, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const FEATURE_ICONS = {
  live: Radio,
  secure: ShieldCheck,
  transparent: Eye,
  fast: Zap,
  support: Headphones,
  analytics: BarChart3,
  valuation: Calculator,
} as const;

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
    valuation: "Değerleme Aracı",
  };
  const descs = {
    live: "Gerçek zamanlı teklif verme, anlık güncellemeler ve adil rekabet ortamı.",
    secure: "SSL şifreleme, 3D Secure ödeme ve hukuki garanti altında işlemler.",
    transparent: "Her adım açık ve denetlenebilir. Gizli maliyet yok, sürpriz yok.",
    fast: "İhale sonrası tapu ve teslimat süreçlerinde hızlı çözüm ortaklığı.",
    support: "Uzman ekibimiz her an yanınızda. Telefon, e-posta ve canlı sohbet.",
    analytics: "Yapay zeka ile fiyat tahmini, yatırım skoru ve bölge karşılaştırması.",
    valuation: "İl, ilçe, m² ve özelliklerle dakikalar içinde değer ve kira tahmini alın.",
  };
  const links: Partial<Record<(typeof items)[number], string>> = {
    valuation: "/degerleme",
  };

  return (
    <section className="relative py-24 lg:py-32">
      <div ref={ref} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mb-16 text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="badge-corp mb-4">Kurumsal avantajlar</p>
          <h2 className="section-heading mb-4">Neden İhaleal?</h2>
          <p className="section-subtitle mx-auto">
            Yüksek değerli gayrimenkul işlemleri için kurumsal güven, AI zekası ve şeffaf süreç.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((key, idx) => {
            const Icon = FEATURE_ICONS[key];
            return (
              <div
                key={key}
                className={`card-luxury group ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="feature-icon-ring mb-4">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{titles[key]}</h3>
                <p className="text-sm leading-relaxed text-slate-300">{descs[key]}</p>
                {links[key] ? (
                  <Link to={links[key]!} className="btn-tertiary mt-4 inline-flex">
                    Aracı aç
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}