import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ToastContainer } from "./Toast";
import { ChatWidget } from "./ChatWidget";
import { AntiCopyProtection } from "./AntiCopyProtection";
import { CookieConsent } from "./CookieConsent";
import { SeoSync } from "./SeoSync";
import { DemoBanner } from "./DemoBanner";
import { useToast } from "@/hooks/useToast";

export function Layout({ children }: { children: ReactNode }) {
  const { toasts, removeToast } = useToast();

  return (
    <div className="min-h-screen text-slate-50 flex flex-col" style={{ background: "#0a0f1e" }}>
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
  );
}
