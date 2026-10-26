import { describe, it, expect } from "vitest";
import { createGame } from "../src/simulation/create";
import { transition } from "../src/simulation/engine";
import { phaseAt, clockLabel } from "../src/simulation/clock";
import { employeeActivity } from "../src/simulation/workStatus";
import { advanceHealth } from "../src/simulation/health";
import { accrueQuarter, newAccrual } from "../src/simulation/accrual";
import { baseCapacity } from "../src/simulation/work";
import { validateState } from "../src/persistence/schema";
import { encodeSave, decodeSave, checksum } from "../src/persistence/saves";
import { advanceFixtureDays } from "./helpers/advance";
import { GameStore } from "../src/app/store";
import type { State, Command } from "../src/simulation/types";
const fresh = () =>
  createGame({
    name: "Intraday",
    strategy: "outsourcing",
    difficulty: "standard",
    seed: 51,
  });
const send = (s: State, c: Command) => {
  const r = transition(s, c);
  expect(r.ok, r.error?.en).toBe(true);
  return r.state;
};
function assigned() {
  let s = fresh();
  s = send(s, { type: "sign", contractId: s.contracts[0].id });
  return send(s, {
    type: "assign",
    employeeId: s.employees[0].id,
    target: s.work[0].id,
    kind: "develop",
  });
}
describe("24h authoritative calendar", () => {
  it("starts day1 midnight with no precredited recovery and uses exclusive shifts", () => {
    const s = fresh();
    expect(s.day).toBe(1);
    expect(s.clock).toEqual({ minute: 0, opened: false, lastClosedDay: 0 });
    expect(s.employees[0].energy).toBe(90);
    expect(
      [525, 540, 705, 720, 765, 780, 1065, 1080, 1185, 1200].map(phaseAt),
    ).toEqual([
      "rest",
      "work",
      "work",
      "lunch",
      "lunch",
      "work",
      "work",
      "overtime",
      "overtime",
      "rest",
    ]);
    expect(clockLabel(547)).toBe("09:00");
    expect(clockLabel(1440)).toBe("00:00");
  });
  it("runs no work at night/lunch and creates actual work only after09:00", () => {
    let s = assigned();
    s = send(s, { type: "advanceTime", steps: 36 });
    expect(s.clock.minute).toBe(540);
    expect(s.work[0].done).toBe(0);
    s = send(s, { type: "advanceTime", steps: 1 });
    expect(s.work[0].done).toBeGreaterThan(0);
    s = send(s, { type: "advanceTime", steps: 11 });
    expect(s.clock.minute).toBe(720);
    const wp = s.work[0].done;
    s = send(s, { type: "advanceTime", steps: 4 });
    expect(s.work[0].done).toBe(wp);
    expect(s.clock.minute).toBe(780);
  });
  it("closes day once and does not charge cash for unposted accrual", () => {
    let s = fresh();
    const cash = s.cash;
    s = send(s, { type: "advanceTime", steps: 96 });
    expect(s.day).toBe(2);
    expect(s.clock).toEqual({ minute: 0, opened: false, lastClosedDay: 1 });
    expect(s.cash).toBe(cash);
    expect(s.accrual.payroll).toBeGreaterThan(0);
    expect(() => validateState(s)).not.toThrow();
  });
  it("stops a batch at critical opening, then resumes without repeating its hooks", () => {
    let s = fresh();
    s.events.push({
      id: "attention",
      templateId: "cloud-bill",
      announced: 0,
      due: 1,
      expires: 7,
      resolved: false,
    });
    const r = transition(s, { type: "advanceTime", steps: 96 });
    expect(r.critical).toBe(true);
    expect(r.steps).toBe(0);
    expect(r.state.clock.minute).toBe(0);
    expect(r.state.clock.opened).toBe(true);
    const rng = r.state.rng;
    s = send(r.state, { type: "advanceTime", steps: 1 });
    expect(s.clock.minute).toBe(15);
    expect(s.rng).toBe(rng);
  });
  it("keeps assignment/seat identity and only permits staffed OT", () => {
    const s = assigned();
    s.clock.minute = 1080;
    expect(employeeActivity(s, s.employees[0]).working).toBe(false);
    s.overtime = true;
    expect(employeeActivity(s, s.employees[0])).toMatchObject({
      present: true,
      working: true,
    });
    expect(employeeActivity(s, s.employees[1]).present).toBe(false);
    s.clock.minute = 720;
    expect(employeeActivity(s, s.employees[0])).toMatchObject({
      present: true,
      working: false,
    });
  });
  it("gives32 regular quarters and8 OT quarters +20% at frozen capacity, not44%", () => {
    const s = assigned(),
      e = s.employees[0],
      c = baseCapacity(s, e, e.assignments[0]);
    s.overtime = true;
    expect((32 * c) / 224 + (8 * 0.8 * c) / 224).toBeCloseTo(
      (1.2 * 32 * c) / 224,
      12,
    );
  });
  it.each([false, true])(
    "matches batched vs individual quarter replay, OT=%s",
    (ot) => {
      let a = assigned();
      a.overtime = ot;
      let b = structuredClone(a);
      a = send(a, { type: "advanceTime", steps: 96 });
      for (let i = 0; i < 96; i++)
        b = send(b, { type: "advanceTime", steps: 1 });
      expect(a).toEqual(b);
    },
  );
  it("rejects invalid steps atomically and makes light cosmetic", () => {
    const s = fresh();
    for (const steps of [0, -1, 0.5, Infinity, 34561])
      expect(transition(s, { type: "advanceTime", steps }).state).toBe(s);
    const off = send(s, { type: "officeLights", enabled: false });
    expect(off.rng).toBe(s.rng);
    expect(off.cash).toBe(s.cash);
    expect(off.actions).toBe(s.actions);
  });
});
describe("intraday health/cents budgets", () => {
  it.each([
    [false, 10, 0.5],
    [true, -12, -4],
  ] as const)("keeps weekly health anchor OT=%s", (ot, energy, morale) => {
    const s = fresh();
    s.overtime = ot;
    const e = s.employees[0];
    e.energy = 50;
    e.morale = 50;
    e.traits = [];
    for (let i = 0; i < 672; i++) {
      s.clock.minute = (i % 96) * 15;
      const p = phaseAt(s.clock.minute);
      advanceHealth(
        s,
        new Set(p === "work" || (ot && p === "overtime") ? [e.id] : []),
      );
    }
    expect(e.energy).toBeCloseTo(50 + energy, 8);
    expect(e.morale).toBeCloseTo(50 + morale, 8);
  });
  it.each([false, true])("reconciles monthly payroll exactly, OT=%s", (ot) => {
    const s = fresh();
    s.overtime = ot;
    s.accrual = newAccrual();
    const salaries = s.employees.reduce((n, e) => n + e.salary, 0);
    for (let i = 0; i < 2880; i++) {
      s.clock.minute = (i % 96) * 15;
      accrueQuarter(s, new Set(ot ? s.employees.map((e) => e.id) : []));
    }
    expect(s.accrual.payroll).toBe(salaries * (ot ? 1.2 : 1));
    expect(s.accrual.payrollRemainder).toBe(0);
    expect(s.accrual.operations).toBe(200000);
    expect(s.accrual.operationsRemainder).toBe(0);
  });
  it("does not erase incurred premium when OT is disabled before payroll", () => {
    const s = fresh();
    s.clock.minute = 1080;
    s.overtime = true;
    accrueQuarter(s, new Set([s.employees[0].id]));
    const incurred = s.accrual.payroll;
    s.overtime = false;
    expect(s.accrual.payroll).toBe(incurred);
  });
  it("keeps the original billing period isolated for old saves", async () => {
    const legacy: Record<string, unknown> = {
      ...fresh(),
      version: 2,
      day: 17,
      balanceVersion: "T0.3",
    };
    for (const k of ["clock", "accrual", "workDay", "discovery", "scene"])
      delete legacy[k];
    const payload = JSON.stringify({
      format: "software-ceo-save",
      schemaVersion: 2,
      algorithm: "SHA-256",
      checksum: await checksum(legacy),
      state: legacy,
    });
    const s = await decodeSave(payload);
    expect(s.day).toBe(18);
    expect(s.clock.lastClosedDay).toBe(17);
    expect(s.accrual.legacyThroughDay).toBe(30);
    const before = structuredClone(s);
    accrueQuarter(s, new Set(s.employees.map((e) => e.id)));
    expect(s).toEqual(before);
  });
  it("roundtrips mid-shift work/RNG/pending cents and future outcomes", async () => {
    let s = assigned();
    s = send(s, { type: "advanceTime", steps: 39 });
    const copy = await decodeSave(await encodeSave(s));
    expect(copy).toEqual(s);
    expect(transition(copy, { type: "advanceTime", steps: 57 })).toEqual(
      transition(s, { type: "advanceTime", steps: 57 }),
    );
  });
});
describe("elapsed-time app clock", () => {
  it("has the same quarter result at different cadence/speeds", () => {
    const a = new GameStore(),
      b = new GameStore();
    for (const store of [a, b]) {
      store.newGame({
        name: "Clock",
        strategy: "product",
        difficulty: "standard",
        seed: 11,
      });
      store.setSpeed(1);
    }
    for (let i = 0; i < 125; i++) a.advance(16);
    for (let i = 0; i < 20; i++) b.advance(100);
    expect(a.getSnapshot().game).toEqual(b.getSnapshot().game);
    const phase = a.visualTime.current.minute;
    a.setSpeed(0);
    a.advance(100);
    expect(a.visualTime.current.minute).toBe(phase);
    a.setSpeed(4);
    a.advance(100);
    expect(a.visualTime.current.minute).toBeGreaterThan(phase);
  });
  it("pauses on sleep instead of turning a long gap into a quarter", () => {
    const s = new GameStore();
    s.newGame({
      name: "Sleep",
      strategy: "product",
      difficulty: "standard",
      seed: 1,
    });
    s.setSpeed(4);
    const before = s.getSnapshot().game;
    s.advance(3600000);
    expect(s.getSnapshot().game).toEqual(before);
    expect(s.getSnapshot().speed).toBe(0);
  });
});

it("legacy partial month posts the old settlement once, then switches to interval accrual", async () => {
  const legacy: Record<string, unknown> = {
    ...fresh(),
    version: 2,
    day: 17,
    balanceVersion: "T0.3",
    overtime: true,
  };
  for (const key of ["clock", "accrual", "workDay", "discovery", "scene"])
    delete legacy[key];
  const raw = JSON.stringify({
    format: "software-ceo-save",
    schemaVersion: 2,
    algorithm: "SHA-256",
    checksum: await checksum(legacy),
    state: legacy,
  });
  let s = await decodeSave(raw);
  const salary = s.employees.reduce((n, e) => n + e.salary, 0);
  s = advanceFixtureDays(s, 13);
  expect(s.clock.lastClosedDay).toBe(30);
  expect(s.accrual.legacyThroughDay).toBeNull();
  expect(
    s.ledger.filter((e) => e.category === "payroll").map((e) => e.expense),
  ).toEqual([salary * 1.2]);
  s = advanceFixtureDays(s, 30);
  // No runnable assignments: the next month has base payroll, with no idle OT premium.
  expect(
    s.ledger.filter((e) => e.category === "payroll").map((e) => e.expense),
  ).toEqual([salary * 1.2, salary]);
  expect(s.accrual.payroll).toBe(0);
});
