import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Office, type OfficePerson } from "../../../src/renderer/Office";
import {
  WorkPanel,
  PeoplePanel,
  type PanelProps,
} from "../../../src/ui/Panels";
import { createWorkSession } from "../../../src/ui/workSession";
import { transition } from "../../../src/simulation/engine";
import { monthlyCosts } from "../../../src/simulation/finance";
import { money, Icon } from "../../../src/ui/common";
import type { Command, Copy } from "../../../src/simulation/types";
import { makeFixture } from "./fixture";
import "../../../src/ui/style.css";
import "./style.css";

type View = "simulate" | "work" | "people";
type Confirmation = {
  title: Copy;
  body: Copy;
  command: Command;
  opener: HTMLElement | null;
};

function Mockup() {
  const [s, setState] = useState(makeFixture);
  const state = useRef(s);
  state.current = s;
  const [view, setView] = useState<View>("simulate");
  const [speed, setSpeed] = useState<0 | 1 | 2 | 4>(1);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const [workSession, setWorkSession] = useState(createWorkSession);
  const [selected, setSelected] = useState("");
  const [peopleKey, setPeopleKey] = useState(0);
  const [width, setWidth] = useState(50);
  const [scale, setScale] = useState("100");
  const [review, setReview] = useState(true);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const confirmDialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLElement>(null);
  const dock = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const previousView = useRef<View>(view);

  function dispatch(command: Command) {
    const result = transition(state.current, command);
    if (result.ok) {
      state.current = result.state;
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
    let accumulated = 0;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      if (!document.hidden && speedRef.current)
        accumulated += Math.min(now - last, 1000) * speedRef.current;
      last = now;
      if (accumulated >= 5000) {
        accumulated -= 5000;
        dispatch({ type: "tick" });
      }
    }, 100);
    const visibility = () => {
      if (document.hidden) setSpeed(0);
      accumulated = 0;
      last = performance.now();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [speed]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);
  useEffect(() => {
    document.documentElement.dataset.uiScale = scale;
    document.documentElement.style.fontSize = scale === "150" ? "21px" : "14px";
  }, [scale]);

  function navigate(next: string) {
    const target = next === "office" ? "simulate" : next;
    if (!["simulate", "work", "people"].includes(target)) {
      setMessage("Bản xem thử này gồm Simulate, Work và People.");
      return;
    }
    if (target === view) return;
    if (view === "simulate")
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    setWorkSession((prev) => ({ ...prev, detail: "" }));
    setView(target as View);
  }
  useLayoutEffect(() => {
    const update = () => {
      const rect = dock.current?.getBoundingClientRect();
      const area = stage.current?.getBoundingClientRect();
      if (!rect || !area) return;
      document.documentElement.style.setProperty(
        "--modal-left",
        `${rect.left + 12}px`,
      );
      document.documentElement.style.setProperty(
        "--modal-width",
        `${rect.width - 24}px`,
      );
      document.documentElement.style.setProperty(
        "--modal-top",
        `${area.top + 12}px`,
      );
      document.documentElement.style.setProperty(
        "--modal-height",
        `${area.height - 24}px`,
      );
    };
    update();
    const observer = new ResizeObserver(update);
    if (stage.current) observer.observe(stage.current);
    if (dock.current) observer.observe(dock.current);
    if (previousView.current !== view) {
      if (view === "simulate")
        (opener.current?.isConnected
          ? opener.current
          : document.querySelector<HTMLButtonElement>('[data-view="simulate"]')
        )?.focus();
      else closeButton.current?.focus();
    }
    previousView.current = view;
    return () => observer.disconnect();
  }, [view, width, scale, review]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.querySelector("dialog[open]"))
        navigate("simulate");
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [view]);
  useEffect(() => {
    const dialog = confirmDialog.current;
    if (confirmation && dialog && !dialog.open) dialog.showModal();
    else if (!confirmation && dialog?.open) dialog.close();
  }, [confirmation]);

  const ask: PanelProps["confirm"] = (title, body, command) => {
    setSpeed(0);
    setConfirmation({
      title,
      body,
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
    setWorkSession((prev) => ({
      ...prev,
      mode: "assignments",
      detail: "",
      target:
        target ??
        (prev.target ||
          s.work.find(
            (w) =>
              w.kind !== "contract" ||
              s.contracts.some(
                (c) =>
                  c.workId === w.id && ["signed", "accepted"].includes(c.stage),
              ),
          )?.id ||
          ""),
      employee: employee ?? "",
      ...(employee ? { employeeFilter: "all", employeeQuery: "" } : {}),
    }));
    navigate("work");
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
  const people: OfficePerson[] = s.employees.map((e) => {
    const active = e.assignments.find((a) => {
      const w = s.work.find((w) => w.id === a.target);
      if (!w) return false;
      if (a.kind === "develop") return w.status === "active";
      if (a.kind === "fix") return w.bugs.some((b) => b.known);
      if (a.kind === "refactor") return w.debt > 0;
      if (a.kind === "research") return w.status !== "released";
      return w.qa < w.actual * 0.2 || w.bugs.some((b) => !b.known);
    });
    return {
      id: e.id,
      name: e.name,
      role: e.role,
      appearance: e.appearance,
      working: !!active,
      taskKind: active?.kind,
      variant: e.variant,
      morale: e.morale,
      energy: e.energy,
    };
  });
  const currentWork = s.work.find(
    (w) => w.id === (workSession.target || s.work[0]?.id),
  );
  const employed = s.employees.filter((e) => e.assignments.length).length;
  const pending = Object.values(workSession.drafts).reduce(
    (sum, rows) => sum + Object.keys(rows).length,
    0,
  );
  const closeConfirm = () => {
    const trigger = confirmation?.opener;
    setConfirmation(null);
    requestAnimationFrame(() => {
      if (trigger?.isConnected) trigger.focus();
      else closeButton.current?.focus();
    });
  };

  return (
    <div className="prototype-root">
      {review && (
        <aside className="prototype-review" aria-label="Điều khiển bản xem thử">
          <div className="review-label">
            <strong>BẢN XEM THỬ</strong>
            <span>Dữ liệu minh họa · Chỉ thay đổi trong phiên này</span>
          </div>
          <nav aria-label="Ba trạng thái review">
            {(["simulate", "work", "people"] as View[]).map((v, i) => (
              <button
                key={v}
                data-review={v}
                aria-pressed={view === v}
                onClick={() => navigate(v)}
              >
                <span>0{i + 1}</span>{" "}
                {v === "simulate"
                  ? "Simulate"
                  : `Simulate + ${v === "work" ? "Work" : "People"}`}
              </button>
            ))}
          </nav>
          <label>
            UI{" "}
            <select
              aria-label="Tỷ lệ UI"
              value={scale}
              onChange={(e) => setScale(e.target.value)}
            >
              <option value="100">100%</option>
              <option value="150">150%</option>
            </select>
          </label>
          <label className="motion-toggle">
            <input
              type="checkbox"
              checked={reduced}
              onChange={(e) => setReduced(e.target.checked)}
            />
            Giảm chuyển động
          </label>
          <button aria-label="Ẩn thanh review" onClick={() => setReview(false)}>
            Ẩn
          </button>
        </aside>
      )}
      <div className="prototype-game">
        <header className="prototype-hud">
          <div className="prototype-brand">
            <b>&lt;/&gt;</b>
            <div>
              <strong>SOFTWARE CEO</strong>
              <small>BUILD · SHIP · SURVIVE</small>
            </div>
          </div>
          <div className="prototype-metric">
            <small>TIỀN MẶT</small>
            <strong className="cash">{money(s.cash, "vi")}</strong>
            <span>Chi phí / tháng: {money(monthlyCosts(s), "vi")}</span>
          </div>
          <div className="prototype-metric">
            <small>VIỆC CÒN LẠI</small>
            <strong>
              {Math.ceil(
                s.work
                  .filter((w) =>
                    s.contracts.some(
                      (c) => c.workId === w.id && c.stage === "signed",
                    ),
                  )
                  .reduce(
                    (sum, w) => sum + Math.max(0, w.estimated - w.done),
                    0,
                  ),
              )}{" "}
              <em>WP</em>
            </strong>
            <span>
              {s.contracts.filter((c) => c.stage === "signed").length} dự án
              đang làm
            </span>
          </div>
          <div className="prototype-metric">
            <small>TINH THẦN</small>
            <strong>
              {Math.round(
                s.employees.reduce((sum, e) => sum + e.morale, 0) /
                  Math.max(s.employees.length, 1),
              )}
              <em>%</em>
            </strong>
            <span>{s.employees.length} đồng đội</span>
          </div>
          <div className="prototype-metric">
            <small>UY TÍN</small>
            <strong>
              {s.reputation}
              <em>/100</em>
            </strong>
            <span>{s.actions}/3 lượt CEO</span>
          </div>
          {!review && (
            <button className="show-review" onClick={() => setReview(true)}>
              Review
            </button>
          )}
        </header>
        <div className="prototype-clock">
          <div>
            <i /> <strong>{s.name}</strong>
            <span>OUTSOURCING</span>
          </div>
          <div className="clock-controls">
            <span>
              THÁNG {Math.floor(s.day / 30) + 1} · NGÀY{" "}
              <b id="day-value">{s.day}</b>
            </span>
            <button
              aria-label={speed ? "Tạm dừng" : "Chạy mô phỏng"}
              onClick={() => setSpeed(speed ? 0 : 1)}
            >
              {speed ? "Ⅱ" : "▶"}
            </button>
            {([1, 2, 4] as const).map((n) => (
              <button
                key={n}
                aria-pressed={speed === n}
                onClick={() => setSpeed(n)}
              >
                {n}×
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
        </div>
        <main
          ref={stage}
          className={`prototype-stage ${view === "simulate" ? "scene-only" : "with-dock"}`}
          style={{ "--dock-size": `${width}%` } as React.CSSProperties}
        >
          <section className="prototype-world" aria-label="Simulate">
            <div className="world-topline">
              <span className="world-tag">
                <i /> {speed ? "ĐANG MÔ PHỎNG" : "TẠM DỪNG"}
              </span>
              <span className="world-caption">
                VĂN PHÒNG ĐẦU TIÊN · {s.employees.length}/5 CHỖ
              </span>
            </div>
            <Office
              people={people}
              tier={1}
              companyName={s.name}
              selected={selected}
              onSelect={(id) => {
                setSelected(id);
                setPeopleKey((n) => n + 1);
                navigate("people");
              }}
              onNavigate={navigate}
              language="vi"
              reducedMotion={reduced}
              paused={!speed}
            />
            <div className="world-bottom">
              <div>
                <span className="live-dot" />
                {employed}/{s.employees.length} người đã được giao việc
                <span className="world-help">
                  Chọn nhân viên để xem People · Chọn bảng để mở Work
                </span>
              </div>
              <div className="world-shortcuts">
                <button onClick={() => navigate("work")}>
                  <Icon name="work" />
                  Work
                </button>
                <button onClick={() => navigate("people")}>
                  <Icon name="people" />
                  People
                </button>
              </div>
            </div>
            <div className="scene-objective">
              <small>ĐANG THEO DÕI</small>
              <strong>{currentWork?.label.vi}</strong>
              <span>
                {currentWork?.done.toFixed(1)} / {currentWork?.estimated} WP ·
                QA {currentWork?.qa.toFixed(1)} WP
              </span>
              <button onClick={() => openAssignments(currentWork?.id)}>
                Mở phân công →
              </button>
            </div>
          </section>
          <aside
            ref={dock}
            className="prototype-dock"
            hidden={view === "simulate"}
            aria-label={view === "people" ? "Bảng People" : "Bảng Work"}
          >
            <header className="dock-header">
              <div>
                <Icon name={view === "work" ? "work" : "people"} />
                <strong>{view === "work" ? "Work" : "People"}</strong>
                <span>
                  {view === "work"
                    ? "Dự án & phân công"
                    : "Đội ngũ & tuyển dụng"}
                </span>
              </div>
              <button
                ref={closeButton}
                aria-label="Đóng bảng và về Simulate"
                onClick={() => navigate("simulate")}
              >
                ×
              </button>
            </header>
            <div className="dock-sizing">
              <span>
                VĂN PHÒNG + {view === "work" ? "CÔNG VIỆC" : "NHÂN SỰ"}
              </span>
              <label>
                Độ rộng bảng{" "}
                <input
                  aria-label="Độ rộng bảng"
                  type="range"
                  min="42"
                  max="60"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                />
              </label>
            </div>
            <div className="dock-content" hidden={view !== "work"}>
              <WorkPanel {...props} />
            </div>
            <div className="dock-content" hidden={view !== "people"}>
              <PeoplePanel key={peopleKey} {...props} />
            </div>
          </aside>
          <aside
            className="prototype-inbox"
            hidden={view !== "simulate"}
            aria-label="Hộp thư CEO"
          >
            <span className="eyebrow">HỘP THƯ CEO</span>
            <h2>Công ty đang tiến triển.</h2>
            <p>{s.actions}/3 lượt CEO còn lại trong tuần.</p>
            <article>
              <span className="tag amber">ĐỘI NGŨ</span>
              <h3>{s.employees.length - employed} người chưa được giao việc</h3>
              <p>Xem đội ngũ và chọn dự án phù hợp.</p>
              <button onClick={() => navigate("people")}>Mở People →</button>
            </article>
            <article>
              <span className="tag">CÔNG VIỆC</span>
              <h3>
                {s.contracts.filter((c) => c.stage === "signed").length} dự án
                đang thực hiện
              </h3>
              <p>Theo dõi tiến độ, phân công, QA và nghiệm thu.</p>
              <button onClick={() => navigate("work")}>Mở Work →</button>
            </article>
            <div className="inbox-latest">
              <small>TIN MỚI NHẤT · NGÀY {s.history.at(-1)?.day}</small>
              <p>{s.history.at(-1)?.title.vi}</p>
            </div>
          </aside>
        </main>
        <footer className="prototype-nav">
          <div className="nav-status">
            <i /> {speed ? "MÔ PHỎNG ĐANG CHẠY" : "MÔ PHỎNG TẠM DỪNG"}
          </div>
          <nav aria-label="Điều hành công ty">
            {(["simulate", "work", "people"] as View[]).map((v) => (
              <button
                key={v}
                data-view={v}
                aria-pressed={view === v}
                onClick={() => navigate(v)}
              >
                <Icon name={v === "simulate" ? "office" : v} />
                {v === "simulate"
                  ? "Simulate"
                  : v === "work"
                    ? "Work"
                    : "People"}
                {v === "work" && pending > 0 && (
                  <span className="pending-count">{pending}</span>
                )}
              </button>
            ))}
          </nav>
          <span className="nav-hint">
            {view === "simulate"
              ? "Kéo để di chuyển · Cuộn để phóng"
              : "Esc đóng bảng · Bản nháp được giữ"}
          </span>
        </footer>
      </div>
      {message && (
        <div className="prototype-message" role="status">
          {message}
          <button aria-label="Đóng thông báo" onClick={() => setMessage("")}>
            ×
          </button>
        </div>
      )}
      <dialog
        className="prototype-confirm"
        ref={confirmDialog}
        onCancel={(event) => {
          event.preventDefault();
          closeConfirm();
        }}
      >
        {confirmation && (
          <>
            <h2>{confirmation.title.vi}</h2>
            <p style={{ whiteSpace: "pre-line" }}>{confirmation.body.vi}</p>
            <div className="button-row">
              <button autoFocus onClick={closeConfirm}>
                Hủy
              </button>
              <button
                className="primary"
                onClick={() => {
                  dispatch(confirmation.command);
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

createRoot(document.getElementById("root")!).render(<Mockup />);
