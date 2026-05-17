import { isSupabaseConfigured } from "@/lib/supabase";
import { isMockPaymentMode, isProdBuild, localAuthEnabled } from "@/lib/runtimeFlags";

export function ProductionSafetyBanner() {
  if (!isProdBuild) return null;

  const warnings: string[] = [];
  if (isMockPaymentMode) {
    warnings.push("Ödeme modu: demo (gerçek tahsilat yok).");
  }
  if (!isSupabaseConfigured()) {
    warnings.push("Supabase yapılandırması eksik — veri kalıcı değil.");
  }
  if (!localAuthEnabled) {
    warnings.push("Yerel demo giriş kapalı — yalnızca Supabase oturumu.");
  }

  if (warnings.length === 0) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-500/40 bg-amber-950/90 px-3 py-2 text-center text-[11px] leading-relaxed text-amber-100 sm:text-xs"
    >
      <span className="font-semibold text-amber-50">Üretim uyarısı:</span> {warnings.join(" ")}
    </div>
  );
}