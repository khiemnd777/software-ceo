import { openOffice } from "./simulate-helpers";
import { inspectWork, assignWork, workOverview } from "./work-helpers";
import { test, expect } from "@playwright/test";
test("a CEO signs, assigns, chooses a policy and plays the first week", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  await openOffice(page, "Công việc");
  await inspectWork(page);
  await page
    .getByRole("button", { name: "Ký hợp đồng · 1 lượt", exact: true })
    .click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(page.locator(".hud-number.cash strong")).toContainText("51.000");
  await assignWork(page, undefined, ["develop", "qa"]);
  await openOffice(page, "Chiến lược");
  await page
    .locator(".section-nav")
    .getByRole("button", { name: "Điều hành", exact: true })
    .click();
  await page
    .locator(".decision-choice")
    .filter({ hasText: "Chất lượng trước" })
    .click();
  await page
    .locator(".policy")
    .filter({ hasText: "Chất lượng trước" })
    .getByRole("button")
    .click();
  for (let i = 0; i < 7; i++)
    await page.getByRole("button", { name: "Ngày tiếp", exact: false }).click();
  await expect(page.locator(".date")).toContainText("7");
  await openOffice(page, "Văn phòng");
  await page.waitForTimeout(500);
  await page.screenshot({
    path: "evidence/simulate-runtime/browser/W1-office-1440.png",
    fullPage: true,
  });
  await openOffice(page, "Tài chính");
  await expect(page.locator(".entity-header h1")).toContainText(
    "Tình hình tài chính",
  );
  await page.screenshot({
    path: "evidence/simulate-runtime/browser/W1-finance.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  await openOffice(page, "Công việc");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  await page.screenshot({
    path: "evidence/simulate-runtime/browser/W1-work-1280.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("outsourcing reaches acceptance, invoice and cleared cash through real UI", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  await openOffice(page, "Công việc");
  await inspectWork(page);
  await page
    .getByRole("button", { name: "Ký hợp đồng · 1 lượt", exact: true })
    .click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await assignWork(page, undefined, ["develop", "qa"]);
  const next = page.getByRole("button", { name: "Ngày tiếp", exact: false });
  const final = page.getByRole("button", {
    name: "Nghiệm thu cuối kỳ",
    exact: true,
  });
  for (let i = 0; i < 100; i++) {
    await inspectWork(page);
    if (await final.isEnabled()) {
      await page.keyboard.press("Escape");
      break;
    }
    await page.keyboard.press("Escape");
    await next.click();
  }
  await inspectWork(page);
  await expect(final).toBeEnabled();
  await page.keyboard.press("Escape");
  await assignWork(page, undefined, ["fix"]);
  for (let i = 0; i < 12; i++) await next.click();
  await inspectWork(page);
  await page
    .getByRole("button", { name: "Nghiệm thu giữa kỳ", exact: true })
    .click();
  await final.click();
  await expect(page.locator(".success-note")).toContainText("Đã nghiệm thu");
  await page.keyboard.press("Escape");
  for (let i = 0; i < 15; i++) await next.click();
  await openOffice(page, "Tài chính");
  await expect(page.locator("table").first().locator("tbody tr")).toHaveCount(
    2,
  );
  await expect(page.locator("table").first()).toContainText("Đã thu");
  await page.screenshot({
    path: "evidence/simulate-runtime/browser/W2-cleared-payments.png",
    fullPage: true,
  });
});
test("Product and Startup expose their own playable management loops", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByLabel("Chiến lược", { exact: true }).selectOption("product");
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  await openOffice(page, "Công việc");
  await workOverview(page);
  await expect(
    page.getByRole("heading", { name: "Lộ trình tính năng", exact: true }),
  ).toBeVisible();
  await page
    .locator("article.feature")
    .first()
    .getByRole("button", { name: "Đưa vào roadmap · 1 lượt" })
    .click();
  await assignWork(page, "Đồng bộ tồn kho", ["develop", "qa"]);
  for (let i = 0; i < 25; i++)
    await page.getByRole("button", { name: "Ngày tiếp" }).click();
  await assignWork(page, "Đồng bộ tồn kho", ["fix"]);
  for (let i = 0; i < 10; i++)
    await page.getByRole("button", { name: "Ngày tiếp" }).click();
  await workOverview(page);
  await expect(
    page.getByRole("heading", { name: "Lộ trình tính năng", exact: true }),
  ).toBeVisible();
  await page
    .locator("article.feature")
    .first()
    .getByRole("button", { name: "Phát hành", exact: true })
    .click();
  await expect(page.locator("article.feature").first()).toContainText(
    "ĐÃ PHÁT HÀNH",
  );
  if (await page.locator(".work-inspector[open]").count())
    await page.keyboard.press("Escape");
  await openOffice(page, "Thị trường");
  await page.screenshot({
    path: "evidence/simulate-runtime/browser/W3-product.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  await page
    .getByRole("button", { name: "Về menu chính", exact: true })
    .click();
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByLabel("Chiến lược", { exact: true }).selectOption("startup");
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  if (await page.locator(".work-inspector[open]").count())
    await page.keyboard.press("Escape");
  await openOffice(page, "Thị trường");
  await page
    .locator("article.panel-card")
    .filter({ hasText: "Phỏng vấn khách hàng" })
    .getByRole("button", { name: "Khởi động · 1 lượt" })
    .click();
  await openOffice(page, "Công việc");
  await assignWork(page, "Phỏng vấn khách hàng", ["research", "research"]);
  for (let i = 0; i < 14; i++)
    await page.getByRole("button", { name: "Ngày tiếp" }).click();
  if (await page.locator(".work-inspector[open]").count())
    await page.keyboard.press("Escape");
  await openOffice(page, "Thị trường");
  await expect(page.locator(".experiment-result").first()).toContainText("/20");
  await page.screenshot({
    path: "evidence/simulate-runtime/browser/W3-startup-evidence.png",
    fullPage: true,
  });
});

test("production bootstrap has no missing resources or console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error")
      errors.push(`${message.text()} ${message.location().url}`);
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  await page.waitForLoadState("networkidle");
  // A mounted Canvas without an error can still be blank; verify actual painted pixels.
  await expect
    .poll(() =>
      page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
        const context = canvas.getContext("2d");
        if (!context || !canvas.width || !canvas.height) return 0;
        const { data } = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        const colors = new Set<number>();
        const step = Math.max(4, Math.floor(data.length / 4096 / 4) * 4);
        for (let i = 0; i < data.length; i += step)
          colors.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
        return colors.size;
      }),
    )
    .toBeGreaterThan(16);
  await expect(page.locator(".canvas-error")).toHaveCount(0);
  expect(errors).toEqual([]);
});
