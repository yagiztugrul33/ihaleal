import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  test: {
    include: ["mobile/src/app/araclar/__tests__/*.test.ts"],
    environment: "node",
  },
});
