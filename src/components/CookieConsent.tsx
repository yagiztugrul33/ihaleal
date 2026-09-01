import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const KEY = "ihaleal_cookie_consent_v1";

export function CookieConsent() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent("ihaleal:cookie-consent"));
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[200] p-4 md:p-6 pointer-events-none"
      role="dialog"
      aria-label="Çerez bildirimi"
    >
      <div className="max-w-3xl mx-auto pointer-events-auto rounded-[20px] border border-slate-200 bg-[#0f1629]/95 backdrop-blur-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-[20px] bg-[var(--zemin-yumusak)] flex items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-[var(--metin-ikincil)]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-normal text-white">Çerezler ve gizlilik</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Deneyimi iyileştirmek için zorunlu çerezler ve tercihlerinize bağlı analitik çerezleri kullanılabilir.
              Ayrıntılar için{" "}
              <button type="button" className="text-[var(--metin-ikincil)] hover:underline" onClick={() => navigate("/cerez-politikasi")}>
                çerez politikası
              </button>{" "}
              ve{" "}
              <button type="button" className="text-[var(--metin-ikincil)] hover:underline" onClick={() => navigate("/kvkk")}>
                KVKK metni
              </button>
              .
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" className="[background:var(--gradient-cta)] text-white font-normal" onClick={accept}>
            Anladım, devam
          </Button>
          <button type="button" className="p-2 rounded-[10px] text-slate-500 hover:text-white hover:bg-white/5" aria-label="Kapat" onClick={accept}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
