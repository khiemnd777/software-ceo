import { lighting } from "./dayLighting";

type RGB = readonly [number, number, number];
type Point = { x: number; y: number };
export const LAMP_COLOR = "#fff1bd";
const mix = (a: RGB, b: RGB, t: number): RGB =>
  [0, 1, 2].map((index) =>
    Math.round(a[index] + (b[index] - a[index]) * t),
  ) as [number, number, number];
const color = (rgb: RGB) => `rgb(${rgb.join(",")})`;
export function scenePalette(minute: number, reduced = false) {
  const time = lighting(reduced ? 720 : minute);
  const night = Math.max(0, Math.min(1, time.dark / 0.32));
  const warm = Math.min(1, time.warm / 0.2);
  const sky = mix(
    mix([183, 216, 231], [19, 34, 57], night),
    [222, 164, 130],
    warm * 0.65,
  );
  const horizon = mix(
    mix([230, 237, 224], [40, 57, 76], night),
    [245, 192, 144],
    warm * 0.65,
  );
  return {
    night,
    sky: color(sky),
    horizon: color(horizon),
    windowSky: color(sky),
    windowHorizon: color(horizon),
    shadow: color(mix([175, 187, 175], [8, 15, 25], night)),
    lamp: LAMP_COLOR,
    daylightAlpha: (1 - night) * 0.045,
    daylightColor: warm > 0.2 ? "255,196,121" : "211,237,255",
  };
}
export type ScenePalette = ReturnType<typeof scenePalette>;

// Clip in world geometry, then map a unit rectangle onto the window plane.
// No screen-space tint or overlay can drift away when panning/zooming.
export function drawWindowView(
  ctx: CanvasRenderingContext2D,
  corners: Point[],
  palette: ScenePalette,
  through = false,
) {
  const [bottomLeft, , topRight, topLeft] = corners;
  ctx.save();
  ctx.transform(
    topRight.x - topLeft.x,
    topRight.y - topLeft.y,
    bottomLeft.x - topLeft.x,
    bottomLeft.y - topLeft.y,
    topLeft.x,
    topLeft.y,
  );
  ctx.beginPath();
  ctx.rect(0, 0, 1, 1);
  ctx.clip();
  if (through) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 1, 1);
    ctx.globalCompositeOperation = "source-over";
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, 1);
    sky.addColorStop(0, palette.windowSky);
    sky.addColorStop(1, palette.windowHorizon);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1, 1);
  }
  ctx.fillStyle = "rgba(99,132,145,0.2)";
  ctx.fillRect(0, 0.87, 1, 0.13);
  ctx.fillStyle = "rgba(255,255,255,0.09)";
  ctx.beginPath();
  ctx.moveTo(0.08, 0);
  ctx.lineTo(0.18, 0);
  ctx.lineTo(0.42, 1);
  ctx.lineTo(0.32, 1);
  ctx.fill();
  ctx.restore();
}

export function drawWallLamp(
  ctx: CanvasRenderingContext2D,
  corners: Point[],
  palette: ScenePalette,
  lightsOn = true,
) {
  ctx.save();
  const center = {
    x: (corners[0].x + corners[2].x) / 2,
    y: (corners[0].y + corners[2].y) / 2,
  };
  if (lightsOn) {
    const glow = ctx.createRadialGradient(
      center.x,
      center.y,
      1,
      center.x,
      center.y,
      23,
    );
    glow.addColorStop(0, "rgba(255,218,146,0.35)");
    glow.addColorStop(1, "rgba(255,218,146,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(center.x - 24, center.y - 24, 48, 48);
  }
  ctx.beginPath();
  corners.forEach((p, index) =>
    index ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
  );
  ctx.closePath();
  ctx.fillStyle = lightsOn ? palette.lamp : "#7b8984";
  ctx.fill();
  ctx.strokeStyle = "#9b967f";
  ctx.lineWidth = 0.65;
  ctx.stroke();
  ctx.restore();
}
