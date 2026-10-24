import { z } from "zod";
import type { State } from "../simulation/types";
import { EVENTS } from "../content/events";
import { FEATURES, CONCEPTS, EXPERIMENTS, TERMS } from "../content/products";
import { CONTRACTS, TRAITS } from "../content/catalog";
import { balance } from "../simulation/finance";
import { APPEARANCE_IDS } from "../characters/catalog";
// Parse untrusted saves without dynamic code generation; compatible with script-src self CSP.
z.config({ jitless: true });
const finite = z.number().finite(),
  integer = finite.int().safe(),
  nonneg = integer.min(0),
  money = integer.min(0).max(1e14),
  day = integer.min(-30).max(1000000),
  stat = finite.min(0).max(100),
  id = z.string().min(1).max(120),
  str = z.string().max(5000),
  copy = z.strictObject({ vi: str, en: str });
const strategy = z.enum(["product", "outsourcing", "startup"]),
  segment = z.enum(["retail", "creative", "education"]),
  role = z.enum(["developer", "qa", "designer", "growth", "ops"]),
  task = z.enum([
    "develop",
    "qa",
    "fix",
    "refactor",
    "research",
    "growth",
    "support",
  ]);
const assignment = z.strictObject({ target: id, kind: task });
const candidate = {
  id,
  name: z.string().min(1).max(80),
  role,
  skill: integer.min(1).max(5),
  salary: money,
  traits: z.array(z.string().max(40)).max(2),
  variant: nonneg.max(100),
  appearance: z.enum(APPEARANCE_IDS).optional(),
};
const defect = z.strictObject({
  id,
  severity: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  known: z.boolean(),
  remaining: finite.min(0).max(3),
  created: day,
  revealed: day.nullable(),
});
const work = z.strictObject({
  id,
  label: copy,
  kind: z.enum(["contract", "feature", "experiment", "mvp"]),
  estimated: finite.min(0).max(10000),
  actual: finite.min(0).max(13000),
  done: finite.min(0).max(13000),
  effort: finite.min(0).max(1000000),
  qa: finite.min(0).max(1000000),
  debt: stat,
  bugs: z.array(defect).max(10000),
  status: z.enum(["active", "ready", "released"]),
  labor: money,
  featureId: id.optional(),
  experimentId: id.optional(),
  projectId: id.optional(),
  discovered: z.boolean(),
  created: day,
});
const effect = z.strictObject({
  cash: integer.min(-1e10).max(1e10).optional(),
  morale: finite.min(-100).max(100).optional(),
  energy: finite.min(-100).max(100).optional(),
  reputation: finite.min(-100).max(100).optional(),
  trust: finite.min(-100).max(100).optional(),
  fit: finite.min(-100).max(100).optional(),
  demand: finite.min(-1000).max(1000).optional(),
  reliability: finite.min(-100).max(100).optional(),
  awareness: finite.min(-100).max(100).optional(),
  debt: finite.min(-100).max(100).optional(),
  scope: finite.min(0).max(1000).optional(),
  price: money.optional(),
  promise: z.enum(["salary", "delivery", "growth"]).optional(),
  deferInvoice: nonneg.max(1000).optional(),
  marketingBoost: finite.optional(),
});
export const StateSchema = z.strictObject({
  version: z.literal(2),
  balanceVersion: z.string().max(40),
  seed: nonneg.max(4294967295),
  rng: nonneg.max(4294967295),
  nextId: nonneg.max(1e9),
  day: nonneg.max(1e6),
  name: z.string().min(1).max(40),
  strategy,
  secondary: strategy.nullable(),
  difficulty: z.enum(["friendly", "standard", "tough"]),
  mode: z.enum(["career", "sandbox", "rescue", "deadline", "fit"]),
  status: z.enum(["playing", "insolvent", "review"]),
  campaignWon: z.boolean().nullable(),
  reviewedQuarter: nonneg,
  cash: money,
  reputation: stat,
  actions: nonneg.max(3),
  borrowedActions: nonneg.max(1),
  lastEmergencyMonth: integer.min(-1),
  policy: z.enum(["fast", "balanced", "quality"]),
  overtime: z.boolean(),
  officeTier: z.union([z.literal(1), z.literal(2)]),
  employees: z
    .array(
      z.strictObject({
        ...candidate,
        morale: stat,
        energy: stat,
        hiredDay: day,
        assignments: z.array(assignment).max(2),
        xp: finite.min(0).max(1000000),
        retentionSince: day.nullable(),
        lastRaise: day,
      }),
    )
    .max(12),
  candidates: z.array(z.strictObject(candidate)).max(10),
  work: z.array(work).max(10000),
  contracts: z
    .array(
      z.strictObject({
        id,
        templateId: id,
        client: str,
        segment,
        type: z.enum(["fixed", "tm"]),
        stage: z.enum(["lead", "qualified", "quoted", "signed", "accepted"]),
        workId: id,
        price: money,
        rate: money,
        estimated: finite.min(0),
        deadline: day,
        trust: stat,
        deposit: money,
        midAccepted: z.boolean(),
        finalAccepted: z.boolean(),
        lateProfile: nonneg.max(365),
        revenue: money,
        invoiced: money,
        changeCount: nonneg,
        changePending: z.boolean(),
        discount: finite.min(0).max(0.15),
        completedDay: day.nullable(),
      }),
    )
    .max(10000),
  invoices: z
    .array(
      z.strictObject({
        id,
        projectId: id,
        label: copy,
        amount: money,
        issued: day,
        due: day,
        clears: day,
        paid: z.boolean(),
        expedited: z.boolean(),
      }),
    )
    .max(50000),
  ledger: z
    .array(
      z.strictObject({
        id,
        day,
        category: z.string().max(100),
        label: copy,
        cash: integer,
        receivable: integer,
        liability: integer,
        deferred: integer,
        capital: integer,
        revenue: integer,
        expense: integer,
        reference: id.optional(),
      }),
    )
    .min(1)
    .max(100000),
  liabilities: z
    .array(
      z.strictObject({
        id,
        label: copy,
        amount: money,
        kind: z.enum(["payroll", "operations", "loan"]),
        created: day,
        deadline: day.nullable(),
      }),
    )
    .max(10000),
  product: z.strictObject({
    exists: z.boolean(),
    concept: id,
    segment,
    name: copy,
    launched: z.boolean(),
    paid: nonneg.max(1e8),
    free: nonneg.max(1e8),
    fit: stat,
    reliability: stat,
    awareness: stat,
    price: money,
    marketing: money,
    debt: stat,
    features: z.array(id).max(18),
    lastLeads: nonneg,
    lastNew: nonneg,
    lastChurn: nonneg,
    churnRate: finite.min(0).max(1),
    conversion: finite.min(0).max(1),
    support: finite.min(0),
    releasedDay: day,
    needs: z.array(id).max(18),
    surveyed: z.boolean(),
  }),
  venture: z.strictObject({
    evidence: stat,
    results: z
      .array(
        z.strictObject({
          id,
          day,
          positive: z.boolean(),
          sample: nonneg,
          responders: nonneg,
          evidence: stat,
          segment,
        }),
      )
      .max(6),
    rounds: nonneg.max(1),
    founderEquity: stat,
    investorEquity: stat,
    offered: z.boolean(),
    investor: id.nullable(),
    pivotUntil: day,
    hypothesis: segment,
    committedGoal: nonneg,
    commitmentDue: day.nullable(),
  }),
  events: z
    .array(
      z.strictObject({
        id,
        templateId: id,
        announced: day,
        due: day,
        expires: day,
        resolved: z.boolean(),
        choice: id.optional(),
      }),
    )
    .max(10000),
  deferred: z
    .array(z.strictObject({ id, due: day, effect, message: copy, source: id }))
    .max(1000),
  promises: z
    .array(
      z.strictObject({
        id,
        label: copy,
        recipient: copy,
        due: day,
        kind: z.enum(["salary", "delivery", "growth", "feature"]),
        target: id,
        goal: finite,
        status: z.enum(["open", "kept", "broken"]),
        created: day,
      }),
    )
    .max(10000),
  history: z
    .array(
      z.strictObject({
        id,
        day,
        type: z.enum(["info", "good", "warning", "critical"]),
        title: copy,
        body: copy,
        cause: str,
      }),
    )
    .max(500),
  months: z
    .array(
      z.strictObject({
        month: nonneg,
        cash: money,
        revenue: integer,
        expense: integer,
        cashFlow: integer,
        operatingCashFlow: integer,
        paid: nonneg,
        free: nonneg,
        churn: finite.min(0).max(1),
        morale: stat,
        reputation: stat,
        debt: stat,
      }),
    )
    .max(10000),
  weeks: z
    .array(
      z.strictObject({
        week: nonneg,
        cashDelta: integer,
        work: finite.min(0),
        morale: stat,
        message: copy,
      }),
    )
    .max(160),
  market: z.strictObject(
    Object.fromEntries(
      ["retail", "creative", "education"].map((k) => [
        k,
        z.strictObject({
          demand: nonneg,
          trend: finite,
          competition: finite.min(0.1).max(10),
        }),
      ]),
    ) as unknown as z.ZodRawShape,
  ),
  tutorial: z.strictObject({
    seen: z
      .array(
        z.enum(["observe", "assign", "policy", "decision", "review", "income"]),
      )
      .max(6),
    completed: z.boolean(),
  }),
  metrics: z.strictObject({
    completedContracts: nonneg,
    repeatClients: z.array(str).max(10000),
    clients: z.array(str).max(10000),
    milestones: nonneg,
    onTime: nonneg,
    incidents: nonneg,
    crises: nonneg,
    workWeek: finite.min(0),
    weekCash: money,
    monthStartCash: money,
    lastWarningDay: integer.min(-100).max(1000000),
    quarterChanges: nonneg,
    releases: nonneg,
    decisions: nonneg,
  }),
});
export function invariantErrors(s: State): string[] {
  const errors: string[] = [];
  const b = balance(s);
  if (b.cash !== s.cash) errors.push("Cash does not reconcile to ledger.");
  if (
    b.cash + b.receivable !==
    b.liability + b.deferred + b.capital + b.revenue - b.expense
  )
    errors.push("Balance sheet does not reconcile.");
  if (
    s.ledger.some(
      (e) =>
        e.cash + e.receivable !==
        e.liability + e.deferred + e.capital + e.revenue - e.expense,
    )
  )
    errors.push("Unbalanced transaction.");
  if (
    b.receivable !==
    s.invoices.filter((i) => !i.paid).reduce((n, i) => n + i.amount, 0)
  )
    errors.push("Receivable mismatch.");
  if (b.liability !== s.liabilities.reduce((n, l) => n + l.amount, 0))
    errors.push("Liability mismatch.");
  if (b.deferred !== s.contracts.reduce((n, c) => n + c.deposit, 0))
    errors.push("Unearned deposit mismatch.");
  if (Math.abs(s.venture.founderEquity + s.venture.investorEquity - 100) > 1e-8)
    errors.push("Ownership is not 100%.");
  if (s.secondary === s.strategy)
    errors.push("Duplicate primary/secondary strategy.");
  if (s.contracts.filter((c) => c.stage === "signed").length > 2)
    errors.push("Too many active contracts.");
  if (s.employees.length > (s.officeTier === 1 ? 5 : 12))
    errors.push("Office capacity exceeded.");
  if (!CONCEPTS.some((c) => c.id === s.product.concept))
    errors.push("Unknown product concept.");
  if (
    s.events.some(
      (e) =>
        !EVENTS.some(
          (t) =>
            t.id === e.templateId &&
            (!e.choice || t.choices.some((c) => c.id === e.choice)),
        ),
    )
  )
    errors.push("Unknown event or choice.");
  if (s.contracts.some((c) => !CONTRACTS.some((t) => t.id === c.templateId)))
    errors.push("Unknown contract template.");
  if (s.product.features.some((id) => !FEATURES.some((f) => f.id === id)))
    errors.push("Unknown released feature.");
  if (
    s.work.some(
      (w) =>
        (w.featureId && !FEATURES.some((f) => f.id === w.featureId)) ||
        (w.experimentId && !EXPERIMENTS.some((e) => e.id === w.experimentId)),
    )
  )
    errors.push("Unknown work content.");
  if (
    s.venture.results.some((r) => !EXPERIMENTS.some((e) => e.id === r.id)) ||
    (s.venture.investor && !TERMS.some((t) => t.id === s.venture.investor))
  )
    errors.push("Unknown venture content.");
  if (
    [...s.employees, ...s.candidates].some((e) =>
      e.traits.some((t) => !TRAITS[t]),
    )
  )
    errors.push("Unknown employee trait.");
  if (
    s.employees.some((e) =>
      e.assignments.some((a) => a.kind === "support" && a.target !== "market"),
    )
  )
    errors.push("Invalid support assignment.");
  const workIds = new Set(s.work.map((w) => w.id));
  for (const e of s.employees) {
    if (
      e.assignments.some((a) => a.target !== "market" && !workIds.has(a.target))
    )
      errors.push("Unknown assignment target.");
    if (
      new Set(e.assignments.map((a) => a.target + ":" + a.kind)).size !==
      e.assignments.length
    )
      errors.push("Duplicate assignment.");
  }
  if (s.contracts.some((c) => !workIds.has(c.workId)))
    errors.push("Missing contract work.");
  const contractIds = new Set(s.contracts.map((c) => c.id));
  if (s.invoices.some((i) => !contractIds.has(i.projectId)))
    errors.push("Missing invoice project.");
  for (const list of [
    s.employees,
    s.candidates,
    s.work,
    s.contracts,
    s.invoices,
    s.ledger,
    s.liabilities,
    s.events,
    s.promises,
    s.deferred,
  ])
    if (new Set(list.map((x) => x.id)).size !== list.length)
      errors.push("Duplicate entity id.");
  if (new Set(s.product.features).size !== s.product.features.length)
    errors.push("Duplicate released feature.");
  if (s.work.some((w) => w.done > w.actual + 0.001))
    errors.push("Work exceeds its fixed scope.");
  if (s.events.some((e) => e.due < e.announced || e.expires < e.due))
    errors.push("Invalid event dates.");
  if (s.venture.results.some((e) => e.responders > e.sample))
    errors.push("Invalid experiment sample.");
  return errors;
}
export function validateState(input: unknown): State {
  const parsed = StateSchema.parse(input) as unknown as State;
  const errors = invariantErrors(parsed);
  if (errors.length) throw new Error(errors.join(" "));
  return parsed;
}
