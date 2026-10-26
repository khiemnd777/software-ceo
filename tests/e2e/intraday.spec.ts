import { test, expect, type Page } from "@playwright/test";
import { createGame } from "../../src/simulation/create";
import { transition } from "../../src/simulation/engine";
import { encodeSave } from "../../src/persistence/saves";
import { weatherForDay } from "../../src/renderer/lighting/weatherTimeline";
import { openOffice } from "./simulate-helpers";

function fixture(minute = 540, seed = 51) {
  let s = createGame({
    name: "CLOCK LOCAL QA",
    strategy: "outsourcing",
    difficulty: "standard",
    seed,
  });
  for (const c of [
    { type: "sign", contractId: s.contracts[0].id },
    {
      type: "assign",
      employeeId: s.employees[0].id,
      target: s.work[0].id,
      kind: "develop",
    },
    { type: "advanceTime", steps: minute / 15 },
  ] as const) {
    if (c.type === "advanceTime" && !c.steps) continue;
    const r = transition(s, c);
    if (!r.ok) throw Error(r.error?.en);
    s = r.state;
  }
  return s;
}
async function load(page: Page, state = fixture(), en = false, restart = true) {
  if (restart) await page.goto("/");
  await page
    .getByRole("button", {
      name: restart
        ? en
          ? "Load game"
          : "Tải bản lưu"
        : en
          ? "Save and load"
          : "Lưu và tải",
      exact: true,
    })
    .click();
  await page.locator("input[type=file]").setInputFiles({
    name: "clock.json",
    mimeType: "application/json",
    buffer: Buffer.from(await encodeSave(state)),
  });
  await page
    .getByRole("button", { name: en ? "Close saves" : "Đóng cửa sổ lưu" })
    .click();
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-monitors",
    /worldPass/,
  );
}
const frame = (page: Page) =>
  page.locator("canvas").evaluate((el) => ({
    sky: JSON.parse(el.getAttribute("data-sky-frame")!),
    light: JSON.parse(el.getAttribute("data-window-light")!),
    monitors: JSON.parse(el.getAttribute("data-monitors")!),
  }));

test("24h: clock quarters, continuous sun/light, Pause animations and light persistence", async ({
  page,
}, info) => {
  await load(page);
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  await page.getByLabel("Nhịp thời gian").selectOption("120");
  await page.getByRole("button", { name: "Đóng", exact: true }).click();
  await page.getByRole("button", { name: "1×", exact: true }).click();
  const samples = [];
  for (let i = 0; i < 4; i++) {
    samples.push({
      clock: await page.locator(".game-clock").innerText(),
      ...(await frame(page)),
    });
    await page.waitForTimeout(70);
  }
  await page.getByRole("button", { name: "Tạm dừng", exact: true }).click();
  expect(new Set(samples.map((s) => s.clock)).size).toBe(1);
  expect(new Set(samples.map((s) => s.sky.sun.x)).size).toBeGreaterThan(1);
  expect(
    new Set(samples.map((s) => s.light.sources[0].drift)).size,
  ).toBeGreaterThan(1);
  const before = await frame(page);
  await page.waitForTimeout(300);
  const after = await frame(page);
  expect(after.sky).toEqual(before.sky);
  expect(after.light.minute).toBe(before.light.minute);
  expect(after.monitors.worldPass).toBe(before.monitors.worldPass);
  expect(after.monitors.tick).toBeGreaterThan(before.monitors.tick);
  const light = page.getByRole("button", {
    name: "Công tắc đèn văn phòng",
    exact: true,
  });
  await light.press("Space");
  await expect(light).toHaveAttribute("aria-pressed", "false");
  expect((await frame(page)).monitors.tiles.length).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất JSON", exact: true }).click();
  const exported = await downloadPromise;
  const path = info.outputPath("midshift-lights-off.json");
  await exported.saveAs(path);
  await page.locator("input[type=file]").setInputFiles(path);
  await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
  await expect(light).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("button", { name: "Chạy mô phỏng", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "+15 phút", exact: true }).click();
  await expect(page.locator(".game-clock")).toHaveText("09:15");
  await page.screenshot({
    path: info.outputPath("09-15-working-lights-off.png"),
  });
});

test("24h: both locales, 3 UI scales, 2 viewports; switch misses Project and roster finds absent staff", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await load(page);
  for (const en of [false, true]) {
    if (en) await page.getByRole("button", { name: "EN", exact: true }).click();
    for (const scale of [100, 125, 150])
      for (const viewport of [
        { width: 1280, height: 720 },
        { width: 1920, height: 1080 },
      ]) {
        await page.setViewportSize(viewport);
        await page
          .getByRole("button", {
            name: en ? "Settings" : "Cài đặt",
            exact: true,
          })
          .click();
        await page
          .getByLabel(en ? "UI size" : "Cỡ giao diện")
          .selectOption(String(scale));
        await page
          .getByRole("button", { name: en ? "Close" : "Đóng", exact: true })
          .click();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const switchButton = page.locator(".wall-light-switch");
        const box = (await switchButton.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
        const controls = await page
          .locator(".time-controls button")
          .evaluateAll((buttons) =>
            buttons.map((el) => {
              const r = el.getBoundingClientRect();
              return (
                r.left >= 0 &&
                r.top >= 0 &&
                r.right <= innerWidth &&
                r.bottom <= innerHeight
              );
            }),
          );
        expect(controls.every(Boolean)).toBe(true);
        const state = await switchButton.getAttribute("aria-pressed");
        await page
          .getByRole("button", {
            name: en ? "Project board 1" : "Bảng dự án 1",
            exact: true,
          })
          .click();
        await expect(page.locator(".entity-sheet")).toBeVisible();
        await expect(switchButton).toHaveAttribute("aria-pressed", state!);
        await openOffice(page, en ? "Office" : "Văn phòng");
        const noOverlap = await page.evaluate(() => {
          const a = document
              .querySelector(".office-time-status")!
              .getBoundingClientRect(),
            b = document
              .querySelector(".camera-controls")!
              .getBoundingClientRect();
          return (
            a.bottom <= b.top ||
            b.bottom <= a.top ||
            a.right <= b.left ||
            b.right <= a.left
          );
        });
        expect(noOverlap).toBe(true);
        await page.screenshot({
          path: info.outputPath(
            `office-${en ? "en" : "vi"}-${scale}-${viewport.width}.png`,
          ),
        });
      }
  }
  await page.getByRole("button", { name: "Next day", exact: false }).click();
  await expect(page.locator(".person-point:visible")).toHaveCount(0);
  await openOffice(page, "People");
  await expect(page.locator(".entity-sheet")).toContainText("Minh Nguyễn");
});

test("24h: 5 deterministic weather modes, lunch and OT presence with no test controls in game", async ({
  page,
}, info) => {
  let firstWeather = true;
  for (const weather of ["sunny", "cloudy", "rain", "wind", "rain-wind"]) {
    let seed = 1;
    while (weatherForDay(seed, 0) !== weather) seed++;
    await load(page, fixture(540, seed), false, firstWeather);
    firstWeather = false;
    await expect
      .poll(async () => (await frame(page)).light.weather)
      .toBe(weather);
    await page.screenshot({ path: info.outputPath(`weather-${weather}.png`) });
  }
  for (const [minute, ot, count, tiles] of [
    [720, false, 2, 0],
    [1080, false, 0, 0],
    [1080, true, 1, 1],
    [1200, true, 0, 0],
  ] as const) {
    let s = fixture(minute);
    s = transition(s, { type: "overtime", enabled: ot }).state;
    await load(page, s);
    await expect(page.locator(".person-point:visible")).toHaveCount(count);
    await expect
      .poll(async () => (await frame(page)).monitors.tiles.length)
      .toBe(tiles);
  }
  await expect(
    page.getByRole("button", { name: /rewind|48h|seek/i }),
  ).toHaveCount(0);
});
