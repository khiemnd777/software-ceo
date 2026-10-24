import { describe, it, expect } from "vitest";
import { createGame } from "../src/simulation/create";
import {
  projectProgress,
  assignmentChanges,
  missingAssignmentDrafts,
  assignmentText,
} from "../src/ui/projectView";
import { createWorkSession, makeDraft } from "../src/ui/workSession";
import {
  officePeople,
  navigateContext,
  project,
  title,
  placeName,
} from "../src/ui/simulateModel";

const game = () =>
  createGame({
    name: "Studio",
    strategy: "outsourcing",
    difficulty: "standard",
    seed: 42,
  });
describe("Simulate UI projections", () => {
  it("does not expose hidden scope in progress labels or alter business state/RNG", () => {
    const s = game(),
      before = structuredClone(s),
      w = s.work[0];
    const a = projectProgress(w),
      b = projectProgress({ ...w, actual: w.actual + 100 });
    for (const key of [
      "devLabel",
      "scopeLabel",
      "qaLabel",
      "devPercent",
      "qaPercent",
    ] as const)
      expect(a[key]).toEqual(b[key]);
    officePeople(s);
    expect(s).toEqual(before);
    expect(projectProgress(w, "en").scopeLabel).toContain("estimated");
  });
  it("keeps implementation completion separate from the quality gate", () => {
    const w = game().work[0];
    const p = projectProgress({ ...w, done: w.actual, status: "ready", qa: 0 });
    expect(p.devPercent).toBe(100);
    expect(p.qaPercent).toBe(0);
    expect(p.ready).toBe(false);
  });
  it("previews changes without changing actual assignments or another task", () => {
    const s = game(),
      e = s.employees[0],
      u = createWorkSession();
    u.target = s.work[0].id;
    e.assignments = [{ target: "other", kind: "develop" }];
    const before = structuredClone(s);
    u.drafts[u.target] = {
      [e.id]: { ...makeDraft(e.assignments), addKind: "qa" },
    };
    const rows = assignmentChanges(s, u);
    expect(rows).toHaveLength(1);
    expect(rows[0].next).toEqual([
      { target: "other", kind: "develop" },
      { target: u.target, kind: "qa" },
    ]);
    expect(s).toEqual(before);
    expect(assignmentText(s, rows[0].next, u.target, "en")).toBe("Testing");
  });
  it("detects duplicate/conflicting and departed-person drafts so Apply can remain atomic", () => {
    const s = game(),
      e = s.employees[0],
      u = createWorkSession();
    u.target = s.work[0].id;
    e.assignments = [{ target: u.target, kind: "develop" }];
    u.drafts[u.target] = {
      [e.id]: { ...makeDraft(e.assignments), addKind: "develop" },
    };
    expect(assignmentChanges(s, u)[0].invalid).toBe(true);
    e.assignments = [];
    expect(assignmentChanges(s, u)[0].conflict).toBe(true);
    s.employees = s.employees.filter((v) => v.id !== e.id);
    expect(missingAssignmentDrafts(s, u)).toEqual([e.id]);
  });
  it("maps old navigation to office contexts in both languages", () => {
    const s = game();
    expect(navigateContext("work", s, "")).toEqual({ kind: "projects" });
    expect(navigateContext("people", s, s.employees[0].id)).toEqual({
      kind: "employee",
      id: s.employees[0].id,
    });
    expect(title({ kind: "finance" }, s, "en")).toBe("Financial position");
    expect(placeName("projects", "en")).toBe("Project board");
  });
  it("moves HTML interaction anchors with the same pan and zoom as the native camera", () => {
    const camera = { x: 100, y: 80, zoom: 1, width: 1280, height: 720 };
    const a = project(camera, 3, 2, 1);
    const b = project({ ...camera, x: 130, y: 95 }, 3, 2, 1);
    expect(b.x - a.x).toBe(30);
    expect(b.y - a.y).toBe(15);
    const c = project({ ...camera, zoom: 2 }, 3, 2, 1);
    expect(c.x - camera.x).toBeCloseTo((a.x - camera.x) * 2);
    expect(c.y - camera.y).toBeCloseTo((a.y - camera.y) * 2);
  });
});
