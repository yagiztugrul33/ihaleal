// Ö2 Bilgi Mimarisi Sadeleştirme (2026-08): Ana sayfa 6 modül kartına indirildi.
// Yoğun dashboard blokları (ticker, ihale tablosu, kategori pazarı, borsa-nasıl-çalışır,
// öne çıkanlar, güven grid'i, war-room, kampanya kartları) kendi sayfalarında yaşıyor;
// ana sayfa yalnız cinematic hero + modül kapıları sunar. Route/veri/işlev korunur.
// Eski yoğun sürüm: src/sections/PremiumCinematicHome.tsx (referans olarak duruyor).
import { Link } from "react-router-dom";
import { BarChart3, Briefcase, Gavel, MapPin, Radar, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { TerminalHero } from "@/components/cinematic/TerminalHero";
import { CinematicStatsBar } from "@/components/cinematic/CinematicStatsBar";
import { CinematicParticles } from "@/components/cinematic/CinematicParticles";
import { OnboardingTip } from "@/components/onboarding/OnboardingTip";

type HomeModule = { title: string; text: string; href: string; Icon: LucideIcon };

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

        <section className="relative mx-auto mt-6 w-full max-w-[1240px] px-4 pb-12 lg:px-6" aria-labelledby="home-modules-title">
          <h2 id="home-modules-title" className="text-[20px] font-normal text-foreground lg:text-[26px] tracking-[0.02em]">
            Modüller
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Ne arıyorsan tek tık uzağında — detaylar kendi sayfasında.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="home-module-cards">
            {HOME_MODULES.map(({ title, text, href, Icon }) => (
              <Link
                key={title}
                to={href}
                data-testid="home-module-card"
                className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-lg"
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-primary transition group-hover:border-primary/40">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <strong className="block text-base font-normal text-card-foreground">{title}</strong>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{text}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
