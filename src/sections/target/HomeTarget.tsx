import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ROUTES } from "@/constants/routes";

const HERO_IMG =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&q=80&auto=format";
const PROP_IMGS = [
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80&auto=format",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80&auto=format",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80&auto=format",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80&auto=format",
];

const pageBg: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #0a0e1a 0%, #0f1729 50%, #0a0e1a 100%)",
  color: "#e2e8f0",
};

export function HomeTarget() {
  const [stats, setStats] = useState({ a: 0, b: 0, c: 0, d: 0 });

  useEffect(() => {
    const target = { a: 12458, b: 3127, c: 10843, d: 98 };
    let i = 0;
    const tm = setInterval(() => {
      i++;
      const p = i / 60;
      setStats({
        a: Math.floor(target.a * p),
        b: Math.floor(target.b * p),
        c: Math.floor(target.c * p),
        d: Math.floor(target.d * p),
      });
      if (i >= 60) clearInterval(tm);
    }, 25);
    return () => clearInterval(tm);
  }, []);

  return (
    <div style={pageBg} className="home-target-page">
      {/* HERO */}
      <section
        className="home-target-hero relative min-h-[720px] overflow-hidden px-4 pb-16 pt-10 sm:px-6"
        aria-labelledby="home-hero-title"
      >
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(10,14,26,.95) 0%, rgba(10,14,26,.7) 40%, rgba(10,14,26,.3) 100%), url('${HERO_IMG}')`,
            backgroundSize: "cover",
            backgroundPosition: "center right",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.04) 1px,transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="home-target-hero-grid relative z-[2] mx-auto grid max-w-[1500px] grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <div
              className="mb-10 inline-flex items-center gap-2 rounded-full border border-slate-600/30 px-4 py-2 text-sm backdrop-blur-md"
              style={{ background: "rgba(15, 23, 41, 0.6)" }}
            >
              🛡 Şeffaf. Güvenli. Akıllı.
              <span
                className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]"
                aria-hidden
              />
            </div>

            <h1
              id="home-hero-title"
              className="mb-6 text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-slate-50"
              style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
            >
              Gayrimenkul
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                İhalelerinin
              </span>
              <br />
              Geleceği.
            </h1>

            <p
              className="mb-8 max-w-[420px] text-[1.05rem] leading-relaxed text-slate-300"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
            >
              AI destekli platform — güvenli, şeffaf ve verimli gayrimenkul ihaleleri için.
            </p>

            <div className="mb-12 flex flex-wrap gap-3">
              <Link
                to={ROUTES.ILANLAR}
                className="inline-flex items-center gap-2 rounded-[10px] px-7 py-3.5 text-[.95rem] font-semibold text-white no-underline shadow-[0_10px_30px_rgba(59,130,246,.4)]"
                style={{ background: "linear-gradient(135deg, #3b82f6, #1e40af)" }}
              >
                İhaleleri Keşfet →
              </Link>
              <Link
                to="/nasil-calisir"
                className="inline-flex items-center gap-2 rounded-[10px] border border-slate-600/30 px-7 py-3.5 text-[.95rem] font-semibold text-slate-200 no-underline backdrop-blur-md"
                style={{ background: "rgba(15, 23, 41, 0.5)" }}
              >
                ▶ Nasıl Çalışır
              </Link>
            </div>

            <LiveChartCard />

            <TrustSignalsRow />
          </div>

          <StatCardsColumn stats={stats} />
        </div>
      </section>

      <HowItWorksSection />
      <LiveAuctionsSection />
      <TrustedBySection />

      <style>{`
        @media (max-width: 1024px) {
          .home-target-hero-grid { grid-template-columns: 1fr !important; }
          .home-target-stat-cards {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .home-target-how-grid { grid-template-columns: 1fr !important; }
          .home-target-steps { grid-template-columns: repeat(2, 1fr) !important; }
          .home-target-step-line { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function LiveChartCard() {
  return (
    <div
      className="max-w-[420px] rounded-[18px] border border-slate-600/30 p-6 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,.4)]"
      style={{
        background: "linear-gradient(135deg, rgba(15,23,41,.85), rgba(15,23,41,.65))",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[.95rem] font-semibold text-slate-50">Canlı İhaleler</div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[.7rem] font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          CANLI
        </span>
      </div>
      <div className="mb-1 text-5xl font-extrabold leading-none tracking-tight text-slate-50">284</div>
      <div className="mb-4 text-sm font-semibold text-emerald-400">+%18 geçen aydan</div>
      <svg viewBox="0 0 400 80" className="mb-4 h-[70px] w-full" aria-hidden>
        <defs>
          <linearGradient id="liveGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity=".5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,65 L40,60 L80,55 L120,48 L160,42 L200,38 L240,32 L280,25 L320,20 L360,12 L400,8 L400,80 L0,80 Z"
          fill="url(#liveGrad)"
        />
        <path
          d="M0,65 L40,60 L80,55 L120,48 L160,42 L200,38 L240,32 L280,25 L320,20 L360,12 L400,8"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />
      </svg>
      <Link to={ROUTES.ILANLAR} className="text-sm font-semibold text-blue-400 no-underline">
        Canlı Görüntüle →
      </Link>
    </div>
  );
}

function TrustSignalsRow() {
  const items = [
    { i: "🛡", t: "Bank Düzeyi Güvenlik", s: "256-bit SSL şifreleme" },
    { i: "👥", t: "10.000+", s: "Aktif yatırımcı" },
    { i: "★", t: "4.9/5", s: "Müşteri puanı" },
    { i: "🎧", t: "7/24 Destek", s: "Her zaman yanınızda" },
  ];
  return (
    <div className="mt-10 grid max-w-[720px] gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((x) => (
        <div key={x.t} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/25 bg-blue-500/10 text-base">
            {x.i}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-50">{x.t}</div>
            <div className="text-[.7rem] text-slate-400">{x.s}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCardsColumn({
  stats,
}: {
  stats: { a: number; b: number; c: number; d: number };
}) {
  const cards = [
    { l: "Toplam İhale", v: stats.a.toLocaleString("tr-TR"), c: "+12.5%", ic: "🏠" },
    { l: "Başarılı Satış", v: stats.b.toLocaleString("tr-TR"), c: "+8.3%", ic: "✓" },
    { l: "Aktif Yatırımcı", v: stats.c.toLocaleString("tr-TR"), c: "+15.2%", ic: "👥" },
    { l: "Memnuniyet", v: `${stats.d}%`, c: "+2.1%", ic: "★" },
  ];
  return (
    <div className="home-target-stat-cards flex flex-col gap-3.5">
      {cards.map((x) => (
        <div
          key={x.l}
          className="rounded-xl border border-slate-600/20 p-4 backdrop-blur-xl shadow-lg"
          style={{ background: "rgba(15, 23, 41, 0.7)" }}
        >
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-sm">
              {x.ic}
            </div>
            <div className="flex-1">
              <div className="mb-0.5 text-[.7rem] uppercase tracking-wider text-slate-400">{x.l}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-50">{x.v}</span>
                <span className="text-[.7rem] font-semibold text-emerald-400">{x.c}</span>
              </div>
              <div className="mt-0.5 text-[.65rem] text-slate-500">geçen aydan</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HowItWorksSection() {
  const steps = [
    { n: "01", i: "🔍", t: "Keşfet", d: "Doğrulanmış ilanlar ve detaylı analitik." },
    { n: "02", i: "🛡", t: "Kayıt & KYC", d: "Kimlik doğrulama sürecini tamamla." },
    { n: "03", i: "🔨", t: "Teklif Ver", d: "Canlı ihalelere gerçek zamanlı katıl." },
    { n: "04", i: "🏆", t: "Kazan", d: "İhaleyi kazan, güvenli teslimat." },
  ];
  const trust = [
    { i: "🛡", t: "Bank Düzeyi Güvenlik", s: "256-bit SSL & veri koruması", c: "#3b82f6" },
    { i: "📈", t: "AI Analitik", s: "AI insights ile akıllı kararlar", c: "#10b981" },
    { i: "✓", t: "Şeffaf Süreç", s: "%100 şeffaf bidding", c: "#f59e0b" },
    { i: "🌐", t: "Küresel Erişim", s: "Türkiye geneli ihaleler", c: "#8b5cf6" },
    { i: "🎧", t: "7/24 Destek", s: "Her zaman yanınızdayız", c: "#ec4899" },
  ];
  return (
    <section className="px-4 py-16 sm:px-6">
      <div
        className="home-target-how-grid mx-auto grid max-w-[1400px] gap-12 rounded-[20px] border border-slate-600/20 p-8 lg:grid-cols-[1fr_320px] lg:p-12"
        style={{ background: "rgba(15, 23, 41, 0.5)" }}
      >
        <div>
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-slate-50">
              Nasıl Çalışır?
            </h2>
            <p className="text-sm text-slate-400">4 basit adımda gayrimenkul ihalelerine katılın</p>
          </div>
          <div className="home-target-steps relative grid grid-cols-4 gap-4">
            <div
              className="home-target-step-line absolute left-[12%] right-[12%] top-8 z-0 h-0.5"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(59,130,246,.5) 50%, transparent 50%)",
                backgroundSize: "12px 2px",
              }}
            />
            {steps.map((x) => (
              <div key={x.n} className="relative z-[1] text-center">
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-blue-500/40 text-2xl shadow-lg shadow-blue-500/25"
                  style={{
                    background: "linear-gradient(135deg, rgba(59,130,246,.2), rgba(30,64,175,.4))",
                  }}
                >
                  {x.i}
                </div>
                <div className="mb-1 text-xs font-bold tracking-widest text-blue-400">{x.n}</div>
                <h3 className="mb-2 text-base font-semibold text-slate-50">{x.t}</h3>
                <p className="m-0 text-[.78rem] leading-snug text-slate-400">{x.d}</p>
              </div>
            ))}
          </div>
        </div>

        <aside
          className="rounded-2xl border border-slate-600/20 p-6"
          style={{ background: "rgba(10, 14, 26, 0.5)" }}
        >
          <h3 className="mb-5 text-base font-semibold text-slate-50">
            Neden Yatırımcılar iHaleal&apos;e Güveniyor
          </h3>
          <div className="flex flex-col gap-3.5">
            {trust.map((x) => (
              <div key={x.t} className="flex items-start gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                  style={{
                    background: `${x.c}20`,
                    border: `1px solid ${x.c}40`,
                  }}
                >
                  {x.i}
                </div>
                <div className="flex-1">
                  <div className="text-[.825rem] font-semibold text-slate-50">{x.t}</div>
                  <div className="text-[.72rem] text-slate-400">{x.s}</div>
                </div>
                <span className="text-slate-500">›</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function LiveAuctionsSection() {
  const items = [
    { t: "Lüks Villa", l: "Bodrum, Türkiye", p: "₺12.450.000", c: "+12.5%", b: "32 teklif", tm: "15s 24dk", i: 0 },
    { t: "Modern Ofis Binası", l: "İstanbul, Levent", p: "₺8.850.000", c: "+8.2%", b: "28 teklif", tm: "1g 5s", i: 1 },
    { t: "Premium Daire", l: "Ankara, Çankaya", p: "₺3.950.000", c: "+15.7%", b: "18 teklif", tm: "2s 15dk", i: 2 },
    { t: "Ticari Kompleks", l: "İzmir, Konak", p: "₺14.250.000", c: "+10.3%", b: "45 teklif", tm: "3g 12s", i: 3 },
  ];
  return (
    <section className="px-4 pb-16 pt-12 sm:px-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="m-0 text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-tight text-slate-50">
            Canlı İhaleler
          </h2>
          <Link to={ROUTES.ILANLAR} className="text-sm font-semibold text-blue-400 no-underline">
            Tüm İhaleleri Gör →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item, idx) => (
            <article
              key={idx}
              className="overflow-hidden rounded-[14px] border border-slate-600/20 transition-transform hover:scale-[1.01]"
              style={{ background: "rgba(15, 23, 41, 0.6)" }}
            >
              <div
                className="relative h-[180px] bg-cover bg-center"
                style={{ backgroundImage: `url('${PROP_IMGS[item.i]}')` }}
              >
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-red-500/95 px-2.5 py-1 text-[.7rem] font-bold tracking-wide text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  CANLI
                </span>
                <button
                  type="button"
                  className="absolute right-3 top-3 flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-slate-600/30 bg-slate-900/80 text-white backdrop-blur-md"
                  aria-label="Favorilere ekle"
                >
                  ♡
                </button>
              </div>
              <div className="p-4">
                <h3 className="mb-1 text-base font-semibold text-slate-50">{item.t}</h3>
                <p className="mb-3 text-[.78rem] text-slate-400">📍 {item.l}</p>
                <p className="mb-1 text-[.65rem] uppercase tracking-wider text-slate-500">Mevcut Teklif</p>
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-xl font-bold tracking-tight text-slate-50">{item.p}</span>
                  <span className="text-sm font-semibold text-emerald-400">{item.c}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-600/20 pt-3 text-[.72rem] text-slate-400">
                  <span>⏱ {item.tm}</span>
                  <span className="font-semibold text-blue-400">{item.b} →</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustedBySection() {
  const brands = ["RE/MAX", "CENTURY 21", "Coldwell Banker", "Engel & Völkers", "Sotheby's"];
  const certs = [
    { t: "ISO 27001", s: "Sertifikalı" },
    { t: "SOC 2", s: "Type II Uyumlu" },
    { t: "KVKK", s: "Uyumlu" },
  ];
  return (
    <section className="border-t border-slate-600/20 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-[1400px] text-center">
        <p className="mb-6 text-xs uppercase tracking-widest text-slate-500">
          Türkiye&apos;nin önde gelen kurumları tarafından güvenilen
        </p>
        <div className="mb-8 flex flex-wrap items-center justify-center gap-12 opacity-50">
          {brands.map((b) => (
            <span key={b} className="text-base font-bold tracking-wide text-slate-400">
              {b}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {certs.map((b) => (
            <div
              key={b.t}
              className="rounded-[10px] border border-slate-600/20 px-5 py-3 text-center"
              style={{ background: "rgba(15, 23, 41, 0.5)" }}
            >
              <div className="text-sm font-bold text-slate-50">{b.t}</div>
              <div className="text-[.7rem] text-slate-400">{b.s}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
