import { test } from "node:test";
import assert from "node:assert/strict";
import { weatherFrame } from "./outdoorWeather";
import {
  windowLightFrame,
  windowPatches,
  projectGlass,
  GLASS,
  officeWindows,
} from "./windowLight";

test("sun/moon illumination uses the visible sky bodies, weather and 24h wrap", () => {
  for (const weather of [
    "sunny",
    "cloudy",
    "rain",
    "wind",
    "rain-wind",
  ] as const)
    for (const minute of [0, 300, 420, 540, 720, 1020, 1110, 1140, 1439]) {
      const sky = weatherFrame(minute, weather, 0);
      const lights = windowLightFrame(minute, weather, sky).sources;
      assert.deepEqual(
        lights.map((s) => s.kind),
        (["sun", "moon"] as const).filter(
          (kind) => sky[kind].visible && sky[kind].alpha > 0,
        ),
      );
      for (const light of lights) {
        assert.equal(
          light.alpha,
          sky[light.kind].alpha * (light.kind === "sun" ? 0.4 : 0.22),
        );
        assert.ok(light.alpha > 0 && light.alpha < 1);
      }
    }
  assert.deepEqual(
    windowLightFrame(0, "sunny").sources,
    windowLightFrame(1440, "sunny").sources,
  );
  assert.deepEqual(
    windowLightFrame(720, "sunny").sources.map((s) => s.kind),
    ["sun"],
  );
  assert.deepEqual(
    windowLightFrame(0, "sunny").sources.map((s) => s.kind),
    ["moon"],
  );
  assert.ok(
    windowLightFrame(720, "rain-wind").sources[0].alpha <
      windowLightFrame(720, "cloudy").sources[0].alpha,
  );
  assert.ok(
    windowLightFrame(720, "cloudy").sources[0].alpha <
      windowLightFrame(720, "sunny").sources[0].alpha,
  );
  assert.ok(
    windowLightFrame(0, "rain-wind").sources[0].alpha <
      windowLightFrame(0, "sunny").sources[0].alpha,
  );
});
test("projected panes keep the window mullion gap, floor bounds and long low-angle light", () => {
  assert.equal(officeWindows(8).length, 3);
  const noon = windowLightFrame(720, "sunny").sources[0];
  const morning = windowLightFrame(420, "sunny").sources[0];
  assert.ok(
    projectGlass(2, GLASS.top, morning).y > projectGlass(2, GLASS.top, noon).y,
  );
  const patches = windowPatches(noon, { x: 8, y: 9 });
  assert.equal(patches.length, 6);
  assert.ok(patches[0].points[1].x < patches[1].points[0].x);
  for (const minute of [301, 420, 720, 1020, 1139, 0, 360])
    for (const source of windowLightFrame(minute, "sunny").sources)
      for (const patch of windowPatches(source, { x: 8, y: 9 }))
        for (const p of patch.points)
          assert.ok(p.x >= 0 && p.x <= 8 && p.y >= 0 && p.y <= 9);
});
test("light geometry moves inside a 15-minute clock step and fades continuously at boundaries", () => {
  const a = windowLightFrame(540, "sunny").sources[0];
  const b = windowLightFrame(540.1, "sunny").sources[0];
  assert.notDeepEqual(
    projectGlass(2, GLASS.top, a),
    projectGlass(2, GLASS.top, b),
  );
  assert.ok(
    Math.abs(
      projectGlass(2, GLASS.top, a).x - projectGlass(2, GLASS.top, b).x,
    ) < 0.01,
  );
  for (const minute of [300, 420, 440, 1000, 1020, 1140, 1440]) {
    const sum = (m: number) =>
      windowLightFrame(m, "sunny").sources.reduce((v, s) => v + s.alpha, 0);
    assert.ok(Math.abs(sum(minute - 0.001) - sum(minute + 0.001)) < 0.0001);
    const colors = [minute - 0.001, minute + 0.001].map((m) =>
      windowLightFrame(m, "sunny")
        .sources.find((s) => s.kind === "sun")
        ?.color.split(",")
        .map(Number),
    );
    if (colors[0] && colors[1])
      assert.ok(colors[0].every((v, i) => Math.abs(v - colors[1]![i]) <= 1));
  }
});
