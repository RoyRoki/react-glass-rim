import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Alias the package name to the library SOURCE so the playground hot-reloads as
// you edit `src/` — no rebuild needed. Consumers of the published package just
// `import { Rim } from "react-glass-rim"`.
export default defineConfig({
  // Project Pages serve from https://royroki.github.io/react-glass-rim/, so the
  // built assets must be referenced under that sub-path. Dev (base "/") is
  // unaffected — the env var is only set in the Pages build workflow.
  base: process.env.PAGES_BASE ?? "/",
  plugins: [react()],
  resolve: {
    alias: {
      "react-glass-rim": fileURLToPath(new URL("../src/index.ts", import.meta.url)),
    },
  },
});
