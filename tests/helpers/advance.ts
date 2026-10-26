import { transition } from "../../src/simulation/engine";
import type { State } from "../../src/simulation/types";
/** Fixture explicitly resumes after attention stops; it never edits state or resolves events. */
export function advanceFixtureDays(input: State, days: number): State {
  let s = input;
  const target = s.clock.lastClosedDay + days;
  for (
    let attempts = 0;
    attempts < days * 4 + 10 &&
    s.status === "playing" &&
    s.clock.lastClosedDay < target;
    attempts++
  ) {
    const steps = Math.min(
      34560,
      (target - s.clock.lastClosedDay) * 96 - s.clock.minute / 15,
    );
    const r = transition(s, { type: "advanceTime", steps });
    if (!r.ok) throw Error(r.error?.en);
    if (
      r.state.day === s.day &&
      r.state.clock.minute === s.clock.minute &&
      r.state.clock.opened === s.clock.opened
    )
      throw Error("Fixture clock made no progress");
    s = r.state;
  }
  return s;
}
