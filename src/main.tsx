import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App";

if (import.meta.env.DEV) {
  window.addEventListener("unhandledrejection", (ev) => {
    console.error("[unhandledrejection]", ev.reason);
  });
}

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
