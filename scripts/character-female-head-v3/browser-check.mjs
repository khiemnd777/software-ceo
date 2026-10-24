import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const base = 'http://127.0.0.1:4191';
const review = base + '/art-source/character-female-head-v3/review.html';
const output = fileURLToPath(new URL('../../evidence/character-female-head-v3/browser/', import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, chromiumSandbox: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [], failed = [], external = [], samples = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) failed.push({ url: response.url(), status: response.status() }); });
  page.on('requestfailed', request => failed.push({ url: request.url(), error: request.failure()?.errorText }));
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin === base) return route.continue();
    external.push(route.request().url());
    return route.abort();
  });
  await page.goto(review);
  const loaded = () => page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth === 1000 && img.naturalHeight === 1100));
  await loaded();
  for (const angle of ['front', 'three-quarter', 'profile']) {
    for (const material of ['color', 'clay']) {
      await page.locator(`[data-angle="${angle}"]`).click();
      await page.locator(`[data-material="${material}"]`).click();
      const current = `new-${angle}${material === 'clay' ? '-clay' : ''}.png`;
      await page.waitForFunction(file => document.querySelector('#head').src.endsWith(file), current);
      await loaded();
      await expect(page.locator('#after')).toHaveAttribute('src', `../../evidence/character-female-head-v3/${current}`);
      await expect(page.locator('#before')).toHaveAttribute('src', `../../evidence/character-female-head-v3/previous-${angle}.png`);
      await expect(page.locator(`[data-angle="${angle}"]`)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-angle][aria-pressed="true"]')).toHaveCount(1);
      await expect(page.locator(`[data-material="${material}"]`)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-material][aria-pressed="true"]')).toHaveCount(1);
      samples.push({ angle, material, current, imageDecoded: true });
    }
  }
  const reference = await page.locator('svg image').getAttribute('href');
  const referenceResponse = await context.request.get(new URL(reference, review).href);
  expect(referenceResponse.status()).toBe(200);
  expect(digest(await referenceResponse.body())).toBe(digest(await readFile(fileURLToPath(new URL('../../art-source/character-redesign-ac/references/approved-body.png', import.meta.url)))));
  const manifest = JSON.parse(await readFile(fileURLToPath(new URL('../../art-source/character-female-head-v3/manifest.json', import.meta.url)), 'utf8'));
  const downloads = [];
  for (const file of ['female-head-v3.blend', 'female-head-v3.glb', 'manifest.json']) {
    const response = await context.request.get(new URL(file, review).href);
    expect(response.status()).toBe(200);
    const hash = digest(await response.body());
    expect(hash).toBe(digest(await readFile(fileURLToPath(new URL('../../art-source/character-female-head-v3/' + file, import.meta.url)))));
    if (file.endsWith('.glb')) expect(hash).toBe(manifest.sha256);
    downloads.push({ file, status: response.status(), sha256: hash });
  }
  const denied = [];
  for (const path of ['/src/main.tsx', '/package.json', '/scripts/character-female-head-v3/build.py', '/art-source/character-redesign-v2/review.html', '/%2e%2e/package.json', '/art-source/character-female-head-v3/']) {
    const response = await context.request.get(base + path);
    expect(response.status()).toBe(404);
    denied.push({ path, status: response.status() });
  }
  await page.locator('[data-angle="three-quarter"]').click();
  await page.locator('[data-material="color"]').click();
  await loaded();
  const layouts = [];
  for (const [name, viewport] of [['desktop', { width: 1440, height: 1050 }], ['mobile', { width: 390, height: 844 }]]) {
    await page.setViewportSize(viewport);
    await loaded();
    const layout = await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth, headWidth: document.querySelector('#head').getBoundingClientRect().width }));
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.width);
    expect(layout.headWidth).toBeGreaterThan(0);
    layouts.push({ name, ...layout });
    await page.screenshot({ path: output + name + '.png', fullPage: true });
    if (name === 'desktop') await page.screenshot({ path: output + 'desktop-viewport.png' });
  }
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
  expect(external).toEqual([]);
  const receipt = { browser: await browser.version(), browserSandbox: true, url: review, samples, layouts,
    referenceMatchesApprovedFile: true, downloads, serverDenyChecks: denied, errors, failed, external, pass: true,
    limits: 'Offline render gallery. Not realtime 3D, art approval, deformation or gameplay proof.' };
  await writeFile(output + 'receipt.json', JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify(receipt, null, 2));
} finally {
  await browser.close();
}
