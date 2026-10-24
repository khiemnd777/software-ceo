import { openOffice } from "./simulate-helpers";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";

const views = [
  ["Công việc", "Work"],
  ["Nhân sự", "People"],
  ["Thị trường", "Market"],
  ["Tài chính", "Finance"],
  ["Chiến lược", "Strategy"],
  ["Nhật ký", "History"],
];

test("management workspace: readable sections, draft preservation, default layout and history search", async ({
  page,
}) => {
  test.setTimeout(120000);
  page.setDefaultTimeout(8000);
  const measurements: object[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByLabel("Chiến lược", { exact: true }).selectOption("startup");
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  await page.setViewportSize({ width: 1280, height: 720 });
  await openOffice(page, "Công việc");
  const workspace = page.locator(".entity-sheet");
  const layoutHeight = (await workspace.boundingBox())!.height;
  expect(layoutHeight).toBeGreaterThan(300);
  const tutorial = page.getByRole("button", {
    name: "Thu gọn hoặc mở hướng dẫn",
  });
  await expect(tutorial).toHaveAttribute("aria-expanded", "false");
  await tutorial.click();
  await expect(tutorial).toHaveAttribute("aria-expanded", "true");
  await tutorial.click();
  await expect(tutorial).toHaveAttribute("aria-expanded", "false");
  measurements.push({ layoutHeight });
  await openOffice(page, "Thị trường");
  await page
    .locator(".section-nav")
    .getByRole("button", { name: "Khách hàng & giá", exact: true })
    .click();
  const budget = page.getByRole("combobox", {
    name: "Ngân sách marketing / tháng",
    exact: true,
  });
  await budget.selectOption("500000");
  await page
    .locator(".section-nav")
    .getByRole("button", { name: "Phân khúc", exact: true })
    .click();
  await page
    .locator(".section-nav")
    .getByRole("button", { name: "Khách hàng & giá", exact: true })
    .click();
  await expect(budget).toHaveValue("500000");

  await openOffice(page, "Nhật ký");
  await page
    .getByLabel("Tìm trong nhật ký", { exact: true })
    .fill("không-có-sự-kiện-này");
  await expect(page.locator(".timeline .history-item")).toHaveCount(0);
  await expect(page.locator(".timeline")).toContainText(
    "Không có sự kiện phù hợp",
  );
  await page
    .getByLabel("Tìm trong nhật ký", { exact: true })
    .fill("Công ty bắt đầu");
  await expect(page.locator(".timeline .history-item")).toHaveCount(1);
  await page
    .getByRole("combobox", { name: "Loại sự kiện", exact: true })
    .selectOption("critical");
  await expect(page.locator(".timeline .history-item")).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Loại sự kiện", exact: true })
    .selectOption("all");
  await expect(page.locator(".timeline .history-item")).toHaveCount(1);

  for (const language of [0, 1]) {
    if (language === 1)
      await page.getByRole("button", { name: "EN", exact: true }).click();
    for (const scale of [100, 150]) {
      await page
        .getByRole("button", {
          name: language ? "Settings" : "Cài đặt",
          exact: true,
        })
        .click();
      await page
        .getByLabel(language ? "UI size" : "Cỡ giao diện")
        .selectOption(String(scale));
      await page.keyboard.press("Escape");
      for (const size of [
        { width: 1280, height: 720 },
        { width: 1920, height: 1080 },
      ]) {
        await page.setViewportSize(size);
        for (const [index, labels] of views.entries()) {
          await openOffice(page, labels[language]);

          await expect(workspace).toBeVisible();
          await expect(
            page.getByRole("button", { name: /^(Tập trung|Focus)( ✓)?$/ }),
          ).toHaveCount(0);
          const box = (await workspace.boundingBox())!;
          expect(box.height).toBeGreaterThan(size.height * 0.45);
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
          expect(
            await workspace.evaluate(
              (element) => element.scrollWidth <= element.clientWidth + 1,
            ),
          ).toBe(true);
          for (const board of await workspace
            .locator(".decision-board:visible")
            .all())
            expect(
              await board.evaluate(
                (el) => el.scrollWidth <= el.clientWidth + 1,
              ),
            ).toBe(true);
          measurements.push({
            language,
            scale,
            size,
            workspaceHeight: box.height,
            view: labels[language],
          });
          if (size.width === 1280 && scale === 100 && language === 0) {
            const axe = await new AxeBuilder({ page })
              .include(".entity-sheet")
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze();
            expect(axe.violations).toEqual([]);
          }
          const nav = page.locator(".entity-body .section-nav");
          if (await nav.count()) {
            const last = nav.getByRole("button").last();
            await last.press("Enter");
            await expect(last).toHaveAttribute("aria-pressed", "true");
            await nav
              .getByRole("button", {
                name: language ? "All" : "Tất cả",
                exact: true,
              })
              .click();
          }
          await expect(page.locator("canvas")).toHaveCount(1);
          if (size.width === 1280 && scale === 100 && language === 0)
            await page.screenshot({
              path: `evidence/simulate-runtime/browser/ui-default-context-${index}.png`,
            });
        }
      }
    }
  }
  expect(errors).toEqual([]);
  await writeFile(
    "evidence/simulate-runtime/browser/ui-default-layout-browser.json",
    JSON.stringify(
      { browser: page.context().browser()?.version(), measurements, errors },
      null,
      2,
    ),
  );
});
