import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";

const CONSENT_KEY = "ihaleal_cookie_consent_v1";

function hasAnalyticsConsent(): boolean {
  try {
    return Boolean(localStorage.getItem(CONSENT_KEY));
  } catch {
    return false;
  }
}

/** Vercel Web Analytics — yalnızca çerez onayı sonrası (KVKK uyumlu). */
export function WebAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(hasAnalyticsConsent());

    const onConsent = () => setEnabled(true);
    window.addEventListener("ihaleal:cookie-consent", onConsent);
    return () => window.removeEventListener("ihaleal:cookie-consent", onConsent);
  }, []);

  if (!enabled) return null;
  return <Analytics />;
}
