import type { State, Contract } from "./types";
import { capacity } from "./work";
import { monthlyCosts } from "./finance";
/** Forecasts use revealed scope or the published estimate range, never hidden actual work. */
export function deliveryForecast(s: State, c: Contract) {
  const w = s.work.find((w) => w.id === c.workId)!;
  const contributors = s.employees.filter((e) =>
    e.assignments.some((a) => a.target === w.id),
  );
  const perWeek = (kind: string) =>
    contributors.reduce(
      (n, e) =>
        n +
        e.assignments
          .filter((a) => a.target === w.id && a.kind === kind)
          .reduce((v, a) => v + capacity(s, e, a) / e.assignments.length, 0),
      0,
    );
  const dev = perWeek("develop"),
    qa = perWeek("qa"),
    fix = perWeek("fix");
  const knownFix = w.bugs
    .filter((b) => b.known)
    .reduce((n, b) => n + b.remaining, 0);
  const low = w.discovered ? w.actual : w.estimated * 0.8,
    high = w.discovered ? w.actual : w.estimated * 1.3;
  const time = (scope: number) => {
    const d = Math.max(0, scope - w.done),
      q = Math.max(0, scope * 0.12 - w.qa);
    if ((d && !dev) || (q && !qa) || (knownFix && !fix)) return null;
    return Math.ceil(
      Math.max(
        dev ? (d / dev) * 7 : 0,
        qa ? (q / qa) * 7 : 0,
        fix ? (knownFix / fix) * 7 : 0,
      ),
    );
  };
  const minDays = time(low),
    maxDays = time(high),
    remaining = Math.max(0, high - w.done);
  const active = s.contracts.filter((c) => c.stage === "signed").length || 1;
  const dailyCost = contributors.length
    ? contributors.reduce(
        (n, e) => n + e.salary / 30 / e.assignments.length,
        0,
      ) +
      (monthlyCosts(s) - s.employees.reduce((n, e) => n + e.salary, 0)) /
        30 /
        active
    : monthlyCosts(s) / 30;
  const cost =
    maxDays === null ? null : Math.round(w.labor + maxDays * dailyCost);
  return {
    minDays,
    maxDays,
    remaining,
    knownFix,
    qaNeeded: Math.max(0, high * 0.12 - w.qa),
    cost,
    margin: cost === null ? null : (c.price - cost) / c.price,
    late: maxDays !== null && s.day + maxDays > c.deadline,
  };
}
