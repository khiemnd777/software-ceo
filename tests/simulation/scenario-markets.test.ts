import { it, expect } from "vitest";
import { playScenario } from "../../src/simulation/scenario";
import { invariantErrors } from "../../src/persistence/schema";

it("explicit Retail preserves the existing deterministic bot baseline", () => {
  expect(
    playScenario("product", "standard", 42, "balanced", 90, "career", {
      concept: "retail",
      segment: "retail",
    }),
  ).toEqual(playScenario("product", "standard", 42, "balanced", 90));
});
it.each([
  ["creator", "creative"],
  ["team", "education"],
] as const)(
  "runs %s with its own features and segment through public commands",
  (concept, segment) => {
    const r = playScenario(
      "product",
      "standard",
      42,
      "balanced",
      360,
      "career",
      { concept, segment },
    );
    expect(r.state.product.concept).toBe(concept);
    expect(r.state.product.segment).toBe(segment);
    expect(r.state.product.features.length).toBeGreaterThan(0);
    expect(r.state.clock.lastClosedDay).toBe(360);
    expect(r.rejected).toBe(0);
    expect([...r.errors, ...invariantErrors(r.state)]).toEqual([]);
  },
);
