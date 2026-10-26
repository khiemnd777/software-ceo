import { describe, it, expect } from "vitest";
import { createGame } from "../../src/simulation/create";
import { advanceFixtureDays } from "../helpers/advance";
import { transition } from "../../src/simulation/engine";
import { applyEffect } from "../../src/simulation/events";
import { funnel } from "../../src/gameplay/product";
import { invariantErrors, validateState } from "../../src/persistence/schema";
import { capacity } from "../../src/simulation/work";
import { EVENTS } from "../../src/content/events";
import type { State, Command } from "../../src/simulation/types";
const game = () =>
  createGame({
    name: "Support QA",
    strategy: "product",
    difficulty: "standard",
    seed: 71,
  });
const send = (s: State, c: Command) => {
  if (c.type === "tick") return advanceFixtureDays(s, c.days ?? 1);
  const t = transition(s, c);
  expect(t.ok, t.error?.en).toBe(true);
  return t.state;
};
describe("customer support, warnings and untrusted content", () => {
  it("customers create a queue; support consumes shared employee capacity", () => {
    let idle = game();
    let served = game();
    served = send(served, {
      type: "assign",
      employeeId: served.employees[1].id,
      target: "market",
      kind: "support",
    });
    for (let i = 0; i < 30; i++) {
      idle = advanceFixtureDays(idle, 1);
      served = advanceFixtureDays(served, 1);
    }
    expect(idle.product.support).toBeGreaterThan(4);
    expect(served.product.support).toBeLessThan(1);
    expect(funnel(idle).churn).toBeGreaterThan(funnel(served).churn);
    expect(invariantErrors(served)).toEqual([]);
  });
  it("a delayed unaffordable bill becomes a balanced liability, not a stuck clock", () => {
    const s = game();
    applyEffect(s, { cash: -10000000 }, "bill");
    expect(s.cash).toBe(0);
    expect(s.liabilities.some((l) => l.kind === "operations")).toBe(true);
    expect(invariantErrors(s)).toEqual([]);
    const next = send(s, { type: "tick" });
    expect(next.clock.lastClosedDay).toBe(1);
  });
  it("scheduled events have warnings, deterministic expiry and visible consequences", () => {
    let s = game();
    s.events.push({
      id: "fixture-event",
      templateId: "cloud-bill",
      announced: 0,
      due: 7,
      expires: 14,
      resolved: false,
    });
    s = send(s, { type: "tick", days: 14 });
    expect(s.events[0].resolved).toBe(true);
    expect(s.product.reliability).toBeLessThan(80);
    expect(s.history.some((h) => h.cause === "fixture-event")).toBe(true);
    expect(invariantErrors(s)).toEqual([]);
  });
  it("all 18 events have choices, useful bilingual copy, nonnegative explicit costs and valid delays", () => {
    expect(EVENTS).toHaveLength(18);
    expect(new Set(EVENTS.map((e) => e.id)).size).toBe(18);
    for (const event of EVENTS) {
      expect(event.choices.length).toBeGreaterThanOrEqual(2);
      expect(event.warning.vi.length).toBeGreaterThan(10);
      for (const choice of event.choices) {
        expect(Number.isSafeInteger(choice.cost)).toBe(true);
        expect(choice.cost).toBeGreaterThanOrEqual(0);
        expect(choice.description.en.trim().length).toBeGreaterThan(0);
        if (choice.delay) expect(choice.delay.days).toBeGreaterThan(0);
      }
    }
  });
  it("rejects structurally valid saves containing unknown runtime content", () => {
    const s = game();
    s.events.push({
      id: "bad",
      templateId: "not-an-event",
      announced: 0,
      due: 1,
      expires: 7,
      resolved: false,
    });
    expect(() => validateState(s)).toThrow(/Unknown event/);
  });
  it("deadline challenge preserves its shorter delivery window on signing", () => {
    let s = createGame({
      name: "Challenge",
      strategy: "outsourcing",
      difficulty: "standard",
      seed: 22,
      mode: "deadline",
    });
    s = send(s, { type: "sign", contractId: s.contracts[0].id });
    expect(s.contracts[0].deadline).toBe(s.day + 56);
  });
});
it("does not award endless QA effort or XP on exhausted, defect-free work", () => {
  let s = game();
  const w = s.work[0];
  w.qa = w.actual * 0.25;
  w.bugs = [];
  s = send(s, {
    type: "assign",
    employeeId: s.employees[1].id,
    target: w.id,
    kind: "qa",
  });
  const xp = s.employees[1].xp,
    effort = s.work[0].effort;
  s = send(s, { type: "tick", days: 7 });
  expect(s.employees[1].xp).toBe(xp);
  expect(s.work[0].effort).toBe(effort);
});
it("changing quotes repeatedly cannot increase price or trust beyond the same final quote", () => {
  let s = createGame({
    name: "Quote",
    strategy: "outsourcing",
    difficulty: "standard",
    seed: 3,
  });
  const c = s.contracts[0];
  for (let i = 0; i < 50; i++) {
    s = send(s, {
      type: "quote",
      contractId: c.id,
      contractType: "fixed",
      discount: 0.15,
    });
    s = send(s, {
      type: "quote",
      contractId: c.id,
      contractType: "fixed",
      discount: 0,
    });
  }
  expect(s.contracts[0].price).toBe(c.price);
  expect(s.contracts[0].trust).toBe(c.trust);
});

it("market segments change price sensitivity and quality expectations", () => {
  const s = game();
  s.product.price = 19900;
  s.product.fit = 65;
  s.product.reliability = 80;
  s.product.support = 0;
  s.product.segment = "creative";
  const creative = funnel(s);
  s.product.segment = "education";
  const education = funnel(s);
  expect(education.conversion).toBeGreaterThan(creative.conversion);
  expect(education.churn).toBeLessThan(creative.churn);
  s.product.price = 7900;
  s.product.segment = "creative";
  const baseCreative = funnel(s);
  s.product.segment = "education";
  expect(funnel(s).conversion).toBeLessThan(baseCreative.conversion);
});
it("client-friendly trait increases research only, with the documented 8% bonus", () => {
  const s = game(),
    e = s.employees[0];
  e.traits = [];
  const research = { target: "market", kind: "research" as const };
  const develop = { target: s.work[0].id, kind: "develop" as const };
  const before = capacity(s, e, research),
    devBefore = capacity(s, e, develop);
  e.traits = ["friendly"];
  expect(capacity(s, e, research)).toBeCloseTo(before * 1.08, 10);
  expect(capacity(s, e, develop)).toBe(devBefore);
});
