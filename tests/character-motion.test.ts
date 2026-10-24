import { describe, it, expect } from "vitest";
import { characterPose } from "../src/renderer/characterMotion";

const person = { id: "", working: false, morale: 80, energy: 90 };
describe("sprite motion timing and root normalization contract", () => {
  it("plays 16 frames over two seconds and keeps reduced motion static", () => {
    expect(
      characterPose({ ...person, working: true }, 1.875, false).frame,
    ).toBe(15);
    expect(characterPose({ ...person, working: true }, 2, false).frame).toBe(0);
    expect(characterPose(person, 37, true)).toEqual({
      state: "idle",
      frame: 0,
      offset: 0,
    });
    expect(
      characterPose(
        { ...person, working: true, taskKind: "research" },
        37,
        true,
      ),
    ).toEqual({ state: "meeting", frame: 0, offset: 0 });
    expect(characterPose({ ...person, morale: 20 }, 37, true)).toEqual({
      state: "alert",
      frame: 0,
      offset: 0,
    });
  });
  it("joins standing, turns, normalized walking and sitting at the same anchors", () => {
    const expected = [
      [32, "stand", 0, 0],
      [33.9, "stand", 15, 0],
      [34, "turnRight", 0, 0],
      [35.9, "turnRight", 15, 0],
      [36, "walkRight", 0, 0],
      [37, "walkRight", 8, 0.46],
      [38, "turnRight", 15, 0.92],
      [40, "turnLeft", 0, 0.92],
      [42, "walkLeft", 0, 0.92],
      [43, "walkLeft", 8, 0.46],
      [44, "turnLeft", 15, 0],
      [46, "stand", 15, 0],
      [47.99, "stand", 0, 0],
      [48, "idle", 0, 0],
    ] as const;
    for (const [time, state, frame, offset] of expected)
      expect(characterPose(person, time, false)).toEqual({
        state,
        frame,
        offset,
      });
    for (let time = 0; time < 96; time += 0.03) {
      const pose = characterPose(person, time, false);
      expect(pose.offset).toBeGreaterThanOrEqual(0);
      expect(pose.offset).toBeLessThanOrEqual(0.92);
      expect(pose.frame).toBeGreaterThanOrEqual(0);
      expect(pose.frame).toBeLessThan(16);
    }
  });
});
