import { Gavel, Users, Banknote, MapPin } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function Stats() {
  const { ref, isVisible } = useScrollAnimation(0.2);
  return (
    <section className="relative py-24">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[var(--zemin-yumusak)] rounded-full blur-[120px]" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="section-heading mb-4">Rakamlarla Gücümüz</h2>
          <p className="section-subtitle mx-auto">Yılların getirdiği tecrübe ve güvenle büyümeye devam ediyoruz.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Gavel className="w-6 h-6 text-[var(--metin-ikincil)]" />, value: "3.420", label: "Tamamlanan İhale", color: "bg-[var(--zemin-yumusak)]" },
            { icon: <Users className="w-6 h-6 text-[var(--metin-ikincil)]" />, value: "12.847", label: "Memnun Yatırımcı", color: "bg-[var(--zemin-yumusak)]" },
            { icon: <Banknote className="w-6 h-6 text-[var(--metin-ikincil)]" />, value: "₺1.846M+", label: "İşlem Hacmi", color: "bg-[var(--zemin-yumusak)]" },
            { icon: <MapPin className="w-6 h-6 text-[var(--metin-ikincil)]" />, value: "34", label: "Şehir", color: "bg-[var(--zemin-yumusak)]" },
          ].map((s, idx) => (
            <div key={idx} className={`stat-card-institutional ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${idx * 120}ms` }}>
              <div className="flex items-center justify-between mb-4"><div className="p-2.5 rounded-[20px] ring-1 group-hover:scale-105 transition-all duration-300 motion-reduce:group-hover:scale-100" style={{ background: "var(--color-bg-soft)", borderColor: "var(--color-border)" }}>{s.icon}</div><div className="h-1 w-10 rounded-full bg-gradient-to-r from-[var(--color-border)] to-[var(--color-primary)] group-hover:w-14 transition-all duration-500" /></div>
              <div className="text-3xl lg:text-4xl font-normal mb-1" style={{ color: "var(--color-primary)" }}>{s.value}</div>
              <div className="text-sm font-normal" style={{ color: "var(--color-text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
