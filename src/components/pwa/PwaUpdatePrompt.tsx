/**
 * PWA Güncelleme Prompt'u — yeni servis worker hazır olunca "Güncelle" sunar.
 *
 * Davranış (registerType: "prompt" ile):
 *  - Yeni SW indirilince BEKLER (skipWaiting: false) — sessizce devralmaz.
 *  - `needRefresh` true olunca minimal üst-merkez banner gösterilir.
 *  - "Güncelle" → updateServiceWorker(true): skip-waiting + sayfa reload.
 *  - "Sonra" → banner kapanır (bir sonraki ziyarette tekrar sorulur).
 *  - Standalone/web farketmez; veri akışına SIFIR dokunuş (yalnız kabuk güncellemesi).
 *
 * NOT: i18n sistemine (messages.ts) dokunmamak için 4 dil metni burada izole.
 */
import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  tr: { msg: "Yeni sürüm hazır.", update: "Güncelle", later: "Sonra", close: "Kapat" },
  en: { msg: "A new version is ready.", update: "Update", later: "Later", close: "Close" },
  ru: { msg: "Доступна новая версия.", update: "Обновить", later: "Позже", close: "Закрыть" },
  ar: { msg: "إصدار جديد جاهز.", update: "تحديث", later: "لاحقًا", close: "إغلاق" },
} as const;

export function PwaUpdatePrompt() {
  const { locale } = useLocale();
  const s = STRINGS[locale] ?? STRINGS.tr;

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // SW kayıt hatası uygulamayı ASLA bozmamalı — sessizce yut.
    onRegisterError() {
      /* yoksay */
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 left-1/2 z-[9100] flex -translate-x-1/2 items-center gap-3 rounded-[20px] border border-white/10 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
    >
      <RefreshCw className="h-4 w-4 shrink-0 text-[var(--metin-ikincil)]" aria-hidden />
      <span className="text-sm text-white/90">{s.msg}</span>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="rounded-[10px] bg-[var(--zemin-yumusak)] px-3 py-1.5 text-sm font-normal text-white transition-colors hover:bg-[var(--zemin-yumusak)]"
      >
        {s.update}
      </button>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        aria-label={s.close}
        title={s.later}
        className="shrink-0 text-white/50 transition-colors hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
