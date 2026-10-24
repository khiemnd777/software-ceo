import "fake-indexeddb/auto";
import { describe, it, expect, afterAll } from "vitest";
import { createGame } from "../../src/simulation/create";
import { transition } from "../../src/simulation/engine";
import {
  encodeSave,
  decodeSave,
  checksum,
  canonical,
  saveGame,
  loadSave,
  listSaves,
  resetConnection,
} from "../../src/persistence/saves";
import { validateState, invariantErrors } from "../../src/persistence/schema";
const fresh = () =>
  createGame({
    name: "Save test",
    strategy: "product",
    difficulty: "standard",
    seed: 731,
  });
afterAll(resetConnection);
describe("durable and defensive saves", () => {
  it("round-trips exact state, pending effects and RNG", async () => {
    let s = fresh();
    s = transition(s, { type: "tick", days: 35 }).state;
    s.deferred.push({
      id: "deferred-test",
      due: 70,
      effect: { morale: 4 },
      message: { vi: "Kết quả", en: "Outcome" },
      source: "test",
    });
    const restored = await decodeSave(await encodeSave(s));
    expect(restored).toEqual(s);
    expect(transition(restored, { type: "tick", days: 70 })).toEqual(
      transition(s, { type: "tick", days: 70 }),
    );
  });
  it("rejects modified bytes, unknown versions and malformed JSON", async () => {
    const raw = await encodeSave(fresh());
    const e = JSON.parse(raw);
    e.state.cash++;
    await expect(decodeSave(JSON.stringify(e))).rejects.toThrow("Checksum");
    e.schemaVersion = 99;
    await expect(decodeSave(JSON.stringify(e))).rejects.toThrow("newer");
    await expect(decodeSave("{")).rejects.toThrow("Invalid JSON");
  });
  it("migrates the documented v1 envelope without dropping pending or RNG state", async () => {
    const current = fresh();
    const legacy: Record<string, unknown> = { ...current, version: 1 };
    delete legacy.balanceVersion;
    delete legacy.tutorial;
    const envelope = {
      format: "software-ceo-save",
      schemaVersion: 1,
      algorithm: "SHA-256",
      checksum: await checksum(legacy),
      state: legacy,
    };
    const restored = await decodeSave(JSON.stringify(envelope));
    expect(restored).toEqual(current);
  });
  it("validates nested numbers, references and accounting even with a recomputed checksum", async () => {
    const s = fresh();
    s.cash++;
    const envelope = {
      format: "software-ceo-save",
      schemaVersion: 2,
      algorithm: "SHA-256",
      checksum: await checksum(s),
      state: s,
    };
    await expect(decodeSave(JSON.stringify(envelope))).rejects.toThrow(
      "reconcile",
    );
    expect(() =>
      validateState({
        ...fresh(),
        employees: [{ ...fresh().employees[0], skill: 99 }],
      }),
    ).toThrow();
  });
  it("writes three independent slots and protects against stale-tab overwrites", async () => {
    for (const slot of ["1", "2", "3"] as const)
      await saveGame(slot, fresh(), null);
    expect((await listSaves()).filter((r) => r.slot !== "auto")).toHaveLength(
      3,
    );
    const saved = await loadSave("1");
    expect(saved).toEqual(fresh());
    await saveGame("1", saved, 1);
    await expect(saveGame("1", saved, 1)).rejects.toThrow("another tab");
    expect((await listSaves()).find((r) => r.slot === "1")!.revision).toBe(2);
  });
  it("keeps autosave independent of the three manual slots", async () => {
    const s = transition(fresh(), { type: "tick", days: 7 }).state;
    await saveGame("auto", s, null);
    expect((await loadSave("auto")).day).toBe(7);
    expect((await loadSave("2")).day).toBe(0);
    expect(invariantErrors(s)).toEqual([]);
  });
  it("rejects oversized imports before parsing", async () => {
    await expect(decodeSave(" ".repeat(10 * 1024 * 1024 + 1))).rejects.toThrow(
      "10 MB",
    );
  });
});

it("rejects excessive nesting before hashing untrusted imports", async () => {
  let nested: unknown = {};
  for (let i = 0; i < 40; i++) nested = { child: nested };
  expect(() => canonical(nested)).toThrow("nested");
  const envelope = {
    format: "software-ceo-save",
    schemaVersion: 2,
    algorithm: "SHA-256",
    checksum: "0".repeat(64),
    state: nested,
  };
  await expect(decodeSave(JSON.stringify(envelope))).rejects.toThrow("nested");
  expect(canonical([1, 2, { z: [3], a: 4 }])).toBe('[1,2,{"a":4,"z":[3]}]');
});
