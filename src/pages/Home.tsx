import { Hero } from "@/sections/Hero";
import { PlatformModulesShowcase } from "@/sections/PlatformModulesShowcase";
import { HomeStats } from "@/sections/HomeStats";
import { HowItWorks } from "@/sections/HowItWorks";
import { LiveAuctionsShowcase } from "@/sections/LiveAuctionsShowcase";
import { HomeCorporateCta } from "@/sections/HomeCorporateCta";
import { TrustStrip } from "@/sections/TrustStrip";

export function Home() {
  return (
    <div className="home-ref-page relative min-h-screen overflow-x-hidden bg-[#0a0e1a] font-sans text-white selection:bg-blue-600">
      <div className="home-grid-mesh pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div className="home-orb home-orb-blue pointer-events-none" aria-hidden />
      <div className="home-orb home-orb-violet pointer-events-none" aria-hidden />
      <main className="relative z-10 mx-auto max-w-[1600px] space-y-4 px-4 pb-16 pt-2 sm:px-6 lg:px-8 xl:space-y-8">
        <Hero />
        <PlatformModulesShowcase />
        <HomeStats />
        <HowItWorks />
        <LiveAuctionsShowcase />
        <HomeCorporateCta />
        <TrustStrip />
      </main>
    </div>
  );
}