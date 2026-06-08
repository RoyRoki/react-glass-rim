import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // buildGradient is pure — no DOM needed. The hook/component aren't unit
    // tested here (they're exercised live in the playground); switch to "jsdom"
    // and add @testing-library/react if you add hook tests later.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
