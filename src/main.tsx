import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./styles/theme.css";
import "./index.css";
import App from "./App";
import { clientLogError } from "@/lib/clientLog";
import { initObservability, reportException } from "@/lib/observability/initObservability";

void initObservability();

window.addEventListener("unhandledrejection", (ev) => {
  reportException("unhandledrejection", ev.reason);
});

window.addEventListener("error", (ev) => {
  reportException("window.error", ev.error ?? ev.message);
});

registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    registration?.update();
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
