/** Deterministic policy bot. Uses the same public commands as a player; no state edits. */
import type {
  State,
  Command,
  Strategy,
  Difficulty,
  Policy,
  TaskKind,
  NewGameOptions,
} from "./types";
import { createGame } from "./create";
import { transition } from "./engine";
import { FEATURES, EXPERIMENTS, TERMS } from "../content/products";
import { EVENTS } from "../content/events";
import { campaignEvaluation } from "../gameplay/progression";
import { monthlyCosts, runway, balance } from "./finance";
import { quality } from "./work";
export interface ScenarioResult {
  state: State;
  commands: number;
  rejected: number;
  errors: string[];
}
export function playScenario(
  strategy: Strategy,
  difficulty: Difficulty,
  seed: number,
  policy: Policy = "balanced",
  days = 1080,
  mode: State["mode"] = "career",
  market: Pick<NewGameOptions, "concept" | "segment"> = {},
): ScenarioResult {
  let s = createGame({
    name: `Bot ${strategy} ${seed}`,
    strategy,
    difficulty,
    seed,
    mode,
    ...market,
  });
  let commands = 0,
    rejected = 0;
  const errors: string[] = [];
  const send = (c: Command) => {
    const r = transition(s, c);
    commands++;
    if (r.ok) s = r.state;
    else rejected++;
    return r.ok;
  };
  const assign = (eid: string, target: string, kind: TaskKind) => {
    const e = s.employees.find((e) => e.id === eid);
    if (
      e?.assignments.length === 1 &&
      e.assignments[0].target === target &&
      e.assignments[0].kind === kind
    )
      return;
    send({ type: "assign", employeeId: eid, target, kind });
  };
  if (policy !== "balanced") send({ type: "policy", policy });
  while (s.day < days && s.status === "playing") {
    for (const event of s.events.filter(
      (e) => !e.resolved && e.due <= s.day && e.expires > s.day,
    )) {
      const t = EVENTS.find((t) => t.id === event.templateId)!;
      const choice =
        t.choices.find(
          (c) =>
            c.cost === 0 &&
            !c.immediate.scope &&
            !c.immediate.promise &&
            !c.delay,
        ) ||
        t.choices.find(
          (c) => c.cost <= s.cash * 0.03 && !c.immediate.promise,
        ) ||
        t.choices.at(-1)!;
      if (s.actions >= choice.actions && s.cash >= choice.cost)
        send({ type: "decide", eventId: event.id, choiceId: choice.id });
    }
    if (
      s.liabilities.some((l) => l.kind === "payroll") &&
      s.actions > 0 &&
      !s.liabilities.some((l) => l.kind === "loan")
    )
      send({ type: "loan", amount: 2000000 });
    if (s.strategy === "outsourcing") {
      let c = s.contracts.find((c) => c.stage === "signed");
      if (!c && s.actions) {
        let lead = s.contracts.find((c) =>
          ["lead", "qualified", "quoted"].includes(c.stage),
        );
        if (!lead) {
          send({ type: "findLead" });
          lead = s.contracts.find((c) =>
            ["lead", "qualified", "quoted"].includes(c.stage),
          );
        }
        if (lead) {
          if (lead.stage === "lead")
            send({ type: "qualify", contractId: lead.id });
          if (lead.stage !== "quoted")
            send({
              type: "quote",
              contractId: lead.id,
              contractType: policy === "fast" ? "tm" : "fixed",
              discount: 0,
            });
          if (s.actions) send({ type: "sign", contractId: lead.id });
        }
        c = s.contracts.find((c) => c.stage === "signed");
      }
      if (c) {
        let w = s.work.find((w) => w.id === c!.workId)!;
        if (c.changePending && s.actions)
          send({
            type: "change",
            contractId: c.id,
            choice: policy === "quality" ? "decline" : "extend",
          });
        if (
          !c.midAccepted &&
          w.done >= w.actual * 0.5 &&
          w.qa >= w.done * 0.12 &&
          quality(w) >= 70 &&
          !w.bugs.some((b) => b.known && b.severity === 3)
        )
          send({ type: "accept", contractId: c.id, milestone: "mid" });
        c = s.contracts.find((x) => x.id === c!.id)!;
        w = s.work.find((w) => w.id === c!.workId)!;
        if (
          !c.finalAccepted &&
          w.done >= w.actual &&
          !w.bugs.some((b) => b.known) &&
          w.qa >= w.actual * 0.12
        )
          send({ type: "accept", contractId: c.id, milestone: "final" });
        const dev = s.employees[0],
          qa = s.employees[1];
        if (dev)
          assign(
            dev.id,
            w.id,
            (w.done >= w.actual ||
              w.bugs.some((b) => b.known && b.severity === 3)) &&
              w.bugs.some((b) => b.known)
              ? "fix"
              : "develop",
          );
        if (qa) assign(qa.id, w.id, "qa");
      }
    } else {
      if (s.strategy === "startup") {
        const pending = s.work.find(
          (w) => w.kind === "experiment" && w.status !== "released",
        );
        const canMore = s.venture.evidence < 60 || s.venture.results.length < 4;
        if (!pending && canMore && s.actions && s.cash > 500000) {
          const e = EXPERIMENTS.find(
            (e) =>
              !s.work.some((w) => w.experimentId === e.id) &&
              (e.id !== "pilot" || s.venture.evidence >= 15) &&
              (!["offer", "referral"].includes(e.id) || s.product.launched),
          );
          if (e) send({ type: "experiment", experimentId: e.id });
        }
        if (
          !s.product.launched &&
          s.venture.evidence >= 15 &&
          !s.work.some((w) => w.kind === "mvp") &&
          s.actions
        )
          send({ type: "buildMvp" });
        if (
          s.venture.rounds === 0 &&
          s.actions &&
          s.venture.evidence >= 35 &&
          (s.product.free + s.product.paid >= 80 || s.product.paid >= 5)
        ) {
          if (!s.venture.offered) send({ type: "pitch" });
          if (s.actions) {
            const term =
              TERMS.find(
                (t) => t.id === "growth" && s.venture.evidence >= t.evidence,
              ) ?? TERMS[1];
            send({ type: "funding", termId: term.id });
          }
        }
      }
      const active = s.work.find(
        (w) => ["feature", "mvp"].includes(w.kind) && w.status !== "released",
      );
      if (!active && s.product.launched && s.actions) {
        const f = FEATURES.find(
          (f) =>
            f.concept === s.product.concept &&
            !s.work.some((w) => w.featureId === f.id),
        );
        if (f) send({ type: "startFeature", featureId: f.id });
      }
      let w = s.work.find(
        (w) => ["feature", "mvp"].includes(w.kind) && w.status !== "released",
      );
      if (
        w &&
        w.done >= w.actual &&
        !w.bugs.some((b) => b.known) &&
        w.qa >= w.actual * 0.12
      ) {
        send({ type: "release", workId: w.id });
        w = undefined;
      }
      const experiment = s.work.find(
        (w) => w.kind === "experiment" && w.status !== "released",
      );
      const repair = s.work.find(
        (w) =>
          ["mvp", "feature"].includes(w.kind) && w.bugs.some((b) => b.known),
      );
      const dev = s.employees[0],
        other = s.employees[1];
      if (w) {
        if (dev)
          assign(
            dev.id,
            w.id,
            (w.done >= w.actual ||
              w.bugs.some((b) => b.known && b.severity === 3)) &&
              w.bugs.some((b) => b.known)
              ? "fix"
              : "develop",
          );
        if (other) assign(other.id, w.id, "qa");
      } else if (experiment) {
        if (dev) assign(dev.id, experiment.id, "research");
        if (other) assign(other.id, experiment.id, "research");
      } else {
        if (dev && repair) assign(dev.id, repair.id, "fix");
        else if (dev) assign(dev.id, "market", "growth");
        if (other) assign(other.id, "market", "growth");
      }
      if (s.product.launched && s.actions) {
        const targetBudget =
          s.cash > monthlyCosts(s) * 5
            ? policy === "fast"
              ? 300000
              : 200000
            : s.cash > monthlyCosts(s) * 2
              ? 100000
              : 0;
        if (s.product.marketing !== targetBudget)
          send({ type: "marketing", amount: targetBudget });
      }
      if (s.product.fit >= 65 && s.product.price !== 9900 && s.actions)
        send({ type: "price", amount: 9900 });
    }
    // Support scales with the customer base; hire through the normal payroll/onboarding path.
    if (s.product.launched && s.strategy !== "outsourcing") {
      const demand =
        (0.08 + s.product.paid * 0.0025 + s.product.free * 0.0003) * 7;
      const desired = Math.max(
        2,
        2 + Math.ceil((demand + s.product.support / 12) / 7),
      );
      if (
        s.actions &&
        s.cash > monthlyCosts(s) * 4 &&
        s.product.paid > 120 &&
        s.employees.length < Math.min(10, desired)
      ) {
        if (
          s.employees.length >= 5 &&
          s.officeTier === 1 &&
          s.day >= 30 &&
          s.reputation >= 50
        )
          send({ type: "upgradeOffice" });
        else {
          const candidate = [...s.candidates].sort(
            (a, b) =>
              (a.role === "ops" ? -2 : a.role === "qa" ? -1 : 0) -
                (b.role === "ops" ? -2 : b.role === "qa" ? -1 : 0) ||
              a.salary - b.salary,
          )[0];
          if (candidate) send({ type: "hire", candidateId: candidate.id });
        }
      }
      for (const employee of s.employees.slice(2))
        assign(employee.id, "market", "support");
      if (s.product.support > 12)
        for (const employee of s.employees.slice(0, 2))
          if (employee.assignments[0]?.target === "market")
            assign(employee.id, "market", "support");
      const other = s.employees[1];
      if (
        other &&
        s.product.support > 3 &&
        (s.employees.length < desired || s.product.support > 15)
      ) {
        const a = other.assignments[0];
        if (a?.target === "market") assign(other.id, "market", "support");
        else if (
          a?.kind === "qa" &&
          s.work.find((w) => w.id === a.target)!.qa >=
            s.work.find((w) => w.id === a.target)!.actual * 0.12
        ) {
          if (other.assignments.length === 1)
            send({
              type: "assign",
              employeeId: other.id,
              target: "market",
              kind: "support",
              append: true,
            });
        }
      }
    }
    if (
      s.day % 90 === 0 &&
      s.day > 0 &&
      s.actions &&
      s.cash > monthlyCosts(s) * 12
    ) {
      const e = s.employees.find(
        (e) => s.day - e.lastRaise >= 90 && e.morale < 85,
      );
      if (e) send({ type: "raise", employeeId: e.id });
    }
    send({ type: "tick", days: Math.min(7, days - s.day) });
    const b = balance(s);
    if (
      b.cash !== s.cash ||
      b.cash + b.receivable !==
        b.liability + b.deferred + b.capital + b.revenue - b.expense
    ) {
      errors.push(`Ledger mismatch day ${s.day}`);
      break;
    }
    if (s.product.free < 0 || s.product.paid < 0 || s.cash < 0) {
      errors.push(`Negative resource day ${s.day}`);
      break;
    }
  }
  return { state: s, commands, rejected, errors };
}
export function scenarioSummary(r: ScenarioResult) {
  const s = r.state,
    ev = campaignEvaluation(s);
  return {
    seed: s.seed,
    strategy: s.strategy,
    difficulty: s.difficulty,
    policy: s.policy,
    day: s.day,
    status: s.status,
    victory: s.campaignWon ?? ev.success,
    cash: s.cash / 100,
    runway: Number.isFinite(runway(s)) ? runway(s) : null,
    paid: s.product.paid,
    free: s.product.free,
    fit: s.product.fit,
    equity: s.venture.founderEquity,
    debt: s.product.debt + s.work.reduce((v, w) => v + w.debt, 0),
    defects: s.work.reduce((v, w) => v + w.bugs.length, 0),
    churn: s.product.churnRate,
    margin: ev.margin,
    morale: s.employees.length
      ? s.employees.reduce((v, e) => v + e.morale, 0) / s.employees.length
      : 0,
    crises: s.metrics.crises,
    incidents: s.metrics.incidents,
    events: s.events.length,
    staff: s.employees.length,
    supportBacklog: s.product.support,
    completedContracts: s.metrics.completedContracts,
    repeatClients: s.metrics.repeatClients.length,
    commands: r.commands,
    rejected: r.rejected,
    errors: r.errors,
  };
}
