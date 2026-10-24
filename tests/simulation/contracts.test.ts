import { describe, it, expect } from "vitest";
import { createGame } from "../../src/simulation/create";
import { transition } from "../../src/simulation/engine";
import { balance } from "../../src/simulation/finance";
import type { Command, State, Policy } from "../../src/simulation/types";
function command(s: State, c: Command) {
  const r = transition(s, c);
  expect(r.error, JSON.stringify(c)).toBeUndefined();
  return r.state;
}
export function playContract(
  policy: Policy = "balanced",
  type: "fixed" | "tm" = "fixed",
  seed = 42,
) {
  let s = createGame({
    name: "Delivery test",
    strategy: "outsourcing",
    difficulty: "standard",
    seed,
  });
  const id = s.contracts[0].id;
  if (policy !== "balanced") s = command(s, { type: "policy", policy });
  s = command(s, {
    type: "quote",
    contractId: id,
    contractType: type,
    discount: 0,
  });
  s = command(s, { type: "sign", contractId: id });
  for (let day = 0; day < 130; day++) {
    const w = s.work[0],
      c = s.contracts[0];
    s = command(s, {
      type: "assign",
      employeeId: s.employees[0].id,
      target: w.id,
      kind:
        w.done >= w.actual && w.bugs.some((b) => b.known) ? "fix" : "develop",
    });
    s = command(s, {
      type: "assign",
      employeeId: s.employees[1].id,
      target: w.id,
      kind: "qa",
    });
    if (!c.midAccepted && w.done >= w.actual * 0.5) {
      const r = transition(s, {
        type: "accept",
        contractId: id,
        milestone: "mid",
      });
      if (r.ok) s = r.state;
    }
    if (
      !c.finalAccepted &&
      w.done >= w.actual &&
      !w.bugs.some((b) => b.known)
    ) {
      const r = transition(s, {
        type: "accept",
        contractId: id,
        milestone: "final",
      });
      if (r.ok) s = r.state;
    }
    s = command(s, { type: "tick" });
    if (s.contracts[0].finalAccepted && s.invoices.every((i) => i.paid)) break;
  }
  return s;
}
describe("outsourcing lifecycle", () => {
  it("keeps a deposit separate from earned revenue", () => {
    let s = createGame({
      name: "Deposit",
      strategy: "outsourcing",
      difficulty: "standard",
      seed: 42,
    });
    s = command(s, { type: "sign", contractId: s.contracts[0].id });
    expect(s.cash).toBe(5100000);
    expect(balance(s).revenue).toBe(0);
    expect(balance(s).deferred).toBe(600000);
    expect(
      transition(s, { type: "sign", contractId: s.contracts[0].id }).ok,
    ).toBe(false);
  });
  it.each(["fast", "quality"] as Policy[])(
    "finishes the entire fixed-price lifecycle using %s",
    (policy) => {
      const s = playContract(policy);
      expect(s.contracts[0].finalAccepted).toBe(true);
      expect(s.invoices).toHaveLength(2);
      expect(s.invoices.every((i) => i.paid)).toBe(true);
      const b = balance(s);
      expect(b.revenue).toBe(3000000);
      expect(b.receivable).toBe(0);
      expect(b.deferred).toBe(0);
      expect(s.cash).toBe(4500000 + 3000000 - b.expense);
      expect(s.status).toBe("playing");
    },
  );
  it("produces different observable outcomes for fast versus quality policies", () => {
    const a = playContract("fast"),
      b = playContract("quality");
    expect(a.work[0].debt).toBeGreaterThan(b.work[0].debt);
    expect(a.contracts[0].completedDay).not.toBe(b.contracts[0].completedDay);
  });
  it("bills T&M effort weekly without duplicating the final partial week", () => {
    const s = playContract("balanced", "tm");
    expect(s.contracts[0].finalAccepted).toBe(true);
    const c = s.contracts[0];
    expect(c.revenue).toBe(
      Math.min(c.price, Math.round(s.work[0].effort * c.rate)),
    );
    expect(balance(s).receivable).toBe(0);
    expect(c.deposit).toBe(0);
    expect(s.invoices.length).toBeGreaterThan(2);
  });
  it("never turns acceptance directly into cleared cash", () => {
    let s = createGame({
      name: "Invoice",
      strategy: "outsourcing",
      difficulty: "standard",
      seed: 13,
    });
    s = command(s, { type: "sign", contractId: s.contracts[0].id });
    s.work[0].done = s.work[0].actual * 0.5;
    s.work[0].qa = 10;
    const cash = s.cash;
    s = command(s, {
      type: "accept",
      contractId: s.contracts[0].id,
      milestone: "mid",
    });
    expect(s.cash).toBe(cash);
    expect(balance(s).receivable).toBe(1200000);
    expect(balance(s).revenue).toBe(1800000);
    const after = transition(s, {
      type: "accept",
      contractId: s.contracts[0].id,
      milestone: "mid",
    });
    expect(after.ok).toBe(false);
    expect(after.state).toBe(s);
  });
  it("requires developer work to fix bugs discovered by QA", () => {
    let s = createGame({
      name: "QA",
      strategy: "outsourcing",
      difficulty: "standard",
      seed: 42,
    });
    s = command(s, { type: "sign", contractId: s.contracts[0].id });
    s.work[0].bugs = [
      {
        id: "known",
        severity: 3,
        known: true,
        remaining: 3,
        created: 0,
        revealed: 0,
      },
    ];
    s = command(s, {
      type: "assign",
      employeeId: s.employees[1].id,
      target: s.work[0].id,
      kind: "qa",
    });
    s = command(s, { type: "tick", days: 7 });
    expect(s.work[0].bugs[0].remaining).toBe(3);
    s = command(s, {
      type: "assign",
      employeeId: s.employees[0].id,
      target: s.work[0].id,
      kind: "fix",
    });
    s = command(s, { type: "tick", days: 7 });
    expect(s.work[0].bugs).toHaveLength(0);
  });
  it("a bridge loan can settle payroll inside the grace period", () => {
    let s = createGame({
      name: "Recovery",
      strategy: "outsourcing",
      difficulty: "standard",
      seed: 42,
    });
    s = command(s, { type: "tick", days: 180 });
    expect(s.liabilities.some((l) => l.kind === "payroll")).toBe(true);
    s = command(s, { type: "loan", amount: 2000000 });
    expect(s.liabilities.some((l) => l.kind === "payroll")).toBe(false);
    s = command(s, { type: "tick", days: 14 });
    expect(s.status).toBe("playing");
  });
});
