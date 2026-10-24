import { writeFileSync, readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { createGame } from "../src/simulation/create";
import { transition } from "../src/simulation/engine";
import { invariantErrors } from "../src/persistence/schema";
import { quality } from "../src/simulation/work";
import { EVENTS } from "../src/content/events";
import { BALANCE } from "../src/content/catalog";
import type {
  Command,
  State,
  Policy,
  Difficulty,
} from "../src/simulation/types";

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
type Delivery = {
  day: number;
  deadline: number;
  hiddenDefects: number;
  labor: number;
  effort: number;
  qa: number;
  cash: number;
};
const rows: {
  seed: number;
  difficulty: Difficulty;
  policy: Policy;
  initial: {
    employees: State["employees"];
    contract: State["contracts"][number];
    work: State["work"][number];
  };
  delivery: Delivery | null;
  day: number;
  status: State["status"];
  cash: number;
  expense: number;
  incidents: number;
  cashCollected: number;
  trace: { day: number; command: Command }[];
}[] = [];
for (const difficulty of ["friendly", "standard", "tough"] as const)
  for (let seed = 1; seed <= 30; seed++)
    for (const policy of ["quality", "balanced", "fast"] as const) {
      let s = createGame({
        name: "Matched policy",
        strategy: "outsourcing",
        difficulty,
        seed,
        mode: "sandbox",
      });
      const contractId = s.contracts[0].id;
      const trace: { day: number; command: Command }[] = [];
      const send = (command: Command) => {
        const r = transition(s, command);
        if (!r.ok)
          throw Error(
            JSON.stringify({
              seed,
              difficulty,
              policy,
              day: s.day,
              command,
              error: r.error,
            }),
          );
        trace.push({ day: s.day, command });
        s = r.state;
      };
      // Use the same quote, team, scope response, daily cadence and QA rules for all policies.
      send({ type: "quote", contractId, contractType: "fixed", discount: 0 });
      send({ type: "sign", contractId });
      if (policy !== "balanced") send({ type: "policy", policy });
      const initial = {
        employees: s.employees,
        contract: s.contracts[0],
        work: s.work[0],
      };
      let delivery: null | {
        day: number;
        deadline: number;
        hiddenDefects: number;
        labor: number;
        effort: number;
        qa: number;
        cash: number;
      } = null;
      while (s.day < 180 && s.status === "playing") {
        for (const event of s.events.filter(
          (e) => !e.resolved && e.due <= s.day && e.expires > s.day,
        )) {
          const template = EVENTS.find((t) => t.id === event.templateId)!;
          const choice = template.choices.find(
            (c) =>
              c.cost === 0 &&
              !c.immediate.scope &&
              !c.immediate.promise &&
              !c.delay,
          );
          if (choice && s.actions >= choice.actions)
            send({ type: "decide", eventId: event.id, choiceId: choice.id });
        }
        let c = s.contracts.find((c) => c.id === contractId)!;
        if (c.changePending && s.actions)
          send({ type: "change", contractId, choice: "decline" });
        c = s.contracts.find((c) => c.id === contractId)!;
        let w = s.work.find((w) => w.id === c.workId)!;
        const qaOK = () =>
          w.qa >= Math.max(1, w.done * 0.12) &&
          quality(w) >= 70 &&
          !w.bugs.some((b) => b.known && b.severity === 3);
        if (
          c.stage === "signed" &&
          !c.midAccepted &&
          w.done >= w.actual * 0.5 &&
          qaOK()
        )
          send({ type: "accept", contractId, milestone: "mid" });
        c = s.contracts.find((c) => c.id === contractId)!;
        w = s.work.find((w) => w.id === c.workId)!;
        if (
          c.stage === "signed" &&
          c.midAccepted &&
          w.done >= w.actual &&
          !w.bugs.some((b) => b.known) &&
          qaOK()
        ) {
          send({ type: "accept", contractId, milestone: "final" });
          delivery = {
            day: s.day,
            deadline: c.deadline,
            hiddenDefects: w.bugs.filter((b) => !b.known).length,
            labor: w.labor / 100,
            effort: w.effort,
            qa: w.qa,
            cash: s.cash / 100,
          };
          for (const e of s.employees)
            send({ type: "unassign", employeeId: e.id });
        } else if (c.stage === "signed") {
          for (const [i, e] of s.employees.entries()) {
            const kind =
              i === 1
                ? "qa"
                : (w.done >= w.actual ||
                      w.bugs.some((b) => b.known && b.severity === 3)) &&
                    w.bugs.some((b) => b.known)
                  ? "fix"
                  : "develop";
            if (
              e.assignments.length !== 1 ||
              e.assignments[0].kind !== kind ||
              e.assignments[0].target !== w.id
            )
              send({ type: "assign", employeeId: e.id, target: w.id, kind });
          }
        }
        send({ type: "tick", days: 1 });
        const errors = invariantErrors(s);
        if (errors.length)
          throw Error(`${seed}/${difficulty}/${policy}: ${errors.join(";")}`);
      }
      rows.push({
        seed,
        difficulty,
        policy,
        initial,
        delivery,
        day: s.day,
        status: s.status,
        cash: s.cash / 100,
        expense: s.ledger.reduce((n, e) => n + e.expense, 0) / 100,
        incidents: s.metrics.incidents,
        cashCollected:
          s.invoices.filter((i) => i.paid).reduce((n, i) => n + i.amount, 0) /
          100,
        trace,
      });
    }
const pairs = rows
  .filter((r) => r.policy === "balanced")
  .map((base) => {
    const delta = (policy: "quality" | "fast") => {
      const r = rows.find(
        (r) =>
          r.seed === base.seed &&
          r.difficulty === base.difficulty &&
          r.policy === policy,
      )!;
      if (JSON.stringify(r.initial) !== JSON.stringify(base.initial))
        throw Error("Unmatched initial work/team/quote");
      return {
        deliveryDays:
          r.delivery && base.delivery
            ? r.delivery.day - base.delivery.day
            : null,
        labor:
          r.delivery && base.delivery
            ? r.delivery.labor - base.delivery.labor
            : null,
        hiddenDefects:
          r.delivery && base.delivery
            ? r.delivery.hiddenDefects - base.delivery.hiddenDefects
            : null,
        cashDay180: r.cash - base.cash,
      };
    };
    return {
      seed: base.seed,
      difficulty: base.difficulty,
      qualityMinusBalanced: delta("quality"),
      fastMinusBalanced: delta("fast"),
    };
  });
const groups = ["friendly", "standard", "tough"].flatMap((difficulty) =>
  ["quality", "balanced", "fast"].map((policy) => {
    const a = rows.filter(
      (r) => r.difficulty === difficulty && r.policy === policy,
    );
    const delivered = a.filter((r) => r.delivery);
    return {
      difficulty,
      policy,
      runs: a.length,
      delivered: delivered.length,
      onTime: delivered.filter((r) => r.delivery!.day <= r.delivery!.deadline)
        .length,
      meanDeliveryDay:
        delivered.reduce((n, r) => n + r.delivery!.day, 0) / delivered.length,
      meanLabor:
        delivered.reduce((n, r) => n + r.delivery!.labor, 0) / delivered.length,
      meanHiddenDefects:
        delivered.reduce((n, r) => n + r.delivery!.hiddenDefects, 0) /
        delivered.length,
      meanCashDay180: a.reduce((n, r) => n + r.cash, 0) / a.length,
    };
  }),
);
writeFileSync(
  "evidence/local-policy-matched.json",
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      balanceVersion: BALANCE.version,
      sourceDigest,
      sourceFiles,
      method:
        "270 runs: 30 matched seeds × 3 difficulties × 3 policies. Same initial work/team/quote verified per pair; one Fixed Price contract, zero discount, no hires/raises/overtime/marketing/loans, decline scope, daily cadence, identical QA/fix/acceptance and event-choice rules. Unassign on delivery; measure labor at delivery and cash at common day 180. Policy can alter later RNG draws/events; this measures total policy under a fixed operating rule, not a direct multiplier isolated from events. Bot sees actual scope. No human difficulty or full-campaign claim.",
      groups,
      pairs,
      rows,
    },
    null,
    2,
  ),
);
console.log(JSON.stringify(groups, null, 2));
