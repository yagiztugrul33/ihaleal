import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Film, PlayCircle } from "lucide-react";
import { NASIL_CALISIR_VIDEO } from "@/data/nasilCalisirContent";

export function NasilCalisirVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState<boolean | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(NASIL_CALISIR_VIDEO.src, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setVideoReady(res.ok);
      })
      .catch(() => {
        if (!cancelled) setVideoReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const startVideo = () => {
    if (videoReady) {
      setShowPlayer(true);
      requestAnimationFrame(() => videoRef.current?.play().catch(() => undefined));
    }
  };

  return (
    <section className="py-8" aria-labelledby="nasil-video-title">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Film className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
        <h2 id="nasil-video-title" className="text-xl font-bold text-center" style={{ color: "var(--color-text)" }}>
          {NASIL_CALISIR_VIDEO.title}
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
          {NASIL_CALISIR_VIDEO.durationLabel}
        </span>
      </div>
      <p className="text-sm text-center max-w-3xl mx-auto mb-6 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        {NASIL_CALISIR_VIDEO.lead}
      </p>

      {showPlayer && videoReady ? (
        <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden border shadow-lg" style={{ borderColor: "var(--color-border)" }}>
          <video
            ref={videoRef}
            className="w-full aspect-video bg-black"
            controls
            playsInline
            preload="metadata"
            poster={NASIL_CALISIR_VIDEO.poster}
          >
            <source src={NASIL_CALISIR_VIDEO.src} type="video/mp4" />
            Tarayıcınız video etiketini desteklemiyor.
          </video>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <button
            type="button"
            onClick={startVideo}
            className="group relative rounded-2xl overflow-hidden border aspect-video text-left"
            style={{ borderColor: "var(--color-border)" }}
            aria-label="Tanıtım videosunu oynat"
          >
            <img
              src={NASIL_CALISIR_VIDEO.poster}
              alt=""
              loading="lazy"
              decoding="async"
              width={1280}
              height={720}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 p-6">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur group-hover:scale-105 transition-transform">
                <PlayCircle className="h-10 w-10 text-white" />
              </span>
              <span className="text-white font-semibold">
                {videoReady === false ? "Video yüklenmedi — bölüm anlatımı" : "Tanıtım videosunu izle"}
              </span>
              {videoReady === false ? (
                <span className="text-xs text-slate-300 text-center max-w-xs">
                  Dosya henüz repoda yok. Aşağıdaki bölümler aynı akışı metin olarak sunar.
                </span>
              ) : null}
            </div>
          </button>

          <div className="space-y-2">
            {NASIL_CALISIR_VIDEO.chapters.map((ch, i) => (
              <button
                key={ch.title}
                type="button"
                onClick={() => setActiveChapter(i)}
                className="w-full rounded-xl border p-4 text-left transition-colors"
                style={{
                  borderColor: activeChapter === i ? "var(--color-primary)" : "var(--color-border)",
                  background: activeChapter === i ? "rgba(37,99,235,0.08)" : "var(--color-bg-card)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono" style={{ color: "var(--color-primary)" }}>
                    {ch.at}
                  </span>
                  <span className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
                    {ch.title}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {ch.desc}
                </p>
              </button>
            ))}
            <Link
              to="/reels"
              className="inline-flex items-center gap-1 text-sm font-medium mt-2"
              style={{ color: "var(--color-primary)" }}
            >
              Kısa kreatifler (Reels)
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
