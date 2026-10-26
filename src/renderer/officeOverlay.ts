import type { OfficePerson } from "./Office";

type Point = { x: number; y: number };
export type OverlayStatus = "working" | "idle" | "alert";
export type OfficeAnnotation = Point & {
  id: string;
  name: string;
  active: boolean;
  status?: OverlayStatus;
  description?: string;
};
export type OverlayHit = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
export type WorkingBadge = Point & {
  active: boolean;
  background?: { canvas: HTMLCanvasElement; left: number; top: number };
};

function gear(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  teeth: number,
  angle: number,
) {
  ctx.save();
  ctx.translate(x, y);
  // Identical teeth repeat after one tooth pitch. Canonicalize that phase so
  // equivalent poses also rasterize the hub hole with the same transform.
  ctx.rotate(angle % ((Math.PI * 2) / teeth));
  ctx.beginPath();
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i * Math.PI * 2) / (teeth * 4);
    const r = radius * (i % 4 === 0 || i % 4 === 3 ? 0.73 : 1);
    const px = Math.cos(a) * r,
      py = Math.sin(a) * r;
    if (i) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.moveTo(radius * 0.32, 0);
  ctx.arc(0, 0, radius * 0.32, 0, Math.PI * 2);
  ctx.fill("evenodd");
  ctx.restore();
}

function paintBadge(
  ctx: CanvasRenderingContext2D,
  badge: WorkingBadge,
  status: OverlayStatus,
  seconds: number,
  interiorOnly = false,
) {
  ctx.save();
  ctx.translate(badge.x, badge.y);
  ctx.fillStyle = "#193439";
  if (!interiorOnly) {
    ctx.strokeStyle = badge.active ? "#f4d38a" : "#91aaa3";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-12, -12, 24, 24, 7);
    ctx.fill();
    ctx.stroke();
  }
  if (!interiorOnly && status === "working" && badge.background) {
    // Snapshot the opaque badge and its antialias fringe before either gear.
    // Reuse a small GPU-side tile; no pixel readback or whole-office repaint.
    const m = ctx.getTransform();
    const left = Math.floor(m.e - 14 * m.a),
      top = Math.floor(m.f - 14 * m.d);
    const width = Math.ceil(m.e + 14 * m.a) - left;
    const height = Math.ceil(m.f + 14 * m.d) - top;
    const tile = badge.background.canvas;
    if (tile.width !== width) tile.width = width;
    if (tile.height !== height) tile.height = height;
    const background = tile.getContext("2d")!;
    background.clearRect(0, 0, width, height);
    background.drawImage(
      ctx.canvas,
      left,
      top,
      width,
      height,
      0,
      0,
      width,
      height,
    );
    badge.background.left = left;
    badge.background.top = top;
  }
  ctx.fillStyle =
    status === "alert"
      ? "#ffd080"
      : status === "working"
        ? "#78dfc1"
        : "#bad0da";
  if (status === "idle") {
    ctx.fillRect(-5, -6, 3, 12);
    ctx.fillRect(2, -6, 3, 12);
  } else if (status === "alert") {
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(8, 7);
    ctx.lineTo(-8, 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#193439";
    ctx.fillRect(-1, -3, 2, 5);
    ctx.fillRect(-1, 4, 2, 2);
  } else {
    // Eight and six teeth: inverse angular speeds keep the pair in mesh.
    gear(ctx, -2.75, 2.25, 6.5, 8, (seconds * Math.PI * 2) / 4);
    gear(ctx, 4.75, -4.5, 4.875, 6, Math.PI / 6 - (seconds * Math.PI * 2) / 3);
  }
  ctx.restore();
}

/** Repaint just the opaque badge footprint; the office and text stay untouched. */
export function drawWorkingBadges(
  ctx: CanvasRenderingContext2D,
  badges: WorkingBadge[],
  seconds: number,
) {
  for (const badge of badges) {
    if (badge.background) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // The office foreground is transparent; restore the cached alpha fringe too.
      ctx.clearRect(
        badge.background.left,
        badge.background.top,
        badge.background.canvas.width,
        badge.background.canvas.height,
      );
      ctx.drawImage(
        badge.background.canvas,
        badge.background.left,
        badge.background.top,
      );
      ctx.restore();
    }
    paintBadge(ctx, badge, "working", seconds, true);
  }
}

export function officeStatus(person: OfficePerson, en: boolean) {
  if (person.present === false)
    return {
      status: "idle" as const,
      description: en ? "Outside working hours" : "Đang nghỉ ngoài giờ",
    };
  if (person.shift === "lunch")
    return {
      status: "idle" as const,
      description: en ? "Lunch break" : "Đang nghỉ trưa",
    };
  const reasons = [
    ...(person.morale < 30 ? [en ? "Low morale" : "Tinh thần thấp"] : []),
    ...(person.energy < 25 ? [en ? "Low energy" : "Năng lượng thấp"] : []),
  ];
  return {
    status: reasons.length
      ? ("alert" as const)
      : person.working
        ? ("working" as const)
        : ("idle" as const),
    description: reasons.length
      ? reasons.join(" · ")
      : person.working
        ? en
          ? "Working"
          : "Đang làm việc"
        : en
          ? "Idle"
          : "Đang rảnh",
  };
}

const intersects = (a: OverlayHit, b: OverlayHit) =>
  a.x < b.x + b.width + 4 &&
  a.x + a.width + 4 > b.x &&
  a.y < b.y + b.height + 4 &&
  a.y + a.height + 4 > b.y;
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(n, hi));

/** Shared by Canvas callouts and HTML interaction labels. */
export function placeOfficeLabel(
  desired: OverlayHit,
  occupied: OverlayHit[],
  width: number,
  height: number,
): OverlayHit {
  const bound = (box: OverlayHit) => ({
    ...box,
    x: clamp(box.x, 8, width - box.width - 8),
    y: clamp(box.y, 8, height - box.height - 8),
  });
  const preferred = bound(desired);
  const candidates = [preferred];
  for (const other of occupied) {
    candidates.push(
      bound({ ...preferred, y: other.y - desired.height - 5 }),
      bound({ ...preferred, x: other.x - desired.width - 5 }),
      bound({ ...preferred, x: other.x + other.width + 5 }),
      bound({ ...preferred, y: other.y + other.height + 5 }),
    );
  }
  const free = (box: OverlayHit) => !occupied.some((o) => intersects(box, o));
  const nearby = candidates.find(free);
  if (nearby) return nearby;
  // Crowded views may need both axes to move together.
  const xs = new Set(candidates.map((c) => c.x));
  const ys = new Set(candidates.map((c) => c.y));
  const grid = [...xs].flatMap((x) =>
    [...ys].map((y) => ({ ...preferred, x, y })),
  );
  grid.sort(
    (a, b) =>
      (a.x - preferred.x) ** 2 +
      (a.y - preferred.y) ** 2 -
      (b.x - preferred.x) ** 2 -
      (b.y - preferred.y) ** 2,
  );
  return grid.find(free) ?? preferred;
}

/** Screen-space callouts: camera scale never changes their typography or hit areas. */
export function drawOfficeOverlay(
  ctx: CanvasRenderingContext2D,
  annotations: OfficeAnnotation[],
  width: number,
  height: number,
  gearSeconds = 0,
  backgrounds = new Map<string, HTMLCanvasElement>(),
): { hits: OverlayHit[]; workingBadges: WorkingBadge[] } {
  const occupied: OverlayHit[] = [];
  const workingBadges: WorkingBadge[] = [];
  ctx.save();
  ctx.font = "600 13px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const ellipsis = (text: string, maxWidth: number) => {
    if (ctx.measureText(text).width <= maxWidth) return text;
    const chars = Array.from(text);
    while (
      chars.length &&
      ctx.measureText(chars.join("") + "…").width > maxWidth
    )
      chars.pop();
    return chars.join("") + "…";
  };
  // Reserve selected/hovered text first so nearby badges cannot cover it.
  for (const item of [...annotations].sort(
    (a, b) => Number(b.active) - Number(a.active),
  )) {
    const lines = item.active
      ? [item.name, ...(item.description ? [item.description] : [])]
      : [];
    const labelWidth = lines.length
      ? Math.min(
          width - 16,
          340,
          Math.max(...lines.map((s) => ctx.measureText(s).width)) + 24,
        )
      : 0;
    const labelHeight = lines.length ? lines.length * 19 + 12 : 0;
    const badgeSize = item.status ? 24 : 0;
    const boxWidth = Math.max(badgeSize, labelWidth);
    const boxHeight =
      labelHeight + badgeSize + (lines.length && badgeSize ? 5 : 0);
    const preferred = {
      id: item.id,
      x: clamp(item.x - boxWidth / 2, 8, width - boxWidth - 8),
      y: clamp(item.y - boxHeight - 8, 8, height - boxHeight - 8),
      width: boxWidth,
      height: boxHeight,
    };
    const box = placeOfficeLabel(preferred, occupied, width, height);
    occupied.push(box);
    const x = box.x + box.width / 2;
    const badgeY = box.y + box.height - badgeSize / 2;
    if (item.status) {
      ctx.strokeStyle = "#627c78";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, box.y + box.height);
      ctx.lineTo(item.x, item.y - 2);
      ctx.stroke();
      const badge: WorkingBadge = { x, y: badgeY, active: item.active };
      if (item.status === "working") {
        let canvas = backgrounds.get(item.id);
        if (!canvas) {
          canvas = document.createElement("canvas");
          backgrounds.set(item.id, canvas);
        }
        badge.background = { canvas, left: 0, top: 0 };
      }
      paintBadge(ctx, badge, item.status, gearSeconds);
      if (item.status === "working") workingBadges.push(badge);
    }
    if (lines.length) {
      ctx.fillStyle = "#193439";
      ctx.strokeStyle = "#f4d38a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(box.x, box.y, box.width, labelHeight, 7);
      ctx.fill();
      ctx.stroke();
      lines.forEach((text, i) => {
        ctx.fillStyle = i ? "#c4d9d3" : "#fff5da";
        ctx.fillText(ellipsis(text, box.width - 24), x, box.y + 15 + i * 19);
      });
    }
  }
  const liveTiles = new Set(workingBadges.map((b) => b.background!.canvas));
  for (const [id, canvas] of backgrounds)
    if (!liveTiles.has(canvas)) {
      canvas.width = canvas.height = 0;
      backgrounds.delete(id);
    }
  ctx.restore();
  return { hits: occupied, workingBadges };
}
