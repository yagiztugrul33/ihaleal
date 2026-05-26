import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hafif route-geçiş bileşeni.
 *
 * Eskiden `framer-motion` (AnimatePresence + motion.div) kullanıyordu — bu Layout'a
 * sarılı olduğu için 125 kB framer-motion paketini ANA bundle'a düşürüyordu.
 * Şimdi `key={pathname}` ile yeniden-mount eden `<div>` ve `App.css` içindeki
 * `animate-fade-in-up` keyframe'i kullanılıyor; `prefers-reduced-motion` CSS
 * tarafında onurlandırılabilir (eklenirse). Framer-motion artık sadece lazy yüklenen
 * sayfalarda (Borsa Studio, Cinematic Home, vb.) bundle'a giriyor.
 */
const SKIP_PATHS = ["/giris", "/kayit", "/sifremi-unuttum"];

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const skip = SKIP_PATHS.some((p) => location.pathname.startsWith(p));

  if (skip) {
    return <>{children}</>;
  }

  return (
    <div key={location.pathname} className="page-transition flex-1 min-w-0">
      {children}
    </div>
  );
}
