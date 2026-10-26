import { test, expect } from "@playwright/test";
import { resolve } from "node:path";
for (const strategy of ["outsourcing", "product", "startup"])
  test(`${strategy}: actual campaign outcome can continue into Sandbox`, async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Tải bản lưu", exact: true })
      .click();
    await page
      .locator("input[type=file]")
      .setInputFiles(
        resolve(`evidence/fixtures/career-${strategy}-complete.json`),
      );
    await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
    await expect(page.locator(".outcome")).toContainText(
      "Một công ty đáng tự hào.",
    );
    await page.screenshot({
      path: `evidence/simulate-runtime/browser/W5-outcome-${strategy}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Tiếp tục Sandbox", exact: true })
      .click();
    await expect(page.locator(".outcome")).toHaveCount(0);
    await page.getByRole("button", { name: "Qua ngày" }).click();
    await expect(page.locator(".date")).toContainText("1082");
  });
test("insolvency explains payroll failure and permits history review and a new company", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tải bản lưu", exact: true }).click();
  await page
    .locator("input[type=file]")
    .setInputFiles(resolve("evidence/fixtures/insolvent.json"));
  await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
  await expect(page.locator(".outcome")).toContainText("14 ngày");
  await page.getByRole("button", { name: "Xem lịch sử", exact: true }).click();
  await expect(page.locator(".management")).toBeVisible();
  await expect(page.locator(".outcome")).toHaveCount(0);
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  await page
    .getByRole("button", { name: "Về menu chính", exact: true })
    .click();
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await expect(page.getByLabel("Tên công ty")).toBeVisible();
});
