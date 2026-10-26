import { useState } from "react";
import {
  ManagementPage,
  ManagementSection,
  ManagementJump,
} from "./Management";
import { DecisionBoard, NextMove } from "./DecisionBoard";
import type { PanelProps } from "./Panels";
import type { Strategy, Segment } from "../simulation/types";
import { FEATURES, EXPERIMENTS, TERMS } from "../content/products";
import { SEGMENTS, copy } from "../content/catalog";
import { quality } from "../simulation/work";
import { funnel } from "../gameplay/product";
import { campaignEvaluation } from "../gameplay/progression";
import { runway } from "../simulation/finance";
import { money, Meter } from "./common";
export function ProductWork(p: PanelProps) {
  const { s, locale, dispatch } = p;
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  if (!s.product.exists) return null;
  return (
    <section className="product-work">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {l("LỘ TRÌNH SẢN PHẨM", "PRODUCT ROADMAP")}
          </span>
          <h2>{s.product.name[locale]}</h2>
        </div>
        <button onClick={() => p.navigate("market")}>
          {l("Xem khách hàng", "View customers")} →
        </button>
      </div>
      {!s.product.launched && !s.work.some((w) => w.kind === "mvp") && (
        <section className="panel-card">
          <h3>{l("Tạo MVP đầu tiên", "Build your first MVP")}</h3>
          <p>
            {l(
              "Cần 15 điểm bằng chứng. Phát triển 18 điểm việc, QA, rồi phát hành.",
              "Requires 15 evidence. Build 18 work points, test it, then release.",
            )}
          </p>
          <button
            className="primary"
            onClick={() => dispatch({ type: "buildMvp" })}
          >
            {l("Bắt đầu MVP · 1 lượt", "Start MVP · 1 action")}
          </button>
        </section>
      )}
      <div className="cards-grid">
        {s.work
          .filter((w) => w.kind === "mvp" && w.status !== "released")
          .map((w) => (
            <article className="panel-card" key={w.id}>
              <span className="tag">MVP</span>
              <h3>{w.label[locale]}</h3>
              <Meter
                label={l("Tiến độ công việc", "Work progress")}
                value={w.done}
                max={
                  w.status === "ready"
                    ? w.done
                    : Math.max(w.estimated, w.done + 1)
                }
              />
              <p>
                {w.done.toFixed(1)} {l("điểm việc", "work points")} · QA{" "}
                {w.qa.toFixed(1)} ·{" "}
                {w.qa > 0
                  ? `${Math.round(quality(w))}% ${l("chất lượng đã biết", "known quality")}`
                  : l("Chưa kiểm thử", "Not tested")}
              </p>
              <button
                className="primary"
                disabled={w.done < w.actual}
                onClick={() => dispatch({ type: "release", workId: w.id })}
              >
                {l("Phát hành MVP", "Release MVP")}
              </button>
            </article>
          ))}
      </div>
      <DecisionBoard
        locale={locale}
        label={l("Lộ trình tính năng", "Feature backlog")}
        initialId={p.selected}
        items={FEATURES.filter((f) => f.concept === s.product.concept).map(
          (f) => ({
            id: f.id,
            title: f.name[locale],
            status: s.product.features.includes(f.id)
              ? l("Đã phát hành", "Released")
              : s.work.some((w) => w.featureId === f.id)
                ? l("Đang thực hiện", "In progress")
                : s.product.needs.includes(f.id)
                  ? l("Khách đang cần", "Customer need")
                  : l("Cơ hội", "Opportunity"),
            tone: s.product.features.includes(f.id) ? "success" : "info",
            meta: `${f.effort} WP · +${f.fit} ${l("độ phù hợp đúng phân khúc", "fit in target segment")}`,
          }),
        )}
      >
        {(id) => {
          const f = FEATURES.find((f) => f.id === id)!;
          const w = s.work.find((w) => w.featureId === f.id);
          const released = s.product.features.includes(f.id);
          return (
            <article
              className={`panel-card feature ${released ? "completed" : ""}`}
              key={f.id}
            >
              <span className="tag">
                {released
                  ? l("✓ ĐÃ PHÁT HÀNH", "✓ RELEASED")
                  : s.product.needs.includes(f.id)
                    ? l("KHÁCH ĐANG CẦN", "CUSTOMER NEED")
                    : l("CƠ HỘI", "OPPORTUNITY")}
              </span>
              <h3>{f.name[locale]}</h3>
              <p>{f.need[locale]}</p>
              {!released && (
                <NextMove
                  locale={locale}
                  title={
                    !w
                      ? l(
                          "Chọn việc tạo giá trị cho khách hàng.",
                          "Choose work that creates customer value.",
                        )
                      : w.done < w.actual
                        ? l(
                            "Phát triển và QA song song.",
                            "Develop and test alongside each other.",
                          )
                        : l(
                            "Đọc kết quả QA trước khi phát hành.",
                            "Review QA before releasing.",
                          )
                  }
                >
                  <p>
                    {!w
                      ? l(
                          "Đưa vào roadmap dùng 1 lượt CEO. Sau đó cần phân công đội ngũ để tạo tiến độ.",
                          "Planning costs 1 CEO action. Assign the team to make progress.",
                        )
                      : l(
                          "Phát hành không tự tạo khách hàng hay doanh thu tức thì.",
                          "Releasing does not instantly create customers or revenue.",
                        )}
                  </p>
                  {w && (
                    <button onClick={() => p.openAssignments?.(w.id)}>
                      {l("Phân công đội ngũ", "Assign the team")}
                    </button>
                  )}
                </NextMove>
              )}
              <div className="feature-meta">
                <span>
                  {f.effort} {l("điểm việc", "work points")}
                </span>
                <span>
                  +{f.fit} {l("độ phù hợp", "fit")}*
                </span>
              </div>
              <small>
                {l(
                  "* Khi đúng phân khúc. Lỗi ẩn có thể làm tăng hỗ trợ.",
                  "* When targeting the right segment. Hidden defects can create support load.",
                )}
              </small>
              {w ? (
                <>
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
                    {w.done.toFixed(1)} WP · QA {w.qa.toFixed(1)} ·{" "}
                    {w.bugs.filter((b) => b.known).length}{" "}
                    {l("lỗi đã biết", "known defects")}
                  </p>
                  {!released && (
                    <div className="button-row">
                      <button
                        className="primary"
                        disabled={w.done < w.actual}
                        onClick={() =>
                          dispatch({ type: "release", workId: w.id })
                        }
                      >
                        {l("Phát hành", "Release")}
                      </button>
                      {w.done >= w.actual && (
                        <button
                          className="text-button danger-text"
                          onClick={() =>
                            p.confirm(
                              copy("Phát hành có rủi ro?", "Risky release?"),
                              copy(
                                "Tốn 1 lượt. Uy tín −8, độ tin cậy −12. Lỗi ẩn có thể làm khách rời đi.",
                                "Costs 1 action. Reputation −8, reliability −12. Hidden defects can cause churn.",
                              ),
                              { type: "release", workId: w.id, override: true },
                            )
                          }
                        >
                          {l("Vượt cổng QA", "Override QA")}
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <button
                  className="primary"
                  onClick={() =>
                    dispatch({ type: "startFeature", featureId: f.id })
                  }
                >
                  {l("Đưa vào roadmap · 1 lượt", "Plan feature · 1 action")}
                </button>
              )}
            </article>
          );
        }}
      </DecisionBoard>
    </section>
  );
}
export function Experiments(p: PanelProps) {
  const { s, locale, dispatch } = p;
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  if (s.strategy !== "startup" && s.secondary !== "startup") return null;
  return (
    <section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {l("HIỂU TRƯỚC KHI MỞ RỘNG", "LEARN BEFORE YOU SCALE")}
          </span>
          <h2>{l("Thử nghiệm có bằng chứng", "Experiments, with evidence")}</h2>
        </div>
        <span className="pill">
          {s.venture.evidence}/100 {l("bằng chứng", "evidence")}
        </span>
      </div>
      <p>
        {l(
          "Phân công Nghiên cứu trong bảng công việc. Kết quả ghi rõ mẫu, số phản hồi và ngưỡng; tiêu tiền không đảm bảo giả thuyết đúng.",
          "Assign Research in the work board. Results show sample size, responses and thresholds. Spending does not guarantee validation.",
        )}
      </p>
      <div className="cards-grid feature-grid">
        {EXPERIMENTS.map((e) => {
          const w = s.work.find((w) => w.experimentId === e.id),
            result = s.venture.results.find((r) => r.id === e.id);
          return (
            <article className="panel-card" key={e.id}>
              <h3>{e.name[locale]}</h3>
              <p>{e.hypothesis[locale]}</p>
              <small>
                {money(e.cost, locale)} · {e.effort} WP · {l("Mẫu", "Sample")}{" "}
                {e.sample}
              </small>
              {result ? (
                <div className="experiment-result">
                  <span className={`tag ${result.positive ? "" : "amber"}`}>
                    {result.positive
                      ? l("CÓ TÍN HIỆU", "SUPPORTED")
                      : l("CẦN XEM LẠI", "REVISIT")}
                  </span>
                  <p>
                    {result.responders}/{result.sample} ·{" "}
                    {l("Ngưỡng", "Threshold")} {Math.round(e.threshold * 100)}%
                    <br />+{result.evidence} {l("bằng chứng", "evidence")}
                  </p>
                </div>
              ) : w ? (
                <>
                  <Meter
                    label={l("Tiến độ công việc", "Work progress")}
                    value={w.done}
                    max={Math.max(w.estimated, w.done + 1)}
                  />
                  <p>
                    {w.done.toFixed(1)} WP ·{" "}
                    {l(
                      "Phân công người nghiên cứu để tiếp tục.",
                      "Assign a researcher to continue.",
                    )}
                  </p>
                </>
              ) : (
                <button
                  className="primary"
                  onClick={() =>
                    dispatch({ type: "experiment", experimentId: e.id })
                  }
                >
                  {l("Khởi động · 1 lượt", "Start · 1 action")}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
export function MarketPanel(p: PanelProps) {
  const { s, locale, dispatch } = p;
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  const prod = s.product;
  const f = funnel(s);
  const [budget, setBudget] = useState(prod.marketing),
    [price, setPrice] = useState(prod.price);
  const preview = funnel({
    ...s,
    product: { ...prod, price, marketing: budget },
  });
  return (
    <ManagementPage locale={locale} name={l("Thị trường", "Market")}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {l("TẠO RA ĐIỀU KHÁCH HÀNG CẦN", "MAKE SOMETHING PEOPLE NEED")}
          </span>
          <h1>{l("Hiểu khách hàng của bạn.", "Know your customers.")}</h1>
          <p>
            {l(
              "Nhu cầu, chuyển đổi và giữ chân là ba việc khác nhau.",
              "Demand, conversion and retention are different problems.",
            )}
          </p>
        </div>
      </div>
      <ManagementSection
        id="market-segments"
        label={l("Phân khúc", "Segments")}
      >
        <DecisionBoard
          locale={locale}
          label={l("Bản đồ nhu cầu", "Demand map")}
          initialId={prod.segment}
          items={Object.entries(SEGMENTS).map(([id, v]) => ({
            id,
            title: v.name[locale],
            subtitle: v.need[locale],
            status:
              prod.exists && prod.segment === id
                ? l("Phân khúc hiện tại", "Your segment")
                : l("Thị trường", "Market"),
            tone: prod.exists && prod.segment === id ? "success" : "info",
            meta: `${s.market[id as Segment].demand} ${l("nhu cầu / tháng", "demand / month")}`,
          }))}
        >
          {(id) => {
            const v = SEGMENTS[id as Segment];
            return (
              <article
                className={`panel-card ${prod.exists && prod.segment === id ? "selected" : ""}`}
                key={id}
              >
                <span className="tag">
                  {prod.exists && prod.segment === id
                    ? l("PHÂN KHÚC HIỆN TẠI", "YOUR SEGMENT")
                    : l("THỊ TRƯỜNG", "MARKET")}
                </span>
                <h2>{v.name[locale]}</h2>
                <p>{v.need[locale]}</p>
                <NextMove
                  locale={locale}
                  title={
                    prod.exists
                      ? l(
                          "Đối chiếu nhu cầu với sản phẩm.",
                          "Match demand to your product.",
                        )
                      : l(
                          "Chọn hướng kinh doanh phù hợp.",
                          "Choose a business direction.",
                        )
                  }
                >
                  <p>
                    {prod.exists
                      ? l(
                          "Nhu cầu không đồng nghĩa sẽ mua. So sánh độ phù hợp, giá và tỷ lệ rời bỏ trước khi tăng ngân sách.",
                          "Demand does not guarantee purchases. Review fit, price and churn before increasing your budget.",
                        )
                      : l(
                          "Chưa có sản phẩm để đặt giá. Cơ hội Outsourcing nằm trong Công việc; hướng đi mới nằm trong Chiến lược.",
                          "No product is available for pricing yet. Find outsourcing opportunities in Work and new business directions in Strategy.",
                        )}
                  </p>
                  {prod.exists ? (
                    <ManagementJump section="market-customers">
                      {l("Xem khách hàng & giá", "Review customers & pricing")}
                    </ManagementJump>
                  ) : (
                    <button
                      className="primary"
                      onClick={() => p.navigate("work")}
                    >
                      {l("Xem cơ hội công việc", "View work opportunities")} →
                    </button>
                  )}
                </NextMove>
                <div className="stat-line">
                  <span>{l("Nhu cầu cơ sở/tháng", "Base monthly demand")}</span>
                  <strong>{s.market[id as Segment].demand}</strong>
                </div>
                <div className="stat-line">
                  <span>{l("Kỳ vọng chất lượng", "Quality expectation")}</span>
                  <strong>{v.quality}/100</strong>
                </div>
                <div className="stat-line">
                  <span>{l("Biến động quý", "Quarterly change")}</span>
                  <strong>
                    {s.market[id as Segment].trend > 0 ? "+" : ""}
                    {s.market[id as Segment].trend}
                  </strong>
                </div>
              </article>
            );
          }}
        </DecisionBoard>
      </ManagementSection>
      {prod.exists && (
        <ManagementSection
          id="market-customers"
          label={l("Khách hàng & giá", "Customers & pricing")}
        >
          <div className="metric-grid">
            {[
              [
                l("Doanh thu thuê bao / tháng", "Monthly recurring revenue"),
                money(prod.paid * prod.price, locale),
              ],
              [l("Khách trả phí", "Paying customers"), String(prod.paid)],
              [
                l("Người dùng miễn phí", "Free active users"),
                String(prod.free),
              ],
              [
                l("Tỷ lệ rời bỏ / tháng", "Monthly churn"),
                `${(prod.churnRate * 100).toFixed(1)}%`,
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
              <h2>{prod.name[locale]}</h2>
              <div className="two-stats">
                <label>
                  {l("Độ phù hợp", "Market fit")} {Math.round(prod.fit)}
                  <Meter
                    label={l("Độ phù hợp", "Market fit")}
                    value={prod.fit}
                  />
                </label>
                <label>
                  {l("Độ tin cậy", "Reliability")}{" "}
                  {Math.round(prod.reliability)}
                  <Meter
                    label={l("Độ tin cậy", "Reliability")}
                    value={prod.reliability}
                  />
                </label>
              </div>
              <p>
                {l("Chu kỳ gần nhất", "Last cycle")}: +{prod.lastNew}{" "}
                {l("khách mới", "new customers")} / −{prod.lastChurn}{" "}
                {l("rời đi", "churned")}.
              </p>
              <div className="forecast-box">
                {l(
                  "Dự báo theo điều kiện hiện tại",
                  "Forecast with current conditions",
                )}
                : {f.leads} leads · {(f.conversion * 100).toFixed(1)}%{" "}
                {l("chuyển đổi", "conversion")} · {(f.churn * 100).toFixed(1)}%
                churn.
                <br />
                {l(
                  "Leads = nhu cầu + marketing + giới thiệu + uy tín + độ nhận biết; điều chỉnh theo cạnh tranh.",
                  "Leads combine demand, marketing, referrals, reputation and awareness, adjusted for competition.",
                )}
              </div>
              <p>
                <strong>
                  {l("Hàng đợi hỗ trợ", "Support queue")}:{" "}
                  {prod.support.toFixed(1)} {l("điểm việc", "work points")}
                </strong>
              </p>
              <p className="small">
                {l(
                  "Số khách tăng sẽ tạo thêm yêu cầu mỗi ngày. Phân công Hỗ trợ khách tại mục Thị trường ở bảng công việc; Ops, QA và Growth phù hợp nhất.",
                  "A larger customer base creates more requests daily. Assign Customer support to Market in the work board; Ops, QA and Growth have the best role fit.",
                )}
              </p>
              <div className="button-row">
                <button onClick={() => p.openAssignments?.("market")}>
                  {l("Phân công hỗ trợ", "Assign support")}
                </button>
                <button
                  onClick={() => dispatch({ type: "survey" })}
                  disabled={prod.surveyed}
                >
                  {prod.surveyed
                    ? l("✓ Đã khảo sát nhu cầu", "✓ Needs surveyed")
                    : l(
                        "Khảo sát khách hàng · 1 lượt",
                        "Survey customers · 1 action",
                      )}
                </button>
              </div>
            </section>
            <section className="panel-card">
              <h2>{l("Giá & ngân sách", "Pricing & budget")}</h2>
              <p>
                {l(
                  "Thay đổi có hiệu lực ở kỳ tháng tiếp theo. Giá cao hơn tăng doanh thu mỗi khách và áp lực rời bỏ.",
                  "Changes apply at the next billing cycle. Higher prices increase revenue per customer and churn pressure.",
                )}
              </p>
              <label className="field-label">
                {l("Ngân sách marketing / tháng", "Monthly marketing budget")}
                <select
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                >
                  {[0, 100000, 200000, 300000, 500000, 1000000].map((n) => (
                    <option key={n} value={n}>
                      {money(n, locale)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                disabled={budget === prod.marketing}
                onClick={() =>
                  p.confirm(
                    copy(
                      "Đổi ngân sách marketing?",
                      "Change marketing budget?",
                    ),
                    copy(
                      `Ngân sách $${budget / 100}/tháng. Tốn 1 lượt CEO. Không tự sửa tỷ lệ churn.`,
                      `Budget: $${budget / 100}/month. Costs 1 CEO action. Does not fix churn.`,
                    ),
                    { type: "marketing", amount: budget },
                  )
                }
              >
                {l("Áp dụng ngân sách", "Apply budget")}
              </button>
              <label className="field-label">
                {l("Giá gói / tháng", "Monthly plan price")}
                <select
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                >
                  {[2900, 4900, 5900, 7900, 9900, 12900, 15900, 19900].map(
                    (n) => (
                      <option key={n} value={n}>
                        {money(n, locale)}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <div className="forecast-box">
                {l(
                  "Dự báo với giá/ngân sách đang chọn",
                  "Preview with selected price/budget",
                )}
                : {preview.leads} {l("khách tiềm năng", "leads")} ·{" "}
                {(preview.conversion * 100).toFixed(1)}%{" "}
                {l("chuyển đổi", "conversion")} ·{" "}
                {(preview.churn * 100).toFixed(1)}% {l("rời bỏ", "churn")}.{" "}
                {l(
                  "Đây là ước tính; thị trường và chất lượng còn thay đổi.",
                  "This is an estimate; market conditions and quality may change.",
                )}
              </div>
              <button
                disabled={price === prod.price}
                onClick={() =>
                  p.confirm(
                    copy("Đổi giá gói?", "Change plan price?"),
                    copy(
                      `Giá mới $${price / 100}/tháng. Giá cao hơn làm giảm chuyển đổi và tăng churn. Tốn 1 lượt CEO.`,
                      `New price: $${price / 100}/month. Higher prices lower conversion and increase churn. Costs 1 CEO action.`,
                    ),
                    { type: "price", amount: price },
                  )
                }
              >
                {l("Áp dụng giá", "Apply price")}
              </button>
            </section>
          </div>
        </ManagementSection>
      )}
      {(s.strategy === "outsourcing" ||
        s.secondary === "outsourcing" ||
        s.strategy === "startup") && (
        <ManagementSection
          id="market-leads"
          label={l("Cơ hội", "Opportunities")}
        >
          <section className="panel-card">
            <h2>{l("Khách hàng tiếp theo", "Your next client")}</h2>
            <p>
              {l(
                "Tìm khách mới hoặc hợp đồng lặp lại. Nguồn lực vẫn được chia sẻ với mọi dự án đang chạy.",
                "Discover new leads and repeat business. All projects share the same team capacity.",
              )}
            </p>
            <button
              className="primary"
              onClick={() => {
                if (dispatch({ type: "findLead" })) p.navigate("work");
              }}
            >
              {l("Tìm cơ hội · 1 lượt", "Find a lead · 1 action")}
            </button>
          </section>
        </ManagementSection>
      )}
      {(s.strategy === "startup" || s.secondary === "startup") && (
        <ManagementSection
          id="market-experiments"
          label={l("Thử nghiệm", "Experiments")}
        >
          <Experiments {...p} />
        </ManagementSection>
      )}
    </ManagementPage>
  );
}
export function VentureFinance(p: PanelProps) {
  const { s, locale, dispatch } = p;
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  if (s.strategy !== "startup" && s.secondary !== "startup") return null;
  return (
    <section className="venture-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {l("VỐN LUÔN CÓ CÁI GIÁ", "CAPITAL HAS A PRICE")}
          </span>
          <h2>{l("Vốn & quyền sở hữu", "Capital & ownership")}</h2>
        </div>
        <span className="pill">
          {l("Nhà sáng lập", "Founder")} {s.venture.founderEquity.toFixed(0)}%
        </span>
      </div>
      <p>
        {l(
          "Một vòng đầu tư trong campaign. Vốn vào tiền mặt, không vào doanh thu. Cam kết với nhà đầu tư đi vào Sổ cam kết.",
          "One funding round per campaign. Investment increases cash, not revenue. Investor commitments enter your Promise ledger.",
        )}
      </p>
      {!s.venture.rounds && (
        <button
          className="primary"
          disabled={s.venture.offered}
          onClick={() => dispatch({ type: "pitch" })}
        >
          {s.venture.offered
            ? l("✓ Đã nhận đề nghị", "✓ Offers received")
            : l(
                "Pitch · cần 35 bằng chứng + 80 người dùng",
                "Pitch · requires 35 evidence + 80 users",
              )}
        </button>
      )}
      <div className="cards-grid funding-grid">
        {TERMS.map((t) => (
          <article className="panel-card" key={t.id}>
            <span className="tag">
              {t.equity}% {l("SAU ĐẦU TƯ", "POST-MONEY")}
            </span>
            <h3>{t.name[locale]}</h3>
            <strong className="funding-amount">
              {money(t.amount, locale)}
            </strong>
            <p>{t.description[locale]}</p>
            <small>
              {l("Yêu cầu bằng chứng", "Evidence required")}: {t.evidence}
            </small>
            <button
              className="primary"
              disabled={
                !s.venture.offered ||
                !!s.venture.rounds ||
                s.venture.evidence < t.evidence
              }
              onClick={() =>
                p.confirm(
                  copy("Ký thỏa thuận đầu tư?", "Accept the investment?"),
                  copy(
                    `${t.description.vi} Founder còn ${100 - t.equity}%. Không thể gọi thêm vòng trong MVP.`,
                    `${t.description.en} Founder retains ${100 - t.equity}%. No further rounds in this MVP.`,
                  ),
                  { type: "funding", termId: t.id },
                )
              }
            >
              {s.venture.investor === t.id
                ? l("✓ Đã nhận vốn", "✓ Funded")
                : l("Xem & xác nhận", "Review & confirm")}
            </button>
          </article>
        ))}
      </div>
      <section className="panel-card">
        <h3>{l("Chuyển hướng có chủ đích", "A deliberate pivot")}</h3>
        <p>
          {l(
            "Chi $6.000 và 1 lượt. Dừng phát triển sản phẩm 7 ngày, giữ 60% khách. Độ phù hợp phải được xây lại.",
            "Costs $6,000 and 1 action. Product development pauses 7 days; retain 60% of users. Fit must be rebuilt.",
          )}
        </p>
        <div className="button-row">
          {Object.entries(SEGMENTS)
            .filter(([key]) => key !== s.product.segment)
            .map(([key, seg]) => (
              <button
                key={key}
                onClick={() =>
                  p.confirm(
                    copy("Chuyển phân khúc?", "Pivot to a new segment?"),
                    copy(
                      `Chuyển sang ${seg.name.vi}. Chi $6.000. Mất 40% khách hiện tại, dừng 7 ngày.`,
                      `Pivot to ${seg.name.en}. Pay $6,000. Lose 40% of current users; pause 7 days.`,
                    ),
                    { type: "pivot", segment: key as Segment },
                  )
                }
              >
                {seg.name[locale]}
              </button>
            ))}
        </div>
      </section>
    </section>
  );
}
export function Progression(p: PanelProps) {
  const { s, locale, dispatch } = p;
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  const ev = campaignEvaluation(s),
    r = runway(s);
  const goals =
    s.mode === "rescue"
      ? [
          [
            l(
              "Tiền mặt ít nhất $20.000 ở ngày 180",
              "At least $20,000 cash on day 180",
            ),
            money(s.cash, locale),
          ],
          [
            l("Không còn nợ lương", "No unpaid payroll"),
            s.liabilities.some((x) => x.kind === "payroll")
              ? l("Chưa đạt", "Not met")
              : l("Đạt", "Met"),
          ],
        ]
      : s.mode === "deadline"
        ? [
            [
              l(
                "Giao xong 3 hợp đồng trước ngày 180",
                "Complete 3 contracts by day 180",
              ),
              `${s.metrics.completedContracts}/3`,
            ],
            [
              l("85% mốc đúng hẹn", "85% on-time milestones"),
              `${(ev.onTime * 100).toFixed(1)}%`,
            ],
          ]
        : s.mode === "fit"
          ? [
              [
                l(
                  "Độ phù hợp ít nhất 65 ở ngày 360",
                  "Fit at least 65 on day 360",
                ),
                `${Math.round(s.product.fit)}/65`,
              ],
              [
                l("MRR ít nhất $10.000", "MRR at least $10,000"),
                money(s.product.paid * s.product.price, locale),
              ],
            ]
          : s.strategy === "product"
            ? [
                [
                  l("MRR ít nhất $20.000", "MRR at least $20,000"),
                  money(s.product.paid * s.product.price, locale),
                ],
                [
                  l("Churn không quá 5%", "Churn at most 5%"),
                  `${(s.product.churnRate * 100).toFixed(1)}%`,
                ],
                [
                  l(
                    "3 tháng dòng tiền hoạt động dương",
                    "3 positive operating cash-flow months",
                  ),
                  `${ev.positiveMonths}/3`,
                ],
              ]
            : s.strategy === "outsourcing"
              ? [
                  [
                    l(
                      "Biên hoạt động 3 tháng ≥15%",
                      "3-month operating margin ≥15%",
                    ),
                    `${(ev.margin * 100).toFixed(1)}%`,
                  ],
                  [
                    l(
                      "Ít nhất 85% mốc đúng hẹn",
                      "At least 85% on-time milestones",
                    ),
                    `${Math.round(ev.onTime * 100)}%`,
                  ],
                  [
                    l("Hai khách hàng quay lại", "Two repeat clients"),
                    `${s.metrics.repeatClients.length}/2`,
                  ],
                ]
              : [
                  [
                    l("Độ phù hợp ít nhất 60", "Market fit at least 60"),
                    `${Math.round(s.product.fit)}`,
                  ],
                  [
                    l("1.000 MAU hoặc $10.000 MRR", "1,000 MAU or $10,000 MRR"),
                    `${s.product.paid + s.product.free} / ${money(s.product.paid * s.product.price, locale)}`,
                  ],
                  [
                    l(
                      "Duy trì được ít nhất 9 tháng",
                      "At least 9 months runway",
                    ),
                    Number.isFinite(r) ? r.toFixed(1) : "∞",
                  ],
                ];
  return (
    <>
      <section className="panel-card">
        <span className="eyebrow">
          {s.mode === "career"
            ? l("CHIẾN DỊCH 36 THÁNG", "36-MONTH CAMPAIGN")
            : s.mode === "sandbox"
              ? "SANDBOX"
              : l("THỬ THÁCH NGẮN", "SHORT CHALLENGE")}
        </span>
        <h2>{l("Đích đến được xác định rõ.", "A clear destination.")}</h2>
        <p>
          {l("Mục tiêu hiện tại", "Current victory track")}:{" "}
          <strong>{s.strategy.toUpperCase()}</strong> · {l("Tháng", "Month")}{" "}
          {Math.floor(
            ((s.status === "playing" ? s.day : s.clock.lastClosedDay) - 1) / 30,
          ) + 1}{" "}
          · {l("Ngày tổng kết", "Review day")}:{" "}
          {s.mode === "career"
            ? 1080
            : s.mode === "fit"
              ? 360
              : s.mode === "sandbox"
                ? "∞"
                : 180}
        </p>
        {goals.map(([name, val]) => (
          <div className="stat-line" key={name}>
            <span>{name}</span>
            <strong>{val}</strong>
          </div>
        ))}
        <p className="small">
          {l(
            "Không đạt mục tiêu vẫn được tiếp tục Sandbox. Chỉ mất khả năng trả lương sau 14 ngày mới là kết thúc bắt buộc.",
            "Missing goals still allows Sandbox continuation. Only unresolved payroll insolvency ends the company.",
          )}
        </p>
      </section>
      <section className="panel-card">
        <h2>
          {l(
            "Nguồn thu phụ & trọng tâm quý",
            "Secondary business & quarterly focus",
          )}
        </h2>
        <p>
          {l(
            "Một hướng phụ dùng chung nhân lực. Chi phí mở $1.500 và 1 lượt. Chỉ đổi trọng tâm trong 7 ngày đầu mỗi quý.",
            "One secondary line shares your team. Setup costs $1,500 and 1 action. Change primary focus in the first 7 days of a new quarter.",
          )}
        </p>
        <div className="button-row">
          {(["outsourcing", "product", "startup"] as Strategy[])
            .filter((x) => x !== s.strategy)
            .map((x) => (
              <button
                key={x}
                disabled={!!s.secondary && s.secondary !== x}
                onClick={() =>
                  s.secondary === x
                    ? p.confirm(
                        copy(
                          "Xác nhận mục tiêu thắng mới?",
                          "Confirm a new victory track?",
                        ),
                        copy(
                          `Đổi trọng tâm sang ${x}. Mục tiêu campaign sẽ theo hướng ${x}. Tốn 1 lượt.`,
                          `Make ${x} primary. Campaign goals now follow ${x}. Costs 1 action.`,
                        ),
                        { type: "strategy", strategy: x },
                      )
                    : dispatch({ type: "secondary", strategy: x })
                }
              >
                {s.secondary === x
                  ? l("Chuyển trọng tâm sang ", "Make primary: ")
                  : l("Mở hướng phụ ", "Enable secondary: ")}
                {x}
              </button>
            ))}
        </div>
      </section>
      <VentureFinance {...p} />
    </>
  );
}
