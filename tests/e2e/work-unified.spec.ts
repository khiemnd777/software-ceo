import { openOffice, selectProject } from "./simulate-helpers";
import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { createGame } from "../../src/simulation/create";
import { transition } from "../../src/simulation/engine";
import { encodeSave, decodeSave } from "../../src/persistence/saves";
import { readFile } from "node:fs/promises";
import type { State } from "../../src/simulation/types";
async function load(page: Page, s: State) {
  await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "work.json",
    mimeType: "application/json",
    buffer: Buffer.from(await encodeSave(s)),
  });
  await expect(page.locator(".save-message")).toContainText(
    "Đã phục hồi bản lưu",
  );
  await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
}
async function state(page: Page, info: TestInfo) {
  await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất JSON", exact: true }).click();
  const path = info.outputPath("state.json");
  await (await download).saveAs(path);
  await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
  return decodeSave(await readFile(path, "utf8"));
}
async function view(page: Page, name: string) {
  await openOffice(page, name);
}
async function start(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
}
test("unified work: batch assignments persist across office contexts, preserve slots, and save/load resets drafts", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await start(page);
  let s = createGame({
    name: "Work QA",
    strategy: "outsourcing",
    difficulty: "standard",
    seed: 42,
  });
  s = transition(s, { type: "sign", contractId: s.contracts[0].id }).state;
  const target = s.work[0].id;
  s.employees[0].assignments = [
    { target, kind: "refactor" },
    { target, kind: "qa" },
  ];
  await load(page, s);
  await view(page, "Công việc");
  await page
    .getByLabel("Tìm dự án", { exact: true })
    .fill(s.work[0].label.vi.slice(0, 5));
  await page.getByLabel("Sắp xếp công việc").selectOption("deadline");
  await selectProject(page, s.work[0].label.vi);
  await page
    .getByRole("button", {
      name: `Chỉnh phân công ${s.employees[0].name}`,
      exact: true,
    })
    .click();
  await page
    .getByLabel(`${s.employees[0].name} việc 1`, { exact: true })
    .selectOption("develop");
  await page
    .getByRole("button", { name: "Xong bản nháp", exact: true })
    .click();
  await page
    .getByRole("button", { name: "+ Thêm nhân sự", exact: true })
    .click();
  await page
    .locator(".dossier-candidate")
    .filter({ hasText: s.employees[1].name })
    .click();
  await page
    .getByLabel(`${s.employees[1].name} việc trong dự án này`, { exact: true })
    .selectOption("qa");
  await view(page, "Tài chính");
  await selectProject(page, s.work[0].label.vi);
  await expect(page.locator(".dossier-change")).toHaveCount(2);
  await page
    .getByRole("button", {
      name: `Chỉnh phân công ${s.employees[0].name}`,
      exact: true,
    })
    .click();
  const select = page.getByLabel(`${s.employees[0].name} việc 1`, {
    exact: true,
  });
  await expect(select).toHaveValue("develop");
  await expect(
    page.getByLabel(`${s.employees[0].name} việc 2`, { exact: true }),
  ).toHaveValue("qa");
  await page.getByRole("button", { name: "Áp dụng 2", exact: true }).click();
  await expect(page.locator(".dossier-apply .primary")).toBeDisabled();
  const after = await state(page, info);
  expect(after.employees[0].assignments).toEqual([
    { target, kind: "develop" },
    { target, kind: "qa" },
  ]);
  expect(after.employees[1].assignments).toEqual([{ target, kind: "qa" }]);
  expect(after.cash).toBe(s.cash);
  expect(after.actions).toBe(s.actions);
  await view(page, "Công việc");
  await expect(page.getByLabel("Tìm dự án", { exact: true })).toHaveValue(
    s.work[0].label.vi.slice(0, 5),
  );
  await expect(page.getByLabel("Sắp xếp công việc")).toHaveValue("deadline");
  await selectProject(page, s.work[0].label.vi);
  await page.getByRole("tab", { name: "Hợp đồng", exact: true }).click();
  await expect(page.locator(".dossier-contract")).toContainText(
    s.employees[0].name,
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".project-dossier")).toHaveCount(0);
  await selectProject(page, s.work[0].label.vi);
  await page
    .getByRole("button", {
      name: `Chỉnh phân công ${s.employees[0].name}`,
      exact: true,
    })
    .click();
  await select.selectOption("fix");
  await load(page, after);
  await expect(page.locator(".entity-sheet")).toHaveCount(0);
  await selectProject(page, s.work[0].label.vi);
  await expect(page.locator(".dossier-change")).toHaveCount(0);
  await page
    .getByRole("button", {
      name: `Chỉnh phân công ${s.employees[0].name}`,
      exact: true,
    })
    .click();
  await expect(select).toHaveValue("develop");
  expect(errors).toEqual([]);
});
test("unified work: unsigned targets lock assignment; all playbooks render EN/VI at UI100/150", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await start(page);
  const samples = [];
  for (const strategy of ["outsourcing", "product", "startup"] as const) {
    const s = createGame({
      name: "Layout QA",
      strategy,
      difficulty: "standard",
      seed: 42,
    });
    await load(page, s);
    await view(page, "Công việc");
    if (strategy === "outsourcing") {
      await selectProject(page, s.work[0].label.vi);
      await expect(
        page.getByRole("button", { name: "+ Thêm nhân sự", exact: true }),
      ).toBeDisabled();
      await expect(page.locator(".dossier-apply .primary")).toBeDisabled();
      await expect(
        page.locator(".dossier-section-heading").first(),
      ).toContainText("Chờ ký hợp đồng");
    }
    for (const locale of ["vi", "en"] as const) {
      if ((await page.locator("html").getAttribute("lang")) !== locale)
        await page
          .getByRole("button", {
            name: locale === "en" ? "EN" : "VI",
            exact: true,
          })
          .click();
      for (const width of [1280, 1920])
        for (const scale of [100, 150]) {
          await page.setViewportSize({
            width,
            height: width === 1280 ? 720 : 1080,
          });
          await page
            .getByRole("button", {
              name: locale === "vi" ? "Cài đặt" : "Settings",
              exact: true,
            })
            .click();
          await page
            .getByLabel(locale === "vi" ? "Cỡ giao diện" : "UI size")
            .selectOption(String(scale));
          await page.keyboard.press("Escape");
          const measure = await page.locator(".entity-sheet").evaluate((e) => ({
            overflow: e.scrollWidth > e.clientWidth + 1,
            canvas: document.querySelectorAll("canvas").length,
            bodyOverflow: document.documentElement.scrollWidth > innerWidth + 1,
          }));
          expect(measure.overflow).toBe(false);
          expect(measure.bodyOverflow).toBe(false);
          expect(measure.canvas).toBe(1);
          samples.push({ strategy, locale, width, scale, ...measure });
        }
    }
    if ((await page.locator("html").getAttribute("lang")) === "en")
      await page.getByRole("button", { name: "VI", exact: true }).click();
  }
  await page.screenshot({ path: info.outputPath("work-layout.png") });
  expect(samples).toHaveLength(24);
});
test("unified work: six-project board, dossier layouts and keyboard stay reachable", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await start(page);
  let s = createGame({
    name: "Work visual QA",
    strategy: "outsourcing",
    difficulty: "standard",
    seed: 42,
  });
  s = transition(s, { type: "sign", contractId: s.contracts[0].id }).state;
  for (let i = 1; i < 6; i++) {
    s.work.push({
      ...structuredClone(s.work[0]),
      id: `layout-work-${i}`,
      label: { vi: `Dự án kiểm tra ${i}`, en: `Layout project ${i}` },
    });
    s.contracts.push({
      ...structuredClone(s.contracts[0]),
      id: `layout-contract-${i}`,
      workId: `layout-work-${i}`,
      type: "tm",
      deposit: 0,
      stage: i === 2 ? "signed" : "quoted",
    });
  }
  await load(page, s);
  const samples = [];
  for (const locale of ["vi", "en"] as const) {
    if ((await page.locator("html").getAttribute("lang")) !== locale)
      await page
        .getByRole("button", {
          name: locale === "en" ? "EN" : "VI",
          exact: true,
        })
        .click();
    for (const width of [1280, 1920])
      for (const scale of [100, 150]) {
        await page.setViewportSize({
          width,
          height: width === 1280 ? 720 : 1080,
        });
        await page
          .getByRole("button", {
            name: locale === "vi" ? "Cài đặt" : "Settings",
            exact: true,
          })
          .click();
        await page
          .getByLabel(locale === "vi" ? "Cỡ giao diện" : "UI size")
          .selectOption(String(scale));
        await page.keyboard.press("Escape");
        await view(page, "Công việc");
        await expect(page.locator(".project-card")).toHaveCount(6);
        await page
          .locator(".project-card")
          .last()
          .getByRole("button")
          .scrollIntoViewIfNeeded();
        await expect(
          page.locator(".project-card").last().getByRole("button"),
        ).toBeInViewport();
        await selectProject(page, s.work[0].label[locale]);
        await page
          .getByRole("button", {
            name: locale === "vi" ? "+ Thêm nhân sự" : "+ Add teammate",
            exact: true,
          })
          .click();
        await page
          .locator(".dossier-candidate")
          .filter({ hasText: s.employees[0].name })
          .click();
        await page
          .locator(".dossier-editor select")
          .first()
          .selectOption("develop");
        const measure = await page
          .locator(".project-dossier")
          .evaluate((root) => {
            const body = root.querySelector(".dossier-scroll")!,
              bar = root.querySelector(".dossier-apply")!;
            return {
              overflow: body.scrollWidth > body.clientWidth + 1,
              bodyBottom: body.getBoundingClientRect().bottom,
              barTop: bar.getBoundingClientRect().top,
              canvas: document.querySelectorAll("canvas").length,
            };
          });
        expect(measure.overflow).toBe(false);
        expect(measure.bodyBottom).toBeLessThanOrEqual(measure.barTop + 1);
        expect(measure.canvas).toBe(1);
        await expect(page.locator(".dossier-apply .primary")).toBeInViewport();
        await expect(page.locator(".dossier-apply .primary")).toBeEnabled();
        await page
          .getByRole("tab", {
            name: locale === "vi" ? "Hoạt động" : "Activity",
            exact: true,
          })
          .press("Home");
        await expect(
          page.getByRole("tab", {
            name: locale === "vi" ? "Tiến độ & nhân sự" : "Progress & team",
            exact: true,
          }),
        ).toBeFocused();
        await page.screenshot({
          path: info.outputPath(`dossier-${locale}-${width}-${scale}.png`),
        });
        samples.push({ locale, width, scale, ...measure });
        await page
          .locator(".dossier-apply")
          .getByRole("button", {
            name: locale === "vi" ? "Hủy" : "Discard",
            exact: true,
          })
          .click();
        await page.keyboard.press("Escape");
        await expect(page.locator(".find-object")).toBeFocused();
      }
  }
  expect(samples).toHaveLength(8);
});
