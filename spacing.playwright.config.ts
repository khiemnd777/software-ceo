import base from "./playwright.config";
import { defineConfig } from "@playwright/test";
const run = process.env.CEO_SPACING_RUN ?? "final";
export default defineConfig({
  ...base,
  outputDir: `evidence/ui-button-spacing/${run}/browser`,
  reporter: [
    ["list"],
    [
      "json",
      { outputFile: `evidence/ui-button-spacing/${run}/e2e-results.json` },
    ],
  ],
});
