import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/theme.css";
import "./index.css";
import "./styles/global-dark.css";
import "./styles/home-modules.css";
import App from "./App";
import { initObservability, reportException } from "@/lib/observability/initObservability";

void initObservability();

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
