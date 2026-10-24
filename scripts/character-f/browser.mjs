import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const base = 'http://127.0.0.1:4193';
const url = base + '/art-source/character-f/review.html';
const output = fileURLToPath(new URL('../../evidence/character-f/browser/', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const reviewFile = fileURLToPath(new URL('../../art-source/character-f/review.html', import.meta.url));
const reviewSha256 = hash(await readFile(reviewFile));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, chromiumSandbox: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 });
  const page = await context.newPage(), errors = [], failed = [], external = [], combinations = [], layouts = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) failed.push({ url: r.url(), status: r.status() }); });
  page.on('requestfailed', r => failed.push({ url: r.url(), error: r.failure()?.errorText }));
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin === base) return route.continue();
    external.push(route.request().url());
    return route.abort();
  });
  await page.goto(url);
  const ready = () => page.waitForFunction(() => document.body.dataset.ready === 'true');
  const decoded = () => page.waitForFunction(() => ['male', 'female'].every(g => {
    const i = document.querySelector('#' + g); return i.complete && i.naturalWidth === 384;
  }));
  await ready();
  for (const clip of ['idle', 'working', 'walk', 'stand-up', 'alert', 'meeting']) {
    await page.locator(`button[data-clip="${clip}"]`).click(); await ready();
    for (const view of ['three-quarter', 'side']) {
      await page.locator(`button[data-view="${view}"]`).click(); await ready(); await decoded();
      await expect(page.locator(`button[data-clip="${clip}"]`)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator(`button[data-view="${view}"]`)).toHaveAttribute('aria-pressed', 'true');
      for (const frame of [0, 8, 16]) {
        await page.locator('#timeline').fill(String(frame)); await decoded();
        for (const gender of ['male', 'female']) {
          await expect(page.locator('#' + gender)).toHaveAttribute('src', `../../evidence/character-f/frames/${gender}/${clip}/${view}/${String(frame).padStart(2, '0')}.png`);
        }
      }
      combinations.push({ clip, view, genders: ['male', 'female'], scrubbedFrames: [0, 8, 16], decoded: true });
    }
  }
  const scrub = async n => { await page.locator('#timeline').fill(String(n)); await decoded(); };
  await page.locator('button[data-clip="working"]').click(); await ready();
  await page.locator('#play').click();
  await expect.poll(() => page.locator('body').getAttribute('data-frame')).not.toBe('0');
  await page.locator('#play').click();
  const pausedFrame = await page.locator('body').getAttribute('data-frame');
  await page.waitForTimeout(300);
  expect(await page.locator('body').getAttribute('data-frame')).toBe(pausedFrame);
  await page.locator('#speed').selectOption('0.5'); await scrub(0); await page.locator('#play').click();
  await page.waitForTimeout(520);
  const slowFrame = Number(await page.locator('body').getAttribute('data-frame'));
  expect(slowFrame).toBeGreaterThanOrEqual(1); expect(slowFrame).toBeLessThanOrEqual(4);
  await page.locator('#play').click(); await page.locator('#speed').selectOption('1');
  for (const clip of ['walk', 'stand-up']) {
    await page.locator(`button[data-clip="${clip}"]`).click(); await ready();
    await scrub(15); await page.locator('#play').click();
    await expect(page.locator('body')).toHaveAttribute('data-playing', 'false');
    await expect(page.locator('body')).toHaveAttribute('data-frame', '16');
  }
  await page.locator('button[data-clip="working"]').click(); await ready();
  await page.locator('button[data-view="side"]').click(); await ready(); await scrub(4);
  const firstStill = page.locator('[data-still]').first();
  await firstStill.click(); await expect(page.locator('#detail')).toBeVisible();
  await page.locator('#detail-image').evaluate(i => i.decode());
  await page.keyboard.press('Escape'); await expect(page.locator('#detail')).not.toBeVisible();
  await expect(firstStill).toBeFocused();
  await page.locator('#timeline').focus(); await page.keyboard.press('ArrowRight');
  await expect(page.locator('body')).toHaveAttribute('data-frame', '5');
  const downloads = [];
  for (const file of ['male-controls-f.blend', 'female-controls-f.blend', 'male-rigged-f.glb', 'female-rigged-f.glb', 'manifest-f.json']) {
    const response = await context.request.get(new URL(file, url).href); expect(response.status()).toBe(200);
    const sha256 = hash(await response.body());
    expect(sha256).toBe(hash(await readFile(fileURLToPath(new URL('../../art-source/character-f/' + file, import.meta.url)))));
    downloads.push({ file, sha256, status: 200 });
  }
  for (const viewport of [{ width: 1440, height: 1050 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport); await ready(); await decoded();
    await page.locator('header').scrollIntoViewIfNeeded();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    expect(await page.locator('header').count()).toBe(1); expect(await page.locator('main').count()).toBe(1);
    const metrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, models: [...document.querySelectorAll('.model img')].map(i => ({ width: i.getBoundingClientRect().width, height: i.getBoundingClientRect().height })) }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: output + `/viewport-${viewport.width}.png` });
    if (viewport.width === 390) {
      await page.locator('.transport').scrollIntoViewIfNeeded();
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const transport = await page.locator('.transport').boundingBox();
      expect(transport.y).toBeGreaterThanOrEqual(0);
      expect(transport.y + transport.height).toBeLessThanOrEqual(viewport.height);
      await page.screenshot({ path: output + '/mobile-controls.png' });
    }
    layouts.push({ viewport, ...metrics, overflow: false });
  }
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.locator('button[data-view="three-quarter"]').click(); await ready(); await scrub(4);
  await page.locator('header').scrollIntoViewIfNeeded(); await page.screenshot({ path: output + '/desktop-three-quarter.png' });
  const denied = [];
  for (const path of ['/package.json', '/src/App.tsx', '/scripts/character-f/rig.py', '/art-source/character-f/', '/evidence/character-f/validation.json', '/%2e%2e/package.json']) {
    const response = await context.request.get(base + path); expect(response.status()).toBe(404); denied.push(path);
  }
  expect(errors).toEqual([]); expect(failed).toEqual([]); expect(external).toEqual([]);
  expect(hash(await readFile(reviewFile))).toBe(reviewSha256);
  const receipt = { pass: true, browser: await browser.version(), chromiumSandbox: true, page: url,
    reviewSha256,
    combinations, modelViewCombinations: combinations.length * 2,
    playback: { actualFrameAdvanced: true, pauseHeldFrame: true, halfSpeedFrameAfter520ms: slowFrame, nonLoopClipsStopAtEnd: true, keyboardScrub: true },
    modal: { decoded: true, escapeAndFocusReturn: true }, downloads, layouts, denied,
    pageErrors: errors, failedRequests: failed, externalRequests: external,
    limits: ['PNG sequence review, not real-time 3D/game performance', 'Chrome automation, not human art acceptance or native Safari testing'] };
  await writeFile(output + '/receipt.json', JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify({ pass: true, modelViewCombinations: combinations.length * 2, downloads: downloads.length, layouts: layouts.length, errors: errors.length, failed: failed.length, external: external.length }));
} finally {
  await browser.close();
}
