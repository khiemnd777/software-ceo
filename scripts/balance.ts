import { writeFileSync, readFileSync, readdirSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { performance } from "node:perf_hooks";
import { playScenario, scenarioSummary } from "../src/simulation/scenario";
import { createGame } from "../src/simulation/create";
import { transition } from "../src/simulation/engine";
import { invariantErrors } from "../src/persistence/schema";
import { BALANCE } from "../src/content/catalog";
import type { Strategy, Difficulty, Policy } from "../src/simulation/types";
mkdirSync("evidence", { recursive: true });
const sourceFiles = ["src/simulation", "src/gameplay", "src/content"].flatMap(
  (dir) =>
    readdirSync(dir)
      .filter((x) => x.endsWith(".ts"))
      .sort()
      .map((x) => dir + "/" + x),
);
const sourceDigest = createHash("sha256")
  .update(sourceFiles.map((f) => f + "\n" + readFileSync(f, "utf8")).join("\n"))
  .digest("hex");
const strategies: Strategy[] = ["outsourcing", "product", "startup"],
  difficulties: Difficulty[] = ["friendly", "standard", "tough"],
  policies: Policy[] = ["quality", "balanced", "fast"];
const runs: ReturnType<typeof scenarioSummary>[] = [];
const start = performance.now();
for (const strategy of strategies)
  for (const difficulty of difficulties) {
    for (let seed = 1; seed <= 100; seed++) {
      const r = playScenario(
        strategy,
        difficulty,
        seed,
        policies[(seed - 1) % 3],
      );
      r.errors.push(...invariantErrors(r.state));
      runs.push(scenarioSummary(r));
      if (r.errors.length) {
        writeFileSync(
          "evidence/balance-failure.json",
          JSON.stringify(
            { summary: scenarioSummary(r), state: r.state },
            null,
            2,
          ),
        );
        throw new Error(
          `Invariant failed in ${strategy}/${difficulty}/${seed}: ${r.errors.join("; ")}`,
        );
      }
    }
    console.log(
      `${runs.length}/900: ${strategy}/${difficulty}, ${(performance.now() - start).toFixed(0)} ms`,
    );
  }
const quantile = (values: number[], q: number) =>
  [...values].sort((a, b) => a - b)[Math.floor((values.length - 1) * q)];
const summaries = [];
for (const strategy of strategies)
  for (const difficulty of difficulties)
    for (const policy of ["all", ...policies]) {
      const a = runs.filter(
        (r) =>
          r.strategy === strategy &&
          r.difficulty === difficulty &&
          (policy === "all" || r.policy === policy),
      );
      const avg = (
        key:
          | "cash"
          | "debt"
          | "defects"
          | "churn"
          | "margin"
          | "morale"
          | "crises"
          | "incidents"
          | "events"
          | "staff",
      ) => a.reduce((n, r) => n + r[key], 0) / a.length;
      summaries.push({
        strategy,
        difficulty,
        policy,
        runs: a.length,
        victories: a.filter((r) => r.victory && r.day === 1080).length,
        survivors: a.filter((r) => r.status !== "insolvent").length,
        medianCash: quantile(
          a.map((r) => r.cash),
          0.5,
        ),
        p10Cash: quantile(
          a.map((r) => r.cash),
          0.1,
        ),
        p90Cash: quantile(
          a.map((r) => r.cash),
          0.9,
        ),
        meanCash: avg("cash"),
        meanDebt: avg("debt"),
        meanDefects: avg("defects"),
        meanChurn: avg("churn"),
        meanMargin: avg("margin"),
        meanMorale: avg("morale"),
        meanCrises: avg("crises"),
        meanIncidents: avg("incidents"),
        meanEvents: avg("events"),
        meanStaff: avg("staff"),
        rejectedCommands: a.reduce((n, r) => n + r.rejected, 0),
      });
    }
const passive = [];
for (const strategy of strategies) {
  let s = createGame({
    name: "Passive baseline",
    strategy,
    difficulty: "standard",
    seed: 42,
  });
  while (s.day < 1080 && s.status === "playing")
    s = transition(s, { type: "tick", days: Math.min(30, 1080 - s.day) }).state;
  passive.push(
    scenarioSummary({
      state: s,
      commands: 0,
      rejected: 0,
      errors: invariantErrors(s),
    }),
  );
}
const challenges = (["rescue", "deadline", "fit"] as const).map((mode) => {
  const r = playScenario(
    mode === "rescue"
      ? "startup"
      : mode === "deadline"
        ? "outsourcing"
        : "product",
    "standard",
    42,
    "balanced",
    mode === "fit" ? 360 : 180,
    mode,
  );
  return { mode, ...scenarioSummary(r), invariants: invariantErrors(r.state) };
});
const report = {
  createdAt: new Date().toISOString(),
  balanceVersion: BALANCE.version,
  sourceDigest,
  sourceFiles,
  method:
    "900 public-command-only bots: 3 strategies × 3 difficulties × seeds 1–100. Seed modulo 3 chooses quality/balanced/fast. Bots assign, inspect, fix, market, hire support, honor QA gates, choose contextual events and optionally borrow. Fast outsourcing quotes capped T&M; other outsourcing bots quote fixed price. Thus policy groups are complete operating strategies, not a controlled policy-only experiment. No hidden cash or state edits. Passive baselines and 3 challenge runs are additional.",
  elapsedMs: Math.round(performance.now() - start),
  runs,
  summaries,
  passive,
  challenges,
};
writeFileSync("evidence/balance-900.json", JSON.stringify(report, null, 2));
const keys = Object.keys(runs[0]);
writeFileSync(
  "evidence/balance-900.csv",
  [
    keys.join(","),
    ...runs.map((r) =>
      keys.map((k) => JSON.stringify(r[k as keyof typeof r] ?? "")).join(","),
    ),
  ].join("\n"),
);
console.log(
  JSON.stringify(
    {
      completed: runs.length,
      elapsedSeconds: report.elapsedMs / 1000,
      invariantFailures: runs.filter((r) => r.errors.length).length,
      rejected: runs.reduce((n, r) => n + r.rejected, 0),
      groups: summaries.filter((r) => r.policy === "all"),
      passive,
      challenges,
    },
    null,
    2,
  ),
);
