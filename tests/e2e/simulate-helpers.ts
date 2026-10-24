import { expect, type Page } from "@playwright/test";

export async function openOffice(page: Page, name: string) {
  const close = page.getByRole("button", {
    name: /^(Đóng thông tin|Close information)$/,
  });
  if (await close.count()) await close.click();
  if (["Office", "Văn phòng"].includes(name)) return;
  const en = (await page.locator("html").getAttribute("lang")) === "en";
  const places: Record<string, [string, string]> = {
    "Công việc": ["Bảng dự án", "Project board"],
    Work: ["Bảng dự án", "Project board"],
    "Nhân sự": ["Đội ngũ", "Team"],
    People: ["Đội ngũ", "Team"],
    "Thị trường": ["Khách hàng", "Customers"],
    Market: ["Khách hàng", "Customers"],
    "Tài chính": ["Bàn tài chính", "Finance desk"],
    Finance: ["Bàn tài chính", "Finance desk"],
    "Chiến lược": ["Bàn họp", "Meeting table"],
    Strategy: ["Bàn họp", "Meeting table"],
    "Nhật ký": ["Nhật ký công ty", "Company history"],
    History: ["Nhật ký công ty", "Company history"],
  };
  const target = places[name];
  if (!target) throw Error(`Unknown office destination: ${name}`);
  await page.locator(".find-object").click();
  await page.locator(".find-dialog input").fill(target[en ? 1 : 0]);
  await page
    .locator(".find-results button")
    .filter({ has: page.getByText(target[en ? 1 : 0], { exact: true }) })
    .click();
  await expect(page.locator(".entity-sheet")).toBeVisible();
}
export async function selectProject(page: Page, label?: string) {
  await openOffice(page, "Công việc");
  const card = label
    ? page.locator(".project-card").filter({
        has: page.getByRole("heading", { name: label, exact: true }),
      })
    : page.locator(".project-card").first();
  await card
    .getByRole("button", { name: /^(Chọn dự án|Select project)/ })
    .click();
  await expect(page.locator(".project-dossier")).toBeVisible();
}
