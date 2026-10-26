import { test } from "node:test";
import assert from "node:assert/strict";
import { LAMP_COLOR, scenePalette } from "./sceneLighting";
test("exterior and window share one palette while indoor lamps remain lit", () => {
  const frames = [0, 540, 1080, 1200].map((minute) => scenePalette(minute));
  for (const frame of frames) {
    assert.equal(frame.sky, frame.windowSky);
    assert.equal(frame.horizon, frame.windowHorizon);
    assert.equal(frame.lamp, LAMP_COLOR);
  }
  assert.notEqual(frames[0].sky, frames[1].sky);
  assert.notEqual(frames[1].sky, frames[2].sky);
  assert.notEqual(frames[2].sky, frames[3].sky);
  assert.equal(frames[0].daylightAlpha, 0);
  assert.ok(frames[1].daylightAlpha > frames[3].daylightAlpha);
});
test("lighting wraps across midnight and reduced effects freeze exterior only", () => {
  assert.deepEqual(scenePalette(0), scenePalette(1440));
  assert.deepEqual(scenePalette(1200, true), scenePalette(720));
  assert.equal(scenePalette(1200, true).lamp, LAMP_COLOR);
});
test("exterior transitions do not jump at keyframe or midnight boundaries", () => {
  const rgb = (value: string) => value.match(/\d+/g)!.map(Number);
  for (const boundary of [300, 420, 540, 960, 1020, 1140, 1320, 1440]) {
    const before = rgb(scenePalette(boundary - 0.001).sky);
    const after = rgb(scenePalette(boundary + 0.001).sky);
    assert.ok(before.every((value, i) => Math.abs(value - after[i]) <= 1));
  }
});
