import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildTimeline,
  phaseAt,
  totalCost,
  timeLabel,
  lighting,
  MILESTONES,
} from "./model";

const close = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≠ ${expected}`);
test("shift boundaries, lunch and overtime are exclusive", () => {
  for (const day of [0, 1440]) {
    assert.equal(phaseAt(day + 480, "regular"), "rest");
    assert.equal(phaseAt(day + 525, "regular"), "rest");
    assert.equal(phaseAt(day + 540, "regular"), "work");
    assert.equal(phaseAt(day + 705, "regular"), "work");
    assert.equal(phaseAt(day + 720, "regular"), "lunch");
    assert.equal(phaseAt(day + 780, "regular"), "work");
    assert.equal(phaseAt(day + 765, "overtime"), "lunch");
    assert.equal(phaseAt(day + 1020, "regular"), "work");
    assert.equal(phaseAt(day + 1065, "regular"), "work");
    assert.equal(phaseAt(day + 1080, "regular"), "rest");
    assert.equal(phaseAt(day + 1080, "overtime"), "overtime");
    assert.equal(phaseAt(day + 1185, "overtime"), "overtime");
    assert.equal(phaseAt(day + 1200, "overtime"), "rest");
  }
});
test("identical input through the first regular shift; pure deterministic replay", () => {
  const a = buildTimeline(),
    b = buildTimeline();
  assert.deepEqual(a, b);
  assert.equal(a.length, 193);
  for (const frame of a.filter((frame) => frame.minute <= 1080))
    assert.deepEqual(frame.regular, frame.overtime);
  assert.notEqual(a[0].regular, a[1].regular);
  close(a[0].regular.energy, 80);
  close(a[36].regular.energy, 90.8);
});
test("no work, no wages during lunch and overnight; recovery is carried into day two", () => {
  const frames = buildTimeline();
  for (let i = 1; i < frames.length; i++) {
    for (const scenario of ["regular", "overtime"] as const) {
      const before = frames[i - 1],
        after = frames[i];
      const phase = phaseAt(before.minute, scenario);
      if (phase === "rest" || phase === "lunch") {
        close(before[scenario].work, after[scenario].work);
        close(before[scenario].laborCents, after[scenario].laborCents);
        assert.ok(after[scenario].energy >= before[scenario].energy);
      }
      assert.equal(
        after[scenario].overheadCents - before[scenario].overheadCents,
        25,
      );
      for (const value of [after[scenario].energy, after[scenario].morale])
        assert.ok(value >= 0 && value <= 100);
      assert.ok(Number.isSafeInteger(totalCost(after[scenario])));
    }
  }
  close(frames[132].regular.energy, 90.8);
  close(frames[132].overtime.energy, 78.4);
  assert.ok(frames[132].overtime.morale < frames[132].regular.morale);
  const regularDayTwo =
    frames[168].regular.regularWork - frames[132].regular.regularWork;
  const overtimeDayTwo =
    frames[168].overtime.regularWork - frames[132].overtime.regularWork;
  assert.ok(
    overtimeDayTwo < regularDayTwo,
    "Prior overtime must reduce next-day regular-shift output",
  );
});
test("48h accounting reconciles exact paid hours and cents with no midnight reset", () => {
  const end = buildTimeline().at(-1)!;
  assert.equal(end.minute, 2880);
  assert.equal(end.regular.regularMinutes, 16 * 60);
  assert.equal(end.regular.overtimeMinutes, 0);
  assert.equal(end.overtime.regularMinutes, 16 * 60);
  assert.equal(end.overtime.overtimeMinutes, 4 * 60);
  assert.equal(end.regular.laborCents, 32000);
  assert.equal(end.overtime.laborCents, 44000);
  assert.equal(end.regular.overheadCents, 4800);
  assert.equal(end.overtime.overheadCents, 4800);
  assert.equal(totalCost(end.regular), 36800);
  assert.equal(totalCost(end.overtime), 48800);
  close(end.regular.energy, 80);
  close(end.overtime.energy, 55.2);
  close(end.regular.morale, 75.34);
  close(end.overtime.morale, 73.22);
  assert.ok(end.overtime.work > end.regular.work);
  assert.ok(
    end.overtime.work < end.regular.work * 1.25,
    "Extra hours must not double-apply existing overtime multiplier",
  );
});
test("approved 3h morning and 5h afternoon, with complete new milestones", () => {
  const frames = buildTimeline();
  for (const day of [0, 1440]) {
    const at = (minute: number) => frames[(day + minute) / 15];
    for (const scenario of ["regular", "overtime"] as const) {
      assert.equal(
        at(720)[scenario].regularMinutes - at(540)[scenario].regularMinutes,
        180,
      );
      assert.equal(
        at(1080)[scenario].regularMinutes - at(780)[scenario].regularMinutes,
        300,
      );
      assert.ok(
        at(1080)[scenario].work > at(1020)[scenario].work,
        "17:00–18:00 remains productive regular work",
      );
    }
    assert.equal(
      at(1200).overtime.overtimeMinutes - at(1080).overtime.overtimeMinutes,
      120,
    );
    close(at(1200).regular.work, at(1080).regular.work);
  }
  assert.deepEqual(
    MILESTONES,
    [0, 540, 720, 780, 1080, 1200, 1440, 1980, 2160, 2220, 2520, 2640, 2880],
  );
  assert.equal(timeLabel(540), "09:00");
  assert.equal(timeLabel(1080), "18:00");
  assert.equal(timeLabel(1200), "20:00");
});
test("one virtual clock produces matching labels and periodic, continuous lighting", () => {
  assert.equal(timeLabel(1020), "17:00");
  assert.equal(timeLabel(1440), "00:00");
  assert.deepEqual(lighting(0), lighting(1440));
  assert.equal(lighting(360).label, "Bình minh");
  assert.equal(lighting(720).label, "Ban ngày");
  assert.equal(lighting(1080).label, "Hoàng hôn");
  assert.equal(lighting(1200).label, "Ban đêm");
  for (const boundary of [300, 420, 540, 960, 1020, 1140, 1320]) {
    assert.ok(
      Math.abs(
        lighting(boundary - 0.001).dark - lighting(boundary + 0.001).dark,
      ) < 0.001,
    );
  }
});
