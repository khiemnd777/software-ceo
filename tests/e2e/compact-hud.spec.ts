import { test, expect, type Page, type TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, writeFile } from "node:fs/promises";
import { createGame } from "../../src/simulation/create";
import { encodeSave } from "../../src/persistence/saves";

async function exportedState(page: Page, info: TestInfo, name: string) {
  await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất JSON", exact: true }).click();
  const file = info.outputPath(name);
  await (await download).saveAs(file);
  await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
  return JSON.parse(await readFile(file, "utf8")).state;
}

test("compact HUD: tooltips, focus return and tutorial disclosure preserve campaign state", async ({
  page,
}, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  const before = await exportedState(page, info, "before.json");
  const cash = page.locator(".hud-number.cash");
  await expect(page.locator(".hud-number")).toHaveCount(5);
  await cash.hover();
  await expect(page.getByRole("tooltip")).toContainText("Vận hành:");
  await page.getByRole("tooltip").hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.mouse.move(10, 400);
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await cash.focus();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await cash.press("Enter");
  await expect(page.locator(".entity-header h1")).toContainText(
    "Tình hình tài chính",
  );
  await page
    .getByRole("button", { name: "Đóng thông tin", exact: true })
    .click();
  await expect(cash).toBeFocused();

  const help = page.locator(".tutorial-toggle");
  const sceneHeight = (await page.locator(".unified-scene").boundingBox())!
    .height;
  await help.click();
  await expect(page.locator(".tutorial-explanation")).toBeVisible();
  expect((await page.locator(".unified-scene").boundingBox())!.height).toBe(
    sceneHeight,
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".tutorial-explanation")).toHaveCount(0);
  await expect(help).toBeFocused();
  expect(await exportedState(page, info, "after.json")).toEqual(before);

  await page.locator(".tutorial-action").click();
  await expect(page.locator(".tutorial-task")).toHaveText("Giao một công việc");
  await expect(page.locator(".entity-sheet")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(1);
});

test("compact tutorial: opening Strategy keeps policy pending, keeping policy completes the sixth step", async ({
  page,
}, info) => {
  const state = createGame({
    name: "Tutorial QA",
    strategy: "outsourcing",
    difficulty: "standard",
    seed: 42,
  });
  state.tutorial.seen = ["observe", "assign", "decision", "review", "income"];
  await page.goto("/");
  await page.getByRole("button", { name: "Tải bản lưu", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "tutorial.json",
    mimeType: "application/json",
    buffer: Buffer.from(await encodeSave(state)),
  });
  await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
  await expect(page.locator(".tutorial-progress")).toContainText("5/6");
  await page.locator(".tutorial-action").click();
  await expect(page.locator(".tutorial-progress")).toContainText("5/6");
  await expect(page.locator(".tutorial-action")).toHaveAccessibleName(
    "Giữ chính sách hiện tại",
  );
  await page.locator(".tutorial-action").click();
  await expect(page.locator(".tutorial-strip")).toHaveCount(0);
  const saved = await exportedState(page, info, "completed.json");
  expect(saved.tutorial.completed).toBe(true);
  expect(saved.tutorial.seen).toContain("policy");
  expect(saved.actions).toBe(state.actions);
  expect(saved.policy).toBe(state.policy);
});

for (const strategy of ["outsourcing", "product", "startup"] as const) {
  test(`compact HUD: ${strategy} VI/EN, 100/125/150 percent and desktop layouts`, async ({
    page,
  }, info) => {
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
    await page.getByLabel("Chiến lược", { exact: true }).selectOption(strategy);
    await page.getByRole("button", { name: "Mở cửa công ty" }).click();
    const measurements = [];
    for (const locale of ["vi", "en"]) {
      if (locale === "en")
        await page.getByRole("button", { name: "EN", exact: true }).click();
      const labels =
        strategy === "outsourcing"
          ? ["Việc còn lại", "Work remaining"]
          : strategy === "product"
            ? ["Doanh thu thuê bao", "Recurring revenue"]
            : ["Thời gian duy trì", "Runway"];
      await expect(page.locator(".hud-number").nth(1)).toHaveAccessibleName(
        new RegExp(`^${labels[locale === "vi" ? 0 : 1]}`),
      );
      for (const scale of [100, 125, 150]) {
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
        for (const width of [1280, 1920]) {
          const height = width === 1280 ? 720 : 1080;
          await page.setViewportSize({ width, height });
          const layout = await page.evaluate(() => {
            const hud = document
              .querySelector(".unified-hud")!
              .getBoundingClientRect();
            const tutorial = document
              .querySelector(".tutorial-strip")!
              .getBoundingClientRect();
            return {
              overflow: document.documentElement.scrollWidth > innerWidth,
              top: hud.height + tutorial.height,
              scene: document
                .querySelector(".unified-scene")!
                .getBoundingClientRect().height,
              clipped: [
                ...document.querySelectorAll(
                  ".unified-hud button,.tutorial-strip > button,.tutorial-task",
                ),
              ].filter((el) => {
                const r = el.getBoundingClientRect();
                return (
                  r.left < 0 ||
                  r.right > innerWidth ||
                  r.top < 0 ||
                  r.bottom > tutorial.bottom
                );
              }).length,
            };
          });
          expect(layout.overflow).toBe(false);
          expect(layout.clipped).toBe(0);
          expect(layout.top).toBeLessThanOrEqual(scale === 150 ? 148 : 128);
          expect(layout.scene).toBeGreaterThan(height * 0.55);
          const help = page.locator(".tutorial-toggle");
          await help.click();
          await expect(page.locator(".tutorial-explanation")).toBeVisible();
          expect(
            (await page.locator(".unified-scene").boundingBox())!.height,
          ).toBe(layout.scene);
          const popup = (await page
            .locator(".tutorial-explanation")
            .boundingBox())!;
          expect(popup.y + popup.height).toBeLessThanOrEqual(height);
          await page.keyboard.press("Escape");
          await expect(help).toBeFocused();
          measurements.push({ locale, scale, width, height, ...layout });
          if (scale !== 125)
            await page.screenshot({
              path: info.outputPath(
                `${strategy}-${locale}-${width}-${scale}.png`,
              ),
            });
        }
      }
      const axe = await new AxeBuilder({ page })
        .include(".unified-hud")
        .include(".tutorial-strip")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(axe.violations).toEqual([]);
    }
    expect(errors).toEqual([]);
    await writeFile(
      info.outputPath("layout.json"),
      JSON.stringify({ measurements, errors }, null, 2),
    );
  });
}
