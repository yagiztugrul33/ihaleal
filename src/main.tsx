import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/theme.css";
import "./index.css";
import "./styles/premium-cinematic-home.css";
/* Tasarim sistemi EN SON yuklenir: tema.css tokenlari eski :root tanimlarini
   gecersiz kilar, global-acik.css utility uyum katmanini uygular. */
import "./styles/tema.css";
import "./styles/global-acik.css";
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
