// Ö2 Bilgi Mimarisi Sadeleştirme (2026-08): Ana sayfa 6 modül kartına indirildi.
// Yoğun dashboard blokları (ticker, ihale tablosu, kategori pazarı, borsa-nasıl-çalışır,
// öne çıkanlar, güven grid'i, war-room, kampanya kartları) kendi sayfalarında yaşıyor;
// ana sayfa yalnız hero + canlı ihaleler + modül kapıları sunar. Route/veri/işlev korunur.
// Eski yoğun sürüm: src/sections/PremiumCinematicHome.tsx (referans olarak duruyor).
//
// 2026-09 görsel yeniden tasarım (pilot): arama-önce hero (koyu TEK bölge), görsel ağırlıklı
// canlı-ihale kartları, modül kartları. Dekoratif parçacık/orb/gürültü katmanları kaldırıldı;
// hareket yalnızca kaydırmayla beliren öğeler (200-400 ms, ease-out, prefers-reduced-motion'a saygılı).
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Briefcase, Gavel, MapPin, Radar, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { TerminalHero } from "@/components/cinematic/TerminalHero";
import { CinematicStatsBar } from "@/components/cinematic/CinematicStatsBar";
import { ScrollReveal } from "@/components/cinematic/ScrollReveal";
import { OnboardingTip } from "@/components/onboarding/OnboardingTip";
import { CountdownTimer } from "@/components/auction/CountdownTimer";
import { getLocalAndStaticAuctions } from "@/lib/auctionsSource";
import "@/styles/home-v2.css";

type HomeModule = { title: string; text: string; href: string; Icon: LucideIcon };

// Tam biçim (₺28.500.000): "28.5M" Türkçe'de belirsizdi (nokta = binlik ayıraç) ve tabular hizalanmıyordu.
function formatTRY(v: number): string {
  return `₺${Math.round(v).toLocaleString("tr-TR")}`;
}

// Gerçek ana modüller — her kart tek satır açıklama + rota (tıkla-aç mimari)
const HOME_MODULES: HomeModule[] = [
  { title: "İhale Arama", text: "Canlı müzayedeler, kapsamlı arama ve filtreler.", href: "/ihaleler", Icon: Gavel },
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
    <div className="page-background-premium home-ref-page home-v2">
      <OnboardingTip />
      <div className="premium-home relative overflow-x-clip text-foreground" data-testid="premium-cinematic-home">
        <section className="hv2-hero" aria-labelledby="premium-hero-title">
          <div className="hv2-hero__inner">
            <TerminalHero />
            <CinematicStatsBar />
          </div>
        </section>

        {liveNow.length > 0 ? (
          <section className="hv2-section" aria-labelledby="home-live-title">
            <ScrollReveal>
              <div className="hv2-head">
                <h2 id="home-live-title" className="hv2-h2">
                  <span className="hv2-live-dot" aria-hidden />
                  Şu an canlı
                </h2>
                <Link to="/ihaleler" className="hv2-btn-more">
                  Tüm ihaleler
                  <ArrowRight className="rtl:rotate-180 h-4 w-4" aria-hidden />
                </Link>
              </div>
            </ScrollReveal>
            <div className="hv2-grid4">
              {liveNow.map((a, i) => (
                <ScrollReveal key={a.id} delayMs={i * 60}>
                  <Link to={`/ilan/${a.id}`} className="hv2-btn-card">
                    <span className="hv2-card__media">
                      {a.images?.[0] ? <img src={a.images[0]} alt="" loading="lazy" width={640} height={480} /> : null}
                      <span className="hv2-card__badge">Canlı</span>
                    </span>
                    <span className="hv2-card__body">
                      <span className="hv2-card__title">{a.title}</span>
                      <span className="hv2-card__meta">
                        {a.district}, {a.city}
                      </span>
                      <span className="hv2-card__foot">
                        <span className="hv2-card__price tnum">{formatTRY(a.currentBid)}</span>
                        <CountdownTimer endDate={a.endDate} status={a.status} layout="compact" size="sm" />
                      </span>
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>
        ) : null}

        <section className="hv2-section hv2-section--last" aria-labelledby="home-modules-title">
          <ScrollReveal>
            <h2 id="home-modules-title" className="hv2-h2">
              Modüller
            </h2>
            <p className="hv2-lead">Ne arıyorsan tek tık uzağında — detaylar kendi sayfasında.</p>
          </ScrollReveal>
          <div className="hv2-grid3" data-testid="home-module-cards">
            {HOME_MODULES.map(({ title, text, href, Icon }, i) => (
              <ScrollReveal key={title} delayMs={i * 50}>
                <Link
                  to={href}
                  data-testid="home-module-card"
                  className={i < 2 ? "hv2-btn-module hv2-btn-module--main" : "hv2-btn-module"}
                >
                  <span className="hv2-module__icon">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="hv2-module__text">
                    <strong className="hv2-module__title">{title}</strong>
                    <span className="hv2-module__desc">{text}</span>
                  </span>
                  <ArrowRight className="hv2-module__arrow rtl:rotate-180 h-4 w-4" aria-hidden />
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
