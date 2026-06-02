import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LOCALE_DIRECTION,
  LOCALE_STORAGE_KEY,
  getMessagesFor,
  type Locale,
  type Messages,
} from "@/i18n/messages";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function detectBrowserLocale(): Locale {
  // navigator.language örn. "tr-TR", "tr", "ar-SA" — prefix'e göre 4 dil eşle.
  try {
    const nav = (typeof navigator !== "undefined" ? navigator.language : "") || "";
    const lower = nav.toLowerCase();
    if (lower.startsWith("tr")) return "tr";
    if (lower.startsWith("ru")) return "ru";
    if (lower.startsWith("ar")) return "ar";
  } catch {
    /* sessiz */
  }
  return "en";
}

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "tr"; // SSR/Türk pazar default TR
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "tr" || stored === "en" || stored === "ru" || stored === "ar") return stored;
    // Saklı tercih yoksa: navigator.language'ten türet (TR/RU/AR ise o, aksi EN)
    return detectBrowserLocale();
  } catch {
    return detectBrowserLocale();
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    // <html lang="..."> + dir (AR = rtl, diğerleri = ltr)
    document.documentElement.lang = locale;
    document.documentElement.dir = LOCALE_DIRECTION[locale];
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: getMessagesFor(locale),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
