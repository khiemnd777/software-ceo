import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export function buildDigest(root = "dist") {
  const walk = (dir, prefix = "") =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const relative = prefix + entry.name;
      return entry.isDirectory()
        ? walk(join(dir, entry.name), relative + "/")
        : [
            {
              file: relative,
              sha256: createHash("sha256")
                .update(readFileSync(join(dir, entry.name)))
                .digest("hex"),
            },
          ];
    });
  const manifest = walk(root).sort((a, b) => a.file.localeCompare(b.file));
  return {
    sha256: createHash("sha256").update(JSON.stringify(manifest)).digest("hex"),
    manifest,
  };
}

export function soakFailures({
  minutes,
  samples,
  elapsedMs,
  initialDigest,
  finalDigest,
  errors,
}) {
  const failures = [...errors];
  if (
    !Number.isInteger(minutes) ||
    minutes < 30 ||
    samples.length !== minutes ||
    elapsedMs < minutes * 60000
  )
    failures.push("Full 30+ minute wall-clock run not completed");
  if (initialDigest !== finalDigest)
    failures.push("Build changed during measurement");
  if (
    samples.some(
      (s, i) =>
        s.minute !== i + 1 ||
        !Number.isFinite(s.heapBytes) ||
        s.heapBytes <= 0 ||
        !Number.isFinite(s.nodes) ||
        !Number.isFinite(s.listeners) ||
        s.elapsedMs < (i + 1) * 60000,
    )
  )
    failures.push("Invalid or incomplete metrics");
  return failures;
}
