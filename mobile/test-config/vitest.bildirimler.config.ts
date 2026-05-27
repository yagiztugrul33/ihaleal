import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  test: {
    include: [
      "mobile/src/app/bildirimler/__tests__/*.test.ts",
      "mobile/src/app/mesajlar/__tests__/*.test.ts",
      "mobile/src/app/favoriler/__tests__/*.test.ts",
      "mobile/src/app/belgeler/__tests__/*.test.ts",
    ],
    environment: "node",
  },
});
