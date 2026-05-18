/** Animated wave layers for home / marketing sections */
export function WaveBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {/* Ambient glow orbs */}
      <div
        className="absolute -left-[20%] top-[10%] h-[420px] w-[420px] rounded-full opacity-30 blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,.45) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -right-[10%] top-[25%] h-[380px] w-[380px] rounded-full opacity-25 blur-[90px]"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,.4) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[20%] left-[30%] h-[280px] w-[280px] rounded-full opacity-20 blur-[80px]"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,.35) 0%, transparent 70%)" }}
      />

      {/* Wave layer 1 — back */}
      <svg
        className="home-wave home-wave--back absolute bottom-0 left-0 h-[42%] min-h-[200px] w-[200%] opacity-[0.12]"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="url(#waveGradBack)"
          d="M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,186.7C672,181,768,139,864,128C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
        <defs>
          <linearGradient id="waveGradBack" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wave layer 2 — mid */}
      <svg
        className="home-wave home-wave--mid absolute bottom-0 left-0 h-[36%] min-h-[160px] w-[200%] opacity-[0.18]"
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
      >
        <path
          fill="url(#waveGradMid)"
          d="M0,160L60,149.3C120,139,240,117,360,128C480,139,600,181,720,181.3C840,181,960,139,1080,128C1200,117,1320,117,1380,112L1440,107L1440,280L1380,280C1320,280,1200,280,1080,280C960,280,840,280,720,280C600,280,480,280,360,280C240,280,120,280,60,280L0,280Z"
        />
        <defs>
          <linearGradient id="waveGradMid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wave layer 3 — front */}
      <svg
        className="home-wave home-wave--front absolute bottom-0 left-0 h-[28%] min-h-[120px] w-[200%] opacity-[0.22]"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
      >
        <path
          fill="url(#waveGradFront)"
          d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,117.3C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,240L0,240Z"
        />
        <defs>
          <linearGradient id="waveGradFront" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>

      {/* Subtle top fade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,14,26,.4) 0%, transparent 35%, transparent 70%, rgba(10,14,26,.85) 100%)",
        }}
      />
    </div>
  );
}
