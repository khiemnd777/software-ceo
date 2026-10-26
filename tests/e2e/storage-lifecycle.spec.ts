import { test, expect } from "@playwright/test";

test("two real tabs reject a stale manual overwrite and preserve the newer company", async ({
  page,
  context,
}) => {
  const start = async (tab: typeof page, name: string) => {
    await tab.goto("/");
    await tab.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
    await tab.getByLabel("Tên công ty").fill(name);
    await tab.getByRole("button", { name: "Mở cửa công ty" }).click();
    await tab.getByRole("button", { name: "Lưu và tải", exact: true }).click();
  };
  await start(page, "Original company");
  await page
    .locator(".save-slot")
    .first()
    .getByRole("button", { name: "Lưu", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Đã lưu");
  const second = await context.newPage();
  await start(second, "Newer company");
  await second
    .locator(".save-slot")
    .first()
    .getByRole("button", { name: "Lưu", exact: true })
    .click();
  await second.getByRole("button", { name: "Xác nhận ghi đè" }).click();
  await expect(second.getByRole("status")).toContainText("Đã lưu");
  await page
    .locator(".save-slot")
    .first()
    .getByRole("button", { name: "Lưu", exact: true })
    .click();
  await page.getByRole("button", { name: "Xác nhận ghi đè" }).click();
  await expect(page.getByRole("status")).toContainText("tab khác");
  await expect(page.locator(".save-slot").first()).toContainText(
    "Newer company",
  );
  await page
    .locator(".save-slot")
    .first()
    .getByRole("button", { name: "Tải", exact: true })
    .click();
  await expect(page.locator(".scene-toolbar strong")).toContainText(
    "Newer company",
  );
  await second.close();
});

test("blocked IndexedDB explains recovery and still downloads a valid JSON backup", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(IDBFactory.prototype, "open", {
      value: () => {
        throw new DOMException("Test storage denial", "SecurityError");
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("xuất JSON");
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất JSON", exact: true }).click();
  expect((await downloaded).suggestedFilename()).toMatch(
    /Software_CEO_.*day1.json/,
  );
  await expect(page.getByRole("status")).toContainText("Đã xuất");
});

test("application handles an emulated visibility event with explicit pause and no catch-up", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  await page.getByRole("button", { name: "4×", exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator(".toast")).toContainText("chuyển tab");
  const before = await page.locator(".date").innerText();
  await page.waitForTimeout(1600);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(1600);
  expect(await page.locator(".date").innerText()).toBe(before);
});
