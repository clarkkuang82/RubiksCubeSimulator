/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  // cubing.js ships dynamic ESM that breaks under Vite's dep pre-bundling.
  optimizeDeps: { exclude: ["cubing"] },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
