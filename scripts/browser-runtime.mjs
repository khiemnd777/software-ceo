import { chromium, firefox, webkit } from "@playwright/test";

// CDP measurements require Chromium; E2E uses the engine matrix in playwright.config.ts.
export async function launchBrowser({
  cdp = false,
  chromiumSandbox = true,
} = {}) {
  const target =
    process.env.CEO_BROWSER ??
    (process.platform === "linux" ? "bundled-chromium" : "chrome");
  if (cdp && ["firefox", "webkit"].includes(target))
    throw new Error("CDP metrics require a Chromium target");
  if (target === "bundled-chromium") {
    if (process.platform !== "linux")
      throw new Error(
        "bundled-chromium is Linux only; use chrome, msedge or chromium",
      );
    const { default: bundled } = await import("@sparticuz/chromium");
    return chromium.launch({
      headless: true,
      executablePath: await bundled.executablePath(),
      args: bundled.args.filter(
        (a) =>
          ![
            "single-process",
            "disable-web-security",
            "allow-running-insecure",
          ].some((flag) => a.includes(flag)),
      ),
    });
  }
  if (target === "firefox" || target === "webkit")
    return { firefox, webkit }[target].launch({ headless: true });
  if (!["chrome", "msedge", "chromium"].includes(target))
    throw new Error(`Unsupported CEO_BROWSER: ${target}`);
  return chromium.launch({
    headless: true,
    chromiumSandbox,
    ...(["chrome", "msedge"].includes(target) ? { channel: target } : {}),
  });
}
