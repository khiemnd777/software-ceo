import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildDigest, soakFailures } from "./soak-evidence.mjs";
const complete = () => ({
  minutes: 30,
  elapsedMs: 1800000,
  initialDigest: "frozen",
  finalDigest: "frozen",
  errors: [],
  samples: Array.from({ length: 30 }, (_, i) => ({
    minute: i + 1,
    elapsedMs: (i + 1) * 60000,
    heapBytes: 6000000,
    nodes: 300,
    listeners: 240,
  })),
});
test("requires real duration and all samples, not a short/interrupted run", () => {
  assert.deepEqual(soakFailures(complete()), []);
  assert.ok(
    soakFailures({ ...complete(), samples: complete().samples.slice(0, 24) })
      .length,
  );
  assert.ok(soakFailures({ ...complete(), minutes: 1 }).length);
  assert.ok(soakFailures({ ...complete(), elapsedMs: 1799999 }).length);
  const early = complete();
  early.samples[29].elapsedMs = 1;
  assert.ok(soakFailures(early).length);
});
test("cannot pass a changed build, runtime error or missing metric", () => {
  assert.ok(soakFailures({ ...complete(), finalDigest: "changed" }).length);
  assert.ok(soakFailures({ ...complete(), errors: ["uncaught error"] }).length);
  const invalid = complete();
  invalid.samples[4].heapBytes = NaN;
  assert.ok(soakFailures(invalid).length);
});
test("asset change affects build identity even with identical index.html", () => {
  const root = mkdtempSync(join(tmpdir(), "ceo-digest-"));
  try {
    writeFileSync(join(root, "index.html"), "same");
    writeFileSync(join(root, "atlas.webp"), "v4");
    const before = buildDigest(root);
    writeFileSync(join(root, "atlas.webp"), "changed");
    assert.notEqual(buildDigest(root).sha256, before.sha256);
  } finally {
    rmSync(root, { recursive: true });
  }
});
