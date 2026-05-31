/**
 * PWA Install Prompt — "Ana ekrana ekle" CTA banner.
 *
 * Davranış:
 *  - `beforeinstallprompt` (Android Chrome/Edge) yakalanırsa native prompt ile yükle.
 *  - iOS Safari'de native event YOK → kullanıcıya 3 adım yönerge gösterilir.
 *  - Standalone mod (zaten yüklü) → asla render edilmez.
 *  - Reddet: localStorage ile 7 gün suskunluk.
 *  - Yükle başarılı → sessizce kapanır.
 *
 * Dalga 5-4.
 */

import { useEffect, useState } from "react";
import { Download, X, Share2, Plus } from "lucide-react";

const DISMISS_KEY = "ihaleal:pwa-install:dismissed-until";
const DISMISS_DAYS = 7;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // Android/desktop
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // iOS
  // @ts-expect-error — iOS Safari özel property
  if (typeof navigator !== "undefined" && navigator.standalone === true) return true;
  return false;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) && !/Android/.test(ua);
}

function getDismissUntil(): number {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function setDismissed(): void {
  try {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, String(until));
  } catch {
    /* private mode etc. */
  }
}

export function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosMode, setIosMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return; // zaten yüklü
    if (Date.now() < getDismissUntil()) return; // suskun

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari için fallback: 3sn sonra hâlâ event yoksa, iOS yönergesini göster.
    let iosTimer: ReturnType<typeof setTimeout> | null = null;
    if (isIOS()) {
      iosTimer = setTimeout(() => {
        if (!deferredEvent && !isStandalone() && Date.now() >= getDismissUntil()) {
          setIosMode(true);
          setVisible(true);
        }
      }, 3000);
    }

    const installed = () => {
      setVisible(false);
      setDeferredEvent(null);
    };
    window.addEventListener("appinstalled", installed);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
      if (iosTimer) clearTimeout(iosTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const onInstall = async () => {
    if (!deferredEvent) return;
    try {
      await deferredEvent.prompt();
      const choice = await deferredEvent.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
      } else {
        setDismissed();
        setVisible(false);
      }
    } catch {
      setVisible(false);
    } finally {
      setDeferredEvent(null);
    }
  };

  const onDismiss = () => {
    setDismissed();
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Uygulamayı yükle"
      className="fixed bottom-4 left-4 right-4 z-[9000] mx-auto max-w-md rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-6 sm:left-auto sm:right-6"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Kapat"
        className="absolute right-3 top-3 rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">
            ihaleal'i ana ekranına ekle
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-300">
            {iosMode
              ? "Daha hızlı erişim için Safari'den uygulamayı ana ekrana ekleyebilirsin."
              : "Hızlı erişim, çevrimdışı destek ve uygulama deneyimi için yükle."}
          </p>

          {iosMode ? (
            <ol className="mt-3 space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Share2 className="h-3.5 w-3.5 text-cyan-400" />
                Safari alt çubuğunda "Paylaş" simgesine dokun
              </li>
              <li className="flex items-center gap-2">
                <Plus className="h-3.5 w-3.5 text-cyan-400" />
                "Ana Ekrana Ekle" seçeneğini seç
              </li>
              <li className="flex items-center gap-2">
                <Download className="h-3.5 w-3.5 text-cyan-400" />
                Sağ üstte "Ekle" butonuna dokun
              </li>
            </ol>
          ) : (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={onInstall}
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:from-cyan-400 hover:to-blue-500"
              >
                Uygulamayı yükle
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/5"
              >
                Şimdi değil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;
