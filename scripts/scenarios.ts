import fs from "node:fs";
import { playScenario, scenarioSummary } from "../src/simulation/scenario";
const results = [];
for (const strategy of ["outsourcing", "product", "startup"] as const) {
  const t = performance.now();
  const r = playScenario(strategy, "standard", 42);
  const summary = scenarioSummary(r);
  results.push({ ...summary, runtimeMs: Math.round(performance.now() - t) });
  console.log(JSON.stringify(results.at(-1)));
}
fs.writeFileSync(
  "evidence/W3-scenarios.json",
  JSON.stringify(results, null, 2),
);
