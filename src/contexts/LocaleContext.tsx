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
  LOCALE_STORAGE_KEY,
  messages,
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
  // navigator.language örn. "tr-TR", "tr", "en-US" — "tr" ile başlıyorsa TR
  try {
    const nav = (typeof navigator !== "undefined" ? navigator.language : "") || "";
    if (nav.toLowerCase().startsWith("tr")) return "tr";
  } catch {
    /* sessiz */
  }
  return "en";
}

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "tr"; // SSR/Türk pazar default TR
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "tr" || stored === "en") return stored;
    // Saklı tercih yoksa: navigator.language'ten türet (TR ise TR, aksi EN)
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
    document.documentElement.lang = locale === "tr" ? "tr" : "en";
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: messages[locale],
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
