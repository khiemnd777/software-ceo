import "fake-indexeddb/auto";
import { it, expect, afterAll, vi } from "vitest";
import { createGame } from "../../src/simulation/create";
import {
  decodeSave,
  encodeSave,
  listSaves,
  listLegacyBackups,
  saveGame,
  resetConnection,
} from "../../src/persistence/saves";
import legacy from "../fixtures/character-legacy-v2.json";
const fresh = () =>
  createGame({
    name: "Backup",
    strategy: "product",
    difficulty: "standard",
    seed: 1,
  });
afterAll(resetConnection);
async function seedLegacy(slot: "1" | "2") {
  await listSaves();
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("software-ceo", 3);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  const payload = JSON.stringify(legacy);
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("saves", "readwrite");
    tx.objectStore("saves").put({
      slot,
      revision: 7,
      name: "Legacy",
      day: 0,
      strategy: "product",
      savedAt: "2026-01-01T00:00:00Z",
      payload,
    });
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error);
  });
  db.close();
  return payload;
}
it("migrates RAM only, then retains exact legacy payload atomically before overwrite", async () => {
  const payload = await seedLegacy("1");
  const migrated = await decodeSave(payload);
  expect((await listSaves()).find((r) => r.slot === "1")?.payload).toBe(
    payload,
  );
  expect(await listLegacyBackups()).toHaveLength(0);
  await saveGame("1", migrated, 7);
  const backups = await listLegacyBackups();
  expect(backups).toHaveLength(1);
  expect(backups[0]).toMatchObject({ id: "1:7", revision: 7, payload });
  const saved = (await listSaves()).find((r) => r.slot === "1")!;
  expect(saved.revision).toBe(8);
  expect(JSON.parse(saved.payload).schemaVersion).toBe(3);
  await saveGame("1", migrated, 8);
  expect(await listLegacyBackups()).toEqual(backups);
  await expect(saveGame("1", migrated, 8)).rejects.toThrow("another tab");
  expect(await listLegacyBackups()).toEqual(backups);
});
it("aborts both writes if the original cannot be backed up", async () => {
  const payload = await seedLegacy("2");
  const original = IDBObjectStore.prototype.put;
  const stub = vi
    .spyOn(IDBObjectStore.prototype, "put")
    .mockImplementation(function (
      this: IDBObjectStore,
      value: unknown,
      key?: IDBValidKey,
    ) {
      if (this.name === "legacy-backups")
        throw new DOMException("Full", "QuotaExceededError");
      return original.call(this, value, key);
    });
  try {
    await expect(saveGame("2", fresh(), 7)).rejects.toThrow("Save failed");
  } finally {
    stub.mockRestore();
  }
  expect((await listSaves()).find((r) => r.slot === "2")).toMatchObject({
    revision: 7,
    payload,
  });
  expect((await listLegacyBackups()).some((r) => r.id === "2:7")).toBe(false);
});
it("rejects inconsistent quarter/open-day and old-version state in a v3 envelope", async () => {
  const envelope = JSON.parse(await encodeSave(fresh()));
  envelope.state.clock.minute = 7;
  const { checksum } = await import("../../src/persistence/saves");
  envelope.checksum = await checksum(envelope.state);
  await expect(decodeSave(JSON.stringify(envelope))).rejects.toThrow();
  envelope.state = fresh();
  envelope.state.clock.minute = 15;
  envelope.state.clock.opened = false;
  envelope.checksum = await checksum(envelope.state);
  await expect(decodeSave(JSON.stringify(envelope))).rejects.toThrow("phase");
});
