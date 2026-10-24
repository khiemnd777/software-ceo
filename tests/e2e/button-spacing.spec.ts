import { openOffice, selectProject } from "./simulate-helpers";
import { test, expect, type Locator, type Page } from "@playwright/test";
import { createGame } from "../../src/simulation/create";
import { makeWork } from "../../src/simulation/work";
import { FEATURES } from "../../src/content/products";
import { resolve } from "node:path";
import { encodeSave } from "../../src/persistence/saves";

// Measure borders in the rendered layout: overflow-only checks miss touching controls.
async function spacing(surface: Locator) {
  const result = await surface.evaluate((root) => {
    if (root.classList.contains("management-page")) root.scrollTop = 0;
    const buttons = Array.from(root.querySelectorAll("button")).filter(
      (button) => button.checkVisibility(),
    );
    const touching: string[] = [];
    for (let i = 0; i < buttons.length; i++) {
      const a = buttons[i].getBoundingClientRect();
      for (const other of buttons.slice(i + 1)) {
        const b = other.getBoundingClientRect();
        const dx = Math.max(a.left - b.right, b.left - a.right, 0);
        const dy = Math.max(a.top - b.bottom, b.top - a.bottom, 0);
        const sameActionRow =
          buttons[i].parentElement === other.parentElement &&
          other.parentElement?.classList.contains("button-row");
        const minimum = sameActionRow ? 7.5 : 3.5;
        if (dx < minimum && dy < minimum)
          touching.push(
            `${buttons[i].textContent?.trim()} / ${other.textContent?.trim()}: ${dx},${dy}`,
          );
      }
    }
    return {
      count: buttons.length,
      touching,
      overflow: root.scrollWidth > root.clientWidth + 1,
    };
  });
  expect(result.touching).toEqual([]);
  expect(result.overflow).toBe(false);
  return result;
}

async function restore(
  page: Page,
  strategy: "outsourcing" | "product" | "startup",
) {
  const s = createGame({
    name: "Spacing QA",
    strategy,
    difficulty: "standard",
    seed: 2026,
  });
  // Synthetic presentation states expose conditional actions; no campaign balance claim.
  if (strategy === "outsourcing") {
    s.contracts[0].stage = "signed";
    s.work[0].done = s.work[0].actual;
  } else {
    const feature = FEATURES.find((f) => f.concept === s.product.concept)!;
    const work = makeWork(s, feature.name, "feature", feature.effort, {
      featureId: feature.id,
    });
    work.done = work.actual;
  }
  await page.goto("/");
  await page.getByRole("button", { name: "Bắt đầu công ty mới" }).click();
  await page.getByRole("button", { name: "Mở cửa công ty" }).click();
  await page.getByRole("button", { name: "Lưu và tải", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "spacing.json",
    mimeType: "application/json",
    buffer: Buffer.from(await encodeSave(s)),
  });
  await expect(page.locator(".save-message")).toContainText(
    "Đã phục hồi bản lưu",
  );
  await page.getByRole("button", { name: "Đóng cửa sổ lưu" }).click();
}

for (const strategy of ["outsourcing", "product", "startup"] as const) {
  test(`button spacing: ${strategy}, six management screens and dialogs`, async ({
    page,
  }, info) => {
    test.setTimeout(180000);
    page.setDefaultTimeout(8000);
    const errors: string[] = [];
    const samples: object[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await restore(page, strategy);
    for (const en of [false, true]) {
      if (en)
        await page.getByRole("button", { name: "EN", exact: true }).click();
      for (const scale of [100, 150]) {
        for (const size of [
          { width: 1280, height: 720 },
          { width: 1920, height: 1080 },
        ]) {
          await page.setViewportSize(size);
          await page
            .getByRole("button", {
              name: en ? "Settings" : "Cài đặt",
              exact: true,
            })
            .click();
          await page
            .getByLabel(en ? "UI size" : "Cỡ giao diện")
            .selectOption(String(scale));
          samples.push({
            dialog: "settings",
            en,
            scale,
            size,
            ...(await spacing(page.locator("dialog[open]"))),
          });
          await page.keyboard.press("Escape");
          for (const labels of [
            ["Công việc", "Work"],
            ["Thị trường", "Market"],
            ["Nhân sự", "People"],
            ["Tài chính", "Finance"],
            ["Chiến lược", "Strategy"],
            ["Nhật ký", "History"],
          ]) {
            await openOffice(page, labels[en ? 1 : 0]);
            const surface = page.locator(".entity-body");
            samples.push({
              view: labels[1],
              en,
              scale,
              size,
              ...(await spacing(surface)),
            });
            if (labels[1] === "Work" && strategy === "outsourcing") {
              await selectProject(page);
              await page
                .getByRole("tab", {
                  name: en ? "Contract" : "Hợp đồng",
                  exact: true,
                })
                .click();
              const risky = page.getByRole("button", {
                name: en
                  ? "Review risky delivery"
                  : "Đánh giá giao hàng có rủi ro",
                exact: true,
              });
              await risky.scrollIntoViewIfNeeded();
              await page.screenshot({
                path: info.outputPath(
                  `delivery-${en}-${scale}-${size.width}.png`,
                ),
              });
              const padding = await risky.evaluate((el) =>
                parseFloat(getComputedStyle(el).paddingLeft),
              );
              expect(padding).toBeGreaterThanOrEqual(8);
              await risky.click();
              samples.push({
                dialog: "confirm",
                en,
                scale,
                size,
                ...(await spacing(
                  page.locator("dialog[aria-labelledby=confirmation-title]"),
                )),
              });
              await page.keyboard.press("Escape");
              await expect(risky).toBeFocused();
              await page.keyboard.press("Escape");
            }
            if (labels[1] === "People") {
              await page.locator(".team-person").first().click();
              samples.push({
                context: "employee",
                en,
                scale,
                size,
                ...(await spacing(page.locator(".person-context"))),
              });
              const dismiss = page.getByRole("button", {
                name: en ? "Dismiss" : "Thôi việc",
                exact: true,
              });
              expect(
                await dismiss.evaluate((el) =>
                  parseFloat(getComputedStyle(el).paddingLeft),
                ),
              ).toBeGreaterThanOrEqual(8);
              await page.keyboard.press("Escape");
            }
            if (labels[1] === "Market" && strategy !== "outsourcing") {
              await page
                .getByRole("button", {
                  name: en
                    ? "Survey customers · 1 action"
                    : "Khảo sát khách hàng · 1 lượt",
                  exact: true,
                })
                .scrollIntoViewIfNeeded();
              await page.screenshot({
                path: info.outputPath(
                  `market-${en}-${scale}-${size.width}.png`,
                ),
              });
            }
            for (const choice of await surface
              .locator(".decision-choice, .roster-select")
              .all()) {
              await choice.click();
              samples.push({
                view: labels[1],
                variant: await choice.innerText(),
                en,
                scale,
                size,
                ...(await spacing(surface)),
              });
            }
          }
          await page
            .getByRole("button", {
              name: en ? "Save and load" : "Lưu và tải",
              exact: true,
            })
            .click();
          samples.push({
            dialog: "save",
            en,
            scale,
            size,
            ...(await spacing(page.locator("dialog[open]"))),
          });
          const save = page
            .locator(".save-slot")
            .first()
            .getByRole("button", { name: en ? "Save" : "Lưu", exact: true });
          await save.click();
          if (!(await page.locator(".save-dialog .forecast-box").count())) {
            await expect(page.locator(".save-message")).toContainText(
              en ? "Company saved" : "Đã lưu công ty",
            );
            await save.click();
          }
          await expect(
            page.locator(".save-dialog .forecast-box"),
          ).toBeVisible();
          samples.push({
            dialog: "overwrite",
            en,
            scale,
            size,
            ...(await spacing(page.locator("dialog[open]"))),
          });
          await page.keyboard.press("Escape");
        }
      }
    }
    expect(errors).toEqual([]);
    await info.attach("spacing-matrix", {
      body: JSON.stringify({ samples, errors }, null, 2),
      contentType: "application/json",
    });
  });
}

test("button spacing: about dialog and both company outcome overlays", async ({
  page,
}, info) => {
  test.setTimeout(120000);
  for (const en of [false, true]) {
    for (const scale of [100, 150]) {
      for (const size of [
        { width: 1280, height: 720 },
        { width: 1920, height: 1080 },
      ]) {
        for (const outcome of ["career-outsourcing-complete", "insolvent"]) {
          await page.goto("/");
          await page.setViewportSize(size);
          if (
            (await page.locator("html").getAttribute("lang")) !==
            (en ? "en" : "vi")
          )
            await page
              .getByRole("button", { name: en ? "EN" : "VI", exact: true })
              .click();
          await page
            .getByRole("button", {
              name: en ? "Settings" : "Cài đặt",
              exact: true,
            })
            .click();
          await page
            .getByLabel(en ? "UI size" : "Cỡ giao diện")
            .selectOption(String(scale));
          await page.keyboard.press("Escape");
          await page
            .getByRole("button", {
              name: en ? "How to play & Credits" : "Cách chơi & Ghi công",
              exact: true,
            })
            .click();
          await spacing(page.locator("dialog[open]"));
          await page.keyboard.press("Escape");
          await page
            .getByRole("button", {
              name: en ? "Load game" : "Tải bản lưu",
              exact: true,
            })
            .click();
          await page
            .locator("input[type=file]")
            .setInputFiles(resolve(`evidence/fixtures/${outcome}.json`));
          await page
            .getByRole("button", {
              name: en ? "Close saves" : "Đóng cửa sổ lưu",
            })
            .click();
          await expect(page.locator(".outcome")).toBeVisible();
          await spacing(page.locator(".outcome section"));
          await page.screenshot({
            path: info.outputPath(
              `${outcome}-${en}-${scale}-${size.width}.png`,
            ),
          });
        }
      }
    }
  }
});
