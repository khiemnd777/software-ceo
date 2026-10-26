import { WALL_CLOCK } from "./wallClock";

type Point = { x: number; y: number };
type Project = (x: number, y: number, z: number) => Point;
type Camera = Point & { zoom: number; width: number; height: number };

export const WALL_SWITCH = {
  x: 0.035,
  y: 8.75,
  z: 1.55,
  width: 24,
  height: 32,
  basis: [0.89, -0.45, 0, 1],
} as const;

export const officeShade = (lightsOn: boolean, night: number) =>
  lightsOn ? 0 : 0.18 + 0.58 * Math.max(0, Math.min(1, night));

export function switchBounds(camera: Camera, project: Project) {
  const anchor = project(WALL_SWITCH.x, WALL_SWITCH.y, WALL_SWITCH.z);
  const [a, b, c, d] = WALL_SWITCH.basis;
  const width = Math.max(
    44,
    (Math.abs(a) * WALL_SWITCH.width + Math.abs(c) * WALL_SWITCH.height) *
      camera.zoom +
      8,
  );
  const height = Math.max(
    44,
    (Math.abs(b) * WALL_SWITCH.width + Math.abs(d) * WALL_SWITCH.height) *
      camera.zoom +
      8,
  );
  const centerX = camera.x + anchor.x * camera.zoom;
  const centerY = camera.y + anchor.y * camera.zoom;
  let x = centerX - width / 2;
  const y = camera.y + anchor.y * camera.zoom - height / 2;
  // Expand the target toward the empty wall/sky, never across the clock.
  const clock = project(WALL_CLOCK.x, WALL_CLOCK.y, WALL_CLOCK.z);
  const clockLeft =
    camera.x +
    clock.x * camera.zoom -
    (Math.abs(WALL_CLOCK.basis[0]) * WALL_CLOCK.width * camera.zoom) / 2;
  const clockHalfHeight =
    ((WALL_CLOCK.height + Math.abs(WALL_CLOCK.basis[1]) * WALL_CLOCK.width) *
      camera.zoom) /
    2;
  const clockY = camera.y + clock.y * camera.zoom;
  if (y < clockY + clockHalfHeight && y + height > clockY - clockHalfHeight)
    x = Math.min(x, clockLeft - 1 - width);
  const faceWidth =
    (Math.abs(a) * WALL_SWITCH.width + Math.abs(c) * WALL_SWITCH.height) *
    camera.zoom;
  const faceHeight =
    (Math.abs(b) * WALL_SWITCH.width + Math.abs(d) * WALL_SWITCH.height) *
    camera.zoom;
  return {
    face: {
      x: centerX - faceWidth / 2 - x,
      y: centerY - faceHeight / 2 - y,
      width: faceWidth,
      height: faceHeight,
    },
    x,
    y,
    width,
    height,
    visible:
      x >= 0 &&
      y >= 0 &&
      x + width <= camera.width &&
      y + height <= camera.height,
  };
}

export function drawWallSwitch(
  ctx: CanvasRenderingContext2D,
  project: Project,
  on: boolean,
) {
  const p = project(WALL_SWITCH.x, WALL_SWITCH.y, WALL_SWITCH.z);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.transform(...WALL_SWITCH.basis, 0, 0);
  ctx.scale(WALL_SWITCH.width / 36, WALL_SWITCH.height / 48);
  ctx.fillStyle = "rgba(20,35,30,.25)";
  ctx.beginPath();
  ctx.roundRect(-16, -22, 36, 48, 4);
  ctx.fill();
  ctx.fillStyle = "#dce1d5";
  ctx.strokeStyle = "#68786c";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-18, -24, 36, 48, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = on ? "#779b75" : "#a3aaa2";
  ctx.beginPath();
  ctx.roundRect(-10, -16, 20, 32, 2);
  ctx.fill();
  ctx.fillStyle = on ? "#d2e0bf" : "#d5d9ce";
  ctx.fillRect(-9, on ? -15 : 9, 18, 5);
  ctx.font = "700 17px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#223b32";
  ctx.fillText(on ? "I" : "O", 0, on ? 1 : -2);
  ctx.fillStyle = on ? "#d6efaa" : "#66776e";
  ctx.beginPath();
  ctx.arc(0, 20, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
