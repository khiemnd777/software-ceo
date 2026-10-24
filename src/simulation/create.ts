import type { State, NewGameOptions, Role, Candidate } from "./types";
import { copy, ARCHETYPES, SEGMENTS, BALANCE } from "../content/catalog";
import { CONCEPTS } from "../content/products";
import { uid, rng, log } from "./helpers";
import { book } from "./finance";
import { makeWork } from "./work";
import { appearanceForArchetype } from "../characters/catalog";
export function refreshCandidates(s: State) {
  s.candidates = [];
  const pool = [...ARCHETYPES];
  for (let i = 0; i < 5; i++) {
    const index = Math.floor(rng(s) * pool.length),
      a = pool.splice(index, 1)[0];
    const c: Candidate = {
      id: uid(s, "candidate"),
      name: a.name,
      role: a.role,
      skill: a.skill,
      salary: a.salary,
      traits: [...a.traits],
      variant: i,
      appearance: appearanceForArchetype(a.id),
    };
    s.candidates.push(c);
  }
}
export function createGame(o: NewGameOptions): State {
  if (o.mode === "rescue") o = { ...o, strategy: "startup" };
  if (o.mode === "deadline") o = { ...o, strategy: "outsourcing" };
  if (o.mode === "fit") o = { ...o, strategy: "product" };
  const seed = (Number.isFinite(o.seed) ? Math.trunc(o.seed) : 2026) >>> 0;
  const s: State = {
    version: 2,
    balanceVersion: BALANCE.version,
    seed,
    rng: seed,
    nextId: 1,
    day: 0,
    name: o.name.trim().slice(0, 40) || "Evergreen Studio",
    strategy: o.strategy,
    secondary: null,
    difficulty: o.difficulty,
    mode: o.mode ?? "career",
    status: "playing",
    campaignWon: null,
    reviewedQuarter: 0,
    cash: 0,
    reputation: 45,
    actions: 3,
    borrowedActions: 0,
    lastEmergencyMonth: -1,
    policy: "balanced",
    overtime: false,
    officeTier: 1,
    employees: [],
    candidates: [],
    work: [],
    contracts: [],
    invoices: [],
    ledger: [],
    liabilities: [],
    product: {
      exists: o.strategy !== "outsourcing",
      concept: o.concept ?? "retail",
      segment: o.segment ?? "retail",
      name: copy("Mộc — vận hành bán lẻ", "Moc — retail operations"),
      launched: o.strategy === "product",
      paid: o.strategy === "product" ? 35 : 0,
      free: 0,
      fit: o.strategy === "product" ? 50 : 20,
      reliability: 80,
      awareness: 12,
      price: 7900,
      marketing: 0,
      debt: 0,
      features: [],
      lastLeads: 0,
      lastNew: 0,
      lastChurn: 0,
      churnRate: 0.04,
      conversion: 0.12,
      support: 0,
      releasedDay: 0,
      needs: [],
      surveyed: false,
    },
    venture: {
      evidence: 0,
      results: [],
      rounds: 0,
      founderEquity: 100,
      investorEquity: 0,
      offered: false,
      investor: null,
      pivotUntil: 0,
      hypothesis: o.segment ?? "retail",
      committedGoal: 0,
      commitmentDue: null,
    },
    events: [],
    deferred: [],
    promises: [],
    history: [],
    months: [],
    weeks: [],
    market: Object.fromEntries(
      Object.entries(SEGMENTS).map(([k, v]) => [
        k,
        {
          demand: v.demand,
          trend: 0,
          competition: o.difficulty === "tough" ? 1.15 : 1,
        },
      ]),
    ) as State["market"],
    tutorial: { seen: [], completed: false },
    metrics: {
      completedContracts: 0,
      repeatClients: [],
      clients: [],
      milestones: 0,
      onTime: 0,
      incidents: 0,
      crises: 0,
      workWeek: 0,
      weekCash: 0,
      monthStartCash: 0,
      lastWarningDay: -100,
      quarterChanges: 0,
      releases: 0,
      decisions: 0,
    },
  };
  const start = Math.round(
    BALANCE.startingCash[o.strategy] *
      (o.difficulty === "friendly"
        ? 1.25
        : o.difficulty === "tough"
          ? 0.85
          : 1),
  );
  book(s, "capital", copy("Vốn sáng lập", "Founder capital"), {
    cash: start,
    capital: start,
  });
  const roles: Role[] =
    o.strategy === "product"
      ? ["developer", "designer"]
      : o.strategy === "outsourcing"
        ? ["developer", "qa"]
        : ["developer", "growth"];
  const salaries =
    o.strategy === "product"
      ? [350000, 300000]
      : o.strategy === "outsourcing"
        ? [330000, 270000]
        : [400000, 350000];
  for (let i = 0; i < 2; i++)
    s.employees.push({
      id: uid(s, "employee"),
      name: i === 0 ? "Minh Nguyễn" : "Linh Trần",
      role: roles[i],
      skill: 3,
      salary: salaries[i],
      morale: 76,
      energy: 90,
      traits: i === 0 ? ["learner"] : ["meticulous"],
      hiredDay: -14,
      assignments: [],
      xp: 0,
      retentionSince: null,
      lastRaise: -30,
      variant: i,
      appearance: i === 0 ? "male-trousers" : "female-trousers-short",
    });
  refreshCandidates(s);
  const concept =
    CONCEPTS.find((c) => c.id === s.product.concept) ?? CONCEPTS[0];
  s.product.concept = concept.id;
  s.product.name = concept.name;
  s.product.segment = o.segment ?? concept.segment;
  if (o.strategy === "product") {
    const w = makeWork(s, copy("MVP đang hoạt động", "Live MVP"), "mvp", 12);
    w.done = w.actual;
    w.status = "released";
  }
  if (o.strategy === "outsourcing") {
    const id = uid(s, "contract");
    const w = makeWork(
      s,
      copy("Cổng quản lý cửa hàng", "Retail operations portal"),
      "contract",
      40,
      { projectId: id },
    );
    s.contracts.push({
      id,
      templateId: "retail-launch",
      client: "Mộc Retail",
      segment: "retail",
      type: "fixed",
      stage: "quoted",
      workId: w.id,
      price: 3000000,
      rate: 75000,
      estimated: 40,
      deadline: o.difficulty === "tough" ? 63 : 70,
      trust: 60,
      deposit: 0,
      midAccepted: false,
      finalAccepted: false,
      lateProfile: 5,
      revenue: 0,
      invoiced: 0,
      changeCount: 0,
      changePending: false,
      discount: 0,
      completedDay: null,
    });
  }
  if (s.mode === "rescue") {
    const reduction = Math.max(0, s.cash - 3000000);
    book(s, "challenge", copy("Vốn sau khủng hoảng", "Post-crisis capital"), {
      cash: -reduction,
      capital: -reduction,
    });
  }
  if (s.mode === "deadline" && s.contracts[0]) s.contracts[0].deadline = 56;
  s.metrics.weekCash = s.cash;
  s.metrics.monthStartCash = s.cash;
  log(
    s,
    "good",
    copy("Công ty bắt đầu hoạt động", "Your company is open"),
    copy(
      "Mỗi tuần có 3 lượt CEO. Phân công nhân viên không tốn lượt.",
      "You have 3 CEO actions per week. Assigning employees is free.",
    ),
    "new-game",
  );
  return s;
}
