import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
describe("V4 foundation", () => {
  it("has original and separately rendered sprites", () => {
    const m = JSON.parse(readFileSync("public/assets/manifest.json", "utf8"));
    expect(m.sprites.desk.source).toContain("06_desk_only");
    expect(m.sprites.worker.source).toContain("03_developer_typing");
    for (const x of Object.values(m.sprites) as {
      anchor: number[];
      bbox: number[];
    }[]) {
      expect(x.anchor[1]).toBeGreaterThan(200);
      expect(x.bbox[2]).toBeGreaterThan(x.bbox[0]);
    }
  });
});
