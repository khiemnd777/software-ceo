// Mockup-only renderer fork of src/renderer/Office.tsx (2026-10-25).
// Preserves V4 projection, assets and interactions; separates exterior/window/interior lighting.
import { assetURL } from "../../../src/app/assets";
import { useEffect, useRef, useState, type RefObject } from "react";
import atlas from "../../../public/assets/manifest.json";
import characters from "../../../public/assets/characters/manifest.json";
import { resolveAppearance } from "../../../src/characters/resolve";
import type { AppearanceId } from "../../../src/characters/catalog";
import {
  characterPose as pose,
  type CharacterPose,
} from "../../../src/renderer/characterMotion";
import type { TaskKind } from "../../../src/simulation/types";
import { scenePalette, drawWindowView, drawWallLamp } from "./sceneLighting";
import { drawWallClock } from "./wallClock";
import { MonitorLayer, screenPlane, darkScreen } from "./workingMonitors";
import { drawWallSwitch, switchBounds, officeShade } from "./wallSwitch";
import {
  drawWindowLight,
  windowLightFrame,
  officeWindows,
} from "./windowLight";
import { clockLabel } from "./displayClock";
import { drawOutdoorSky, type Weather } from "./outdoorWeather";
import {
  drawOfficeOverlay,
  drawWorkingBadges,
  officeStatus,
  type OfficeAnnotation,
  type OverlayHit,
  type WorkingBadge,
} from "../../../src/renderer/officeOverlay";

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
export interface VisualTime {
  minute: number;
  weatherSeconds: number;
}
export interface OfficeProps {
  visualTime: RefObject<VisualTime>;
  lightsOn: boolean;
  onToggleLights: () => void;
  lightingMinute: number;
  weather: Weather;
  weatherSeconds: number;
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
export function LitOffice(props: OfficeProps) {
  const canvas = useRef<HTMLCanvasElement>(null),
    state = useRef(props);
  state.current = props;
  const controller = useRef<
    { zoom: (d: number) => void; fit: () => void } | undefined
  >(undefined);
  const [error, setError] = useState("");
  const [view, setView] = useState<Camera | null>(null);
  useEffect(() => {
    const el = canvas.current!,
      output = el.getContext("2d", { alpha: false });
    if (!output) {
      setError("Canvas 2D is unavailable.");
      return;
    }
    const foreground = document.createElement("canvas"),
      ctx = foreground.getContext("2d", { alpha: true })!,
      layer = document.createElement("canvas"),
      bg = layer.getContext("2d", { alpha: true })!,
      skyLayer = document.createElement("canvas"),
      skyContext = skyLayer.getContext("2d", { alpha: false })!;
    const floorLayer = document.createElement("canvas"),
      floorContext = floorLayer.getContext("2d")!,
      windowLight = document.createElement("canvas"),
      lightContext = windowLight.getContext("2d")!;
    let lightBounds = { x: 0, y: 0, width: 0, height: 0 };
    const monitors = new MonitorLayer();
    const present = () => {
      output.setTransform(1, 0, 0, 1, 0, 0);
      output.drawImage(skyLayer, 0, 0);
      output.drawImage(floorLayer, 0, 0);
      output.save();
      output.globalCompositeOperation = "screen";
      const { x, y, width, height } = lightBounds;
      if (width > 0 && height > 0)
        output.drawImage(windowLight, x, y, width, height, x, y, width, height);
      output.restore();
      output.drawImage(foreground, 0, 0);
      monitors.composite(output);
    };
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
      lastCompanyName = state.current.companyName,
      lastLightKey = "",
      lastWeatherKey = "",
      interiorShade = 0,
      worldPass = 0,
      windowLightPaints = 0,
      lastWindowLightKey = "",
      skyFrame: ReturnType<typeof drawOutdoorSky> | null = null;
    let seconds = 0,
      gearSeconds = 0,
      monitorSeconds = 0,
      lastMonitorFrame = -1,
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
            (h - 70) / (PX * 0.5 * (s.x + s.y) + 210),
          ),
        ),
      );
      pan = {
        x: w / 2 - ((s.x - s.y) * PX * zoom) / 2,
        y: h / 2 + 10 - ((s.x + s.y) * PX * 0.5 * zoom) / 2 + 85 * zoom,
      };
      dirty = true;
    };
    const resize = () => {
      const r = el.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      dpr = Math.max(1, Math.min(devicePixelRatio || 1, 2));
      el.width =
        layer.width =
        skyLayer.width =
        foreground.width =
          Math.round(w * dpr);
      el.height =
        layer.height =
        skyLayer.height =
        foreground.height =
          Math.round(h * dpr);
      floorLayer.width = windowLight.width = el.width;
      floorLayer.height = windowLight.height = el.height;
      monitors.resize(el.width, el.height);
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
      const light = scenePalette(state.current.visualTime.current.minute);
      interiorShade = officeShade(state.current.lightsOn, light.night);
      bg.setTransform(dpr, 0, 0, dpr, 0, 0);
      bg.clearRect(0, 0, w, h);
      bg.translate(pan.x, pan.y);
      bg.scale(zoom, zoom);
      const s = size();
      bg.save();
      bg.filter = "blur(8px)";
      tile(bg, 0.12, 0.12, s.x, s.y, "rgba(15,32,24,.23)", -0.15);
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
      // An opaque underfloor seals tile seams: rain belongs behind the room,
      // including the subpixel gaps between individual floor tiles.
      tile(bg, 0, 0, s.x, s.y, "#eee5d5", 0.13);
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
      // Cache the floor separately: moving window light stays below all room
      // objects, without rebuilding sprites or an occlusion mask every frame.
      floorContext.setTransform(1, 0, 0, 1, 0, 0);
      floorContext.clearRect(0, 0, floorLayer.width, floorLayer.height);
      floorContext.drawImage(layer, 0, 0);
      if (interiorShade > 0) {
        floorContext.save();
        floorContext.globalCompositeOperation = "source-atop";
        floorContext.fillStyle = `rgba(12,24,34,${interiorShade})`;
        floorContext.fillRect(0, 0, floorLayer.width, floorLayer.height);
        floorContext.restore();
      }
      bg.save();
      bg.setTransform(1, 0, 0, 1, 0, 0);
      bg.clearRect(0, 0, layer.width, layer.height);
      bg.restore();
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
      for (const { x, width: windowWidth } of officeWindows(s.x)) {
        poly(
          bg,
          [
            iso(x, 0.01, 0.75),
            iso(x + windowWidth, 0.01, 0.75),
            iso(x + windowWidth, 0.01, 1.8),
            iso(x, 0.01, 1.8),
          ],
          "#fcfcf2",
          "#afc4b7",
        );
        drawWindowView(
          bg,
          [
            iso(x + 0.08, 0.02, 0.83),
            iso(x + windowWidth - 0.08, 0.02, 0.83),
            iso(x + windowWidth - 0.08, 0.02, 1.72),
            iso(x + 0.08, 0.02, 1.72),
          ],
          light,
          true,
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
      for (const x of [2, 4.7]) {
        drawWallLamp(
          bg,
          [
            iso(x, 0.035, 1.95),
            iso(x + 0.85, 0.035, 1.95),
            iso(x + 0.85, 0.035, 2.04),
            iso(x, 0.035, 2.04),
          ],
          light,
          state.current.lightsOn,
        );
      }
      for (const y of [2.1, 5.1]) {
        drawWallLamp(
          bg,
          [
            iso(0.035, y, 1.95),
            iso(0.035, y + 0.85, 1.95),
            iso(0.035, y + 0.85, 2.04),
            iso(0.035, y, 2.04),
          ],
          light,
          state.current.lightsOn,
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
      const args = [
        bx,
        by,
        right - bx,
        bottom - by,
        p.x + (bx - m.anchor[0]) * sc,
        p.y + (by - m.anchor[1]) * sc,
        (right - bx) * sc,
        (bottom - by) * sc,
      ] as const;
      ctx.drawImage(img, ...args);
      if (monitors.intersects(args[4], args[5], args[6], args[7])) {
        monitors.ctx.globalAlpha = alpha;
        monitors.ctx.drawImage(img, ...args);
        monitors.ctx.globalAlpha = 1;
      }
      ctx.globalAlpha = 1;
    };
    // Occlusion mask in the locked 512×512 chair sprite's source coordinates.
    // Only the backrest/spine and camera-facing arm pass in front of the sitter;
    // The near seat rim also hides the far leg; the near leg, pedestal and
    // casters retain their existing order. Coordinates belong to this sprite.
    const chairFront = (p: Point, target = ctx) => {
      const m = atlas.sprites.chair;
      const sc = (PX * Math.SQRT2) / m.pixelsPerMeter;
      target.save();
      target.translate(p.x - m.anchor[0] * sc, p.y - m.anchor[1] * sc);
      target.scale(sc, sc);
      target.beginPath();
      target.moveTo(130, 198);
      target.lineTo(205, 198);
      target.lineTo(215, 291);
      target.bezierCurveTo(217, 315, 205, 333, 181, 330);
      target.lineTo(169, 328);
      target.lineTo(169, 349);
      target.lineTo(157, 349);
      target.lineTo(157, 322);
      target.lineTo(130, 310);
      target.closePath();
      target.moveTo(225, 306);
      target.lineTo(267, 287);
      target.lineTo(284, 294);
      target.lineTo(284, 303);
      target.lineTo(254, 319);
      target.lineTo(246, 341);
      target.lineTo(237, 344);
      target.lineTo(243, 319);
      target.lineTo(225, 316);
      target.closePath();
      target.moveTo(142, 326);
      target.lineTo(211, 349);
      target.lineTo(258, 327);
      target.lineTo(258, 341);
      target.lineTo(211, 363);
      target.lineTo(142, 340);
      target.closePath();
      target.clip();
      target.drawImage(images.chair, 0, 0);
      target.restore();
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
      const args = [
        x,
        y,
        width,
        height,
        p.x + ox * scale,
        p.y + oy * scale,
        width * scale,
        height * scale,
      ] as const;
      ctx.drawImage(img, ...args);
      if (monitors.intersects(args[4], args[5], args[6], args[7]))
        monitors.ctx.drawImage(img, ...args);
    };
    let overlayHits: OverlayHit[] = [];
    let workingBadges: WorkingBadge[] = [];
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
        const camera = { x: pan.x, y: pan.y, zoom, width: w, height: h };
        setView(camera);
        state.current.onCameraChange?.(camera);
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
      if (
        !state.current.reducedMotion &&
        !document.hidden &&
        state.current.people.some((p) => p.working)
      )
        monitorSeconds += dt;
      const monitorFrame = state.current.reducedMotion
        ? 0
        : Math.floor(monitorSeconds * 8);
      const paintMonitors = () => {
        monitors.redraw(monitorFrame);
        lastMonitorFrame = monitorFrame;
        el.dataset.monitors = JSON.stringify({
          worldPass,
          ...monitors.snapshot(monitorFrame),
        });
      };
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
      // Window holes and lamp colors are static. Rebuild the room only when
      // its actual shade or quarter-hour clock changes, not every game minute.
      const roomShade = officeShade(
        state.current.lightsOn,
        scenePalette(Math.floor(state.current.visualTime.current.minute)).night,
      );
      const lightKey = `${clockLabel(state.current.visualTime.current.minute)}:${roomShade}:${!!state.current.reducedMotion}:${state.current.lightsOn}`;
      if (lightKey !== lastLightKey) {
        lastLightKey = lightKey;
        dirty = true;
      }
      const weatherSeconds = state.current.reducedMotion
        ? 0
        : state.current.visualTime.current.weatherSeconds;
      const weatherKey = `${state.current.visualTime.current.minute}:${state.current.weather}:${weatherSeconds}:${!!state.current.reducedMotion}`;
      const skyChanged = dirty || weatherKey !== lastWeatherKey;
      if (skyChanged) {
        skyContext.setTransform(dpr, 0, 0, dpr, 0, 0);
        skyFrame = drawOutdoorSky(
          skyContext,
          w,
          h,
          state.current.visualTime.current.minute,
          state.current.weather,
          weatherSeconds,
          !!state.current.reducedMotion,
        );
        el.dataset.skyFrame = JSON.stringify(skyFrame);
        lastWeatherKey = weatherKey;
      }
      const windowLightKey = `${state.current.visualTime.current.minute}:${state.current.weather}:${!!state.current.reducedMotion}:${cameraKey}`;
      const windowLightChanged = dirty || windowLightKey !== lastWindowLightKey;
      if (windowLightChanged && skyFrame) {
        lightContext.setTransform(1, 0, 0, 1, 0, 0);
        lightContext.clearRect(0, 0, windowLight.width, windowLight.height);
        lightContext.setTransform(dpr, 0, 0, dpr, 0, 0);
        lightContext.translate(pan.x, pan.y);
        lightContext.scale(zoom, zoom);
        const light = windowLightFrame(
          state.current.visualTime.current.minute,
          state.current.weather,
          skyFrame,
        );
        const patches = drawWindowLight(
          lightContext,
          light,
          size(),
          iso,
          !!state.current.reducedMotion,
        );
        // Blend only the lit floor region. A full-canvas screen blend also
        // processes empty sky pixels and is costly on CPU-backed Canvas.
        const points = patches.flatMap((p) =>
          p.points.map((point) => {
            const q = iso(point.x, point.y, 0.13);
            return {
              x: (pan.x + q.x * zoom) * dpr,
              y: (pan.y + q.y * zoom) * dpr,
            };
          }),
        );
        const left = Math.max(
          0,
          Math.floor(Math.min(...points.map((p) => p.x))) - 4,
        );
        const top = Math.max(
          0,
          Math.floor(Math.min(...points.map((p) => p.y))) - 4,
        );
        lightBounds = points.length
          ? {
              x: left,
              y: top,
              width: Math.max(
                0,
                Math.min(
                  windowLight.width,
                  Math.ceil(Math.max(...points.map((p) => p.x))) + 4,
                ) - left,
              ),
              height: Math.max(
                0,
                Math.min(
                  windowLight.height,
                  Math.ceil(Math.max(...points.map((p) => p.y))) + 4,
                ) - top,
              ),
            }
          : { x: 0, y: 0, width: 0, height: 0 };
        windowLightPaints++;
        el.dataset.windowLight = JSON.stringify({
          ...light,
          paints: windowLightPaints,
          bounds: lightBounds,
          patches,
        });
        lastWindowLightKey = windowLightKey;
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
      // Weather changes only the exterior. Reuse the transparent office until
      // a pose, clock, camera, selection or other room content actually changes.
      if (!dirty && visualKey === lastVisualKey) {
        const badgeChanged = gearFrame !== lastGearFrame;
        if (gearFrame !== lastGearFrame) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          drawWorkingBadges(ctx, workingBadges, gearTime);
          lastGearFrame = gearFrame;
        }
        const monitorChanged = monitorFrame !== lastMonitorFrame;
        if (monitorChanged) paintMonitors();
        if (skyChanged || windowLightChanged || badgeChanged || monitorChanged)
          present();
        frame = requestAnimationFrame(draw);
        return;
      }
      lastVisualKey = visualKey;
      if (dirty) staticScene();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, foreground.width, foreground.height);
      ctx.drawImage(layer, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);
      const s = size(),
        en = state.current.language === "en";
      hit = [];
      worldPass++;
      monitors.begin(dpr, pan, zoom);
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
          draw: () => {
            sprite("desk", p, person ? 1 : 0.65);
            if (images.desk) {
              const meta = atlas.sprites.desk,
                scale = (PX * Math.SQRT2) / atlas.projection.pixelsPerMeter;
              const plane = screenPlane(p, scale, meta.anchor);
              darkScreen(ctx, plane);
              monitors.plane(plane);
              if (person?.working) monitors.plane(plane, i);
            }
          },
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
              if (images.chair) {
                chairFront(p);
                if (monitors.surfaces.length) chairFront(p, monitors.ctx);
              }
            },
          });
        }
      });
      objects.sort((a, b) => a.depth - b.depth).forEach((o) => o.draw());
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (interiorShade > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = `rgba(12,24,34,${interiorShade})`;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }
      // Readable wall hardware and UI stay above the ambient room shading.
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);
      drawWallClock(ctx, iso, state.current.visualTime.current.minute);
      drawWallSwitch(ctx, iso, state.current.lightsOn);
      ctx.restore();
      drawWallClock(monitors.ctx, iso, state.current.visualTime.current.minute);
      drawWallSwitch(monitors.ctx, iso, state.current.lightsOn);
      const overlay = drawOfficeOverlay(ctx, annotations, w, h, gearTime);
      overlayHits = overlay.hits;
      workingBadges = overlay.workingBadges;
      lastGearFrame = gearFrame;
      monitors.excludeUI(overlay.hits);
      monitors.finish();
      paintMonitors();
      if (loaded < requested) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#30554a";
        ctx.font = "14px system-ui";
        ctx.fillText(en ? "Loading office…" : "Đang mở văn phòng…", 20, h - 20);
      }
      present();
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
      layer.width = layer.height = 0;
      skyLayer.width = skyLayer.height = 0;
      foreground.width = foreground.height = 0;
      floorLayer.width = floorLayer.height = 0;
      windowLight.width = windowLight.height = 0;
      monitors.destroy();
    };
  }, []);
  const en = props.language === "en";
  const control = view ? switchBounds(view, iso) : null;
  return (
    <div className="office-canvas">
      <canvas
        ref={canvas}
        tabIndex={0}
        aria-label={
          en
            ? `Wall clock ${clockLabel(props.lightingMinute)}. Isometric office. Drag or use arrow keys to pan. Scroll or use plus and minus to zoom. Press 0 to fit. All actions are also available in navigation.`
            : `Đồng hồ treo tường ${clockLabel(props.lightingMinute)}. Văn phòng isometric. Kéo hoặc dùng phím mũi tên để di chuyển. Cuộn hoặc phím cộng, trừ để phóng. Phím 0 căn giữa. Mọi thao tác đều có trong menu.`
        }
      />
      {control?.visible && (
        <button
          className="wall-light-switch"
          aria-label={en ? "Office light switch" : "Công tắc đèn văn phòng"}
          aria-pressed={props.lightsOn}
          title={
            props.lightsOn
              ? en
                ? "Turn office lights off"
                : "Tắt đèn văn phòng"
              : en
                ? "Turn office lights on"
                : "Bật đèn văn phòng"
          }
          style={{
            left: control.x,
            top: control.y,
            width: control.width,
            height: control.height,
          }}
          onClick={props.onToggleLights}
        >
          <span
            aria-hidden="true"
            className="wall-switch-focus"
            style={{
              left: control.face.x,
              top: control.face.y,
              width: control.face.width,
              height: control.face.height,
            }}
          />
        </button>
      )}
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
