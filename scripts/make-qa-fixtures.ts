/** Reproducible renderer fixture built entirely through normal game commands. */
import { writeFileSync, mkdirSync } from "node:fs";
import { playScenario } from "../src/simulation/scenario";
import { transition } from "../src/simulation/engine";
import { encodeSave } from "../src/persistence/saves";
import { invariantErrors } from "../src/persistence/schema";
import type { Command } from "../src/simulation/types";
let s = playScenario("startup", "standard", 42, "quality", 180).state;
const send = (c: Command) => {
  const r = transition(s, c);
  if (!r.ok) throw new Error(JSON.stringify({ c, error: r.error }));
  s = r.state;
};
if (s.officeTier === 1) send({ type: "upgradeOffice" });
let guard = 0;
while (s.employees.length < 12 && s.status === "playing" && guard++ < 100) {
  if (!s.candidates.length || s.actions === 0) {
    send({ type: "tick", days: 7 });
    continue;
  }
  const needed = ["developer", "qa", "designer", "growth", "ops"].find(
    (role) => !s.employees.some((e) => e.role === role),
  );
  if (needed && !s.candidates.some((c) => c.role === needed)) {
    send({ type: "tick", days: 7 });
    continue;
  }
  const candidate =
    s.candidates.find((c) => c.role === needed) ?? s.candidates[0];
  send({ type: "hire", candidateId: candidate.id });
}
if (s.employees.length !== 12) throw Error("Did not reach 12 staff");
for (const e of s.employees)
  send({ type: "assign", employeeId: e.id, target: "market", kind: "growth" });
send({ type: "unassign", employeeId: s.employees[10].id });
send({ type: "tick", days: 7 });
const errors = invariantErrors(s);
if (errors.length) throw Error(errors.join("; "));
mkdirSync("evidence/fixtures", { recursive: true });
writeFileSync("evidence/fixtures/office-12.json", await encodeSave(s));
writeFileSync(
  "evidence/fixtures/README.md",
  `Renderer fixture: seed 42, public-command Startup bot to day 180, office upgrade and hires/assignments via normal commands. Day ${s.day}, ${s.employees.length} staff, cash $${s.cash / 100}. No artificial capital, no direct state mutation. One person left unassigned to exercise idle/walking transitions. Not a human playthrough.\n`,
);
console.log({
  day: s.day,
  staff: s.employees.length,
  roles: [...new Set(s.employees.map((e) => e.role))],
  cash: s.cash / 100,
});
