// Installs Chrome-for-Testing into .browsers/. The binaries download
// from storage.googleapis.com; the "what is stable right now" lookup
// lives on googlechromelabs.github.io, which some networks block, so
// fall back to a pinned build when it is unreachable.
import {
  Browser,
  detectBrowserPlatform,
  install,
  resolveBuildId,
} from "@puppeteer/browsers";
import { fileURLToPath } from "node:url";

const PINNED_BUILD_ID = "138.0.7204.94";

const cacheDir = fileURLToPath(new URL("../.browsers", import.meta.url));
const platform = detectBrowserPlatform();

let buildId = process.env.CHROME_BUILD_ID;
if (!buildId) {
  try {
    buildId = await resolveBuildId(Browser.CHROME, platform, "stable");
  } catch {
    console.log(`Could not resolve current stable; using pinned ${PINNED_BUILD_ID}`);
    buildId = PINNED_BUILD_ID;
  }
}

const installed = await install({
  browser: Browser.CHROME,
  buildId,
  cacheDir,
  platform,
});

console.log(`Chrome ${buildId} installed at:`);
console.log(installed.executablePath);
