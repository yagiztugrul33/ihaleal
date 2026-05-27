import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["mobile/src/app/kka/__tests__/*.test.ts"],
    environment: "node",
  },
});
