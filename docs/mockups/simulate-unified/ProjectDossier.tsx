import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { PanelProps } from "../../../src/ui/Panels";
import type { AssignmentDraft, WorkSession } from "../../../src/ui/workSession";
import {
  makeDraft,
  draftAssignments,
  assignmentsEqual,
} from "../../../src/ui/workSession";
import { ROLES } from "../../../src/content/catalog";
import type { Employee, TaskKind } from "../../../src/simulation/types";
import { quality } from "../../../src/simulation/work";
import { deliveryForecast } from "../../../src/simulation/selectors";
import { Meter, money } from "../../../src/ui/common";
import { SectionNavigation } from "../../../src/ui/Management";
import { ProductWork, Experiments } from "../../../src/ui/BusinessPanels";
import { ContractDetail } from "./ContractDetail";
import {
  assignable,
  assignmentChanges,
  assignmentText,
  projectProgress,
  taskLabels,
} from "./projectView";
import "./project.css";

type Props = PanelProps & {
  workSession: WorkSession;
  setWorkSession: Dispatch<SetStateAction<WorkSession>>;
};
export function ProjectDossier(p: Props) {
  const { s, workSession: u, setWorkSession: setU } = p;
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
  const progress = w ? projectProgress(w) : null;
  const forecast = c ? deliveryForecast(s, c) : null;
  const eligible = assignable(s, target);
  const changes = assignmentChanges(s, u);
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
      e.name.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")),
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
  }, [editor, tab]);
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
          aria-label={`${e.name} ${label.toLocaleLowerCase("vi")}`}
          value={value}
          onChange={(event) => onChange(event.target.value as TaskKind | "")}
        >
          <option value="">Không giao / bỏ việc này</option>
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
              {ROLES[e.role].vi} · Kỹ năng {e.skill}/5
            </small>
          </div>
          <div className="dossier-person-job">
            <span>{assignmentText(s, e.assignments, target)}</span>
            <small>
              {e.assignments.length}/2 việc
              {e.assignments.length === 2 ? " · Giảm tập trung 15%" : ""}
              {dirty ? " · Có bản nháp" : ""}
            </small>
          </div>
          <button
            data-edit-person={e.id}
            aria-label={`Chỉnh phân công ${e.name}`}
            aria-expanded={expanded}
            onClick={() => (expanded ? closeEditor() : edit(e.id))}
          >
            {expanded ? "Thu gọn" : "Chỉnh"}
          </button>
        </div>
        {expanded && (
          <div
            className="dossier-editor"
            ref={editBody}
            aria-label={`Phân công ${e.name}`}
          >
            <p className="dossier-existing">
              Hiện tại: {assignmentText(s, e.assignments)}
            </p>
            <div className="dossier-edit-grid">
              {own.map(({ i }) => (
                <div key={i}>
                  {select(`Việc ${i + 1}`, d.slots[i], (value) =>
                    update(e, (old) => ({
                      ...old,
                      slots: old.slots.map((k, j) => (i === j ? value : k)),
                    })),
                  )}
                </div>
              ))}
              {(own.length === 0 || d.expected.length < 2 || d.addKind) &&
                select(
                  own.length ? "Thêm việc thứ hai" : "Việc trong dự án này",
                  d.addKind,
                  (value) => update(e, (old) => ({ ...old, addKind: value })),
                )}
              {d.addKind && (
                <label>
                  <span>Cách áp dụng</span>
                  <select
                    aria-label={`${e.name} cách áp dụng`}
                    value={d.mode}
                    onChange={(event) =>
                      update(e, (old) => ({ ...old, mode: event.target.value }))
                    }
                  >
                    <option value="add">
                      {d.expected.length ? "Thêm việc thứ hai" : "Giao việc"}
                    </option>
                    {d.expected.map((a, i) => (
                      <option key={i} value={String(i)}>
                        Thay việc {i + 1}: {assignmentText(s, [a])}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            {(conflict || invalid) && (
              <p role="alert" className="dossier-warning">
                {conflict
                  ? "Phân công đã đổi. Bỏ bản nháp của người này rồi soạn lại."
                  : "Tối đa hai việc, không giao trùng. Hãy chọn việc cần thay."}
              </p>
            )}
            <p className="dossier-draft-hint">
              {dirty
                ? "Chưa áp dụng. Xem trước thay đổi bên dưới."
                : "Chỉ sửa việc được chọn; giữ nguyên việc khác."}
            </p>
            <div className="dossier-editor-actions">
              {u.drafts[target]?.[e.id] && (
                <button onClick={() => discardRow(e.id)}>
                  Bỏ bản nháp của {e.name.split(" ")[0]}
                </button>
              )}
              <button onClick={closeEditor}>Xong bản nháp</button>
            </div>
          </div>
        )}
      </article>
    );
  }
  const tabs = [
    { id: "team", label: "Tiến độ & nhân sự" },
    { id: "contract", label: c ? "Hợp đồng" : "Chi tiết" },
    { id: "activity", label: "Hoạt động" },
  ];
  const history = s.history
    .filter((h) => h.cause === target || (!!c && h.cause === c.id))
    .slice(-20)
    .reverse();
  const stage = c
    ? {
        lead: "Cơ hội",
        qualified: "Đã làm rõ",
        quoted: "Chờ ký",
        signed: "Đã ký hợp đồng",
        accepted: "Đã nghiệm thu",
      }[c.stage]
    : target === "market"
      ? "Vận hành thị trường"
      : w?.status === "released"
        ? "Đã phát hành"
        : "Đang thực hiện";
  return (
    <SectionNavigation.Provider
      value={(section) => {
        if (section === "work-assignments") {
          selectTab("team");
          setPicking(true);
        } else p.navigate(section === "market-customers" ? "market" : "work");
      }}
    >
      <section className="project-dossier" aria-label="Hồ sơ dự án">
        <div className="dossier-meta">
          <span>
            {c?.client ??
              (target === "market" ? "Khách hàng & hỗ trợ" : s.product.name.vi)}
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
              Hạn: ngày {c.deadline} ·{" "}
              {c.stage === "accepted"
                ? "Đã giao"
                : s.day > c.deadline
                  ? `Trễ ${s.day - c.deadline} ngày`
                  : `Còn ${c.deadline - s.day} ngày`}
            </span>
          )}
        </div>
        <div
          className="dossier-tabs"
          role="tablist"
          aria-label="Nội dung dự án"
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
                <b>{changes.length}</b>
              )}
            </button>
          ))}
        </div>
        <div className="dossier-scroll" ref={body}>
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
                    aria-label="Tiến độ và chất lượng"
                  >
                    <div className="dossier-section-heading">
                      <h2>Tiến độ dự án</h2>
                      <span>
                        {progress.ready
                          ? "Đạt cổng chất lượng"
                          : progress.complete
                            ? "Đã xong phần thực hiện"
                            : "Đang triển khai"}
                      </span>
                    </div>
                    <div className="dossier-progress-row">
                      <div>
                        <strong>
                          {w.kind === "experiment"
                            ? "Nghiên cứu"
                            : "Phát triển"}
                        </strong>
                        <b>{progress.devLabel}</b>
                      </div>
                      <Meter
                        label={
                          w.kind === "experiment"
                            ? "Tiến độ nghiên cứu"
                            : "Tiến độ phát triển"
                        }
                        value={progress.devPercent}
                      />
                      <p>
                        {w.done.toFixed(1)} WP đã làm · {progress.scopeLabel}
                      </p>
                    </div>
                    {w.kind !== "experiment" && (
                      <div className="dossier-progress-row">
                        <div>
                          <strong>Kiểm thử</strong>
                          <b>{w.qa.toFixed(1)} WP đã QA</b>
                        </div>
                        <Meter
                          label="Tiến độ kiểm thử dự kiến"
                          value={progress.qaPercent}
                        />
                        <p>
                          {progress.qaLabel} ·{" "}
                          {w.discovered
                            ? "Theo phạm vi đã xác định"
                            : "Cập nhật khi làm rõ phạm vi"}
                        </p>
                      </div>
                    )}
                    {w.kind !== "experiment" && (
                      <div className="dossier-health">
                        <span>
                          <b>{progress.knownBugs}</b> lỗi đã biết
                          {progress.criticalBugs > 0
                            ? ` · ${progress.criticalBugs} nghiêm trọng`
                            : ""}
                        </span>
                        <span>
                          Chất lượng:{" "}
                          <b>
                            {w.qa > 0
                              ? `${Math.round(quality(w))}% đã biết`
                              : "Chưa kiểm thử"}
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
                            ? "Đã nghiệm thu"
                            : w.status === "released"
                              ? "Đã phát hành"
                              : !eligible
                                ? "Chưa thể triển khai"
                                : progress.ready
                                  ? "Đủ điều kiện chất lượng"
                                  : `Chưa sẵn sàng ${c ? "nghiệm thu" : "phát hành"}`}
                        </strong>
                        <span>
                          {!eligible
                            ? "Ký hợp đồng trước khi phân công."
                            : !progress.complete
                              ? "Còn phần thực hiện. Phát triển và QA có thể chạy song song."
                              : progress.criticalBugs
                                ? "Cần xử lý lỗi nghiêm trọng đã phát hiện."
                                : progress.ready
                                  ? "Xem chi tiết để thực hiện mốc giao hàng."
                                  : "Xem mức QA và chất lượng trước khi giao."}
                        </span>
                      </p>
                    )}
                    {forecast && (
                      <p className="dossier-forecast">
                        {forecast.maxDays === null
                          ? "Chưa đủ phân công để dự báo ngày giao."
                          : `Dự kiến còn ${forecast.minDays}–${forecast.maxDays} ngày theo phân công hiện tại.${forecast.late ? " Có nguy cơ trễ hạn." : ""}`}
                      </p>
                    )}
                  </section>
                )}
                {!w && (
                  <p className="dossier-empty">
                    {target === "market"
                      ? "Phân công nghiên cứu, tăng trưởng hoặc hỗ trợ khách hàng."
                      : "Đầu việc không còn tồn tại. Chọn dự án khác để tiếp tục."}
                  </p>
                )}
                {!eligible && (
                  <p className="dossier-warning">
                    Dự án chưa đủ điều kiện phân công. Xem mục{" "}
                    {c ? "Hợp đồng" : "Chi tiết"}.
                  </p>
                )}
                <section
                  className="dossier-team"
                  aria-label="Nhân sự đang tham gia"
                >
                  <div className="dossier-section-heading">
                    <h2>
                      Đang tham gia <span>{team.length}</span>
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
                      + Thêm nhân sự
                    </button>
                  </div>
                  {team.map(person)}
                  {!team.length && (
                    <p className="dossier-empty">
                      Chưa có người được phân công cho dự án này.
                    </p>
                  )}
                  {extra && person(extra)}
                  {picking && (
                    <div className="dossier-picker" aria-label="Chọn nhân sự">
                      <div className="dossier-section-heading">
                        <h3>Chọn người để soạn phân công</h3>
                        <button
                          onClick={() => {
                            setPicking(false);
                            addButton.current?.focus();
                          }}
                        >
                          Đóng danh sách
                        </button>
                      </div>
                      <div className="dossier-picker-filters">
                        <input
                          type="search"
                          aria-label="Tìm nhân sự để thêm"
                          placeholder="Tìm nhân viên…"
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
                          Chưa có việc
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
                              {ROLES[e.role].vi} · Kỹ năng {e.skill}/5
                            </small>
                          </strong>
                          <span>
                            {assignmentText(s, e.assignments)}
                            <small>
                              {e.assignments.length}/2 việc
                              {e.assignments.length === 2
                                ? " · Cần chọn việc để thay"
                                : ""}
                            </small>
                          </span>
                          <b>Chọn →</b>
                        </button>
                      ))}
                      {!candidates.length && (
                        <p className="dossier-empty">
                          Không có nhân viên phù hợp bộ lọc.
                        </p>
                      )}
                    </div>
                  )}
                </section>
                <section
                  className="dossier-planned"
                  aria-label="Dự kiến sau áp dụng"
                >
                  <div className="dossier-section-heading">
                    <h2>
                      Dự kiến sau áp dụng <span>{changes.length}</span>
                    </h2>
                  </div>
                  {!changes.length ? (
                    <p className="dossier-empty">
                      Chưa có thay đổi. Chọn Chỉnh hoặc Thêm nhân sự để soạn bản
                      nháp.
                    </p>
                  ) : (
                    <>
                      <p className="dossier-note">
                        Chưa có hiệu lực. Chỉ nút Áp dụng mới thay đổi phân
                        công.
                      </p>
                      {changes.map(
                        ({ employee: e, draft, next, conflict, invalid }) => (
                          <article className="dossier-change" key={e.id}>
                            <div>
                              <strong>{e.name}</strong>
                              <button
                                aria-label={`Chỉnh bản nháp ${e.name}`}
                                onClick={() => edit(e.id)}
                              >
                                Chỉnh
                              </button>
                              <button
                                aria-label={`Bỏ thay đổi ${e.name}`}
                                onClick={() => discardRow(e.id)}
                              >
                                Bỏ
                              </button>
                            </div>
                            <dl>
                              <div>
                                <dt>Hiện tại</dt>
                                <dd>{assignmentText(s, draft.expected)}</dd>
                              </div>
                              <div>
                                <dt>Sau áp dụng</dt>
                                <dd>{assignmentText(s, next)}</dd>
                              </div>
                            </dl>
                            {(conflict || invalid) && (
                              <p className="dossier-warning">
                                {conflict
                                  ? "Phân công đã đổi. Cần soạn lại bản nháp."
                                  : "Chưa hợp lệ: tối đa hai việc, không giao trùng."}
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
                    {showPast ? "Ẩn" : "Xem"} người đã tham gia{" "}
                    <span>Chưa có lịch sử</span>
                  </button>
                  {showPast && (
                    <p className="dossier-empty">
                      Chưa có dữ liệu lịch sử phân công theo từng người. Danh
                      sách đang tham gia chỉ phản ánh phân công hiện tại.
                    </p>
                  )}
                </section>
                <details className="dossier-rules">
                  <summary>Quy tắc phân công</summary>
                  <p>
                    Tối đa hai việc/người. Hai việc chia đều thời gian và giảm
                    tập trung 15%. Chỉ sửa việc được chọn; giữ nguyên việc khác.
                    Bản nháp giữ trong phiên và mất khi tải lại trang.
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
                        <small>Giá trị hợp đồng</small>
                        <strong>{money(c.price, "vi")}</strong>
                      </div>
                      <div>
                        <small>Cọc còn phân bổ</small>
                        <strong>{money(c.deposit, "vi")}</strong>
                      </div>
                      <div>
                        <small>Đã lập hóa đơn</small>
                        <strong>{money(c.invoiced, "vi")}</strong>
                      </div>
                      <div>
                        <small>Doanh thu ghi nhận</small>
                        <strong>{money(c.revenue, "vi")}</strong>
                      </div>
                    </div>
                    <ContractDetail {...p} contractId={c.id} />
                    <section className="dossier-invoices">
                      <h2>Hóa đơn của dự án</h2>
                      {s.invoices
                        .filter((i) => i.projectId === c.id)
                        .map((i) => (
                          <div key={i.id}>
                            <strong>{i.label.vi}</strong>
                            <span>
                              {money(i.amount, "vi")} ·{" "}
                              {i.paid
                                ? "Đã thu"
                                : `Chưa thu · hạn ngày ${i.due}`}
                            </span>
                          </div>
                        ))}
                      {!s.invoices.some((i) => i.projectId === c.id) && (
                        <p>Chưa có hóa đơn.</p>
                      )}
                      <button onClick={() => p.navigate("finance")}>
                        Xem thu tiền tại Bàn tài chính →
                      </button>
                    </section>
                  </>
                ) : w?.kind === "experiment" ? (
                  <Experiments {...p} selected={w.experimentId} />
                ) : s.product.exists ? (
                  <ProductWork {...p} selected={w?.featureId} />
                ) : (
                  <p>Chưa có chi tiết hợp đồng cho đầu việc này.</p>
                )}
              </div>
            )}
            {tab === "activity" && (
              <section className="dossier-activity">
                <h2>Hoạt động dự án</h2>
                <p className="dossier-note">
                  Các cập nhật đã được ghi nhận của dự án này.
                </p>
                {history.map((h) => (
                  <article key={h.id}>
                    <span>Ngày {h.day}</span>
                    <div>
                      <strong>{h.title.vi}</strong>
                      <p>{h.body.vi}</p>
                    </div>
                  </article>
                ))}
                {!history.length && (
                  <p className="dossier-empty">
                    Chưa có cập nhật riêng cho dự án này.
                  </p>
                )}
              </section>
            )}
          </div>
        </div>
        <footer className="dossier-apply" aria-label="Áp dụng phân công">
          <div role="status">
            <strong>{changes.length} thay đổi chưa áp dụng</strong>
            {changes.length > 0 && <small>Chỉ áp dụng cho dự án này</small>}
          </div>
          <button
            disabled={!Object.keys(u.drafts[target] ?? {}).length}
            onClick={discardAll}
          >
            Hủy
          </button>
          <button
            className="primary"
            disabled={
              !eligible ||
              !changes.length ||
              changes.some((row) => row.conflict || row.invalid)
            }
            onClick={apply}
          >
            Áp dụng{changes.length ? ` ${changes.length}` : ""}
          </button>
        </footer>
      </section>
    </SectionNavigation.Provider>
  );
}
