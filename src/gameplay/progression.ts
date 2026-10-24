import type { State, Command } from "../simulation/types";
import { copy } from "../content/catalog";
import { CONCEPTS } from "../content/products";
import { need, action, log, rng, clamp } from "../simulation/helpers";
import { runway, spend } from "../simulation/finance";
import { createLead } from "./contracts";
export function campaignEvaluation(s: State) {
  const recent = s.months.slice(-3),
    ocf = recent.length === 3 && recent.every((m) => m.operatingCashFlow > 0);
  const revenue = recent.reduce((v, m) => v + m.revenue, 0),
    expense = recent.reduce((v, m) => v + m.expense, 0);
  const margin = revenue > 0 ? (revenue - expense) / revenue : -1;
  const onTime = s.metrics.milestones
    ? s.metrics.onTime / s.metrics.milestones
    : 0;
  const success =
    s.strategy === "product"
      ? s.product.paid * s.product.price >= 2000000 &&
        s.product.churnRate <= 0.05 &&
        ocf
      : s.strategy === "outsourcing"
        ? margin >= 0.15 &&
          onTime >= 0.85 &&
          s.metrics.repeatClients.length >= 2
        : s.product.fit >= 60 &&
          (s.product.free + s.product.paid >= 1000 ||
            s.product.paid * s.product.price >= 1000000) &&
          runway(s) >= 9;
  const legacy = Math.round(
    clamp(
      (s.reputation +
        s.product.reliability +
        (s.employees.length
          ? s.employees.reduce((a, e) => a + e.morale, 0) / s.employees.length
          : 0) +
        (s.venture.rounds ? s.venture.founderEquity : 100)) /
        4,
    ),
  );
  return {
    success,
    margin,
    onTime,
    positiveMonths: recent.filter((m) => m.operatingCashFlow > 0).length,
    legacy,
  };
}
export function progressionCommand(s: State, c: Command): boolean {
  if (c.type === "secondary") {
    need(
      c.strategy !== s.strategy,
      "Nguồn thu phụ phải khác chiến lược chính.",
      "Secondary business must differ from the primary strategy.",
    );
    need(
      !s.secondary,
      "MVP hỗ trợ một nguồn thu phụ.",
      "The MVP supports one secondary business line.",
    );
    need(
      ["product", "outsourcing", "startup"].includes(c.strategy),
      "Chiến lược không hợp lệ.",
      "Invalid strategy.",
    );
    action(s);
    spend(
      s,
      150000,
      copy("Chuẩn bị nguồn thu phụ", "Secondary business setup"),
    );
    s.secondary = c.strategy;
    if (c.strategy === "outsourcing") createLead(s);
    else if (!s.product.exists) {
      s.product.exists = true;
      s.product.launched = false;
      s.product.fit = 25;
      const concept = CONCEPTS.find((c) => c.id === s.product.concept)!;
      s.product.name = concept.name;
      if (c.strategy === "product")
        s.venture.evidence = Math.max(15, s.venture.evidence);
    }
    log(
      s,
      "info",
      copy("Mở nguồn thu phụ", "Secondary business enabled"),
      copy(
        "Nguồn lực hiện có được chia sẻ giữa hai hướng.",
        "Both business lines share your existing capacity.",
      ),
      "secondary",
    );
    return true;
  }
  if (c.type === "strategy") {
    const quarter = Math.floor(s.day / 90);
    need(
      quarter >= 1 && s.day % 90 < 7 && s.reviewedQuarter < quarter,
      "Chỉ đổi trọng tâm trong 7 ngày đầu kỳ quý, một lần mỗi quý.",
      "Change focus during the first 7 days of a new quarter, once per quarter.",
    );
    need(
      c.strategy === s.secondary,
      "Bật hướng này làm nguồn thu phụ trước khi chuyển trọng tâm.",
      "Enable this business line as secondary before making it primary.",
    );
    action(s);
    const previous = s.strategy;
    s.strategy = c.strategy;
    s.secondary = previous;
    s.reviewedQuarter = quarter;
    s.metrics.quarterChanges++;
    log(
      s,
      "info",
      copy(
        "Đã xác nhận mục tiêu campaign mới",
        "New campaign victory track confirmed",
      ),
      copy(
        `Trọng tâm mới: ${c.strategy}. Nguồn thu phụ: ${previous}.`,
        `Primary: ${c.strategy}. Secondary: ${previous}.`,
      ),
      "strategy",
    );
    return true;
  }
  return false;
}
export function progressionDay(s: State) {
  if (s.day % 90 === 83)
    log(
      s,
      "info",
      copy("Kỳ đánh giá quý sắp tới", "Quarterly review approaches"),
      copy(
        "Sau 7 ngày bạn có thể đổi trọng tâm kinh doanh. Mục tiêu thắng sẽ cần được xác nhận.",
        "In 7 days you can change the primary business line, with explicit confirmation of the new victory track.",
      ),
      "quarter-warning",
    );
  if (s.day % 90 === 0) {
    for (const m of Object.values(s.market)) {
      m.trend = Math.round((rng(s) - 0.5) * 16);
      m.demand = Math.round(clamp(m.demand + m.trend, 50, 180));
    }
    log(
      s,
      "info",
      copy("Tín hiệu thị trường quý mới", "New quarterly market signals"),
      copy(
        "Nhu cầu phân khúc đã cập nhật. Xem Thị trường trước khi quyết định roadmap.",
        "Segment demand has changed. Review Market before committing to a roadmap.",
      ),
      "market-quarter",
    );
  }
  const ends =
    s.mode === "career"
      ? 1080
      : s.mode === "rescue"
        ? 180
        : s.mode === "deadline"
          ? 180
          : s.mode === "fit"
            ? 360
            : Infinity;
  if (s.day >= ends && s.status === "playing") {
    const ev = campaignEvaluation(s);
    s.campaignWon =
      s.mode === "rescue"
        ? s.cash >= 2000000 && !s.liabilities.some((l) => l.kind === "payroll")
        : s.mode === "deadline"
          ? s.metrics.completedContracts >= 3 && ev.onTime >= 0.85
          : s.mode === "fit"
            ? s.product.fit >= 65 && s.product.paid * s.product.price >= 1000000
            : ev.success;
    s.status = "review";
    log(
      s,
      "good",
      copy("Đến lúc nhìn lại công ty", "Time to review your company"),
      copy(
        "Không đạt mục tiêu vẫn có thể tiếp tục Sandbox. Chỉ mất khả năng trả lương mới kết thúc công ty.",
        "You can continue in Sandbox even if goals were missed. Only insolvency ends the company.",
      ),
      "campaign",
    );
  }
}
