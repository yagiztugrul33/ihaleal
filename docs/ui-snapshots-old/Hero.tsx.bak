import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Play, TrendingUp, Users, BarChart3, Shield, BrainCircuit, ArrowUpRight, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicAsset } from "@/lib/publicAsset";

export function Hero() {
  const navigate = useNavigate();
  const [videoMuted, setVideoMuted] = useState(true);

  const stats = [
    { icon: <TrendingUp className="w-5 h-5" />, value: "1.247", label: "Aktif İhale", color: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-400" },
    { icon: <Users className="w-5 h-5" />, value: "8.452", label: "Kayıtlı Kullanıcı", color: "from-teal-500/20 to-teal-600/5", iconColor: "text-teal-400" },
    { icon: <BarChart3 className="w-5 h-5" />, value: "₺386M", label: "Toplam Hacim", color: "from-purple-500/20 to-purple-600/5", iconColor: "text-purple-400" },
    { icon: <Shield className="w-5 h-5" />, value: "%97", label: "Başarı Oranı", color: "from-amber-500/20 to-amber-600/5", iconColor: "text-amber-400" },
  ];

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Video Background */}
      <div className="absolute inset-0 z-0 protected-media">
        <video
          autoPlay
          loop
          muted={videoMuted}
          playsInline
          preload="auto"
          poster=""
          className="w-full h-full object-cover opacity-30"
          style={{ filter: "blur(2px) saturate(1.2)" }}
        >
          <source src={publicAsset("videos/ihaleal-tanitim.mp4")} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e]/60 via-[#0a0f1e]/80 to-[#0a0f1e]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e]/40 to-transparent" />
      </div>

      {/* Floating particles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-blue-500/8 rounded-full blur-[140px] animate-breathe" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-teal-500/5 rounded-full blur-[120px]" />

      {/* Video mute toggle */}
      <button
        onClick={() => setVideoMuted(!videoMuted)}
        className="absolute bottom-24 right-8 z-30 p-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors"
        aria-label={videoMuted ? "Sesi aç" : "Sesi kapat"}
      >
        {videoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in-up">
              <BrainCircuit className="w-3.5 h-3.5" /> YAPAY ZEKA DESTEKLI DEĞERLEME
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight mb-6 animate-fade-in-up animate-delay-200">
              <span className="text-white">Gayrimenkul</span><br />
              <span className="text-gradient">Canlı İhale Vitrini</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up animate-delay-300">
              Şeffaf, hızlı ve güvenli ihale deneyimi. AI destekli fiyat analizi, bölge endeksleri ve yatırım skoru ile doğru kararlar alın.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start animate-fade-in-up animate-delay-400">
              <Button size="lg" onClick={() => navigate("/analiz")} className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-bold gap-2 px-8 h-12 text-base animate-pulse-glow">
                <BrainCircuit className="w-5 h-5" /> AI Analiz <ArrowUpRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/ihaleler")} className="border-white/15 text-white hover:bg-white/5 hover:text-white gap-2 px-8 h-12 text-base">
                <Play className="w-4 h-4" /> İhaleleri Keşfet
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 animate-fade-in-up animate-delay-500">
            {stats.map((s, i) => (
              <div key={i} className={`relative group p-5 rounded-2xl bg-gradient-to-br ${s.color} border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors" />
                <div className="flex items-center justify-between mb-3 relative">
                  <div className={`p-2.5 rounded-xl bg-white/5 ${s.iconColor} group-hover:bg-white/10 transition-colors`}>{s.icon}</div>
                  <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-xs text-slate-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in animate-delay-700">
        <span className="text-xs text-slate-500 uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-slate-700 flex items-start justify-center p-1">
          <div className="w-1.5 h-2.5 rounded-full bg-blue-500 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
