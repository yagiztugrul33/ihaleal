import { useEffect } from "react";

/**
 * K7=minimal: yalnız `.protected-media` içindeki IMG/VIDEO için sağ tık engeli.
 * Üretimde tarayıcı “fingerprint” veya DRM benzeri teknik iddia edilmez; bu dosya yalnızca hafif contextmenu filtresi içerir.
 */
export function AntiCopyProtection() {
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (el.closest(".protected-media")) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", onContextMenu);
    return () => document.removeEventListener("contextmenu", onContextMenu);
  }, []);

  return null;
}
