import { advanceFixtureDays } from "./helpers/advance";
import { describe, it, expect } from "vitest";
import { GameStore } from "../src/app/store";
import { encodeSave, decodeSave } from "../src/persistence/saves";
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
      c = start(),
      d = start();
    a.setSpeed(1);
    b.setSpeed(1);
    c.setSpeed(4);
    d.setSpeed(2);
    advance(a, 420000, 16);
    advance(b, 420000, 100);
    advance(c, 105000, 25);
    advance(d, 210000, 250);
    expect(a.getSnapshot().game?.clock.lastClosedDay).toBe(7);
    expect(a.getSnapshot().game).toEqual(b.getSnapshot().game);
    expect(b.getSnapshot().game).toEqual(c.getSnapshot().game);
    expect(c.getSnapshot().game).toEqual(d.getSnapshot().game);
  });
  it.each([24, 60, 120] as const)(
    "day length %s changes pacing without changing a two-day result",
    (seconds) => {
      const a = start(),
        b = start();
      a.setDaySeconds(seconds);
      a.setSpeed(1);
      b.setSpeed(1);
      advance(a, seconds * 2000, 250);
      advance(b, 120000, 100);
      expect(a.getSnapshot().game).toEqual(b.getSnapshot().game);
    },
  );
  it("paused clocks and long wall-clock gaps do not fast-forward", () => {
    const a = start();
    advance(a, 100000, 1000);
    expect(a.getSnapshot().game?.clock.lastClosedDay).toBe(0);
    a.setSpeed(1);
    a.advance(3600000);
    expect(a.getSnapshot().game?.clock.lastClosedDay).toBe(0);
    a.setSpeed(0);
    a.advance(3600000);
    expect(a.getSnapshot().game?.clock.lastClosedDay).toBe(0);
  });
  it("save/restore preserves exact future random outcomes and delayed effects", async () => {
    let a = createGame({
      name: "Replay",
      strategy: "product",
      difficulty: "standard",
      seed: 71,
    });
    a = advanceFixtureDays(a, 28);
    const b = await decodeSave(await encodeSave(a));
    const nextA = advanceFixtureDays(a, 84),
      nextB = advanceFixtureDays(b, 84);
    expect(nextA).toEqual(nextB);
  });
});
