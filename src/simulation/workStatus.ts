import type { State, Employee, Assignment } from "./types";
import { phaseAt } from "./clock";
export function runnable(s: State, a: Assignment): boolean {
  if (
    s.venture.pivotUntil > s.day &&
    (a.target === "market" ||
      ["feature", "mvp"].includes(
        s.work.find((w) => w.id === a.target)?.kind ?? "",
      ))
  )
    return false;
  if (a.target === "market")
    return a.kind === "support"
      ? s.product.support > 0
      : a.kind === "research"
        ? !s.product.surveyed
        : a.kind === "growth" && s.product.awareness < 100;
  const w = s.work.find((w) => w.id === a.target);
  if (!w) return false;
  switch (a.kind) {
    case "develop":
      return w.status === "active" && w.done < w.actual;
    case "qa":
      return w.bugs.some((b) => !b.known) || w.qa < w.actual * 0.25;
    case "fix":
      return w.bugs.some((b) => b.known && b.remaining > 0);
    case "refactor":
      return (
        w.debt > 0 ||
        (["feature", "mvp"].includes(w.kind) && s.product.debt > 0)
      );
    case "research":
      return w.kind === "experiment"
        ? w.status === "active" && w.done < w.actual
        : !w.discovered;
    default:
      return false;
  }
}
export function employeeActivity(
  s: State,
  e: Employee,
  minute = s.clock.minute,
) {
  const phase = phaseAt(minute);
  const active = e.assignments.find((a) => runnable(s, a));
  const scheduled = phase === "work" || (phase === "overtime" && s.overtime);
  return {
    phase,
    present:
      phase === "work" ||
      phase === "lunch" ||
      (phase === "overtime" && s.overtime && !!active),
    working: scheduled && !!active,
    taskKind: active?.kind,
  };
}
