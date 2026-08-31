// Ö2 Bilgi Mimarisi Sadeleştirme (2026-08): Ana sayfa 6 modül kartına indirildi.
// Yoğun dashboard blokları (ticker, ihale tablosu, kategori pazarı, borsa-nasıl-çalışır,
// öne çıkanlar, güven grid'i, war-room, kampanya kartları) kendi sayfalarında yaşıyor;
// ana sayfa yalnız cinematic hero + modül kapıları sunar. Route/veri/işlev korunur.
// Eski yoğun sürüm: src/sections/PremiumCinematicHome.tsx (referans olarak duruyor).
import { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Briefcase, Gavel, MapPin, Radar, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { TerminalHero } from "@/components/cinematic/TerminalHero";
import { CinematicStatsBar } from "@/components/cinematic/CinematicStatsBar";
import { CinematicParticles } from "@/components/cinematic/CinematicParticles";
import { OnboardingTip } from "@/components/onboarding/OnboardingTip";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { getLocalAndStaticAuctions } from "@/lib/auctionsSource";

type HomeModule = { title: string; text: string; href: string; Icon: LucideIcon };

function formatTRY(v: number): string {
  if (v >= 1_000_000) return `₺${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₺${(v / 1_000).toFixed(0)}K`;
  return `₺${v.toLocaleString("tr-TR")}`;
}

// Gerçek ana modüller — her kart tek satır açıklama + rota (tıkla-aç mimari)
const HOME_MODULES: HomeModule[] = [
  { title: "İhale Arama", text: "Canlı müzayedeler, kapsamlı arama ve filtreler.", href: ROUTES.AUCTIONS, Icon: Gavel },
  { title: "Gayrimenkul Borsası", text: "Canlı teklif bandı, emir defteri ve fiyat keşfi.", href: ROUTES.BORSA, Icon: TrendingUp },
  { title: "Harita", text: "Tüm ilanları harita üzerinde keşfet.", href: "/harita", Icon: MapPin },
  { title: "Analiz & Raporlar", text: "İhaleal Endeksi, fiyat tahmini ve aylık raporlar.", href: "/analiz", Icon: BarChart3 },
  { title: "Portföyüm", text: "Favoriler, teklifler, belgeler ve mesajlar tek panelde.", href: "/panel", Icon: Briefcase },
  { title: "Risk Merkezi", text: "Deprem riski, bina sorgu ve afet araçları.", href: "/modul/deprem-risk-haritasi", Icon: Radar },
];

export function Home() {
  const [catalog] = useState(() => getLocalAndStaticAuctions());
  const liveNow = catalog.filter((a) => a.status === "live").slice(0, 4);

  return (
    <div className="page-background-premium home-ref-page">
      <OnboardingTip />
      <div className="premium-home relative overflow-x-clip bg-background text-foreground" data-testid="premium-cinematic-home">
        <CinematicParticles />
        <div className="premium-home__glow-orb premium-home__glow-orb--violet" aria-hidden="true" />
        <div className="premium-home__glow-orb premium-home__glow-orb--cyan" aria-hidden="true" />
        <div className="premium-home__noise" aria-hidden="true" />

        <section className="relative mx-auto mt-4 w-full max-w-[1240px] px-4 pb-2 lg:px-6" aria-labelledby="premium-hero-title">
          <div className="premium-hero-shell rounded-[32px] border border-border bg-card p-4 shadow-xl lg:p-6">
            <div className="space-y-2">
              <TerminalHero />
              <CinematicStatsBar />
            </div>
          </div>
        </section>

        {liveNow.length > 0 ? (
          <section className="relative mx-auto mt-6 w-full max-w-[1240px] px-4 lg:px-6" aria-labelledby="home-live-title">
            <div className="rounded-[10px] border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: "var(--sinyal-turuncu)" }}
                  aria-hidden
                />
                <h2 id="home-live-title" className="text-xs font-normal uppercase tracking-widest text-muted-foreground">
                  Şu an canlı
                </h2>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {liveNow.map((a) => (
                  <Link
                    key={a.id}
                    to={`/ilan/${a.id}`}
                    style={{ textDecoration: "none" }}
                    className="rounded-lg border border-border p-3 transition hover:border-card-foreground/40"
                  >
                    <p className="truncate text-sm font-normal text-card-foreground">{a.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {a.district}, {a.city}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-normal text-card-foreground">{formatTRY(a.currentBid)}</span>
                      <CountdownTimer endDate={a.endDate} status={a.status} layout="compact" size="sm" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="relative mx-auto mt-6 w-full max-w-[1240px] px-4 pb-12 lg:px-6" aria-labelledby="home-modules-title">
          <h2 id="home-modules-title" className="text-[20px] font-normal text-foreground lg:text-[26px]">
            Modüller
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Ne arıyorsan tek tık uzağında — detaylar kendi sayfasında.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="home-module-cards">
            {HOME_MODULES.map(({ title, text, href, Icon }) => (
              <Link
                key={title}
                to={href}
                data-testid="home-module-card"
                style={{ textDecoration: "none" }}
                className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-lg"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-foreground transition group-hover:border-primary/40">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <strong className="block text-base font-normal text-card-foreground">{title}</strong>
                  <span className="mt-0.5 block text-sm text-card-foreground/70">{text}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
