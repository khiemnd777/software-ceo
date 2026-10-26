import { clockLabel, phaseAt, nextWorkSteps } from "../simulation/clock";
import { weatherForDay } from "../renderer/lighting/weatherTimeline";
import { WEATHER } from "../renderer/lighting/outdoorWeather";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction, RefObject } from "react";
import { Office, type Camera } from "../renderer/Office";
import {
  placeOfficeLabel,
  officeStatus,
  type OverlayHit,
} from "../renderer/officeOverlay";
import {
  title,
  visibleProjects,
  navigateContext,
  placeName,
  places,
  seats,
  project,
  officePeople,
  type Context,
} from "./simulateModel";
import {
  PeoplePanel,
  FinancePanel,
  StrategyPanel,
  HistoryPanel,
  Inbox,
  type PanelProps,
} from "./Panels";
import { MarketPanel, ProductWork, Experiments } from "./BusinessPanels";
import { monthlyCosts, runway } from "../simulation/finance";
import { quality, capacity } from "../simulation/work";
import { ROLES, TRAITS, copy } from "../content/catalog";
import { Icon, Meter, money } from "./common";
import type { WorkSession } from "./workSession";
import { ProjectDossier } from "./ProjectDossier";
import { Tutorial } from "./Tutorial";
import { TooltipButton } from "./TooltipButton";
import "./simulate.css";
type Props = {
  visualTime: RefObject<{ minute: number; weatherSeconds: number }>;
  sessionKey: number;
  panel: PanelProps & {
    workSession: WorkSession;
    setWorkSession: Dispatch<SetStateAction<WorkSession>>;
  };
  speed: 0 | 1 | 2 | 4;
  setSpeed: (speed: 0 | 1 | 2 | 4) => void;
  motion: boolean;
  view: string;
  onViewChange: (view: string) => void;
  onSave: () => void;
  onSettings: () => void;
  onLocale: () => void;
};
function logicalView(context: Context | null) {
  if (!context) return "office";
  return {
    employee: "people",
    team: "people",
    recruitment: "people",
    project: "work",
    projects: "work",
    customers: "market",
    finance: "finance",
    meeting: "strategy",
    history: "history",
    inbox: "office",
    session: "office",
    settings: "office",
  }[context.kind];
}
export function SimulateWorkspace({
  visualTime,
  sessionKey,
  panel,
  speed,
  setSpeed,
  motion,
  view,
  onViewChange,
  onSave,
  onSettings,
  onLocale,
}: Props) {
  const {
    s,
    locale,
    dispatch,
    confirm: ask,
    workSession,
    setWorkSession,
    selected = "",
  } = panel;
  const setSelected = (id: string) => panel.select?.(id);
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  const current = useRef(s);
  current.current = s;
  const [context, setContext] = useState<Context | null>(null);
  const contextRef = useRef(context);
  contextRef.current = context;
  const lastView = useRef("office");
  const [camera, setCamera] = useState<Camera | null>(null);
  const [points, setPoints] = useState(true);
  const worldOverlays = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!camera || !worldOverlays.current) return;
    const occupied: OverlayHit[] = [];
    const buttons = [
      ...worldOverlays.current.querySelectorAll<HTMLButtonElement>("button"),
    ];
    buttons.sort(
      (a, b) =>
        Number(b.classList.contains("is-selected")) -
        Number(a.classList.contains("is-selected")),
    );
    for (const button of buttons) {
      const x = Number(button.dataset.anchorX),
        y = Number(button.dataset.anchorY);
      // An off-screen destination remains available through the office finder.
      button.hidden =
        button.dataset.away === "true" ||
        x < 0 ||
        x > camera.width ||
        y < 0 ||
        y > camera.height;
      if (button.hidden) continue;
      const width = button.offsetWidth,
        height = button.offsetHeight;
      const box = placeOfficeLabel(
        {
          id: button.dataset.place ?? button.dataset.employeePoint ?? "",
          x: x - width / 2,
          y: y - height,
          width,
          height,
        },
        occupied,
        camera.width,
        camera.height,
      );
      occupied.push(box);
      button.style.transform = "none";
      button.style.left = `${box.x}px`;
      button.style.top = `${box.y}px`;
    }
  }, [camera, points, locale, selected, s]);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState("");
  const sheet = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const searchDialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    setContext(null);
    setPalette(false);
    setQuery("");
    lastView.current = "office";
  }, [sessionKey]);
  const taskNames = {
    develop: l("Phát triển", "Development"),
    qa: l("Kiểm thử", "Testing"),
    fix: l("Sửa lỗi", "Fix defects"),
    refactor: l("Giảm nợ kỹ thuật", "Reduce technical debt"),
    research: l("Nghiên cứu", "Research"),
    growth: l("Tăng trưởng", "Growth"),
    support: l("Hỗ trợ khách", "Customer support"),
  };
  function open(next: Context) {
    if (next.kind === "session") {
      onSave();
      return;
    }
    if (next.kind === "settings") {
      onSettings();
      return;
    }
    if (!contextRef.current)
      opener.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement.closest(".find-dialog")
            ? document.querySelector<HTMLButtonElement>(".find-object")
            : document.activeElement
          : null;
    setContext(next);
    setWorkSession((prev) => ({
      ...prev,
      detail: "",
      ...(next.kind === "project"
        ? { mode: "assignments" as const, target: next.id }
        : {}),
    }));
    if (next.kind === "employee") setSelected(next.id);
    lastView.current = logicalView(next);
    onViewChange(lastView.current);
    requestAnimationFrame(() =>
      sheet.current?.querySelector(".entity-body")?.scrollTo({ top: 0 }),
    );
  }
  function close() {
    setContext(null);
    setWorkSession((prev) => ({ ...prev, detail: "" }));
    lastView.current = "office";
    onViewChange("office");
    requestAnimationFrame(() => {
      if (opener.current?.isConnected) opener.current.focus();
      else document.querySelector<HTMLButtonElement>(".find-object")?.focus();
    });
  }
  function navigate(nextView: string) {
    const next = navigateContext(nextView, current.current, selected);
    if (next) open(next);
    else close();
  }
  useEffect(() => {
    if (view !== lastView.current) navigate(view);
  }, [view]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(true);
      }
      if (
        event.key === "Escape" &&
        contextRef.current &&
        !document.querySelector("dialog[open]")
      )
        close();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    const el = searchDialog.current;
    if (palette && !el?.open) {
      el?.showModal();
      el?.querySelector("input")?.focus();
    } else if (!palette && el?.open) el.close();
  }, [palette]);
  useEffect(() => {
    closeButton.current?.focus();
  }, [context?.kind]);
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
  const props: PanelProps = { ...panel, navigate, openAssignments };
  const employed = s.employees.filter((e) => e.assignments.length).length;
  const visualPeople = officePeople(s);
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
        locale,
      )
    : "";
  const strategies = {
    outsourcing: l("Dịch vụ phần mềm", "Outsourcing"),
    product: l("Sản phẩm", "Product"),
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
      hint: ROLES[e.role][locale],
      context: { kind: "employee" as const, id: e.id },
    })),
    ...s.work.map((w) => ({
      key: w.id,
      label: w.label[locale],
      hint: l("Dự án / Phân công", "Project / Assignments"),
      context: { kind: "project" as const, id: w.id },
    })),
    ...places.map((p) => ({
      key: p.id,
      label: placeName(p.id, locale),
      hint: l("Địa điểm trong văn phòng", "Office location"),
      context: { kind: p.id } as Context,
    })),
    {
      key: "inbox",
      label: l("Việc cần CEO quyết định", "CEO decisions"),
      hint: l("Tình huống & lượt CEO", "Events & CEO actions"),
      context: { kind: "inbox" },
    },
    {
      key: "history",
      label: l("Nhật ký công ty", "Company history"),
      hint: l("Báo cáo & lịch sử", "Reports & history"),
      context: { kind: "history" },
    },
    {
      key: "session",
      label: l("Lưu và tải", "Save and load"),
      hint: l("Tiến trình công ty", "Company progress"),
      context: { kind: "session" },
    },
    {
      key: "settings",
      label: l("Cài đặt", "Settings"),
      hint: l("Giao diện & âm thanh", "Display & audio"),
      context: { kind: "settings" },
    },
  ];
  function choose(next: Context) {
    setPalette(false);
    setQuery("");
    open(next);
  }
  const businessLabel =
    s.strategy === "product"
      ? l("Doanh thu thuê bao", "Recurring revenue")
      : s.strategy === "startup"
        ? l("Thời gian duy trì", "Runway")
        : l("Việc còn lại", "Work remaining");
  const businessValue =
    s.strategy === "product"
      ? money(s.product.paid * s.product.price, locale)
      : s.strategy === "startup"
        ? `${Number.isFinite(runway(s)) ? runway(s).toFixed(1) : "∞"} ${l("tháng", "months")}`
        : `${Math.ceil(active.reduce((n, w) => n + Math.max(0, w.estimated - w.done), 0))} WP`;
  return (
    <div className={`unified-root ${motion ? "reduced-motion" : ""}`}>
      <header className="unified-hud">
        <div className="identity-mark">
          <b>&lt;/&gt;</b>
          <div>
            <strong>SOFTWARE CEO</strong>
            <small>SIMULATE</small>
          </div>
        </div>
        <TooltipButton
          className="hud-number cash"
          label={`${l("Tiền mặt", "Cash")} ${money(s.cash, locale)}`}
          tip={`${l("Tiền mặt", "Cash")} · ${l("Vận hành: ", "Operating costs: ")}${money(monthlyCosts(s), locale)}${l("/tháng", "/month")}`}
          onClick={() => open({ kind: "finance" })}
        >
          <Icon name="finance" />
          <strong>{money(s.cash, locale)}</strong>
        </TooltipButton>
        <TooltipButton
          className="hud-number"
          label={`${businessLabel} ${businessValue}`}
          tip={`${businessLabel} · ${active.length}${l(" đầu việc đang theo dõi", " work items tracked")}`}
          onClick={() => open({ kind: "projects" })}
        >
          <Icon
            name={
              s.strategy === "product"
                ? "market"
                : s.strategy === "startup"
                  ? "clock"
                  : "work"
            }
          />
          <strong>{businessValue}</strong>
        </TooltipButton>
        <TooltipButton
          className="hud-number"
          label={`${l("Đội ngũ", "Team")} ${s.employees.length}`}
          tip={`${l("Đội ngũ", "Team")} · ${employed}${l(" người đã được giao việc", " people assigned")}`}
          onClick={() => open({ kind: "team" })}
        >
          <Icon name="people" />
          <strong>{s.employees.length}</strong>
        </TooltipButton>
        <TooltipButton
          className="hud-number hud-reputation"
          label={`${l("Uy tín", "Reputation")} ${s.reputation}/100`}
          tip={`${l("Uy tín", "Reputation")} · ${strategies[s.strategy]}`}
          onClick={() => open({ kind: "meeting" })}
        >
          <Icon name="star" />
          <strong>
            {s.reputation}
            <em>/100</em>
          </strong>
        </TooltipButton>
        <TooltipButton
          className="hud-number hud-ceo"
          label={`${l("Lượt CEO", "CEO actions")} ${s.actions}/3`}
          tip={l(
            "Lượt CEO còn lại · Làm mới mỗi 7 ngày",
            "CEO actions remaining · Refresh every 7 days",
          )}
          onClick={() => open({ kind: "meeting" })}
        >
          <Icon name="bolt" />
          <strong>
            {s.actions}
            <em>/3</em>
          </strong>
        </TooltipButton>
        <div className="utility-actions">
          <TooltipButton
            label={l("Lưu và tải", "Save and load")}
            onClick={onSave}
          >
            <Icon name="save" />
          </TooltipButton>
          <TooltipButton label={l("Cài đặt", "Settings")} onClick={onSettings}>
            <Icon name="settings" />
          </TooltipButton>
          <button onClick={onLocale}>{locale === "vi" ? "EN" : "VI"}</button>
        </div>
      </header>
      <Tutorial
        s={s}
        locale={locale}
        view={logicalView(context)}
        compact={!!context}
        navigate={navigate}
        dispatch={dispatch}
      />
      <main
        className="unified-scene"
        aria-label={l("Không gian Simulate", "Simulate workspace")}
      >
        <Office
          visualTime={visualTime}
          weatherSeed={s.seed}
          lightingMinute={s.clock.minute}
          lightsOn={s.scene.officeLightsOn}
          onToggleLights={() =>
            dispatch({ type: "officeLights", enabled: !s.scene.officeLightsOn })
          }
          people={visualPeople}
          tier={s.officeTier}
          companyName={s.name}
          selected={selected}
          language={locale}
          paused={!speed}
          reducedMotion={motion}
          interactionLabelsVisible={points}
          onCameraChange={setCamera}
          onSelect={(id) => open({ kind: "employee", id })}
          onNavigate={navigate}
        />
        <div className="office-time-status">
          {l(
            {
              work: "Giờ làm",
              lunch: "Nghỉ trưa",
              overtime: s.overtime ? "Tăng ca" : "Đã tan ca",
              rest: "Ngoài giờ",
            }[phaseAt(s.clock.minute)],
            {
              work: "Working hours",
              lunch: "Lunch break",
              overtime: s.overtime ? "Overtime" : "Off duty",
              rest: "Off duty",
            }[phaseAt(s.clock.minute)],
          )}{" "}
          ·{" "}
          {l(
            WEATHER[weatherForDay(s.seed, s.day - 1)].label,
            {
              sunny: "Clear",
              cloudy: "Cloudy",
              rain: "Rain",
              wind: "Wind",
              "rain-wind": "Wind and rain",
            }[weatherForDay(s.seed, s.day - 1)],
          )}{" "}
          ·{" "}
          {s.scene.officeLightsOn
            ? l("Đèn bật", "Lights on")
            : l("Đèn tắt", "Lights off")}
        </div>
        <div className="scene-toolbar">
          <div>
            <span className={`run-indicator ${speed ? "running" : ""}`} />
            <strong>{s.name}</strong>
            <span className="date">
              {l("THÁNG ", "MONTH ")}
              {Math.floor(
                ((s.status === "playing" ? s.day : s.clock.lastClosedDay) - 1) /
                  30,
              ) + 1}
              {l(" · NGÀY", " · DAY")}{" "}
              <b id="day-value">
                {s.status === "playing" ? s.day : s.clock.lastClosedDay}
              </b>{" "}
              <time
                className="game-clock"
                aria-label={l("Giờ trong game", "Game time")}
              >
                {clockLabel(s.clock.minute)}
              </time>
            </span>
          </div>
          <button className="find-object" onClick={() => setPalette(true)}>
            <Icon name="people" />
            {l("Tìm trong văn phòng", "Find in the office")}
            <kbd>⌘ K</kbd>
          </button>
        </div>
        <div
          className="world-overlays"
          ref={worldOverlays}
          aria-label={l(
            "Các điểm tương tác trong văn phòng",
            "Office interaction points",
          )}
        >
          {camera &&
            points &&
            places.map((p) => {
              const pos = project(camera, p.x, p.y, p.z);
              return (
                <button
                  key={p.id}
                  data-place={p.id}
                  data-anchor-x={pos.x}
                  data-anchor-y={pos.y}
                  className={`world-point point-${p.id} ${context?.kind === p.id ? "is-selected" : ""}`}
                  style={{ left: pos.x, top: pos.y }}
                  onClick={() => open({ kind: p.id } as Context)}
                >
                  <Icon name={p.icon} />
                  <span>{placeName(p.id, locale)}</span>
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
                  data-away={
                    visualPeople[i].present === false ? "true" : undefined
                  }
                  data-anchor-x={pos.x}
                  data-anchor-y={pos.y}
                  className={`person-point ${selected === e.id ? "is-selected" : ""}`}
                  style={{ left: pos.x, top: pos.y }}
                  onClick={() => open({ kind: "employee", id: e.id })}
                >
                  <span>{e.name}</span>
                  <small>
                    {officeStatus(visualPeople[i], locale === "en").description}
                  </small>
                </button>
              );
            })}
        </div>
        {!context && (
          <section
            className="attention-corner"
            aria-label={l("Việc đang cần chú ý", "Needs attention")}
          >
            <button
              className="attention-title"
              onClick={() => open({ kind: "inbox" })}
            >
              <span>{l("CẦN CHÚ Ý", "NEEDS ATTENTION")}</span>
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
                    {s.employees.find((e) => !e.assignments.length)!.name}
                    {l(" đang chờ việc", " is unassigned")}
                  </strong>
                  <small>
                    {l(
                      "Chọn đồng đội để phân công",
                      "Select a teammate to assign work",
                    )}
                  </small>
                </span>
                <b>↗</b>
              </button>
            )}
            <button onClick={() => open({ kind: "projects" })}>
              <i />
              <span>
                <strong>
                  {active.length}
                  {l(" đầu việc cần theo dõi", " work items to track")}
                </strong>
                <small>
                  {l(
                    "Tiến độ, QA và phân công",
                    "Progress, testing and assignments",
                  )}
                </small>
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
                    ? l("ĐỒNG ĐỘI ĐANG CHỌN", "SELECTED TEAMMATE")
                    : context.kind === "project"
                      ? l("HỒ SƠ DỰ ÁN", "PROJECT DOSSIER")
                      : l("TRONG VĂN PHÒNG", "IN THE OFFICE")}
                </small>
                <h1>{contextTitle}</h1>
              </div>
              {context.kind === "project" && (
                <button
                  className="choose-project"
                  onClick={() => open({ kind: "projects" })}
                >
                  {l("Đổi dự án", "Switch project")}
                </button>
              )}
              <button
                ref={closeButton}
                aria-label={l("Đóng thông tin", "Close information")}
                onClick={close}
              >
                {l("×", "×")}
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
                        {ROLES[employee.role][locale]}
                        {l(" · Kỹ năng ", " · Skill ")} {employee.skill}/5
                      </p>
                    </div>
                  </div>
                  <div className="person-metrics">
                    <div>
                      <small>
                        {l("TINH THẦN · ", "MORALE · ")}{" "}
                        {Math.round(employee.morale)}%
                      </small>
                      <Meter
                        label={l("Tinh thần", "Morale")}
                        value={employee.morale}
                      />
                    </div>
                    <div>
                      <small>
                        {l("NĂNG LƯỢNG · ", "ENERGY · ")}{" "}
                        {Math.round(employee.energy)}%
                      </small>
                      <Meter
                        label={l("Năng lượng", "Energy")}
                        value={employee.energy}
                      />
                    </div>
                    <div>
                      <small>{l("LƯƠNG / THÁNG", "MONTHLY SALARY")}</small>
                      <strong>{money(employee.salary, locale)}</strong>
                    </div>
                    <div>
                      <small>
                        {l("NĂNG LỰC ĐÃ PHÂN CÔNG", "ASSIGNED CAPACITY")}
                      </small>
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
                        {l("WP/tuần", "WP/week")}
                      </strong>
                    </div>
                  </div>
                  {s.day - employee.hiredDay < 14 && (
                    <p className="rule-note">
                      {l(
                        "Đang hòa nhập: năng suất tuần đầu 50%, tuần hai 75%.",
                        "Onboarding: 50% output in week one, 75% in week two.",
                      )}
                    </p>
                  )}
                  <h3>
                    {l("Công việc của ", "Work for ")}{" "}
                    {employee.name.split(" ")[0]}
                  </h3>
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
                            {s.work.find((w) => w.id === a.target)?.label[
                              locale
                            ] ??
                              l(
                                "Thị trường / Khách hàng",
                                "Market / Customers",
                              )}
                          </small>
                        </span>
                        <span>{l("Điều chỉnh ↗", "Adjust ↗")}</span>
                      </button>
                    ))
                  ) : (
                    <p className="muted">
                      {l("Chưa được phân công.", "No work assigned.")}
                    </p>
                  )}
                  <button
                    className="primary wide"
                    onClick={() => openAssignments(undefined, employee.id)}
                  >
                    {l("Phân công cho ", "Assign work to ")}
                    {employee.name.split(" ")[0]} →
                  </button>
                  <p className="rule-note">
                    {l(
                      "Tối đa hai việc. Hai việc chia đều thời gian và giảm tập trung 15%.",
                      "Maximum two tasks. Two tasks split time equally and reduce focus by 15%.",
                    )}
                  </p>
                  <h3>{l("Đặc điểm", "Traits")}</h3>
                  {employee.traits.map((id) => (
                    <p key={id}>
                      <strong>{TRAITS[id]?.name[locale]}</strong>
                      <br />
                      {TRAITS[id]?.description[locale]}
                    </p>
                  ))}
                  <h3>
                    {l("Phát triển & đãi ngộ", "Development & compensation")}
                  </h3>
                  <div className="person-actions">
                    <button
                      onClick={() =>
                        dispatch({ type: "train", employeeId: employee.id })
                      }
                    >
                      {l("Đào tạo · $2.000", "Train · $2,000")}
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
                      {l("Xem lại lương", "Review salary")}
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
                      {l("Thôi việc", "Dismiss")}
                    </button>
                  </div>
                </section>
              )}
              {context.kind === "employee" && !employee && (
                <p>
                  {l(
                    "Nhân viên đã rời công ty.",
                    "This teammate has left the company.",
                  )}{" "}
                  <button onClick={() => open({ kind: "team" })}>
                    {l("Xem đồng đội", "View teammates")}
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
                          {ROLES[e.role][locale]} ·{" "}
                          {e.assignments.length
                            ? locale === "vi"
                              ? `${e.assignments.length} việc đang phụ trách`
                              : `${e.assignments.length} tasks assigned`
                            : l("Chưa phân công", "Unassigned")}
                        </small>
                      </span>
                      <b>↗</b>
                    </button>
                  ))}
                  <button
                    className="wide"
                    onClick={() => open({ kind: "recruitment" })}
                  >
                    {l("Đón ứng viên mới →", "Meet candidates →")}
                  </button>
                </div>
              )}
              {context.kind === "projects" && (
                <div className="projects-context">
                  <input
                    type="search"
                    aria-label={l("Tìm dự án", "Find project")}
                    placeholder={l("Tìm dự án…", "Find project…")}
                    value={workSession.query}
                    onChange={(event) =>
                      setWorkSession((prev) => ({
                        ...prev,
                        query: event.target.value,
                      }))
                    }
                  />
                  <div className="project-board-tools">
                    <select
                      aria-label={l("Sắp xếp công việc", "Sort work")}
                      value={workSession.sort}
                      onChange={(event) =>
                        setWorkSession((prev) => ({
                          ...prev,
                          sort: event.target.value,
                        }))
                      }
                    >
                      <option value="attention">
                        {l("Cần chú ý trước", "Needs attention first")}
                      </option>
                      <option value="deadline">
                        {l("Hạn giao gần nhất", "Nearest deadline")}
                      </option>
                    </select>
                    <select
                      aria-label={l("Lọc công việc", "Filter work")}
                      value={workSession.filter}
                      onChange={(event) =>
                        setWorkSession((prev) => ({
                          ...prev,
                          filter: event.target.value,
                        }))
                      }
                    >
                      {[
                        ["all", l("Tất cả", "All")],
                        ["active", l("Đang thực hiện", "Active")],
                        ["offers", l("Chờ cam kết", "Offers")],
                        ["completed", l("Đã hoàn thành", "Completed")],
                      ].map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {visibleProjects(s, workSession, locale).map((w) => {
                    const c = s.contracts.find((c) => c.workId === w.id);
                    return (
                      <article className="project-card" key={w.id}>
                        <span className="tag">
                          {w.status === "released"
                            ? c
                              ? l("ĐÃ NGHIỆM THU", "ACCEPTED")
                              : l("ĐÃ PHÁT HÀNH", "RELEASED")
                            : c?.stage === "quoted"
                              ? l("CHỜ KÝ", "AWAITING SIGNATURE")
                              : w.kind === "experiment"
                                ? l("THỬ NGHIỆM", "EXPERIMENT")
                                : l("ĐANG THỰC HIỆN", "IN PROGRESS")}
                        </span>
                        <h2>{w.label[locale]}</h2>
                        <p>{c?.client ?? s.product.name[locale]}</p>
                        <Meter
                          label={l("Tiến độ", "Progress")}
                          value={w.done}
                          max={Math.max(w.estimated, w.done + 1)}
                        />
                        <div className="project-values">
                          <span>
                            {w.done.toFixed(1)} / {w.estimated} WP
                          </span>
                          <span>
                            {w.qa > 0
                              ? locale === "vi"
                                ? `Chất lượng đã biết ${Math.round(quality(w))}%`
                                : `Known quality ${Math.round(quality(w))}%`
                              : l("Chưa kiểm thử", "Not tested")}
                          </span>
                        </div>
                        <p>
                          {s.employees
                            .filter((e) =>
                              e.assignments.some((a) => a.target === w.id),
                            )
                            .map((e) => e.name.split(" ")[0])
                            .join(" · ") ||
                            l("Chưa có người phụ trách", "Nobody assigned")}
                        </p>
                        <button
                          className="primary wide"
                          onClick={() => openAssignments(w.id)}
                        >
                          {l("Chọn dự án →", "Select project →")}
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
            </div>
          </aside>
        )}
        <div className="world-help">
          <span>
            {l(
              "Chọn người hoặc địa điểm để điều hành công ty.",
              "Select a person or location to manage the company.",
            )}
          </span>
          <button aria-pressed={points} onClick={() => setPoints((v) => !v)}>
            {points
              ? l("Ẩn điểm tương tác", "Hide interaction points")
              : l("Hiện điểm tương tác", "Show interaction points")}
          </button>
        </div>
        <div
          className="time-controls"
          aria-label={l("Thời gian mô phỏng", "Simulation clock")}
        >
          <button
            aria-label={
              speed
                ? l("Tạm dừng", "Pause")
                : l("Chạy mô phỏng", "Play simulation")
            }
            onClick={() => setSpeed(speed ? 0 : 1)}
          >
            {speed ? "Ⅱ" : "▶"}
          </button>
          {([1, 2, 4] as const).map((v) => (
            <button
              key={v}
              aria-pressed={speed === v}
              onClick={() => setSpeed(v)}
            >
              {v}
              {l("×", "×")}
            </button>
          ))}
          <button
            onClick={() => {
              setSpeed(0);
              dispatch({
                type: "advanceTime",
                steps: 96 - s.clock.minute / 15,
              });
            }}
          >
            {l("Qua ngày →", "Next day →")}
          </button>
          <button
            onClick={() => {
              setSpeed(0);
              dispatch({ type: "advanceTime", steps: 1 });
            }}
          >
            +15 {l("phút", "min")}
          </button>
          <button
            onClick={() => {
              setSpeed(0);
              dispatch({
                type: "advanceTime",
                steps: nextWorkSteps(s.clock.minute),
              });
            }}
          >
            {l("Đến giờ làm", "Next shift")}
          </button>
        </div>
      </main>
      <footer className="simulation-footer">
        <div>
          <span className={`run-indicator ${speed ? "running" : ""}`} />
          <strong>
            {speed
              ? l("SIMULATE ĐANG CHẠY", "SIMULATION RUNNING")
              : l("SIMULATE TẠM DỪNG", "SIMULATION PAUSED")}
          </strong>
        </div>
        <button onClick={() => open({ kind: "history" })}>
          <span>
            {l("NGÀY ", "DAY ")} {s.history.at(-1)?.day}
          </span>
          {s.history.at(-1)?.title[locale]}
          <b>{l("Nhật ký ↗", "History ↗")}</b>
        </button>
        <button onClick={() => open({ kind: "inbox" })}>
          {live.length
            ? locale === "vi"
              ? `${live.length} tình huống cần theo dõi`
              : `${live.length} events to monitor`
            : locale === "vi"
              ? `${s.actions}/3 lượt CEO còn lại`
              : `${s.actions}/3 CEO actions left`}
          <b>{l("Hộp thư ↗", "Inbox ↗")}</b>
        </button>
      </footer>
      <dialog
        className="find-dialog"
        ref={searchDialog}
        onCancel={() => {
          setPalette(false);
          setQuery("");
        }}
      >
        <div className="find-heading">
          <h2>{l("Tìm trong văn phòng", "Find in the office")}</h2>
          <button
            aria-label={l("Đóng tìm kiếm", "Close search")}
            onClick={() => setPalette(false)}
          >
            {l("×", "×")}
          </button>
        </div>
        <input
          aria-label={l(
            "Tìm người, dự án hoặc địa điểm",
            "Find a person, project or location",
          )}
          placeholder={l(
            "Tên đồng đội, dự án, tài chính…",
            "Teammate, project, finance…",
          )}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="find-results">
          {choices
            .filter((c) =>
              (c.label + " " + c.hint)
                .toLocaleLowerCase(locale)
                .includes(query.toLocaleLowerCase(locale)),
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
    </div>
  );
}
