// Separate post-soak diagnosis: distinguish renderer retention from the UI-driving probe.
import { launchBrowser } from "./browser-runtime.mjs";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
const dir = process.env.CEO_EVIDENCE_DIR ?? "evidence";
mkdirSync(dir, { recursive: true });
const browser = await launchBrowser({ cdp: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
});
const page = await context.newPage(),
  cdp = await context.newCDPSession(page);
await cdp.send("Performance.enable");
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(process.env.CEO_BASE_URL ?? "http://127.0.0.1:4173");
await page.getByRole("button", { name: "Tải bản lưu", exact: true }).click();
await page.evaluate(
  (raw) => {
    const input = document.querySelector("input[type=file]"),
      transfer = new DataTransfer();
    transfer.items.add(
      new File([raw], "fixture.json", { type: "application/json" }),
    );
    input.files = transfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  },
  readFileSync(
    process.env.CEO_SOAK_FIXTURE ?? "evidence/fixtures/office-12.json",
    "utf8",
  ),
);
await page.locator(".scene-toolbar").waitFor();
await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
await page.getByRole("button", { name: "Thu gọn hoặc mở hướng dẫn" }).click();
const sample = async (label) => {
  await cdp.send("HeapProfiler.collectGarbage");
  const m = Object.fromEntries(
    (await cdp.send("Performance.getMetrics")).metrics.map((m) => [
      m.name,
      m.value,
    ]),
  );
  return {
    label,
    heap: m.JSHeapUsedSize,
    nodes: m.Nodes,
    listeners: m.JSEventListeners,
    liveDOM: await page.locator("*").count(),
  };
};
const samples = [await sample("warm")];
for (let i = 0; i < Number(process.env.CEO_MEMORY_CYCLES ?? 20); i++) {
  for (const view of [
    "Bảng dự án",
    "Đội ngũ",
    "Khách hàng",
    "Bàn tài chính",
    "Bàn họp",
    "Nhật ký công ty",
  ]) {
    const close = page.getByRole("button", {
      name: "Đóng thông tin",
      exact: true,
    });
    if (await close.count()) await close.click();
    await page.locator(".find-object").click();
    await page.locator(".find-dialog input").fill(view);
    await page
      .locator(".find-results button")
      .filter({ has: page.getByText(view, { exact: true }) })
      .click();
  }
  await page
    .getByRole("button", { name: "Đóng thông tin", exact: true })
    .click();
  samples.push(await sample(`cycle-${i + 1}`));
}
await page.waitForTimeout(1000);
samples.push(await sample("settled"));
if (process.env.CEO_MEMORY_CONTROL === "1") {
  await page.locator("canvas").click({ position: { x: 2, y: 2 } });
  await page.waitForTimeout(100);
  samples.push(await sample("after-canvas-target"));
}
const detached = await cdp.send("DOM.getDetachedDomNodes");
writeFileSync(
  resolve(dir, "memory-detached.json"),
  JSON.stringify(detached, null, 2),
);
// Inspector releases can identify tooling retention; record both sides instead of hiding it.
await cdp.send("Runtime.releaseObjectGroup", { objectGroup: "console" });
await cdp.send("Runtime.discardConsoleEntries");
samples.push(await sample("after-inspector-release"));
let chunks = [];
cdp.on("HeapProfiler.addHeapSnapshotChunk", (e) => chunks.push(e.chunk));
await cdp.send("HeapProfiler.takeHeapSnapshot", { reportProgress: false });
writeFileSync(resolve(dir, "memory.heapsnapshot"), chunks.join(""));
writeFileSync(
  resolve(dir, "memory-cycles.json"),
  JSON.stringify(
    {
      browser: browser.version(),
      samples,
      errors,
      scope:
        "120 real finder/panel visits while Pause; all samples post-GC, separate from FPS and completed soak. Inspector release is diagnostic, not a pass criterion.",
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    { samples, errors, detached: detached.detachedNodes.length },
    null,
    2,
  ),
);
await browser.close();
