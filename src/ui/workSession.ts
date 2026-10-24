import type { Assignment, TaskKind } from "../simulation/types";
export interface AssignmentDraft {
  expected: Assignment[];
  slots: (TaskKind | "")[];
  addKind: TaskKind | "";
  mode: string;
}
export interface WorkSession {
  mode: "overview" | "assignments";
  target: string;
  detail: string;
  query: string;
  filter: string;
  sort: string;
  scroll: number;
  employeeFilter: string;
  employeeQuery: string;
  employee: string;
  drafts: Record<string, Record<string, AssignmentDraft>>;
}
export const createWorkSession = (): WorkSession => ({
  mode: "overview",
  target: "",
  detail: "",
  query: "",
  filter: "all",
  sort: "attention",
  scroll: 0,
  employeeFilter: "all",
  employeeQuery: "",
  employee: "",
  drafts: {},
});
export const makeDraft = (jobs: Assignment[]): AssignmentDraft => ({
  expected: jobs.map((a) => ({ ...a })),
  slots: jobs.map((a) => a.kind),
  addKind: "",
  mode: "add",
});
export function draftAssignments(
  d: AssignmentDraft,
  target: string,
): Assignment[] {
  const next = d.expected.flatMap((a, i) => {
    const kind = a.target === target ? d.slots[i] : a.kind;
    if (d.addKind && d.mode === String(i)) return [{ target, kind: d.addKind }];
    return kind ? [{ target: a.target, kind }] : [];
  });
  if (d.addKind && d.mode === "add") next.push({ target, kind: d.addKind });
  return next;
}
export const assignmentsEqual = (a: Assignment[], b: Assignment[]) =>
  a.length === b.length &&
  a.every((v, i) => v.target === b[i].target && v.kind === b[i].kind);
