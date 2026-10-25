import { assetURL } from "../app/assets";
import { useEffect, useRef, useState } from "react";
import atlas from "../../public/assets/manifest.json";
import characters from "../../public/assets/characters/manifest.json";
import { resolveAppearance } from "../characters/resolve";
import type { AppearanceId } from "../characters/catalog";
import { characterPose as pose, type CharacterPose } from "./characterMotion";
import type { TaskKind } from "../simulation/types";
import {
  drawOfficeOverlay,
  drawWorkingBadges,
  officeStatus,
  type OfficeAnnotation,
  type OverlayHit,
  type WorkingBadge,
} from "./officeOverlay";

export interface OfficePerson {
  id: string;
  name: string;
  role: string;
  working: boolean;
  morale: number;
  energy: number;
  taskKind?: TaskKind;
  variant?: number;
  appearance?: AppearanceId;
}
export interface Camera {
  x: number;
  y: number;
  zoom: number;
  width: number;
  height: number;
}
export interface OfficeProps {
  onCameraChange?: (camera: Camera) => void;
  people: OfficePerson[];
  tier: number;
  companyName?: string;
  selected?: string;
  onSelect: (id: string) => void;
  onNavigate: (view: string) => void;
  reducedMotion?: boolean;
  paused?: boolean;
  language?: "en" | "vi";
  interactionLabelsVisible?: boolean;
}
type Point = { x: number; y: number };
type SpriteMeta = {
  file: string;
  width: number;
  height: number;
  anchor: number[];
  pixelsPerMeter?: number;
  bbox: number[];
};
const PX = 65;
const iso = (x: number, y: number, z = 0): Point => ({
  x: (x - y) * PX,
  y: (x + y) * PX * 0.5 - z * PX * Math.SQRT2 * Math.cos(Math.PI / 6),
});
const asset = assetURL;
const seats: Point[] = [
  { x: 2.2, y: 2.4 },
  { x: 4.6, y: 2.4 },
  { x: 2.2, y: 4.8 },
  { x: 4.6, y: 4.8 },
  { x: 2.2, y: 7.1 },
  { x: 4.6, y: 7.1 },
  { x: 7, y: 2.4 },
  { x: 9.4, y: 2.4 },
  { x: 7, y: 4.8 },
  { x: 9.4, y: 4.8 },
  { x: 7, y: 7.1 },
  { x: 9.4, y: 7.1 },
];
const imageCache = new Map<string, Promise<HTMLImageElement>>();
function loadImage(file: string) {
  let promise = imageCache.get(file);
  if (!promise) {
    promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        imageCache.delete(file);
        reject(new Error(file));
      };
      img.src = asset(file);
    });
    imageCache.set(file, promise);
  }
  return promise;
}
export function Office(props: OfficeProps) {
  const canvas = useRef<HTMLCanvasElement>(null),
    state = useRef(props);
  state.current = props;
  const controller = useRef<
    { zoom: (d: number) => void; fit: () => void } | undefined
  >(undefined);
  const [error, setError] = useState("");
  useEffect(() => {
    const el = canvas.current!,
      ctx = el.getContext("2d", { alpha: false });
    if (!ctx) {
      setError("Canvas 2D is unavailable.");
      return;
    }
    const layer = document.createElement("canvas"),
      bg = layer.getContext("2d", { alpha: false })!;
    let w = 1,
      h = 1,
      dpr = 1,
      pan = { x: 0, y: 0 },
      zoom = 1,
      frame = 0,
      dead = false,
      drag: Point | null = null,
      moved = false,
      hover = "",
      dirty = true,
      lastTier = state.current.tier,
      lastLocale = state.current.language,
      lastCompanyName = state.current.companyName;
    let seconds = 0,
      gearSeconds = 0,
      lastGearFrame = -1,
      last = performance.now(),
      loaded = 0,
      requested = 0,
      lastVisualKey = "",
      lastCameraKey = "";
    const images: Record<string, HTMLImageElement> = {},
      pending = new Set<string>();
    const request = (key: string, file: string) => {
      if (pending.has(key)) return;
      pending.add(key);
      requested++;
      void loadImage(file)
        .then((img) => {
          if (!dead) {
            images[key] = img;
            loaded++;
            dirty = true;
          }
        })
        .catch(() => {
          if (!dead)
            setError(
              state.current.language === "en"
                ? "An office asset could not load. Reload to retry."
                : "Không tải được hình văn phòng. Tải lại trang để thử lại.",
            );
        });
    };
    for (const [key, meta] of Object.entries(atlas.sprites))
      if (!["worker", "idle", "thinking"].includes(key))
        request(key, meta.file);
    const size = () =>
      state.current.tier === 2 ? { x: 14, y: 10 } : { x: 8, y: 9 };
    const fit = () => {
      const s = size();
      zoom = Math.max(
        0.3,
        Math.min(
          1.15,
          Math.min(
            w / (PX * (s.x + s.y) + 130),
            h / (PX * 0.5 * (s.x + s.y) + 210),
          ),
        ),
      );
      pan = {
        x: w / 2 - ((s.x - s.y) * PX * zoom) / 2,
        y: h / 2 - ((s.x + s.y) * PX * 0.5 * zoom) / 2 + 85 * zoom,
      };
      dirty = true;
    };
    const resize = () => {
      const r = el.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      dpr = Math.max(1, Math.min(devicePixelRatio || 1, 2));
      el.width = layer.width = Math.round(w * dpr);
      el.height = layer.height = Math.round(h * dpr);
      fit();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const changeZoom = (d: number) => {
      const old = zoom;
      zoom = Math.max(0.3, Math.min(2.4, zoom * d));
      pan = {
        x: w / 2 + ((pan.x - w / 2) * zoom) / old,
        y: h / 2 + ((pan.y - h / 2) * zoom) / old,
      };
      dirty = true;
    };
    controller.current = { zoom: changeZoom, fit };
    const poly = (
      c: CanvasRenderingContext2D,
      pts: Point[],
      fill: string,
      stroke?: string,
    ) => {
      c.beginPath();
      pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
      c.closePath();
      c.fillStyle = fill;
      c.fill();
      if (stroke) {
        c.strokeStyle = stroke;
        c.lineWidth = 0.75;
        c.stroke();
      }
    };
    const tile = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      dx: number,
      dy: number,
      color: string,
      z = 0,
    ) =>
      poly(
        c,
        [
          iso(x, y, z),
          iso(x + dx, y, z),
          iso(x + dx, y + dy, z),
          iso(x, y + dy, z),
        ],
        color,
      );
    const staticScene = () => {
      bg.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = bg.createRadialGradient(
        w * 0.5,
        h * 0.4,
        20,
        w * 0.5,
        h * 0.4,
        w * 0.7,
      );
      g.addColorStop(0, "#faf9f0");
      g.addColorStop(1, "#e2eae5");
      bg.fillStyle = g;
      bg.fillRect(0, 0, w, h);
      bg.translate(pan.x, pan.y);
      bg.scale(zoom, zoom);
      const s = size();
      bg.save();
      bg.filter = "blur(18px)";
      tile(bg, 0.2, 0.2, s.x, s.y, "#afbbaf", -0.4);
      bg.restore();
      poly(
        bg,
        [
          iso(0, s.y, -0.15),
          iso(s.x, s.y, -0.15),
          iso(s.x, s.y, 0.13),
          iso(0, s.y, 0.13),
        ],
        "#b8ad95",
      );
      poly(
        bg,
        [
          iso(s.x, 0, -0.15),
          iso(s.x, s.y, -0.15),
          iso(s.x, s.y, 0.13),
          iso(s.x, 0, 0.13),
        ],
        "#a99f88",
      );
      for (let x = 0; x < s.x; x++)
        for (let y = 0; y < s.y; y++)
          tile(
            bg,
            x + 0.006,
            y + 0.006,
            0.988,
            0.988,
            (x + y) % 2 ? "#eee5d5" : "#f3ebdd",
            0.13,
          );
      poly(
        bg,
        [iso(0, 0, 0.13), iso(s.x, 0, 0.13), iso(s.x, 0, 2.1), iso(0, 0, 2.1)],
        "#d6e3d9",
      );
      poly(
        bg,
        [iso(0, 0, 0.13), iso(0, s.y, 0.13), iso(0, s.y, 2.1), iso(0, 0, 2.1)],
        "#e4ebe1",
      );
      for (let x = 1; x < s.x - 1; x += 2.7) {
        poly(
          bg,
          [
            iso(x, 0.01, 0.75),
            iso(x + 1.9, 0.01, 0.75),
            iso(x + 1.9, 0.01, 1.8),
            iso(x, 0.01, 1.8),
          ],
          "#fcfcf2",
          "#afc4b7",
        );
        poly(
          bg,
          [
            iso(x + 0.08, 0.02, 0.83),
            iso(x + 1.82, 0.02, 0.83),
            iso(x + 1.82, 0.02, 1.72),
            iso(x + 0.08, 0.02, 1.72),
          ],
          "#b8d9d8",
        );
        poly(
          bg,
          [
            iso(x + 1, 0.025, 0.83),
            iso(x + 1.04, 0.025, 0.83),
            iso(x + 1.04, 0.025, 1.72),
            iso(x + 1, 0.025, 1.72),
          ],
          "#f8faf0",
        );
      }
      const sign = iso(0.03, 4, 1.65);
      bg.save();
      bg.translate(sign.x, sign.y);
      bg.transform(0.89, -0.45, 0, 1, 0, 0);
      bg.fillStyle = "#285648";
      bg.font = "800 19px system-ui";
      let signText = state.current.companyName?.trim() || "SOFTWARE CEO";
      // Keep lettering within the existing wall, including long imported names.
      const signWidth = 220;
      const fontSize = Math.max(
        12,
        19 * Math.min(1, signWidth / bg.measureText(signText).width),
      );
      bg.font = `800 ${fontSize}px system-ui`;
      if (bg.measureText(signText).width > signWidth) {
        const characters = Array.from(signText);
        while (
          characters.length &&
          bg.measureText(`${characters.join("")}…`).width > signWidth
        )
          characters.pop();
        signText = `${characters.join("")}…`;
      }
      bg.fillText(signText, 0, 0);
      bg.restore();
      const board = iso(0.06, 5.4, 1.55);
      bg.save();
      bg.translate(board.x, board.y);
      bg.transform(-0.89, 0.45, 0, 1, 0, 0);
      bg.fillStyle = "#fffdf2";
      bg.fillRect(-100, 0, 100, 60);
      ["#e9b971", "#82b29a", "#91acbd"].forEach((c, i) => {
        bg.fillStyle = c;
        for (let j = 0; j < 2; j++)
          bg.fillRect(-92 + i * 29, 10 + j * 22, 22, 15);
      });
      bg.restore();
      tile(bg, s.x - 3.1, s.y - 3.7, 2.8, 2.7, "#c2cdb8", 0.145);
      tile(bg, 0.25, s.y - 1.7, 2, 1.4, "#d4bca0", 0.145);
      dirty = false;
    };
    const sprite = (name: string, p: Point, alpha = 1) => {
      const img = images[name];
      if (!img) return;
      const m = (atlas.sprites as Record<string, SpriteMeta>)[name],
        sc =
          (PX * Math.SQRT2) /
          (m.pixelsPerMeter ?? atlas.projection.pixelsPerMeter);
      ctx.globalAlpha = alpha;
      const [bx, by, right, bottom] = m.bbox;
      ctx.drawImage(
        img,
        bx,
        by,
        right - bx,
        bottom - by,
        p.x + (bx - m.anchor[0]) * sc,
        p.y + (by - m.anchor[1]) * sc,
        (right - bx) * sc,
        (bottom - by) * sc,
      );
      ctx.globalAlpha = 1;
    };
    // Occlusion mask in the locked 512×512 chair sprite's source coordinates.
    // Only the backrest/spine and camera-facing arm pass in front of the sitter;
    // The near seat rim also hides the far leg; the near leg, pedestal and
    // casters retain their existing order. Coordinates belong to this sprite.
    const chairFront = (p: Point) => {
      const m = atlas.sprites.chair;
      const sc = (PX * Math.SQRT2) / m.pixelsPerMeter;
      ctx.save();
      ctx.translate(p.x - m.anchor[0] * sc, p.y - m.anchor[1] * sc);
      ctx.scale(sc, sc);
      ctx.beginPath();
      ctx.moveTo(130, 198);
      ctx.lineTo(205, 198);
      ctx.lineTo(215, 291);
      ctx.bezierCurveTo(217, 315, 205, 333, 181, 330);
      ctx.lineTo(169, 328);
      ctx.lineTo(169, 349);
      ctx.lineTo(157, 349);
      ctx.lineTo(157, 322);
      ctx.lineTo(130, 310);
      ctx.closePath();
      ctx.moveTo(225, 306);
      ctx.lineTo(267, 287);
      ctx.lineTo(284, 294);
      ctx.lineTo(284, 303);
      ctx.lineTo(254, 319);
      ctx.lineTo(246, 341);
      ctx.lineTo(237, 344);
      ctx.lineTo(243, 319);
      ctx.lineTo(225, 316);
      ctx.closePath();
      ctx.moveTo(142, 326);
      ctx.lineTo(211, 349);
      ctx.lineTo(258, 327);
      ctx.lineTo(258, 344);
      ctx.lineTo(211, 366);
      ctx.lineTo(142, 343);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(images.chair, 0, 0);
      ctx.restore();
    };
    const personSprite = (
      appearance: AppearanceId,
      p: Point,
      animation: CharacterPose,
    ) => {
      const img = images["character-" + appearance];
      if (!img) return;
      const model = characters.models[appearance];
      const frame = model.tracks[animation.state][animation.frame];
      const [x, y, width, height] = frame.rect;
      const [ox, oy] = frame.offset;
      const scale = (PX * Math.SQRT2) / characters.pixelsPerMeter;
      ctx.drawImage(
        img,
        x,
        y,
        width,
        height,
        p.x + ox * scale,
        p.y + oy * scale,
        width * scale,
        height * scale,
      );
    };
    let overlayHits: OverlayHit[] = [];
    let workingBadges: WorkingBadge[] = [];
    const badgeBackgrounds = new Map<string, HTMLCanvasElement>();
    let hit: { id: string; x: number; y: number; r: number; top: number }[] =
      [];
    const pick = (e: PointerEvent) => {
      const r = el.getBoundingClientRect(),
        screenX = e.clientX - r.left,
        screenY = e.clientY - r.top,
        x = (screenX - pan.x) / zoom,
        y = (screenY - pan.y) / zoom;
      return (
        overlayHits.find(
          (a) =>
            screenX >= a.x &&
            screenX <= a.x + a.width &&
            screenY >= a.y &&
            screenY <= a.y + a.height,
        )?.id ||
        [...hit]
          .reverse()
          .find(
            (a) => Math.abs(x - a.x) < a.r && y > a.y - a.top && y < a.y + 28,
          )?.id ||
        ""
      );
    };
    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY };
      moved = false;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (drag) {
        const dx = e.clientX - drag.x,
          dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
        pan.x += dx;
        pan.y += dy;
        drag = { x: e.clientX, y: e.clientY };
        dirty = true;
      } else {
        hover = pick(e);
        el.style.cursor = hover ? "pointer" : "grab";
      }
    };
    const up = (e: PointerEvent) => {
      if (!moved) {
        const id = pick(e);
        if (id.startsWith("nav:")) state.current.onNavigate(id.slice(4));
        else if (id) state.current.onSelect(id);
      }
      drag = null;
    };
    const cancel = () => {
      drag = null;
    };
    const leave = () => {
      if (!drag) hover = "";
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      changeZoom(Math.exp(-e.deltaY * 0.001));
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") pan.x += 30;
      else if (e.key === "ArrowRight") pan.x -= 30;
      else if (e.key === "ArrowUp") pan.y += 30;
      else if (e.key === "ArrowDown") pan.y -= 30;
      else if (e.key === "+" || e.key === "=") changeZoom(1.15);
      else if (e.key === "-") changeZoom(1 / 1.15);
      else if (e.key === "0") fit();
      else return;
      e.preventDefault();
      dirty = true;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", cancel);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("keydown", key);
    const visibility = () => {
      last = performance.now();
    };
    document.addEventListener("visibilitychange", visibility);
    const draw = (now: number) => {
      if (dead) return;
      const cameraKey = [pan.x, pan.y, zoom, w, h].join(":");
      if (cameraKey !== lastCameraKey) {
        lastCameraKey = cameraKey;
        state.current.onCameraChange?.({
          x: pan.x,
          y: pan.y,
          zoom,
          width: w,
          height: h,
        });
      }
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (
        !state.current.paused &&
        !state.current.reducedMotion &&
        !document.hidden
      )
        seconds += dt;
      // A UI-only clock: Working remains legible during Pause, without ticking
      // the simulation or repainting the world between authored poses.
      if (
        !state.current.reducedMotion &&
        !document.hidden &&
        state.current.people.some(
          (person) => officeStatus(person, false).status === "working",
        )
      )
        gearSeconds += dt;
      const gearFrame = state.current.reducedMotion
        ? 0
        : Math.floor(gearSeconds * 30);
      const gearTime = gearFrame / 30;
      if (lastTier !== state.current.tier) {
        lastTier = state.current.tier;
        fit();
      }
      if (lastLocale !== state.current.language) {
        lastLocale = state.current.language;
        dirty = true;
      }
      if (lastCompanyName !== state.current.companyName) {
        lastCompanyName = state.current.companyName;
        dirty = true;
      }
      const appearances = state.current.people.map(resolveAppearance);
      for (const appearance of appearances)
        request("character-" + appearance, characters.models[appearance].file);
      const animations = state.current.people.map((person) =>
        pose(person, seconds, !!state.current.reducedMotion),
      );
      // Authored poses run at 8 fps; redraw only when visible content changes.
      // Walking offsets and camera input still interpolate on the display clock.
      const visualKey = JSON.stringify([
        state.current.selected,
        state.current.interactionLabelsVisible,
        state.current.reducedMotion,
        hover,
        state.current.people.map((person, i) => [
          person.id,
          person.name,
          person.role,
          appearances[i],
          person.working,
          person.morale < 30 || person.energy < 25,
          person.morale < 30,
          person.energy < 25,
          animations[i].state,
          animations[i].frame,
          animations[i].offset,
        ]),
      ]);
      if (!dirty && visualKey === lastVisualKey) {
        if (gearFrame !== lastGearFrame) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          drawWorkingBadges(ctx, workingBadges, gearTime);
          lastGearFrame = gearFrame;
        }
        frame = requestAnimationFrame(draw);
        return;
      }
      lastVisualKey = visualKey;
      if (dirty) staticScene();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(layer, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);
      const s = size(),
        en = state.current.language === "en";
      hit = [];
      const annotations: OfficeAnnotation[] = [];
      const screen = (p: Point) => ({
        x: pan.x + p.x * zoom,
        y: pan.y + p.y * zoom,
      });
      const objects: { depth: number; draw: () => void }[] = [];
      const prop = (
        name: string,
        x: number,
        y: number,
        nav?: string,
        caption?: string,
      ) => {
        const p = iso(x, y, 0.13);
        objects.push({
          depth: x + y,
          draw: () => {
            sprite(name, p);
            if (nav) {
              hit.push({
                id: "nav:" + nav,
                ...p,
                r: name === "meeting" ? 95 : 55,
                top: 115,
              });
              if (hover === "nav:" + nav && caption)
                annotations.push({
                  id: "nav:" + nav,
                  name: caption,
                  active: true,
                  ...screen(p),
                });
            }
          },
        });
      };
      prop("finance", 0.8, 0.9, "finance", en ? "Finance" : "Tài chính");
      prop("plant", s.x - 1, 0.8);
      prop(
        "pantry",
        s.x - 1.4,
        2,
        "people",
        en ? "Team care" : "Chăm sóc nhóm",
      );
      prop("sofa", 0.9, s.y - 0.5);
      prop("plant", 0.6, s.y - 2.4);
      prop(
        "meeting",
        s.x - 1.7,
        s.y - 2.3,
        "strategy",
        en ? "Strategy meeting" : "Họp chiến lược",
      );
      prop(
        "entry",
        s.x - 1.1,
        s.y - 0.65,
        "people",
        en ? "Recruitment" : "Tuyển dụng",
      );
      const board = iso(0.1, 5.4, 1);
      hit.push({
        id: "nav:work",
        x: board.x + 40,
        y: board.y + 50,
        r: 60,
        top: 95,
      });
      const positions = state.current.tier === 2 ? seats : seats.slice(0, 5);
      positions.forEach((pos, i) => {
        const p = iso(pos.x, pos.y, 0.13),
          person = state.current.people[i];
        objects.push({
          depth: pos.x + pos.y - 0.5,
          draw: () => sprite("desk", p, person ? 1 : 0.65),
        });
        objects.push({
          depth: pos.x + pos.y + 0.35,
          draw: () => sprite("chair", p, person ? 1 : 0.65),
        });
        if (person) {
          const animation = animations[i],
            location = iso(pos.x + animation.offset, pos.y, 0.13);
          objects.push({
            depth: pos.x + pos.y + animation.offset + 0.55,
            draw: () => {
              const selected =
                state.current.selected === person.id || hover === person.id;
              if (selected) {
                ctx.strokeStyle = "#cb943e";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.ellipse(
                  location.x,
                  location.y + 7,
                  43,
                  20,
                  0,
                  0,
                  Math.PI * 2,
                );
                ctx.stroke();
              }
              personSprite(appearances[i], location, animation);
              const spriteFrame =
                characters.models[appearances[i]].tracks[animation.state][
                  animation.frame
                ];
              const sc = (PX * Math.SQRT2) / characters.pixelsPerMeter;
              const top = screen({
                x:
                  location.x +
                  (spriteFrame.offset[0] + spriteFrame.rect[2] / 2) * sc,
                y: location.y + spriteFrame.offset[1] * sc,
              });
              const bottom = screen({
                x:
                  location.x +
                  (spriteFrame.offset[0] + spriteFrame.rect[2]) * sc,
                y:
                  location.y +
                  (spriteFrame.offset[1] + spriteFrame.rect[3]) * sc,
              });
              if (
                bottom.x >= 0 &&
                top.x - (spriteFrame.rect[2] * sc * zoom) / 2 <= w &&
                bottom.y >= 0 &&
                top.y <= h
              )
                annotations.push({
                  id: person.id,
                  name: person.name,
                  active: selected && !state.current.interactionLabelsVisible,
                  ...top,
                  ...officeStatus(person, en),
                });
              hit.push({ id: person.id, ...location, r: 48, top: 145 });
            },
          });
          // Keep foreground occlusion in world depth order, including during
          // stand/turn/walk. Never put the whole chair over the character.
          objects.push({
            depth: pos.x + pos.y + 0.7,
            draw: () => {
              if (images.chair) chairFront(p);
            },
          });
        }
      });
      objects.sort((a, b) => a.depth - b.depth).forEach((o) => o.draw());
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const overlay = drawOfficeOverlay(
        ctx,
        annotations,
        w,
        h,
        gearTime,
        badgeBackgrounds,
      );
      overlayHits = overlay.hits;
      workingBadges = overlay.workingBadges;
      lastGearFrame = gearFrame;
      if (loaded < requested) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#30554a";
        ctx.font = "14px system-ui";
        ctx.fillText(en ? "Loading office…" : "Đang mở văn phòng…", 20, h - 20);
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      ro.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", cancel);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("keydown", key);
      document.removeEventListener("visibilitychange", visibility);
      controller.current = undefined;
      for (const tile of badgeBackgrounds.values())
        tile.width = tile.height = 0;
      badgeBackgrounds.clear();
      layer.width = layer.height = 0;
    };
  }, []);
  const en = props.language === "en";
  return (
    <div className="office-canvas">
      <canvas
        ref={canvas}
        tabIndex={0}
        aria-label={
          en
            ? "Isometric office. Drag or use arrow keys to pan. Scroll or use plus and minus to zoom. Press 0 to fit. All actions are also available in navigation."
            : "Văn phòng isometric. Kéo hoặc dùng phím mũi tên để di chuyển. Cuộn hoặc phím cộng, trừ để phóng. Phím 0 căn giữa. Mọi thao tác đều có trong menu."
        }
      />
      {error && (
        <div className="canvas-error" role="alert">
          {error}
        </div>
      )}
      <div className="camera-controls">
        <button
          aria-label={en ? "Zoom out" : "Thu nhỏ"}
          onClick={() => controller.current?.zoom(1 / 1.2)}
        >
          −
        </button>
        <button onClick={() => controller.current?.fit()}>
          {en ? "Fit" : "Căn giữa"}
        </button>
        <button
          aria-label={en ? "Zoom in" : "Phóng to"}
          onClick={() => controller.current?.zoom(1.2)}
        >
          +
        </button>
      </div>
    </div>
  );
}
