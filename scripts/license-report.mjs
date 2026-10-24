import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const components = [],
  notices = [];
for (const [path, info] of Object.entries(lock.packages)) {
  if (!path) continue;
  const manifest = join(path, "package.json");
  const pkg = existsSync(manifest)
    ? JSON.parse(readFileSync(manifest, "utf8"))
    : {};
  const name = pkg.name ?? path.split("node_modules/").at(-1);
  const license = pkg.license ?? info.license ?? "NOASSERTION";
  const files = existsSync(path)
    ? readdirSync(path).filter((f) =>
        /^(licen[cs]e|copying|notice)(\.|$)/i.test(f),
      )
    : [];
  const texts = [];
  for (const file of files) {
    try {
      const content = readFileSync(join(path, file), "utf8");
      texts.push(file);
      notices.push(
        `\n${"=".repeat(72)}\n${name}@${info.version}\nSource: ${path}/${file}\nDeclared license: ${typeof license === "string" ? license : JSON.stringify(license)}\n${"=".repeat(72)}\n${content}\n`,
      );
    } catch {}
  }
  components.push({
    name,
    version: info.version,
    packagePath: path,
    license,
    dev: !!info.dev,
    optional: !!info.optional,
    installed: existsSync(manifest),
    integrity: info.integrity ?? null,
    resolved: info.resolved ?? null,
    noticeFiles: texts,
  });
}
components.sort(
  (a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version),
);
writeFileSync(
  "evidence/dependency-inventory.json",
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      scope:
        "Lockfile packages, installed manifest declarations and verbatim available upstream notice files. This inventory is not a legal determination.",
      lockSHA256: createHash("sha256")
        .update(readFileSync("package-lock.json"))
        .digest("hex"),
      components,
    },
    null,
    2,
  ),
);
writeFileSync(
  "docs/THIRD_PARTY_NOTICES.txt",
  "SOFTWARE CEO — THIRD-PARTY NOTICES\nGenerated from installed package files. Original text preserved.\n" +
    notices.join("\n"),
);
const runtime = components.filter((c) => !c.dev && !c.optional);
writeFileSync(
  "docs/LICENSES.md",
  `# Origin and third-party inventory\n\nThis delivery preserves the user-supplied GDD and V4 source. Local use and expansion of V4 are authorized by the owner decision in ART_BASELINE_APPROVAL.md. The old UNAPPROVED label remains historical provenance. No project-wide open-source license or broader third-party redistribution rights are invented by this delivery; the owner has not supplied a separate publication license.\n\n## Runtime dependencies\n\n| Package | Version | Declared license |\n|---|---|---|\n${runtime.map((p) => `| ${p.name} | ${p.version} | ${typeof p.license === "string" ? p.license : JSON.stringify(p.license)} |`).join("\n")}\n\n## Complete inventory\n\nThe package-lock contains ${components.length} dependency entries; ${components.filter((c) => c.installed).length} are installed on this Linux host, including development tools. See ../evidence/dependency-inventory.json for versions, integrity, origin URLs and optional-platform status. THIRD_PARTY_NOTICES.txt contains available upstream license/notice files verbatim. Optional binaries for other platforms are listed by lockfile but their notices were not extracted from packages absent on this host.\n\n## Project assets\n\n- V4 geometry, original renders, sprites and authoring scripts: supplied in the Software CEO kit, retained under art-source/v4. Original source integrity was checked before edits; evidence/kit-integrity.json has 40 passing records.\n- New poses, five role palettes, furniture and Canvas atlases: generated locally from the approved geometry plus original project geometry, with source scripts and review renders included. No external asset marketplace or image generation service was used for these assets.\n- Music Studio Hours and five sound cues: original procedural compositions from scripts/build-audio.py; source WAV and shipped MP3/Ogg files retained.\n- UI icons: small project-authored inline SVG paths. Fonts: system font stack, no redistributed webfont.\n\n## Offline authoring tools\n\nVTK 9.5.2, trimesh 4.11.0, networkx 3.5, numpy, scipy and Pillow were used offline for geometry/rendering; FFmpeg encoded audio. These tools are not included in the web runtime. Install them separately if rebuilding art. The generated artifact does not embed their Python binaries.\n\n## Security snapshot\n\nThe actual npm audit JSON is in ../evidence/npm-audit.json. A zero-advisory snapshot does not establish absence of all defects. No telemetry, external API, login, payment service or backend is part of the production bundle.\n`,
);
console.log({
  packages: components.length,
  installed: components.filter((c) => c.installed).length,
  runtime: runtime.map((x) => x.name),
  notices: notices.length,
});
