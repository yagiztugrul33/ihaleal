import { Search, HandCoins, Trophy, KeyRound, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export function HowItWorks() {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const steps = [
    { icon: <Search className="w-6 h-6 text-blue-400" />, title: "Keşfet", desc: "İlanları inceleyin, AI analiz raporlarını okuyun, size uygun fırsatı bulun." },
    { icon: <HandCoins className="w-6 h-6 text-teal-400" />, title: "Teklif Ver", desc: "Canlı ihaleye katılın veya kapalı teklif gönderin. Anlık bildirimlerle takip edin." },
    { icon: <Trophy className="w-6 h-6 text-purple-400" />, title: "Kazan", desc: "En yüksek teklifi verdiğinizde anında bildirim alın, süreci başlatın." },
    { icon: <KeyRound className="w-6 h-6 text-amber-400" />, title: "Teslim Al", desc: "Hukuki süreçlerde rehberlik, tapu işlemlerinde hızlı sonuç." },
  ];

  return (
    <section id="howItWorks" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1326] via-[#0a0f1e] to-[#0a0f1e]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Nasıl Çalışır?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Dört basit adımda yatırım fırsatına ortak olun.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-[4.5rem] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-blue-500/30 via-teal-500/30 to-purple-500/30" />
          {steps.map((s, idx) => (
            <div key={idx} className={`relative text-center group ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${idx * 150}ms`, transitionDuration: "700ms" }}>
              <div className="relative z-10 mx-auto w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mb-5 group-hover:border-blue-500/30 group-hover:bg-slate-800 transition-all shadow-lg shadow-black/20">{s.icon}</div>
              <div className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider">Adım {idx + 1}</div>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className={`text-center mt-16 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <a href="#auctions" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-bold text-sm transition-colors">Hemen İhalelere Göz At<ArrowRight className="w-4 h-4" /></a>
        </div>
      </div>
    </section>
  );
}
