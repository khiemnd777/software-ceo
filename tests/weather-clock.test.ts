import { it, expect } from "vitest";
import {
  weatherForDay,
  weatherBlend,
} from "../src/renderer/lighting/weatherTimeline";
import {
  windowLightFrame,
  windowPatches,
} from "../src/renderer/lighting/windowLight";
import { clockLabel } from "../src/simulation/clock";
it("has deterministic visual-only weather and a smooth midnight transition", () => {
  const modes = new Set(
    Array.from({ length: 100 }, (_, d) => weatherForDay(731, d)),
  );
  expect(modes.size).toBe(5);
  const before = weatherBlend(731, 1439.999),
    after = weatherBlend(731, 1440.001);
  expect(before.to).toBe(after.from);
  expect(after.alpha).toBeLessThan(0.0001);
  expect(weatherBlend(731, 1500).alpha).toBe(1);
});
it("keeps sun/moon beams continuous inside a held clock quarter and clipped to both office sizes", () => {
  expect(clockLabel(540.1)).toBe(clockLabel(540.2));
  const a = windowLightFrame(540.1, "sunny"),
    b = windowLightFrame(540.2, "sunny");
  expect(a.sources[0].drift).not.toBe(b.sources[0].drift);
  for (const room of [
    { x: 8, y: 9 },
    { x: 14, y: 10 },
  ])
    for (const m of [0, 300.1, 420, 720, 1020, 1139])
      for (const source of windowLightFrame(m, "sunny").sources)
        for (const patch of windowPatches(source, room))
          for (const p of patch.points) {
            expect(p.x).toBeGreaterThanOrEqual(0);
            expect(p.x).toBeLessThanOrEqual(room.x);
            expect(p.y).toBeGreaterThanOrEqual(0);
            expect(p.y).toBeLessThanOrEqual(room.y);
          }
});
