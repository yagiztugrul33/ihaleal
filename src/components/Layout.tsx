import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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
import { useToast, type Toast } from "@/hooks/useToast";

const AUTH_BG_PATHS = ["/giris", "/kayit", "/sifremi-unuttum", "/emlakci-giris"];

function isAuthBackdropPath(pathname: string): boolean {
  return AUTH_BG_PATHS.includes(pathname);
}

/** Giriş / kayıt: ağır blur animasyonu yok; tanıtım videosu + sakin gradient (video yoksa sadece gradient). */
function AuthBackdrop() {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <>
      {!videoFailed ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-[0.2] saturate-[0.75] contrast-[1.02] motion-reduce:opacity-[0.12]"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          onError={() => setVideoFailed(true)}
        >
          <source src="/videos/ihaleal-tanitim.mp4" type="video/mp4" />
        </video>
      ) : null}
      <div className="absolute inset-0 bg-[#061428]/80" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#061428]/95 via-[#0a1528]/70 to-[#070d18]/96" />
      <div className="absolute inset-0 auth-backdrop-glow" />
    </>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const authBackdrop = isAuthBackdropPath(location.pathname);
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
        {authBackdrop ? (
          <AuthBackdrop />
        ) : (
          <>
            <div className="absolute -top-36 left-[12%] h-[min(520px,55vw)] w-[min(520px,55vw)] rounded-full bg-cyan-500/[0.13] blur-[120px] animate-breathe motion-reduce:animate-none" />
            <div className="absolute bottom-[-100px] right-[8%] h-[min(440px,48vw)] w-[min(440px,48vw)] rounded-full bg-blue-600/[0.11] blur-[110px] animate-float motion-reduce:animate-none opacity-90" />
            <div className="absolute top-[42%] left-1/2 h-[min(680px,92vw)] w-[min(680px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.06] blur-[130px]" />
            <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(56,189,248,0.04)_50%,transparent_60%)] animate-shimmer-bg motion-reduce:animate-none bg-[length:200%_100%]" />
          </>
        )}
      </div>
      <div className="relative z-10 flex flex-col flex-1 min-h-screen">
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
