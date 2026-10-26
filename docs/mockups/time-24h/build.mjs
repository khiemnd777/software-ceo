import { build } from "esbuild";
import { mkdir, writeFile } from "node:fs/promises";
await mkdir("evidence/time-24h", { recursive: true });
const result = await build({
  entryPoints: ["docs/mockups/time-24h/main.tsx"],
  outfile: "docs/mockups/time-24h/app.js",
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
  inputs.some((path) =>
    /src\/(persistence\/|simulation\/(?!types)|gameplay\/|content\/(?!catalog\.ts$)|app\/(App|store)|main\.tsx)/.test(
      path,
    ),
  )
)
  throw Error("Prototype imported game runtime, business rules or persistence");
await writeFile(
  "evidence/time-24h/bundle-inputs.json",
  JSON.stringify(inputs, null, 2) + "\n",
);
console.log(
  `Built isolated two-day prototype: ${inputs.length} inputs; no game bootstrap, transitions or storage. Static appearance catalog is used by Office.`,
);
