import { defineConfig } from "@playwright/test";
import { Browser, getInstalledBrowsers } from "@puppeteer/browsers";
import { fileURLToPath } from "node:url";

// Chrome-for-Testing from `npm run browser:install` (see
// scripts/install-browser.mjs); CHROME_PATH overrides.
const cacheDir = fileURLToPath(new URL(".browsers", import.meta.url));
const chromePath =
  process.env["CHROME_PATH"] ??
  (await getInstalledBrowsers({ cacheDir })).find(
    (b) => b.browser === Browser.CHROME,
  )?.executablePath;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 1 : 0,
  use: {
    baseURL: "http://localhost:4173",
    launchOptions: {
      executablePath: chromePath,
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command: "npm run build && npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env["CI"],
    timeout: 120_000,
  },
});
