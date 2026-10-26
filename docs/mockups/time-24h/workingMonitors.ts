type Point = { x: number; y: number };
export type ScreenPlane = { x: number; y: number; scale: number };
// Inner glass coordinates in the approved desk.png, excluding bezel and head.
export const SCREEN = {
  x: 204,
  y: 85,
  width: 59,
  height: 35.5,
  skew: 0.5,
} as const;
export const screenPlane = (
  point: Point,
  scale: number,
  anchor: readonly number[],
): ScreenPlane => ({
  x: point.x + (SCREEN.x - anchor[0]) * scale,
  y: point.y + (SCREEN.y - anchor[1]) * scale,
  scale,
});
export function screenCorners(p: ScreenPlane): Point[] {
  return [
    [0, 0],
    [SCREEN.width, 0],
    [SCREEN.width, SCREEN.height],
    [0, SCREEN.height],
  ].map(([x, y]) => ({
    x: p.x + x * p.scale,
    y: p.y + (y + x * SCREEN.skew) * p.scale,
  }));
}
export function screenState(tick: number, seat: number, reduced = false) {
  const phase = reduced ? 0 : (((tick + seat * 7) % 64) + 64) % 64;
  return {
    phase,
    mode: phase < 32 ? "code" : "terminal",
    rows: 2 + Math.floor((phase % 32) / 6),
    cursor: phase % 8 < 4,
  };
}
function transform(ctx: CanvasRenderingContext2D, p: ScreenPlane) {
  ctx.transform(p.scale, p.scale * SCREEN.skew, 0, p.scale, p.x, p.y);
}
export function darkScreen(ctx: CanvasRenderingContext2D, p: ScreenPlane) {
  ctx.save();
  transform(ctx, p);
  ctx.fillStyle = "#08121c";
  ctx.fillRect(0, 0, SCREEN.width, SCREEN.height);
  ctx.restore();
}
function drawScreen(
  ctx: CanvasRenderingContext2D,
  p: ScreenPlane,
  tick: number,
  seat: number,
) {
  const f = screenState(tick, seat);
  ctx.save();
  transform(ctx, p);
  ctx.beginPath();
  ctx.rect(0, 0, SCREEN.width, SCREEN.height);
  ctx.clip();
  const glow = ctx.createLinearGradient(0, 0, 0, SCREEN.height);
  glow.addColorStop(0, "#123c54");
  glow.addColorStop(1, "#24536a");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SCREEN.width, SCREEN.height);
  ctx.fillStyle = "#8cc5cd";
  ctx.fillRect(0, 0, SCREEN.width, 3);
  ctx.font = "5px ui-monospace,monospace";
  ctx.textBaseline = "top";
  const code = [
    "fn task() {",
    "  let job = next();",
    "  if (ready) {",
    "    run(job);",
    "  }",
    "}",
  ];
  const terminal = ["> task", "  ...", "> run", "  ...", "> sync", "  ..."];
  for (let row = 0; row < f.rows; row++) {
    ctx.fillStyle =
      f.mode === "terminal"
        ? "#a6efd0"
        : ["#e1c98e", "#93d6f0", "#b9e8c2"][row % 3];
    ctx.fillText(
      (f.mode === "code" ? code : terminal)[row % 6],
      3,
      5 + row * 4.5,
      53,
    );
  }
  if (f.cursor) {
    ctx.fillStyle = "#e7f6cd";
    ctx.fillRect(3 + (f.phase % 6) * 3, 5 + Math.min(f.rows, 6) * 4.5, 3, 1.2);
  }
  ctx.restore();
}
type Surface = { seat: number; plane: ScreenPlane };
type Tile = Surface & {
  x: number;
  y: number;
  width: number;
  height: number;
  paint: HTMLCanvasElement;
  mask: HTMLCanvasElement;
};
export class MonitorLayer {
  readonly canvas = document.createElement("canvas");
  readonly ctx = this.canvas.getContext("2d")!;
  surfaces: Surface[] = [];
  private cache = new Map<number, Tile>();
  private visible: Tile[] = [];
  private dpr = 1;
  private pan = { x: 0, y: 0 };
  private zoom = 1;
  paints = 0;
  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
  begin(dpr: number, pan: Point, zoom: number) {
    this.dpr = dpr;
    this.pan = { ...pan };
    this.zoom = zoom;
    this.surfaces = [];
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.translate(pan.x, pan.y);
    this.ctx.scale(zoom, zoom);
    this.ctx.globalCompositeOperation = "destination-out";
  }
  intersects(x: number, y: number, width: number, height: number) {
    return this.surfaces.some(({ plane: p }) => {
      const q = screenCorners(p);
      return (
        x < q[1].x && x + width > q[0].x && y < q[2].y && y + height > q[0].y
      );
    });
  }
  plane(p: ScreenPlane, seat?: number) {
    this.ctx.save();
    this.ctx.globalCompositeOperation =
      seat === undefined ? "destination-out" : "source-over";
    transform(this.ctx, p);
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(0, 0, SCREEN.width, SCREEN.height);
    this.ctx.restore();
    if (seat !== undefined) this.surfaces.push({ seat, plane: p });
  }
  excludeUI(rects: { x: number; y: number; width: number; height: number }[]) {
    this.ctx.save();
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.fillStyle = "#000";
    for (const r of rects)
      this.ctx.fillRect(r.x - 3, r.y - 3, r.width + 6, r.height + 6);
    this.ctx.restore();
  }
  finish() {
    this.visible = [];
    const live = new Set<number>();
    for (const surface of this.surfaces) {
      const points = screenCorners(surface.plane).map((p) => ({
        x: (this.pan.x + p.x * this.zoom) * this.dpr,
        y: (this.pan.y + p.y * this.zoom) * this.dpr,
      }));
      const x = Math.max(
          0,
          Math.floor(Math.min(...points.map((p) => p.x))) - 1,
        ),
        y = Math.max(0, Math.floor(Math.min(...points.map((p) => p.y))) - 1);
      const width =
          Math.min(
            this.canvas.width,
            Math.ceil(Math.max(...points.map((p) => p.x))) + 1,
          ) - x,
        height =
          Math.min(
            this.canvas.height,
            Math.ceil(Math.max(...points.map((p) => p.y))) + 1,
          ) - y;
      if (width <= 0 || height <= 0) continue;
      let tile = this.cache.get(surface.seat);
      if (!tile) {
        tile = {
          ...surface,
          x,
          y,
          width,
          height,
          paint: document.createElement("canvas"),
          mask: document.createElement("canvas"),
        };
        this.cache.set(surface.seat, tile);
      }
      Object.assign(tile, surface, { x, y, width, height });
      for (const canvas of [tile.paint, tile.mask])
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      const mask = tile.mask.getContext("2d")!;
      mask.clearRect(0, 0, width, height);
      mask.drawImage(this.canvas, x, y, width, height, 0, 0, width, height);
      live.add(surface.seat);
      this.visible.push(tile);
    }
    for (const [seat, tile] of this.cache)
      if (!live.has(seat)) {
        tile.paint.width = tile.mask.width = 0;
        this.cache.delete(seat);
      }
  }
  redraw(tick: number) {
    for (const tile of this.visible) {
      const ctx = tile.paint.getContext("2d")!;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, tile.width, tile.height);
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.translate(-tile.x / this.dpr, -tile.y / this.dpr);
      ctx.translate(this.pan.x, this.pan.y);
      ctx.scale(this.zoom, this.zoom);
      drawScreen(ctx, tile.plane, tick, tile.seat);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(tile.mask, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      this.paints++;
    }
  }
  composite(ctx: CanvasRenderingContext2D) {
    for (const tile of this.visible) ctx.drawImage(tile.paint, tile.x, tile.y);
  }
  snapshot(tick: number) {
    return {
      tick,
      paints: this.paints,
      tiles: this.visible.map((t) => ({
        seat: t.seat,
        x: t.x,
        y: t.y,
        width: t.width,
        height: t.height,
        ...screenState(tick, t.seat),
      })),
    };
  }
  destroy() {
    this.canvas.width = this.canvas.height = 0;
    for (const t of this.cache.values()) {
      t.paint.width = t.mask.width = 0;
    }
    this.cache.clear();
    this.visible = [];
  }
}
