import base from "./playwright.config";
import { defineConfig } from "@playwright/test";
const run = process.env.CEO_E2E_RUN ?? "final";
const baseURL = process.env.CEO_BASE_URL ?? "http://127.0.0.1:4186";
export default defineConfig({
  ...base,
  reporter: [
    ["list"],
    ["json", { outputFile: `evidence/simulate-runtime/${run}/results.json` }],
  ],
  outputDir: `evidence/simulate-runtime/${run}/test-results`,
  use: {
    ...base.use,
    baseURL,
    launchOptions: { ...base.use?.launchOptions, chromiumSandbox: true },
  },
  webServer: process.env.CEO_BASE_URL
    ? undefined
    : {
        command: "npm run preview -- --port 4186 --strictPort",
        url: "http://127.0.0.1:4186",
        reuseExistingServer: true,
      },
});
