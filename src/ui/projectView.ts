import type {
  Locale,
  Assignment,
  State,
  TaskKind,
  WorkItem,
} from "../simulation/types";
import {
  assignmentsEqual,
  draftAssignments,
  type WorkSession,
} from "./workSession";
import { canRelease } from "../simulation/work";

export const taskLabels: Record<TaskKind, string> = {
  develop: "Phát triển",
  qa: "Kiểm thử",
  fix: "Sửa lỗi",
  refactor: "Giảm nợ",
  research: "Nghiên cứu",
  growth: "Tăng trưởng",
  support: "Hỗ trợ khách",
};
export const taskLabelsForLocale = (
  locale: Locale,
): Record<TaskKind, string> =>
  locale === "vi"
    ? taskLabels
    : {
        develop: "Development",
        qa: "Testing",
        fix: "Fix defects",
        refactor: "Reduce debt",
        research: "Research",
        growth: "Growth",
        support: "Customer support",
      };
export function assignmentText(
  s: State,
  jobs: Assignment[],
  target?: string,
  locale: Locale = "vi",
) {
  return (
    jobs
      .filter((a) => !target || a.target === target)
      .map((a) => {
        const name =
          a.target === "market"
            ? locale === "vi"
              ? "Thị trường"
              : "Market"
            : (s.work.find((w) => w.id === a.target)?.label[locale] ??
              (locale === "vi"
                ? "Đầu việc không còn tồn tại"
                : "Work item no longer exists"));
        return target
          ? taskLabelsForLocale(locale)[a.kind]
          : `${taskLabelsForLocale(locale)[a.kind]} · ${name}`;
      })
      .join(" / ") || (locale === "vi" ? "Chưa phân công" : "Unassigned")
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
export function missingAssignmentDrafts(s: State, u: WorkSession) {
  return Object.entries(u.drafts[u.target] ?? {})
    .filter(
      ([id, draft]) =>
        !s.employees.some((e) => e.id === id) &&
        !assignmentsEqual(draft.expected, draftAssignments(draft, u.target)),
    )
    .map(([id]) => id);
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
export function projectProgress(w: WorkItem, locale: Locale = "vi") {
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
      ? locale === "vi"
        ? "Hoàn tất phần thực hiện"
        : "Implementation complete"
      : `${devLow}${devLow === devHigh ? "" : `–${devHigh}`}%${w.discovered ? "" : locale === "vi" ? " ước lượng" : " estimated"}`,
    scopeLabel: w.discovered
      ? `${high.toFixed(1)} WP ${locale === "vi" ? "đã xác định" : "revealed"}`
      : `${low.toFixed(1)}–${high.toFixed(1)} WP ${locale === "vi" ? "ước lượng" : "estimated"}`,
    qaPercent,
    qaLabel: w.discovered
      ? `${qaHigh.toFixed(1)} WP ${locale === "vi" ? "tối thiểu" : "minimum"}`
      : `${qaLow.toFixed(1)}–${qaHigh.toFixed(1)} WP ${locale === "vi" ? "tối thiểu dự kiến" : "estimated minimum"}`,
    knownBugs: w.bugs.filter((b) => b.known).length,
    criticalBugs: w.bugs.filter((b) => b.known && b.severity === 3).length,
  };
}
