import { ContractDetail } from "./ContractDetail";
import { useState } from "react";
import { WorkWorkspace } from "./WorkWorkspace";
import type { WorkSession } from "./workSession";
import type { Dispatch, SetStateAction } from "react";
import {
  ManagementPage,
  ManagementSection,
  ManagementJump,
} from "./Management";
import { DecisionBoard, NextMove } from "./DecisionBoard";
import { EmployeeRoster } from "./EmployeeRoster";
import { Progression } from "./BusinessPanels";
import type { State, Command, Locale, Copy } from "../simulation/types";
import { ROLES, POLICIES, TRAITS, copy } from "../content/catalog";
import { EVENTS } from "../content/events";
import { balance, monthlyCosts, runway } from "../simulation/finance";
import { money, Icon } from "./common";
export interface PanelProps {
  s: State;
  locale: Locale;
  dispatch: (c: Command) => boolean;
  confirm: (title: Copy, body: Copy, c: Command) => void;
  navigate: (view: string) => void;
  selected?: string;
  select?: (id: string) => void;
  workSession?: WorkSession;
  setWorkSession?: Dispatch<SetStateAction<WorkSession>>;
  openAssignments?: (target?: string, employee?: string) => void;
}
export function Inbox(p: PanelProps) {
  const { s, locale, navigate } = p;
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  const live = s.events.filter((e) => !e.resolved);
  const c = s.contracts.find((c) => c.stage === "quoted");
  return (
    <aside className="inbox">
      <div className="section-heading">
        <span className="eyebrow">{l("HỘP THƯ CEO", "CEO INBOX")}</span>
        <span className="pill">{live.length + (c ? 1 : 0)}</span>
      </div>
      <h2>{l("Tuần này, bạn dẫn lối.", "Your next move.")}</h2>
      <p className="muted">
        {l(
          "Những lựa chọn nhỏ tạo nên một công ty bền vững.",
          "Small decisions build a lasting company.",
        )}
      </p>
      <div className="actions-summary">
        <span>{s.actions}/3</span>
        <div>
          {l("lượt CEO còn lại", "CEO actions left")}
          <small>{l("Làm mới mỗi 7 ngày", "Refreshes every 7 days")}</small>
        </div>
      </div>
      {c && (
        <article className="inbox-card">
          <span className="tag amber">
            {l("CƠ HỘI ĐẦU TIÊN", "FIRST OPPORTUNITY")}
          </span>
          <h3>{c.client}</h3>
          <p>
            {l(
              "Một hợp đồng đang chờ chữ ký của bạn.",
              "A contract is waiting for your signature.",
            )}
          </p>
          <strong>{money(c.price, locale)}</strong>
          <button className="text-button" onClick={() => navigate("work")}>
            {l("Xem hợp đồng", "Review contract")} <Icon name="arrow" />
          </button>
        </article>
      )}
      {live.map((e) => {
        const t = EVENTS.find((t) => t.id === e.templateId)!;
        const open = s.day >= e.due;
        return (
          <article className="inbox-card" key={e.id}>
            <span className={`tag ${open ? "amber" : ""}`}>
              {open
                ? l("CẦN QUYẾT ĐỊNH", "DECISION OPEN")
                : l(`MỞ VÀO NGÀY ${e.due}`, `OPENS DAY ${e.due}`)}
            </span>
            <h3>{t.title[locale]}</h3>
            <p>{(open ? t.body : t.warning)[locale]}</p>
            {open &&
              t.choices.map((choice) => (
                <button
                  className="choice-small"
                  key={choice.id}
                  disabled={s.actions < choice.actions || s.cash < choice.cost}
                  onClick={() =>
                    p.confirm(
                      t.title,
                      copy(
                        `${choice.description.vi}\nChi phí: $${choice.cost / 100}. ${choice.actions} lượt CEO.`,
                        `${choice.description.en}\nCost: $${choice.cost / 100}. ${choice.actions} CEO action.`,
                      ),
                      { type: "decide", eventId: e.id, choiceId: choice.id },
                    )
                  }
                >
                  {choice.label[locale]}
                  <small>
                    {money(choice.cost, locale)} · {choice.actions}{" "}
                    {l("lượt", "action")}
                  </small>
                </button>
              ))}
          </article>
        );
      })}
      {!live.length && !c && (
        <article className="inbox-card calm">
          <span className="tag">
            {l("MỌI THỨ ĐANG TIẾN TRIỂN", "ROOM TO FOCUS")}
          </span>
          <h3>{l("Giữ nhịp. Giữ lời.", "Keep your rhythm.")}</h3>
          <p>
            {l(
              "Xem tiến độ, chất lượng và lịch thu tiền trước khi nhận thêm cam kết.",
              "Check progress, quality and collections before taking on another commitment.",
            )}
          </p>
          <button className="text-button" onClick={() => navigate("work")}>
            {l("Mở bảng công việc", "Open work board")} →
          </button>
        </article>
      )}
      {s.liabilities.some((x) => x.kind === "payroll") && (
        <article className="inbox-card danger">
          <h3>{l("Lương đang quá hạn", "Payroll is unpaid")}</h3>
          <p>
            {l(
              "Xử lý trước hạn 14 ngày để tránh mất khả năng thanh toán.",
              "Settle within the 14-day grace period to avoid insolvency.",
            )}
          </p>
          <button onClick={() => navigate("finance")}>
            {l("Xem phương án", "Review options")}
          </button>
        </article>
      )}
      <div className="aside-bottom">
        <span className="eyebrow">{l("TIN MỚI NHẤT", "LATEST UPDATE")}</span>
        {s.history
          .slice(-2)
          .reverse()
          .map((h) => (
            <p key={h.id}>
              <small>
                {l("Ngày", "Day")} {h.day}
              </small>
              <br />
              {h.title[locale]}
            </p>
          ))}
      </div>
      <button className="text-button" onClick={() => navigate("history")}>
        {l("Nhật ký công ty", "Company history")} →
      </button>
    </aside>
  );
}
export function WorkPanel(p: PanelProps) {
  return (
    <WorkWorkspace
      {...p}
      renderContract={(id) => <ContractDetail {...p} contractId={id} />}
    />
  );
}
export function PeoplePanel(p: PanelProps) {
  const { s, locale } = p;
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  return (
    <ManagementPage locale={locale} name={l("Nhân sự", "People")}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {l("CON NGƯỜI TẠO NÊN CÔNG TY", "PEOPLE BUILD COMPANIES")}
          </span>
          <h1>{l("Đội ngũ của bạn.", "Your people.")}</h1>
          <p>
            {l(
              "Năng lực cần thời gian. Niềm tin cần được chăm sóc.",
              "Skills take time. Trust takes care.",
            )}
          </p>
        </div>
        <span className="pill">
          {s.employees.length}/{s.officeTier === 1 ? 5 : 12}{" "}
          {l("chỗ ngồi", "seats")}
        </span>
      </div>
      <ManagementSection
        id="people-team"
        label={l("Đội ngũ", "Team")}
        count={s.employees.length}
      >
        <div className="metric-grid command-metrics">
          <div className="metric-card">
            <small>{l("Quỹ lương / tháng", "Monthly base payroll")}</small>
            <strong>
              {money(
                s.employees.reduce((sum, e) => sum + e.salary, 0),
                locale,
              )}
            </strong>
          </div>
          <div className="metric-card">
            <small>{l("Đội ngũ / chỗ ngồi", "Team / seats")}</small>
            <strong>
              {s.employees.length} / {s.officeTier === 1 ? 5 : 12}
            </strong>
          </div>
          <div className="metric-card">
            <small>{l("Chưa phân công", "Unassigned")}</small>
            <strong>
              {s.employees.filter((e) => !e.assignments.length).length}
            </strong>
          </div>
          <div className="metric-card">
            <small>{l("Năng lượng dưới 40", "Energy below 40")}</small>
            <strong>{s.employees.filter((e) => e.energy < 40).length}</strong>
          </div>
        </div>
        <EmployeeRoster {...p} />
      </ManagementSection>
      <ManagementSection
        id="people-recruit"
        label={l("Tuyển dụng", "Recruitment")}
        count={s.candidates.length}
      >
        <section className="panel-card">
          <h2>{l("Ứng viên mới", "Meet your next teammate")}</h2>
          <p>
            {l(
              "Phí tuyển dụng 15% lương tháng. Năng suất tuần đầu 50%, tuần hai 75%.",
              "Recruitment fee is 15% of monthly salary. Output starts at 50%, then 75% in week two.",
            )}
          </p>
          {s.employees.length >= (s.officeTier === 1 ? 5 : 12) && (
            <p className="warning-note">
              {l(
                "Văn phòng đã đủ chỗ. Xem điều kiện mở rộng ở Chiến lược.",
                "Your office is full. Review office expansion in Strategy.",
              )}
            </p>
          )}
          {!s.candidates.length && (
            <p className="empty-text">
              {l(
                "Chưa có ứng viên mới. Danh sách được làm mới theo tuần.",
                "No candidates available. Check the next weekly refresh.",
              )}
            </p>
          )}
          <div className="candidate-list">
            {s.candidates.map((c) => (
              <div className="candidate" key={c.id}>
                <div className={`avatar small v${c.variant}`}>{c.name[0]}</div>
                <div>
                  <strong>{c.name}</strong>
                  <small>
                    {ROLES[c.role][locale]} · {c.skill}/5 ·{" "}
                    {c.traits.map((t) => TRAITS[t]?.name[locale]).join(", ")}
                  </small>
                </div>
                <strong>
                  {money(c.salary, locale)}
                  <small>/ {l("tháng", "month")}</small>
                </strong>
                <button
                  className="primary"
                  disabled={
                    !s.actions ||
                    s.employees.length >= (s.officeTier === 1 ? 5 : 12)
                  }
                  onClick={() =>
                    p.confirm(
                      copy("Tuyển nhân viên?", "Hire this candidate?"),
                      copy(
                        `${c.name}: phí tuyển $${Math.round(c.salary * 0.15) / 100}; lương $${c.salary / 100}/tháng. Tốn 1 lượt CEO.`,
                        `${c.name}: recruitment $${Math.round(c.salary * 0.15) / 100}; salary $${c.salary / 100}/month. Costs 1 CEO action.`,
                      ),
                      { type: "hire", candidateId: c.id },
                    )
                  }
                >
                  {l("Tuyển · 1 lượt", "Hire · 1 action")}
                </button>
              </div>
            ))}
          </div>
        </section>
      </ManagementSection>
    </ManagementPage>
  );
}
export function FinancePanel(p: PanelProps) {
  const { s, locale, dispatch } = p;
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  const b = balance(s),
    r = runway(s);
  return (
    <ManagementPage locale={locale} name={l("Tài chính", "Finance")}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {l("TIỀN MẶT NUÔI CÔNG TY", "CASH IS YOUR OXYGEN")}
          </span>
          <h1>{l("Biết tiền đi đâu.", "Follow the money.")}</h1>
          <p>
            {l(
              "USD mô phỏng. Doanh thu ghi nhận và tiền đã thu được theo dõi riêng.",
              "Simulated USD. Earned revenue and cleared cash are tracked separately.",
            )}
          </p>
        </div>
      </div>
      <ManagementSection
        id="finance-overview"
        label={l("Tổng quan", "Overview")}
      >
        <NextMove
          locale={locale}
          tone={
            s.invoices.some((i) => !i.paid && s.day > i.due)
              ? "warning"
              : "info"
          }
          title={
            s.invoices.some((i) => !i.paid)
              ? l("Theo dõi hóa đơn chưa thu.", "Track outstanding invoices.")
              : l(
                  "Giữ đủ tiền cho chu kỳ tiếp theo.",
                  "Fund the next operating cycle.",
                )
          }
        >
          <p>
            {l(
              "Khoản phải thu chưa phải tiền mặt. Lương, vận hành và khoản vay cần được chi trả bằng tiền đã có.",
              "Receivables are not cleared cash. Payroll, operating costs and loans need available funds.",
            )}
          </p>
          {!!s.invoices.length && (
            <ManagementJump section="finance-invoices">
              {l("Xem khoản thu", "Review collections")}
            </ManagementJump>
          )}
        </NextMove>
        <div className="metric-grid">
          {[
            [l("Tiền mặt", "Cash"), money(s.cash, locale)],
            [l("Phải thu", "Receivables"), money(b.receivable, locale)],
            [l("Nợ phải trả", "Liabilities"), money(b.liability, locale)],
            [
              l("Thời gian duy trì", "Runway"),
              Number.isFinite(r)
                ? `${r.toFixed(1)} ${l("tháng", "months")}`
                : l("Tự duy trì", "Self-sustaining"),
            ],
          ].map(([k, v]) => (
            <div className="metric-card" key={k}>
              <small>{k}</small>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        <div className="cards-grid">
          <section className="panel-card">
            <h2>
              {l(
                "Doanh thu & chi phí theo tháng",
                "Monthly revenue & expenses",
              )}
            </h2>
            <p>
              {l(
                "Cột xanh: doanh thu. Cột vàng: chi phí. Khoản thu chưa chắc đã về tài khoản.",
                "Green: earned revenue. Gold: expenses. Revenue may still be receivable.",
              )}
            </p>
            <div className="chart">
              {s.months.slice(-12).map((m) => {
                const max = Math.max(
                  ...s.months
                    .slice(-12)
                    .map((m) => Math.max(m.revenue, m.expense)),
                  1,
                );
                return (
                  <div className="chart-group" key={m.month}>
                    <div className="chart-bars">
                      <span
                        style={{
                          height: `${Math.max(2, (m.revenue / max) * 130)}px`,
                        }}
                        title={`${l("Doanh thu", "Revenue")}: ${money(m.revenue, locale)}`}
                      />
                      <span
                        style={{
                          height: `${Math.max(2, (m.expense / max) * 130)}px`,
                        }}
                        title={`${l("Chi phí", "Expenses")}: ${money(m.expense, locale)}`}
                      />
                    </div>
                    <small>
                      {l("T", "M")}
                      {m.month}
                    </small>
                  </div>
                );
              })}
              {!s.months.length && (
                <p className="empty-text">
                  {l(
                    "Báo cáo đầu tiên xuất hiện cuối ngày 30.",
                    "The first monthly report arrives at the end of day 30.",
                  )}
                </p>
              )}
            </div>
          </section>
          <section className="panel-card">
            <h2>{l("Dự báo chi phí", "Cost forecast")}</h2>
            <div className="stat-line">
              <span>
                {l("Chi phí tháng dự kiến", "Expected monthly costs")}
              </span>
              <strong>{money(monthlyCosts(s), locale)}</strong>
            </div>
            <div className="stat-line">
              <span>{l("Lợi nhuận lũy kế", "Lifetime booked profit")}</span>
              <strong>{money(b.revenue - b.expense, locale)}</strong>
            </div>
            <div className="stat-line">
              <span>{l("Cọc chưa ghi doanh thu", "Unearned deposits")}</span>
              <strong>{money(b.deferred, locale)}</strong>
            </div>
            <p className="small">
              {l(
                "Vay cầu nối không phải doanh thu. Lãi 2%/tháng. Hạn mức $20.000.",
                "Bridge loans are not revenue. Interest is 2% monthly. Limit: $20,000.",
              )}
            </p>
            <div className="button-row">
              <button
                onClick={() =>
                  p.confirm(
                    copy("Vay cầu nối $10.000?", "Borrow $10,000?"),
                    copy(
                      "Tốn 1 lượt CEO. Uy tín −2. Lãi $200/tháng nếu còn đủ dư nợ.",
                      "Costs 1 CEO action. Reputation −2. Interest is $200/month on the full principal.",
                    ),
                    { type: "loan", amount: 1000000 },
                  )
                }
              >
                {l("Vay $10.000", "Borrow $10,000")}
              </button>
              <button onClick={() => dispatch({ type: "repay" })}>
                {l("Trả hết khoản vay", "Repay loan")}
              </button>
              <button onClick={() => dispatch({ type: "emergencyAction" })}>
                {l("Mượn lượt khẩn cấp", "Emergency action")}
              </button>
            </div>
          </section>
        </div>
      </ManagementSection>
      <ManagementSection
        id="finance-invoices"
        label={l("Hóa đơn", "Invoices")}
        count={s.invoices.length}
      >
        <DecisionBoard
          locale={locale}
          label={l("Khoản thu", "Collections")}
          items={s.invoices.map((i) => ({
            id: i.id,
            title: i.label[locale],
            subtitle: money(i.amount, locale),
            status: i.paid
              ? l("Đã thu", "Cleared")
              : i.expedited
                ? l("Đã nhắc", "Followed up")
                : s.day > i.due
                  ? l("Quá hạn", "Overdue")
                  : l("Chưa thu", "Receivable"),
            tone: i.paid ? "success" : s.day > i.due ? "warning" : "info",
            meta: `${l("Hạn ngày", "Due day")} ${i.due}`,
          }))}
        >
          {(id) => {
            const i = s.invoices.find((i) => i.id === id)!;
            return (
              <article className="panel-card invoice-detail">
                <span className="eyebrow">
                  {l("HÓA ĐƠN & THANH TOÁN", "INVOICES & COLLECTIONS")}
                </span>
                <h2>{i.label[locale]}</h2>
                <div className="metric-grid">
                  <div className="metric-card">
                    <small>{l("Giá trị", "Amount")}</small>
                    <strong>{money(i.amount, locale)}</strong>
                  </div>
                  <div className="metric-card">
                    <small>{l("Phát hành / đến hạn", "Issued / due")}</small>
                    <strong>
                      {i.issued} / {i.due}
                    </strong>
                  </div>
                </div>
                <NextMove
                  locale={locale}
                  tone={i.paid ? "success" : "warning"}
                  title={
                    i.paid
                      ? l("Tiền đã được ghi nhận.", "Payment has cleared.")
                      : i.expedited
                        ? l(
                            "Đã gửi nhắc thanh toán.",
                            "Payment follow-up sent.",
                          )
                        : l(
                            "Theo dõi thanh toán của khách hàng.",
                            "Follow up with your client.",
                          )
                  }
                >
                  <p>
                    {i.paid
                      ? l(
                          "Khoản này đã thu. Xem sổ giao dịch để đối chiếu.",
                          "This invoice is cleared. Review the ledger to reconcile.",
                        )
                      : i.expedited
                        ? l(
                            "Không tốn thêm lượt để nhắc lại. Chờ tối đa hai ngày theo cam kết thanh toán.",
                            "No further follow-up action is needed. Payment is expected within two days.",
                          )
                        : l(
                            "Nhắc thanh toán dùng 1 lượt CEO. Tiền chỉ tăng khi khách thực sự thanh toán.",
                            "Following up costs 1 CEO action. Cash increases when payment clears.",
                          )}
                  </p>
                  {!i.paid && (
                    <button
                      className="primary"
                      disabled={i.expedited || !s.actions}
                      onClick={() =>
                        dispatch({ type: "collect", invoiceId: i.id })
                      }
                    >
                      {l("Nhắc thanh toán · 1 lượt", "Follow up · 1 action")}
                    </button>
                  )}
                  {i.paid && (
                    <ManagementJump section="finance-ledger">
                      {l("Xem sổ giao dịch", "Review ledger")}
                    </ManagementJump>
                  )}
                </NextMove>
              </article>
            );
          }}
        </DecisionBoard>
        <section className="panel-card invoice-summary">
          <h2>{l("Đối chiếu hóa đơn", "Invoice register")}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{l("Hóa đơn", "Invoice")}</th>
                  <th>{l("Giá trị", "Amount")}</th>
                  <th>{l("Đến hạn", "Due")}</th>
                  <th>{l("Trạng thái", "Status")}</th>
                </tr>
              </thead>
              <tbody>
                {s.invoices.map((i) => (
                  <tr key={i.id}>
                    <td>{i.label[locale]}</td>
                    <td>{money(i.amount, locale)}</td>
                    <td>
                      {l("Ngày", "Day")} {i.due}
                    </td>
                    <td>
                      {i.paid
                        ? l("✓ Đã thu", "✓ Cleared")
                        : s.day > i.due
                          ? l("! Quá hạn", "! Overdue")
                          : l("Chưa thu", "Receivable")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!s.invoices.length && (
              <p className="empty-text">
                {l(
                  "Chưa có hóa đơn. Nghiệm thu sẽ tạo khoản phải thu.",
                  "No invoices yet. Acceptance creates receivables.",
                )}
              </p>
            )}
          </div>
        </section>
      </ManagementSection>
      <ManagementSection
        id="finance-ledger"
        label={l("Sổ giao dịch", "Ledger")}
      >
        <section className="panel-card">
          <h2>{l("Sổ giao dịch gần đây", "Recent ledger entries")}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{l("Ngày", "Day")}</th>
                  <th>{l("Nội dung", "Description")}</th>
                  <th>{l("Tiền mặt", "Cash")}</th>
                  <th>{l("Doanh thu", "Revenue")}</th>
                  <th>{l("Chi phí", "Expenses")}</th>
                </tr>
              </thead>
              <tbody>
                {s.ledger
                  .slice(-30)
                  .reverse()
                  .map((e) => (
                    <tr key={e.id}>
                      <td>{e.day}</td>
                      <td>{e.label[locale]}</td>
                      <td>{money(e.cash, locale)}</td>
                      <td>{money(e.revenue, locale)}</td>
                      <td>{money(e.expense, locale)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </ManagementSection>
    </ManagementPage>
  );
}
export function StrategyPanel(p: PanelProps) {
  const { s, locale, dispatch } = p;
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  return (
    <ManagementPage locale={locale} name={l("Chiến lược", "Strategy")}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {l("TẦM NHÌN DÀI HẠN", "THE LONG GAME")}
          </span>
          <h1>{l("Điều hành bằng lựa chọn.", "Lead with intention.")}</h1>
          <p>
            {l(
              "Chính sách được duy trì cho đến khi bạn thay đổi.",
              "Standing policies stay in effect until you change them.",
            )}
          </p>
        </div>
      </div>
      <ManagementSection
        id="strategy-goals"
        label={l("Mục tiêu & hướng đi", "Goals & direction")}
      >
        <Progression {...p} />
      </ManagementSection>
      <ManagementSection
        id="strategy-operations"
        label={l("Điều hành", "Operations")}
      >
        <DecisionBoard
          locale={locale}
          label={l("Chính sách điều hành", "Operating policies")}
          initialId={s.policy}
          items={Object.entries(POLICIES).map(([key, v]) => ({
            id: key,
            title: v.name[locale],
            status:
              s.policy === key
                ? l("Đang áp dụng", "Active")
                : l("Có thể chọn", "Available"),
            tone: s.policy === key ? "success" : "info",
            meta:
              s.policy === key
                ? l("Duy trì đến khi thay đổi", "Stays active until changed")
                : l("1 lượt CEO", "1 CEO action"),
          }))}
        >
          {(key) => {
            const v = POLICIES[key as State["policy"]];
            return (
              <article
                className={`panel-card policy ${s.policy === key ? "selected" : ""}`}
                key={key}
              >
                <span className="tag">
                  {s.policy === key
                    ? l("ĐANG ÁP DỤNG", "ACTIVE")
                    : l("1 LƯỢT CEO", "1 CEO ACTION")}
                </span>
                <h2>{v.name[locale]}</h2>
                <p>{v.description[locale]}</p>
                <NextMove
                  locale={locale}
                  tone={s.policy === key ? "success" : "info"}
                  title={
                    s.policy === key
                      ? l(
                          "Đội ngũ đang theo chính sách này.",
                          "Your team follows this policy.",
                        )
                      : l(
                          "Đánh đổi cho công việc tiếp theo.",
                          "A trade-off for future work.",
                        )
                  }
                >
                  <p>
                    {l(
                      "Đổi chính sách không xóa lỗi hoặc nợ kỹ thuật đã có. Đọc tác động trước khi dùng lượt CEO.",
                      "Changing policy does not remove existing defects or technical debt. Review the effects before spending a CEO action.",
                    )}
                  </p>
                </NextMove>
                <button
                  disabled={s.policy === key || !s.actions}
                  className="primary"
                  onClick={() =>
                    dispatch({ type: "policy", policy: key as State["policy"] })
                  }
                >
                  {s.policy === key
                    ? l("Đã chọn", "Selected")
                    : l("Chọn chính sách", "Choose policy")}
                </button>
              </article>
            );
          }}
        </DecisionBoard>
        <section className="panel-card">
          <div className="section-heading">
            <div>
              <h2>{l("Nhịp làm việc", "Working rhythm")}</h2>
              <p>
                {l(
                  "Tăng ca tăng 20% năng suất và lương; mỗi tuần mất năng lượng và tinh thần.",
                  "Overtime adds 20% output and payroll; it drains energy and morale every week.",
                )}
              </p>
            </div>
            <button
              className={s.overtime ? "danger-button" : ""}
              onClick={() =>
                dispatch({ type: "overtime", enabled: !s.overtime })
              }
            >
              {s.overtime
                ? l("Dừng tăng ca", "End overtime")
                : l("Bật tăng ca · 1 lượt", "Enable overtime · 1 action")}
            </button>
          </div>
        </section>
        <section className="panel-card">
          <div className="section-heading">
            <div>
              <h2>{l("Không gian để phát triển", "Room to grow")}</h2>
              <p>
                {l(
                  "Văn phòng lớn: 12 chỗ, chi phí chuyển $12.000, thêm $1.800/tháng.",
                  "Larger office: 12 seats, $12,000 move cost, +$1,800 monthly.",
                )}
              </p>
              <p className="unlock-requirements">
                {l("Điều kiện", "Requirements")}: {l("ngày", "day")} 30 ({s.day}
                /30) · {l("uy tín", "reputation")} 50 ({s.reputation}/50) ·{" "}
                {money(1200000, locale)} · {l("1 lượt CEO", "1 CEO action")}
              </p>
            </div>
            <button
              disabled={
                s.officeTier === 2 ||
                s.day < 30 ||
                s.reputation < 50 ||
                s.cash < 1200000 ||
                !s.actions
              }
              onClick={() =>
                p.confirm(
                  copy("Chuyển văn phòng?", "Move office?"),
                  copy(
                    "Chi $12.000. Phí tháng tăng $1.800. Cần ngày 30 và uy tín 50.",
                    "Pay $12,000. Monthly costs rise $1,800. Requires day 30 and reputation 50.",
                  ),
                  { type: "upgradeOffice" },
                )
              }
            >
              {s.officeTier === 2
                ? l("Đã mở rộng", "Expanded")
                : l("Nâng cấp văn phòng", "Upgrade office")}
            </button>
          </div>
        </section>
      </ManagementSection>
      <ManagementSection
        id="strategy-promises"
        label={l("Cam kết", "Promises")}
        count={s.promises.length}
      >
        <section className="panel-card">
          <h2>{l("Sổ cam kết", "Promise ledger")}</h2>
          {s.promises.map((pr) => (
            <div className="promise" key={pr.id}>
              <span className={`status-dot ${pr.status}`}>
                {pr.status === "kept"
                  ? "✓"
                  : pr.status === "broken"
                    ? "!"
                    : "○"}
              </span>
              <div>
                <strong>{pr.label[locale]}</strong>
                <small>
                  {pr.recipient[locale]} · {l("Hạn ngày", "Due day")} {pr.due}
                </small>
              </div>
              <span>
                {pr.status === "kept"
                  ? l("Đã giữ lời", "Kept")
                  : pr.status === "broken"
                    ? l("Đã thất hứa", "Broken")
                    : l("Đang mở", "Open")}
              </span>
            </div>
          ))}
          {!s.promises.length && (
            <p>
              {l(
                "Cam kết sẽ xuất hiện khi ký hợp đồng hoặc nhận lời với đội ngũ.",
                "Promises appear when you sign a contract or commit to your team.",
              )}
            </p>
          )}
        </section>
      </ManagementSection>
    </ManagementPage>
  );
}
export function HistoryPanel({ s, locale }: PanelProps) {
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const entries = s.history.filter(
    (h) =>
      (severity === "all" || h.type === severity) &&
      `${h.title[locale]} ${h.body[locale]} ${h.day}`
        .toLocaleLowerCase(locale)
        .includes(query.trim().toLocaleLowerCase(locale)),
  );
  return (
    <ManagementPage locale={locale} name={l("Nhật ký", "History")}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {l(
              "MỖI QUYẾT ĐỊNH ĐỀU CÓ DẤU VẾT",
              "EVERY DECISION LEAVES A TRACE",
            )}
          </span>
          <h1>{l("Câu chuyện công ty.", "Your company story.")}</h1>
        </div>
      </div>
      <ManagementSection
        id="history-week"
        label={l("Báo cáo tuần", "Weekly review")}
      >
        <section className="panel-card">
          <h2>{l("Tuần gần nhất", "Last week")}</h2>
          {s.weeks.length ? (
            <div className="metric-grid">
              <div className="metric-card">
                <small>{l("Tiền mặt thay đổi", "Cash change")}</small>
                <strong>{money(s.weeks.at(-1)!.cashDelta, locale)}</strong>
              </div>
              <div className="metric-card">
                <small>{l("Điểm việc hoàn thành", "Work delivered")}</small>
                <strong>{s.weeks.at(-1)!.work.toFixed(1)}</strong>
              </div>
              <div className="metric-card">
                <small>{l("Tinh thần", "Morale")}</small>
                <strong>{Math.round(s.weeks.at(-1)!.morale)}%</strong>
              </div>
            </div>
          ) : (
            <p>
              {l(
                "Báo cáo tuần mở vào ngày 7.",
                "Your first weekly review opens on day 7.",
              )}
            </p>
          )}
        </section>
      </ManagementSection>
      <ManagementSection
        id="history-events"
        label={l("Dòng sự kiện", "Timeline")}
        count={s.history.length}
      >
        <div className="history-filters">
          <label>
            {l("Tìm trong nhật ký", "Search history")}
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={l("Nội dung hoặc ngày…", "Text or day…")}
            />
          </label>
          <label>
            {l("Loại sự kiện", "Event type")}
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="all">{l("Tất cả sự kiện", "All events")}</option>
              <option value="info">{l("Thông tin", "Information")}</option>
              <option value="good">{l("Tích cực", "Positive")}</option>
              <option value="warning">{l("Cảnh báo", "Warning")}</option>
              <option value="critical">{l("Khẩn cấp", "Critical")}</option>
            </select>
          </label>
          <span role="status">
            {entries.length} {l("sự kiện", "events")}
          </span>
        </div>
        <section
          className="timeline"
          aria-label={l("Sự kiện công ty", "Company events")}
        >
          <DecisionBoard
            locale={locale}
            label={l("Sự kiện đã ghi nhận", "Recorded events")}
            items={entries
              .slice()
              .reverse()
              .map((h) => ({
                id: h.id,
                title: h.title[locale],
                status:
                  h.type === "good"
                    ? l("Tích cực", "Positive")
                    : h.type === "critical"
                      ? l("Khẩn cấp", "Critical")
                      : h.type === "warning"
                        ? l("Cảnh báo", "Warning")
                        : l("Thông tin", "Information"),
                tone:
                  h.type === "good"
                    ? "success"
                    : h.type === "critical"
                      ? "danger"
                      : h.type === "warning"
                        ? "warning"
                        : "info",
                meta: `${l("Ngày", "Day")} ${h.day}`,
              }))}
          >
            {(id) => {
              const h = entries.find((h) => h.id === id)!;
              return (
                <article className={`panel-card history-item ${h.type}`}>
                  <span>
                    {l("NGÀY", "DAY")} {h.day}
                  </span>
                  <div>
                    <h3>{h.title[locale]}</h3>
                    <p>{h.body[locale]}</p>
                    <small>
                      {l(
                        "Bản ghi tại thời điểm xảy ra sự kiện.",
                        "Recorded when this event occurred.",
                      )}
                    </small>
                  </div>
                </article>
              );
            }}
          </DecisionBoard>
          {!entries.length && (
            <p className="empty-text">
              {l(
                "Không có sự kiện phù hợp. Thử nội dung hoặc loại sự kiện khác.",
                "No matching events. Try another search or event type.",
              )}
            </p>
          )}
        </section>
      </ManagementSection>
    </ManagementPage>
  );
}
