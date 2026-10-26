import { test } from "node:test";
import assert from "node:assert/strict";
import { clockLabel, clockMinute } from "./displayClock";

test("clock rounds down at quarter hours and wraps at midnight", () => {
  for (const [minute, label] of [
    [540, "09:00"],
    [547, "09:00"],
    [554.9999, "09:00"],
    [555, "09:15"],
    [570, "09:30"],
    [585, "09:45"],
    [599.9999, "09:45"],
    [600, "10:00"],
    [1439.9999, "23:45"],
    [1440, "00:00"],
    [1454.9999, "00:00"],
    [1455, "00:15"],
    [2880, "00:00"],
  ] as const)
    assert.equal(clockLabel(minute), label);
  assert.equal(clockMinute(547), 540);
  assert.equal(clockMinute(1440), 1440);
});

test("readout holds while continuous game time advances within a step", () => {
  for (let minute = 540; minute < 555; minute += 0.125)
    assert.equal(clockLabel(minute), "09:00");
  for (let minute = 1425; minute < 1440; minute += 0.125)
    assert.equal(clockLabel(minute), "23:45");
});
