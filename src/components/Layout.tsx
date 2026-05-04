import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ToastContainer } from "./Toast";
import { ChatWidget } from "./ChatWidget";
import { AntiCopyProtection } from "./AntiCopyProtection";
import { CookieConsent } from "./CookieConsent";
import { SeoSync } from "./SeoSync";
import { DemoBanner } from "./DemoBanner";
import { DemoUyarisi } from "./DemoUyarisi";
import { ScrollToTop } from "./ScrollToTop";
import { useToast, type Toast } from "@/hooks/useToast";

const AUTH_MINIMAL_PATHS = ["/giris", "/kayit", "/sifremi-unuttum", "/emlakci-giris"];

function isAuthMinimalBg(pathname: string): boolean {
  return AUTH_MINIMAL_PATHS.includes(pathname);
}

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const authMinimal = isAuthMinimalBg(location.pathname);
  const { toasts, removeToast, addToast } = useToast();

  useEffect(() => {
    const onToast = (ev: Event) => {
      const e = ev as CustomEvent<{ message?: string; type?: Toast["type"] }>;
      const msg = e.detail?.message?.trim();
      if (!msg) return;
      addToast(msg, e.detail?.type ?? "info");
    };
    window.addEventListener("ihaleal:add-toast", onToast);
    return () => window.removeEventListener("ihaleal:add-toast", onToast);
  }, [addToast]);

  return (
    <div className="relative min-h-screen text-slate-50 flex flex-col overflow-x-hidden bg-[#061428]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#061428] via-[#0a1224] to-[#070d18]" />
        {!authMinimal ? (
          <>
            <div className="absolute -top-36 left-[12%] h-[min(520px,55vw)] w-[min(520px,55vw)] rounded-full bg-cyan-500/[0.1] blur-[120px]" />
            <div className="absolute bottom-[-100px] right-[8%] h-[min(440px,48vw)] w-[min(440px,48vw)] rounded-full bg-blue-600/[0.08] blur-[110px] opacity-90" />
            <div className="absolute top-[42%] left-1/2 h-[min(680px,92vw)] w-[min(680px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.05] blur-[130px]" />
          </>
        ) : null}
      </div>
      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
      <ScrollToTop />
      <DemoUyarisi />
      <SeoSync />
      <AntiCopyProtection />
      <Navbar />
      <DemoBanner />
      <main className="flex-1">{children}</main>
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ChatWidget />
      <CookieConsent />
      </div>
    </div>
  );
}
