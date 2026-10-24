import {
  mkdtempSync,
  copyFileSync,
  cpSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
const root = resolve("."),
  work = mkdtempSync(join(tmpdir(), "software-ceo-repro-"));
for (const name of [
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.ts",
  "index.html",
])
  copyFileSync(join(root, name), join(work, name));
for (const name of ["src", "public"])
  cpSync(join(root, name), join(work, name), { recursive: true });
const steps = [];
for (const args of [
  ["ci", "--no-audit", "--no-fund"],
  ["run", "build"],
]) {
  const result = spawnSync("npm", args, {
    cwd: work,
    encoding: "utf8",
    env: process.env,
  });
  steps.push({
    command: "npm " + args.join(" "),
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  });
  if (result.status !== 0) {
    writeFileSync(
      "evidence/reproducible-build.json",
      JSON.stringify({ result: "FAIL", steps }, null, 2),
    );
    throw Error("Clean build failed");
  }
}
function manifest(base, prefix = "") {
  return readdirSync(join(base, prefix))
    .flatMap((name) => {
      const rel = join(prefix, name),
        path = join(base, rel);
      return statSync(path).isDirectory()
        ? manifest(base, rel)
        : [
            {
              file: rel,
              bytes: statSync(path).size,
              sha256: createHash("sha256")
                .update(readFileSync(path))
                .digest("hex"),
            },
          ];
    })
    .sort((a, b) => a.file.localeCompare(b.file));
}
const expected = manifest(join(root, "dist")),
  actual = manifest(join(work, "dist"));
const equal = JSON.stringify(expected) === JSON.stringify(actual);
writeFileSync(
  "evidence/reproducible-build.json",
  JSON.stringify(
    {
      result: equal ? "PASS" : "FAIL",
      method:
        "Fresh temporary directory, package-lock npm ci, source/public copied without node_modules or build caches, npm run build. Byte-for-byte SHA256 comparison of every dist file including source maps.",
      node: process.version,
      files: actual.length,
      equal,
      steps,
      manifest: actual,
    },
    null,
    2,
  ),
);
console.log({ result: equal ? "PASS" : "FAIL", files: actual.length, work });
if (!equal) process.exitCode = 1;
