import type { State, Command, Transition } from "./types";
import { copy } from "../content/catalog";
import { need, RuleError, clamp, log, mean, week } from "./helpers";
import {
  monthlyCosts,
  monthlyExpenses,
  collectDue,
  checkInsolvency,
} from "./finance";
import { runWork } from "./work";
import { eventsDay } from "./events";
import { refreshCandidates } from "./create";
import { productCommand, productMonth, productDay } from "../gameplay/product";
import { startupCommand, experimentsDay } from "../gameplay/startup";
import { progressionCommand, progressionDay } from "../gameplay/progression";
import { contractCommand, contractsDay } from "../gameplay/contracts";
import { sharedCommand, unknownCommand } from "./commands";
export function weekly(s: State) {
  s.actions = 3 - s.borrowedActions;
  s.borrowedActions = 0;
  for (const e of s.employees) {
    e.energy = clamp(
      e.energy +
        (s.overtime
          ? -(e.traits.includes("driven") ? 15 : 12)
          : 10 + (e.traits.includes("steady") ? 2 : 0)),
    );
    e.morale = clamp(e.morale + (s.overtime ? -4 : e.energy < 25 ? -2 : 0.5));
    if (e.morale < 35 && e.retentionSince === null) {
      e.retentionSince = s.day;
      log(
        s,
        "warning",
        copy("Nguy cơ mất nhân sự", "Retention risk"),
        copy(
          `${e.name} cần được hỗ trợ. Tăng lương, giảm tăng ca hoặc cải thiện tinh thần.`,
          `${e.name} needs support. Review pay, stop overtime or improve morale.`,
        ),
        e.id,
      );
    } else if (e.morale >= 40) e.retentionSince = null;
  }
  for (const e of s.employees.filter(
    (e) =>
      e.morale < 20 &&
      e.retentionSince !== null &&
      s.day - e.retentionSince >= 14,
  )) {
    log(
      s,
      "warning",
      copy("Nhân viên quyết định nghỉ việc", "An employee resigns"),
      copy(
        `${e.name} rời công ty sau cảnh báo tinh thần kéo dài.`,
        `${e.name} left after prolonged, signaled dissatisfaction.`,
      ),
      e.id,
    );
    s.employees = s.employees.filter((x) => x.id !== e.id);
  }
  s.weeks.push({
    week: week(s) - 1,
    cashDelta: s.cash - s.metrics.weekCash,
    work: s.metrics.workWeek,
    morale: mean(s.employees.map((e) => e.morale)),
    message: copy(
      "Phân công, chất lượng và lịch thanh toán giải thích kết quả tuần này.",
      "Assignments, quality and collection dates explain this week’s results.",
    ),
  });
  if (s.weeks.length > 160) s.weeks.shift();
  s.metrics.weekCash = s.cash;
  s.metrics.workWeek = 0;
  if (s.day % 28 === 0) refreshCandidates(s);
}
export function daily(s: State) {
  if (s.status !== "playing") return;
  s.day++;
  collectDue(s);
  eventsDay(s);
  productDay(s);
  runWork(s);
  contractsDay(s);
  experimentsDay(s);
  if (s.day % 7 === 0) weekly(s);
  if (s.day % 30 === 0) {
    productMonth(s);
    monthlyExpenses(s);
    const entries = s.ledger.filter(
      (e) => e.day > s.day - 30 && e.day <= s.day,
    );
    s.months.push({
      month: s.day / 30,
      cash: s.cash,
      revenue: entries.reduce((v, e) => v + e.revenue, 0),
      expense: entries.reduce((v, e) => v + e.expense, 0),
      cashFlow: s.cash - s.metrics.monthStartCash,
      operatingCashFlow: entries
        .filter(
          (e) =>
            !["loan", "capital", "funding", "loan-repayment"].includes(
              e.category,
            ),
        )
        .reduce((v, e) => v + e.cash, 0),
      paid: s.product.paid,
      free: s.product.free,
      churn: s.product.churnRate,
      morale: mean(s.employees.map((e) => e.morale)),
      reputation: s.reputation,
      debt: s.product.debt,
    });
    s.metrics.monthStartCash = s.cash;
    log(
      s,
      "info",
      copy("Báo cáo tháng đã sẵn sàng", "Monthly review is ready"),
      copy(
        "Xem doanh thu, chi phí và dòng tiền thực trong Tài chính.",
        "Review revenue, expenses and cleared cash flow in Finance.",
      ),
      "month-review",
    );
  }
  if (s.cash < monthlyCosts(s) && s.day - s.metrics.lastWarningDay >= 14) {
    s.metrics.lastWarningDay = s.day;
    log(
      s,
      "warning",
      copy("Tiền mặt dưới một tháng chi phí", "Less than one month of cash"),
      copy(
        "Kiểm tra hóa đơn sắp thu, giảm chi hoặc vay cầu nối. Lương chưa trả có 14 ngày khắc phục.",
        "Review upcoming collections, reduce spending or use a bridge loan. Unpaid payroll has a 14-day grace period.",
      ),
      "cash-forecast",
    );
  }
  checkInsolvency(s);
  progressionDay(s);
}
export function transition(input: State, c: Command): Transition {
  const s = structuredClone(input);
  try {
    need(
      s.status === "playing" ||
        c.type === "continueSandbox" ||
        c.type === "tutorial",
      "Phiên chơi đang ở màn hình tổng kết.",
      "This game is at its outcome review.",
    );
    if (c.type === "tick") {
      const days = c.days ?? 1;
      need(
        Number.isInteger(days) && days > 0 && days <= 360,
        "Số ngày không hợp lệ.",
        "Invalid day count.",
      );
      for (let i = 0; i < days && s.status === "playing"; i++) daily(s);
    } else if (
      !sharedCommand(s, c) &&
      !contractCommand(s, c) &&
      !productCommand(s, c) &&
      !startupCommand(s, c) &&
      !progressionCommand(s, c)
    )
      unknownCommand();
    const critical =
      s.status !== input.status ||
      s.events.some(
        (e) => !e.resolved && e.due === s.day && s.day > input.day,
      ) ||
      s.metrics.crises > input.metrics.crises;
    return { state: s, ok: true, critical };
  } catch (e) {
    if (e instanceof RuleError)
      return { state: input, ok: false, error: e.copy, critical: false };
    throw e;
  }
}
