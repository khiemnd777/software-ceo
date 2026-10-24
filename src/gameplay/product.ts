import type { State, Command } from "../simulation/types";
import { copy, SEGMENTS } from "../content/catalog";
import { FEATURES, CONCEPTS } from "../content/products";
import { need, action, clamp, log } from "../simulation/helpers";
import { book } from "../simulation/finance";
import { makeWork, canRelease } from "../simulation/work";
export function productCommand(s: State, c: Command): boolean {
  switch (c.type) {
    case "startFeature": {
      need(
        s.product.exists,
        "Chưa có sản phẩm riêng.",
        "Your company does not have a product.",
      );
      const f = FEATURES.find((f) => f.id === c.featureId);
      need(
        f && f.concept === s.product.concept,
        "Tính năng không thuộc sản phẩm này.",
        "Feature does not belong to this product.",
      );
      need(
        !s.work.some((w) => w.featureId === f.id),
        "Tính năng đã ở roadmap hoặc đã phát hành.",
        "Feature is already planned or released.",
      );
      need(
        s.work.filter((w) => w.kind === "feature" && w.status !== "released")
          .length < 3,
        "Tối đa 3 tính năng đang làm để tránh phân tán.",
        "Finish an active feature before adding another; limit is 3.",
      );
      action(s);
      makeWork(s, f.name, "feature", f.effort, { featureId: f.id });
      log(
        s,
        "info",
        copy("Roadmap đã cập nhật", "Roadmap updated"),
        f.need,
        f.id,
      );
      return true;
    }
    case "release": {
      const w = s.work.find((w) => w.id === c.workId);
      need(
        w && ["feature", "mvp"].includes(w.kind),
        "Không tìm thấy phần mềm để phát hành.",
        "Release work item not found.",
      );
      need(
        w.status !== "released" && w.done >= w.actual,
        "Phần việc chưa xong hoặc đã phát hành.",
        "Work is unfinished or already released.",
      );
      if (!canRelease(w)) {
        need(
          c.override,
          "Chưa đạt cổng chất lượng. Hoàn tất QA và sửa lỗi nghiêm trọng.",
          "Quality gate failed. Complete QA and fix critical defects.",
        );
        action(s);
        s.reputation = clamp(s.reputation - 8);
        s.product.reliability = clamp(s.product.reliability - 12);
      }
      w.status = "released";
      s.product.launched = true;
      s.product.releasedDay = s.day;
      s.product.debt = clamp(s.product.debt + w.debt);
      s.metrics.releases++;
      if (w.kind === "mvp") {
        s.product.free += 80;
        s.product.fit = clamp(s.product.fit + 5);
      } else {
        const f = FEATURES.find((f) => f.id === w.featureId)!;
        s.product.features.push(f.id);
        const rightMarket =
          CONCEPTS.find((c) => c.id === f.concept)?.segment ===
          s.product.segment;
        s.product.fit = clamp(
          s.product.fit + (rightMarket ? f.fit : s.product.surveyed ? 2 : 0),
        );
        s.product.awareness = clamp(s.product.awareness + f.reach);
      }
      s.reputation = clamp(s.reputation + 2);
      log(
        s,
        "good",
        copy("Đã phát hành", "Software released"),
        copy(
          `${w.label.vi}. Khách hàng sẽ phản hồi trong kỳ tiếp theo; vẫn có thể còn lỗi ẩn.`,
          `${w.label.en}. Customers respond at the next cycle; hidden defects may remain.`,
        ),
        w.id,
      );
      return true;
    }
    case "marketing":
      need(
        s.product.exists,
        "Cần có sản phẩm để quảng bá.",
        "You need a product to market.",
      );
      need(
        Number.isSafeInteger(c.amount) && c.amount >= 0 && c.amount <= 1000000,
        "Ngân sách tháng từ $0 đến $10.000.",
        "Monthly marketing must be $0–$10,000.",
      );
      need(
        c.amount !== s.product.marketing,
        "Ngân sách chưa thay đổi.",
        "Budget has not changed.",
      );
      action(s);
      s.product.marketing = c.amount;
      log(
        s,
        "info",
        copy("Đã đổi ngân sách marketing", "Marketing budget updated"),
        copy(
          "Ngân sách được thu ở kỳ tháng và tạo thêm leads. Nó không tự giảm tỷ lệ rời bỏ.",
          "The monthly budget generates leads and is paid at billing. It does not fix retention.",
        ),
        "marketing",
      );
      return true;
    case "price":
      need(s.product.exists, "Chưa có sản phẩm.", "No product exists.");
      need(
        Number.isSafeInteger(c.amount) && c.amount >= 2900 && c.amount <= 19900,
        "Giá gói từ $29 đến $199/tháng.",
        "Plan price must be $29–$199 monthly.",
      );
      need(
        c.amount !== s.product.price,
        "Giá chưa thay đổi.",
        "Price has not changed.",
      );
      action(s);
      s.product.price = c.amount;
      log(
        s,
        "info",
        copy("Đã thay đổi giá", "Plan price changed"),
        copy(
          "Giá cao hơn tăng doanh thu mỗi khách nhưng giảm chuyển đổi và tăng churn.",
          "Higher prices increase revenue per customer but reduce conversion and raise churn.",
        ),
        "price",
      );
      return true;
    case "survey":
      need(s.product.exists, "Chưa có sản phẩm.", "No product exists.");
      need(
        !s.product.surveyed,
        "Đã có khảo sát cho phân khúc này.",
        "This market has already been surveyed.",
      );
      action(s);
      s.product.surveyed = true;
      s.product.needs = FEATURES.filter((f) => f.concept === s.product.concept)
        .sort((a, b) => b.fit - a.fit)
        .slice(0, 3)
        .map((f) => f.id);
      log(
        s,
        "good",
        copy("Đã hiểu rõ nhu cầu", "Customer needs are clearer"),
        SEGMENTS[s.product.segment].need,
        "survey",
      );
      return true;
    default:
      return false;
  }
}
export function funnel(s: State) {
  const p = s.product,
    market = s.market[p.segment],
    priceRatio = p.price / 7900;
  const segment = SEGMENTS[p.segment];
  const features = FEATURES.filter((f) => p.features.includes(f.id));
  const retention = features.reduce((v, f) => v + f.retention, 0);
  const leads = Math.max(
    0,
    Math.round(
      (market.demand +
        p.marketing / 100 / 50 +
        p.paid * 0.1 +
        Math.max(0, s.reputation - 40) * 0.5 +
        p.awareness * 0.5) /
        market.competition,
    ),
  );
  const conversion = clamp(
    0.12 +
      0.001 * (p.fit - 50) +
      0.0005 * (p.reliability - segment.quality) -
      0.035 * (priceRatio - 1) * segment.sensitivity,
    0.03,
    0.22,
  );
  const churn = clamp(
    0.04 +
      0.0004 * (50 - p.fit) +
      0.0003 * (80 - p.reliability) +
      0.025 * Math.max(0, priceRatio - 1) * segment.sensitivity +
      0.0003 * (segment.quality - 80) +
      Math.min(180, p.support) * 0.001 -
      retention,
    0.01,
    0.18,
  );
  return { leads, conversion, churn };
}
export function productMonth(s: State) {
  const p = s.product;
  if (!p.launched) return;
  const f = funnel(s);
  const churned = Math.min(p.paid, Math.round(p.paid * f.churn));
  let acquired = 0;
  if (s.venture.results.length || s.strategy === "startup") {
    const retained = Math.max(
      0,
      Math.round(p.free * clamp(0.82 + p.fit * 0.001, 0.8, 0.94)),
    );
    const conversionRate = clamp(0.015 + p.fit * 0.0006, 0.02, 0.075);
    const converted = Math.min(retained, Math.floor(retained * conversionRate));
    const activated = Math.floor(
      f.leads * clamp(0.23 + p.fit * 0.005, 0.25, 0.7),
    );
    p.free = retained - converted + activated;
    acquired = converted;
  } else acquired = Math.floor(f.leads * f.conversion);
  p.paid = Math.max(0, p.paid - churned + acquired);
  p.lastLeads = f.leads;
  p.lastNew = acquired;
  p.lastChurn = churned;
  p.churnRate = f.churn;
  p.conversion = f.conversion;
  const revenue = p.paid * p.price;
  if (revenue)
    book(
      s,
      "subscription",
      copy("Thanh toán thuê bao tháng", "Monthly subscriptions"),
      { cash: revenue, revenue },
    );
  p.awareness = clamp(p.awareness - 1);
  const open = s.work
    .filter((w) => w.kind === "feature" || w.kind === "mvp")
    .flatMap((w) => w.bugs.filter((b) => b.known));
  const defects = open.reduce((v, b) => v + b.severity, 0);
  p.reliability = clamp(
    p.reliability +
      (p.support < 8 && defects === 0
        ? 1
        : -Math.min(6, defects * 0.25 + Math.max(0, p.support - 15) * 0.04)),
  );
  if (p.support > 15)
    log(
      s,
      "warning",
      copy("Khách đang chờ hỗ trợ", "Customers are waiting for support"),
      copy(
        "Phân công việc Hỗ trợ khách ở Thị trường để giảm hàng đợi. Bỏ mặc sẽ tăng tỷ lệ rời bỏ.",
        "Assign Customer support to the Market target to clear the queue. Unanswered requests increase churn.",
      ),
      "support-backlog",
    );
  if (f.churn > 0.08)
    log(
      s,
      "warning",
      copy("Khách hàng rời đi nhanh", "Retention is under pressure"),
      copy(
        "Kiểm tra độ phù hợp, giá và lỗi hỗ trợ. Tăng marketing không chữa được churn.",
        "Review fit, price and support defects. Marketing cannot cure churn.",
      ),
      "retention",
    );
  log(
    s,
    "info",
    copy("Chu kỳ khách hàng mới", "A new customer cycle"),
    copy(
      `${acquired} khách mới, ${churned} rời đi. Khách trả phí hiện tại: ${p.paid}.`,
      `${acquired} new, ${churned} churned. Active paying customers: ${p.paid}.`,
    ),
    "product-cohort",
  );
}

export function productDay(s: State) {
  if (s.product.launched)
    s.product.support = Math.min(
      1000,
      Math.round(
        (s.product.support +
          0.08 +
          s.product.paid * 0.0025 +
          s.product.free * 0.0003) *
          1000,
      ) / 1000,
    );
}
