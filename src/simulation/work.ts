import type { State, Employee, Assignment, WorkItem, TaskKind } from "./types";
import { BALANCE, copy } from "../content/catalog";
import { FEATURES } from "../content/products";
import { clamp, round, rng, uid, log } from "./helpers";
const fit: Record<TaskKind, string[]> = {
  develop: ["developer"],
  qa: ["qa"],
  fix: ["developer"],
  refactor: ["developer"],
  research: ["designer", "growth"],
  growth: ["growth", "ops"],
  support: ["ops", "qa", "growth"],
};
export function capacity(s: State, e: Employee, a: Assignment) {
  const w = s.work.find((w) => w.id === a.target);
  const dev = ["develop", "fix", "refactor"].includes(a.kind);
  const onboard =
    s.day - e.hiredDay < 7 ? 0.5 : s.day - e.hiredDay < 14 ? 0.75 : 1;
  let traits = 1;
  if (e.traits.includes("driven")) traits *= 1.08;
  if (e.traits.includes("mentor")) traits *= 0.95;
  if (e.traits.includes("meticulous"))
    traits *= a.kind === "qa" ? 1.2 : dev ? 0.95 : 1;
  if (e.traits.includes("creative"))
    traits *= a.kind === "research" ? 1.12 : a.kind === "qa" ? 0.95 : 1;
  if (e.traits.includes("outspoken") && a.kind === "qa") traits *= 1.1;
  if (e.traits.includes("friendly") && a.kind === "research") traits *= 1.08;
  const process = clamp(
    0.96 + s.employees.filter((e) => e.role === "ops").length * 0.035,
    0.9,
    1.1,
  );
  const debt = dev
    ? Math.max(
        0.65,
        1 -
          0.0035 *
            (w
              ? Math.min(
                  100,
                  w.debt +
                    (["feature", "mvp"].includes(w.kind) ? s.product.debt : 0),
                )
              : s.product.debt),
      )
    : 1;
  return (
    BALANCE.baseWP *
    (0.7 + 0.12 * e.skill) *
    (fit[a.kind].includes(e.role) ? 1 : 0.7) *
    (0.8 + 0.004 * e.morale) *
    (0.65 + 0.0035 * e.energy) *
    (e.assignments.length > 1 ? 0.85 : 1) *
    process *
    debt *
    onboard *
    traits *
    (s.overtime ? 1.2 : 1) *
    (a.kind === "develop" ? BALANCE.policy[s.policy].speed : 1)
  );
}
export function quality(w: WorkItem) {
  return clamp(
    100 -
      w.bugs
        .filter((b) => b.known)
        .reduce(
          (v, b) => v + (b.severity === 3 ? 20 : b.severity === 2 ? 5 : 1),
          0,
        ) -
      0.2 * w.debt,
  );
}
export const canRelease = (w: WorkItem) =>
  w.done >= w.actual &&
  w.qa >= Math.max(1, w.actual * 0.12) &&
  !w.bugs.some((b) => b.known && b.severity === 3) &&
  quality(w) >= 70;
export function makeWork(
  s: State,
  label: WorkItem["label"],
  kind: WorkItem["kind"],
  estimated: number,
  extra: Partial<WorkItem> = {},
): WorkItem {
  const w: WorkItem = {
    id: uid(s, "work"),
    label,
    kind,
    estimated,
    actual: round(estimated * (0.8 + rng(s) * 0.5)),
    done: 0,
    effort: 0,
    qa: 0,
    debt: 0,
    bugs: [],
    status: "active",
    labor: 0,
    discovered: false,
    created: s.day,
    ...extra,
  };
  s.work.push(w);
  return w;
}
export function runWork(s: State) {
  for (const e of s.employees) {
    const count = e.assignments.length;
    if (!count) continue;
    for (const a of e.assignments) {
      const w = s.work.find((w) => w.id === a.target);
      let wp = capacity(s, e, a) / 7 / count;
      if (s.venture.pivotUntil > s.day && a.target === "market") continue;
      if (a.target === "market") {
        let used = 0;
        if (a.kind === "growth") {
          used = Math.min(wp, (100 - s.product.awareness) / 0.4);
          s.product.awareness = clamp(s.product.awareness + used * 0.4);
        } else if (a.kind === "research" && !s.product.surveyed) {
          used = Math.min(1, wp);
          s.product.surveyed = true;
          s.product.needs = FEATURES.filter(
            (f) => f.concept === s.product.concept,
          )
            .sort((a, b) => b.fit - a.fit)
            .slice(0, 3)
            .map((f) => f.id);
        } else if (a.kind === "support") {
          used = Math.min(wp, s.product.support);
          s.product.support = round(Math.max(0, s.product.support - used));
        }
        s.metrics.workWeek = round(s.metrics.workWeek + used);
        gainXP(s, e, a.kind, used);
        continue;
      }
      if (!w) continue;
      if (
        s.venture.pivotUntil > s.day &&
        (w.kind === "feature" || w.kind === "mvp")
      )
        continue;
      const before = wp;
      if (a.kind === "develop" && w.done < w.actual && w.status === "active") {
        wp = Math.min(wp, w.actual - w.done);
        w.done = round(w.done + wp);
        if (w.kind === "feature" || w.kind === "mvp" || w.kind === "contract") {
          w.debt = clamp(w.debt + (wp / 20) * BALANCE.policy[s.policy].debt);
          if (
            rng(s) <
            wp *
              BALANCE.baseDefects *
              BALANCE.policy[s.policy].defects *
              (FEATURES.find((f) => f.id === w.featureId)?.risk ?? 1)
          ) {
            const r = rng(s);
            const severity = r < 0.07 ? 3 : r < 0.35 ? 2 : 1;
            w.bugs.push({
              id: uid(s, "bug"),
              severity,
              known: false,
              remaining: severity,
              created: s.day,
              revealed: null,
            });
          }
        }
        if (w.done >= w.actual) {
          w.status = "ready";
          log(
            s,
            "good",
            copy("Đã xong phần thực hiện", "Implementation complete"),
            copy(
              `${w.label.vi}: kiểm tra chất lượng trước khi giao.`,
              `${w.label.en}: check quality before delivery.`,
            ),
            w.id,
          );
        }
      } else if (a.kind === "qa") {
        const hidden = w.bugs.filter((b) => !b.known);
        if (!hidden.length)
          wp = Math.min(wp, Math.max(0, w.actual * 0.25 - w.qa));
        if (wp <= 0) continue;
        w.qa = round(w.qa + wp);
        if (hidden.length && rng(s) < Math.min(0.98, wp * 0.9)) {
          const bug = hidden[0];
          bug.known = true;
          bug.revealed = s.day;
          log(
            s,
            bug.severity === 3 ? "warning" : "info",
            copy("QA phát hiện lỗi", "QA found a defect"),
            copy(
              `${w.label.vi}: cần Dev sửa lỗi; QA không tự sửa.`,
              `${w.label.en}: assign a developer to fix it. Testing does not repair defects.`,
            ),
            w.id,
          );
        }
      } else if (a.kind === "fix") {
        for (const b of w.bugs.filter((b) => b.known)) {
          const used = Math.min(wp, b.remaining);
          b.remaining = round(b.remaining - used);
          wp -= used;
          if (wp <= 0) break;
        }
        if (w.kind === "feature" || w.kind === "mvp") {
          const fixed = w.bugs
            .filter((b) => b.remaining <= 0)
            .reduce((v, b) => v + b.severity, 0);
          s.product.reliability = clamp(s.product.reliability + fixed * 4);
          s.product.support = Math.max(0, s.product.support - fixed);
        }
        w.bugs = w.bugs.filter((b) => b.remaining > 0);
      } else if (a.kind === "refactor") {
        wp = Math.min(
          wp,
          Math.max(
            w.debt / 1.5,
            ["feature", "mvp"].includes(w.kind) ? s.product.debt : 0,
          ),
        );
        if (wp <= 0) continue;
        w.debt = clamp(w.debt - wp * 1.5);
        if (w.kind === "feature" || w.kind === "mvp")
          s.product.debt = clamp(s.product.debt - wp);
      } else if (
        a.kind === "research" &&
        w.kind === "experiment" &&
        w.status === "active"
      ) {
        wp = Math.min(wp, w.actual - w.done);
        w.done = round(w.done + wp);
        if (w.done >= w.actual) w.status = "ready";
      } else if (a.kind === "research") {
        if (w.discovered) continue;
        wp = Math.min(1, wp);
        w.discovered = true;
      } else continue;
      const used = a.kind === "fix" ? before - wp : wp;
      w.effort = round(w.effort + used);
      w.labor += Math.round(
        (e.salary / 30 / count) *
          (s.overtime ? 1.2 : 1) *
          Math.min(1, used / before),
      );
      s.metrics.workWeek = round(s.metrics.workWeek + used);
      gainXP(s, e, a.kind, used);
    }
  }
}

function gainXP(s: State, e: Employee, kind: TaskKind, used: number) {
  if (!fit[kind].includes(e.role) || used <= 0) return;
  const mentors = s.employees.some(
    (x) => x.id !== e.id && x.traits.includes("mentor"),
  );
  e.xp +=
    used *
    (e.traits.includes("learner") ? 1.2 : 1) *
    (e.traits.includes("steady") ? 0.9 : 1) *
    (mentors ? 1.15 : 1);
  if (e.xp >= 160 && e.skill < 5) {
    e.xp -= 160;
    e.skill++;
    log(
      s,
      "good",
      copy("Năng lực tăng lên", "Skill improved"),
      copy(
        `${e.name} đã lên kỹ năng ${e.skill}/5.`,
        `${e.name} reached skill ${e.skill}/5.`,
      ),
      e.id,
    );
  }
}
