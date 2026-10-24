import { openOffice } from "./simulate-helpers";
import { test, expect, type Page, type TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { decodeSave, encodeSave } from "../../src/persistence/saves";

async function exportState(page: Page, info: TestInfo, name: string) {
  await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất JSON", exact: true }).click();
  const file = info.outputPath(`${name}.json`);
  await (await pending).saveAs(file);
  await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
  return decodeSave(await readFile(file, "utf8"));
}

test("compact starting team and person context preserve focus, confirmations and command outcomes", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Bắt đầu công ty mới", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Mở cửa công ty", exact: true })
    .click();
  const before = await exportState(page, info, "before");
  await openOffice(page, "Nhân sự");
  const rows = page.locator(".team-person");
  await expect(rows).toHaveCount(2);
  for (const row of await rows.all()) await expect(row).toBeInViewport();
  await rows.first().press("Enter");
  const details = page.locator(".person-context");
  await expect(details).toContainText("Học nhanh");
  await expect(
    page.getByRole("button", { name: "Đóng thông tin", exact: true }),
  ).toBeFocused();
  const axe = await new AxeBuilder({ page })
    .include(".entity-sheet")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(details).toHaveCount(0);
  await expect(page.locator(".find-object")).toBeFocused();
  await openOffice(page, "Nhân sự");
  await rows.first().click();
  const raise = page.getByRole("button", {
    name: "Xem lại lương",
    exact: true,
  });
  await raise.click();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await expect(page.locator("dialog[open]")).toContainText("Tăng lương 10%");
  await page.getByRole("button", { name: "Quay lại", exact: true }).click();
  await expect(raise).toBeFocused();
  const cancel = await exportState(page, info, "raise-cancel");
  expect(cancel).toEqual(before);
  await raise.click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(page.locator(".person-metrics")).toContainText("3.630");
  await page
    .getByRole("button", { name: "Đào tạo · $2.000", exact: true })
    .click();
  await expect(
    details.getByRole("progressbar", { name: "Năng lượng", exact: true }),
  ).toHaveAttribute("aria-valuenow", String(before.employees[0].energy - 8));
  await page.getByRole("button", { name: "Thôi việc", exact: true }).click();
  await expect(page.locator("dialog[open]")).toContainText("nửa tháng trợ cấp");
  await page.getByRole("button", { name: "Quay lại", exact: true }).click();
  await expect(details).toBeVisible();
  await page.getByRole("button", { name: "Thôi việc", exact: true }).click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(page.locator(".entity-sheet")).toContainText(
    "Nhân viên đã rời công ty",
  );
  await page.getByRole("button", { name: "Xem đồng đội", exact: true }).click();
  await expect(rows).toHaveCount(1);
  await rows.first().click();
  await page
    .getByRole("button", { name: "Đào tạo · $2.000", exact: true })
    .click();
  await expect(page.locator(".toast")).toContainText("CEO");
  const after = await exportState(page, info, "after");
  expect(after.actions).toBe(0);
  expect(after.employees.map((e) => e.id)).toEqual([before.employees[1].id]);
  expect(after.employees[0].morale).toBe(before.employees[1].morale - 5);
  expect(after.cash).toBe(
    before.cash -
      200000 -
      Math.round(Math.round(before.employees[0].salary * 1.1) * 0.5),
  );
  expect(after.employees[0].xp).toBe(before.employees[1].xp);
  await page.getByRole("button", { name: /^Phân công cho/ }).click();
  await expect(page.locator(".project-dossier")).toBeVisible();
  expect(errors).toEqual([]);
});
test("12 staff, long names and onboarding remain usable in VI/EN at both desktop sizes and 100/150 percent", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const fixture = await decodeSave(
    await readFile("evidence/fixtures/office-12.json", "utf8"),
  );
  fixture.employees[1].name = "Nguyễn Hoàng Minh Anh Trần";
  fixture.employees[2].name = "N".repeat(80);
  fixture.employees[1].hiredDay = fixture.day - 2;
  await page.goto("/");
  await page.getByRole("button", { name: "Tải bản lưu", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "roster-layout.json",
    mimeType: "application/json",
    buffer: Buffer.from(await encodeSave(fixture)),
  });
  await page
    .getByRole("button", { name: "Đóng cửa sổ lưu", exact: true })
    .click();
  const samples = [];
  for (const locale of ["vi", "en"] as const) {
    if ((await page.locator("html").getAttribute("lang")) !== locale)
      await page
        .getByRole("button", {
          name: locale === "en" ? "EN" : "VI",
          exact: true,
        })
        .click();
    for (const scale of [100, 150]) {
      await page
        .getByRole("button", {
          name: locale === "vi" ? "Cài đặt" : "Settings",
          exact: true,
        })
        .click();
      await page
        .getByLabel(locale === "vi" ? "Cỡ giao diện" : "UI size")
        .selectOption(String(scale));
      await page.keyboard.press("Escape");
      for (const size of [
        { width: 1280, height: 720 },
        { width: 1920, height: 1080 },
      ]) {
        await page.setViewportSize(size);
        await openOffice(page, "Nhân sự");
        const rows = page.locator(".team-person");
        await expect(rows).toHaveCount(12);
        await rows.last().scrollIntoViewIfNeeded();
        await expect(rows.last()).toBeInViewport();
        expect(
          await page
            .locator(".entity-body")
            .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
        ).toBe(true);
        for (const row of await rows.all())
          expect(
            await row.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
          ).toBe(true);
        await rows.nth(1).click();
        await expect(page.locator(".person-context")).toContainText(
          locale === "vi" ? "Đang hòa nhập" : "Onboarding",
        );
        await expect(page.locator(".entity-header h1")).toContainText(
          fixture.employees[1].name,
        );
        await expect(page.locator("canvas")).toHaveCount(1);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.screenshot({
          path: info.outputPath(`person-${locale}-${scale}-${size.width}.png`),
        });
        samples.push({ locale, scale, ...size });
      }
    }
  }
  expect(samples).toHaveLength(8);
  expect(errors).toEqual([]);
});
