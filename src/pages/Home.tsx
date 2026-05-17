import { Hero } from "@/sections/Hero";
import { HowItWorks } from "@/sections/HowItWorks";
import { LiveAuctionsShowcase } from "@/sections/LiveAuctionsShowcase";
import { TrustStrip } from "@/sections/TrustStrip";
import { Features } from "@/sections/Features";
import { Newsletter } from "@/sections/Newsletter";
import { Contact } from "@/sections/Contact";

export function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <LiveAuctionsShowcase />
      <TrustStrip />
      <Features />
      <Newsletter />
      <Contact />
    </>
  );
}
