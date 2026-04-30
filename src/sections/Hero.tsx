import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  TrendingUp,
  Users,
  BarChart3,
  Shield,
  BrainCircuit,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicAsset } from "@/lib/publicAsset";

export function Hero() {
  const navigate = useNavigate();
  const [videoMuted, setVideoMuted] = useState(true);

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
      <div className="absolute inset-0 z-0 protected-media">
        <video
          autoPlay
          loop
          muted={videoMuted}
          playsInline
          preload="auto"
          poster=""
          className="w-full h-full object-cover opacity-[0.22] transition-opacity duration-700"
          style={{ filter: "blur(2px) saturate(1.2) contrast(1.05)" }}
        >
          <source src={publicAsset("videos/ihaleal-tanitim.mp4")} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[#061428]/96 via-[#0a162e]/92 to-[#071018]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.22),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.18),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_rgba(129,140,248,0.08),_transparent_45%)]" />
      </div>

      <div className="absolute top-24 left-1/4 w-[520px] h-[520px] bg-cyan-500/15 rounded-full blur-[140px] animate-breathe pointer-events-none motion-reduce:animate-none" />
      <div className="absolute bottom-10 right-0 w-[480px] h-[420px] bg-blue-600/12 rounded-full blur-[130px] pointer-events-none animate-float motion-reduce:animate-none opacity-80" />

      <button
        type="button"
        onClick={() => setVideoMuted(!videoMuted)}
        className="absolute bottom-24 right-8 z-30 p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white hover:bg-white/15 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/15 transition-all duration-300"
        aria-label={videoMuted ? "Sesi aç" : "Sesi kapat"}
      >
        {videoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
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
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start animate-fade-in-up animate-delay-400">
              <Button
                size="lg"
                onClick={() => navigate("/analiz")}
                className="bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white font-bold gap-2 px-8 h-12 text-base shadow-xl shadow-cyan-500/25 border border-white/10 hover:shadow-cyan-400/35 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 motion-reduce:hover:scale-100"
              >
                <BrainCircuit className="w-5 h-5 shrink-0" aria-hidden />
                İhaleal Endeksi
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/ihaleler")}
                className="border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/12 hover:text-white hover:border-cyan-400/25 gap-2 px-8 h-12 text-base transition-all duration-300 shadow-lg shadow-transparent hover:shadow-black/20"
              >
                <Play className="w-4 h-4 fill-current opacity-90" aria-hidden />
                İhaleleri Keşfet
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 animate-fade-in-up animate-delay-500">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className={`relative group p-5 rounded-2xl bg-gradient-to-br ${s.accent} bg-white/[0.06] backdrop-blur-xl border hover:border-cyan-400/35 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-15px_rgba(34,211,238,0.25)] overflow-hidden motion-reduce:hover:translate-y-0`}
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
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-1 tracking-tight">{s.value}</div>
                  <div className="text-xs text-slate-400 font-medium">{s.label}</div>
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
