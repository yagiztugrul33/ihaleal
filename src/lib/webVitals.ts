import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

let started = false;

function sendToGtag(metric: Metric) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", metric.name, {
    value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_rating: metric.rating,
    non_interaction: true,
  });
}

/** Core Web Vitals → GA4 event'leri — yalnızca çerez onayı sonrası (gtag yüklüyse) çağrılır. */
export function startWebVitalsReporting() {
  if (started) return;
  started = true;
  onCLS(sendToGtag);
  onINP(sendToGtag);
  onLCP(sendToGtag);
  onFCP(sendToGtag);
  onTTFB(sendToGtag);
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
