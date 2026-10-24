import type { State, Command } from "../simulation/types";
import { copy, SEGMENTS } from "../content/catalog";
import { EXPERIMENTS, TERMS, CONCEPTS } from "../content/products";
import { need, action, clamp, rng, log, uid } from "../simulation/helpers";
import { spend, book } from "../simulation/finance";
import { makeWork } from "../simulation/work";
export function startupCommand(s: State, c: Command): boolean {
  switch (c.type) {
    case "experiment": {
      need(
        s.strategy === "startup" || s.secondary === "startup",
        "Thử nghiệm cần hướng Startup.",
        "Experiments require the Startup business line.",
      );
      const e = EXPERIMENTS.find((e) => e.id === c.experimentId);
      need(e, "Thử nghiệm không tồn tại.", "Experiment not found.");
      need(
        !s.work.some((w) => w.experimentId === e.id),
        "Thử nghiệm này đã được thực hiện hoặc đang chạy.",
        "This experiment has already been run or is active.",
      );
      need(
        s.work.filter((w) => w.kind === "experiment" && w.status !== "released")
          .length < 2,
        "Tối đa hai thử nghiệm cùng lúc.",
        "Maximum two simultaneous experiments.",
      );
      if (e.id === "pilot")
        need(
          s.venture.evidence >= 15,
          "Cần 15 điểm bằng chứng trước paid pilot.",
          "Paid pilots need at least 15 evidence.",
        );
      if (e.id === "offer" || e.id === "referral")
        need(
          s.product.launched,
          "Cần MVP đã phát hành để đo phản hồi thực.",
          "Launch an MVP before measuring real user response.",
        );
      action(s);
      spend(s, e.cost, e.name, "experiment");
      makeWork(s, e.name, "experiment", e.effort, { experimentId: e.id });
      log(
        s,
        "info",
        copy("Thử nghiệm đã khởi động", "Experiment started"),
        e.hypothesis,
        e.id,
      );
      return true;
    }
    case "buildMvp":
      need(
        s.product.exists && !s.product.launched,
        "MVP đã tồn tại hoặc chưa có sản phẩm.",
        "MVP already exists, or no product is configured.",
      );
      need(
        s.venture.evidence >= 15,
        "Cần ít nhất 15 điểm bằng chứng.",
        "At least 15 validation evidence required.",
      );
      need(
        !s.work.some((w) => w.kind === "mvp" && w.status !== "released"),
        "Đang có MVP được phát triển.",
        "MVP work is already underway.",
      );
      action(s);
      makeWork(
        s,
        copy("MVP cho khách hàng đầu tiên", "MVP for your first customers"),
        "mvp",
        18,
      );
      return true;
    case "pitch":
      need(
        s.venture.rounds === 0,
        "MVP chỉ có một vòng đầu tư.",
        "This MVP supports one funding round.",
      );
      need(
        !s.venture.offered,
        "Đã có đề nghị đầu tư để xem xét.",
        "Funding offers are already available.",
      );
      need(
        s.venture.evidence >= 35 &&
          (s.product.free + s.product.paid >= 80 || s.product.paid >= 5),
        "Cần 35 bằng chứng và 80 người dùng hoặc 5 khách trả phí.",
        "Pitch requires 35 evidence and 80 active users or 5 paying customers.",
      );
      action(s);
      s.venture.offered = true;
      log(
        s,
        "good",
        copy("Đã nhận đề nghị đầu tư", "Funding offers received"),
        copy(
          "Xem tiền, phần trăm cổ phần sau đầu tư và cam kết trước khi ký.",
          "Review cash, post-money ownership and commitments before signing.",
        ),
        "pitch",
      );
      return true;
    case "funding": {
      need(
        s.venture.offered && s.venture.rounds === 0,
        "Không có vòng đầu tư đang mở.",
        "No open funding round.",
      );
      const t = TERMS.find((t) => t.id === c.termId);
      need(t, "Không tìm thấy đề nghị.", "Term sheet not found.");
      need(
        s.venture.evidence >= t.evidence,
        "Bằng chứng chưa đủ cho nhà đầu tư này.",
        "Not enough evidence for this investor.",
      );
      action(s);
      book(s, "funding", t.name, { cash: t.amount, capital: t.amount });
      s.venture.founderEquity *= 1 - t.equity / 100;
      s.venture.investorEquity = t.equity;
      s.venture.rounds = 1;
      s.venture.offered = false;
      s.venture.investor = t.id;
      s.venture.committedGoal = t.goal;
      s.venture.commitmentDue = s.day + t.deadline;
      s.promises.push({
        id: uid(s, "promise"),
        label: copy(
          `Đạt ${t.goal} khách trả phí`,
          `Reach ${t.goal} paying customers`,
        ),
        recipient: t.name,
        due: s.day + t.deadline,
        kind: "growth",
        target: "product",
        goal: t.goal,
        status: "open",
        created: s.day,
      });
      log(
        s,
        "good",
        copy("Vốn đã vào tài khoản", "Investment cash received"),
        copy(
          `Founder còn ${s.venture.founderEquity}% cổ phần. Khoản đầu tư không phải doanh thu.`,
          `The founder retains ${s.venture.founderEquity}% equity. Investment is not revenue.`,
        ),
        t.id,
      );
      return true;
    }
    case "pivot":
      need(
        s.strategy === "startup" || s.secondary === "startup",
        "Pivot cần hướng Startup.",
        "Pivot requires the Startup line.",
      );
      need(
        c.segment in SEGMENTS && c.segment !== s.product.segment,
        "Chọn một phân khúc khác.",
        "Choose a different segment.",
      );
      need(
        s.venture.pivotUntil <= s.day,
        "Đang chuyển hướng.",
        "A pivot is already underway.",
      );
      action(s);
      spend(s, 600000, copy("Chi phí chuyển hướng", "Pivot costs"));
      s.venture.hypothesis = c.segment;
      s.product.segment = c.segment;
      {
        const concept = CONCEPTS.find((cn) => cn.segment === c.segment)!;
        s.product.concept = concept.id;
        s.product.name = concept.name;
      }
      s.venture.pivotUntil = s.day + 7;
      s.product.fit = clamp(25 + s.venture.evidence * 0.1, 20, 40);
      s.product.paid = Math.floor(s.product.paid * 0.6);
      s.product.free = Math.floor(s.product.free * 0.6);
      s.product.surveyed = false;
      s.product.needs = [];
      log(
        s,
        "warning",
        copy("Bắt đầu chuyển hướng", "Pivot underway"),
        copy(
          "Gián đoạn việc sản phẩm 7 ngày. Giữ lại 60% khách hiện tại. Kiến thức đã học vẫn còn.",
          "Product work pauses for 7 days. Retain 60% of current customers. Existing evidence is preserved.",
        ),
        "pivot",
      );
      return true;
    default:
      return false;
  }
}
export function experimentsDay(s: State) {
  for (const w of s.work.filter(
    (w) => w.kind === "experiment" && w.status === "ready",
  )) {
    const e = EXPERIMENTS.find((e) => e.id === w.experimentId)!;
    const rate = clamp(
      e.threshold + (rng(s) - 0.42) * 0.4 + (s.product.fit - 20) * 0.001,
      0.02,
      0.98,
    );
    const responders = Math.round(e.sample * rate),
      positive = responders / e.sample >= e.threshold;
    const learned = positive ? e.evidence : Math.round(e.evidence * 0.35);
    s.venture.evidence = clamp(s.venture.evidence + learned);
    s.venture.results.push({
      id: e.id,
      day: s.day,
      positive,
      sample: e.sample,
      responders,
      evidence: learned,
      segment: s.product.segment,
    });
    s.product.fit = clamp(s.product.fit + (positive ? 8 : 1));
    w.status = "released";
    log(
      s,
      positive ? "good" : "info",
      copy(
        positive ? "Giả thuyết có tín hiệu tốt" : "Giả thuyết cần xem lại",
        positive
          ? "Evidence supports the hypothesis"
          : "The hypothesis needs work",
      ),
      copy(
        `${e.name.vi}: ${responders}/${e.sample} phản hồi phù hợp; ngưỡng ${Math.round(e.threshold * 100)}%. Bằng chứng +${learned}.`,
        `${e.name.en}: ${responders}/${e.sample} supportive responses; threshold ${Math.round(e.threshold * 100)}%. Evidence +${learned}.`,
      ),
      w.id,
    );
  }
}
