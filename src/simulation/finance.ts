import { operationsRate } from "./accrual";
import { runnable } from "./workStatus";
import type { State, Entry, Copy, Liability } from "./types";
import { copy } from "../content/catalog";
import { uid, need, log, mean } from "./helpers";
export function book(
  s: State,
  category: string,
  label: Copy,
  delta: Partial<Omit<Entry, "id" | "day" | "category" | "label">> = {},
) {
  const e: Entry = {
    id: uid(s, "txn"),
    day: s.day,
    category,
    label,
    cash: 0,
    receivable: 0,
    liability: 0,
    deferred: 0,
    capital: 0,
    revenue: 0,
    expense: 0,
    ...delta,
  };
  for (const k of [
    "cash",
    "receivable",
    "liability",
    "deferred",
    "capital",
    "revenue",
    "expense",
  ] as const)
    need(
      Number.isSafeInteger(e[k]),
      "Số tiền không hợp lệ.",
      "Invalid money amount.",
    );
  need(
    e.cash + e.receivable ===
      e.liability + e.deferred + e.capital + e.revenue - e.expense,
    "Giao dịch không cân đối.",
    "Unbalanced ledger transaction.",
  );
  need(
    s.cash + e.cash >= 0,
    "Không đủ tiền mặt cho giao dịch này.",
    "Not enough cleared cash for this transaction.",
  );
  s.cash += e.cash;
  s.ledger.push(e);
}
export function spend(
  s: State,
  amount: number,
  label: Copy,
  category = "expense",
) {
  need(
    amount >= 0 && Number.isSafeInteger(amount),
    "Số tiền không hợp lệ.",
    "Invalid money amount.",
  );
  book(s, category, label, { cash: -amount, expense: amount });
}
export const salaryTotal = (s: State) =>
  s.employees.reduce((sum, e) => sum + e.salary, 0);
export const monthlyCosts = (s: State) =>
  salaryTotal(s) +
  Math.round(
    s.overtime
      ? s.employees
          .filter((e) => e.assignments.some((a) => runnable(s, a)))
          .reduce((n, e) => n + e.salary, 0) * 0.2
      : 0,
  ) +
  operationsRate(s);
export const balance = (s: State) =>
  s.ledger.reduce(
    (a, e) => ({
      cash: a.cash + e.cash,
      receivable: a.receivable + e.receivable,
      liability: a.liability + e.liability,
      deferred: a.deferred + e.deferred,
      capital: a.capital + e.capital,
      revenue: a.revenue + e.revenue,
      expense: a.expense + e.expense,
    }),
    {
      cash: 0,
      receivable: 0,
      liability: 0,
      deferred: 0,
      capital: 0,
      revenue: 0,
      expense: 0,
    },
  );
export function runway(s: State) {
  const burn = s.months.length
    ? -mean(s.months.slice(-3).map((m) => m.operatingCashFlow))
    : monthlyCosts(s) -
      (s.product.launched ? s.product.paid * s.product.price : 0);
  return burn > 0 ? s.cash / burn : Infinity;
}
function accrue(
  s: State,
  amount: number,
  label: Copy,
  kind: Liability["kind"],
) {
  if (amount === 0) return;
  if (s.cash >= amount) {
    spend(s, amount, label, kind);
    return;
  }
  const paid = s.cash;
  book(s, kind, label, {
    cash: -paid,
    expense: amount,
    liability: amount - paid,
  });
  const debt: Liability = {
    id: uid(s, "liability"),
    amount: amount - paid,
    kind,
    label,
    created: s.day,
    deadline: kind === "payroll" ? s.day + 14 : null,
  };
  s.liabilities.push(debt);
  if (kind === "payroll") {
    s.metrics.crises++;
    for (const e of s.employees) e.morale = Math.max(0, e.morale - 15);
    log(
      s,
      "critical",
      copy("Khủng hoảng trả lương", "Payroll crisis"),
      copy(
        "Còn 14 ngày để thanh toán khoản lương thiếu. Thu hóa đơn hoặc dùng khoản vay khẩn cấp.",
        "You have 14 days to settle unpaid payroll. Collect invoices or arrange a bridge loan.",
      ),
      debt.id,
    );
  }
}
export function settleLiabilities(s: State) {
  for (const l of s.liabilities
    .filter((l) => l.kind !== "loan")
    .sort(
      (a, b) =>
        (a.kind === "payroll" ? -1 : 1) - (b.kind === "payroll" ? -1 : 1) ||
        a.created - b.created,
    )) {
    const amount = Math.min(s.cash, l.amount);
    if (amount > 0) {
      book(s, "settlement", l.label, { cash: -amount, liability: -amount });
      l.amount -= amount;
      if (l.amount === 0)
        log(
          s,
          "good",
          copy("Đã thanh toán khoản thiếu", "Liability settled"),
          l.label,
          l.id,
        );
    }
  }
  s.liabilities = s.liabilities.filter((l) => l.amount > 0);
}
export function monthlyExpenses(s: State) {
  const legacy = s.accrual.legacyThroughDay !== null;
  const payroll = legacy
    ? Math.round(salaryTotal(s) * (s.overtime ? 1.2 : 1))
    : s.accrual.payroll;
  const ops = legacy ? operationsRate(s) : s.accrual.operations;
  accrue(
    s,
    payroll,
    copy("Lương tháng và tăng ca", "Monthly payroll and overtime"),
    "payroll",
  );
  accrue(
    s,
    ops,
    copy("Văn phòng, hạ tầng và marketing", "Office, hosting and marketing"),
    "operations",
  );
  s.accrual.payroll = 0;
  s.accrual.operations = 0;
  s.accrual.legacyThroughDay = null;
  const loan = s.liabilities
    .filter((x) => x.kind === "loan")
    .reduce((a, x) => a + x.amount, 0);
  if (loan)
    accrue(
      s,
      Math.round(loan * 0.02),
      copy("Lãi vay cầu nối 2%/tháng", "Bridge loan interest: 2% monthly"),
      "operations",
    );
}
export function collectDue(s: State) {
  for (const inv of s.invoices) {
    if (!inv.paid && inv.clears <= s.day) {
      book(s, "collection", inv.label, {
        cash: inv.amount,
        receivable: -inv.amount,
        reference: inv.id,
      });
      inv.paid = true;
      log(
        s,
        "good",
        copy("Tiền đã về tài khoản", "Payment cleared"),
        inv.label,
        inv.id,
      );
    } else if (!inv.paid && inv.due === s.day) {
      log(
        s,
        "warning",
        copy("Hóa đơn đến hạn", "Invoice due"),
        copy(
          "Khoản phải thu chưa phải tiền mặt. Có thể liên hệ khách hàng để đẩy nhanh thanh toán.",
          "Accounts receivable are not cash. Contact the client to accelerate payment.",
        ),
        inv.id,
      );
    }
  }
  settleLiabilities(s);
}
export function checkInsolvency(s: State) {
  const l = s.liabilities.find(
    (l) =>
      l.kind === "payroll" &&
      l.deadline !== null &&
      s.day >= l.deadline &&
      l.amount > 0,
  );
  if (l) {
    s.status = "insolvent";
    log(
      s,
      "critical",
      copy("Công ty mất khả năng thanh toán", "Company insolvent"),
      copy(
        "Lương vẫn chưa được thanh toán sau thời hạn 14 ngày. Lịch sử giữ lại toàn bộ nguyên nhân.",
        "Payroll remains unpaid after the 14-day grace period. Company history preserves the causes.",
      ),
      l.id,
    );
  }
}
