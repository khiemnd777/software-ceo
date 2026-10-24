import type { PanelProps } from "./Panels";
import { NextMove } from "./DecisionBoard";
import { ManagementJump } from "./Management";
import { deliveryForecast } from "../simulation/selectors";
import { quality } from "../simulation/work";
import { ROLES, copy } from "../content/catalog";
import { money, Meter } from "./common";
export function ContractDetail(p: PanelProps & { contractId: string }) {
  const { s, locale, dispatch } = p;
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  const id = p.contractId;
  const c = s.contracts.find((c) => c.id === id)!;
  const w = s.work.find((w) => w.id === c.workId)!;
  const signed = c.stage === "signed";
  const forecast = deliveryForecast(s, c);
  return (
    <article className="panel-card project" key={c.id}>
      <div className="section-heading">
        <span className="tag">
          {c.type === "fixed"
            ? l("GIÁ CỐ ĐỊNH", "FIXED PRICE")
            : "TIME & MATERIALS"}
        </span>
        <span className="muted">
          {l("Tin cậy", "Trust")} {Math.round(c.trust)}%
        </span>
      </div>
      <h2>{w.label[locale]}</h2>
      <p>
        {c.client} · {money(c.price, locale)}
      </p>
      <NextMove
        locale={locale}
        tone={
          c.stage === "accepted"
            ? "success"
            : signed && (forecast.maxDays === null || forecast.late)
              ? "warning"
              : "info"
        }
        title={
          c.stage === "accepted"
            ? l("Theo dõi khoản phải thu.", "Follow the receivable.")
            : !signed
              ? l(
                  "Xem điều khoản trước khi ký.",
                  "Review terms before committing.",
                )
              : forecast.maxDays === null
                ? l(
                    "Còn việc chưa có người phụ trách.",
                    "Some work has no assigned capacity.",
                  )
                : forecast.late
                  ? l(
                      "Dự báo đang vượt hạn giao.",
                      "The forecast exceeds the deadline.",
                    )
                  : l(
                      "Theo dõi phát triển, QA và các mốc nghiệm thu.",
                      "Track development, QA and acceptance milestones.",
                    )
        }
      >
        <p>
          {c.stage === "accepted"
            ? l(
                "Nghiệm thu chưa có nghĩa tiền đã về tài khoản.",
                "Acceptance does not mean cash has cleared.",
              )
            : !signed
              ? l(
                  "Tiền cọc là tiền nhận trước. Hóa đơn các mốc có thể thanh toán chậm.",
                  "Deposits are advances. Milestone invoices may clear late.",
                )
              : l(
                  "Phân công không tạo tiến độ tức thì. Hai việc chia thời gian và giảm tập trung 15%.",
                  "Assignments do not instantly create progress. Two tasks split time and reduce focus by 15%.",
                )}
        </p>
        {signed && (
          <ManagementJump section="work-assignments">
            {l("Phân công đội ngũ", "Assign the team")}
          </ManagementJump>
        )}
        {c.stage === "accepted" && (
          <button className="primary" onClick={() => p.navigate("finance")}>
            {l("Xem hóa đơn", "View invoices")} →
          </button>
        )}
        {["lead", "qualified", "quoted"].includes(c.stage) && (
          <>
            <div className="forecast-box">
              {c.type === "fixed"
                ? l(
                    "Cọc 20% khi ký. 40% giữa kỳ. 40% cuối kỳ. Hóa đơn có kỳ hạn và có thể trả chậm.",
                    "20% deposit on signing. 40% midpoint. 40% final acceptance. Invoices have due dates and may be late.",
                  )
                : l(
                    `Tính phí mỗi tuần theo điểm việc thực tế đã làm (gồm QA và sửa lỗi), $${(c.rate / 100).toFixed(0)}/điểm; trần ngân sách $${(c.price / 100).toFixed(0)}. Không có cọc.`,
                    `Invoice actual work points weekly (including QA and repairs), $${(c.rate / 100).toFixed(0)}/point; not-to-exceed budget $${(c.price / 100).toFixed(0)}. No deposit.`,
                  )}
            </div>
            {c.stage === "lead" && (
              <button
                onClick={() => dispatch({ type: "qualify", contractId: c.id })}
              >
                {l("Làm rõ yêu cầu", "Qualify requirements")}
              </button>
            )}
            <label className="field-label">
              {l(
                "Chiết khấu báo giá · mỗi 5% tăng tin cậy 2,5",
                "Quote discount · each 5% adds 2.5 trust",
              )}
              <select
                value={c.discount}
                onChange={(e) =>
                  dispatch({
                    type: "quote",
                    contractId: c.id,
                    contractType: c.type,
                    discount: Number(e.target.value),
                  })
                }
              >
                {[0, 0.05, 0.1, 0.15].map((n) => (
                  <option key={n} value={n}>
                    {n * 100}%
                  </option>
                ))}
              </select>
            </label>
            <div className="button-row">
              <button
                onClick={() =>
                  dispatch({
                    type: "quote",
                    contractId: c.id,
                    contractType: c.type === "fixed" ? "tm" : "fixed",
                    discount: c.discount,
                  })
                }
              >
                {l("Đổi loại hợp đồng", "Switch contract type")}
              </button>
              {c.stage !== "quoted" ? (
                <button
                  onClick={() =>
                    dispatch({
                      type: "quote",
                      contractId: c.id,
                      contractType: c.type,
                      discount: 0,
                    })
                  }
                >
                  {l("Gửi báo giá", "Prepare quote")}
                </button>
              ) : (
                <button
                  className="primary"
                  onClick={() =>
                    p.confirm(
                      copy("Ký hợp đồng?", "Sign this contract?"),
                      copy(
                        `Cam kết giao trước ngày ${c.deadline}. Một lượt CEO. Tiền cọc ${c.type === "fixed" ? 20 : 0}%.`,
                        `Commit to delivery by day ${c.deadline}. One CEO action. ${c.type === "fixed" ? 20 : 0}% deposit.`,
                      ),
                      { type: "sign", contractId: c.id },
                    )
                  }
                >
                  {l("Ký hợp đồng · 1 lượt", "Sign · 1 action")}
                </button>
              )}
            </div>
          </>
        )}
      </NextMove>
      <div className="project-metrics">
        <div>
          <small>{l("Giao trước ngày", "Due day")}</small>
          <strong>{c.deadline}</strong>
        </div>
        <div>
          <small>{l("Chất lượng ước tính", "Known quality")}</small>
          <strong>
            {w.qa > 0
              ? `${Math.round(quality(w))}%`
              : l("Chưa kiểm thử", "Not tested")}
          </strong>
        </div>
        <div>
          <small>{l("Nợ kỹ thuật", "Technical debt")}</small>
          <strong>{Math.round(w.debt)}</strong>
        </div>
      </div>
      <Meter
        label={l("Tiến độ công việc", "Work progress")}
        value={w.done}
        max={
          w.status === "ready" || w.status === "released"
            ? w.done || 1
            : Math.max(w.estimated, w.done + 1)
        }
      />
      <p className="small">
        {w.done.toFixed(1)} /{" "}
        {w.discovered
          ? w.actual.toFixed(1)
          : `${Math.round(w.estimated * 0.8)}–${Math.round(w.estimated * 1.3)}`}{" "}
        {l("điểm việc", "work points")} · QA {w.qa.toFixed(1)} ·{" "}
        {w.bugs.filter((b) => b.known).length}{" "}
        {l("lỗi đã biết", "known defects")}
      </p>
      {signed && (
        <>
          <div className="forecast-box">
            <strong>{l("Dự báo giao hàng", "Delivery forecast")}</strong>
            <p>
              {forecast.maxDays === null
                ? l(
                    "Còn việc chưa có người phụ trách: cần Phát triển, QA hoặc Sửa lỗi phù hợp.",
                    "Some remaining work lacks assigned capacity: review Develop, QA and Fix defects.",
                  )
                : l(
                    `Còn khoảng ${forecast.minDays}–${forecast.maxDays} ngày theo phân công hiện tại.`,
                    `About ${forecast.minDays}–${forecast.maxDays} days remain with current assignments.`,
                  )}{" "}
              {forecast.late
                ? l("⚠ Có nguy cơ trễ hạn.", "⚠ Delivery is at risk.")
                : ""}
            </p>
            <p>
              {l("Cần thêm kiểm thử", "Testing still needed")}:{" "}
              {forecast.qaNeeded.toFixed(1)} WP ·{" "}
              {l("Sửa lỗi đã biết", "Known repair work")}:{" "}
              {forecast.knownFix.toFixed(1)} WP.{" "}
              {forecast.margin !== null
                ? l(
                    `Biên ước tính: ${(forecast.margin * 100).toFixed(0)}% (gồm chi phí còn lại, chưa dự báo lỗi mới).`,
                    `Estimated margin: ${(forecast.margin * 100).toFixed(0)}% (includes remaining costs, excludes new defects).`,
                  )
                : l(
                    "Phân công người để xem thời gian và biên lợi nhuận dự kiến.",
                    "Assign staff to estimate completion and margin.",
                  )}
            </p>
          </div>
          <section className="project-team">
            <h3>{l("Đội ngũ dự án", "Project team")}</h3>
            {s.employees
              .filter((e) => e.assignments.some((a) => a.target === w.id))
              .map((e) => (
                <div className="project-team-row" key={e.id}>
                  <strong>{e.name}</strong>
                  <span>{ROLES[e.role][locale]}</span>
                  <small>
                    {e.assignments
                      .filter((a) => a.target === w.id)
                      .map(
                        (a) =>
                          ({
                            develop: l("Phát triển", "Development"),
                            qa: "QA",
                            fix: l("Sửa lỗi", "Fix defects"),
                            refactor: l("Giảm nợ", "Refactor"),
                            research: l("Nghiên cứu", "Research"),
                            growth: l("Tăng trưởng", "Growth"),
                            support: l("Hỗ trợ", "Support"),
                          })[a.kind],
                      )
                      .join(" / ")}
                  </small>
                </div>
              ))}
            {!s.employees.some((e) =>
              e.assignments.some((a) => a.target === w.id),
            ) && (
              <p>
                {l(
                  "Chưa có người được phân công cho dự án này.",
                  "Nobody is assigned to this project yet.",
                )}
              </p>
            )}
          </section>
          <div className="button-row">
            <button
              onClick={() => {
                const e =
                  s.employees.find((e) => e.role === "developer") ??
                  s.employees[0];
                p.openAssignments?.(w.id, e?.id);
              }}
            >
              {l("Phân công Dev", "Assign developer")}
            </button>
            <button
              onClick={() => {
                const e =
                  s.employees.find((e) => e.role === "qa") ?? s.employees[1];
                p.openAssignments?.(w.id, e?.id);
              }}
            >
              {l("Phân công QA", "Assign QA")}
            </button>
          </div>
          <div className="button-row">
            <button
              disabled={c.midAccepted || w.done < w.actual * 0.5}
              onClick={() =>
                dispatch({
                  type: "accept",
                  contractId: c.id,
                  milestone: "mid",
                })
              }
            >
              {c.midAccepted ? "✓ " : ""}
              {l("Nghiệm thu giữa kỳ", "Accept midpoint")}
            </button>
            <button
              className="primary"
              disabled={w.done < w.actual}
              onClick={() =>
                dispatch({
                  type: "accept",
                  contractId: c.id,
                  milestone: "final",
                })
              }
            >
              {l("Nghiệm thu cuối kỳ", "Accept delivery")}
            </button>
            {w.done >= w.actual && (
              <button
                className="text-button danger-text"
                onClick={() =>
                  p.confirm(
                    copy("Vượt cổng chất lượng?", "Override quality gate?"),
                    copy(
                      "Tốn 1 lượt CEO. Tin cậy −15, uy tín −5. Lỗi ẩn có thể xuất hiện sau giao hàng.",
                      "Costs 1 CEO action. Trust −15, reputation −5. Hidden defects may surface after release.",
                    ),
                    {
                      type: "accept",
                      contractId: c.id,
                      milestone: c.midAccepted ? "final" : "mid",
                      override: true,
                    },
                  )
                }
              >
                {l("Đánh giá giao hàng có rủi ro", "Review risky delivery")}
              </button>
            )}
          </div>
          {c.changePending && (
            <div className="forecast-box">
              <strong>
                {l("Khách đề nghị thêm phạm vi", "Scope change requested")}
              </strong>
              <p>
                {l(
                  "6 điểm việc. Lựa chọn mỗi phương án tốn 1 lượt.",
                  "6 work points. Each response costs 1 action.",
                )}
              </p>
              <div className="button-row">
                {(["paid", "free", "extend", "decline"] as const).map(
                  (ch, i) => (
                    <button
                      key={ch}
                      onClick={() =>
                        dispatch({
                          type: "change",
                          contractId: c.id,
                          choice: ch,
                        })
                      }
                    >
                      {
                        [
                          l("Tính phí $4.500", "Charge $4,500"),
                          l("Miễn phí", "Include free"),
                          l("Lùi 14 ngày", "Extend 14 days"),
                          l("Từ chối", "Decline"),
                        ][i]
                      }
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </>
      )}
      {c.stage === "accepted" && (
        <div className="success-note">
          ✓{" "}
          {l(
            "Đã nghiệm thu. Kiểm tra hóa đơn tại Tài chính.",
            "Accepted. Review collections in Finance.",
          )}
        </div>
      )}
    </article>
  );
}
