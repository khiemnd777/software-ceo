import { describe, it, expect } from "vitest";
import { createGame } from "../../src/simulation/create";
import { transition } from "../../src/simulation/engine";
import { invariantErrors } from "../../src/persistence/schema";
import type { Command, Strategy, State } from "../../src/simulation/types";

describe("adversarial command sequences preserve transactions and accounting", () => {
  for (const strategy of ["outsourcing", "product", "startup"] as Strategy[])
    it(`${strategy}: 750 seeded mixed valid/invalid commands`, () => {
      let rejected = 0,
        accepted = 0;
      for (let seed = 1; seed <= 5; seed++) {
        let s: State = createGame({
          name: "Adversarial QA",
          strategy,
          difficulty: "tough",
          seed,
        });
        let random = seed;
        const roll = (n: number) => {
          random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
          return random % n;
        };
        for (let step = 0; step < 150; step++) {
          const employee = s.employees[roll(Math.max(1, s.employees.length))],
            work = s.work[roll(Math.max(1, s.work.length))],
            contract = s.contracts[roll(Math.max(1, s.contracts.length))];
          const commands: Command[] = [
            { type: "tick", days: roll(9) },
            {
              type: "policy",
              policy: (["fast", "balanced", "quality"] as const)[roll(3)],
            },
            {
              type: "price",
              amount: [-100, 2900, 7900, 19900, 20000, NaN][roll(6)],
            },
            {
              type: "marketing",
              amount: [-1, 0, 200000, 1000001, Infinity][roll(5)],
            },
            {
              type: "hire",
              candidateId:
                s.candidates[roll(Math.max(1, s.candidates.length))]?.id ??
                "missing",
            },
            {
              type: "assign",
              employeeId: employee?.id ?? "missing",
              target: work?.id ?? "missing",
              kind: (
                [
                  "develop",
                  "qa",
                  "fix",
                  "refactor",
                  "research",
                  "support",
                ] as const
              )[roll(6)],
            },
            {
              type: "accept",
              contractId: contract?.id ?? "missing",
              milestone: roll(2) ? "mid" : "final",
            },
            { type: "release", workId: work?.id ?? "missing" },
            { type: "findLead" },
            { type: "loan", amount: [1000000, 2000000, 1, -1][roll(4)] },
            { type: "emergencyAction" },
            { type: "train", employeeId: employee?.id ?? "missing" },
            { type: "unknown-command" } as unknown as Command,
            {
              type: "quote",
              contractId: contract?.id ?? "missing",
              contractType: "fixed",
              discount: [0, 0.1, 0.15, 0.16, -0.1][roll(5)],
            },
            { type: "upgradeOffice" },
          ];
          const before = JSON.stringify(s);
          const r = transition(s, commands[roll(commands.length)]);
          expect(JSON.stringify(s)).toBe(before);
          if (r.ok) {
            accepted++;
            s = r.state;
          } else {
            rejected++;
            expect(r.state).toEqual(s);
            expect(r.error?.en).toBeTruthy();
          }
          expect(invariantErrors(s)).toEqual([]);
        }
      }
      expect(accepted).toBeGreaterThan(30);
      expect(rejected).toBeGreaterThan(100);
    });
});
