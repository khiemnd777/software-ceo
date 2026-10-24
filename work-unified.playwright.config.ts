import base from "./playwright.config";
import { defineConfig } from "@playwright/test";
const output = process.env.CEO_WORK_RUN
  ? `evidence/work-unified-runtime/${process.env.CEO_WORK_RUN}`
  : "evidence/work-unified-runtime";
export default defineConfig({
  ...base,
  outputDir: `${output}/browser`,
  reporter: [["list"], ["json", { outputFile: `${output}/e2e-results.json` }]],
});
