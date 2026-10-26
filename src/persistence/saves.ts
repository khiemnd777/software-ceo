import { BALANCE } from "../content/catalog";
import { newAccrual } from "../simulation/accrual";
import { LegacyStateSchema, validateState } from "./schema";
import type { State } from "../simulation/types";
export type Slot = "1" | "2" | "3" | "auto";
export interface SaveEnvelope {
  format: "software-ceo-save";
  schemaVersion: 3;
  savedAt: string;
  checksum: string;
  algorithm: "SHA-256";
  state: State;
}
export interface SavedRow {
  slot: Slot;
  revision: number;
  name: string;
  day: number;
  strategy: string;
  savedAt: string;
  payload: string;
}
export class SaveError extends Error {
  code: "corrupt" | "future" | "storage" | "conflict";
  constructor(code: SaveError["code"], message: string) {
    super(message);
    this.code = code;
  }
}
export const canonical = (value: unknown, depth = 0): string => {
  if (depth > 32)
    throw new SaveError("corrupt", "Excessively nested save data.");
  if (Array.isArray(value))
    return "[" + value.map((v) => canonical(v, depth + 1)).join(",") + "]";
  if (value !== null && typeof value === "object")
    return (
      "{" +
      Object.keys(value)
        .sort()
        .map(
          (k) =>
            JSON.stringify(k) +
            ":" +
            canonical((value as Record<string, unknown>)[k], depth + 1),
        )
        .join(",") +
      "}"
    );
  return JSON.stringify(value);
};
export async function checksum(value: unknown) {
  const bytes = new TextEncoder().encode(canonical(value));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
export async function encodeSave(state: State): Promise<string> {
  validateState(state);
  const envelope: SaveEnvelope = {
    format: "software-ceo-save",
    schemaVersion: 3,
    savedAt: new Date().toISOString(),
    checksum: await checksum(state),
    algorithm: "SHA-256",
    state,
  };
  return JSON.stringify(envelope, null, 2);
}
export async function decodeSave(raw: string): Promise<State> {
  if (new TextEncoder().encode(raw).byteLength > 10 * 1024 * 1024)
    throw new SaveError("corrupt", "Save exceeds the 10 MB limit.");
  let envelope: Record<string, unknown>;
  try {
    envelope = JSON.parse(raw);
  } catch {
    throw new SaveError(
      "corrupt",
      "Invalid JSON. The current company was not changed.",
    );
  }
  if (!envelope || envelope.format !== "software-ceo-save")
    throw new SaveError("corrupt", "Not a Software CEO save.");
  if (typeof envelope.schemaVersion !== "number" || envelope.schemaVersion > 3)
    throw new SaveError("future", "This save requires a newer game version.");
  if (
    envelope.algorithm !== "SHA-256" ||
    typeof envelope.checksum !== "string" ||
    (await checksum(envelope.state)) !== envelope.checksum
  )
    throw new SaveError(
      "corrupt",
      "Checksum mismatch. Keep your original file for recovery.",
    );
  let state = envelope.state;
  if (envelope.schemaVersion === 1) {
    if (!state || typeof state !== "object")
      throw new SaveError("corrupt", "Invalid legacy state.");
    const legacy = state as Record<string, unknown>;
    if (legacy.version !== 1)
      throw new SaveError("corrupt", "Legacy schema mismatch.");
    state = {
      ...legacy,
      work: Array.isArray(legacy.work)
        ? legacy.work.map((w) => ({ ...w, effort: w.effort ?? w.done }))
        : legacy.work,
      version: 2,
      balanceVersion: legacy.balanceVersion ?? BALANCE.version,
      tutorial: legacy.tutorial ?? { seen: [], completed: false },
    };
  } else if (envelope.schemaVersion !== 2 && envelope.schemaVersion !== 3)
    throw new SaveError("future", "Unsupported save version.");
  try {
    if (envelope.schemaVersion !== 3) {
      const old = LegacyStateSchema.parse(state);
      const accrual = newAccrual();
      accrual.legacyThroughDay =
        old.day % 30 === 0 ? null : Math.ceil(old.day / 30) * 30;
      state = {
        ...old,
        version: 3,
        balanceVersion: BALANCE.version,
        day: old.day + 1,
        clock: { minute: 0, opened: false, lastClosedDay: old.day },
        accrual,
        workDay: { day: old.day + 1, budgets: {} },
        discovery: {},
        scene: { officeLightsOn: true },
      };
    }
    return validateState(state);
  } catch (e) {
    throw new SaveError(
      "corrupt",
      e instanceof Error ? e.message : "Invalid state.",
    );
  }
}
let dbPromise: Promise<IDBDatabase> | null = null;
function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(
        new SaveError(
          "storage",
          "IndexedDB is unavailable. Export a JSON backup.",
        ),
      );
      return;
    }
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open("software-ceo", 3);
    } catch {
      reject(new SaveError("storage", "Browser storage access was denied."));
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("legacy-backups"))
        db.createObjectStore("legacy-backups", { keyPath: "id" });
      if (!db.objectStoreNames.contains("saves"))
        db.createObjectStore("saves", { keyPath: "slot" });
    };
    req.onblocked = () =>
      reject(
        new SaveError(
          "storage",
          "Another tab blocks the database upgrade. Close that tab and retry.",
        ),
      );
    req.onerror = () =>
      reject(
        new SaveError("storage", req.error?.message ?? "Storage unavailable."),
      );
    req.onsuccess = () => {
      req.result.onversionchange = () => {
        req.result.close();
        dbPromise = null;
      };
      resolve(req.result);
    };
  });
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}
export async function listSaves(): Promise<SavedRow[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db
      .transaction("saves", "readonly")
      .objectStore("saves")
      .getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new SaveError("storage", "Cannot read saves."));
  });
}
export async function loadSave(slot: Slot): Promise<State> {
  const rows = await listSaves();
  const row = rows.find((r) => r.slot === slot);
  if (!row) throw new SaveError("storage", "This save slot is empty.");
  return decodeSave(row.payload);
}
export async function saveGame(
  slot: Slot,
  state: State,
  expectedRevision: number | null,
): Promise<SavedRow> {
  const payload = await encodeSave(state);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    let conflict = false;
    let result: SavedRow;
    const tx = db.transaction(["saves", "legacy-backups"], "readwrite"),
      store = tx.objectStore("saves");
    const get = store.get(slot);
    get.onsuccess = () => {
      const current = get.result as SavedRow | undefined;
      if ((current?.revision ?? null) !== expectedRevision) {
        conflict = true;
        tx.abort();
        return;
      }
      if (current) {
        let legacy = true;
        try {
          legacy = JSON.parse(current.payload).schemaVersion !== 3;
        } catch {
          /* Retain corrupt original bytes before a deliberate repair overwrite. */
        }
        if (legacy) {
          try {
            tx.objectStore("legacy-backups").put({
              ...current,
              id: `${slot}:${current.revision}`,
            });
          } catch {
            tx.abort();
            return;
          }
        }
      }
      result = {
        slot,
        revision: (current?.revision ?? 0) + 1,
        name: state.name,
        day: state.day,
        strategy: state.strategy,
        savedAt: new Date().toISOString(),
        payload,
      };
      store.put(result);
    };
    tx.oncomplete = () => {
      if (typeof BroadcastChannel !== "undefined") {
        const ch = new BroadcastChannel("software-ceo-saves");
        ch.postMessage({ slot, revision: result.revision });
        ch.close();
      }
      resolve(result);
    };
    tx.onabort = () =>
      reject(
        new SaveError(
          conflict ? "conflict" : "storage",
          conflict
            ? "This slot changed in another tab. Refresh the save list before overwriting."
            : "Save failed. Storage may be full or denied. Export a JSON backup.",
        ),
      );
    tx.onerror = () => {
      /* abort handler owns rejection */
    };
  });
}
export async function resetConnection() {
  if (dbPromise) {
    (await dbPromise).close();
    dbPromise = null;
  }
}

export interface LegacyBackup extends SavedRow {
  id: string;
}
export async function listLegacyBackups(): Promise<LegacyBackup[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db
      .transaction("legacy-backups", "readonly")
      .objectStore("legacy-backups")
      .getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () =>
      reject(new SaveError("storage", "Cannot read legacy backups."));
  });
}
