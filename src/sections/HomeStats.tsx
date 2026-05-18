import { useEffect, useState } from "react";
import { Gavel, TrendingUp, Users, Star } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const TARGETS = { auctions: 12458, sales: 3127, investors: 10843, satisfaction: 98 } as const;

const METRICS = [
  { key: "auctions" as const, label: "Toplam İhale", icon: Gavel, color: "text-blue-400", bg: "bg-blue-500/15" },
  { key: "sales" as const, label: "Başarılı Satış", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  { key: "investors" as const, label: "Aktif Yatırımcı", icon: Users, color: "text-violet-400", bg: "bg-violet-500/15" },
  { key: "satisfaction" as const, label: "Memnuniyet", icon: Star, color: "text-amber-400", bg: "bg-amber-500/15" },
];

export function HomeStats() {
  const { ref, isVisible } = useScrollAnimation(0.12);
  const [stats, setStats] = useState({ auctions: 0, sales: 0, investors: 0, satisfaction: 0 });

  useEffect(() => {
    if (!isVisible) return;
    let step = 0;
    const id = window.setInterval(() => {
      step += 1;
      const p = Math.min(1, step / 48);
      setStats({
        auctions: Math.floor(TARGETS.auctions * p),
        sales: Math.floor(TARGETS.sales * p),
        investors: Math.floor(TARGETS.investors * p),
        satisfaction: Math.floor(TARGETS.satisfaction * p),
      });
      if (step >= 48) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [isVisible]);

  return (
    <section className="ref-section py-12 lg:py-16">
      <div ref={ref} className={"mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-700 " + (isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((m, idx) => {
            const Icon = m.icon;
            const raw = stats[m.key];
            const display = m.key === "satisfaction" ? raw + "%" : raw.toLocaleString("tr-TR");
            return (
              <div key={m.key} className="ref-metric-card" style={{ transitionDelay: idx * 60 + "ms" }}>
                <div className={"ref-metric-icon " + m.bg}>
                  <Icon className={"h-5 w-5 " + m.color} aria-hidden />
                </div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{m.label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">{display}</p>
                <p className="mt-1 text-xs font-semibold text-emerald-400">+{((idx + 1) * 2.1).toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}