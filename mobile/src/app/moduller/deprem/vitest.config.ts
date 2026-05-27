import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["mobile/src/app/moduller/deprem/__tests__/*.test.ts"],
    environment: "node",
  },
});
