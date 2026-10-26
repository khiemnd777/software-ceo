import type { State } from "./types";
import { phaseAt } from "./clock";
import { clamp } from "./helpers";
export function advanceHealth(s: State, working: ReadonlySet<string>) {
  const phase = phaseAt(s.clock.minute);
  for (const e of s.employees) {
    const busy = working.has(e.id);
    const overtime = phase === "overtime" && busy;
    const lowEnergy = e.energy < 25;
    let energy = busy
      ? overtime
        ? -1.2 - (e.traits.includes("driven") ? 3 / 14 : 0)
        : -0.6
      : phase === "lunch"
        ? 23 / 35
        : 13 / 35;
    if (
      !busy &&
      phase !== "lunch" &&
      !s.overtime &&
      e.traits.includes("steady")
    )
      energy += 2 / 105;
    let morale = overtime
      ? -177 / 560
      : phase === "lunch"
        ? 0.05
        : !busy && s.clock.minute >= 1080 && s.clock.minute < 1320
          ? 3 / 560
          : 0;
    if (busy && !overtime && lowEnergy) morale -= 2.5 / (7 * 8);
    e.energy = clamp(e.energy + energy / 4);
    e.morale = clamp(e.morale + morale / 4);
  }
}
