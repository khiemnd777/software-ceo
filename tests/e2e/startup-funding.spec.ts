import { openOffice } from "./simulate-helpers";
import { assignWork, workOverview } from "./work-helpers";
import { test, expect } from "@playwright/test";
test("Startup learns, ships its MVP, signs one funding round and changes quarterly focus through UI", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByLabel("Chiến lược", { exact: true }).selectOption("startup");
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  await page.getByRole("button", { name: "Thu gọn hoặc mở hướng dẫn" }).click();
  const nav = (name: string) => openOffice(page, name);
  const days = async (n: number) => {
    for (let i = 0; i < n; i++)
      await page.getByRole("button", { name: "Ngày tiếp" }).click();
  };
  for (const experiment of [
    "Phỏng vấn khách hàng",
    "Trang giới thiệu thử nghiệm",
    "Kiểm tra prototype",
  ]) {
    await nav("Thị trường");
    const card = page.locator("article.panel-card").filter({
      has: page.getByRole("heading", { name: experiment, exact: true }),
    });
    await card.getByRole("button", { name: "Khởi động · 1 lượt" }).click();
    await nav("Công việc");
    await assignWork(page, experiment, ["research", "research"]);
    await days(14);
  }
  await workOverview(page);
  await expect(
    page.getByRole("heading", { name: "Lộ trình tính năng", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Bắt đầu MVP · 1 lượt" }).click();
  await page.keyboard.press("Escape");
  await assignWork(page, "MVP cho khách hàng đầu tiên", ["develop", "qa"]);
  await days(35);
  await assignWork(page, undefined, ["fix"]);
  await days(14);
  await workOverview(page);
  await expect(
    page.getByRole("heading", { name: "Lộ trình tính năng", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Phát hành MVP", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Phát hành MVP", exact: true }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await nav("Chiến lược");
  await page
    .getByRole("button", { name: "Pitch · cần 35 bằng chứng + 80 người dùng" })
    .click();
  await page
    .locator(".funding-grid article")
    .first()
    .getByRole("button", { name: "Xem & xác nhận" })
    .click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await expect(page.locator(".venture-section .pill")).toContainText("85%");
  await expect(page.locator(".funding-grid article").first()).toContainText(
    "Đã nhận vốn",
  );
  await page.screenshot({
    path: "evidence/simulate-runtime/browser/W5-startup-funded.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Mở hướng phụ outsourcing", exact: true })
    .click();
  let day = Number(
    (await page.locator(".date").innerText()).match(/NGÀY\s+(\d+)/)?.[1],
  );
  const target = (Math.floor(day / 90) + 1) * 90 + 1;
  await days(target - day);
  day = target;
  await page
    .getByRole("button", {
      name: "Chuyển trọng tâm sang outsourcing",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await page.locator(".hud-reputation").hover();
  await expect(page.getByRole("tooltip")).toContainText("Dịch vụ phần mềm");
  await expect(page.locator(".entity-body")).toContainText("OUTSOURCING");
  await expect(page.locator(".venture-section .pill")).toContainText("85%");
  await page.screenshot({
    path: "evidence/simulate-runtime/browser/W5-quarterly-focus.png",
    fullPage: true,
  });
  expect(day % 90).toBeLessThan(7);
  expect(errors).toEqual([]);
});
