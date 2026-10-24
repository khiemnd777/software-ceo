import { describe, it, expect } from "vitest";
import { createGame } from "../../src/simulation/create";
import { transition } from "../../src/simulation/engine";
import type { Assignment, Command, State } from "../../src/simulation/types";
function fixture() {
  let s = createGame({
    name: "Assignments",
    strategy: "outsourcing",
    difficulty: "standard",
    seed: 101,
  });
  for (const c of [
    {
      type: "quote",
      contractId: s.contracts[0].id,
      contractType: "fixed",
      discount: 0,
    },
    { type: "sign", contractId: s.contracts[0].id },
  ] as Command[]) {
    const r = transition(s, c);
    expect(r.ok).toBe(true);
    s = r.state;
  }
  return s;
}
const batch = (
  s: State,
  rows: { i: number; next: Assignment[] }[],
): Command => ({
  type: "assignBatch",
  changes: rows.map(({ i, next }) => ({
    employeeId: s.employees[i].id,
    expected: structuredClone(s.employees[i].assignments),
    assignments: next,
  })),
});
describe("atomic assignment batch", () => {
  it("applies several employees, preserves an untouched slot, is deterministic and retry safe", () => {
    const s = fixture(),
      target = s.contracts[0].workId;
    s.employees[0].assignments = [
      { target, kind: "refactor" },
      { target, kind: "qa" },
    ];
    const before = structuredClone(s),
      c = batch(s, [
        {
          i: 0,
          next: [
            { target, kind: "develop" },
            { target, kind: "qa" },
          ],
        },
        { i: 1, next: [{ target, kind: "qa" }] },
      ]);
    const r = transition(s, c);
    expect(r.ok).toBe(true);
    expect(s).toEqual(before);
    expect(r.state.employees[0].assignments[1]).toEqual(
      before.employees[0].assignments[1],
    );
    expect(transition(before, c)).toEqual(r);
    expect(transition(r.state, c).state).toEqual(r.state);
    expect(r.state.cash).toBe(s.cash);
    expect(r.state.actions).toBe(s.actions);
    expect(r.state.rng).toEqual(s.rng);
  });
  it("rolls the entire batch back when a later row is invalid", () => {
    const s = fixture(),
      target = s.contracts[0].workId;
    const r = transition(
      s,
      batch(s, [
        { i: 0, next: [{ target, kind: "develop" }] },
        { i: 1, next: [{ target: "missing", kind: "qa" }] },
      ]),
    );
    expect(r.ok).toBe(false);
    expect(r.state).toBe(s);
    expect(s.employees[0].assignments).toEqual([]);
  });
  it("rejects a stale employee snapshot, but allows elapsed days with unchanged assignments", () => {
    const s = fixture(),
      target = s.contracts[0].workId,
      c = batch(s, [{ i: 0, next: [{ target, kind: "develop" }] }]);
    const ticked = transition(s, { type: "tick" }).state;
    expect(transition(ticked, c).ok).toBe(true);
    const concurrent = transition(s, {
      type: "assign",
      employeeId: s.employees[0].id,
      target,
      kind: "refactor",
    }).state;
    expect(transition(concurrent, c).ok).toBe(false);
    expect(transition(concurrent, c).state).toBe(concurrent);
  });
  it("rejects duplicate tasks, oversized lists, duplicate employees and unsigned work", () => {
    const s = fixture(),
      target = s.contracts[0].workId;
    for (const next of [
      [
        { target, kind: "qa" },
        { target, kind: "qa" },
      ],
      [
        { target, kind: "develop" },
        { target, kind: "qa" },
        { target, kind: "fix" },
      ],
    ] as Assignment[][])
      expect(transition(s, batch(s, [{ i: 0, next }])).ok).toBe(false);
    expect(
      transition(
        s,
        batch(s, [
          { i: 0, next: [] },
          { i: 0, next: [] },
        ]),
      ).ok,
    ).toBe(false);
    s.contracts[0].stage = "quoted";
    expect(
      transition(s, batch(s, [{ i: 0, next: [{ target, kind: "develop" }] }]))
        .ok,
    ).toBe(false);
  });
  it("removes a selected slot without dropping the other and rejects missing staff", () => {
    const s = fixture(),
      target = s.contracts[0].workId;
    s.employees[0].assignments = [
      { target, kind: "develop" },
      { target, kind: "qa" },
    ];
    expect(
      transition(s, batch(s, [{ i: 0, next: [{ target, kind: "qa" }] }])).state
        .employees[0].assignments,
    ).toEqual([{ target, kind: "qa" }]);
    const c = batch(s, [{ i: 0, next: [] }]);
    s.employees.shift();
    expect(transition(s, c).ok).toBe(false);
  });
});
