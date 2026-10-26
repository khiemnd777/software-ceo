/** A separate staffing strategy for the 180-day deadline challenge. Public commands only. */
import { writeFileSync } from "node:fs";
import { createGame } from "../src/simulation/create";
import { transition } from "../src/simulation/engine";
import { quality } from "../src/simulation/work";
import { EVENTS } from "../src/content/events";
import { campaignEvaluation } from "../src/gameplay/progression";
import { invariantErrors } from "../src/persistence/schema";
import { encodeSave } from "../src/persistence/saves";
import type { Command, Policy, TaskKind } from "../src/simulation/types";
const results = [];
for (const policy of ["quality", "balanced", "fast"] as Policy[]) {
  let s = createGame({
    name: "Deadline Staffing",
    strategy: "outsourcing",
    difficulty: "standard",
    seed: 42,
    mode: "deadline",
  });
  const trace: {
    day: number;
    command: Command;
    ok: boolean;
    error?: string;
  }[] = [];
  const send = (command: Command) => {
    const r = transition(s, command);
    trace.push({
      day: s.day,
      command,
      ok: r.ok,
      ...(!r.ok ? { error: r.error?.en } : {}),
    });
    if (!r.ok) throw Error(JSON.stringify(trace.at(-1)));
    s = r.state;
  };
  const assign = (id: string, target: string, kind: TaskKind) => {
    const e = s.employees.find((e) => e.id === id)!;
    if (
      e.assignments.length === 1 &&
      e.assignments[0].target === target &&
      e.assignments[0].kind === kind
    )
      return;
    send({ type: "assign", employeeId: id, target, kind });
  };
  send({
    type: "hire",
    candidateId: s.candidates.find((c) => c.role === "developer")!.id,
  });
  if (policy !== "balanced") send({ type: "policy", policy });
  while (s.clock.lastClosedDay < 180 && s.status === "playing") {
    for (const e of s.events.filter(
      (e) => !e.resolved && e.due <= s.day && e.expires > s.day,
    )) {
      const template = EVENTS.find((x) => x.id === e.templateId)!;
      const choice = template.choices.find(
        (c) =>
          c.cost === 0 &&
          !c.immediate.scope &&
          !c.immediate.promise &&
          !c.delay,
      );
      if (choice && s.actions >= choice.actions)
        send({ type: "decide", eventId: e.id, choiceId: choice.id });
    }
    let c = s.contracts.find((c) => c.stage === "signed");
    if (!c && s.actions && s.metrics.completedContracts < 3) {
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
        const id = lead.id;
        if (s.actions && s.contracts.find((c) => c.id === id)!.stage === "lead")
          send({ type: "qualify", contractId: id });
        if (s.contracts.find((c) => c.id === id)!.stage === "qualified")
          send({
            type: "quote",
            contractId: id,
            contractType: "fixed",
            discount: 0,
          });
        if (
          s.actions &&
          s.contracts.find((c) => c.id === id)!.stage === "quoted"
        )
          send({ type: "sign", contractId: id });
      }
      c = s.contracts.find((c) => c.stage === "signed");
    }
    if (c) {
      if (c.changePending && s.actions)
        send({ type: "change", contractId: c.id, choice: "decline" });
      let w = s.work.find((w) => w.id === c!.workId)!;
      const enoughQA =
        w.qa >= w.done * 0.12 &&
        quality(w) >= 70 &&
        !w.bugs.some((b) => b.known && b.severity === 3);
      if (
        !c.midAccepted &&
        w.done >= (w.discovered ? w.actual : w.estimated * 1.3) * 0.5 &&
        enoughQA
      )
        send({ type: "accept", contractId: c.id, milestone: "mid" });
      c = s.contracts.find((x) => x.id === c!.id)!;
      w = s.work.find((w) => w.id === c!.workId)!;
      if (
        !c.finalAccepted &&
        w.status === "ready" &&
        enoughQA &&
        !w.bugs.some((b) => b.known)
      )
        send({ type: "accept", contractId: c.id, milestone: "final" });
      if (s.contracts.find((x) => x.id === c!.id)!.stage === "signed")
        for (const e of s.employees) {
          const kind =
            e.role === "qa"
              ? "qa"
              : (w.status === "ready" ||
                    w.bugs.some((b) => b.known && b.severity === 3)) &&
                  w.bugs.some((b) => b.known)
                ? "fix"
                : "develop";
          assign(e.id, w.id, kind);
        }
    }
    send({ type: "tick", days: 1 });
    if (invariantErrors(s).length) throw Error(invariantErrors(s).join(";"));
  }
  const row = {
    seed: 42,
    policy,
    day: s.clock.lastClosedDay,
    activeDay: s.day,
    won: s.campaignWon,
    contracts: s.metrics.completedContracts,
    onTime: campaignEvaluation(s).onTime,
    cash: s.cash / 100,
    staff: s.employees.length,
    commands: trace.length,
    rejected: trace.filter((x) => !x.ok).length,
    trace,
  };
  results.push(row);
  if (policy === "balanced")
    writeFileSync(
      "evidence/fixtures/deadline-challenge-complete.json",
      await encodeSave(s),
    );
  console.log({ ...row, trace: undefined });
}
writeFileSync(
  "evidence/deadline-staffing.json",
  JSON.stringify(
    {
      method:
        "Seed 42, standard difficulty; hire a second developer immediately, fixed price, daily decisions, decline changes, QA and fixes, stop sales after third contract. Only public commands; actual scope only consulted after discovery/completion. Three complete policies, not 100 seeds or a human playtest.",
      results,
    },
    null,
    2,
  ),
);
