import { scenePalette } from "./sceneLighting";

export const WEATHER = {
  sunny: { label: "Nắng", cloud: 3, rain: 0, wind: 0.2, cover: 0 },
  cloudy: { label: "Nhiều mây", cloud: 8, rain: 0, wind: 0.3, cover: 0.65 },
  rain: { label: "Mưa", cloud: 9, rain: 64, wind: 0.35, cover: 0.8 },
  wind: { label: "Gió", cloud: 5, rain: 0, wind: 1, cover: 0.2 },
  "rain-wind": { label: "Mưa gió", cloud: 10, rain: 80, wind: 1.4, cover: 0.9 },
} as const;
export type Weather = keyof typeof WEATHER;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const fract = (n: number) => n - Math.floor(n);
const noise = (index: number, salt: number) => {
  let n = Math.imul(index + 1, 374761393) ^ Math.imul(salt, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};
export function weatherFrame(
  minute: number,
  weather: Weather,
  seconds: number,
  reduced = false,
) {
  const spec = WEATHER[weather];
  const hour = (((minute % 1440) + 1440) % 1440) / 60;
  const phase = reduced ? 0 : seconds;
  const sunT = clamp((hour - 5) / 14);
  const moonT = clamp(((hour + 7) % 24) / 14);
  const sunAlpha = smooth((hour - 5) / 1.5) * smooth((19 - hour) / 1.5);
  const moonAlpha =
    hour >= 17 ? smooth((hour - 17) / 2) : smooth((7 - hour) / 2);
  const night = scenePalette(minute).night;
  return {
    weather,
    label: spec.label,
    hour,
    phase,
    cover: spec.cover,
    wind: spec.wind,
    sun: {
      visible: sunAlpha > 0,
      x: 0.04 + 0.92 * sunT,
      y: 0.35 - Math.sin(sunT * Math.PI) * 0.29,
      alpha: (1 - spec.cover * 0.7) * sunAlpha,
    },
    moon: {
      visible: moonAlpha > 0,
      x: 0.04 + 0.92 * moonT,
      y: 0.33 - Math.sin(moonT * Math.PI) * 0.27,
      alpha: (1 - spec.cover * 0.8) * moonAlpha,
    },
    stars: Array.from({ length: 52 }, (_, i) => ({
      x: noise(i, 4),
      y: 0.025 + noise(i, 9) * 0.43,
      size: 0.5 + noise(i, 3) * 1.2,
      alpha:
        (0.4 + noise(i, 7) * 0.6) * (1 - spec.cover * 0.85) * night * night,
    })),
    clouds: Array.from({ length: spec.cloud }, (_, i) => ({
      x:
        fract(
          noise(i, 12) +
            (phase * (0.006 + spec.wind * 0.014)) / (1.4 + (i % 3)),
        ) *
          1.8 -
        0.4,
      y: 0.08 + noise(i, 13) * 0.23,
      scale: 0.5 + noise(i, 17) * 0.8,
    })),
    rain: Array.from({ length: spec.rain }, (_, i) => {
      const y = fract(noise(i, 41) + phase * (0.8 + noise(i, 42) * 0.3));
      return {
        x: fract(noise(i, 43) + y * spec.wind * 0.16),
        y,
        slant: spec.wind * 0.024,
        length: 0.025 + noise(i, 44) * 0.025,
      };
    }),
  };
}
type SkyContext = CanvasRenderingContext2D;
function polygon(ctx: SkyContext, points: number[][], fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
}
const blend = (day: string, night: string, amount: number) => {
  const channels = (hex: string) =>
    [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const a = channels(day),
    b = channels(night);
  return `rgb(${a.map((n, i) => Math.round(n + (b[i] - n) * amount)).join(",")})`;
};
export function drawOutdoorSky(
  ctx: SkyContext,
  width: number,
  height: number,
  minute: number,
  weather: Weather,
  seconds: number,
  reduced: boolean,
) {
  const f = weatherFrame(minute, weather, seconds, reduced);
  const palette = scenePalette(minute);
  const night = palette.night;
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, palette.sky);
  sky.addColorStop(0.65, palette.horizon);
  sky.addColorStop(1, palette.horizon);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = `rgba(70,91,110,${f.cover * 0.45})`;
  ctx.fillRect(0, 0, width, height);
  for (const star of f.stars) {
    ctx.fillStyle = `rgba(246,244,220,${star.alpha})`;
    ctx.beginPath();
    ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  if (f.sun.visible && f.sun.alpha > 0) {
    const x = f.sun.x * width,
      y = f.sun.y * height,
      r = Math.max(12, height * 0.045);
    ctx.save();
    ctx.globalAlpha = f.sun.alpha;
    const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 2.5);
    glow.addColorStop(0, "rgba(255,222,130,.65)");
    glow.addColorStop(1, "rgba(255,222,130,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    ctx.fillStyle = "#ffe6a2";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffe6a2";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35);
      ctx.lineTo(x + Math.cos(a) * r * 1.65, y + Math.sin(a) * r * 1.65);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (f.moon.visible) {
    const x = f.moon.x * width,
      y = f.moon.y * height,
      r = Math.max(13, height * 0.042);
    ctx.save();
    ctx.globalAlpha = f.moon.alpha;
    ctx.fillStyle = "#f4ecc9";
    ctx.beginPath();
    ctx.arc(x, y, r, -Math.PI * 0.43, Math.PI * 0.43, true);
    ctx.quadraticCurveTo(
      x - r * 0.2,
      y,
      x + Math.cos(Math.PI * 0.43) * r,
      y - Math.sin(Math.PI * 0.43) * r,
    );
    ctx.fill();
    ctx.restore();
  }
  for (const cloud of f.clouds) {
    const x = cloud.x * width,
      y = cloud.y * height,
      s = Math.min(90, width * 0.13) * cloud.scale;
    polygon(
      ctx,
      [
        [-1, 0.18],
        [-0.8, -0.08],
        [-0.5, -0.08],
        [-0.3, -0.45],
        [0.12, -0.55],
        [0.45, -0.3],
        [0.7, -0.28],
        [1, 0.16],
        [0.8, 0.35],
        [-0.7, 0.35],
      ].map(([a, b]) => [x + a * s, y + b * s]),
      blend(f.cover > 0.6 ? "#9caeb7" : "#eef4ef", "#435566", night),
    );
    polygon(
      ctx,
      [
        [-0.75, 0.35],
        [0.8, 0.35],
        [1, 0.16],
        [0.15, 0.14],
        [-0.2, 0.28],
      ].map(([a, b]) => [x + a * s, y + b * s]),
      blend("#c3d2d2", "#344755", night),
    );
  }
  if (f.cover > 0.5) {
    ctx.fillStyle = `rgba(155,175,184,${0.12 - night * 0.03})`;
    ctx.fillRect(0, height * 0.4, width, height * 0.6);
  }
  ctx.strokeStyle = `rgba(210,231,244,${0.7 - night * 0.22})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const drop of f.rain) {
    const x = drop.x * width,
      y = drop.y * height;
    ctx.moveTo(x, y);
    ctx.lineTo(x + drop.slant * width, y + drop.length * height);
  }
  ctx.stroke();
  return {
    minute,
    phase: f.phase,
    sun: f.sun,
    moon: f.moon,
    starAlpha: f.stars[0].alpha,
    palette,
  };
}
