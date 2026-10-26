import { test } from "node:test";
import assert from "node:assert/strict";
import { screenPlane, screenCorners, screenState } from "./workingMonitors";
test("monitor glass follows the locked sprite anchor, scale and shear", () => {
  const p = screenPlane({ x: 100, y: 200 }, 0.5, [192, 280]);
  assert.deepEqual(screenCorners(p), [
    { x: 106, y: 102.5 },
    { x: 135.5, y: 117.25 },
    { x: 135.5, y: 135 },
    { x: 106, y: 120.25 },
  ]);
  const moved = screenPlane({ x: 130, y: 180 }, 0.5, [192, 280]);
  assert.deepEqual(
    screenCorners(moved).map((q, i) => ({
      x: q.x - screenCorners(p)[i].x,
      y: q.y - screenCorners(p)[i].y,
    })),
    Array(4).fill({ x: 30, y: -20 }),
  );
});
test("cosmetic code/terminal sequence replays and reduced motion holds a static frame", () => {
  assert.deepEqual(screenState(7, 0), screenState(71, 0));
  assert.equal(screenState(0, 0).mode, "code");
  assert.equal(screenState(32, 0).mode, "terminal");
  assert.notEqual(screenState(0, 0).rows, screenState(18, 0).rows);
  assert.notEqual(screenState(0, 0).cursor, screenState(4, 0).cursor);
  assert.notDeepEqual(screenState(0, 0), screenState(0, 1));
  assert.deepEqual(screenState(12, 1, true), screenState(200, 1, true));
});
