import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { startWebVitalsReporting } from "@/lib/webVitals";

const CONSENT_KEY = "ihaleal_cookie_consent_v1";
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

function hasAnalyticsConsent(): boolean {
  try {
    return Boolean(localStorage.getItem(CONSENT_KEY));
  } catch {
    return false;
  }
}

let gaLoaded = false;

/** GA4 gtag.js — yalnizca gercek bir Measurement ID tanimliysa ve consent varsa yuklenir. */
function loadGoogleAnalytics() {
  if (gaLoaded || !GA_ID || GA_ID.includes("XXXXXXXXXX")) return;
  gaLoaded = true;

  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID, { anonymize_ip: true });
  // Core Web Vitals (CLS/INP/LCP/FCP/TTFB) → GA4 event'leri.
  startWebVitalsReporting();
}

/** Vercel Web Analytics + GA4 — yalnızca çerez onayı sonrası (KVKK uyumlu). */
export function WebAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const consented = hasAnalyticsConsent();
    setEnabled(consented);
    if (consented) loadGoogleAnalytics();

    const onConsent = () => {
      setEnabled(true);
      loadGoogleAnalytics();
    };
    window.addEventListener("ihaleal:cookie-consent", onConsent);
    return () => window.removeEventListener("ihaleal:cookie-consent", onConsent);
  }, []);

  if (!enabled) return null;
  return <Analytics />;
}

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}
