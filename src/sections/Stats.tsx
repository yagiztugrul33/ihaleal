import { Gavel, Users, Banknote, MapPin } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function Stats() {
  const { ref, isVisible } = useScrollAnimation(0.2);
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[#0d1326]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Rakamlarla Gücümüz</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Yılların getirdiği tecrübe ve güvenle büyümeye devam ediyoruz.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Gavel className="w-6 h-6 text-blue-400" />, value: "3.420", label: "Tamamlanan İhale", color: "from-blue-500/20 to-blue-600/5" },
            { icon: <Users className="w-6 h-6 text-teal-400" />, value: "12.847", label: "Memnun Yatırımcı", color: "from-teal-500/20 to-teal-600/5" },
            { icon: <Banknote className="w-6 h-6 text-purple-400" />, value: "₺1.846M+", label: "İşlem Hacmi", color: "from-purple-500/20 to-purple-600/5" },
            { icon: <MapPin className="w-6 h-6 text-amber-400" />, value: "34", label: "Şehir", color: "from-amber-500/20 to-amber-600/5" },
          ].map((s, idx) => (
            <div key={idx} className={`relative group rounded-2xl p-6 bg-gradient-to-br ${s.color} border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-1 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${idx * 120}ms` }}>
              <div className="flex items-center justify-between mb-4"><div className="p-2.5 rounded-xl bg-white/5">{s.icon}</div><div className="h-1 w-8 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors" /></div>
              <div className="text-3xl lg:text-4xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-sm text-slate-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
