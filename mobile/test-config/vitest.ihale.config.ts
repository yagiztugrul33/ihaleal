import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["mobile/tests/ihale/*.test.ts"],
    environment: "node",
  },
});
