import { build } from "esbuild";
import { writeFile } from "node:fs/promises";
const result = await build({
  entryPoints: ["docs/mockups/compact-hud/main.tsx"],
  outfile: "docs/mockups/compact-hud/app.js",
  bundle: true,
  format: "esm",
  jsx: "automatic",
  target: "es2022",
  minify: true,
  define: {
    "process.env.NODE_ENV": '"production"',
    "import.meta.env.BASE_URL": '"/"',
  },
  metafile: true,
});
const inputs = Object.keys(result.metafile.inputs);
if (
  inputs.some((p) =>
    /src\/(persistence\/|app\/App|app\/store|main\.tsx)/.test(p),
  )
)
  throw Error("Mockup imported game bootstrap/storage");
await writeFile(
  "evidence/compact-hud/bundle-inputs.json",
  JSON.stringify(inputs, null, 2) + "\n",
);
console.log(
  `Mockup built: ${inputs.length} inputs; no game bootstrap/storage.`,
);
