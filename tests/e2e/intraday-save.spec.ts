import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import legacy from "../fixtures/character-legacy-v2.json" with { type: "json" };

test("legacy slot stays unchanged on load and exports exact original after first v3 overwrite", async ({
  page,
}, info) => {
  await page.goto("/");
  const raw = JSON.stringify(legacy);
  // An isolated context contains a real historical slot, not player data.
  await page.evaluate(async (payload) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("software-ceo", 3);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("saves", "readwrite");
      tx.objectStore("saves").put({
        slot: "1",
        revision: 7,
        name: "Historical company",
        day: 0,
        strategy: "product",
        savedAt: "2026-01-01T00:00:00Z",
        payload,
      });
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  }, raw);
  await page.reload();
  await page.getByRole("button", { name: "Tải bản lưu", exact: true }).click();
  await page
    .locator(".save-slot")
    .first()
    .getByRole("button", { name: "Tải", exact: true })
    .click();
  await expect(page.locator(".game-clock")).toHaveText("00:00");
  await expect(
    page.getByRole("button", { name: "Chạy mô phỏng", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
  await expect(page.locator(".legacy-backups")).toHaveCount(0);
  await page
    .locator(".save-slot")
    .first()
    .getByRole("button", { name: "Lưu", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Xác nhận ghi đè", exact: true })
    .click();
  await expect(page.locator(".save-message")).toContainText("Đã lưu");
  await page.locator(".legacy-backups summary").click();
  const promise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Xuất bản gốc 1 · r7", exact: true })
    .click();
  const downloaded = await promise,
    path = info.outputPath("legacy-original-r7.json");
  await downloaded.saveAs(path);
  expect(await readFile(path, "utf8")).toBe(raw);
  await page.screenshot({
    path: info.outputPath("retained-legacy-backup.png"),
  });
});
