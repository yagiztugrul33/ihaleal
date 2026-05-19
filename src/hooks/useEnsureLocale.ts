import { useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import type { Locale } from "@/i18n/messages";

/** Sync UI locale on mount (e.g. Turkish-only marketing pages). */
export function useEnsureLocale(target: Locale): void {
  const { locale, setLocale } = useLocale();

  useEffect(() => {
    if (locale !== target) {
      setLocale(target);
    }
  }, [locale, setLocale, target]);
}
