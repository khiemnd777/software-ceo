import { test, expect, type Page } from "@playwright/test";
import { createGame } from "../../src/simulation/create";
import { encodeSave } from "../../src/persistence/saves";
import { APPEARANCE_IDS } from "../../src/characters/catalog";
import characterAtlas from "../../public/assets/characters/manifest.json" with { type: "json" };
import { writeFile } from "node:fs/promises";

type ImageDraw = {
  src: string;
  args: number[];
  matrix: number[];
  order: number;
};
type TextDraw = {
  text: string;
  matrix: number[];
  font: string;
  x: number;
  y: number;
  order: number;
};
type BadgeDraw = {
  x: number;
  y: number;
  width: number;
  height: number;
  matrix: number[];
};
declare global {
  interface Window {
    __officePaint: {
      images: ImageDraw[];
      texts: TextDraw[];
      badges: BadgeDraw[];
      order: number;
    };
    __officeWorldPasses: number;
    __officeGears: { radius: number; matrix: number[] }[];
    __officePixels?: Uint8ClampedArray;
  }
}

test.use({ deviceScaleFactor: 2 });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__officePaint = { images: [], texts: [], badges: [], order: 0 };
    window.__officeWorldPasses = 0;
    window.__officeGears = [];
    const matrix = (ctx: CanvasRenderingContext2D) => {
      const m = ctx.getTransform();
      return [m.a, m.b, m.c, m.d, m.e, m.f];
    };
    const draw = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (
      image: CanvasImageSource,
      ...coordinates: number[]
    ) {
      const args = [image, ...coordinates] as Parameters<typeof draw>;
      if (this.canvas.isConnected) {
        if (
          args[0] instanceof HTMLCanvasElement &&
          args[0].width === this.canvas.width &&
          args[0].height === this.canvas.height
        ) {
          window.__officeWorldPasses++;
          window.__officeGears = [];
          window.__officePaint = {
            images: [],
            texts: [],
            badges: [],
            order: 0,
          };
        }
        if (args[0] instanceof HTMLImageElement)
          window.__officePaint.images.push({
            src: args[0].src,
            args: args.slice(1) as number[],
            matrix: matrix(this),
            order: ++window.__officePaint.order,
          });
      }
      return draw.apply(this, args);
    };
    const text = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (
      value,
      x,
      y,
      maxWidth,
    ) {
      if (this.canvas.isConnected)
        window.__officePaint.texts.push({
          text: value,
          x,
          y,
          matrix: matrix(this),
          font: this.font,
          order: ++window.__officePaint.order,
        });
      if (maxWidth === undefined) text.call(this, value, x, y);
      else text.call(this, value, x, y, maxWidth);
    };
    const rect = CanvasRenderingContext2D.prototype.roundRect;
    CanvasRenderingContext2D.prototype.roundRect = function (
      x,
      y,
      width,
      height,
      radii,
    ) {
      if (this.canvas.isConnected && width === 24 && height === 24) {
        const badge = {
          x,
          y,
          width,
          height,
          matrix: matrix(this),
        };
        const center = (b: BadgeDraw) => [
          b.matrix[4] + (b.x + 12) * b.matrix[0],
          b.matrix[5] + (b.y + 12) * b.matrix[3],
        ];
        const p = center(badge);
        const index = window.__officePaint.badges.findIndex((b) => {
          const q = center(b);
          return Math.abs(p[0] - q[0]) < 0.01 && Math.abs(p[1] - q[1]) < 0.01;
        });
        // An animated badge may be repainted without a new world pass.
        if (index < 0) window.__officePaint.badges.push(badge);
        else window.__officePaint.badges[index] = badge;
      }
      return rect.call(this, x, y, width, height, radii);
    };
    const arc = CanvasRenderingContext2D.prototype.arc;
    CanvasRenderingContext2D.prototype.arc = function (
      x,
      y,
      radius,
      start,
      end,
      counterclockwise,
    ) {
      if (
        this.canvas.isConnected &&
        this.fillStyle === "#78dfc1" &&
        radius < 3
      ) {
        const item = { radius, matrix: matrix(this) };
        const index = window.__officeGears.findIndex(
          (g) =>
            Math.abs(g.matrix[4] - item.matrix[4]) < 0.01 &&
            Math.abs(g.matrix[5] - item.matrix[5]) < 0.01,
        );
        if (index < 0) window.__officeGears.push(item);
        else window.__officeGears[index] = item;
      }
      return arc.call(this, x, y, radius, start, end, counterclockwise);
    };
  });
});

function fixture(tier: number) {
  // Synthetic rendering fixture, not economic progression/playtest evidence.
  const s = createGame({
    name: "OFFICE DISPLAY QA",
    strategy: "outsourcing",
    difficulty: "standard",
    seed: 42,
  });
  s.officeTier = tier === 1 ? 1 : 2;
  const initial = s.employees[0];
  s.employees = Array.from({ length: tier === 1 ? 5 : 12 }, (_, i) => ({
    ...structuredClone(initial),
    id: `render-qa-${i}`,
    name: i === 0 ? "Nguyễn Hoàng Minh QA" : `Render QA ${i + 1}`,
    appearance: APPEARANCE_IDS[i % APPEARANCE_IDS.length],
    morale: i === 2 ? 20 : 76,
    energy: i === 2 ? 20 : 90,
    assignments:
      i % 3 === 1 ? [{ target: s.work[0].id, kind: "research" as const }] : [],
  }));
  return s;
}

async function load(
  page: Page,
  tier: number,
  locale = "vi",
  scale = 100,
  state = fixture(tier),
  reducedMotion = true,
) {
  await page.goto("/");
  await page.evaluate(
    ({ locale, scale, reducedMotion }) =>
      localStorage.setItem(
        "software-ceo-settings",
        JSON.stringify({
          locale,
          scale,
          reducedMotion,
          music: false,
          sfx: false,
          volume: 0.3,
        }),
      ),
    { locale, scale, reducedMotion },
  );
  await page.reload();
  await page
    .getByRole("button", {
      name: locale === "vi" ? "Tải bản lưu" : "Load game",
      exact: true,
    })
    .click();
  await page.locator("input[type=file]").setInputFiles({
    name: "render-fixture.json",
    mimeType: "application/json",
    buffer: Buffer.from(await encodeSave(state)),
  });
  await page
    .getByRole("button", {
      name: locale === "vi" ? "Đóng cửa sổ lưu" : "Close saves",
      exact: true,
    })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.__officePaint.badges.length))
    .toBe(state.employees.length);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.__officePaint.images.filter((i) =>
            i.src.includes("/characters/"),
          ).length,
      ),
    )
    .toBe(state.employees.length);
}

for (const tier of [1, 2]) {
  test(`office ${tier}: labels keep screen size, bounds and foreground order through zoom/fit`, async ({
    page,
  }, info) => {
    test.setTimeout(180000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const samples = [];
    for (const viewport of [
      { width: 1280, height: 720 },
      { width: 1920, height: 1080 },
    ]) {
      await page.setViewportSize(viewport);
      for (const locale of ["vi", "en"])
        for (const scale of [100, 150]) {
          await load(page, tier, locale, scale);
          const labels = page.locator(".world-overlays button:visible");
          const measure = async () => {
            const result = await labels.evaluateAll((buttons) =>
              buttons.map((button) => {
                const b = button.getBoundingClientRect(),
                  scene = button.parentElement!.getBoundingClientRect();
                return {
                  text: button.textContent,
                  x: b.x,
                  y: b.y,
                  width: b.width,
                  height: b.height,
                  inBounds:
                    b.left >= scene.left &&
                    b.right <= scene.right &&
                    b.top >= scene.top &&
                    b.bottom <= scene.bottom,
                };
              }),
            );
            expect(result.length).toBeGreaterThan(0);
            expect(result.every((r) => r.inBounds)).toBe(true);
            expect(
              result.every((a, i) =>
                result
                  .slice(i + 1)
                  .every(
                    (b) =>
                      a.x + a.width <= b.x ||
                      b.x + b.width <= a.x ||
                      a.y + a.height <= b.y ||
                      b.y + b.height <= a.y,
                  ),
              ),
            ).toBe(true);
            return result;
          };
          const fit = await measure();
          for (const name of [
            locale === "vi" ? "Phóng to" : "Zoom in",
            locale === "vi" ? "Thu nhỏ" : "Zoom out",
            locale === "vi" ? "Căn giữa" : "Fit",
          ]) {
            await page.getByRole("button", { name, exact: true }).click();
            await expect
              .poll(async () =>
                (await measure()).every((r) =>
                  fit.some(
                    (b) =>
                      b.text === r.text &&
                      b.width === r.width &&
                      b.height === r.height,
                  ),
                ),
              )
              .toBe(true);
          }
          // Hide HTML interaction labels to test Canvas names over actual furniture.
          await page
            .getByRole("button", {
              name:
                locale === "vi"
                  ? "Ẩn điểm tương tác"
                  : "Hide interaction points",
              exact: true,
            })
            .click();
          const canvas = page.locator("canvas"),
            b = (await canvas.boundingBox())!;
          const badge = await page.evaluate(
            () => window.__officePaint.badges[0],
          );
          await page.mouse.move(
            b.x + (badge.matrix[4] + (badge.x + 12) * badge.matrix[0]) / 2,
            b.y + (badge.matrix[5] + (badge.y + 12) * badge.matrix[3]) / 2,
          );
          await expect
            .poll(() =>
              page.evaluate(() =>
                window.__officePaint.texts.some((t) =>
                  t.text.includes("Nguyễn Hoàng Minh"),
                ),
              ),
            )
            .toBe(true);
          for (const name of [
            locale === "vi" ? "Phóng to" : "Zoom in",
            locale === "vi" ? "Thu nhỏ" : "Zoom out",
            locale === "vi" ? "Căn giữa" : "Fit",
          ]) {
            // Keyboard camera input leaves hover/selection intact.
            await canvas.focus();
            await canvas.press(
              name === "Fit" || name === "Căn giữa"
                ? "0"
                : name === "Zoom in" || name === "Phóng to"
                  ? "+"
                  : "-",
            );
            await expect
              .poll(() =>
                page.evaluate(() =>
                  window.__officePaint.texts.some((t) =>
                    t.text.includes("Nguyễn Hoàng Minh"),
                  ),
                ),
              )
              .toBe(true);
            const paint = await page.evaluate(() => window.__officePaint);
            const text = paint.texts.find((t) =>
              t.text.includes("Nguyễn Hoàng Minh"),
            )!;
            expect(text.matrix.slice(0, 4)).toEqual([2, 0, 0, 2]);
            expect(text.font).toContain("13px");
            expect(text.order).toBeGreaterThan(
              Math.max(...paint.images.map((i) => i.order)),
            );
            expect(
              paint.badges.every(
                (badge) =>
                  badge.matrix[0] === 2 &&
                  badge.width === 24 &&
                  badge.height === 24,
              ),
            ).toBe(true);
          }
          await page.screenshot({
            path: info.outputPath(
              `tier${tier}-${locale}-${scale}-${viewport.width}.png`,
            ),
          });
          samples.push({ viewport, locale, scale, labels: fit });
        }
    }
    expect(errors).toEqual([]);
    await writeFile(
      info.outputPath("matrix.json"),
      JSON.stringify(samples, null, 2),
    );
  });
}

test("seated backrest pixels survive the character pass while the full chair remains behind", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await load(page, 2);
  await page
    .getByRole("button", { name: "Ẩn điểm tương tác", exact: true })
    .click();
  const checks = await page.evaluate(async (characters) => {
    const canvas = document.querySelector("canvas")!,
      ctx = canvas.getContext("2d")!;
    const draws = window.__officePaint.images;
    const fronts = draws.filter(
      (d) => d.src.endsWith("chair.webp") && d.args.length === 2,
    );
    const source = new Image();
    source.src = fronts[0].src;
    await source.decode();
    const offscreen = document.createElement("canvas");
    offscreen.width = offscreen.height = 512;
    const original = offscreen.getContext("2d")!;
    original.drawImage(source, 0, 0);
    const reference = document.createElement("canvas");
    reference.width = canvas.width;
    reference.height = canvas.height;
    const rim = reference.getContext("2d")!;
    const personCanvas = document.createElement("canvas");
    personCanvas.width = canvas.width;
    personCanvas.height = canvas.height;
    const personContext = personCanvas.getContext("2d")!;
    const avatars = draws
      .filter((d) => d.src.includes("/characters/"))
      .map((draw) => {
        const model = Object.values(characters.models).find((m) =>
          draw.src.endsWith(m.file),
        )!;
        const frame = Object.values(model.tracks)
          .flat()
          .find((f) => f.rect.every((n, i) => n === draw.args[i]))!;
        const scale = draw.args[6] / draw.args[2];
        return {
          draw,
          footX:
            draw.matrix[4] +
            (draw.args[4] - frame.offset[0] * scale) * draw.matrix[0],
          footY:
            draw.matrix[5] +
            (draw.args[5] - frame.offset[1] * scale) * draw.matrix[3],
        };
      });
    const avatarImages = new Map<string, HTMLImageElement>();
    for (const avatar of avatars) {
      if (avatarImages.has(avatar.draw.src)) continue;
      const image = new Image();
      image.src = avatar.draw.src;
      await image.decode();
      avatarImages.set(avatar.draw.src, image);
    }
    return fronts.map((front) => {
      // Interior backrest point overlapped by the sitter's torso before the fix.
      const x = 185,
        y = 274;
      const expected = original.getImageData(x, y, 1, 1).data;
      const actual = ctx.getImageData(
        Math.round(front.matrix[4] + x * front.matrix[0]),
        Math.round(front.matrix[5] + y * front.matrix[3]),
        1,
        1,
      ).data;
      const rear = draws.find(
        (d) =>
          d.src.endsWith("chair.webp") &&
          d.args.length === 8 &&
          Math.abs(
            d.matrix[4] +
              d.args[4] * d.matrix[0] -
              (front.matrix[4] + 137 * front.matrix[0]),
          ) < 1,
      );
      rim.setTransform(1, 0, 0, 1, 0, 0);
      rim.clearRect(0, 0, reference.width, reference.height);
      rim.setTransform(
        ...(front.matrix as [number, number, number, number, number, number]),
      );
      rim.drawImage(source, 0, 0);
      const rimChecks = [
        [249, 337],
        [251, 340],
        [250, 344],
      ].map(([x, y]) => {
        const px = Math.round(front.matrix[4] + x * front.matrix[0]),
          py = Math.round(front.matrix[5] + y * front.matrix[3]);
        const expected = rim.getImageData(px, py, 1, 1).data;
        const actual = ctx.getImageData(px, py, 1, 1).data;
        return {
          x,
          y,
          expected: [...expected],
          actual: [...actual],
          delta: Math.max(
            ...[0, 1, 2].map((i) => Math.abs(expected[i] - actual[i])),
          ),
        };
      });
      const avatar = avatars.find(
        (a) =>
          Math.abs(a.footX - front.matrix[4] - 256 * front.matrix[0]) < 1 &&
          Math.abs(
            a.footY - front.matrix[5] - 378.3186225483125 * front.matrix[3],
          ) < 1,
      )!;
      personContext.setTransform(1, 0, 0, 1, 0, 0);
      personContext.clearRect(0, 0, canvas.width, canvas.height);
      personContext.setTransform(
        ...(avatar.draw.matrix as [
          number,
          number,
          number,
          number,
          number,
          number,
        ]),
      );
      personContext.drawImage(
        avatarImages.get(avatar.draw.src)!,
        ...(avatar.draw.args as [
          number,
          number,
          number,
          number,
          number,
          number,
          number,
          number,
        ]),
      );
      let nearLeg: {
        x: number;
        y: number;
        expected: number[];
        actual: number[];
        delta: number;
      } | null = null;
      for (let y = 324; y <= 351 && !nearLeg; y++)
        for (let x = 264; x <= 280 && !nearLeg; x++) {
          const px = Math.round(front.matrix[4] + x * front.matrix[0]),
            py = Math.round(front.matrix[5] + y * front.matrix[3]);
          const expected = personContext.getImageData(px, py, 1, 1).data,
            chair = rim.getImageData(px, py, 1, 1).data;
          if (
            expected[3] < 254 ||
            chair[3] < 254 ||
            Math.max(
              ...[0, 1, 2].map((i) => Math.abs(expected[i] - chair[i])),
            ) < 30
          )
            continue;
          const actual = ctx.getImageData(px, py, 1, 1).data;
          nearLeg = {
            x,
            y,
            expected: [...expected],
            actual: [...actual],
            delta: Math.max(
              ...[0, 1, 2].map((i) => Math.abs(expected[i] - actual[i])),
            ),
          };
        }
      return {
        expected: [...expected],
        actual: [...actual],
        rearOrder: rear?.order,
        frontOrder: front.order,
        rimChecks,
        nearLeg,
        appearance: avatar.draw.src.split("/").at(-1),
        delta: Math.max(
          ...[0, 1, 2].map((i) => Math.abs(expected[i] - actual[i])),
        ),
      };
    });
  }, characterAtlas);
  await writeFile(
    info.outputPath("chair-pixels.json"),
    JSON.stringify(checks, null, 2),
  );
  await page.screenshot({ path: info.outputPath("seated-occlusion-12.png") });
  expect(checks).toHaveLength(12);
  expect(
    checks.every(
      (c) => c.rearOrder !== undefined && c.rearOrder < c.frontOrder,
    ),
  ).toBe(true);
  expect(checks.every((c) => c.delta < 7)).toBe(true);
  expect(checks.every((c) => c.rimChecks.every((p) => p.delta < 4))).toBe(true);
  expect(
    checks.every((c) => c.rimChecks.every((p) => p.expected[3] === 255)),
  ).toBe(true);
  expect(checks.every((c) => c.nearLeg !== null && c.nearLeg.delta < 4)).toBe(
    true,
  );
});

test("Working has two unequal counter-rotating gears during Pause, without repainting the office", async ({
  page,
}, info) => {
  await load(page, 1, "vi", 100, fixture(1), false);
  await page
    .getByRole("button", { name: "Ẩn điểm tương tác", exact: true })
    .click();
  await page.mouse.move(0, 0);
  await expect
    .poll(() => page.evaluate(() => window.__officeGears.length))
    .toBe(4);
  const capture = () =>
    page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
      window.__officePixels ??= canvas
        .getContext("2d")!
        .getImageData(0, 0, canvas.width, canvas.height).data;
      return {
        world: window.__officeWorldPasses,
        gears: window.__officeGears,
        badges: window.__officePaint.badges,
      };
    });
  const before = await capture();
  await page.waitForTimeout(180);
  const after = await capture();
  expect(after.world).toBe(before.world);
  expect(after.gears).toHaveLength(4);
  expect(new Set(after.gears.map((g) => g.radius)).size).toBe(2);
  // The renderer canonicalizes equivalent rotations after one tooth pitch.
  const delta = (a: number, b: number, teeth: number) =>
    Math.atan2(Math.sin((b - a) * teeth), Math.cos((b - a) * teeth)) / teeth;
  for (let i = 0; i < 4; i += 2) {
    const angles = [0, 1].map((j) =>
      delta(
        Math.atan2(
          before.gears[i + j].matrix[1],
          before.gears[i + j].matrix[0],
        ),
        Math.atan2(after.gears[i + j].matrix[1], after.gears[i + j].matrix[0]),
        j === 0 ? 8 : 6,
      ),
    );
    expect(angles[0]).toBeGreaterThan(0);
    expect(angles[1]).toBeLessThan(0);
    expect(Math.abs(angles[1] / angles[0])).toBeCloseTo(4 / 3, 3);
  }
  const workingCenters = before.gears
    .filter((_, i) => i % 2 === 0)
    .map(
      (g) =>
        before.badges
          .map((b) => ({
            x: b.matrix[4] + (b.x + 12) * b.matrix[0],
            y: b.matrix[5] + (b.y + 12) * b.matrix[3],
          }))
          .sort(
            (a, b) =>
              (a.x - g.matrix[4]) ** 2 +
              (a.y - g.matrix[5]) ** 2 -
              (b.x - g.matrix[4]) ** 2 -
              (b.y - g.matrix[5]) ** 2,
          )[0],
    );
  const { changedInside, changedOutside } = await page
    .locator("canvas")
    .evaluate((canvas: HTMLCanvasElement, centers) => {
      const before = window.__officePixels!,
        after = canvas
          .getContext("2d")!
          .getImageData(0, 0, canvas.width, canvas.height).data;
      let changedInside = 0,
        changedOutside = 0;
      for (let i = 0; i < before.length; i += 4) {
        if (
          before[i] === after[i] &&
          before[i + 1] === after[i + 1] &&
          before[i + 2] === after[i + 2] &&
          before[i + 3] === after[i + 3]
        )
          continue;
        const x = (i / 4) % canvas.width,
          y = Math.floor(i / 4 / canvas.width);
        if (
          centers.some(
            (c) => Math.abs(x - c.x) <= 25 && Math.abs(y - c.y) <= 25,
          )
        )
          changedInside++;
        else changedOutside++;
      }
      delete window.__officePixels;
      return { changedInside, changedOutside };
    }, workingCenters);
  expect(changedInside).toBeGreaterThan(0);
  expect(changedOutside).toBe(0);
  await expect(
    page.getByRole("button", { name: "Chạy mô phỏng", exact: true }),
  ).toBeVisible();
  await writeFile(
    info.outputPath("gears-pause.json"),
    JSON.stringify(
      {
        worldPasses: after.world,
        changedInside,
        changedOutside,
        gearsBefore: before.gears,
        gearsAfter: after.gears,
      },
      null,
      2,
    ),
  );
  await page.screenshot({ path: info.outputPath("gears-working.png") });
});

test("reduced motion keeps both gears still and hidden document stops the UI clock", async ({
  page,
}, info) => {
  const hash = () =>
    page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
      const pixels = canvas
        .getContext("2d")!
        .getImageData(0, 0, canvas.width, canvas.height).data;
      let hash = 2166136261;
      for (const byte of pixels) hash = Math.imul(hash ^ byte, 16777619);
      return hash >>> 0;
    });
  await load(page, 1);
  await page.mouse.move(0, 0);
  await expect
    .poll(() => page.evaluate(() => window.__officeGears.length))
    .toBe(4);
  const reduced = await hash();
  await page.waitForTimeout(180);
  expect(await hash()).toBe(reduced);
  await load(page, 1, "vi", 100, fixture(1), false);
  await page.mouse.move(0, 0);
  await expect
    .poll(() => page.evaluate(() => window.__officeGears.length))
    .toBe(4);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(80);
  const hidden = await hash();
  await page.waitForTimeout(180);
  expect(await hash()).toBe(hidden);
  await page.evaluate(() => {
    delete (document as unknown as { hidden?: boolean }).hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(180);
  expect(await hash()).not.toBe(hidden);
  await writeFile(
    info.outputPath("gear-lifecycle.json"),
    JSON.stringify({
      reducedMotionStatic: true,
      emulatedHiddenStatic: true,
      resumed: true,
      nativeVisibility: "NOT_RUN",
    }),
  );
});

test("all eight appearances render stand, turn, walk and sit poses with stable paused pixels", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1920, height: 1080 });
  const phases = [0, 32, 33, 35, 36, 37, 38, 39, 41, 43, 45, 46];
  for (const phase of phases) {
    const s = fixture(2);
    s.employees = s.employees.slice(0, 8).map((e, i) => {
      let suffix = 0,
        id = "";
      do {
        id = `motion-qa-${i}-${suffix++}`;
      } while (
        [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0) % 47 !==
        phase
      );
      return { ...e, id, morale: 76, energy: 90, assignments: [] };
    });
    await load(page, 2, "vi", 100, s, false);
    await page
      .getByRole("button", { name: "Ẩn điểm tương tác", exact: true })
      .click();
    await page.mouse.move(0, 0);
    const hash = () =>
      page.locator("canvas").evaluate((canvas: HTMLCanvasElement) => {
        const pixels = canvas
          .getContext("2d")!
          .getImageData(0, 0, canvas.width, canvas.height).data;
        let value = 2166136261;
        for (const byte of pixels) value = Math.imul(value ^ byte, 16777619);
        return value >>> 0;
      });
    const before = await hash();
    await page.waitForTimeout(150);
    expect(await hash()).toBe(before);
    const rendered = await page.evaluate(() =>
      window.__officePaint.images
        .filter((i) => i.src.includes("/characters/"))
        .map((i) => i.src.split("/").at(-1)),
    );
    expect(new Set(rendered).size).toBe(8);
    await page.screenshot({
      path: info.outputPath(`motion-phase-${phase}.png`),
    });
  }
});

test("warning callout explains both causes; badge selects the employee and keyboard can return", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await load(page, 1);
  await page
    .getByRole("button", { name: "Ẩn điểm tương tác", exact: true })
    .click();
  const canvas = page.locator("canvas"),
    box = (await canvas.boundingBox())!;
  // World drawing is depth ordered: the warning employee is the third badge.
  const badge = await page.evaluate(() => window.__officePaint.badges[2]);
  const x = box.x + (badge.matrix[4] + (badge.x + 12) * badge.matrix[0]) / 2;
  const y = box.y + (badge.matrix[5] + (badge.y + 12) * badge.matrix[3]) / 2;
  await page.mouse.move(x, y);
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__officePaint.texts.map((t) => t.text).join(" "),
      ),
    )
    .toContain("Tinh thần thấp · Năng lượng thấp");
  await page.screenshot({ path: info.outputPath("warning-tooltip.png") });
  await page.mouse.click(x, y);
  await expect(page.locator(".entity-header h1")).toContainText("Render QA 3");
  await page
    .getByRole("button", { name: "Đóng thông tin", exact: true })
    .press("Escape");
  await expect(page.locator(".entity-sheet")).toHaveCount(0);
});
