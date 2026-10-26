import type { State, Employee, WorkItem } from "./types";
import { phaseAt } from "./clock";
import { need } from "./helpers";
export interface AccrualState {
  payroll: number;
  operations: number;
  payrollRemainder: number;
  operationsRemainder: number;
  legacyThroughDay: number | null;
  laborRemainders: Record<string, number>;
}
export const newAccrual = (): AccrualState => ({
  payroll: 0,
  operations: 0,
  payrollRemainder: 0,
  operationsRemainder: 0,
  legacyThroughDay: null,
  laborRemainders: {},
});
export const operationsRate = (s: State) =>
  (s.officeTier === 2 ? 380000 : 200000) +
  (s.strategy === "startup" ? 100000 : 0) +
  s.product.marketing +
  (s.product.launched
    ? Math.round((s.product.paid + s.product.free * 0.08) * 50)
    : 0);
export function accrueQuarter(s: State, working: ReadonlySet<string>) {
  const a = s.accrual;
  if (a.legacyThroughDay !== null) return;
  for (const e of s.employees) {
    const numerator =
      a.payrollRemainder +
      e.salary *
        (5 +
          (phaseAt(s.clock.minute) === "overtime" && working.has(e.id)
            ? 12
            : 0));
    need(
      Number.isSafeInteger(numerator),
      "Chi phí vượt giới hạn.",
      "Cost exceeds the supported range.",
    );
    a.payroll += Math.floor(numerator / 14400);
    a.payrollRemainder = numerator % 14400;
  }
  const ops = a.operationsRemainder + operationsRate(s);
  need(
    Number.isSafeInteger(ops),
    "Chi phí vượt giới hạn.",
    "Cost exceeds the supported range.",
  );
  a.operations += Math.floor(ops / 2880);
  a.operationsRemainder = ops % 2880;
  need(
    a.payroll <= 1e14 && a.operations <= 1e14,
    "Chi phí vượt giới hạn.",
    "Cost exceeds the supported range.",
  );
}
export function allocateLabor(
  s: State,
  w: WorkItem,
  e: Employee,
  count: number,
  used: number,
  capacity: number,
) {
  if (capacity <= 0 || used <= 0) return;
  const rate =
    phaseAt(s.clock.minute) === "overtime" ? e.salary / 1200 : e.salary / 960;
  const cost =
    (s.accrual.laborRemainders[w.id] ?? 0) +
    (rate / count) * Math.min(1, used / capacity);
  const cents = Math.floor(cost + 1e-10);
  w.labor += cents;
  s.accrual.laborRemainders[w.id] = Math.max(0, cost - cents);
}
