import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ToastContainer } from "./Toast";
import { ChatWidget } from "./ChatWidget";
import { AntiCopyProtection } from "./AntiCopyProtection";
import { CookieConsent } from "./CookieConsent";
import { SeoSync } from "./SeoSync";
import { ProductionSafetyBanner } from "./ProductionSafetyBanner";
import { DemoUyarisi } from "./DemoUyarisi";
import { ScrollToTop } from "./ScrollToTop";
import { PageTransition } from "@/components/motion";
import { useToast, type Toast } from "@/hooks/useToast";

const AUTH_MINIMAL_PATHS = ["/giris", "/kayit", "/sifremi-unuttum", "/emlakçı-giris"];

function isAuthMinimalBg(pathname: string): boolean {
  return AUTH_MINIMAL_PATHS.includes(pathname);
}

export function Layout() {
  const location = useLocation();
  const authMinimal = isAuthMinimalBg(location.pathname);
  const isMarketingHome = location.pathname === "/";
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
    <div className="page-shell page-shell-gradient">
      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
        <ScrollToTop />
        {!isMarketingHome ? <DemoUyarisi /> : null}
        <SeoSync />
        <AntiCopyProtection />
        <Navbar />
        {!isMarketingHome ? <ProductionSafetyBanner /> : null}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        {!isMarketingHome ? <Footer /> : null}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <ChatWidget />
        <CookieConsent />
      </div>
    </div>
  );
}
