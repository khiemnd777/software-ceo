import { writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { playScenario, scenarioSummary } from "../src/simulation/scenario";
import { invariantErrors } from "../src/persistence/schema";
import { BALANCE } from "../src/content/catalog";
import { CONCEPTS } from "../src/content/products";

const sourceFiles = ["src/simulation", "src/gameplay", "src/content"].flatMap(
  (dir) =>
    readdirSync(dir)
      .filter((x) => x.endsWith(".ts"))
      .sort()
      .map((x) => `${dir}/${x}`),
);
const sourceDigest = createHash("sha256")
  .update(sourceFiles.map((f) => f + "\n" + readFileSync(f, "utf8")).join("\n"))
  .digest("hex");
const start = performance.now();
const runs: (ReturnType<typeof scenarioSummary> & {
  concept: string;
  segment: string;
  errors: string[];
})[] = [];
for (const concept of CONCEPTS.filter((c) => c.id !== "retail"))
  for (const strategy of ["product", "startup"] as const)
    for (const difficulty of ["friendly", "standard", "tough"] as const) {
      for (let seed = 1; seed <= 100; seed++) {
        const policy = (["quality", "balanced", "fast"] as const)[
          (seed - 1) % 3
        ];
        const r = playScenario(
          strategy,
          difficulty,
          seed,
          policy,
          1080,
          "career",
          { concept: concept.id, segment: concept.segment },
        );
        const errors = [...r.errors, ...invariantErrors(r.state)];
        if (
          r.state.product.concept !== concept.id ||
          r.state.product.segment !== concept.segment
        )
          errors.push("Market mismatch");
        const row = {
          concept: concept.id,
          segment: concept.segment,
          ...scenarioSummary(r),
          errors,
        };
        runs.push(row);
        if (errors.length || r.rejected) {
          writeFileSync(
            "evidence/balance-markets-failure.json",
            JSON.stringify({ row, state: r.state }, null, 2),
          );
          throw Error(
            `${concept.id}/${strategy}/${difficulty}/${seed}: ${errors.join(";")} rejected=${r.rejected}`,
          );
        }
      }
      console.log(
        `${runs.length}/1200: ${concept.id}/${strategy}/${difficulty}`,
      );
    }
const groups = CONCEPTS.filter((c) => c.id !== "retail").flatMap((c) =>
  ["product", "startup"].flatMap((strategy) =>
    ["friendly", "standard", "tough"].map((difficulty) => {
      const a = runs.filter(
        (r) =>
          r.concept === c.id &&
          r.strategy === strategy &&
          r.difficulty === difficulty,
      );
      const cash = a.map((r) => r.cash).sort((a, b) => a - b);
      return {
        concept: c.id,
        segment: c.segment,
        strategy,
        difficulty,
        runs: a.length,
        wins: a.filter((r) => r.victory && r.day === 1080).length,
        survivors: a.filter((r) => r.status !== "insolvent").length,
        medianCash: cash[Math.floor((cash.length - 1) * 0.5)],
        p10Cash: cash[Math.floor((cash.length - 1) * 0.1)],
        p90Cash: cash[Math.floor((cash.length - 1) * 0.9)],
        meanStaff: a.reduce((n, r) => n + r.staff, 0) / a.length,
      };
    }),
  ),
);
writeFileSync(
  "evidence/local-balance-markets.json",
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      balanceVersion: BALANCE.version,
      sourceDigest,
      sourceFiles,
      elapsedMs: performance.now() - start,
      method:
        "1200 public-command bots: creator/Creative and team/Education × Product/Startup × 3 difficulties × seeds 1–100. Same informed bot as historic Retail run, policy rotates by seed. Outsourcing contracts are catalog-driven and not selected by Product concept; no duplicated concept-only Outsourcing run. Not a human balance assessment.",
      groups,
      runs,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify(groups, null, 2));
