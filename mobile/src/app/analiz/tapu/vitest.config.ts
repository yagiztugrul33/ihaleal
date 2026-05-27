import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "src/app/analiz/tapu/__tests__/*.test.ts",
      "src/app/analiz/ilan/__tests__/*.test.ts",
    ],
    environment: "node",
  },
});
