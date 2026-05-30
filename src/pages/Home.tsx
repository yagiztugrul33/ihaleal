// R12.5 — Premium cinematic homepage (backup/blok1-borsa swap)
// PremiumCinematicHome kendi içinde: Borsa Hero + Ticker + Metrics + Region
// Endeksleri + Borsa Nasıl Çalışır + Öne Çıkan İhaleler + Güven & Kurumsal
// + WHY_IHALAL_CARDS + Role Gateways içerir. Hero/HowItWorks/LiveAuctions
// Showcase/TrustStrip duplicate olduğundan kaldırıldı.
// LiveEarthquakeTicker /modul/canli-deprem-takip sayfasına taşındı.
import PremiumCinematicHome from "@/sections/PremiumCinematicHome";
import { DepremTransparencyBand } from "@/components/home/DepremTransparencyBand";
import { OnboardingTip } from "@/components/onboarding/OnboardingTip";

export function Home() {
  return (
    <div className="page-background-premium home-ref-page">
      <OnboardingTip />
      <PremiumCinematicHome />
      <DepremTransparencyBand />
    </div>
  );
}
