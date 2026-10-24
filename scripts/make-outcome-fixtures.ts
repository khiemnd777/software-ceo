import { writeFileSync } from "node:fs";
import { playScenario } from "../src/simulation/scenario";
import { createGame } from "../src/simulation/create";
import { transition } from "../src/simulation/engine";
import { encodeSave } from "../src/persistence/saves";
for (const strategy of ["outsourcing", "product", "startup"] as const) {
  const r = playScenario(strategy, "standard", 42, "balanced");
  if (!r.state.campaignWon || r.errors.length)
    throw Error("Outcome fixture did not win: " + strategy);
  writeFileSync(
    `evidence/fixtures/career-${strategy}-complete.json`,
    await encodeSave(r.state),
  );
}
let s = createGame({
  name: "Payroll crisis review",
  strategy: "outsourcing",
  difficulty: "standard",
  seed: 42,
});
while (s.status === "playing")
  s = transition(s, { type: "tick", days: 30 }).state;
writeFileSync("evidence/fixtures/insolvent.json", await encodeSave(s));
console.log(
  "Public-command outcome fixtures created; three 1080-day wins and unpaid-payroll insolvency at day",
  s.day,
);
