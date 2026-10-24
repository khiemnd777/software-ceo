import type { TaskKind } from "../simulation/types";

export type CharacterTrack =
  | "idle"
  | "working"
  | "meeting"
  | "alert"
  | "stand"
  | "turnRight"
  | "walkRight"
  | "turnLeft"
  | "walkLeft";
export interface CharacterPose {
  state: CharacterTrack;
  frame: number;
  offset: number;
}
export const CHARACTER_FPS = 8;
export const CHARACTER_FRAME_COUNT = 16;
export const CHARACTER_WALK_SPEED = 0.46;
type MotionPerson = {
  id: string;
  working: boolean;
  morale: number;
  energy: number;
  taskKind?: TaskKind;
};

/** Cosmetic clock only: two-second F clips and 0.92 m walking segments. */
export function characterPose(
  person: MotionPerson,
  seconds: number,
  still: boolean,
): CharacterPose {
  const hash = [...person.id].reduce(
    (h, c) => (h * 31 + c.charCodeAt(0)) >>> 0,
    0,
  );
  const clock = seconds + (hash % 47);
  const frame = still
    ? 0
    : Math.floor(clock * CHARACTER_FPS) % CHARACTER_FRAME_COUNT;
  if (person.morale < 30 || person.energy < 25)
    return { state: "alert", frame, offset: 0 };
  if (person.working)
    return {
      state: person.taskKind === "research" ? "meeting" : "working",
      frame,
      offset: 0,
    };
  if (still) return { state: "idle", frame: 0, offset: 0 };
  const t = clock % 48;
  const step = (start: number) =>
    Math.min(15, Math.floor((t - start) * CHARACTER_FPS));
  if (t < 32) return { state: "idle", frame, offset: 0 };
  if (t < 34) return { state: "stand", frame: step(32), offset: 0 };
  if (t < 36) return { state: "turnRight", frame: step(34), offset: 0 };
  if (t < 38)
    return {
      state: "walkRight",
      frame,
      offset: (t - 36) * CHARACTER_WALK_SPEED,
    };
  if (t < 40) return { state: "turnRight", frame: 15 - step(38), offset: 0.92 };
  if (t < 42) return { state: "turnLeft", frame: step(40), offset: 0.92 };
  if (t < 44)
    return {
      state: "walkLeft",
      frame,
      offset: (44 - t) * CHARACTER_WALK_SPEED,
    };
  if (t < 46) return { state: "turnLeft", frame: 15 - step(44), offset: 0 };
  return { state: "stand", frame: 15 - step(46), offset: 0 };
}
