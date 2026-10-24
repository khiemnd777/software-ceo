import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { PanelProps } from "./Panels";
import type { AssignmentDraft, WorkSession } from "./workSession";
import { makeDraft, draftAssignments, assignmentsEqual } from "./workSession";
import { ROLES } from "../content/catalog";
import type { Employee, TaskKind } from "../simulation/types";
import { quality } from "../simulation/work";
import { deliveryForecast } from "../simulation/selectors";
import { Meter, money } from "./common";
import { SectionNavigation } from "./Management";
import { ProductWork, Experiments } from "./BusinessPanels";
import { ContractDetail } from "./ContractDetail";
import {
  assignable,
  assignmentChanges,
  missingAssignmentDrafts,
  assignmentText,
  projectProgress,
  taskLabelsForLocale,
} from "./projectView";
import "./project-dossier.css";
type Props = PanelProps & {
  workSession: WorkSession;
  setWorkSession: Dispatch<SetStateAction<WorkSession>>;
};
export function ProjectDossier(p: Props) {
  const { s, locale, workSession: u, setWorkSession: setU } = p;
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  const taskLabels = taskLabelsForLocale(locale);
  const [tab, setTab] = useState("team");
  const [editor, setEditor] = useState(u.employee);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const editBody = useRef<HTMLDivElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const target = u.target;
  const w = s.work.find((w) => w.id === target);
  const c = s.contracts.find((c) => c.workId === target);
  const progress = w ? projectProgress(w, locale) : null;
  const forecast = c ? deliveryForecast(s, c) : null;
  const eligible = assignable(s, target);
  const changes = assignmentChanges(s, u);
  const missingDrafts = missingAssignmentDrafts(s, u);
  const team = s.employees.filter((e) =>
    e.assignments.some((a) => a.target === target),
  );
  const extra = s.employees.find(
    (e) => e.id === editor && !team.some((t) => t.id === e.id),
  );
  const candidates = s.employees.filter(
    (e) =>
      !team.some((t) => t.id === e.id) &&
      (!freeOnly || !e.assignments.length) &&
      e.name
        .toLocaleLowerCase(locale)
        .includes(query.toLocaleLowerCase(locale)),
  );
  const kinds = (Object.keys(taskLabels) as TaskKind[]).filter((k) =>
    target === "market"
      ? ["research", "growth", "support"].includes(k)
      : w?.kind === "experiment"
        ? k === "research"
        : k !== "support",
  );
  useEffect(() => {
    if (editor && tab === "team")
      requestAnimationFrame(() =>
        editBody.current?.querySelector<HTMLSelectElement>("select")?.focus(),
      );
  }, [editor]);
  useEffect(() => {
    if (picking)
      requestAnimationFrame(() =>
        body.current
          ?.querySelector<HTMLInputElement>(
            '.dossier-picker input[type="search"]',
          )
          ?.focus(),
      );
  }, [picking]);
  function selectTab(next: string) {
    setTab(next);
    body.current?.scrollTo({ top: 0 });
  }
  function edit(id: string) {
    setEditor(id);
    setPicking(false);
    selectTab("team");
  }
  function closeEditor() {
    const id = editor;
    setEditor("");
    requestAnimationFrame(() =>
      (
        document.querySelector<HTMLButtonElement>(
          `[data-edit-person="${CSS.escape(id)}"]`,
        ) ?? addButton.current
      )?.focus(),
    );
  }
  function update(
    e: Employee,
    change: (d: AssignmentDraft) => AssignmentDraft,
  ) {
    setU((prev) => ({
      ...prev,
      drafts: {
        ...prev.drafts,
        [target]: {
          ...prev.drafts[target],
          [e.id]: change(
            prev.drafts[target]?.[e.id] ?? makeDraft(e.assignments),
          ),
        },
      },
    }));
  }
  function discardRow(id: string) {
    setU((prev) => {
      const group = { ...prev.drafts[target] };
      delete group[id];
      return { ...prev, drafts: { ...prev.drafts, [target]: group } };
    });
  }
  function discardAll() {
    setU((prev) => {
      const drafts = { ...prev.drafts };
      delete drafts[target];
      return { ...prev, drafts };
    });
  }
  function apply() {
    if (
      p.dispatch({
        type: "assignBatch",
        changes: changes.map(({ employee, draft, next }) => ({
          employeeId: employee.id,
          expected: draft.expected,
          assignments: next,
        })),
      })
    ) {
      discardAll();
      setEditor("");
    }
  }
  function person(e: Employee) {
    const d = u.drafts[target]?.[e.id] ?? makeDraft(e.assignments);
    const own = d.expected
      .map((a, i) => ({ a, i }))
      .filter(({ a }) => a.target === target);
    const next = draftAssignments(d, target);
    const dirty = !assignmentsEqual(d.expected, next);
    const conflict =
      !!u.drafts[target]?.[e.id] &&
      !assignmentsEqual(e.assignments, d.expected);
    const invalid =
      next.length > 2 ||
      new Set(next.map((a) => `${a.target}:${a.kind}`)).size !== next.length;
    const expanded = editor === e.id;
    const select = (
      label: string,
      value: string,
      onChange: (kind: TaskKind | "") => void,
    ) => (
      <label>
        <span>{label}</span>
        <select
          disabled={!eligible}
          aria-label={`${e.name} ${label.toLocaleLowerCase(locale)}`}
          value={value}
          onChange={(event) => onChange(event.target.value as TaskKind | "")}
        >
          <option value="">
            {l("Không giao / bỏ việc này", "No assignment / remove this task")}
          </option>
          {kinds.map((k) => (
            <option key={k} value={k}>
              {taskLabels[k]}
            </option>
          ))}
        </select>
      </label>
    );
    return (
      <article
        className={`dossier-person ${expanded ? "expanded" : ""} ${dirty ? "has-draft" : ""}`}
        key={e.id}
      >
        <div className="dossier-person-line">
          <span className="dossier-avatar" aria-hidden="true">
            {e.name
              .split(" ")
              .map((v) => v[0])
              .slice(0, 2)
              .join("")}
          </span>
          <div>
            <strong>{e.name}</strong>
            <small>
              {ROLES[e.role][locale]}
              {l(" · Kỹ năng ", " · Skill ")} {e.skill}/5
            </small>
          </div>
          <div className="dossier-person-job">
            <span>{assignmentText(s, e.assignments, target, locale)}</span>
            <small>
              {e.assignments.length}
              {l("/2 việc", "/2 tasks")}
              {e.assignments.length === 2
                ? l(" · Giảm tập trung 15%", " · 15% focus penalty")
                : ""}
              {dirty ? l(" · Có bản nháp", " · Draft pending") : ""}
            </small>
          </div>
          <button
            data-edit-person={e.id}
            aria-label={
              locale === "vi"
                ? `Chỉnh phân công ${e.name}`
                : `Edit assignments for ${e.name}`
            }
            aria-expanded={expanded}
            onClick={() => (expanded ? closeEditor() : edit(e.id))}
          >
            {expanded ? l("Thu gọn", "Collapse") : l("Chỉnh", "Edit")}
          </button>
        </div>
        {expanded && (
          <div
            className="dossier-editor"
            ref={editBody}
            aria-label={
              locale === "vi"
                ? `Phân công ${e.name}`
                : `Assignments for ${e.name}`
            }
          >
            <p className="dossier-existing">
              {l("Hiện tại: ", "Current: ")}
              {assignmentText(s, e.assignments, undefined, locale)}
            </p>
            <div className="dossier-edit-grid">
              {own.map(({ i }) => (
                <div key={i}>
                  {select(
                    locale === "vi" ? `Việc ${i + 1}` : `Task ${i + 1}`,
                    d.slots[i],
                    (value) =>
                      update(e, (old) => ({
                        ...old,
                        slots: old.slots.map((k, j) => (i === j ? value : k)),
                      })),
                  )}
                </div>
              ))}
              {(own.length === 0 || d.expected.length < 2 || d.addKind) &&
                select(
                  own.length
                    ? l("Thêm việc thứ hai", "Add a second task")
                    : l("Việc trong dự án này", "Task in this project"),
                  d.addKind,
                  (value) => update(e, (old) => ({ ...old, addKind: value })),
                )}
              {d.addKind && (
                <label>
                  <span>{l("Cách áp dụng", "Apply mode")}</span>
                  <select
                    aria-label={
                      locale === "vi"
                        ? `${e.name} cách áp dụng`
                        : `${e.name} apply mode`
                    }
                    value={d.mode}
                    onChange={(event) =>
                      update(e, (old) => ({ ...old, mode: event.target.value }))
                    }
                  >
                    <option value="add">
                      {d.expected.length
                        ? l("Thêm việc thứ hai", "Add a second task")
                        : l("Giao việc", "Assign")}
                    </option>
                    {d.expected.map((a, i) => (
                      <option key={i} value={String(i)}>
                        {l("Thay việc ", "Replace task ")}
                        {i + 1}: {assignmentText(s, [a], undefined, locale)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            {(conflict || invalid) && (
              <p role="alert" className="dossier-warning">
                {conflict
                  ? l(
                      "Phân công đã đổi. Bỏ bản nháp của người này rồi soạn lại.",
                      "Assignments changed. Discard this person's draft and recreate it.",
                    )
                  : l(
                      "Tối đa hai việc, không giao trùng. Hãy chọn việc cần thay.",
                      "Maximum two tasks; no duplicates. Choose a task to replace.",
                    )}
              </p>
            )}
            <p className="dossier-draft-hint">
              {dirty
                ? l(
                    "Chưa áp dụng. Xem trước thay đổi bên dưới.",
                    "Not applied. Review the changes below.",
                  )
                : l(
                    "Chỉ sửa việc được chọn; giữ nguyên việc khác.",
                    "Edit the selected task; preserve other tasks.",
                  )}
            </p>
            <div className="dossier-editor-actions">
              {u.drafts[target]?.[e.id] && (
                <button onClick={() => discardRow(e.id)}>
                  {l("Bỏ bản nháp của ", "Discard draft for ")}
                  {e.name.split(" ")[0]}
                </button>
              )}
              <button onClick={closeEditor}>
                {l("Xong bản nháp", "Done editing")}
              </button>
            </div>
          </div>
        )}
      </article>
    );
  }
  const tabs = [
    {
      id: "team",
      label: l("Tiến độ & nhân sự", "Progress & team"),
    },
    {
      id: "contract",
      label: c ? l("Hợp đồng", "Contract") : l("Chi tiết", "Details"),
    },
    { id: "activity", label: l("Hoạt động", "Activity") },
  ];
  const history = s.history
    .filter((h) => h.cause === target || (!!c && h.cause === c.id))
    .slice(-20)
    .reverse();
  const stage = c
    ? {
        lead: l("Cơ hội", "Opportunity"),
        qualified: l("Đã làm rõ", "Qualified"),
        quoted: l("Chờ ký", "Awaiting signature"),
        signed: l("Đã ký hợp đồng", "Contract signed"),
        accepted: l("Đã nghiệm thu", "Accepted"),
      }[c.stage]
    : target === "market"
      ? l("Vận hành thị trường", "Market operations")
      : w?.status === "released"
        ? l("Đã phát hành", "Released")
        : l("Đang thực hiện", "In progress");
  return (
    <SectionNavigation.Provider
      value={(section) => {
        if (section === "work-assignments") {
          selectTab("team");
          setPicking(true);
        } else p.navigate(section === "market-customers" ? "market" : "work");
      }}
    >
      <section
        className="project-dossier"
        aria-label={l("Hồ sơ dự án", "Project dossier")}
      >
        <div className="dossier-meta">
          <span>
            {c?.client ??
              (target === "market"
                ? l("Khách hàng & hỗ trợ", "Customers & support")
                : s.product.name[locale])}
          </span>
          <span className="dossier-stage">{stage}</span>
          {c && (
            <span
              className={
                s.day > c.deadline && c.stage !== "accepted"
                  ? "dossier-late"
                  : ""
              }
            >
              {l("Hạn: ngày ", "Due: day ")}
              {c.deadline} ·{" "}
              {c.stage === "accepted"
                ? l("Đã giao", "Delivered")
                : s.day > c.deadline
                  ? locale === "vi"
                    ? `Trễ ${s.day - c.deadline} ngày`
                    : `Overdue by ${s.day - c.deadline} days`
                  : locale === "vi"
                    ? `Còn ${c.deadline - s.day} ngày`
                    : `Remaining: ${c.deadline - s.day} days`}
            </span>
          )}
        </div>
        <div
          className="dossier-tabs"
          role="tablist"
          aria-label={l("Nội dung dự án", "Project contents")}
        >
          {tabs.map((item, i) => (
            <button
              key={item.id}
              id={`project-tab-${item.id}`}
              role="tab"
              aria-selected={tab === item.id}
              aria-controls={`project-panel-${item.id}`}
              tabIndex={tab === item.id ? 0 : -1}
              onClick={() => selectTab(item.id)}
              onKeyDown={(event) => {
                if (
                  !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? tabs.length - 1
                      : (i +
                          (event.key === "ArrowRight" ? 1 : -1) +
                          tabs.length) %
                        tabs.length;
                selectTab(tabs[next].id);
                document
                  .getElementById(`project-tab-${tabs[next].id}`)
                  ?.focus();
              }}
            >
              {item.label}
              {item.id === "team" && changes.length > 0 && (
                <b aria-hidden="true">{changes.length}</b>
              )}
            </button>
          ))}
        </div>
        <div className="dossier-scroll" ref={body}>
          {missingDrafts.length > 0 && (
            <p role="alert" className="dossier-warning">
              {l(
                "Có nhân viên trong bản nháp đã rời công ty. Hủy bản nháp dự án này rồi soạn lại.",
                "A teammate in this draft has left the company. Discard this project's draft and recreate it.",
              )}
            </p>
          )}
          <div
            role="tabpanel"
            id={`project-panel-${tab}`}
            aria-labelledby={`project-tab-${tab}`}
          >
            {tab === "team" && (
              <>
                {w && progress && (
                  <section
                    className="dossier-progress"
                    aria-label={l(
                      "Tiến độ và chất lượng",
                      "Progress and quality",
                    )}
                  >
                    <div className="dossier-section-heading">
                      <h2>{l("Tiến độ dự án", "Project progress")}</h2>
                      <span>
                        {!eligible
                          ? l("Chờ ký hợp đồng", "Awaiting signature")
                          : progress.ready
                            ? l("Đạt cổng chất lượng", "Quality gate passed")
                            : progress.complete
                              ? l(
                                  "Đã xong phần thực hiện",
                                  "Implementation complete",
                                )
                              : l("Đang triển khai", "In progress")}
                      </span>
                    </div>
                    <div className="dossier-progress-row">
                      <div>
                        <strong>
                          {w.kind === "experiment"
                            ? l("Nghiên cứu", "Research")
                            : l("Phát triển", "Development")}
                        </strong>
                        <b>{progress.devLabel}</b>
                      </div>
                      <Meter
                        label={
                          w.kind === "experiment"
                            ? l("Tiến độ nghiên cứu", "Research progress")
                            : l("Tiến độ phát triển", "Development progress")
                        }
                        value={progress.devPercent}
                      />
                      <p>
                        {w.done.toFixed(1)}
                        {l(" WP đã làm · ", " WP completed · ")}{" "}
                        {progress.scopeLabel}
                      </p>
                    </div>
                    {w.kind !== "experiment" && (
                      <div className="dossier-progress-row">
                        <div>
                          <strong>{l("Kiểm thử", "Testing")}</strong>
                          <b>
                            {w.qa.toFixed(1)}
                            {l(" WP đã QA", " WP tested")}
                          </b>
                        </div>
                        <Meter
                          label={l(
                            "Tiến độ kiểm thử dự kiến",
                            "Estimated testing progress",
                          )}
                          value={progress.qaPercent}
                        />
                        <p>
                          {progress.qaLabel} ·{" "}
                          {w.discovered
                            ? l(
                                "Theo phạm vi đã xác định",
                                "Based on revealed scope",
                              )
                            : l(
                                "Cập nhật khi làm rõ phạm vi",
                                "Updates when scope is revealed",
                              )}
                        </p>
                      </div>
                    )}
                    {w.kind !== "experiment" && (
                      <div className="dossier-health">
                        <span>
                          <b>{progress.knownBugs}</b>
                          {l(" lỗi đã biết", " known defects")}
                          {progress.criticalBugs > 0
                            ? locale === "vi"
                              ? ` · ${progress.criticalBugs} nghiêm trọng`
                              : ` · ${progress.criticalBugs} critical`
                            : ""}
                        </span>
                        <span>
                          {l("Chất lượng:", "Quality:")}{" "}
                          <b>
                            {w.qa > 0
                              ? locale === "vi"
                                ? `${Math.round(quality(w))}% đã biết`
                                : `${Math.round(quality(w))}% known`
                              : l("Chưa kiểm thử", "Not tested")}
                          </b>
                        </span>
                      </div>
                    )}
                    {w.kind !== "experiment" && (
                      <p
                        className={`dossier-gate ${progress.ready ? "ready" : ""}`}
                      >
                        <strong>
                          {c?.stage === "accepted"
                            ? l("Đã nghiệm thu", "Accepted")
                            : w.status === "released"
                              ? l("Đã phát hành", "Released")
                              : !eligible
                                ? l(
                                    "Chưa thể triển khai",
                                    "Not eligible for work yet",
                                  )
                                : progress.ready
                                  ? l(
                                      "Đủ điều kiện chất lượng",
                                      "Quality gate passed",
                                    )
                                  : locale === "vi"
                                    ? `Chưa sẵn sàng ${c ? l("nghiệm thu", "acceptance") : l("phát hành", "release")}`
                                    : `Not ready for ${c ? l("nghiệm thu", "acceptance") : l("phát hành", "release")}`}
                        </strong>
                        <span>
                          {!eligible
                            ? l(
                                "Ký hợp đồng trước khi phân công.",
                                "Sign the contract before assigning work.",
                              )
                            : !progress.complete
                              ? l(
                                  "Còn phần thực hiện. Phát triển và QA có thể chạy song song.",
                                  "Implementation remains. Development and testing can run in parallel.",
                                )
                              : progress.criticalBugs
                                ? l(
                                    "Cần xử lý lỗi nghiêm trọng đã phát hiện.",
                                    "Fix the known critical defects.",
                                  )
                                : progress.ready
                                  ? l(
                                      "Xem chi tiết để thực hiện mốc giao hàng.",
                                      "Open details to complete the delivery milestone.",
                                    )
                                  : l(
                                      "Xem mức QA và chất lượng trước khi giao.",
                                      "Review testing and quality before delivery.",
                                    )}
                        </span>
                      </p>
                    )}
                    {forecast && (
                      <p className="dossier-forecast">
                        {forecast.maxDays === null
                          ? l(
                              "Chưa đủ phân công để dự báo ngày giao.",
                              "Assign the remaining work to get a delivery forecast.",
                            )
                          : locale === "vi"
                            ? `Dự kiến còn ${forecast.minDays}–${forecast.maxDays} ngày theo phân công hiện tại.${forecast.late ? l(" Có nguy cơ trễ hạn.", " Delivery is at risk.") : ""}`
                            : `Estimated time remaining: ${forecast.minDays}–${forecast.maxDays} days with current assignments.${forecast.late ? l(" Có nguy cơ trễ hạn.", " Delivery is at risk.") : ""}`}
                      </p>
                    )}
                  </section>
                )}
                {!w && (
                  <p className="dossier-empty">
                    {target === "market"
                      ? l(
                          "Phân công nghiên cứu, tăng trưởng hoặc hỗ trợ khách hàng.",
                          "Assign research, growth or customer support.",
                        )
                      : l(
                          "Đầu việc không còn tồn tại. Chọn dự án khác để tiếp tục.",
                          "This work item no longer exists. Select another project.",
                        )}
                  </p>
                )}
                {!eligible && (
                  <p className="dossier-warning">
                    {l(
                      "Dự án chưa đủ điều kiện phân công. Xem mục",
                      "This project is not eligible for assignments. Open",
                    )}{" "}
                    {c ? l("Hợp đồng", "Contract") : l("Chi tiết", "Details")}.
                  </p>
                )}
                <section
                  className="dossier-team"
                  aria-label={l(
                    "Nhân sự đang tham gia",
                    "Current project team",
                  )}
                >
                  <div className="dossier-section-heading">
                    <h2>
                      {l("Đang tham gia ", "Currently assigned ")}
                      <span>{team.length}</span>
                    </h2>
                    <button
                      ref={addButton}
                      onClick={() => {
                        setPicking((v) => !v);
                        setEditor("");
                      }}
                      disabled={!eligible}
                      aria-expanded={picking}
                    >
                      {l("+ Thêm nhân sự", "+ Add teammate")}
                    </button>
                  </div>
                  {team.map(person)}
                  {!team.length && (
                    <p className="dossier-empty">
                      {l(
                        "Chưa có người được phân công cho dự án này.",
                        "Nobody is assigned to this project yet.",
                      )}
                    </p>
                  )}
                  {extra && person(extra)}
                  {picking && (
                    <div
                      className="dossier-picker"
                      aria-label={l("Chọn nhân sự", "Select teammate")}
                    >
                      <div className="dossier-section-heading">
                        <h3>
                          {l(
                            "Chọn người để soạn phân công",
                            "Choose a teammate to edit assignments",
                          )}
                        </h3>
                        <button
                          onClick={() => {
                            setPicking(false);
                            addButton.current?.focus();
                          }}
                        >
                          {l("Đóng danh sách", "Close list")}
                        </button>
                      </div>
                      <div className="dossier-picker-filters">
                        <input
                          type="search"
                          aria-label={l(
                            "Tìm nhân sự để thêm",
                            "Find a teammate to add",
                          )}
                          placeholder={l("Tìm nhân viên…", "Find teammate…")}
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                        />
                        <label>
                          <input
                            type="checkbox"
                            checked={freeOnly}
                            onChange={(event) =>
                              setFreeOnly(event.target.checked)
                            }
                          />
                          {l("Chưa có việc", "Unassigned only")}
                        </label>
                      </div>
                      {candidates.map((e) => (
                        <button
                          className="dossier-candidate"
                          key={e.id}
                          onClick={() => edit(e.id)}
                        >
                          <strong>
                            {e.name}
                            <small>
                              {ROLES[e.role][locale]}
                              {l(" · Kỹ năng ", " · Skill ")} {e.skill}/5
                            </small>
                          </strong>
                          <span>
                            {assignmentText(
                              s,
                              e.assignments,
                              undefined,
                              locale,
                            )}
                            <small>
                              {e.assignments.length}
                              {l("/2 việc", "/2 tasks")}
                              {e.assignments.length === 2
                                ? l(
                                    " · Cần chọn việc để thay",
                                    " · Choose a task to replace",
                                  )
                                : ""}
                            </small>
                          </span>
                          <b>{l("Chọn →", "Select →")}</b>
                        </button>
                      ))}
                      {!candidates.length && (
                        <p className="dossier-empty">
                          {l(
                            "Không có nhân viên phù hợp bộ lọc.",
                            "No teammates match these filters.",
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </section>
                <section
                  className="dossier-planned"
                  aria-label={l(
                    "Dự kiến sau áp dụng",
                    "After applying changes",
                  )}
                >
                  <div className="dossier-section-heading">
                    <h2>
                      {l("Dự kiến sau áp dụng ", "After applying changes ")}
                      <span>{changes.length}</span>
                    </h2>
                  </div>
                  {!changes.length ? (
                    <p className="dossier-empty">
                      {l(
                        "Chưa có thay đổi. Chọn Chỉnh hoặc Thêm nhân sự để soạn bản nháp.",
                        "No changes yet. Choose Edit or Add teammate to create a draft.",
                      )}
                    </p>
                  ) : (
                    <>
                      <p className="dossier-note">
                        {l(
                          "Chưa có hiệu lực. Chỉ nút Áp dụng mới thay đổi phân công.",
                          "Not active yet. Only Apply changes the actual assignments.",
                        )}
                      </p>
                      {changes.map(
                        ({ employee: e, draft, next, conflict, invalid }) => (
                          <article className="dossier-change" key={e.id}>
                            <div>
                              <strong>{e.name}</strong>
                              <button
                                aria-label={
                                  locale === "vi"
                                    ? `Chỉnh bản nháp ${e.name}`
                                    : `Edit draft for ${e.name}`
                                }
                                onClick={() => edit(e.id)}
                              >
                                {l("Chỉnh", "Edit")}
                              </button>
                              <button
                                aria-label={
                                  locale === "vi"
                                    ? `Bỏ thay đổi ${e.name}`
                                    : `Discard changes for ${e.name}`
                                }
                                onClick={() => discardRow(e.id)}
                              >
                                {l("Bỏ", "Discard")}
                              </button>
                            </div>
                            <dl>
                              <div>
                                <dt>{l("Hiện tại", "Current")}</dt>
                                <dd>
                                  {assignmentText(
                                    s,
                                    draft.expected,
                                    undefined,
                                    locale,
                                  )}
                                </dd>
                              </div>
                              <div>
                                <dt>{l("Sau áp dụng", "After applying")}</dt>
                                <dd>
                                  {assignmentText(s, next, undefined, locale)}
                                </dd>
                              </div>
                            </dl>
                            {(conflict || invalid) && (
                              <p className="dossier-warning">
                                {conflict
                                  ? l(
                                      "Phân công đã đổi. Cần soạn lại bản nháp.",
                                      "Assignments changed. Recreate this draft.",
                                    )
                                  : l(
                                      "Chưa hợp lệ: tối đa hai việc, không giao trùng.",
                                      "Invalid draft: maximum two tasks, no duplicates.",
                                    )}
                              </p>
                            )}
                          </article>
                        ),
                      )}
                    </>
                  )}
                </section>
                <section className="dossier-past">
                  <button
                    aria-expanded={showPast}
                    onClick={() => setShowPast((v) => !v)}
                  >
                    {showPast ? l("Ẩn", "Hide") : l("Xem", "View")}
                    {l(" người đã tham gia", " past contributors")}{" "}
                    <span>{l("Chưa có lịch sử", "History unavailable")}</span>
                  </button>
                  {showPast && (
                    <p className="dossier-empty">
                      {l(
                        "Chưa có dữ liệu lịch sử phân công theo từng người. Danh sách đang tham gia chỉ phản ánh phân công hiện tại.",
                        "Per-person assignment history is unavailable. The current team reflects active assignments only.",
                      )}
                    </p>
                  )}
                </section>
                <details className="dossier-rules">
                  <summary>
                    {l("Quy tắc phân công", "Assignment rules")}
                  </summary>
                  <p>
                    {l(
                      "Tối đa hai việc/người. Hai việc chia đều thời gian và giảm tập trung 15%. Chỉ sửa việc được chọn; giữ nguyên việc khác. Bản nháp giữ trong phiên và mất khi tải lại trang.",
                      "Maximum two tasks per person. Two tasks split time equally and reduce focus by 15%. Preserve other assignments. Drafts stay in this session and are discarded on reload.",
                    )}
                  </p>
                </details>
              </>
            )}
            {tab === "contract" && (
              <div className="dossier-contract">
                {c ? (
                  <>
                    <div className="dossier-money">
                      <div>
                        <small>{l("Giá trị hợp đồng", "Contract value")}</small>
                        <strong>{money(c.price, locale)}</strong>
                      </div>
                      <div>
                        <small>
                          {l("Cọc còn phân bổ", "Unrecognized deposit")}
                        </small>
                        <strong>{money(c.deposit, locale)}</strong>
                      </div>
                      <div>
                        <small>{l("Đã lập hóa đơn", "Invoiced")}</small>
                        <strong>{money(c.invoiced, locale)}</strong>
                      </div>
                      <div>
                        <small>
                          {l("Doanh thu ghi nhận", "Recognized revenue")}
                        </small>
                        <strong>{money(c.revenue, locale)}</strong>
                      </div>
                    </div>
                    <ContractDetail {...p} contractId={c.id} />
                    <section className="dossier-invoices">
                      <h2>{l("Hóa đơn của dự án", "Project invoices")}</h2>
                      {s.invoices
                        .filter((i) => i.projectId === c.id)
                        .map((i) => (
                          <div key={i.id}>
                            <strong>{i.label[locale]}</strong>
                            <span>
                              {money(i.amount, locale)} ·{" "}
                              {i.paid
                                ? l("Đã thu", "Collected")
                                : locale === "vi"
                                  ? `Chưa thu · hạn ngày ${i.due}`
                                  : `Unpaid · due day ${i.due}`}
                            </span>
                          </div>
                        ))}
                      {!s.invoices.some((i) => i.projectId === c.id) && (
                        <p>{l("Chưa có hóa đơn.", "No invoices yet.")}</p>
                      )}
                      <button onClick={() => p.navigate("finance")}>
                        {l(
                          "Xem thu tiền tại Bàn tài chính →",
                          "Review collections at the Finance desk →",
                        )}
                      </button>
                    </section>
                  </>
                ) : w?.kind === "experiment" ? (
                  <Experiments {...p} selected={w.experimentId} />
                ) : s.product.exists ? (
                  <ProductWork {...p} selected={w?.featureId} />
                ) : (
                  <p>
                    {l(
                      "Chưa có chi tiết hợp đồng cho đầu việc này.",
                      "No contract details are available for this work item.",
                    )}
                  </p>
                )}
              </div>
            )}
            {tab === "activity" && (
              <section className="dossier-activity">
                <h2>{l("Hoạt động dự án", "Project activity")}</h2>
                <p className="dossier-note">
                  {l(
                    "Các cập nhật đã được ghi nhận của dự án này.",
                    "Recorded updates for this project.",
                  )}
                </p>
                {history.map((h) => (
                  <article key={h.id}>
                    <span>
                      {l("Ngày ", "Day ")} {h.day}
                    </span>
                    <div>
                      <strong>{h.title[locale]}</strong>
                      <p>{h.body[locale]}</p>
                    </div>
                  </article>
                ))}
                {!history.length && (
                  <p className="dossier-empty">
                    {l(
                      "Chưa có cập nhật riêng cho dự án này.",
                      "No updates have been recorded for this project yet.",
                    )}
                  </p>
                )}
              </section>
            )}
          </div>
        </div>
        <footer
          className="dossier-apply"
          aria-label={l("Áp dụng phân công", "Apply assignments")}
        >
          <div role="status">
            <strong>
              {changes.length}
              {l(" thay đổi chưa áp dụng", " unapplied changes")}
            </strong>
            {changes.length > 0 && (
              <small>
                {l("Chỉ áp dụng cho dự án này", "Applies to this project only")}
              </small>
            )}
          </div>
          <button
            disabled={!Object.keys(u.drafts[target] ?? {}).length}
            onClick={discardAll}
          >
            {l("Hủy", "Discard")}
          </button>
          <button
            className="primary"
            disabled={
              !eligible ||
              !changes.length ||
              changes.some((row) => row.conflict || row.invalid) ||
              missingDrafts.length > 0
            }
            onClick={apply}
          >
            {l("Áp dụng", "Apply")}
            {changes.length ? ` ${changes.length}` : ""}
          </button>
        </footer>
      </section>
    </SectionNavigation.Provider>
  );
}
