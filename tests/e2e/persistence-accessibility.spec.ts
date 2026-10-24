import { openOffice } from "./simulate-helpers";
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("manual slots, real JSON export/import, reload and corrupt import recovery", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByLabel("Tên công ty").fill("Save QA Studio");
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  for (let i = 0; i < 7; i++)
    await page.getByRole("button", { name: "Ngày tiếp" }).click();
  await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
  const rows = page.locator(".save-slot");
  await rows.nth(0).getByRole("button", { name: "Lưu", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Đã lưu");
  await rows.nth(1).getByRole("button", { name: "Lưu", exact: true }).click();
  await rows.nth(2).getByRole("button", { name: "Lưu", exact: true }).click();
  await expect(rows.nth(3)).toContainText("Save QA Studio");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất JSON", exact: true }).click();
  const download = await downloadPromise;
  const exportPath = testInfo.outputPath("save.json");
  await download.saveAs(exportPath);
  const data = JSON.parse(await readFile(exportPath, "utf8"));
  expect(data.state.day).toBe(7);
  expect(data.checksum.length).toBe(64);
  await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page.locator(".scene-toolbar strong")).toContainText(
    "Save QA Studio",
  );
  await expect(page.locator(".date")).toContainText("7");
  await page.getByRole("button", { name: "Ngày tiếp" }).click();
  await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{bad"),
  });
  await expect(page.getByRole("status")).toContainText("bị hỏng");
  await expect(page.locator(".date")).toContainText("8");
  await page.locator("input[type=file]").setInputFiles(exportPath);
  await expect(page.getByRole("status")).toContainText("Đã phục hồi");
  await expect(page.locator(".date")).toContainText("7");
  await page.screenshot({
    path: "evidence/simulate-runtime/browser/W4-save-manager.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("VI and EN at desktop sizes, 150 percent UI, keyboard and persisted audio preferences", async ({
  page,
  browserName,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  await page.getByLabel("Nhạc nền").check();
  await page.getByLabel("Hiệu ứng âm thanh").check();
  await page.getByLabel("Âm lượng", { exact: true }).fill("0.25");
  await page.getByRole("button", { name: "Đóng", exact: true }).click();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.getByRole("button", { name: "Start a new company" }).click();
  await page.getByRole("button", { name: "Open your studio" }).click();
  await page.getByRole("button", { name: "Toggle tutorial" }).click();
  for (const dimensions of [
    { width: 1280, height: 720 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(dimensions);
    for (const view of [
      "Office",
      "Work",
      "People",
      "Market",
      "Finance",
      "Strategy",
      "History",
    ]) {
      await openOffice(page, view);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
    }
  }
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("UI size").selectOption("150");
  await page.getByLabel("Reduce motion").check();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  for (const view of ["Office", "Work", "People", "Finance", "Strategy"]) {
    await openOffice(page, view);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
  await page.screenshot({
    path: "evidence/simulate-runtime/browser/W4-ui-150-en-1280.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByLabel("Music")).toBeChecked();
  await expect(page.getByLabel("Sound effects")).toBeChecked();
  await page.getByLabel("Music").uncheck();
  await page.getByLabel("Sound effects").uncheck();
  await page.getByLabel("UI size").selectOption("100");
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await openOffice(page, "Office");
  await page.locator("canvas").focus();
  await page.keyboard.press("+");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("0");
  // macOS WebKit uses Option-Tab for all controls with the default keyboard setting.
  await page.keyboard.press(
    process.platform === "darwin" && browserName === "webkit"
      ? "Alt+Tab"
      : "Tab",
  );
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe(
    "BUTTON",
  );
  const settings = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("software-ceo-settings")!),
  );
  expect(settings.locale).toBe("en");
  expect(settings.music).toBe(false);
  expect(settings.sfx).toBe(false);
  expect(settings.reducedMotion).toBe(true);
});
