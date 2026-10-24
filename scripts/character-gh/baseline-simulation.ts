import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createGame } from "../../src/simulation/create";
import { transition } from "../../src/simulation/engine";
import { encodeSave } from "../../src/persistence/saves";
import type { Strategy } from "../../src/simulation/types";

mkdirSync("tests/fixtures", { recursive: true });
if (
  existsSync("tests/fixtures/character-business-v2.json") ||
  existsSync("tests/fixtures/character-legacy-v2.json")
)
  throw new Error(
    "Pre-change evidence already exists; never regenerate it from changed code.",
  );
const cases = [];
for (const strategy of ["product", "outsourcing", "startup"] as Strategy[])
  for (const seed of [731, 2026]) {
    const options = {
      name: "Character preservation",
      strategy,
      seed,
      difficulty: "standard" as const,
    };
    const initial = createGame(options);
    const hired = transition(initial, {
      type: "hire",
      candidateId: initial.candidates[0].id,
    });
    if (!hired.ok) throw new Error("Baseline hire rejected");
    const after = transition(hired.state, { type: "tick", days: 35 });
    if (!after.ok) throw new Error("Baseline tick rejected");
    cases.push({ options, initial, after: after.state });
  }
writeFileSync(
  "tests/fixtures/character-business-v2.json",
  JSON.stringify(cases, null, 2) + "\n",
);
writeFileSync(
  "tests/fixtures/character-legacy-v2.json",
  await encodeSave(cases[0].initial),
);
console.log(
  "Captured six real pre-appearance states and command outcomes; one legacy save envelope.",
);
