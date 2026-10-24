import type {
  Assignment,
  State,
  TaskKind,
  WorkItem,
} from "../../../src/simulation/types";
import {
  assignmentsEqual,
  draftAssignments,
  type WorkSession,
} from "../../../src/ui/workSession";
import { canRelease } from "../../../src/simulation/work";

export const taskLabels: Record<TaskKind, string> = {
  develop: "Phát triển",
  qa: "Kiểm thử",
  fix: "Sửa lỗi",
  refactor: "Giảm nợ",
  research: "Nghiên cứu",
  growth: "Tăng trưởng",
  support: "Hỗ trợ khách",
};
export function assignmentText(s: State, jobs: Assignment[], target?: string) {
  return (
    jobs
      .filter((a) => !target || a.target === target)
      .map((a) => {
        const name =
          a.target === "market"
            ? "Thị trường"
            : (s.work.find((w) => w.id === a.target)?.label.vi ??
              "Đầu việc không còn tồn tại");
        return target ? taskLabels[a.kind] : `${taskLabels[a.kind]} · ${name}`;
      })
      .join(" / ") || "Chưa phân công"
  );
}
export function assignmentChanges(s: State, u: WorkSession) {
  return Object.entries(u.drafts[u.target] ?? {}).flatMap(([id, draft]) => {
    const employee = s.employees.find((e) => e.id === id);
    if (!employee) return [];
    const next = draftAssignments(draft, u.target);
    if (assignmentsEqual(draft.expected, next)) return [];
    return [
      {
        employee,
        draft,
        next,
        conflict: !assignmentsEqual(employee.assignments, draft.expected),
        invalid:
          next.length > 2 ||
          new Set(next.map((a) => `${a.target}:${a.kind}`)).size !==
            next.length,
      },
    ];
  });
}
export function assignable(s: State, target: string) {
  if (target === "market") return s.product.exists;
  const w = s.work.find((w) => w.id === target);
  return (
    !!w &&
    (w.kind !== "contract" ||
      s.contracts.some(
        (c) => c.workId === target && ["signed", "accepted"].includes(c.stage),
      ))
  );
}
// Presentation uses only revealed scope or the same published estimate range as the game.
export function projectProgress(w: WorkItem) {
  const complete = w.status !== "active";
  const low = w.discovered ? w.actual : w.estimated * 0.8;
  const high = w.discovered ? w.actual : w.estimated * 1.3;
  const pct = (done: number, max: number, finished = false) =>
    finished
      ? 100
      : Math.min(99, Math.max(0, Math.floor((done / Math.max(1, max)) * 100)));
  const devLow = pct(w.done, high, complete),
    devHigh = pct(w.done, low, complete);
  const qaLow = Math.max(1, low * 0.12),
    qaHigh = Math.max(1, high * 0.12);
  const qaPercent = Math.min(100, (w.qa / qaHigh) * 100);
  const ready = canRelease(w);
  return {
    complete,
    ready,
    low,
    high,
    devPercent: devLow,
    devLabel: complete
      ? "Hoàn tất phần thực hiện"
      : `${devLow}${devLow === devHigh ? "" : `–${devHigh}`}%${w.discovered ? "" : " ước lượng"}`,
    scopeLabel: w.discovered
      ? `${high.toFixed(1)} WP đã xác định`
      : `${low.toFixed(1)}–${high.toFixed(1)} WP ước lượng`,
    qaPercent,
    qaLabel: w.discovered
      ? `${qaHigh.toFixed(1)} WP tối thiểu`
      : `${qaLow.toFixed(1)}–${qaHigh.toFixed(1)} WP tối thiểu dự kiến`,
    knownBugs: w.bugs.filter((b) => b.known).length,
    criticalBugs: w.bugs.filter((b) => b.known && b.severity === 3).length,
  };
}
