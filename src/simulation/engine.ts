import type { State, Command, Transition } from "./types";
import { copy } from "../content/catalog";
import { need, RuleError, log, mean } from "./helpers";
import {
  monthlyCosts,
  monthlyExpenses,
  collectDue,
  checkInsolvency,
} from "./finance";
import { advanceHealth } from "./health";
import { accrueQuarter } from "./accrual";
import { employeeActivity } from "./workStatus";
import { phaseAt, STEP_MINUTES, STEPS_PER_DAY } from "./clock";
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
    week: Math.ceil(s.day / 7),
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
function closeDay(s: State) {
  if (s.status !== "playing") return;
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
function advanceSteps(s: State, requested: number) {
  let steps = 0,
    critical = false;
  while (steps < requested && s.status === "playing") {
    const crises = s.metrics.crises;
    if (!s.clock.opened) {
      s.clock.opened = true;
      s.workDay = { day: s.day, budgets: {} };
      collectDue(s);
      eventsDay(s);
      productDay(s);
      if (
        s.events.some((e) => !e.resolved && e.due === s.day) ||
        s.metrics.crises > crises ||
        s.status !== "playing"
      ) {
        critical = true;
        break;
      }
    }
    const working = new Set(
      s.employees
        .filter((e) => employeeActivity(s, e).working)
        .map((e) => e.id),
    );
    const phase = phaseAt(s.clock.minute);
    if (working.size) runWork(s, (phase === "overtime" ? 0.8 : 1) / 224);
    advanceHealth(s, working);
    accrueQuarter(s, working);
    s.clock.minute += STEP_MINUTES;
    steps++;
    if (s.clock.minute >= 1440) {
      closeDay(s);
      s.clock.lastClosedDay = s.day;
      s.day++;
      s.clock.minute = 0;
      s.clock.opened = false;
      s.workDay = { day: s.day, budgets: {} };
    }
    if (s.status !== "playing" || s.metrics.crises > crises) {
      critical = true;
      break;
    }
  }
  return { steps, critical };
}
export function transition(input: State, c: Command): Transition {
  const s = structuredClone(input);
  try {
    let steps: number | undefined;
    let clockCritical = false;
    need(
      s.status === "playing" ||
        c.type === "continueSandbox" ||
        c.type === "tutorial",
      "Phiên chơi đang ở màn hình tổng kết.",
      "This game is at its outcome review.",
    );
    if (c.type === "tick" || c.type === "advanceTime") {
      const requested =
        c.type === "tick" ? (c.days ?? 1) * STEPS_PER_DAY : c.steps;
      need(
        Number.isInteger(requested) &&
          requested > 0 &&
          requested <= 360 * STEPS_PER_DAY &&
          (c.type !== "tick" || Number.isInteger(c.days ?? 1)),
        "Bước thời gian không hợp lệ.",
        "Invalid time step count.",
      );
      const result = advanceSteps(s, requested);
      steps = result.steps;
      clockCritical = result.critical;
    } else if (c.type === "officeLights") {
      need(
        typeof c.enabled === "boolean",
        "Trạng thái đèn không hợp lệ.",
        "Invalid light state.",
      );
      s.scene.officeLightsOn = c.enabled;
    } else if (
      !sharedCommand(s, c) &&
      !contractCommand(s, c) &&
      !productCommand(s, c) &&
      !startupCommand(s, c) &&
      !progressionCommand(s, c)
    )
      unknownCommand();
    const critical =
      clockCritical ||
      s.status !== input.status ||
      s.events.some(
        (e) => !e.resolved && e.due === s.day && s.day > input.day,
      ) ||
      s.metrics.crises > input.metrics.crises;
    return {
      state: s,
      ok: true,
      critical,
      ...(steps === undefined ? {} : { steps }),
    };
  } catch (e) {
    if (e instanceof RuleError)
      return { state: input, ok: false, error: e.copy, critical: false };
    throw e;
  }
}
