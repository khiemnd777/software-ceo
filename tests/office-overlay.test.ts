import { describe, expect, it } from "vitest";
import { officeStatus, placeOfficeLabel } from "../src/renderer/officeOverlay";
import type { OfficePerson } from "../src/renderer/Office";

const person: OfficePerson = {
  id: "qa",
  name: "QA",
  role: "developer",
  working: true,
  morale: 30,
  energy: 25,
};

describe("office callouts", () => {
  it("keeps warning thresholds and reports both causes over the working state", () => {
    expect(officeStatus(person, false)).toEqual({
      status: "working",
      description: "Đang làm việc",
    });
    expect(officeStatus({ ...person, working: false }, true)).toEqual({
      status: "idle",
      description: "Idle",
    });
    expect(officeStatus({ ...person, morale: 29, energy: 24 }, false)).toEqual({
      status: "alert",
      description: "Tinh thần thấp · Năng lượng thấp",
    });
    expect(officeStatus({ ...person, energy: 24 }, true)).toEqual({
      status: "alert",
      description: "Low energy",
    });
  });
  it("keeps labels inside screen edges and separates colliding labels", () => {
    const first = placeOfficeLabel(
      { id: "a", x: -50, y: -25, width: 140, height: 40 },
      [],
      1280,
      720,
    );
    const second = placeOfficeLabel({ ...first, id: "b" }, [first], 1280, 720);
    expect(first).toMatchObject({ x: 8, y: 8, width: 140, height: 40 });
    expect(
      second.x >= first.x + first.width + 4 ||
        second.y >= first.y + first.height + 4,
    ).toBe(true);
    expect(
      placeOfficeLabel({ ...first, x: 2000, y: 1000 }, [], 1280, 720),
    ).toMatchObject({ x: 1132, y: 672 });
  });
});
