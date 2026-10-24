import { createGame } from "../../../src/simulation/create";
import { transition } from "../../../src/simulation/engine";
import { makeWork } from "../../../src/simulation/work";
import { copy } from "../../../src/content/catalog";
import type { State, Strategy } from "../../../src/simulation/types";

// Synthetic review state. Never load a campaign, browser storage or exported save.
function makeOutsourcing(): State {
  let s = createGame({
    name: "KNA SOFTWARE",
    strategy: "outsourcing",
    difficulty: "standard",
    seed: 221026,
  });
  s.day = 77;
  s.contracts[0].deadline = 110;
  s.contracts[0].lateProfile = 4;
  s = transition(s, { type: "sign", contractId: s.contracts[0].id }).state;
  const original = s.employees[0];
  s.employees.push(
    {
      ...structuredClone(original),
      id: "mock-dev",
      name: "Đức Phạm",
      salary: 340000,
      skill: 4,
      variant: 2,
      appearance: "male-shorts",
      morale: 84,
      energy: 87,
      assignments: [],
    },
    {
      ...structuredClone(original),
      id: "mock-designer",
      name: "An Lê",
      role: "designer",
      salary: 300000,
      variant: 3,
      appearance: "female-skirt-long-long",
      morale: 88,
      energy: 91,
      assignments: [],
    },
  );
  s.employees[0].morale = 86;
  s.employees[1].morale = 82;
  const first = s.work[0];
  first.done = 23;
  first.qa = 3;
  first.debt = 4;
  s.employees[0].assignments = [{ target: first.id, kind: "develop" }];
  s.employees[1].assignments = [{ target: first.id, kind: "qa" }];
  const second = makeWork(
    s,
    copy("Cổng học trực tuyến", "Learning portal"),
    "contract",
    60,
    { projectId: "mock-academy" },
  );
  s.contracts.push({
    ...structuredClone(s.contracts[0]),
    id: "mock-academy",
    workId: second.id,
    client: "Bright Academy",
    templateId: "mock-academy",
    stage: "quoted",
    price: 4200000,
    deadline: 126,
    deposit: 0,
    revenue: 0,
    invoiced: 0,
  });
  s = transition(s, { type: "sign", contractId: "mock-academy" }).state;
  s.employees.find((e) => e.id === "mock-dev")!.assignments = [
    { target: second.id, kind: "develop" },
  ];
  const third = makeWork(
    s,
    copy("Website giới thiệu studio", "Studio website"),
    "contract",
    28,
    { projectId: "mock-studio" },
  );
  s.contracts.push({
    ...structuredClone(s.contracts[0]),
    id: "mock-studio",
    workId: third.id,
    client: "Pine Studio",
    templateId: "mock-studio",
    stage: "quoted",
    price: 1800000,
    deadline: 139,
    deposit: 0,
    revenue: 0,
    invoiced: 0,
  });
  s.actions = 3;
  s.reputation = 53;
  s.tutorial = {
    seen: ["observe", "assign", "policy", "decision", "review", "income"],
    completed: true,
  };
  return s;
}

export function makeFixture(strategy: Strategy = "outsourcing"): State {
  if (strategy === "outsourcing") return makeOutsourcing();
  const s = createGame({
    name: "KNA SOFTWARE",
    strategy,
    difficulty: "standard",
    seed: 231026,
  });
  s.day = 21;
  s.tutorial = {
    seen: ["observe", "assign", "policy", "decision", "review", "income"],
    completed: true,
  };
  if (strategy === "startup") s.venture.evidence = 18;
  return s;
}
