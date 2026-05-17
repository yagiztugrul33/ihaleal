import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    pool: "threads",
    maxConcurrency: 1,
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "tests/rls/**/*.{test,spec}.{ts,tsx}",
      "tests/engineering/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["tests/smoke/**", "node_modules/**", "dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/lib/fees.ts",
        "src/lib/userFlows.ts",
        "src/lib/clientLog.ts",
        "src/lib/sanitizePlainText.ts",
        "src/lib/chat/postChatMessageClient.ts",
      ],
      thresholds: {
        statements: 78,
        branches: 45,
        functions: 58,
        lines: 78,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "virtual:pwa-register": path.resolve(__dirname, "./src/test/pwa-register-stub.ts"),
    },
  },
});
