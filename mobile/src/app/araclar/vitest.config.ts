import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../../../src"),
    },
  },
  test: {
    include: ["mobile/src/app/araclar/__tests__/*.test.ts"],
    environment: "node",
  },
});
