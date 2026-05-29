import { Hero } from "@/sections/Hero";
import { HowItWorks } from "@/sections/HowItWorks";
import { LiveAuctionsShowcase } from "@/sections/LiveAuctionsShowcase";
import { TrustStrip } from "@/sections/TrustStrip";
// R12.3 — Deprem modülü mount (backup/blok1-borsa cherry-pick)
import { LiveEarthquakeTicker } from "@/components/home/LiveEarthquakeTicker";
import { DepremTransparencyBand } from "@/components/home/DepremTransparencyBand";

/** Premium cinematic homepage — reference/proje.png parity stack */
export function Home() {
  return (
    <div className="page-background-premium home-ref-page">
      <Hero />
      <LiveEarthquakeTicker />
      <HowItWorks />
      <LiveAuctionsShowcase />
      <DepremTransparencyBand />
      <TrustStrip />
    </div>
  );
}
