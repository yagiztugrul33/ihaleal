import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initObservability, reportException } from "@/lib/observability/initObservability";
import { ensureCsrfToken } from "@/lib/security/csrf";

void initObservability();
void ensureCsrfToken();

window.addEventListener("unhandledrejection", (ev) => {
  reportException("unhandledrejection", ev.reason);
});

window.addEventListener("error", (ev) => {
  reportException("window.error", ev.error ?? ev.message);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
