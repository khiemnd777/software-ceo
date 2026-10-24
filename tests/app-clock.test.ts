import { describe, it, expect } from "vitest";
import { GameStore } from "../src/app/store";
import { encodeSave, decodeSave } from "../src/persistence/saves";
import { transition } from "../src/simulation/engine";
import { createGame } from "../src/simulation/create";
const start = () => {
  const s = new GameStore();
  s.newGame({
    name: "Clock test",
    strategy: "outsourcing",
    difficulty: "standard",
    seed: 919,
  });
  return s;
};
function advance(store: GameStore, ms: number, step: number) {
  let time = 0;
  while (time < ms) {
    const next = Math.min(step, ms - time);
    store.advance(next);
    time += next;
  }
}
describe("clock and save replay", () => {
  it("same simulation result at different render cadence and speed", () => {
    const a = start(),
      b = start(),
      c = start();
    a.setSpeed(1);
    b.setSpeed(1);
    c.setSpeed(4);
    advance(a, 35000, 16);
    advance(b, 35000, 100);
    advance(c, 8750, 25);
    expect(a.getSnapshot().game?.day).toBe(7);
    expect(a.getSnapshot().game).toEqual(b.getSnapshot().game);
    expect(b.getSnapshot().game).toEqual(c.getSnapshot().game);
  });
  it("paused clocks and long wall-clock gaps do not fast-forward", () => {
    const a = start();
    advance(a, 100000, 1000);
    expect(a.getSnapshot().game?.day).toBe(0);
    a.setSpeed(1);
    a.advance(3600000);
    expect(a.getSnapshot().game?.day).toBe(0);
    a.setSpeed(0);
    a.advance(3600000);
    expect(a.getSnapshot().game?.day).toBe(0);
  });
  it("save/restore preserves exact future random outcomes and delayed effects", async () => {
    let a = createGame({
      name: "Replay",
      strategy: "product",
      difficulty: "standard",
      seed: 71,
    });
    a = transition(a, { type: "tick", days: 28 }).state;
    const b = await decodeSave(await encodeSave(a));
    const nextA = transition(a, { type: "tick", days: 84 }),
      nextB = transition(b, { type: "tick", days: 84 });
    expect(nextA).toEqual(nextB);
  });
});
