import { Hero } from "@/sections/Hero";
import { HowItWorks } from "@/sections/HowItWorks";
import { LiveAuctionsShowcase } from "@/sections/LiveAuctionsShowcase";
import { TrustStrip } from "@/sections/TrustStrip";

/** Premium cinematic homepage — reference/proje.png parity stack */
export function Home() {
  return (
    <div className="page-background-premium home-ref-page">
      <Hero />
      <HowItWorks />
      <LiveAuctionsShowcase />
      <TrustStrip />
    </div>
  );
}
