import { expect, type Page } from "@playwright/test";
import type { TaskKind } from "../../src/simulation/types";
import { openOffice, selectProject } from "./simulate-helpers";
export async function workOverview(page: Page) {
  await openOffice(page, "Công việc");
}
export async function inspectWork(page: Page, label?: string) {
  await selectProject(page, label);
  await page
    .getByRole("tab", { name: /^(Hợp đồng|Contract|Chi tiết|Details)$/ })
    .click();
}
export async function assignWork(
  page: Page,
  label: string | undefined,
  kinds: (TaskKind | null)[],
) {
  const targetLabel =
    label ??
    ((await page.locator(".project-dossier").count())
      ? await page.locator(".entity-header h1").innerText()
      : undefined);
  await openOffice(page, "Nhân sự");
  const names = await page.locator(".team-person strong").allTextContents();
  await selectProject(page, targetLabel);
  for (let i = 0; i < kinds.length; i++) {
    const kind = kinds[i];
    if (!kind) continue;
    const name = names[i];
    if (!name) throw Error(`Teammate ${i} unavailable`);
    const row = page
      .locator(".dossier-person")
      .filter({ has: page.getByText(name, { exact: true }) });
    if (await row.count()) await row.locator("[data-edit-person]").click();
    else {
      await page
        .getByRole("button", { name: /^(\+ Thêm nhân sự|\+ Add teammate)$/ })
        .click();
      await page
        .getByRole("searchbox", {
          name: /^(Tìm nhân sự để thêm|Find a teammate to add)$/,
        })
        .fill(name);
      await page
        .locator(".dossier-candidate")
        .filter({ hasText: name })
        .click();
    }
    const editor = page.locator(".dossier-editor");
    await editor
      .locator(".dossier-edit-grid select")
      .first()
      .selectOption(kind);
    const mode = editor.getByRole("combobox", {
      name: /cách áp dụng|apply mode/,
    });
    if (await mode.count())
      if (await mode.locator('option[value="0"]').count())
        await mode.selectOption("0");
    await page
      .getByRole("button", { name: /^(Xong bản nháp|Done editing)$/ })
      .click();
  }
  const apply = page.locator(".dossier-apply .primary");
  if (await apply.isEnabled()) await apply.click();
  await expect(apply).toBeDisabled();
}
