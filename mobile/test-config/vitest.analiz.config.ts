import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@/lib": path.resolve(__dirname, "../../src/lib"),
      "@": path.resolve(__dirname, "../src"),
    },
  },
  test: {
    include: [
      "mobile/src/app/analiz/tapu/__tests__/*.test.ts",
      "mobile/src/app/analiz/ilan/__tests__/*.test.ts",
    ],
    environment: "node",
  },
});
