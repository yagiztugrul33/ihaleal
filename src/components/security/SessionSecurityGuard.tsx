import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const WARNING_WINDOW_MS = 30 * 1000;

export function SessionSecurityGuard() {
  const { user, signOut } = useAuth();
  const [warningOpen, setWarningOpen] = useState(false);
  const [remainingSec, setRemainingSec] = useState(30);
  const deadlineRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const logoutBusyRef = useRef(false);

  const isActiveSession = useMemo(() => Boolean(user?.id), [user?.id]);

  useEffect(() => {
    if (!isActiveSession) {
      setWarningOpen(false);
      deadlineRef.current = null;
      if (timerRef.current != null) window.clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    const clearWarningTimer = () => {
      if (timerRef.current != null) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };

    const ensureAutoLogout = async () => {
      if (logoutBusyRef.current) return;
      logoutBusyRef.current = true;
      try {
        window.dispatchEvent(
          new CustomEvent("ihaleal:add-toast", {
            detail: { message: "Oturum güvenlik nedeniyle kapatıldı (hareketsizlik).", type: "warning" },
          }),
        );
        await signOut();
      } finally {
        logoutBusyRef.current = false;
      }
    };

    const resetIdleWindow = () => {
      deadlineRef.current = Date.now() + IDLE_TIMEOUT_MS;
      setWarningOpen(false);
      clearWarningTimer();
    };

    const tick = () => {
      const deadline = deadlineRef.current;
      if (!deadline) return;
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        setRemainingSec(0);
        setWarningOpen(false);
        clearWarningTimer();
        void ensureAutoLogout();
        return;
      }
      if (remaining <= WARNING_WINDOW_MS) {
        setWarningOpen(true);
        setRemainingSec(Math.max(0, Math.ceil(remaining / 1000)));
        return;
      }
      setWarningOpen(false);
    };

    resetIdleWindow();
    timerRef.current = window.setInterval(tick, 1000);
    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((eventName) => window.addEventListener(eventName, resetIdleWindow, { passive: true }));

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, resetIdleWindow));
      clearWarningTimer();
    };
  }, [isActiveSession, signOut]);

  if (!isActiveSession || !warningOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[90] mx-auto w-[min(94vw,640px)] rounded-xl border border-amber-400/40 bg-amber-500/15 p-3 text-amber-100 shadow-lg backdrop-blur">
      <p className="text-sm font-semibold">Oturumunuz kapanacak</p>
      <p className="mt-1 text-xs">
        Hareketsizlik nedeniyle güvenlik zaman aşımı devrede. Oturum {remainingSec} saniye içinde otomatik kapatılacak.
      </p>
      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          size="sm"
          className="bg-amber-400/25 text-amber-50 hover:bg-amber-400/35"
          onClick={() => {
            deadlineRef.current = Date.now() + IDLE_TIMEOUT_MS;
            setWarningOpen(false);
            window.dispatchEvent(
              new CustomEvent("ihaleal:add-toast", {
                detail: { message: "Oturum açık tutuldu.", type: "success" },
              }),
            );
          }}
        >
          Oturumu açık tut
        </Button>
      </div>
    </div>
  );
}

