import type { ClockState } from "./clock";
import type { AccrualState } from "./accrual";
import type { AppearanceId } from "../characters/catalog";

export type Strategy = "outsourcing" | "product" | "startup";
export type Difficulty = "friendly" | "standard" | "tough";
export type Policy = "fast" | "balanced" | "quality";
export type Role = "developer" | "qa" | "designer" | "growth" | "ops";
export type Segment = "retail" | "creative" | "education";
export type TaskKind =
  | "develop"
  | "qa"
  | "fix"
  | "refactor"
  | "research"
  | "growth"
  | "support";
export type Locale = "vi" | "en";
export type Copy = { vi: string; en: string };
export type Money = number; // Integer US cents. Display converts once at UI boundary.
export interface Assignment {
  target: string;
  kind: TaskKind;
}
export interface Employee {
  id: string;
  name: string;
  role: Role;
  skill: number;
  salary: Money;
  morale: number;
  energy: number;
  traits: string[];
  hiredDay: number;
  assignments: Assignment[];
  xp: number;
  retentionSince: number | null;
  lastRaise: number;
  variant: number;
  appearance?: AppearanceId;
}
export interface Candidate {
  id: string;
  name: string;
  role: Role;
  skill: number;
  salary: Money;
  traits: string[];
  variant: number;
  appearance?: AppearanceId;
}
export interface Defect {
  id: string;
  severity: 1 | 2 | 3;
  known: boolean;
  remaining: number;
  created: number;
  revealed: number | null;
}
export interface WorkItem {
  id: string;
  label: Copy;
  kind: "contract" | "feature" | "experiment" | "mvp";
  estimated: number;
  actual: number;
  done: number;
  effort: number;
  qa: number;
  debt: number;
  bugs: Defect[];
  status: "active" | "ready" | "released";
  labor: Money;
  featureId?: string;
  experimentId?: string;
  projectId?: string;
  discovered: boolean;
  created: number;
}
export interface Contract {
  id: string;
  templateId: string;
  client: string;
  segment: Segment;
  type: "fixed" | "tm";
  stage: "lead" | "qualified" | "quoted" | "signed" | "accepted";
  workId: string;
  price: Money;
  rate: Money;
  estimated: number;
  deadline: number;
  trust: number;
  deposit: Money;
  midAccepted: boolean;
  finalAccepted: boolean;
  lateProfile: number;
  revenue: Money;
  invoiced: Money;
  changeCount: number;
  changePending: boolean;
  discount: number;
  completedDay: number | null;
}
export interface Invoice {
  id: string;
  projectId: string;
  label: Copy;
  amount: Money;
  issued: number;
  due: number;
  clears: number;
  paid: boolean;
  expedited: boolean;
}
export interface Entry {
  id: string;
  day: number;
  category: string;
  label: Copy;
  cash: number;
  receivable: number;
  liability: number;
  deferred: number;
  capital: number;
  revenue: number;
  expense: number;
  reference?: string;
}
export interface Liability {
  id: string;
  label: Copy;
  amount: Money;
  kind: "payroll" | "operations" | "loan";
  created: number;
  deadline: number | null;
}
export interface Product {
  exists: boolean;
  concept: string;
  segment: Segment;
  name: Copy;
  launched: boolean;
  paid: number;
  free: number;
  fit: number;
  reliability: number;
  awareness: number;
  price: Money;
  marketing: Money;
  debt: number;
  features: string[];
  lastLeads: number;
  lastNew: number;
  lastChurn: number;
  churnRate: number;
  conversion: number;
  support: number;
  releasedDay: number;
  needs: string[];
  surveyed: boolean;
}
export interface ExperimentResult {
  id: string;
  day: number;
  positive: boolean;
  sample: number;
  responders: number;
  evidence: number;
  segment: Segment;
}
export interface Venture {
  evidence: number;
  results: ExperimentResult[];
  rounds: number;
  founderEquity: number;
  investorEquity: number;
  offered: boolean;
  investor: string | null;
  pivotUntil: number;
  hypothesis: Segment;
  committedGoal: number;
  commitmentDue: number | null;
}
export interface Effect {
  cash?: Money;
  morale?: number;
  energy?: number;
  reputation?: number;
  trust?: number;
  fit?: number;
  demand?: number;
  reliability?: number;
  awareness?: number;
  debt?: number;
  scope?: number;
  price?: Money;
  promise?: "salary" | "delivery" | "growth";
  deferInvoice?: number;
  marketingBoost?: number;
}
export interface EventChoice {
  id: string;
  label: Copy;
  description: Copy;
  cost: Money;
  actions: number;
  immediate: Effect;
  delay?: { days: number; effect: Effect; message: Copy };
}
export interface EventTemplate {
  id: string;
  category: string;
  title: Copy;
  body: Copy;
  warning: Copy;
  choices: EventChoice[];
  context:
    | "all"
    | "contract"
    | "product"
    | "startup"
    | "morale"
    | "cash"
    | "funded";
  minDay: number;
}
export interface PendingEvent {
  id: string;
  templateId: string;
  announced: number;
  due: number;
  expires: number;
  resolved: boolean;
  choice?: string;
}
export interface DeferredEffect {
  id: string;
  due: number;
  effect: Effect;
  message: Copy;
  source: string;
}
export interface PromiseItem {
  id: string;
  label: Copy;
  recipient: Copy;
  due: number;
  kind: "salary" | "delivery" | "growth" | "feature";
  target: string;
  goal: number;
  status: "open" | "kept" | "broken";
  created: number;
}
export interface HistoryItem {
  id: string;
  day: number;
  type: "info" | "good" | "warning" | "critical";
  title: Copy;
  body: Copy;
  cause: string;
}
export interface MonthReview {
  month: number;
  cash: Money;
  revenue: Money;
  expense: Money;
  cashFlow: Money;
  operatingCashFlow: Money;
  paid: number;
  free: number;
  churn: number;
  morale: number;
  reputation: number;
  debt: number;
}
export interface WeekReview {
  week: number;
  cashDelta: Money;
  work: number;
  morale: number;
  message: Copy;
}
export interface Tutorial {
  seen: string[];
  completed: boolean;
}
export interface WorkBudget {
  roll: number;
  exposure: number;
  emitted: boolean;
}
export interface State {
  version: 3;
  clock: ClockState;
  accrual: AccrualState;
  workDay: { day: number; budgets: Record<string, WorkBudget> };
  discovery: Record<string, { required: number; done: number }>;
  scene: { officeLightsOn: boolean };
  balanceVersion: string;
  seed: number;
  rng: number;
  nextId: number;
  day: number;
  name: string;
  strategy: Strategy;
  secondary: Strategy | null;
  difficulty: Difficulty;
  mode: "career" | "sandbox" | "rescue" | "deadline" | "fit";
  status: "playing" | "insolvent" | "review";
  campaignWon: boolean | null;
  reviewedQuarter: number;
  cash: Money;
  reputation: number;
  actions: number;
  borrowedActions: number;
  lastEmergencyMonth: number;
  policy: Policy;
  overtime: boolean;
  officeTier: 1 | 2;
  employees: Employee[];
  candidates: Candidate[];
  work: WorkItem[];
  contracts: Contract[];
  invoices: Invoice[];
  ledger: Entry[];
  liabilities: Liability[];
  product: Product;
  venture: Venture;
  events: PendingEvent[];
  deferred: DeferredEffect[];
  promises: PromiseItem[];
  history: HistoryItem[];
  months: MonthReview[];
  weeks: WeekReview[];
  market: Record<
    Segment,
    { demand: number; trend: number; competition: number }
  >;
  tutorial: Tutorial;
  metrics: {
    completedContracts: number;
    repeatClients: string[];
    clients: string[];
    milestones: number;
    onTime: number;
    incidents: number;
    crises: number;
    workWeek: number;
    weekCash: Money;
    monthStartCash: Money;
    lastWarningDay: number;
    quarterChanges: number;
    releases: number;
    decisions: number;
  };
}
export type Command =
  | { type: "tick"; days?: number }
  | { type: "advanceTime"; steps: number }
  | { type: "officeLights"; enabled: boolean }
  | {
      type: "assign";
      employeeId: string;
      target: string;
      kind: TaskKind;
      append?: boolean;
    }
  | {
      type: "assignBatch";
      changes: {
        employeeId: string;
        expected: Assignment[];
        assignments: Assignment[];
      }[];
    }
  | { type: "unassign"; employeeId: string }
  | { type: "policy"; policy: Policy }
  | { type: "overtime"; enabled: boolean }
  | { type: "hire"; candidateId: string }
  | { type: "dismiss"; employeeId: string }
  | { type: "raise"; employeeId: string }
  | { type: "train"; employeeId: string }
  | { type: "decide"; eventId: string; choiceId: string }
  | { type: "emergencyAction" }
  | { type: "loan"; amount: Money }
  | { type: "repay" }
  | { type: "qualify"; contractId: string }
  | {
      type: "quote";
      contractId: string;
      contractType: "fixed" | "tm";
      discount: number;
    }
  | { type: "sign"; contractId: string }
  | {
      type: "accept";
      contractId: string;
      milestone: "mid" | "final";
      override?: boolean;
    }
  | {
      type: "change";
      contractId: string;
      choice: "paid" | "free" | "decline" | "extend";
    }
  | { type: "collect"; invoiceId: string }
  | { type: "findLead" }
  | { type: "startFeature"; featureId: string }
  | { type: "release"; workId: string; override?: boolean }
  | { type: "marketing"; amount: Money }
  | { type: "price"; amount: Money }
  | { type: "survey" }
  | { type: "experiment"; experimentId: string }
  | { type: "buildMvp" }
  | { type: "pitch" }
  | { type: "funding"; termId: string }
  | { type: "pivot"; segment: Segment }
  | { type: "secondary"; strategy: Strategy }
  | { type: "strategy"; strategy: Strategy }
  | { type: "upgradeOffice" }
  | { type: "continueSandbox" }
  | { type: "tutorial"; step: string };
export interface Transition {
  state: State;
  ok: boolean;
  error?: Copy;
  critical: boolean;
  steps?: number;
}
export interface NewGameOptions {
  name: string;
  strategy: Strategy;
  difficulty: Difficulty;
  seed: number;
  mode?: State["mode"];
  concept?: string;
  segment?: Segment;
}
