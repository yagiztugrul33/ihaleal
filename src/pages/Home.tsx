import { Hero } from "@/sections/Hero";
import { CorporateBanner } from "@/components/CorporateBanner";
import { Auctions } from "@/sections/Auctions";
import { EndingSoon } from "@/sections/EndingSoon";
import { RecentlyViewed } from "@/sections/RecentlyViewed";
import { Stats } from "@/sections/Stats";
import { Features } from "@/sections/Features";
import { HowItWorks } from "@/sections/HowItWorks";
import { Newsletter } from "@/sections/Newsletter";
import { Contact } from "@/sections/Contact";

export function Home() {
  return (
    <>
      <Hero />
      <CorporateBanner />
      <Stats />
      <Auctions />
      <EndingSoon />
      <Features />
      <HowItWorks />
      <RecentlyViewed />
      <Newsletter />
      <Contact />
    </>
  );
}
