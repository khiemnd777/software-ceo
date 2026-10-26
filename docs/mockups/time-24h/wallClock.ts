import { clockLabel } from "./displayClock";

export const WALL_CLOCK = {
  x: 0.035,
  y: 7.35,
  z: 1.55,
  width: 164,
  height: 62,
  fontSize: 40,
  face: "#14272c",
  digits: "#fff1bd",
  basis: [0.89, -0.45, 0, 1],
} as const;
type Project = (x: number, y: number, z: number) => { x: number; y: number };

// A wall-plane object, drawn before furniture. Its only clock source is the
// simulation minute, displayed in 15-minute steps; no independent timer is used.
export function drawWallClock(
  ctx: CanvasRenderingContext2D,
  project: Project,
  minute: number,
) {
  const anchor = project(WALL_CLOCK.x, WALL_CLOCK.y, WALL_CLOCK.z);
  const { width, height } = WALL_CLOCK;
  ctx.save();
  ctx.translate(anchor.x, anchor.y);
  ctx.transform(...WALL_CLOCK.basis, 0, 0);
  ctx.fillStyle = "rgba(45,56,51,0.24)";
  ctx.beginPath();
  ctx.roundRect(-width / 2 + 3, -height / 2 + 4, width, height, 7);
  ctx.fill();
  ctx.fillStyle = "#7c8278";
  ctx.beginPath();
  ctx.roundRect(-width / 2, -height / 2, width, height, 7);
  ctx.fill();
  ctx.fillStyle = WALL_CLOCK.face;
  ctx.beginPath();
  ctx.roundRect(-width / 2 + 4, -height / 2 + 4, width - 8, height - 8, 4);
  ctx.fill();
  ctx.font = `700 ${WALL_CLOCK.fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.fillStyle = WALL_CLOCK.digits;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(clockLabel(minute), 0, 2, width - 20);
  ctx.restore();
}
