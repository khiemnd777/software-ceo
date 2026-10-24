import { defineConfig } from "@playwright/test";
import base from "../../playwright.config";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const url = "http://127.0.0.1:4194";
export default defineConfig({
  ...base,
  testDir: root + "tests/e2e",
  outputDir: root + "evidence/character-gh/e2e-artifacts",
  reporter: [
    ["list"],
    ["json", { outputFile: root + "evidence/character-gh/e2e-results.json" }],
  ],
  use: { ...base.use, baseURL: url, launchOptions: { chromiumSandbox: true } },
  webServer: {
    command: "npm run preview -- --port 4194 --strictPort",
    cwd: root,
    url,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
