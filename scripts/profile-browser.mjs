import { launchBrowser } from "./browser-runtime.mjs";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  mkdirSync,
} from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
const browser = await launchBrowser({ cdp: true });
const baseURL = process.env.CEO_BASE_URL ?? "http://127.0.0.1:4173/";
const evidenceDir = process.env.CEO_EVIDENCE_DIR ?? "evidence";
mkdirSync(evidenceDir, { recursive: true });
const output = (name) => resolve(evidenceDir, name);
const digest = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");
function fixedBuild() {
  const files = {};
  function visit(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) visit(path);
      else files[path] = digest(path);
    }
  }
  visit("dist");
  files["evidence/fixtures/office-12-profile.json"] = digest(
    "evidence/fixtures/office-12-profile.json",
  );
  return files;
}
const buildBefore = fixedBuild();
async function openPlace(page, name) {
  const close = page.getByRole("button", {
    name: "Đóng thông tin",
    exact: true,
  });
  if (await close.count()) await close.click();
  if (!name) return;
  await page.locator(".find-object").click();
  await page.locator(".find-dialog input").fill(name);
  await page
    .locator(".find-results button")
    .filter({
      has: page.getByText(name, { exact: true }),
    })
    .click();
}
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
});
await context.addInitScript(() => {
  const original = window.Audio;
  window.__qaAudio = [];
  window.Audio = class extends original {
    constructor(src) {
      super(src);
      window.__qaAudio.push(this);
    }
  };
});
await context.addInitScript(() => {
  window.__ceoPaintCount = 0;
  const original = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function (...args) {
    if (this.canvas.isConnected && args[0] instanceof HTMLCanvasElement)
      window.__ceoPaintCount++;
    return original.apply(this, args);
  };
});
const page = await context.newPage(),
  errors = [],
  network = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => {
  if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`);
  network.push(r.url());
});
await page.goto(baseURL);
await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
await page.getByRole("button", { name: "Mở cửa công ty" }).click();
await page.waitForTimeout(1200);
const firstPlay = await page.evaluate(() =>
  performance.getEntriesByType("resource").map((r) => ({
    name: r.name.split("/").pop(),
    encodedBodySize: r.encodedBodySize,
    decodedBodySize: r.decodedBodySize,
    transferSize: r.transferSize,
  })),
);
await page.screenshot({ path: output("W5-office-1920.png"), fullPage: true });
await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
await page
  .locator("input[type=file]")
  .setInputFiles(resolve("evidence/fixtures/office-12-profile.json"));
await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
await page.getByRole("button", { name: "Thu gọn hoặc mở hướng dẫn" }).click();
await page.getByRole("button", { name: "1×", exact: true }).click();
const cdp = await context.newCDPSession(page);
await cdp.send("Performance.enable");
const profiles = [];
for (const viewport of [
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
]) {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(4000);
  const measurement = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const frames = [];
        const paintStart = window.__ceoPaintCount;
        let last = performance.now(),
          start = last;
        function next(t) {
          frames.push(t - last);
          last = t;
          if (t - start < 10000) requestAnimationFrame(next);
          else {
            const sorted = [...frames].sort((a, b) => a - b);
            resolve({
              visibleCanvasPaints: window.__ceoPaintCount - paintStart,
              durationMs: t - start,
              frames: frames.length,
              fps: (frames.length / (t - start)) * 1000,
              p50Ms: sorted[Math.floor(sorted.length * 0.5)],
              p95Ms: sorted[Math.floor(sorted.length * 0.95)],
              p99Ms: sorted[Math.floor(sorted.length * 0.99)],
              framesOver33ms: frames.filter((x) => x > 33.34).length,
              hardwareConcurrency: navigator.hardwareConcurrency,
              dpr: devicePixelRatio,
            });
          }
        }
        requestAnimationFrame(next);
      }),
  );
  profiles.push({
    viewport,
    staff: 12,
    roles: 5,
    run: profiles.length + 1,
    running: await page
      .getByRole("button", { name: "1×", exact: true })
      .getAttribute("aria-pressed"),
    measurement,
  });
  await page.screenshot({
    path: output(`W5-office-12-${viewport.width}-run${profiles.length}.png`),
    fullPage: true,
  });
}
const box = await page.locator("canvas").boundingBox();
const panStart = await page.evaluate(() => ({
  time: performance.now(),
  paints: window.__ceoPaintCount,
}));
await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.65);
await page.mouse.down();
for (let i = 0; i < 120; i++) {
  await page.mouse.move(
    box.x + box.width * 0.45 + Math.sin(i / 20) * 45,
    box.y + box.height * 0.65 + Math.cos(i / 20) * 20,
  );
  await page.waitForTimeout(16);
}
await page.mouse.up();
const panEnd = await page.evaluate(() => ({
  time: performance.now(),
  paints: window.__ceoPaintCount,
}));
const cameraInteraction = {
  durationMs: panEnd.time - panStart.time,
  visibleCanvasPaints: panEnd.paints - panStart.paints,
};
await page.locator("canvas").focus();
await page.keyboard.press("0");
// Listen to actual browser audio element playback and pause after explicit UI gestures.
await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
await page.getByLabel("Nhạc nền").check();
await page.getByLabel("Hiệu ứng âm thanh").check();
await page.waitForTimeout(1000);
const audioPlaying = await page.evaluate(() =>
  window.__qaAudio.map((a) => ({
    src: a.src.split("/").pop(),
    paused: a.paused,
    currentTime: a.currentTime,
    readyState: a.readyState,
    error: a.error?.message ?? null,
  })),
);
await page.getByLabel("Nhạc nền").uncheck();
await page.getByLabel("Hiệu ứng âm thanh").uncheck();
const audioMuted = await page.evaluate(() =>
  window.__qaAudio.every((a) => a.paused),
);
await page.getByRole("button", { name: "Đóng", exact: true }).click();
const accessibility = [];
for (const view of [
  "",
  "Bảng dự án",
  "Đội ngũ",
  "Khách hàng",
  "Bàn tài chính",
  "Bàn họp",
  "Nhật ký công ty",
]) {
  await openPlace(page, view);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  accessibility.push({
    view,
    passes: result.passes.length,
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
}
await cdp.send("HeapProfiler.collectGarbage");
const before = Object.fromEntries(
  (await cdp.send("Performance.getMetrics")).metrics.map((x) => [
    x.name,
    x.value,
  ]),
);
for (let i = 0; i < 10; i++)
  for (const view of ["", "Bảng dự án", "Đội ngũ", "Bàn tài chính"])
    await openPlace(page, view);
await cdp.send("HeapProfiler.collectGarbage");
const after = Object.fromEntries(
  (await cdp.send("Performance.getMetrics")).metrics.map((x) => [
    x.name,
    x.value,
  ]),
);
await openPlace(page, "");
const sibling = await context.newPage();
await sibling.goto("about:blank");
await sibling.bringToFront();
await page.waitForTimeout(300);
const actualHidden = await page.evaluate(() => document.hidden);
await sibling.close();
await page.bringToFront();
const bytes = (dir) =>
  readdirSync(dir, { withFileTypes: true }).reduce(
    (n, f) =>
      n +
      (f.isDirectory()
        ? bytes(dir + "/" + f.name)
        : f.name.endsWith(".map")
          ? 0
          : statSync(dir + "/" + f.name).size),
    0,
  );
const buildAfter = fixedBuild();
const buildStable = JSON.stringify(buildBefore) === JSON.stringify(buildAfter);
writeFileSync(
  output("browser-profile.json"),
  JSON.stringify(
    {
      browser: browser.version(),
      url: baseURL,
      chromiumSandbox: true,
      buildStable,
      buildBefore,
      buildAfter,
      cameraInteraction,
      environment: `Headless ${process.platform}/${process.arch} ${process.env.CEO_BROWSER ?? "default Chromium target"}. Each viewport warms for 4 seconds before a 10-second sample; two repetitions each. Animation and x1 simulation enabled using a public-command fixture after resolving the due event. Not a consumer desktop GPU benchmark. No other browser soak or balance process was active during this final measurement. The display clock is measured separately from actual Canvas repaints: 8 fps authored poses redraw on change; camera/walking interpolate on the display clock; unchanged paused frames are not repainted.`,
      profiles,
      firstPlay,
      firstPlayEncodedBytes: firstPlay.reduce(
        (n, r) => n + r.encodedBodySize,
        0,
      ),
      distTransferFilesBytes: bytes("dist"),
      audioPlaying,
      audioMuted,
      realTabSwitchHidden: actualHidden,
      memory: {
        beforeHeap: before.JSHeapUsedSize,
        afterHeap: after.JSHeapUsedSize,
        beforeNodes: before.Nodes,
        afterNodes: after.Nodes,
        beforeListeners: before.JSEventListeners,
        afterListeners: after.JSEventListeners,
        note: "Post-GC JS heap only; excludes decoded image/GPU memory. 40 view switches.",
      },
      errors,
      externalRequests: network.filter(
        (u) => !u.startsWith(new URL(baseURL).origin + "/"),
      ),
    },
    null,
    2,
  ),
);
writeFileSync(
  output("accessibility.json"),
  JSON.stringify(accessibility, null, 2),
);
console.log(
  JSON.stringify(
    {
      profiles,
      audioPlaying,
      audioMuted,
      errors,
      accessibility: accessibility.map((a) => ({
        view: a.view,
        violations: a.violations.length,
      })),
      actualHidden,
    },
    null,
    2,
  ),
);
await browser.close();
if (
  !buildStable ||
  errors.length ||
  accessibility.some((a) => a.violations.length)
)
  throw Error(
    "Profile validation failed: inspect build hashes, errors and accessibility evidence.",
  );
