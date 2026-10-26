import { test } from "node:test";
import assert from "node:assert/strict";
import { WEATHER, weatherFrame } from "./outdoorWeather";
test("same weather/time/phase replays deterministically without business state", () => {
  assert.deepEqual(
    weatherFrame(540, "sunny", 12),
    weatherFrame(1980, "sunny", 12),
  );
  assert.deepEqual(
    weatherFrame(1200, "rain-wind", 7),
    weatherFrame(1200, "rain-wind", 7),
  );
  for (const preset of Object.keys(WEATHER) as (keyof typeof WEATHER)[]) {
    const f = weatherFrame(540, preset, 0);
    assert.ok(f.clouds.length > 0);
    assert.equal(f.rain.length, WEATHER[preset].rain);
  }
});
test("sun belongs to daylight, moon and stars belong to night", () => {
  const day = weatherFrame(540, "sunny", 0),
    night = weatherFrame(0, "sunny", 0);
  assert.ok(day.sun.visible && day.sun.alpha > 0);
  assert.equal(day.moon.visible, false);
  assert.ok(day.stars.every((star) => star.alpha === 0));
  assert.ok(
    night.moon.visible &&
      night.moon.alpha > 0 &&
      night.stars.some((star) => star.alpha > 0),
  );
  assert.equal(night.sun.visible, false);
  assert.ok(
    weatherFrame(1200, "rain", 0).moon.alpha <
      weatherFrame(1200, "sunny", 0).moon.alpha,
  );
});
test("sun, moon and stars fade continuously across rising and setting boundaries", () => {
  for (const minute of [300, 420, 1020, 1140, 1440]) {
    const before = weatherFrame(minute - 0.001, "sunny", 0);
    const after = weatherFrame(minute + 0.001, "sunny", 0);
    for (const name of ["sun", "moon"] as const) {
      assert.ok(Math.abs(before[name].alpha - after[name].alpha) < 0.001);
      if (before[name].alpha > 0.01 && after[name].alpha > 0.01) {
        assert.ok(Math.abs(before[name].x - after[name].x) < 0.001);
        assert.ok(Math.abs(before[name].y - after[name].y) < 0.001);
      }
    }
    assert.ok(Math.abs(before.stars[0].alpha - after.stars[0].alpha) < 0.001);
  }
  assert.ok(weatherFrame(360, "sunny", 0).sun.alpha > 0);
  assert.ok(weatherFrame(360, "sunny", 0).moon.alpha > 0);
  assert.ok(weatherFrame(1080, "sunny", 0).moon.alpha > 0);
});
test("celestial paths advance inside a fifteen-minute business step and through midnight", () => {
  for (const [start, name] of [
    [540, "sun"],
    [1380, "moon"],
  ] as const) {
    const a = weatherFrame(start, "sunny", 0)[name];
    const b = weatherFrame(start + 0.2, "sunny", 0)[name];
    assert.ok(b.x > a.x && b.x - a.x < 0.001);
  }
  const positions = [1380, 1439.9, 1440, 1440.1, 1500].map(
    (minute) => weatherFrame(minute, "sunny", 0).moon.x,
  );
  assert.ok(
    positions.every((x, index) => index === 0 || x > positions[index - 1]),
  );
  assert.deepEqual(weatherFrame(1440, "sunny", 0), weatherFrame(0, "sunny", 0));
});
test("wind changes rain angle and cloud speed; reduced effects holds a static phase", () => {
  const rain = weatherFrame(540, "rain", 1),
    wind = weatherFrame(540, "rain-wind", 1);
  assert.ok(wind.rain[0].slant > rain.rain[0].slant);
  const advance = (preset: "rain" | "rain-wind") =>
    (weatherFrame(540, preset, 1).clouds[0].x -
      weatherFrame(540, preset, 0).clouds[0].x +
      1.8) %
    1.8;
  assert.ok(advance("rain-wind") > advance("rain"));
  assert.notDeepEqual(
    weatherFrame(540, "rain", 0).rain,
    weatherFrame(540, "rain", 1).rain,
  );
  assert.deepEqual(
    weatherFrame(540, "rain", 1, true),
    weatherFrame(540, "rain", 20, true),
  );
});
