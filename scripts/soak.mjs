import { launchBrowser } from "./browser-runtime.mjs";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { buildDigest, soakFailures } from "./soak-evidence.mjs";

const minutes = Number(process.argv[2] ?? 30);
if (!Number.isInteger(minutes) || minutes < 30 || minutes > 60)
  throw Error("Request 30–60 actual wall-clock minutes");
const evidenceDir = process.env.CEO_EVIDENCE_DIR ?? "evidence";
mkdirSync(evidenceDir, { recursive: true });
const output = (name) => resolve(evidenceDir, name);
const fixturePath =
  process.env.CEO_SOAK_FIXTURE ?? "evidence/fixtures/office-12.json";
const initialBuild = buildDigest();
const browser = await launchBrowser({ cdp: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
});
const page = await context.newPage();
const errors = [],
  samples = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => {
  if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`);
});
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
const cdp = await context.newCDPSession(page);
await cdp.send("Performance.enable");
const started = Date.now();
await page.goto(process.env.CEO_BASE_URL ?? "http://127.0.0.1:4173/");
await page.getByRole("button", { name: "Tải bản lưu", exact: true }).click();
await page.evaluate(
  (raw) => {
    const input = document.querySelector("input[type=file]");
    const transfer = new DataTransfer();
    transfer.items.add(
      new File([raw], "office-12.json", { type: "application/json" }),
    );
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  },
  readFileSync(fixturePath, "utf8"),
);
await page.locator(".scene-toolbar").waitFor();
await page.waitForTimeout(200);
await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
await page.getByRole("button", { name: "Thu gọn hoặc mở hướng dẫn" }).click();
const fixtureDigest = createHash("sha256")
  .update(readFileSync(fixturePath))
  .digest("hex");
const gameDigest = initialBuild.sha256;
for (let minute = 0; minute < minutes; minute++) {
  if (minute > 0 && minute % 4 === 0) {
    await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
    await page.evaluate(
      (raw) => {
        const input = document.querySelector("input[type=file]");
        const transfer = new DataTransfer();
        transfer.items.add(
          new File([raw], "office-12.json", { type: "application/json" }),
        );
        input.files = transfer.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      },
      readFileSync(fixturePath, "utf8"),
    );
    await page.locator(".scene-toolbar").waitFor();
    await page.waitForTimeout(200);
    await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
  }
  const speed = [1, 2, 4][minute % 3];
  await page.getByRole("button", { name: speed + "×", exact: true }).click();
  for (const view of [
    "Bảng dự án",
    "Đội ngũ",
    "Khách hàng",
    "Bàn tài chính",
    "Bàn họp",
    "Nhật ký công ty",
    "",
  ]) {
    const close = page.getByRole("button", {
      name: "Đóng thông tin",
      exact: true,
    });
    if (await close.count()) await close.click();
    if (view) {
      await page.locator(".find-object").click();
      await page.locator(".find-dialog input").fill(view);
      await page
        .locator(".find-results button")
        .filter({
          has: page.getByText(view, { exact: true }),
        })
        .click();
    }
  }
  await page.setViewportSize(
    minute % 2 ? { width: 1280, height: 720 } : { width: 1920, height: 1080 },
  );
  await page.locator("canvas").focus();
  await page.keyboard.press("+");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("0");
  // This is a real wall-clock soak, not a simulated-duration claim. Each wait is <= 10 s.
  for (let n = 0; n < 6; n++) await page.waitForTimeout(10000);
  await cdp.send("HeapProfiler.collectGarbage");
  const metrics = Object.fromEntries(
    (await cdp.send("Performance.getMetrics")).metrics.map((x) => [
      x.name,
      x.value,
    ]),
  );
  samples.push({
    minute: minute + 1,
    speed,
    elapsedMs: Date.now() - started,
    day: await page.locator(".date").innerText(),
    heapBytes: metrics.JSHeapUsedSize,
    nodes: metrics.Nodes,
    documents: metrics.Documents,
    listeners: metrics.JSEventListeners,
  });
  console.log(JSON.stringify(samples.at(-1)));
  writeFileSync(
    output("soak-progress.json"),
    JSON.stringify(
      {
        startedAt: new Date(started).toISOString(),
        gameDigest,
        fixtureDigest,
        browser: browser.version(),
        minutesRequested: minutes,
        samples,
        errors,
      },
      null,
      2,
    ),
  );
}
await page.screenshot({ path: output("W5-soak-final.png"), fullPage: true });
await cdp.send("HeapProfiler.collectGarbage");
const finalMetrics = Object.fromEntries(
  (await cdp.send("Performance.getMetrics")).metrics.map((x) => [
    x.name,
    x.value,
  ]),
);
const elapsedMs = Date.now() - started,
  finalBuild = buildDigest();
const failures = soakFailures({
  minutes,
  samples,
  elapsedMs,
  initialDigest: gameDigest,
  finalDigest: finalBuild.sha256,
  errors,
});
mkdirSync("evidence", { recursive: true });
writeFileSync(
  output(`soak-${minutes}min.json`),
  JSON.stringify(
    {
      result: failures.length ? "FAIL" : "PASS",
      failures,
      buildManifest: initialBuild.manifest,
      finalBuildDigest: finalBuild.sha256,
      host: {
        platform: process.platform,
        arch: process.arch,
        node: process.version,
      },
      memoryReview:
        "Inspect warmed per-viewport series for retained growth; PASS validates completed run, frozen build, metrics and runtime errors, not a universal leak-free guarantee.",
      browser: browser.version(),
      startedAt: new Date(started).toISOString(),
      elapsedMs: Date.now() - started,
      gameDigest,
      fixtureDigest,
      scope:
        "Real-time production renderer/UI/save-load soak; imports use real File/DataTransfer change events to avoid CDP DOM.setFileInputFiles retaining detached nodes in instrumentation with 12 staff; import same public-command fixture every 4 minutes to exercise repeat loads and keep company state comparable. Cycle 7 panels, camera controls, 1280/1920 resize; x1/x2/x4 alternate each minute; simulation runs between periodic critical-event pauses; each sample forces GC to compare retained memory. Not a 30-minute continuous uninterrupted campaign.",
      samples,
      postGC: {
        heapBytes: finalMetrics.JSHeapUsedSize,
        nodes: finalMetrics.Nodes,
        documents: finalMetrics.Documents,
        listeners: finalMetrics.JSEventListeners,
      },
      errors,
    },
    null,
    2,
  ),
);
await browser.close();
console.log("SOAK COMPLETE", failures.length ? "FAIL" : "PASS");
if (failures.length) process.exitCode = 1;
