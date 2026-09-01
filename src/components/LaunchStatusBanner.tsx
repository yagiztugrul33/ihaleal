/**
 * /tum-sayfalar — Anasayfa hariç tek satırlık lansman durum şeridi.
 *
 * Eskiden 2 ayrı banner (DemoUyarisi + ProductionSafetyBanner) üst üste
 * çıkıp ~80-100 px yer kaplıyordu. Soft lansman için sade ve dismissible
 * tek şeride birleştirildi:
 *   - Demo / şirketleşme öncesi bilgilendirme (her zaman aktif)
 *   - Üretim build'inde ek runtime flag'leri (ödeme, Supabase, auth)
 *
 * Kullanıcı X'e bastığında localStorage ile kalıcı kapanır.
 */
import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabaseEnv";
import { isMockPaymentMode, isProdBuild, localAuthEnabled } from "@/lib/runtimeFlags";

const DISMISS_KEY = "launch-status-banner-kapali";

function buildExtraWarnings(): string[] {
  const out: string[] = [];
  if (!isProdBuild) return out;
  if (isMockPaymentMode) out.push("ödeme demo");
  if (!isSupabaseConfigured()) out.push("Supabase yapılandırması eksik");
  if (!localAuthEnabled) out.push("yalnızca Supabase oturumu");
  return out;
}

export function LaunchStatusBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === "true") setVisible(false);
    } catch {
      /* private mode / quota */
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      /* sessiz */
    }
    setVisible(false);
  };

  if (!visible) return null;

  const extras = buildExtraWarnings();
  const extraText = extras.length > 0 ? ` · ${extras.join(" · ")}` : "";

  return (
    <div
      role="status"
      className="relative z-40 border-b border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]"
    >
      <div className="container mx-auto px-4 py-1.5 flex items-center justify-between gap-3 text-[11px] sm:text-xs leading-relaxed">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-[var(--metin-ikincil)]" aria-hidden="true" />
          <span className="truncate sm:whitespace-normal">
            <strong className="text-[var(--metin-ikincil)]">Demo modu:</strong> gerçek tahsilat yok, ihaleler
            test amaçlı{extraText}.
          </span>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Bildirim çubuğunu kapat"
          className="flex-shrink-0 p-1 rounded-[3px] hover:bg-[var(--zemin-yumusak)] transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
