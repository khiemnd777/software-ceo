import { it, expect } from "vitest";
import { createGame } from "../src/simulation/create";
import { transition } from "../src/simulation/engine";
import { runWork } from "../src/simulation/work";
import { advanceHealth } from "../src/simulation/health";
import { accrueQuarter, operationsRate } from "../src/simulation/accrual";
import { deliveryForecast } from "../src/simulation/selectors";
import { phaseAt } from "../src/simulation/clock";
import { advanceFixtureDays } from "./helpers/advance";
import { encodeSave, decodeSave } from "../src/persistence/saves";
import { invariantErrors } from "../src/persistence/schema";
import type { State, Command } from "../src/simulation/types";
const fresh = () =>
  createGame({
    name: "Regression",
    strategy: "outsourcing",
    difficulty: "standard",
    seed: 51,
  });
function send(s: State, c: Command) {
  const r = transition(s, c);
  expect(r.ok, r.error?.en).toBe(true);
  return r.state;
}
function assignment() {
  let s = fresh();
  s = send(s, { type: "sign", contractId: s.contracts[0].id });
  return send(s, {
    type: "assign",
    employeeId: s.employees[0].id,
    target: s.work[0].id,
    kind: "develop",
  });
}

it("actual frozen-capacity work adds exactly 20% for eight OT quarters", () => {
  const outputs = [false, true].map((ot) => {
    const s = assignment();
    s.overtime = ot;
    s.work[0].actual = 1e4;
    for (let q = 0; q < (ot ? 40 : 32); q++) {
      s.clock.minute = q < 32 ? 540 : 1080;
      s.work[0].debt = 0;
      runWork(s, (q < 32 ? 1 : 0.8) / 224);
    }
    return s.work[0].done;
  });
  expect(outputs[1] / outputs[0]).toBeCloseTo(1.2, 7);
});
it("retargeting a slot cannot reroll its per-day defect budget", () => {
  let s = assignment();
  s = send(s, { type: "advanceTime", steps: 37 });
  const budget = structuredClone(s.workDay.budgets),
    rng = s.rng;
  s = send(s, { type: "unassign", employeeId: s.employees[0].id });
  s = send(s, {
    type: "assign",
    employeeId: s.employees[0].id,
    target: s.work[0].id,
    kind: "develop",
  });
  expect(s.workDay.budgets).toEqual(budget);
  expect(s.rng).toBe(rng);
  s = send(s, { type: "advanceTime", steps: 1 });
  expect(Object.keys(s.workDay.budgets)).toEqual(Object.keys(budget));
  expect(Object.values(s.workDay.budgets)[0].roll).toBe(
    Object.values(budget)[0].roll,
  );
});
it("research needs real investment; capped work does not create effort, XP or labor twice", () => {
  const s = assignment(),
    e = s.employees[0],
    w = s.work[0];
  e.assignments = [{ target: w.id, kind: "research" }];
  runWork(s, 1e-8);
  expect(w.discovered).toBe(false);
  expect(s.discovery[w.id].done).toBeGreaterThan(0);
  e.assignments = [{ target: w.id, kind: "develop" }];
  w.done = w.actual - 1e-6;
  runWork(s, 1 / 224);
  expect(w.done).toBe(w.actual);
  const snapshot = { effort: w.effort, xp: e.xp, labor: w.labor, rng: s.rng };
  runWork(s, 1 / 224);
  expect({ effort: w.effort, xp: e.xp, labor: w.labor, rng: s.rng }).toEqual(
    snapshot,
  );
});
it.each([
  ["steady", false, 12],
  ["driven", true, -15],
] as const)(
  "preserves the weekly %s trait health anchor",
  (trait, ot, delta) => {
    const s = fresh();
    s.overtime = ot;
    const e = s.employees[0];
    e.traits = [trait];
    e.energy = 50;
    e.morale = 50;
    for (let q = 0; q < 672; q++) {
      s.clock.minute = (q % 96) * 15;
      const p = phaseAt(s.clock.minute);
      advanceHealth(
        s,
        new Set(p === "work" || (ot && p === "overtime") ? [e.id] : []),
      );
    }
    expect(e.energy).toBeCloseTo(50 + delta, 8);
  },
);
it.each([2, 7, 30, 90])(
  "replays %s days identically across batch, quarter saves and critical openings",
  async (days) => {
    let a = assignment(),
      b = structuredClone(a);
    a = advanceFixtureDays(a, days);
    let guard = 0;
    while (
      b.clock.lastClosedDay < days &&
      b.status === "playing" &&
      guard++ < days * 98
    ) {
      b = send(b, { type: "advanceTime", steps: 1 });
      if (b.clock.minute === 555) b = await decodeSave(await encodeSave(b));
    }
    expect(b).toEqual(a);
    expect(invariantErrors(b)).toEqual([]);
  },
);
it("prorates a mid-month hire, then posts once", () => {
  let s = fresh();
  const salaries = s.employees.reduce((n, e) => n + e.salary, 0);
  s = advanceFixtureDays(s, 15);
  const candidate = s.candidates[0];
  s = send(s, { type: "hire", candidateId: candidate.id });
  // Marketing is only available for a product; office rent stays fixed in this fixture.
  s = advanceFixtureDays(s, 15);
  expect(
    s.ledger
      .filter((e) => e.category === "payroll")
      .reduce((n, e) => n + e.expense, 0),
  ).toBe(salaries + candidate.salary / 2);
  expect(s.ledger.filter((e) => e.category === "operations")).toHaveLength(1);
  expect(s.accrual.payroll).toBe(0);
  expect(s.accrual.operations).toBe(0);
  s = send(s, { type: "advanceTime", steps: 1 });
  expect(s.ledger.filter((e) => e.category === "payroll")).toHaveLength(1);
});

it("accrues changed salary and operations only after their effective quarter, preserving sub-cent carry", () => {
  const s = fresh();
  s.employees = [s.employees[0]];
  s.employees[0].salary = 100000;
  const ops = operationsRate(s);
  for (let q = 0; q < 1440; q++) {
    s.clock.minute = (q % 96) * 15;
    accrueQuarter(s, new Set());
  }
  s.employees[0].salary = 100001;
  s.product.marketing = 100001;
  s.officeTier = 2;
  for (let q = 0; q < 1440; q++) {
    s.clock.minute = (q % 96) * 15;
    accrueQuarter(s, new Set());
  }
  expect(s.accrual.payroll).toBe(100000);
  expect(s.accrual.payrollRemainder).toBe(7200);
  expect(s.accrual.operations).toBe(ops + 140000);
  expect(s.accrual.operationsRemainder).toBe(1440);
});
it("forecast uses remaining shift time and never hidden actual scope", () => {
  let s = assignment();
  s = send(s, {
    type: "assign",
    employeeId: s.employees[1].id,
    target: s.work[0].id,
    kind: "qa",
  });
  s.work[0].estimated = 1;
  s.work[0].qa = 1;
  s.clock.minute = 540;
  s.clock.opened = true;
  const morning = deliveryForecast(s, s.contracts[0]);
  s.work[0].actual = 9999;
  expect(deliveryForecast(s, s.contracts[0])).toEqual(morning);
  s.contracts[0].deadline = morning.maxFinishDay!;
  s.clock.minute = 1020;
  const evening = deliveryForecast(s, s.contracts[0]);
  expect(evening.maxFinishDay).toBeGreaterThan(morning.maxFinishDay!);
  expect(evening.late).toBe(true);
});
