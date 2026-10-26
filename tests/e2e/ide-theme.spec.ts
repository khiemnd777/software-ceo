import { openOffice, selectProject } from "./simulate-helpers";
import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Check the rendered controls, including native dark controls, rather than CSS source text.
async function expectDark(surface: Locator) {
  const style = await surface.evaluate((element) => {
    const css = getComputedStyle(element);
    return { background: css.backgroundColor, font: css.fontFamily };
  });
  const channels = style.background.match(/[\d.]+/g)!.map(Number);
  expect(Math.max(...channels.slice(0, 3))).toBeLessThanOrEqual(70);
  expect(channels[3] ?? 1).toBeGreaterThan(0.9);
  expect(style.font).toContain("monospace");
}

async function expectFits(page: Page, surface: Locator) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    await surface.evaluate(
      (element) => element.scrollWidth <= element.clientWidth + 1,
    ),
  ).toBe(true);
}

async function expectAccessible(page: Page, selector: string) {
  const result = await new AxeBuilder({ page })
    .include(selector)
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
}

test("IDE menu, setup and dialogs remain dark, readable and reachable at both desktop sizes and UI scales", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  for (const locale of ["vi", "en"]) {
    const en = locale === "en";
    if ((await page.locator("html").getAttribute("lang")) !== locale)
      await page
        .getByRole("button", { name: en ? "EN" : "VI", exact: true })
        .click();
    for (const scale of [100, 150]) {
      for (const size of [
        { width: 1280, height: 720 },
        { width: 1920, height: 1080 },
      ]) {
        await page.setViewportSize(size);
        await page
          .getByRole("button", {
            name: en ? "Settings" : "Cài đặt",
            exact: true,
          })
          .click();
        await page
          .getByLabel(en ? "UI size" : "Cỡ giao diện")
          .selectOption(String(scale));
        const dialog = page.locator("dialog[open]");
        await expectDark(dialog);
        for (const select of await dialog.locator("select").all())
          await expectDark(select);
        await expectFits(page, dialog);
        await expectAccessible(page, ".settings-dialog");
        await page
          .getByRole("button", { name: en ? "Close" : "Đóng", exact: true })
          .click();
        await expectDark(page.locator("main"));
        await expectFits(page, page.locator(".menu-body"));
        await expectAccessible(page, ".menu");
        await page.screenshot({
          path: info.outputPath(`menu-${locale}-${scale}-${size.width}.png`),
        });

        await page
          .getByRole("button", {
            name: en ? "Load game" : "Tải bản lưu",
            exact: true,
          })
          .click();
        await expectDark(page.locator("dialog[open]"));
        await expectFits(page, page.locator("dialog[open]"));
        await expectAccessible(page, ".save-dialog");
        await page
          .getByRole("button", {
            name: en ? "Close saves" : "Đóng cửa sổ lưu",
            exact: true,
          })
          .click();
        await page
          .getByRole("button", {
            name: en ? "How to play & Credits" : "Cách chơi & Ghi công",
            exact: true,
          })
          .click();
        await expectDark(page.locator("dialog[open]"));
        await expectFits(page, page.locator("dialog[open]"));
        await expectAccessible(page, ".about-dialog");
        await page.keyboard.press("Escape");

        await page
          .getByRole("button", {
            name: en ? "Start a new company" : "Bắt đầu công ty mới",
            exact: true,
          })
          .click();
        await expectDark(page.locator(".setup-form input").first());
        await expectFits(page, page.locator(".setup-form"));
        await expectAccessible(page, ".menu-setup");
        await page.screenshot({
          path: info.outputPath(`setup-${locale}-${scale}-${size.width}.png`),
        });
        const submit = page.getByRole("button", {
          name: en ? "Open your studio" : "Mở cửa công ty",
          exact: false,
        });
        await submit.scrollIntoViewIfNeeded();
        await expect(submit).toBeInViewport();
        await page
          .getByRole("button", { name: en ? "Back" : "Quay lại", exact: true })
          .click();
      }
    }
  }
  expect(errors).toEqual([]);
});

test("IDE office chrome and confirmation remain accessible with monospace at 100 and 150 percent", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  for (const en of [false, true]) {
    if (en) await page.getByRole("button", { name: "EN", exact: true }).click();
    for (const scale of [100, 150]) {
      await page
        .getByRole("button", { name: en ? "Settings" : "Cài đặt", exact: true })
        .click();
      await page
        .getByLabel(en ? "UI size" : "Cỡ giao diện")
        .selectOption(String(scale));
      await page.keyboard.press("Escape");
      for (const size of [
        { width: 1280, height: 720 },
        { width: 1920, height: 1080 },
      ]) {
        await page.setViewportSize(size);
        for (const selector of [
          ".unified-hud",
          ".scene-toolbar > div",
          ".attention-corner",
          ".simulation-footer",
        ])
          await expectDark(page.locator(selector));
        await expectFits(page, page.locator(".unified-hud"));
        await expectFits(page, page.locator(".scene-toolbar"));
        await expectFits(page, page.locator(".simulation-footer"));
        await expectAccessible(page, ".unified-root");
        await page.screenshot({
          path: info.outputPath(
            `office-${en ? "en" : "vi"}-${scale}-${size.width}.png`,
          ),
        });
      }
    }
  }
  await page.getByRole("button", { name: "VI", exact: true }).click();
  await openOffice(page, "Công việc");
  await selectProject(page);
  await page.getByRole("tab", { name: "Hợp đồng", exact: true }).click();
  await page
    .getByRole("button", { name: "Ký hợp đồng · 1 lượt", exact: true })
    .click();
  await expectDark(page.locator("dialog[aria-labelledby=confirmation-title]"));
  await expectFits(
    page,
    page.locator("dialog[aria-labelledby=confirmation-title]"),
  );
  await expectAccessible(page, "dialog[aria-labelledby=confirmation-title]");
  await page.getByRole("button", { name: "Quay lại", exact: true }).click();
  await expect(
    page.locator("dialog[aria-labelledby=confirmation-title]"),
  ).not.toBeVisible();
  await expect(page.locator(".project-dossier")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
});
