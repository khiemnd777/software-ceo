import { test, expect, type Page } from "@playwright/test";
import { createGame } from "../../src/simulation/create";
import { encodeSave } from "../../src/persistence/saves";

declare global {
  interface Window {
    __wallSignDraws: { text: string; width: number; font: string }[];
  }
}

test.use({ deviceScaleFactor: 2 });

test.beforeEach(async ({ page }) => {
  // Observe real Canvas drawing without replacing text metrics or rasterization.
  await page.addInitScript(() => {
    window.__wallSignDraws = [];
    const original = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (
      text: string,
      x: number,
      y: number,
      maxWidth?: number,
    ) {
      if (this.fillStyle === "#285648" && this.font.startsWith("800 "))
        window.__wallSignDraws.push({
          text,
          width: this.measureText(text).width,
          font: this.font,
        });
      if (maxWidth === undefined) original.call(this, text, x, y);
      else original.call(this, text, x, y, maxWidth);
    };
  });
});

const sign = (page: Page) => page.evaluate(() => window.__wallSignDraws.at(-1));

async function canvasPixels(page: Page) {
  return page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
    const data = canvas
      .getContext("2d")!
      .getImageData(0, 0, canvas.width, canvas.height).data;
    let hash = 2166136261;
    for (const byte of data) hash = Math.imul(hash ^ byte, 16777619);
    return hash >>> 0;
  });
}

test("wall sign previews VI names, uses SOFTWARE CEO fallback and fits long Unicode names", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await expect.poll(async () => (await sign(page))?.text).toBe("SOFTWARE CEO");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await expect
    .poll(async () => (await sign(page))?.text)
    .toBe("Evergreen Studio");
  const name = page.getByLabel("Tên công ty");
  await name.fill("  Công nghệ Ánh Dương  ");
  await expect
    .poll(async () => (await sign(page))?.text)
    .toBe("Công nghệ Ánh Dương");
  await page.screenshot({
    path: info.outputPath("setup-vietnamese-1280-dpr2.png"),
  });
  await name.fill("");
  await expect.poll(async () => (await sign(page))?.text).toBe("SOFTWARE CEO");
  await name.fill("   ");
  await expect.poll(async () => (await sign(page))?.text).toBe("SOFTWARE CEO");
  for (const text of ["W".repeat(40), "🌟".repeat(20)]) {
    await name.fill(text);
    await expect
      .poll(async () => (await sign(page))?.text)
      .toMatch(text.startsWith("W") ? /^W+…$/ : /^(?:🌟)+…$/u);
    const drawn = (await sign(page))!;
    expect(drawn.width).toBeLessThanOrEqual(220);
    expect(drawn.text).not.toContain("\uFFFD");
    expect(drawn.font).toContain("12px");
  }
  await page.screenshot({
    path: info.outputPath("setup-long-name-1280-dpr2.png"),
  });
  await name.fill("Công nghệ Ánh Dương");
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  await expect(page.locator(".scene-toolbar strong")).toHaveText(
    "Công nghệ Ánh Dương",
  );
  await expect
    .poll(async () => (await sign(page))?.text)
    .toBe("Công nghệ Ánh Dương");
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: info.outputPath("office-vietnamese-1280-dpr2.png"),
  });
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  await page
    .getByRole("button", { name: "Về menu chính", exact: true })
    .click();
  await expect.poll(async () => (await sign(page))?.text).toBe("SOFTWARE CEO");
});

test("paused office redraws the same Canvas when another save changes only the company name", async ({
  page,
}, info) => {
  const state = createGame({
    name: "ALPHA STUDIO",
    strategy: "outsourcing",
    difficulty: "standard",
    seed: 42,
  });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/");
  await page.getByRole("button", { name: "Tải bản lưu", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "alpha.json",
    mimeType: "application/json",
    buffer: Buffer.from(await encodeSave(state)),
  });
  await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
  await page.waitForLoadState("networkidle");
  await expect.poll(async () => (await sign(page))?.text).toBe("ALPHA STUDIO");
  const canvas = await page.locator("canvas").elementHandle();
  const before = await canvasPixels(page);
  await page.screenshot({
    path: info.outputPath("office-alpha-1920-dpr2.png"),
  });
  state.name = "BRAVO STUDIO";
  await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "bravo.json",
    mimeType: "application/json",
    buffer: Buffer.from(await encodeSave(state)),
  });
  await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
  await expect.poll(async () => (await sign(page))?.text).toBe("BRAVO STUDIO");
  expect(await canvas!.evaluate((element) => element.isConnected)).toBe(true);
  await expect(
    page.getByRole("button", { name: "Chạy mô phỏng", exact: true }),
  ).toBeVisible();
  await expect.poll(() => canvasPixels(page)).not.toBe(before);
  await page.screenshot({
    path: info.outputPath("office-bravo-1920-dpr2.png"),
  });
  state.officeTier = 2;
  state.name = "Studio Sao Mai";
  await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "tier2.json",
    mimeType: "application/json",
    buffer: Buffer.from(await encodeSave(state)),
  });
  await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
  await expect
    .poll(async () => (await sign(page))?.text)
    .toBe("Studio Sao Mai");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("UI size").selectOption("150");
  await page.keyboard.press("Escape");
  await page.screenshot({
    path: info.outputPath("office-tier2-en-150-dpr2.png"),
  });
  await page.locator("canvas").press("+");
  await page.locator("canvas").press("ArrowLeft");
  await page.locator("canvas").press("0");
  await expect
    .poll(async () => (await sign(page))?.text)
    .toBe("Studio Sao Mai");
  await expect(page.locator(".canvas-error")).toHaveCount(0);
});
