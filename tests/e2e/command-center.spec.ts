import { openOffice, selectProject } from "./simulate-helpers";
import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { decodeSave, encodeSave } from "../../src/persistence/saves";
import type { State } from "../../src/simulation/types";
import { invoice } from "../../src/gameplay/contracts";
import { book } from "../../src/simulation/finance";

async function state(page: Page, info: TestInfo, name: string) {
  if (await page.locator(".work-inspector[open]").count())
    await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất JSON", exact: true }).click();
  const path = info.outputPath(`${name}.json`);
  await (await download).saveAs(path);
  await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
  return decodeSave(await readFile(path, "utf8"));
}
async function view(page: Page, name: string) {
  await openOffice(page, name);
}
async function load(page: Page, s: State) {
  await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "command-center.json",
    mimeType: "application/json",
    buffer: Buffer.from(await encodeSave(s)),
  });
  await expect(page.locator(".save-dialog")).toContainText(
    "Đã phục hồi bản lưu",
  );
  await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
}

test("command center inspects real options without changing the campaign; selections remain keyboard operable", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  const before = await state(page, info, "before-inspection");
  await view(page, "Công việc");
  await expect(page.locator(".projects-context")).toContainText(
    before.work[0].label.vi,
  );
  await expect(page.locator(".projects-context")).toContainText(
    "Chưa kiểm thử",
  );
  await selectProject(page, before.work[0].label.vi);
  await expect(
    page.getByRole("button", { name: "+ Thêm nhân sự", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".dossier-apply .primary")).toBeDisabled();
  await view(page, "Nhân sự");
  await page.locator(".team-person").last().press("Enter");
  await expect(page.locator(".entity-header h1")).toContainText(
    before.employees[1].name,
  );
  await view(page, "Thị trường");
  await page.locator(".decision-choice").last().press("Enter");
  await expect(page.locator(".decision-choice").last()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".decision-inspector")).toContainText(
    "Chưa có sản phẩm để đặt giá",
  );
  await view(page, "Chiến lược");
  await page
    .locator(".section-nav")
    .getByRole("button", { name: "Điều hành", exact: true })
    .click();
  await page
    .locator(".decision-choice")
    .filter({ hasText: "Chất lượng trước" })
    .press("Enter");
  await expect(page.locator(".policy")).toContainText("Chất lượng trước");
  await view(page, "Nhật ký");
  await expect(page.locator(".history-item")).toContainText(
    before.history.at(-1)!.body.vi,
  );
  const after = await state(page, info, "after-inspection");
  expect(after).toEqual(before);
  expect(errors).toEqual([]);
});

test("invoice inspector follows up once without pretending payment cleared; selection uses current state after import", async ({
  page,
}, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  await view(page, "Công việc");
  await selectProject(page);
  await page.getByRole("tab", { name: "Hợp đồng", exact: true }).click();
  await page
    .getByRole("button", { name: "Ký hợp đồng · 1 lượt", exact: true })
    .click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  const s = await state(page, info, "signed");
  // Build the synthetic UI scenario through the real balanced invoice transaction.
  s.day = 1;
  invoice(s, s.contracts[0], 1200000, "UI collection");
  s.invoices[0].due = 0;
  s.invoices[0].clears = 11;
  await load(page, s);
  await view(page, "Tài chính");
  await page
    .locator(".section-nav")
    .getByRole("button", { name: "Hóa đơn" })
    .click();
  await expect(page.locator(".decision-rail")).toContainText("Quá hạn");
  const follow = page.getByRole("button", {
    name: "Nhắc thanh toán · 1 lượt",
    exact: true,
  });
  await follow.click();
  await expect(follow).toBeDisabled();
  await expect(page.locator(".invoice-detail")).toContainText(
    "Đã gửi nhắc thanh toán",
  );
  const after = await state(page, info, "followed-up");
  expect(after.cash).toBe(s.cash);
  expect(after.actions).toBe(s.actions - 1);
  expect(after.invoices[0].paid).toBe(false);
  expect(after.invoices[0].expedited).toBe(true);
  expect(after.invoices[0].clears).toBeLessThanOrEqual(s.day + 2);
  const replacement = structuredClone(after);
  replacement.invoices[0].id = "replacement-invoice";
  replacement.invoices[0].label = {
    vi: "Khoản thu thay thế",
    en: "Replacement collection",
  };
  replacement.invoices[0].paid = true;
  book(replacement, "collection", replacement.invoices[0].label, {
    cash: 1200000,
    receivable: -1200000,
  });
  await load(page, replacement);
  await view(page, "Tài chính");
  await page
    .locator(".section-nav")
    .getByRole("button", { name: "Hóa đơn" })
    .click();
  await expect(page.locator(".invoice-detail")).toContainText(
    "Khoản thu thay thế",
  );
  await expect(
    page.getByRole("button", { name: "Nhắc thanh toán · 1 lượt", exact: true }),
  ).toHaveCount(0);
});
