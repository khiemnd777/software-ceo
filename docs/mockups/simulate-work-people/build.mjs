import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";
const dir = path.dirname(fileURLToPath(import.meta.url));
await build({
  entryPoints: [path.join(dir, "main.tsx")],
  outfile: path.join(dir, "app.js"),
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
}).then(async (result) => {
  // Keep a reviewable input inventory; this entry must not include persistence or the game bootstrap.
  const { writeFile } = await import("node:fs/promises");
  const inputs = Object.keys(result.metafile.inputs);
  if (
    inputs.some((p) =>
      /src\/(persistence\/|app\/App|app\/store|main\.tsx)/.test(p),
    )
  )
    throw Error("Game bootstrap/storage imported by mockup");
  await writeFile(
    path.resolve(
      dir,
      "../../../evidence/simulate-work-people-mockup/bundle-inputs.json",
    ),
    JSON.stringify(inputs, null, 2) + "\n",
  );
  console.log(
    "Mockup built independently; no game bootstrap or storage imports.",
  );
});
