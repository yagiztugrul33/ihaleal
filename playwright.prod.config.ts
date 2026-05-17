import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/smoke",
  testMatch: "arastirma-routes.spec.ts",
  timeout: 45_000,
  use: { baseURL: "https://ihaleal.vercel.app", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});