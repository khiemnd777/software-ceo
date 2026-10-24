import { defineConfig } from "@playwright/test";
import chromium from "@sparticuz/chromium";
const browser =
  process.env.CEO_BROWSER ??
  (process.platform === "linux"
    ? "bundled-chromium"
    : process.platform === "darwin"
      ? "chrome"
      : "chromium");
const baseURL = process.env.CEO_BASE_URL ?? "http://127.0.0.1:5173";
const bundled = browser === "bundled-chromium";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["json", { outputFile: "evidence/e2e-results.json" }]],
  use: {
    baseURL,
    browserName:
      browser === "firefox" || browser === "webkit" ? browser : "chromium",
    ...(browser === "chrome" || browser === "msedge"
      ? { channel: browser }
      : {}),
    viewport: { width: 1440, height: 900 },
    headless: true,
    ...(bundled
      ? {
          launchOptions: {
            executablePath: await chromium.executablePath(),
            args: chromium.args.filter(
              (a) =>
                !a.includes("single-process") &&
                !a.includes("disable-web-security") &&
                !a.includes("allow-running-insecure"),
            ),
          },
        }
      : {}),
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: baseURL.endsWith(":4173") ? "npm run preview" : "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
