import { test } from "node:test";
import assert from "node:assert/strict";
import { officeShade, switchBounds } from "./wallSwitch";

test("lights on preserves the room; lights off keeps daylight and darkens at night", () => {
  for (const night of [0, 0.5, 1]) assert.equal(officeShade(true, night), 0);
  assert.ok(officeShade(false, 0) > 0 && officeShade(false, 0) < 0.3);
  assert.ok(officeShade(false, 1) > officeShade(false, 0.5));
  assert.ok(officeShade(false, 0.5) > officeShade(false, 0));
  assert.ok(officeShade(false, 1) < 1);
});
const project = (x: number, y: number, z: number) => ({
  x: (x - y) * 65,
  y: (x + y) * 32.5 - z * 65 * Math.SQRT2 * Math.cos(Math.PI / 6),
});
test("switch follows camera, covers its plate and stays clear of Project and clock", () => {
  for (const zoom of [0.3, 0.46, 0.54, 1, 2.4]) {
    const camera = { x: 1600, y: 300, zoom, width: 3000, height: 1600 };
    const box = switchBounds(camera, project);
    assert.ok(box.width >= 44 && box.height >= 44 && box.visible);
    assert.ok(box.face.x >= 0 && box.face.y >= 0);
    assert.ok(
      box.face.x + box.face.width <= box.width &&
        box.face.y + box.face.height <= box.height,
    );
    const board = project(0.1, 5.4, 1);
    assert.ok(box.x + box.width < camera.x + (board.x + 40 - 60) * zoom);
    const clock = project(0.035, 7.35, 1.55);
    assert.ok(
      box.x + box.width <=
        camera.x + clock.x * zoom - (0.89 * 164 * zoom) / 2 - 1 + 1e-6,
    );
    assert.equal(switchBounds({ ...camera, x: -1000 }, project).visible, false);
  }
});
