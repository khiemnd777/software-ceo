import { describe, it, expect } from "vitest";
import {
  APPEARANCES,
  APPEARANCE_IDS,
  ARCHETYPE_APPEARANCE,
  appearanceForArchetype,
} from "../src/characters/catalog";
import { resolveAppearance } from "../src/characters/resolve";
import { ARCHETYPES } from "../src/content/catalog";
import { createGame } from "../src/simulation/create";
import { transition } from "../src/simulation/engine";
import { decodeSave, encodeSave, checksum } from "../src/persistence/saves";
import { validateState } from "../src/persistence/schema";
import before from "./fixtures/character-business-v2.json";
import legacy from "./fixtures/character-legacy-v2.json";
import type { State, NewGameOptions } from "../src/simulation/types";

function withoutAppearance(state: State) {
  const copy = structuredClone(state);
  for (const person of [...copy.employees, ...copy.candidates])
    delete person.appearance;
  return copy;
}

describe("authored character identity and legacy saves", () => {
  it("has exactly the approved two male and six female wardrobe combinations", () => {
    expect(APPEARANCE_IDS).toHaveLength(8);
    const models = Object.values(APPEARANCES);
    expect(models.filter((p) => p.gender === "male")).toHaveLength(2);
    expect(models.filter((p) => p.gender === "female")).toHaveLength(6);
    expect(
      new Set(
        models
          .filter((p) => p.gender === "female")
          .map((p) => `${p.bottom}/${p.hair}`),
      ).size,
    ).toBe(6);
    expect(Object.keys(ARCHETYPE_APPEARANCE).sort()).toEqual(
      ARCHETYPES.map((p) => p.id).sort(),
    );
    for (const profile of ARCHETYPES)
      expect(APPEARANCE_IDS).toContain(appearanceForArchetype(profile.id));
  });
  it("preserves recorded T0.3 snapshots on migration and replays the T0.4 future deterministically", async () => {
    for (const fixture of before) {
      const current = createGame(fixture.options as NewGameOptions);
      expect(current.rng).toBe(fixture.initial.rng);
      expect(current.cash).toBe(fixture.initial.cash);
      for (const recorded of [fixture.initial, fixture.after]) {
        const envelope = {
          format: "software-ceo-save",
          schemaVersion: 2,
          algorithm: "SHA-256",
          checksum: await checksum(recorded),
          state: recorded,
        };
        const restored = await decodeSave(JSON.stringify(envelope));
        expect(withoutAppearance(restored)).toMatchObject({
          ...recorded,
          version: 3,
          balanceVersion: "T0.4",
          day: recorded.day + 1,
        });
        expect(restored.clock.lastClosedDay).toBe(recorded.day);
        const copy = await decodeSave(await encodeSave(restored));
        expect(transition(restored, { type: "tick", days: 35 })).toEqual(
          transition(copy, { type: "tick", days: 35 }),
        );
      }
    }
  });
  it("projects registered legacy identities read-only and honors explicit metadata", () => {
    const person = { id: "old-employee", name: "Linh Trần", variant: 1 };
    expect(resolveAppearance(person)).toBe("female-trousers-short");
    expect(person).not.toHaveProperty("appearance");
    expect(
      resolveAppearance({
        ...person,
        name: "Minh Nguyễn",
        appearance: "female-skirt-short-long",
      }),
    ).toBe("female-skirt-short-long");
    const unknown = { id: "custom-legacy", name: "Custom name", variant: 7 };
    expect(resolveAppearance(unknown)).toBe(
      resolveAppearance({ ...unknown, name: "Any other name" }),
    );
    expect(resolveAppearance(unknown)).toBe(
      resolveAppearance(structuredClone(unknown)),
    );
  });
  it("loads genuine v2 bytes without changing identities or checksum input", async () => {
    const restored = await decodeSave(JSON.stringify(legacy));
    expect(restored).toMatchObject({
      ...before[0].initial,
      version: 3,
      balanceVersion: "T0.4",
      day: 1,
    });
    expect(restored.clock).toEqual({
      minute: 0,
      opened: false,
      lastClosedDay: 0,
    });
    expect(restored.employees[1]).not.toHaveProperty("appearance");
    expect(resolveAppearance(restored.employees[1])).toBe(
      "female-trousers-short",
    );
    const next = await decodeSave(await encodeSave(restored));
    expect(next).toEqual(restored);
    expect(legacy.state.employees[1]).not.toHaveProperty("appearance");
  });
  it("round-trips new metadata and freezes an unknown legacy candidate's appearance on hire", async () => {
    const state = createGame(before[0].options as NewGameOptions);
    expect(await decodeSave(await encodeSave(state))).toEqual(state);
    const candidate = state.candidates[0];
    delete candidate.appearance;
    candidate.name = "Custom candidate";
    const expected = resolveAppearance(candidate);
    const hired = transition(state, {
      type: "hire",
      candidateId: candidate.id,
    });
    expect(hired.ok).toBe(true);
    expect(hired.state.employees.at(-1)?.appearance).toBe(expected);
    expect(candidate).not.toHaveProperty("appearance");
    const invalid = structuredClone(state) as unknown as {
      candidates: { appearance: string }[];
    };
    invalid.candidates[0].appearance = "unregistered-model";
    expect(() => validateState(invalid)).toThrow();
  });
});
