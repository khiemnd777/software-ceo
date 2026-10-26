import { advanceFixtureDays } from "../helpers/advance";
import { describe, it, expect } from "vitest";
import { createGame } from "../../src/simulation/create";
import { transition } from "../../src/simulation/engine";
import { balance, book } from "../../src/simulation/finance";
import { funnel, productMonth } from "../../src/gameplay/product";
import { campaignEvaluation } from "../../src/gameplay/progression";
import { copy } from "../../src/content/catalog";
import type { State, Command } from "../../src/simulation/types";
const newGame = (strategy: "product" | "startup" | "outsourcing") =>
  createGame({
    name: "Three-path test",
    strategy,
    difficulty: "standard",
    seed: 83,
  });
const run = (s: State, c: Command) => {
  if (c.type === "tick") return advanceFixtureDays(s, c.days ?? 1);
  const r = transition(s, c);
  expect(r.error, JSON.stringify(c)).toBeUndefined();
  expect(r.ok).toBe(true);
  return r.state;
};
describe("Product and Startup", () => {
  it("starts all three paths with their approved resources", () => {
    const p = newGame("product"),
      o = newGame("outsourcing"),
      v = newGame("startup");
    expect([p.cash, o.cash, v.cash]).toEqual([7000000, 4500000, 10000000]);
    expect(p.product.paid * p.product.price).toBe(276500);
    expect(o.contracts[0].price).toBe(3000000);
    expect(v.venture.evidence).toBe(0);
    expect(v.product.paid).toBe(0);
  });
  it("Product builds, tests, releases a feature and books subscriptions", () => {
    let s = newGame("product");
    s = run(s, { type: "startFeature", featureId: "stock-sync" });
    const id = s.work.find((w) => w.featureId === "stock-sync")!.id;
    s = run(s, {
      type: "assign",
      employeeId: s.employees[0].id,
      target: id,
      kind: "develop",
    });
    s = run(s, {
      type: "assign",
      employeeId: s.employees[1].id,
      target: id,
      kind: "qa",
    });
    for (let i = 0; i < 80; i++) {
      const w = s.work.find((w) => w.id === id)!;
      if (w.done >= w.actual) {
        s = run(s, {
          type: "assign",
          employeeId: s.employees[0].id,
          target: id,
          kind: "fix",
        });
        if (w.bugs.every((b) => !b.known) && w.qa >= w.actual * 0.12) {
          s = run(s, { type: "release", workId: id });
          break;
        }
      }
      s = run(s, { type: "tick" });
    }
    expect(s.product.features).toContain("stock-sync");
    expect(s.product.fit).toBe(58);
    expect(transition(s, { type: "release", workId: id }).ok).toBe(false);
    s = run(s, { type: "tick", days: 30 });
    expect(s.product.paid).toBeGreaterThan(35);
    expect(balance(s).revenue).toBeGreaterThan(0);
    expect(s.product.lastChurn).toBeGreaterThan(0);
  });
  it("marketing adds leads but does not change bad retention", () => {
    const s = newGame("product");
    s.product.reliability = 30;
    const before = funnel(s);
    s.product.marketing = 500000;
    const after = funnel(s);
    expect(after.leads).toBeGreaterThan(before.leads);
    expect(after.churn).toBe(before.churn);
    s.product.price = 15900;
    expect(funnel(s).conversion).toBeLessThan(after.conversion);
    expect(funnel(s).churn).toBeGreaterThan(after.churn);
  });
  it("freemium converts each user only once and bills paid users", () => {
    const s = newGame("startup");
    s.product.launched = true;
    s.product.free = 100;
    s.product.paid = 10;
    s.product.fit = 60;
    const f = funnel(s);
    const retained = Math.round(100 * 0.88),
      converted = Math.floor(retained * 0.051),
      activated = Math.floor(f.leads * 0.53),
      churned = Math.round(10 * f.churn);
    productMonth(s);
    expect(s.product.free).toBe(retained - converted + activated);
    expect(s.product.paid).toBe(10 - churned + converted);
    expect(s.product.free + s.product.paid).toBe(
      retained + activated + 10 - churned,
    );
    expect(balance(s).revenue).toBe(s.product.paid * s.product.price);
  });
  it("experiments produce sample-based evidence from assigned research", () => {
    let s = newGame("startup");
    s = run(s, { type: "experiment", experimentId: "interviews" });
    const w = s.work[0];
    s = run(s, {
      type: "assign",
      employeeId: s.employees[1].id,
      target: w.id,
      kind: "research",
    });
    s = run(s, { type: "tick", days: 21 });
    const r = s.venture.results[0];
    expect(r.sample).toBe(20);
    expect(r.responders).toBeLessThanOrEqual(20);
    expect(r.responders).toBeGreaterThan(0);
    expect(s.venture.evidence).toBe(r.evidence);
    expect(
      transition(s, { type: "experiment", experimentId: "interviews" }).ok,
    ).toBe(false);
  });
  it("accepts one funding round and calculates post-money dilution exactly", () => {
    let s = newGame("startup");
    s.venture.evidence = 60;
    s.product.free = 100;
    s = run(s, { type: "pitch" });
    const cash = s.cash;
    s = run(s, { type: "funding", termId: "seed" });
    expect(s.cash).toBe(cash + 15000000);
    expect(s.venture.founderEquity).toBe(75);
    expect(s.venture.investorEquity).toBe(25);
    expect(balance(s).revenue).toBe(0);
    expect(transition(s, { type: "funding", termId: "growth" }).ok).toBe(false);
    expect(s.promises[0].goal).toBe(100);
  });
  it("quarterly transition is explicit, limited, and keeps a secondary line", () => {
    let s = newGame("product");
    s = run(s, { type: "secondary", strategy: "outsourcing" });
    expect(
      transition(s, { type: "strategy", strategy: "outsourcing" }).ok,
    ).toBe(false);
    s = run(s, { type: "tick", days: 90 });
    s = run(s, { type: "strategy", strategy: "outsourcing" });
    expect(s.strategy).toBe("outsourcing");
    expect(s.secondary).toBe("product");
    expect(transition(s, { type: "strategy", strategy: "product" }).ok).toBe(
      false,
    );
  });
  it.each(["product", "startup", "outsourcing"] as const)(
    "reaches the 36-month review for %s and permits Sandbox",
    (path) => {
      let s = newGame(path);
      book(s, "capital", copy("Test reserve", "Test reserve"), {
        cash: 100000000,
        capital: 100000000,
      });
      for (let i = 0; i < 3; i++) s = run(s, { type: "tick", days: 360 });
      expect(s.clock.lastClosedDay).toBe(1080);
      expect(s.day).toBe(1081);
      expect(s.status).toBe("review");
      expect(typeof campaignEvaluation(s).success).toBe("boolean");
      s = run(s, { type: "continueSandbox" });
      s = run(s, { type: "tick" });
      expect(s.clock.lastClosedDay).toBe(1081);
      expect(s.mode).toBe("sandbox");
    },
  );
});
