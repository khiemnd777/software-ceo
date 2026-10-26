import { weatherFrame, type Weather } from "./outdoorWeather";

type Point = { x: number; y: number };
type Room = { x: number; y: number };
type Project = (x: number, y: number, z: number) => Point;
type Celestial = Pick<ReturnType<typeof weatherFrame>, "sun" | "moon">;
export const GLASS = { bottom: 0.83, top: 1.72, floor: 0.13 } as const;
export const officeWindows = (width: number) =>
  Array.from({ length: Math.max(0, Math.ceil((width - 2) / 2.7)) }, (_, i) => {
    const x = 1 + i * 2.7;
    return { x, width: Math.min(1.9, width - 0.1 - x) };
  });

export function windowLightFrame(
  minute: number,
  weather: Weather,
  celestial: Celestial = weatherFrame(minute, weather, 0),
) {
  return {
    minute,
    weather,
    sources: (["sun", "moon"] as const).flatMap((kind) => {
      const body = celestial[kind];
      if (!body.visible || body.alpha <= 0) return [];
      const progress = Math.max(0, Math.min(1, (body.x - 0.04) / 0.92));
      const high = Math.sin(progress * Math.PI);
      return [
        {
          kind,
          progress,
          // Stylized altitude/azimuth derived from the same visible sky arc.
          slope: kind === "sun" ? 0.26 + 1.15 * high : 0.2 + 0.68 * high,
          drift: (progress - 0.5) * 1.3,
          alpha: body.alpha * (kind === "sun" ? 0.4 : 0.22),
          color:
            kind === "moon"
              ? "146,188,255"
              : `255,${Math.round(201 + 32 * high)},${Math.round(114 + 52 * high)}`,
        },
      ];
    }),
  };
}
type Source = ReturnType<typeof windowLightFrame>["sources"][number];
export function projectGlass(x: number, z: number, light: Source): Point {
  const depth = (z - GLASS.floor) / light.slope;
  return { x: x + light.drift * depth, y: 0.02 + depth };
}
function clipFloor(points: Point[], room: Room) {
  let polygon = points;
  for (const [axis, limit, direction] of [
    ["x", 0.015, 1],
    ["x", room.x - 0.015, -1],
    ["y", 0.015, 1],
    ["y", room.y - 0.015, -1],
  ] as const) {
    const input = polygon;
    polygon = [];
    input.forEach((b, i) => {
      const a = input[(i + input.length - 1) % input.length];
      const aInside = (a[axis] - limit) * direction >= 0;
      const bInside = (b[axis] - limit) * direction >= 0;
      if (aInside !== bInside) {
        const t = (limit - a[axis]) / (b[axis] - a[axis]);
        polygon.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      }
      if (bInside) polygon.push(b);
    });
  }
  return polygon;
}
export function windowPatches(light: Source, room: Room) {
  return officeWindows(room.x).flatMap((window, index) =>
    [
      [window.x + 0.08, window.x + 1],
      [window.x + 1.04, window.x + window.width - 0.08],
    ]
      .filter(([left, right]) => right > left)
      .map(([left, right], pane) => ({
        window: index,
        pane,
        points: clipFloor(
          [
            projectGlass(left, GLASS.bottom, light),
            projectGlass(right, GLASS.bottom, light),
            projectGlass(right, GLASS.top, light),
            projectGlass(left, GLASS.top, light),
          ],
          room,
        ),
        near: projectGlass((left + right) / 2, GLASS.bottom, light),
        far: projectGlass((left + right) / 2, GLASS.top, light),
      }))
      .filter((p) => p.points.length >= 3),
  );
}
export function drawWindowLight(
  ctx: CanvasRenderingContext2D,
  frame: ReturnType<typeof windowLightFrame>,
  room: Room,
  project: Project,
  reduced: boolean,
) {
  ctx.save();
  const floor = [
    project(0, 0, GLASS.floor),
    project(room.x, 0, GLASS.floor),
    project(room.x, room.y, GLASS.floor),
    project(0, room.y, GLASS.floor),
  ];
  ctx.beginPath();
  floor.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
  ctx.clip();
  const patches = [];
  for (const source of frame.sources) {
    for (const patch of windowPatches(source, room)) {
      const points = patch.points.map((p) => project(p.x, p.y, GLASS.floor));
      const near = project(patch.near.x, patch.near.y, GLASS.floor);
      const far = project(patch.far.x, patch.far.y, GLASS.floor);
      const gradient = ctx.createLinearGradient(near.x, near.y, far.x, far.y);
      for (const [stop, strength] of [
        [0, 0.3],
        [0.16, 1],
        [0.8, 0.85],
        [1, 0.25],
      ])
        gradient.addColorStop(
          stop,
          `rgba(${source.color},${source.alpha * strength})`,
        );
      ctx.beginPath();
      points.forEach((p, i) =>
        i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
      );
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      if (!reduced) {
        ctx.lineWidth = source.kind === "sun" ? 1.5 : 3;
        ctx.strokeStyle = `rgba(${source.color},${source.alpha * 0.08})`;
        ctx.stroke();
      }
      patches.push({
        kind: source.kind,
        window: patch.window,
        pane: patch.pane,
        points: patch.points,
      });
    }
  }
  ctx.restore();
  return patches;
}
