import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Scene, type Camera } from "./Scene";
import { makeFixture } from "./fixture";
import {
  title,
  navigateContext,
  places,
  seats,
  project,
  officePeople,
  type Context,
} from "./model";
import {
  PeoplePanel,
  FinancePanel,
  StrategyPanel,
  HistoryPanel,
  Inbox,
  type PanelProps,
} from "../../../src/ui/Panels";
import {
  MarketPanel,
  ProductWork,
  Experiments,
} from "../../../src/ui/BusinessPanels";
import { createWorkSession } from "../../../src/ui/workSession";
import { transition } from "../../../src/simulation/engine";
import { monthlyCosts, runway } from "../../../src/simulation/finance";
import { quality, capacity } from "../../../src/simulation/work";
import { ROLES, TRAITS, copy } from "../../../src/content/catalog";
import { Icon, Meter, money } from "../../../src/ui/common";
import type {
  Command,
  Copy,
  State,
  Strategy,
} from "../../../src/simulation/types";
import "../../../src/ui/style.css";
import "./style.css";
import { ProjectDossier } from "./ProjectDossier";

type Confirm = {
  title: Copy;
  body: Copy;
  command?: Command;
  action?: () => void;
  opener: HTMLElement | null;
};
const taskNames = {
  develop: "Phát triển",
  qa: "QA",
  fix: "Sửa lỗi",
  refactor: "Giảm nợ kỹ thuật",
  research: "Nghiên cứu",
  growth: "Tăng trưởng",
  support: "Hỗ trợ khách",
};

function App() {
  const [s, setState] = useState(() => makeFixture());
  const current = useRef(s);
  current.current = s;
  const [context, setContext] = useState<Context | null>(null);
  const [workSession, setWorkSession] = useState(createWorkSession);
  const [speed, setSpeed] = useState<0 | 1 | 2 | 4>(1);
  const [selected, setSelected] = useState("");
  const [camera, setCamera] = useState<Camera | null>(null);
  const [points, setPoints] = useState(true);
  const [scale, setScale] = useState("100");
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<Confirm | null>(null);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState("");
  const [snapshot, setSnapshot] = useState<State | null>(null);
  const [review, setReview] = useState(true);
  const sheet = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const confirmDialog = useRef<HTMLDialogElement>(null);
  const searchDialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  function dispatch(command: Command) {
    const result = transition(current.current, command);
    if (result.ok) {
      current.current = result.state;
      setState(result.state);
      if (command.type !== "tick")
        setMessage(
          command.type === "assignBatch"
            ? "Đã áp dụng phân công."
            : "Đã cập nhật công ty.",
        );
    } else setMessage(result.error?.vi ?? "Không thể thực hiện thao tác.");
    if (result.critical || result.state.status !== "playing") setSpeed(0);
    return result.ok;
  }
  useEffect(() => {
    let elapsed = 0,
      last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      if (!document.hidden) elapsed += Math.min(now - last, 1000) * speed;
      last = now;
      if (elapsed >= 5000) {
        elapsed -= 5000;
        dispatch({ type: "tick" });
      }
    }, 100);
    const hidden = () => {
      if (document.hidden) setSpeed(0);
      elapsed = 0;
      last = performance.now();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [speed]);
  useEffect(() => {
    document.documentElement.dataset.uiScale = scale;
    document.documentElement.style.fontSize = scale === "150" ? "21px" : "14px";
  }, [scale]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  function open(next: Context) {
    if (!context)
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement.closest(".find-dialog")
            ? document.querySelector<HTMLButtonElement>(".find-object")
            : document.activeElement
          : null;
    setWorkSession((prev) => ({ ...prev, detail: "" }));
    setContext(next);
    requestAnimationFrame(() =>
      sheet.current?.querySelector(".entity-body")?.scrollTo({ top: 0 }),
    );
    if (next.kind === "employee") setSelected(next.id);
    if (next.kind === "project")
      setWorkSession((prev) => ({
        ...prev,
        mode: "assignments",
        target: next.id,
      }));
  }
  function close() {
    setWorkSession((prev) => ({ ...prev, detail: "" }));
    setContext(null);
    requestAnimationFrame(() => {
      if (opener.current?.isConnected) opener.current.focus();
      else document.querySelector<HTMLButtonElement>(".find-object")?.focus();
    });
  }
  const navigate = (view: string) => {
    const next = navigateContext(view, current.current, selected);
    if (next) open(next);
    else close();
  };
  const ask: PanelProps["confirm"] = (a, b, command) => {
    setSpeed(0);
    setConfirmation({
      title: a,
      body: b,
      command,
      opener:
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null,
    });
  };
  const openAssignments: NonNullable<PanelProps["openAssignments"]> = (
    target,
    employee,
  ) => {
    const id =
      target ??
      (current.current.employees.find((e) => e.id === employee)?.assignments[0]
        ?.target ||
        workSession.target ||
        current.current.work.find(
          (w) =>
            w.kind !== "contract" ||
            current.current.contracts.some(
              (c) =>
                c.workId === w.id && ["signed", "accepted"].includes(c.stage),
            ),
        )?.id ||
        (current.current.product.exists ? "market" : ""));
    setWorkSession((prev) => ({
      ...prev,
      mode: "assignments",
      target: id,
      detail: "",
      employee: employee ?? "",
      ...(employee ? { employeeFilter: "all", employeeQuery: "" } : {}),
    }));
    open({ kind: "project", id });
  };
  const props: PanelProps = {
    s,
    locale: "vi",
    dispatch,
    confirm: ask,
    navigate,
    selected,
    select: setSelected,
    workSession,
    setWorkSession,
    openAssignments,
  };
  useEffect(() => {
    if (context?.kind === "project" && workSession.mode === "overview") {
      setContext({ kind: "projects" });
    }
  }, [context?.kind, workSession.mode]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(true);
        return;
      }
      if (event.key === "Escape" && !document.querySelector("dialog[open]"))
        close();
      if (
        event.code === "Space" &&
        !document.querySelector("dialog[open]") &&
        !(event.target as HTMLElement).closest("button,input,select,textarea")
      ) {
        event.preventDefault();
        setSpeed((v) => (v ? 0 : 1));
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    const el = confirmDialog.current;
    if (confirmation && !el?.open) el?.showModal();
    else if (!confirmation && el?.open) el.close();
  }, [confirmation]);
  useEffect(() => {
    const el = searchDialog.current;
    if (palette && !el?.open) {
      el?.showModal();
      el?.querySelector("input")?.focus();
    } else if (!palette && el?.open) el.close();
  }, [palette]);
  useLayoutEffect(() => {
    const el = sheet.current;
    if (!el) return;
    const report = () => {
      const r = el.getBoundingClientRect();
      const style = document.documentElement.style;
      style.setProperty("--detail-left", `${r.left + 8}px`);
      style.setProperty("--detail-top", `${r.top + 8}px`);
      style.setProperty("--detail-width", `${r.width - 16}px`);
      style.setProperty("--detail-height", `${r.height - 16}px`);
    };
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    closeButton.current?.focus();
    return () => observer.disconnect();
  }, [context?.kind, scale, review]);

  function switchFixture(strategy: Strategy) {
    setSpeed(0);
    setConfirmation({
      title: copy("Đổi tình huống review?", "Change review scenario"),
      body: copy(
        "Các thay đổi trong phiên này sẽ được thay bằng tình huống mẫu đã chọn.",
        "Resetting the review scenario discards current session changes.",
      ),
      action: () => {
        const next = makeFixture(strategy);
        current.current = next;
        setState(next);
        setContext(null);
        setSelected("");
        setSnapshot(null);
        setWorkSession(createWorkSession());
        setSpeed(1);
      },
      opener:
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null,
    });
  }
  function closeConfirm() {
    const trigger = confirmation?.opener;
    setConfirmation(null);
    requestAnimationFrame(() => {
      if (trigger?.isConnected) trigger.focus();
      else closeButton.current?.focus();
    });
  }
  const employed = s.employees.filter((e) => e.assignments.length).length;
  const active = s.work.filter((w) => w.status !== "released");
  const employee =
    context?.kind === "employee"
      ? s.employees.find((e) => e.id === context.id)
      : null;
  const live = s.events.filter((e) => !e.resolved);
  const contextTitle = context
    ? title(
        context.kind === "project"
          ? { kind: "project", id: workSession.target }
          : context,
        s,
      )
    : "";
  const strategies = {
    outsourcing: "Dịch vụ phần mềm",
    product: "Sản phẩm",
    startup: "Startup",
  };
  const choices: Array<{
    key: string;
    label: string;
    hint: string;
    context: Context;
  }> = [
    ...s.employees.map((e) => ({
      key: e.id,
      label: e.name,
      hint: ROLES[e.role].vi,
      context: { kind: "employee" as const, id: e.id },
    })),
    ...s.work
      .filter((w) => w.status !== "released")
      .map((w) => ({
        key: w.id,
        label: w.label.vi,
        hint: "Dự án / Phân công",
        context: { kind: "project" as const, id: w.id },
      })),
    ...places.map((p) => ({
      key: p.id,
      label: p.name,
      hint: "Địa điểm trong văn phòng",
      context: { kind: p.id } as Context,
    })),
    {
      key: "inbox",
      label: "Việc cần CEO quyết định",
      hint: "Tình huống & lượt CEO",
      context: { kind: "inbox" },
    },
    {
      key: "history",
      label: "Nhật ký công ty",
      hint: "Báo cáo & lịch sử",
      context: { kind: "history" },
    },
    {
      key: "session",
      label: "Lưu / tải phiên mẫu",
      hint: "Chỉ trong bộ nhớ",
      context: { kind: "session" },
    },
    {
      key: "settings",
      label: "Tùy chọn quan sát",
      hint: "UI & chuyển động",
      context: { kind: "settings" },
    },
  ];
  function choose(next: Context) {
    setPalette(false);
    setQuery("");
    open(next);
  }

  return (
    <div className="unified-root">
      {review && (
        <aside className="review-tools" aria-label="Điều khiển bản xem thử">
          <div>
            <strong>SIMULATE · BẢN THIẾT KẾ THỐNG NHẤT</strong>
            <span>Dữ liệu mẫu · Thao tác chỉ thay đổi phiên này</span>
          </div>
          <label>
            Tình huống{" "}
            <select
              aria-label="Tình huống công ty"
              value={s.strategy}
              onChange={(e) => switchFixture(e.target.value as Strategy)}
            >
              {Object.entries(strategies).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button onClick={() => setReview(false)}>Ẩn thanh review</button>
        </aside>
      )}
      <header className="unified-hud">
        <div className="identity-mark">
          <b>&lt;/&gt;</b>
          <div>
            <strong>SOFTWARE CEO</strong>
            <small>SIMULATE</small>
          </div>
        </div>
        <button
          className="hud-number cash"
          onClick={() => open({ kind: "finance" })}
        >
          <small>TIỀN MẶT</small>
          <strong>{money(s.cash, "vi")}</strong>
          <span>Vận hành: {money(monthlyCosts(s), "vi")}/tháng</span>
        </button>
        <button
          className="hud-number"
          onClick={() => open({ kind: "projects" })}
        >
          <small>
            {s.strategy === "product"
              ? "DOANH THU THUÊ BAO"
              : s.strategy === "startup"
                ? "THỜI GIAN DUY TRÌ"
                : "VIỆC CÒN LẠI"}
          </small>
          <strong>
            {s.strategy === "product"
              ? money(s.product.paid * s.product.price, "vi")
              : s.strategy === "startup"
                ? `${Number.isFinite(runway(s)) ? runway(s).toFixed(1) : "∞"} tháng`
                : `${Math.ceil(active.reduce((n, w) => n + Math.max(0, w.estimated - w.done), 0))} WP`}
          </strong>
          <span>{active.length} đầu việc đang theo dõi</span>
        </button>
        <button className="hud-number" onClick={() => open({ kind: "team" })}>
          <small>ĐỘI NGŨ</small>
          <strong>
            {s.employees.length} <em>đồng đội</em>
          </strong>
          <span>{employed} người đã được giao việc</span>
        </button>
        <button
          className="hud-number"
          onClick={() => open({ kind: "meeting" })}
        >
          <small>UY TÍN / LƯỢT CEO</small>
          <strong>
            {s.reputation}
            <em>/100 · {s.actions}/3</em>
          </strong>
          <span>{strategies[s.strategy]}</span>
        </button>
        <div className="utility-actions">
          <button
            aria-label="Lưu và tải phiên mẫu"
            onClick={() => open({ kind: "session" })}
          >
            <Icon name="save" />
          </button>
          <button
            aria-label="Tùy chọn quan sát"
            onClick={() => open({ kind: "settings" })}
          >
            <Icon name="settings" />
          </button>
          {!review && <button onClick={() => setReview(true)}>Review</button>}
        </div>
      </header>
      <main className="unified-scene" aria-label="Không gian Simulate">
        <Scene
          people={officePeople(s)}
          tier={s.officeTier}
          companyName={s.name}
          selected={selected}
          language="vi"
          paused={!speed}
          reducedMotion={reduced}
          onCameraChange={setCamera}
          onSelect={(id) => open({ kind: "employee", id })}
          onNavigate={navigate}
        />
        <div className="scene-toolbar">
          <div>
            <span className={`run-indicator ${speed ? "running" : ""}`} />
            <strong>{s.name}</strong>
            <span>
              THÁNG {Math.floor(s.day / 30) + 1} · NGÀY{" "}
              <b id="day-value">{s.day}</b>
            </span>
          </div>
          <button className="find-object" onClick={() => setPalette(true)}>
            <Icon name="people" />
            Tìm trong văn phòng <kbd>⌘ K</kbd>
          </button>
        </div>
        <div
          className="world-overlays"
          aria-label="Các điểm tương tác trong văn phòng"
        >
          {camera &&
            points &&
            places.map((p) => {
              const pos = project(camera, p.x, p.y, p.z);
              return (
                <button
                  key={p.id}
                  data-place={p.id}
                  className={`world-point point-${p.id} ${context?.kind === p.id ? "is-selected" : ""}`}
                  style={{ left: pos.x, top: pos.y }}
                  onClick={() => open({ kind: p.id } as Context)}
                >
                  <Icon name={p.icon} />
                  <span>{p.name}</span>
                  {p.id === "recruitment" && <b>{s.candidates.length}</b>}
                  {p.id === "projects" && <b>{active.length}</b>}
                </button>
              );
            })}
          {camera &&
            points &&
            s.employees.map((e, i) => {
              const seat = seats[i];
              if (!seat) return null;
              const pos = project(camera, seat.x, seat.y, 1.9);
              return (
                <button
                  key={e.id}
                  data-employee-point={e.id}
                  className={`person-point ${selected === e.id ? "is-selected" : ""}`}
                  style={{ left: pos.x, top: pos.y }}
                  onClick={() => open({ kind: "employee", id: e.id })}
                >
                  <span>{e.name.split(" ")[0]}</span>
                  <small>
                    {e.assignments.length
                      ? `${e.assignments.length} việc`
                      : "Chờ phân công"}
                  </small>
                </button>
              );
            })}
        </div>
        {!context && (
          <section
            className="attention-corner"
            aria-label="Việc đang cần chú ý"
          >
            <button
              className="attention-title"
              onClick={() => open({ kind: "inbox" })}
            >
              <span>CẦN CHÚ Ý</span>
              <b>{live.length + (s.employees.length - employed)}</b>
            </button>
            {s.employees.length > employed && (
              <button
                onClick={() =>
                  open({
                    kind: "employee",
                    id: s.employees.find((e) => !e.assignments.length)!.id,
                  })
                }
              >
                <i className="amber-dot" />
                <span>
                  <strong>
                    {s.employees.find((e) => !e.assignments.length)!.name} đang
                    chờ việc
                  </strong>
                  <small>Chọn đồng đội để phân công</small>
                </span>
                <b>↗</b>
              </button>
            )}
            <button onClick={() => open({ kind: "projects" })}>
              <i />
              <span>
                <strong>{active.length} đầu việc cần theo dõi</strong>
                <small>Tiến độ, QA và phân công</small>
              </span>
              <b>↗</b>
            </button>
          </section>
        )}
        {context && (
          <aside
            ref={sheet}
            className={`entity-sheet scope-${context.kind}`}
            aria-label={contextTitle}
          >
            <div className="entity-header">
              <div>
                <small>
                  {context.kind === "employee"
                    ? "ĐỒNG ĐỘI ĐANG CHỌN"
                    : context.kind === "project"
                      ? "HỒ SƠ DỰ ÁN"
                      : "TRONG VĂN PHÒNG"}
                </small>
                <h1>{contextTitle}</h1>
              </div>
              {context.kind === "project" && (
                <button
                  className="choose-project"
                  onClick={() => open({ kind: "projects" })}
                >
                  Đổi dự án
                </button>
              )}
              <button
                ref={closeButton}
                aria-label="Đóng thông tin"
                onClick={close}
              >
                ×
              </button>
            </div>
            <div className="entity-body">
              {employee && (
                <section className="person-context">
                  <div className="person-intro">
                    <div className="person-avatar">
                      {employee.name
                        .split(" ")
                        .map((v) => v[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <h2>{employee.name}</h2>
                      <p>
                        {ROLES[employee.role].vi} · Kỹ năng {employee.skill}/5
                      </p>
                    </div>
                  </div>
                  <div className="person-metrics">
                    <div>
                      <small>TINH THẦN · {Math.round(employee.morale)}%</small>
                      <Meter label="Tinh thần" value={employee.morale} />
                    </div>
                    <div>
                      <small>NĂNG LƯỢNG · {Math.round(employee.energy)}%</small>
                      <Meter label="Năng lượng" value={employee.energy} />
                    </div>
                    <div>
                      <small>LƯƠNG / THÁNG</small>
                      <strong>{money(employee.salary, "vi")}</strong>
                    </div>
                    <div>
                      <small>NĂNG LỰC ĐÃ PHÂN CÔNG</small>
                      <strong>
                        {employee.assignments
                          .reduce(
                            (n, a) =>
                              n +
                              capacity(s, employee, a) /
                                employee.assignments.length,
                            0,
                          )
                          .toFixed(1)}{" "}
                        WP/tuần
                      </strong>
                    </div>
                  </div>
                  {s.day - employee.hiredDay < 14 && (
                    <p className="rule-note">
                      Đang hòa nhập: năng suất tuần đầu 50%, tuần hai 75%.
                    </p>
                  )}
                  <h3>Công việc của {employee.name.split(" ")[0]}</h3>
                  {employee.assignments.length ? (
                    employee.assignments.map((a, i) => (
                      <button
                        className="assignment-link"
                        key={i}
                        onClick={() => openAssignments(a.target, employee.id)}
                      >
                        <span>
                          <strong>{taskNames[a.kind]}</strong>
                          <small>
                            {s.work.find((w) => w.id === a.target)?.label.vi ??
                              "Thị trường / Khách hàng"}
                          </small>
                        </span>
                        <span>Điều chỉnh ↗</span>
                      </button>
                    ))
                  ) : (
                    <p className="muted">Chưa được phân công.</p>
                  )}
                  <button
                    className="primary wide"
                    onClick={() => openAssignments(undefined, employee.id)}
                  >
                    Phân công cho {employee.name.split(" ")[0]} →
                  </button>
                  <p className="rule-note">
                    Tối đa hai việc. Hai việc chia đều thời gian và giảm tập
                    trung 15%.
                  </p>
                  <h3>Đặc điểm</h3>
                  {employee.traits.map((id) => (
                    <p key={id}>
                      <strong>{TRAITS[id]?.name.vi}</strong>
                      <br />
                      {TRAITS[id]?.description.vi}
                    </p>
                  ))}
                  <h3>Phát triển & đãi ngộ</h3>
                  <div className="person-actions">
                    <button
                      onClick={() =>
                        dispatch({ type: "train", employeeId: employee.id })
                      }
                    >
                      Đào tạo · $2.000
                    </button>
                    <button
                      onClick={() =>
                        ask(
                          copy("Tăng lương 10%?", "Raise salary by 10%?"),
                          copy(
                            "Tăng tinh thần 12. Chi phí lương tăng từ tháng này. Tốn 1 lượt CEO.",
                            "Morale +12. Payroll increases this month. Costs 1 CEO action.",
                          ),
                          { type: "raise", employeeId: employee.id },
                        )
                      }
                    >
                      Xem lại lương
                    </button>
                    <button
                      className="danger-text"
                      onClick={() =>
                        ask(
                          copy(
                            "Cho nhân viên thôi việc?",
                            "Dismiss this employee?",
                          ),
                          copy(
                            "Trả nửa tháng trợ cấp. Nhóm còn lại giảm 5 tinh thần.",
                            "Pay half a month of severance. Remaining team morale falls by 5.",
                          ),
                          { type: "dismiss", employeeId: employee.id },
                        )
                      }
                    >
                      Thôi việc
                    </button>
                  </div>
                </section>
              )}
              {context.kind === "employee" && !employee && (
                <p>
                  Nhân viên đã rời công ty.{" "}
                  <button onClick={() => open({ kind: "team" })}>
                    Xem đồng đội
                  </button>
                </p>
              )}
              {context.kind === "team" && (
                <div className="team-context">
                  {s.employees.map((e) => (
                    <button
                      className="team-person"
                      key={e.id}
                      onClick={() => open({ kind: "employee", id: e.id })}
                    >
                      <span className="person-avatar">
                        {e.name
                          .split(" ")
                          .map((v) => v[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <span>
                        <strong>{e.name}</strong>
                        <small>
                          {ROLES[e.role].vi} ·{" "}
                          {e.assignments.length
                            ? `${e.assignments.length} việc đang phụ trách`
                            : "Chưa phân công"}
                        </small>
                      </span>
                      <b>↗</b>
                    </button>
                  ))}
                  <button
                    className="wide"
                    onClick={() => open({ kind: "recruitment" })}
                  >
                    Đón ứng viên mới →
                  </button>
                </div>
              )}
              {context.kind === "projects" && (
                <div className="projects-context">
                  {s.work
                    .filter((w) => w.status !== "released")
                    .map((w) => {
                      const c = s.contracts.find((c) => c.workId === w.id);
                      return (
                        <article className="project-card" key={w.id}>
                          <span className="tag">
                            {c?.stage === "quoted"
                              ? "CHỜ KÝ"
                              : w.kind === "experiment"
                                ? "THỬ NGHIỆM"
                                : "ĐANG THỰC HIỆN"}
                          </span>
                          <h2>{w.label.vi}</h2>
                          <p>{c?.client ?? s.product.name.vi}</p>
                          <Meter
                            label="Tiến độ"
                            value={w.done}
                            max={Math.max(w.estimated, w.done + 1)}
                          />
                          <div className="project-values">
                            <span>
                              {w.done.toFixed(1)} / {w.estimated} WP
                            </span>
                            <span>
                              {w.qa > 0
                                ? `Chất lượng đã biết ${Math.round(quality(w))}%`
                                : "Chưa kiểm thử"}
                            </span>
                          </div>
                          <p>
                            {s.employees
                              .filter((e) =>
                                e.assignments.some((a) => a.target === w.id),
                              )
                              .map((e) => e.name.split(" ")[0])
                              .join(" · ") || "Chưa có người phụ trách"}
                          </p>
                          <button
                            className="primary wide"
                            onClick={() => openAssignments(w.id)}
                          >
                            Chọn dự án →
                          </button>
                        </article>
                      );
                    })}
                  {s.product.exists && <ProductWork {...props} />}
                  {(s.strategy === "startup" || s.secondary === "startup") && (
                    <Experiments {...props} />
                  )}
                </div>
              )}
              {context.kind === "project" && (
                <ProjectDossier
                  key={`${workSession.target}:${workSession.employee}`}
                  {...props}
                  workSession={workSession}
                  setWorkSession={setWorkSession}
                />
              )}
              {context.kind === "recruitment" && <PeoplePanel {...props} />}
              {context.kind === "customers" && <MarketPanel {...props} />}
              {context.kind === "finance" && <FinancePanel {...props} />}
              {context.kind === "meeting" && <StrategyPanel {...props} />}
              {context.kind === "history" && <HistoryPanel {...props} />}
              {context.kind === "inbox" && <Inbox {...props} />}
              {context.kind === "settings" && (
                <section className="settings-context">
                  <label>
                    Kích thước giao diện
                    <select
                      aria-label="Tỷ lệ UI"
                      value={scale}
                      onChange={(e) => setScale(e.target.value)}
                    >
                      <option value="100">100%</option>
                      <option value="150">150%</option>
                    </select>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={reduced}
                      onChange={(e) => setReduced(e.target.checked)}
                    />
                    Giảm chuyển động
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={points}
                      onChange={(e) => setPoints(e.target.checked)}
                    />
                    Hiện tên & điểm tương tác
                  </label>
                  <p>
                    Dùng phím mũi tên để kéo cảnh, + / − để phóng và 0 để căn
                    giữa.
                  </p>
                </section>
              )}
              {context.kind === "session" && (
                <section className="session-context">
                  <p>
                    Phiên xem thử dùng dữ liệu mẫu. Lưu và tải bên dưới chỉ có
                    hiệu lực đến khi đóng hoặc tải lại trang.
                  </p>
                  <button
                    className="primary wide"
                    onClick={() => {
                      setSnapshot(structuredClone(current.current));
                      setMessage("Đã lưu phiên mẫu trong bộ nhớ.");
                    }}
                  >
                    Lưu phiên mẫu
                  </button>
                  <button
                    className="wide"
                    disabled={!snapshot}
                    onClick={() => {
                      if (!snapshot) return;
                      setSpeed(0);
                      setConfirmation({
                        title: copy("Tải phiên mẫu?", "Load review snapshot?"),
                        body: copy(
                          "Các thay đổi sau lần lưu sẽ được thay thế bằng phiên mẫu đã lưu.",
                          "Changes since the snapshot will be replaced.",
                        ),
                        action: () => {
                          const next = structuredClone(snapshot);
                          current.current = next;
                          setState(next);
                          setWorkSession(createWorkSession());
                          setContext(null);
                          setSelected("");
                          setMessage("Đã tải phiên mẫu.");
                        },
                        opener:
                          document.activeElement instanceof HTMLElement
                            ? document.activeElement
                            : null,
                      });
                    }}
                  >
                    Tải phiên mẫu{snapshot ? ` · Ngày ${snapshot.day}` : ""}
                  </button>
                  <p className="rule-note">
                    Save thật của game không được đọc hoặc ghi trong bản xem
                    thử.
                  </p>
                </section>
              )}
            </div>
          </aside>
        )}
        <div className="world-help">
          <span>Chọn người hoặc địa điểm để điều hành công ty.</span>
          <button aria-pressed={points} onClick={() => setPoints((v) => !v)}>
            {points ? "Ẩn điểm tương tác" : "Hiện điểm tương tác"}
          </button>
        </div>
        <div className="time-controls" aria-label="Thời gian mô phỏng">
          <button
            aria-label={speed ? "Tạm dừng" : "Chạy mô phỏng"}
            onClick={() => setSpeed((v) => (v ? 0 : 1))}
          >
            {speed ? "Ⅱ" : "▶"}
          </button>
          {([1, 2, 4] as const).map((v) => (
            <button
              key={v}
              aria-pressed={speed === v}
              onClick={() => setSpeed(v)}
            >
              {v}×
            </button>
          ))}
          <button
            onClick={() => {
              setSpeed(0);
              dispatch({ type: "tick" });
            }}
          >
            Ngày tiếp →
          </button>
        </div>
      </main>
      <footer className="simulation-footer">
        <div>
          <span className={`run-indicator ${speed ? "running" : ""}`} />
          <strong>{speed ? "SIMULATE ĐANG CHẠY" : "SIMULATE TẠM DỪNG"}</strong>
        </div>
        <button onClick={() => open({ kind: "history" })}>
          <span>NGÀY {s.history.at(-1)?.day}</span>
          {s.history.at(-1)?.title.vi}
          <b>Nhật ký ↗</b>
        </button>
        <button onClick={() => open({ kind: "inbox" })}>
          {live.length
            ? `${live.length} tình huống cần theo dõi`
            : `${s.actions}/3 lượt CEO còn lại`}
          <b>Hộp thư ↗</b>
        </button>
      </footer>
      {message && (
        <div className="scene-message" role="status">
          {message}
          <button aria-label="Đóng thông báo" onClick={() => setMessage("")}>
            ×
          </button>
        </div>
      )}
      <dialog
        className="find-dialog"
        ref={searchDialog}
        onCancel={() => {
          setPalette(false);
          setQuery("");
        }}
      >
        <div className="find-heading">
          <h2>Tìm trong văn phòng</h2>
          <button aria-label="Đóng tìm kiếm" onClick={() => setPalette(false)}>
            ×
          </button>
        </div>
        <input
          aria-label="Tìm người, dự án hoặc địa điểm"
          placeholder="Tên đồng đội, dự án, tài chính…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="find-results">
          {choices
            .filter((c) =>
              (c.label + " " + c.hint)
                .toLocaleLowerCase("vi")
                .includes(query.toLocaleLowerCase("vi")),
            )
            .map((c) => (
              <button key={c.key} onClick={() => choose(c.context)}>
                <strong>{c.label}</strong>
                <small>{c.hint}</small>
                <span>↗</span>
              </button>
            ))}
        </div>
      </dialog>
      <dialog
        className="scene-confirm"
        ref={confirmDialog}
        onCancel={(event) => {
          event.preventDefault();
          closeConfirm();
        }}
      >
        {confirmation && (
          <>
            <h2>{confirmation.title.vi}</h2>
            <p>{confirmation.body.vi}</p>
            <div className="button-row">
              <button autoFocus onClick={closeConfirm}>
                Hủy
              </button>
              <button
                className="primary"
                onClick={() => {
                  if (confirmation.command) dispatch(confirmation.command);
                  confirmation.action?.();
                  closeConfirm();
                }}
              >
                Xác nhận
              </button>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
