import { launchBrowser } from "./browser-runtime.mjs";
import AxeBuilder from "@axe-core/playwright";
import { writeFileSync } from "node:fs";
const browser = await launchBrowser();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
});
const page = await context.newPage();
const results = [],
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const check = async (name) => {
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  results.push({
    name,
    horizontalOverflow: overflow,
    passes: r.passes.length,
    violations: r.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
  console.log(name, r.violations.length);
};
await page.goto("http://127.0.0.1:4173/");
await check("menu VI");
await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
await check("setup VI");
await page.getByRole("button", { name: "Mở cửa công ty" }).click();
await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
await page.getByLabel("Cỡ giao diện").selectOption("150");
await check("settings 150% VI");
await page.getByRole("button", { name: "Đóng", exact: true }).click();
await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
await check("save dialog 150% VI");
await page
  .locator("input[type=file]")
  .setInputFiles("evidence/fixtures/office-12.json");
await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
await page.getByRole("button", { name: "Ngày tiếp" }).click();
await page.getByRole("button", { name: "Ngày tiếp" }).click();
await check("critical inbox at 150% VI");
await page.locator(".inbox-card button").first().click();
await check("decision confirmation 150% VI");
await page.keyboard.press("Escape");
await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
await page
  .locator("input[type=file]")
  .setInputFiles("evidence/fixtures/career-product-complete.json");
await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
await check("campaign outcome 150% VI");
await page.screenshot({
  path: "evidence/W5-outcome-150-1280.png",
  fullPage: true,
});
const failed =
  errors.length ||
  results.some((r) => r.horizontalOverflow || r.violations.length);
writeFileSync(
  "evidence/accessibility-extra.json",
  JSON.stringify(
    {
      result: failed ? "FAIL" : "PASS",
      errors,
      browser: browser.version(),
      scope:
        "WCAG 2A/AA/2.1AA rules, 1280x720, additional menu/setup/dialog/inbox/outcome states. Automated audit is not screen-reader or WCAG certification.",
      results,
    },
    null,
    2,
  ),
);
await browser.close();
if (failed) process.exitCode = 1;
