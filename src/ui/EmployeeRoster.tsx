import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { Employee, Locale, State } from "../simulation/types";
import type { PanelProps } from "./Panels";
import { ROLES, TRAITS, copy } from "../content/catalog";
import { capacity } from "../simulation/work";
import { money, Meter } from "./common";
import { NextMove } from "./DecisionBoard";

function weeklyOutput(s: State, employee: Employee) {
  return employee.assignments
    .reduce(
      (sum, assignment) =>
        sum + capacity(s, employee, assignment) / employee.assignments.length,
      0,
    )
    .toFixed(1);
}

function Identity({
  employee,
  locale,
  detail = false,
}: {
  employee: Employee;
  locale: Locale;
  detail?: boolean;
}) {
  const Heading = detail ? "h2" : "h3";
  return (
    <div className="employee-identity">
      <div className={`avatar v${employee.variant % 5}`} aria-hidden="true">
        {employee.name
          .split(" ")
          .map((word) => word[0])
          .slice(0, 2)
          .join("")}
      </div>
      <div>
        <Heading
          id={detail ? "employee-detail-title" : `employee-${employee.id}-name`}
        >
          {employee.name}
        </Heading>
        <p>
          {ROLES[employee.role][locale]} ·{" "}
          {locale === "vi" ? "Kỹ năng" : "Skill"} {employee.skill}/5
        </p>
      </div>
    </div>
  );
}

export function EmployeeRoster(p: PanelProps) {
  const { s, locale } = p;
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(p.selected ?? "");
  const current =
    s.employees.find((e) => e.id === selectedId) ?? s.employees[0];
  const list = useRef<HTMLUListElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const previousCount = useRef(s.employees.length);
  const employee = s.employees.find((e) => e.id === detailId);

  // When dismissal removes the confirmation's original trigger, return to the roster.
  useEffect(() => {
    const removed = s.employees.length < previousCount.current;
    previousCount.current = s.employees.length;
    if (!removed) return;
    const frame = requestAnimationFrame(() => {
      if (!document.querySelector("dialog[open]")) list.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [s.employees.length]);

  return (
    <>
      <div className="people-board decision-board">
        <div className="employee-roster decision-rail">
          <div className="decision-rail-heading">
            <h3>{l("Đội ngũ", "Team roster")}</h3>
            <span>{s.employees.length}</span>
          </div>
          <div className="roster-labels" aria-hidden="true">
            <span>{l("Nhân viên", "Teammate")}</span>
            <span>{l("Tinh thần · Năng lượng", "Morale · Energy")}</span>
            <span>{l("Lương / tháng", "Monthly salary")}</span>
            <span>{l("Công việc", "Work")}</span>
            <span>{l("Thao tác", "Actions")}</span>
          </div>
          <ul
            className="roster-list"
            role="list"
            ref={list}
            tabIndex={-1}
            aria-label={l("Danh sách nhân viên", "Team roster")}
          >
            {s.employees.map((e) => (
              <li
                className={`roster-row ${current?.id === e.id ? "selected" : ""}`}
                key={e.id}
                aria-labelledby={`employee-${e.id}-name`}
              >
                <div className="roster-person">
                  <button
                    className="roster-select"
                    aria-pressed={current?.id === e.id}
                    onClick={() => {
                      setSelectedId(e.id);
                      p.select?.(e.id);
                    }}
                  >
                    <Identity employee={e} locale={locale} />
                  </button>
                  {s.day - e.hiredDay < 14 && (
                    <span className="roster-onboarding">
                      {l("Đang hòa nhập", "Onboarding")}
                    </span>
                  )}
                </div>
                <div className="roster-salary">
                  <strong>{money(e.salary, locale)}</strong>
                  <small>/ {l("tháng", "month")}</small>
                </div>
                <div className="roster-assignment">
                  <span>
                    {e.assignments.length
                      ? l(
                          `${e.assignments.length} việc được giao`,
                          `${e.assignments.length} ${e.assignments.length === 1 ? "assigned task" : "assigned tasks"}`,
                        )
                      : l("Chưa phân công", "Unassigned")}
                  </span>
                  {!!e.assignments.length && (
                    <small>
                      {weeklyOutput(s, e)}{" "}
                      {l("điểm việc/tuần", "work points/week")}
                    </small>
                  )}
                </div>
                <div className="roster-actions">
                  <button onClick={() => p.openAssignments?.(undefined, e.id)}>
                    {l("Phân công", "Assignments")}
                  </button>
                  <button
                    aria-haspopup="dialog"
                    onClick={(event) => {
                      trigger.current = event.currentTarget;
                      setSelectedId(e.id);
                      p.select?.(e.id);
                      setDetailId(e.id);
                    }}
                  >
                    {l("Chi tiết", "Details")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {!s.employees.length && (
            <p className="empty-text">
              {l(
                "Chưa có nhân viên. Xem Tuyển dụng để xây lại đội ngũ.",
                "No teammates yet. Open Recruitment to rebuild your team.",
              )}
            </p>
          )}
        </div>
        {current && (
          <article className="panel-card teammate-inspector">
            <Identity employee={current} locale={locale} />
            {s.day - current.hiredDay < 14 && (
              <p className="warning-note">
                {l(
                  "Đang hòa nhập: năng suất tuần đầu 50%, tuần hai 75%.",
                  "Onboarding: output starts at 50%, then 75% in week two.",
                )}
              </p>
            )}
            <NextMove
              locale={locale}
              tone={
                current.energy < 40 || current.morale < 40 ? "warning" : "info"
              }
              title={
                current.energy < 40
                  ? l(
                      "Theo dõi sức bền của đồng đội.",
                      "Watch your teammate’s energy.",
                    )
                  : current.morale < 40
                    ? l(
                        "Lắng nghe trước khi giao thêm việc.",
                        "Check in before adding more work.",
                      )
                    : !current.assignments.length
                      ? l(
                          "Đồng đội đang chờ phân công.",
                          "Your teammate is awaiting assignments.",
                        )
                      : l(
                          "Giữ nhịp làm việc bền vững.",
                          "Keep a sustainable working rhythm.",
                        )
              }
            >
              <p>
                {current.energy < 40 || current.morale < 40
                  ? l(
                      "Xem lại tăng ca, khối lượng công việc và các lựa chọn chăm sóc đội ngũ.",
                      "Review overtime, workload and options for supporting your team.",
                    )
                  : l(
                      "Mỗi người tối đa hai việc. Hai việc chia thời gian và giảm tập trung 15%.",
                      "Each person can take two tasks. Two tasks split time and reduce focus by 15%.",
                    )}
              </p>
              <button
                className="primary"
                onClick={() => p.openAssignments?.(undefined, employee?.id)}
              >
                {l("Đến bảng phân công", "Open assignments")} →
              </button>
            </NextMove>
            <div className="two-stats">
              <div>
                {l("Tinh thần", "Morale")} · {Math.round(current.morale)}%
                <Meter
                  label={l(
                    "Tinh thần người đang chọn",
                    "Selected teammate morale",
                  )}
                  value={current.morale}
                />
              </div>
              <div>
                {l("Năng lượng", "Energy")} · {Math.round(current.energy)}%
                <Meter
                  label={l(
                    "Năng lượng người đang chọn",
                    "Selected teammate energy",
                  )}
                  value={current.energy}
                  tone="gold"
                />
              </div>
            </div>
            <div className="stat-line">
              <span>{l("Lương / tháng", "Monthly salary")}</span>
              <strong>{money(current.salary, locale)}</strong>
            </div>
            <div className="stat-line">
              <span>
                {l("Năng lực được phân công / tuần", "Assigned weekly output")}
              </span>
              <strong>{weeklyOutput(s, current)} WP</strong>
            </div>
            <p>
              {current.traits.map((t) => TRAITS[t]?.name[locale]).join(" · ")}
            </p>
            <button
              aria-haspopup="dialog"
              onClick={(event) => {
                trigger.current = event.currentTarget;
                setDetailId(current.id);
              }}
            >
              {l("Đào tạo, lương & giữ chân", "Training, salary & retention")}
            </button>
          </article>
        )}
      </div>
      {employee && (
        <EmployeeDetails
          {...p}
          employee={employee}
          fallbackFocus={list}
          trigger={trigger}
          onClose={() => setDetailId(null)}
        />
      )}
    </>
  );
}

function EmployeeDetails({
  employee: e,
  fallbackFocus,
  trigger,
  onClose,
  ...p
}: PanelProps & {
  employee: Employee;
  fallbackFocus: RefObject<HTMLUListElement | null>;
  trigger: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const { s, locale } = p;
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const el = dialog.current!;
    // Safari may not focus a pointer-clicked button. Capture the actual trigger explicitly.
    const opener = trigger.current;
    el.showModal();
    return () => {
      el.close();
      const restoreFocus = () => {
        if (document.querySelector("dialog[open]")) return;
        if (opener?.isConnected) opener.focus();
        else fallbackFocus.current?.focus();
      };
      restoreFocus();
      requestAnimationFrame(restoreFocus);
    };
  }, [fallbackFocus, trigger]);

  const act = (kind: "raise" | "train" | "dismiss") => {
    // Close before the existing confirmation/error feedback takes over; no nested modals.
    onClose();
    if (kind === "train") {
      p.dispatch({ type: "train", employeeId: e.id });
    } else if (kind === "raise") {
      p.confirm(
        copy("Tăng lương 10%?", "Raise salary by 10%?"),
        copy(
          "Tăng tinh thần 12. Chi phí lương tăng từ tháng này. Tốn 1 lượt CEO.",
          "Morale +12. Payroll increases this month. Costs 1 CEO action.",
        ),
        { type: "raise", employeeId: e.id },
      );
    } else {
      p.confirm(
        copy("Cho nhân viên thôi việc?", "Dismiss this employee?"),
        copy(
          "Trả nửa tháng trợ cấp. Nhóm còn lại giảm 5 tinh thần.",
          "Pay half a month of severance. Remaining team morale falls by 5.",
        ),
        { type: "dismiss", employeeId: e.id },
      );
    }
  };
  return (
    <dialog
      className="employee-dialog"
      ref={dialog}
      aria-labelledby="employee-detail-title"
      onCancel={onClose}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const buttons = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)",
          ),
        );
        const first = buttons[0],
          last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="employee-dialog-heading">
        <Identity employee={e} locale={locale} detail />
        <button
          autoFocus
          onClick={onClose}
          aria-label={l("Đóng chi tiết nhân viên", "Close employee details")}
        >
          ×
        </button>
      </div>
      <dl className="employee-facts">
        <div>
          <dt>{l("Lương / tháng", "Monthly salary")}</dt>
          <dd>{money(e.salary, locale)}</dd>
        </div>
        <div>
          <dt>{l("Tinh thần / Năng lượng", "Morale / Energy")}</dt>
          <dd>
            {Math.round(e.morale)} / {Math.round(e.energy)}
          </dd>
        </div>
        <div>
          <dt>{l("Hòa nhập", "Onboarding")}</dt>
          <dd>
            {s.day - e.hiredDay < 14
              ? l(
                  "Tuần đầu 50% / tuần hai 75% năng suất",
                  "Week one 50% / week two 75% output",
                )
              : l("Đã hòa nhập", "Fully onboarded")}
          </dd>
        </div>
        <div>
          <dt>{l("Công việc", "Work")}</dt>
          <dd>
            {e.assignments.length
              ? `${weeklyOutput(s, e)} ${l("điểm việc/tuần", "work points/week")}`
              : l("Chưa được phân công", "No active assignment")}
          </dd>
        </div>
      </dl>
      <h3>{l("Đặc điểm", "Traits")}</h3>
      <ul className="employee-traits">
        {e.traits.map((trait) => (
          <li key={trait}>
            <strong>{TRAITS[trait]?.name[locale] ?? trait}</strong>
            <p>{TRAITS[trait]?.description[locale]}</p>
          </li>
        ))}
      </ul>
      <div className="employee-management">
        <h3>{l("Phát triển & đãi ngộ", "Development & pay")}</h3>
        <div className="button-row">
          <button onClick={() => act("raise")}>
            {l("Xem lại lương", "Pay review")}
          </button>
          <button onClick={() => act("train")}>
            {l("Đào tạo $2.000", "Train $2,000")}
          </button>
        </div>
        <button
          className="text-button danger-text"
          onClick={() => act("dismiss")}
        >
          {l("Thôi việc", "Dismiss")}
        </button>
      </div>
    </dialog>
  );
}
