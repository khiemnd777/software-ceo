import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import type { PanelProps } from "./Panels";
import type { Assignment, TaskKind } from "../simulation/types";
import { ROLES } from "../content/catalog";
import { ProductWork, Experiments } from "./BusinessPanels";
import { SectionNavigation } from "./Management";
import {
  assignmentsEqual,
  draftAssignments,
  makeDraft,
  type AssignmentDraft,
} from "./workSession";
import { deliveryForecast } from "../simulation/selectors";

type Props = PanelProps & { renderContract: (id: string) => ReactNode };
export function WorkWorkspace(p: Props) {
  const { s, locale, workSession: u, setWorkSession: setU } = p;
  const root = useRef<HTMLDivElement>(null),
    inspector = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLElement | null>(null);
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  useLayoutEffect(() => {
    if (root.current && u?.mode === "overview")
      root.current.scrollTop = u.scroll;
  }, [u?.mode, u?.scroll]);
  useLayoutEffect(() => {
    const dialog = inspector.current;
    return () => dialog?.close();
  }, []);
  useLayoutEffect(() => {
    if (u?.mode === "assignments" && root.current) root.current.scrollTop = 0;
  }, [u?.mode, u?.target]);
  useEffect(() => {
    const dialog = inspector.current;
    if (u?.detail && dialog && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLButtonElement>("button")?.focus();
    }
    if (!u?.detail && dialog?.open) dialog.close();
  }, [u?.detail]);
  useEffect(() => {
    if (u?.mode !== "assignments") return;
    const frame = requestAnimationFrame(() =>
      root.current?.querySelector<HTMLButtonElement>("button")?.focus(),
    );
    return () => cancelAnimationFrame(frame);
  }, [u?.mode]);
  if (!u || !setU) return null;
  const patch = (v: Partial<typeof u>) => setU((prev) => ({ ...prev, ...v }));
  const tasks: Record<TaskKind, string> = {
    develop: l("Phát triển", "Develop"),
    qa: "QA",
    fix: l("Sửa lỗi", "Fix defects"),
    refactor: l("Giảm nợ", "Refactor"),
    research: l("Nghiên cứu", "Research"),
    growth: l("Tăng trưởng", "Growth"),
    support: l("Hỗ trợ khách", "Customer support"),
  };
  const eligible = (target: string) => {
    if (target === "market") return s.product.exists;
    const w = s.work.find((w) => w.id === target);
    return (
      !!w &&
      (w.kind !== "contract" ||
        s.contracts.some(
          (c) =>
            c.workId === target && ["signed", "accepted"].includes(c.stage),
        ))
    );
  };
  const name = (id: string) =>
    id === "market"
      ? l("Thị trường / Khách hàng", "Market / Customers")
      : (s.work.find((w) => w.id === id)?.label[locale] ??
        l("Công việc không còn tồn tại", "Work no longer exists"));
  const rows = s.work.map((w) => {
    const c = s.contracts.find((c) => c.workId === w.id),
      f = c ? deliveryForecast(s, c) : null;
    return {
      id: w.id,
      w,
      c,
      title: w.label[locale],
      status: c
        ? c.stage === "accepted"
          ? l("Đã nghiệm thu", "Accepted")
          : c.stage !== "signed"
            ? l("Chờ cam kết", "Awaiting commitment")
            : f?.maxDays === null
              ? l("Thiếu phân công", "Needs assignments")
              : f?.late
                ? l("Nguy cơ trễ", "Delivery at risk")
                : l("Đang thực hiện", "In progress")
        : w.status === "released"
          ? l("Đã phát hành", "Released")
          : l("Đang thực hiện", "In progress"),
      attention: c?.stage === "signed" && (f?.maxDays === null || f?.late),
      completed: c?.stage === "accepted" || w.status === "released",
    };
  });
  const visible = rows
    .filter(
      (r) =>
        (u.filter === "all" ||
          (u.filter === "active" && eligible(r.id) && !r.completed) ||
          (u.filter === "offers" && !eligible(r.id)) ||
          (u.filter === "completed" && r.completed)) &&
        `${r.title} ${r.c?.client ?? ""}`
          .toLocaleLowerCase(locale)
          .includes(u.query.trim().toLocaleLowerCase(locale)),
    )
    .sort(
      (a, b) =>
        (u.sort === "deadline"
          ? (a.c?.deadline ?? Infinity) - (b.c?.deadline ?? Infinity)
          : Number(b.attention) - Number(a.attention)) ||
        a.id.localeCompare(b.id),
    );
  const focusReturn = () =>
    requestAnimationFrame(() => {
      const target =
        root.current?.querySelector<HTMLButtonElement>(
          `[data-work-id="${CSS.escape(u.target || u.detail)}"]`,
        ) ?? opener.current;
      if (target?.isConnected) target.focus({ preventScroll: true });
    });
  const back = () => {
    patch({ mode: "overview", detail: "" });
    focusReturn();
  };
  const assign = (target: string) => {
    opener.current = document.activeElement as HTMLElement;
    p.openAssignments?.(target);
  };
  const detail = (target: string) => {
    opener.current = document.activeElement as HTMLElement;
    patch({ detail: target, target });
  };
  const activeRow = rows.find((r) => r.id === u.detail);
  const jobsText = (jobs: Assignment[]) =>
    jobs.map((a) => `${tasks[a.kind]} · ${name(a.target)}`).join(" / ");
  const currentDrafts = u.drafts[u.target] ?? {};
  const changed = Object.entries(currentDrafts).filter(
    ([, d]) => !assignmentsEqual(d.expected, draftAssignments(d, u.target)),
  );
  const total = Object.entries(u.drafts).reduce(
    (n, [target, ds]) =>
      n +
      Object.values(ds).filter(
        (d) => !assignmentsEqual(d.expected, draftAssignments(d, target)),
      ).length,
    0,
  );
  const updateDraft = (
    employeeId: string,
    edit: (d: AssignmentDraft) => AssignmentDraft,
  ) => {
    const employee = s.employees.find((e) => e.id === employeeId)!;
    setU((prev) => ({
      ...prev,
      drafts: {
        ...prev.drafts,
        [prev.target]: {
          ...prev.drafts[prev.target],
          [employeeId]: edit(
            prev.drafts[prev.target]?.[employeeId] ??
              makeDraft(employee.assignments),
          ),
        },
      },
    }));
  };
  const targetWork = s.work.find((w) => w.id === u.target);
  const kinds = (Object.keys(tasks) as TaskKind[]).filter((k) =>
    u.target === "market"
      ? ["research", "growth", "support"].includes(k)
      : targetWork?.kind === "experiment"
        ? k === "research"
        : k !== "support",
  );
  const saveScroll = () => {
    if (
      u.mode === "overview" &&
      root.current &&
      root.current.scrollTop !== u.scroll
    )
      patch({ scroll: root.current.scrollTop });
  };
  const navigateSection = (section: string) => {
    if (section === "work-assignments")
      assign(
        eligible(u.detail)
          ? u.detail
          : (s.work.find((w) => eligible(w.id))?.id ??
              (s.product.exists ? "market" : "")),
      );
    else if (section === "market-customers") p.navigate("market");
    else back();
  };
  const cancel = () =>
    setU((prev) => {
      const drafts = { ...prev.drafts };
      delete drafts[prev.target];
      return { ...prev, drafts };
    });
  const apply = () => {
    if (
      p.dispatch({
        type: "assignBatch",
        changes: changed.map(([employeeId, d]) => ({
          employeeId,
          expected: d.expected,
          assignments: draftAssignments(d, u.target),
        })),
      })
    )
      cancel();
  };
  const people = s.employees.filter(
    (e) =>
      (!u.employee || e.id === u.employee) &&
      (u.employeeFilter === "all" ||
        (u.employeeFilter === "team"
          ? e.assignments.some((a) => a.target === u.target)
          : !e.assignments.length)) &&
      e.name
        .toLocaleLowerCase(locale)
        .includes(u.employeeQuery.toLocaleLowerCase(locale)),
  );
  return (
    <SectionNavigation.Provider value={navigateSection}>
      <div
        ref={root}
        className={`management management-page work-workspace ${u.mode}`}
        aria-label={l("Công việc", "Work")}
        tabIndex={0}
        onScroll={saveScroll}
      >
        {u.mode === "overview" ? (
          <>
            <div className="work-toolbar">
              <h1>
                {l("Công việc", "Work")} <small>{rows.length}</small>
              </h1>
              <div className="button-row">
                <input
                  type="search"
                  aria-label={l("Tìm công việc", "Search work")}
                  placeholder={l(
                    "Tìm dự án, khách hàng…",
                    "Search projects or clients…",
                  )}
                  value={u.query}
                  onChange={(e) => patch({ query: e.target.value })}
                />
                <select
                  aria-label={l("Sắp xếp công việc", "Sort work")}
                  value={u.sort}
                  onChange={(e) => patch({ sort: e.target.value })}
                >
                  <option value="attention">
                    {l("Cần chú ý trước", "Attention first")}
                  </option>
                  <option value="deadline">
                    {l("Hạn giao gần nhất", "Nearest deadline")}
                  </option>
                </select>
              </div>
            </div>
            <div className="work-summary">
              <span>
                {rows.filter((r) => r.attention).length}{" "}
                {l("cần chú ý", "need attention")}
              </span>
              <span>
                {s.employees.filter((e) => e.assignments.length).length}/
                {s.employees.length} {l("nhân viên có việc", "staff assigned")}
              </span>
              <span>
                {total} {l("thay đổi chưa áp dụng", "pending changes")}
              </span>
            </div>
            <div className="work-toolbar work-filters">
              <nav aria-label={l("Lọc công việc", "Filter work")}>
                {[
                  ["all", l("Tất cả", "All")],
                  ["active", l("Đang làm", "Active")],
                  ["offers", l("Cơ hội", "Opportunities")],
                  ["completed", l("Hoàn tất", "Completed")],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    aria-pressed={u.filter === id}
                    onClick={() => patch({ filter: id, scroll: 0 })}
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <span className="muted">
                {l("Chọn tên để xem chi tiết", "Select a name to inspect")}
              </span>
            </div>
            <div className="work-table-frame">
              <table className="work-overview">
                <caption className="sr-only">
                  {l("Tổng quan công việc", "Work overview")}
                </caption>
                <thead>
                  <tr>
                    {[
                      l("Dự án / Khách hàng", "Project / Client"),
                      l("Trạng thái", "Status"),
                      l("Hạn giao", "Due"),
                      l("Phát triển", "Development"),
                      "QA",
                      l("Đội ngũ", "Team"),
                      l("Phân công", "Assignments"),
                    ].map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => {
                    const team = s.employees.flatMap((e) =>
                      e.assignments
                        .filter((a) => a.target === r.id)
                        .map((a) => ({ name: e.name, kind: a.kind })),
                    );
                    return (
                      <tr key={r.id}>
                        <td>
                          <button
                            data-work-id={r.id}
                            className="work-project-name"
                            onClick={() => detail(r.id)}
                          >
                            {r.title}
                          </button>
                          <small>
                            {r.c?.client ??
                              (r.w.kind === "feature"
                                ? l("Tính năng", "Feature")
                                : r.w.kind === "experiment"
                                  ? l("Thử nghiệm", "Experiment")
                                  : "MVP")}
                          </small>
                        </td>
                        <td>
                          <span className={r.attention ? "work-warning" : ""}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          {r.c ? (
                            <>
                              {r.c.deadline}
                              <small>
                                {r.completed
                                  ? l("Đã giao", "Delivered")
                                  : locale === "vi"
                                    ? `còn ${r.c.deadline - s.day} ngày`
                                    : `${r.c.deadline - s.day} days left`}
                              </small>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          {eligible(r.id) ? (
                            <>
                              {r.w.done.toFixed(1)} WP
                              <small>
                                {r.w.discovered
                                  ? r.w.actual.toFixed(1)
                                  : r.c
                                    ? `${(r.w.estimated * 0.8).toFixed(0)}–${(r.w.estimated * 1.3).toFixed(0)}`
                                    : `~${r.w.estimated}`}{" "}
                                WP
                              </small>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          {r.w.qa > 0 ? (
                            <>
                              {r.w.qa.toFixed(1)} WP
                              <small>
                                {r.w.bugs.filter((b) => b.known).length}{" "}
                                {l("lỗi đã biết", "known defects")}
                              </small>
                            </>
                          ) : (
                            l("Chưa kiểm thử", "Not tested")
                          )}
                        </td>
                        <td>
                          {team.slice(0, 2).map((t, i) => (
                            <small key={i}>
                              {t.name.split(" ")[0]} · {tasks[t.kind]}
                            </small>
                          ))}
                          {team.length > 2 && <small>+{team.length - 2}</small>}
                          {!team.length && (
                            <small>{l("Chưa phân công", "Unassigned")}</small>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => assign(r.id)}
                            aria-label={`${l("Phân công", "Assign")} ${r.title}`}
                          >
                            {l("Phân công", "Assign")} →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!visible.length && (
                <p className="empty-state">
                  {l(
                    "Không có công việc phù hợp. Thử bộ lọc khác hoặc mở cơ hội mới.",
                    "No matching work. Try another filter or create new opportunities.",
                  )}
                </p>
              )}
            </div>
            <div className="button-row work-tools">
              <button
                disabled={!s.actions}
                onClick={() => p.dispatch({ type: "findLead" })}
              >
                {l("Tìm cơ hội mới · 1 lượt", "Find a lead · 1 action")}
              </button>
              {s.product.exists && (
                <>
                  <button onClick={() => detail("product")}>
                    {l("Lộ trình sản phẩm", "Product roadmap")}
                  </button>
                  <button onClick={() => assign("market")}>
                    {l("Phân công Thị trường", "Assign Market")}
                  </button>
                </>
              )}
              {(s.strategy === "startup" || s.secondary === "startup") && (
                <button onClick={() => detail("experiments")}>
                  {l("Thử nghiệm", "Experiments")}
                </button>
              )}
              <button
                onClick={() =>
                  assign(
                    s.work.find((w) => eligible(w.id))?.id ??
                      (s.product.exists ? "market" : (rows[0]?.id ?? "")),
                  )
                }
              >
                {l("Phân công đội ngũ", "Assign the team")}
              </button>
            </div>
            <p className="small muted">
              {l(
                "WP = điểm việc. QA phát hiện lỗi; Dev sửa lỗi. Nghiệm thu chưa có nghĩa đã thu tiền.",
                "WP = work points. QA finds defects; developers fix them. Acceptance does not mean payment cleared.",
              )}
            </p>
          </>
        ) : (
          <>
            <div className="work-toolbar">
              <button onClick={back}>
                ← {l("Về tổng quan", "Back to overview")}
              </button>
              <h1>{l("Phân công", "Assignments")}</h1>
              <select
                aria-label={l("Dự án phân công", "Assignment project")}
                value={u.target}
                onChange={(e) => patch({ target: e.target.value })}
              >
                <option value="" disabled>
                  {l("Chọn dự án", "Choose work")}
                </option>
                {u.target &&
                  u.target !== "market" &&
                  !s.work.some((w) => w.id === u.target) && (
                    <option value={u.target}>
                      {l(
                        "Công việc không còn tồn tại",
                        "Work no longer exists",
                      )}
                    </option>
                  )}
                {s.work.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label[locale]}
                  </option>
                ))}
                {!s.product.exists && u.target === "market" && (
                  <option value="market">
                    {l("Thị trường không khả dụng", "Market unavailable")}
                  </option>
                )}
                {s.product.exists && (
                  <option value="market">{name("market")}</option>
                )}
              </select>
            </div>
            <div className="work-summary">
              <strong>{name(u.target)}</strong>
              {targetWork && (
                <>
                  <span>
                    {targetWork.done.toFixed(1)} WP · QA{" "}
                    {targetWork.qa.toFixed(1)}
                  </span>
                  <span>
                    {targetWork.bugs.filter((b) => b.known).length}{" "}
                    {l("lỗi đã biết", "known defects")}
                  </span>
                </>
              )}
            </div>
            {!eligible(u.target) && (
              <p className="work-warning">
                {l(
                  "Mục tiêu chưa đủ điều kiện hoặc không còn tồn tại. Ký hợp đồng hoặc chọn công việc khác.",
                  "This target is not eligible or no longer exists. Sign the contract or choose other work.",
                )}
              </p>
            )}
            <div className="work-toolbar">
              <nav>
                {[
                  ["all", l("Tất cả", "All")],
                  ["team", l("Đang tham gia", "Assigned here")],
                  ["free", l("Chưa phân công", "Unassigned")],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    aria-pressed={u.employeeFilter === id}
                    onClick={() => patch({ employeeFilter: id })}
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <input
                type="search"
                aria-label={l("Tìm nhân viên", "Search employees")}
                placeholder={l("Tìm nhân viên…", "Search employees…")}
                value={u.employeeQuery}
                onChange={(e) => patch({ employeeQuery: e.target.value })}
              />
              {u.employee && (
                <button onClick={() => patch({ employee: "" })}>
                  {l("Hiện cả đội", "Show entire team")}
                </button>
              )}
            </div>
            <div className="work-assignment-list">
              {people.map((e) => {
                const d = currentDrafts[e.id] ?? makeDraft(e.assignments),
                  own = d.expected
                    .map((a, i) => ({ a, i }))
                    .filter(({ a }) => a.target === u.target),
                  next = draftAssignments(d, u.target),
                  dirty = !assignmentsEqual(d.expected, next),
                  conflict =
                    !!currentDrafts[e.id] &&
                    !assignmentsEqual(e.assignments, d.expected),
                  invalid =
                    next.length > 2 ||
                    new Set(next.map((a) => `${a.target}:${a.kind}`)).size !==
                      next.length;
                const selectKind = (
                  value: TaskKind | "",
                  onChange: (v: TaskKind | "") => void,
                  label: string,
                ) => (
                  <select
                    value={value}
                    aria-label={label}
                    disabled={!eligible(u.target)}
                    onChange={(ev) =>
                      onChange(ev.target.value as TaskKind | "")
                    }
                  >
                    <option value="">
                      {l(
                        "Không giao / bỏ việc này",
                        "No assignment / remove this task",
                      )}
                    </option>
                    {kinds.map((k) => (
                      <option key={k} value={k}>
                        {tasks[k]}
                      </option>
                    ))}
                  </select>
                );
                return (
                  <div
                    className={`assignment-row work-assignment-row ${dirty ? "dirty" : ""}`}
                    key={e.id}
                  >
                    <div>
                      <strong>{e.name}</strong>
                      <small>
                        {ROLES[e.role][locale]} · {l("Kỹ năng", "Skill")}{" "}
                        {e.skill}
                      </small>
                      <small>
                        {jobsText(e.assignments) ||
                          l("Chưa phân công", "Unassigned")}
                      </small>
                      {e.assignments.length === 2 && (
                        <small className="work-warning">
                          {l(
                            "2/2 việc · Giảm tập trung 15%",
                            "2/2 tasks · 15% focus penalty",
                          )}
                        </small>
                      )}
                    </div>
                    <div className="work-task-controls">
                      {own.map(({ i }) => (
                        <label key={i}>
                          <small>
                            {l("Việc", "Task")} {i + 1}
                          </small>
                          {selectKind(
                            d.slots[i],
                            (v) =>
                              updateDraft(e.id, (old) => ({
                                ...old,
                                slots: old.slots.map((k, j) =>
                                  i === j ? v : k,
                                ),
                              })),
                            `${e.name} ${l("công việc", "task")} ${i + 1}`,
                          )}
                        </label>
                      ))}
                      {(own.length === 0 ||
                        d.expected.length < 2 ||
                        d.addKind) && (
                        <label>
                          <small>
                            {own.length
                              ? l("Thêm việc thứ hai", "Add a second task")
                              : l(
                                  "Việc trong dự án này",
                                  "Task in this project",
                                )}
                          </small>
                          {selectKind(
                            d.addKind,
                            (v) =>
                              updateDraft(e.id, (old) => ({
                                ...old,
                                addKind: v,
                              })),
                            `${e.name} ${l("công việc mới", "new task")}`,
                          )}
                        </label>
                      )}
                      <small className={dirty ? "work-warning" : "muted"}>
                        {dirty
                          ? l("● Chưa áp dụng", "● Pending")
                          : l(
                              "Đồng bộ với phân công thật",
                              "Matches current assignments",
                            )}
                      </small>
                    </div>
                    <div>
                      {d.addKind && (
                        <label>
                          <small>{l("Cách áp dụng", "Apply mode")}</small>
                          <select
                            aria-label={`${e.name} ${l("cách áp dụng", "apply mode")}`}
                            value={d.mode}
                            onChange={(ev) =>
                              updateDraft(e.id, (old) => ({
                                ...old,
                                mode: ev.target.value,
                              }))
                            }
                          >
                            <option value="add">
                              {d.expected.length
                                ? l("Thêm việc thứ hai", "Add a second task")
                                : l("Giao việc", "Assign")}
                            </option>
                            {d.expected.map((a, i) => (
                              <option key={i} value={String(i)}>
                                {l("Thay việc", "Replace task")} {i + 1}:{" "}
                                {tasks[a.kind]} · {name(a.target)}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      {!d.addKind && (
                        <small>
                          {l(
                            "Chỉ sửa việc được chọn; giữ nguyên việc khác.",
                            "Edit the selected task; preserve other tasks.",
                          )}
                        </small>
                      )}
                      {(conflict || invalid) && (
                        <p className="work-warning">
                          {conflict
                            ? l(
                                "Phân công đã đổi. Xem lại và soạn lại hàng này.",
                                "Assignments changed. Review and recreate this draft.",
                              )
                            : l(
                                "Tối đa hai việc, không giao trùng. Chọn việc cần thay.",
                                "Maximum two tasks; no duplicates. Choose a task to replace.",
                              )}
                        </p>
                      )}
                      {currentDrafts[e.id] && (
                        <button
                          className="text-button"
                          onClick={() =>
                            setU((prev) => {
                              const drafts = { ...prev.drafts },
                                group = { ...drafts[prev.target] };
                              delete group[e.id];
                              drafts[prev.target] = group;
                              return { ...prev, drafts };
                            })
                          }
                        >
                          {l("Soạn lại hàng", "Reset row")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {!people.length && (
                <p className="empty-state">
                  {l(
                    "Không có nhân viên phù hợp bộ lọc.",
                    "No employees match these filters.",
                  )}
                </p>
              )}
            </div>
            <div className="work-applybar">
              <div>
                <strong>
                  {changed.length}{" "}
                  {l("nhân viên có thay đổi", "employees changed")}
                </strong>
                <small>
                  {l(
                    "Tối đa hai việc. Hai việc chia đều thời gian và giảm tập trung 15%.",
                    "Maximum two tasks. Two tasks split time equally and reduce focus by 15%.",
                  )}
                </small>
                <small>
                  {l(
                    "Bản nháp giữ trong phiên chơi; tải lại trang sẽ bỏ phần chưa áp dụng.",
                    "Drafts stay in this session; reloading discards unapplied changes.",
                  )}
                </small>
              </div>
              <button
                disabled={!Object.keys(currentDrafts).length}
                onClick={cancel}
              >
                {l("Hủy thay đổi", "Discard changes")}
              </button>
              <button
                className="primary"
                disabled={!changed.length || !eligible(u.target)}
                onClick={apply}
              >
                {l("Áp dụng", "Apply")} {changed.length}{" "}
                {l("thay đổi", "changes")}
              </button>
            </div>
          </>
        )}
        <dialog
          ref={inspector}
          className="work-inspector"
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const controls = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>(
                "button,input,select,textarea,a[href],[tabindex]",
              ),
            ).filter(
              (el) =>
                !el.hasAttribute("disabled") &&
                el.tabIndex >= 0 &&
                el.getClientRects().length,
            );
            const first = controls[0],
              last = controls.at(-1);
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }}
          aria-label={l("Chi tiết công việc", "Work details")}
          onCancel={(ev) => {
            ev.preventDefault();
            patch({ detail: "" });
            focusReturn();
          }}
        >
          <div className="work-inspector-header">
            <strong>
              {activeRow?.title ??
                (u.detail === "product"
                  ? l("Lộ trình sản phẩm", "Product roadmap")
                  : l("Thử nghiệm", "Experiments"))}
            </strong>
            <button
              aria-label={l("Đóng chi tiết", "Close details")}
              onClick={() => {
                patch({ detail: "" });
                focusReturn();
              }}
            >
              ×
            </button>
          </div>
          <div className="work-inspector-body">
            <div className="button-row">
              {activeRow && (
                <button onClick={() => assign(activeRow.id)}>
                  {l("Phân công", "Assignments")} →
                </button>
              )}
            </div>
            {activeRow?.c ? (
              p.renderContract(activeRow.c.id)
            ) : u.detail === "experiments" ||
              activeRow?.w.kind === "experiment" ? (
              <Experiments {...p} />
            ) : u.detail ? (
              <ProductWork
                key={u.detail}
                {...p}
                selected={activeRow?.w.featureId}
              />
            ) : null}
          </div>
          <div className="work-inspector-footer">
            <button
              onClick={() => {
                patch({ detail: "" });
                focusReturn();
              }}
            >
              {l("Về tổng quan", "Back to overview")}
            </button>
          </div>
        </dialog>
      </div>
    </SectionNavigation.Provider>
  );
}
