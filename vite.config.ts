/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  // Lets GitHub Pages serve the app from /<repo-name>/.
  base: process.env["BASE_PATH"] ?? "/",
  // cubing.js ships dynamic ESM that breaks under Vite's dep pre-bundling.
  optimizeDeps: { exclude: ["cubing"] },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
