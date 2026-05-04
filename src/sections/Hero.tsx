import { useNavigate } from "react-router-dom";
import {
  Play,
  TrendingUp,
  Users,
  BarChart3,
  Shield,
  BrainCircuit,
  Sparkles,
  Building2,
  Factory,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KkaRevenueHubStrip } from "@/components/KkaRevenueHubStrip";
import { heroRevenueStripLine } from "@/lib/masterFinancialEngine";

export function Hero() {
  const navigate = useNavigate();

  const stats = [
    {
      icon: TrendingUp,
      value: "1.247",
      label: "Aktif İhale",
      accent: "from-blue-500/25 to-cyan-500/10 border-blue-400/20",
      iconRing: "text-cyan-300",
    },
    {
      icon: Users,
      value: "8.452",
      label: "Kayıtlı Kullanıcı",
      accent: "from-cyan-500/20 to-blue-600/10 border-cyan-400/15",
      iconRing: "text-blue-300",
    },
    {
      icon: BarChart3,
      value: "₺386M",
      label: "Toplam Hacim",
      accent: "from-indigo-500/25 to-purple-500/10 border-violet-400/20",
      iconRing: "text-violet-300",
    },
    {
      icon: Shield,
      value: "%97",
      label: "Başarı Oranı",
      accent: "from-amber-500/20 to-orange-500/10 border-amber-400/25",
      iconRing: "text-amber-300",
    },
  ];

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-[#061428] via-[#0a162e] to-[#071018]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.22),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.18),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_rgba(129,140,248,0.08),_transparent_45%)]" />
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-soft-light"
          style={{
            backgroundImage:
              "linear-gradient(115deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(335deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px, 36px 36px",
          }}
        />
      </div>

      <div className="absolute top-24 left-1/4 w-[520px] h-[520px] bg-cyan-500/15 rounded-full blur-[140px] animate-breathe pointer-events-none motion-reduce:animate-none" />
      <div className="absolute bottom-10 right-0 w-[480px] h-[420px] bg-blue-600/12 rounded-full blur-[130px] pointer-events-none animate-float motion-reduce:animate-none opacity-80" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-1 text-center lg:order-2 lg:text-left lg:pl-4 xl:pl-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/15 backdrop-blur-md border border-cyan-400/35 text-cyan-100 text-xs font-bold uppercase tracking-wide mb-6 animate-fade-in-up shadow-lg shadow-blue-900/30 ring-1 ring-white/5">
              <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" aria-hidden />
              <span>İhaleal Endeksi</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.08] tracking-tight mb-6 animate-fade-in-up animate-delay-200">
              <span className="text-white block drop-shadow-sm">Gayrimenkul</span>
              <span className="block mt-1 bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent italic font-semibold animate-gradient-text">
                Canlı İhale Vitrini
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300/95 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up animate-delay-300">
              Şeffaf, hızlı ve güvenli ihale deneyimi. <strong className="text-white">İhaleal Endeksi</strong> ile teklif yoğunluğu, bölge bandı ve yapay zeka sinyallerini bir arada görün; gerçekçi karar için yatırım skoru ve senaryolar tek ekranda (demo veri).
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-in-up animate-delay-400">
              <Button
                size="lg"
                onClick={() => navigate("/analiz")}
                className="w-full sm:w-auto min-h-[3.25rem] h-auto py-3.5 bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-bold gap-2.5 px-10 text-lg shadow-2xl shadow-cyan-500/30 border border-white/15 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 motion-reduce:hover:scale-100"
              >
                <BrainCircuit className="w-6 h-6 shrink-0" aria-hidden />
                İhaleal Endeksi
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/ihaleler")}
                className="w-full sm:w-auto min-h-[3.25rem] h-auto py-3.5 border-white/25 bg-white/[0.08] backdrop-blur-md text-white hover:bg-white/15 hover:text-white hover:border-cyan-400/35 gap-2.5 px-10 text-lg transition-all duration-300 shadow-xl shadow-black/25 hover:shadow-black/35"
              >
                <Play className="w-5 h-5 fill-current opacity-90" aria-hidden />
                İhaleleri Keşfet
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-3 animate-fade-in-up animate-delay-400">
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => navigate("/giris?profil=emlakci")}
                className="min-h-11 border-teal-400/45 text-teal-50 bg-teal-500/15 hover:bg-teal-500/25 hover:text-white gap-2 px-5 font-semibold shadow-md shadow-teal-950/20"
              >
                <Building2 className="w-5 h-5 shrink-0" aria-hidden />
                Emlakçı Girişi
              </Button>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => navigate("/giris?profil=muteahhit")}
                className="min-h-11 border-amber-400/45 text-amber-50 bg-amber-500/15 hover:bg-amber-500/25 hover:text-white gap-2 px-5 font-semibold shadow-md shadow-amber-950/20"
              >
                <Factory className="w-5 h-5 shrink-0" aria-hidden />
                Müteahhit Girişi
              </Button>
            </div>
            <p className="mt-4 max-w-xl mx-auto lg:mx-0 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-[11px] sm:text-xs text-slate-400 leading-relaxed text-center lg:text-left shadow-inner shadow-black/20">
              {heroRevenueStripLine()}
            </p>
            <div className="animate-fade-in-up animate-delay-400">
              <KkaRevenueHubStrip variant="prominent" />
            </div>
          </div>

          <div className="order-2 grid grid-cols-2 gap-4 lg:gap-5 animate-fade-in-up animate-delay-500 lg:order-1 lg:pr-2">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className={`relative group p-6 rounded-2xl bg-gradient-to-br ${s.accent} bg-white/[0.07] backdrop-blur-xl border border-white/[0.06] hover:border-cyan-400/40 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_55px_-12px_rgba(34,211,238,0.28)] overflow-hidden motion-reduce:hover:translate-y-0`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none motion-reduce:opacity-0" />
                  <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-cyan-400/15 to-transparent rounded-full blur-2xl opacity-50 group-hover:opacity-90 transition-opacity duration-500" />
                  <div className="flex items-center justify-between mb-3 relative">
                    <div
                      className={`p-2.5 rounded-xl bg-black/25 ring-1 ring-white/10 ${s.iconRing} group-hover:scale-110 transition-transform duration-300 motion-reduce:group-hover:scale-100`}
                    >
                      <Icon className="w-5 h-5" aria-hidden />
                    </div>
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-1.5 tracking-tight drop-shadow-sm">{s.value}</div>
                  <div className="text-xs sm:text-sm text-slate-300/90 font-medium">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in animate-delay-700">
        <span className="text-[10px] text-slate-500 uppercase tracking-[0.35em] font-semibold">Kaydır</span>
        <div className="w-5 h-8 rounded-full border border-slate-600/80 flex items-start justify-center p-1 bg-white/5 backdrop-blur-sm ring-1 ring-white/5">
          <div className="w-1.5 h-2.5 rounded-full bg-cyan-400 animate-bounce motion-reduce:animate-none" />
        </div>
      </div>
    </section>
  );
}
