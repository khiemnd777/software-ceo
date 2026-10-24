import type { Locale } from "../simulation/types";
export interface Settings {
  locale: Locale;
  scale: number;
  reducedMotion: boolean;
  music: boolean;
  sfx: boolean;
  volume: number;
}
const defaults: Settings = {
  locale: "vi",
  scale: 100,
  reducedMotion:
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  music: false,
  sfx: false,
  volume: 0.3,
};
export function readSettings(): Settings {
  try {
    const value = JSON.parse(
      localStorage.getItem("software-ceo-settings") ?? "null",
    );
    if (!value || typeof value !== "object") return defaults;
    return {
      locale: value.locale === "en" ? "en" : "vi",
      scale: [100, 125, 150].includes(value.scale) ? value.scale : 100,
      reducedMotion:
        typeof value.reducedMotion === "boolean"
          ? value.reducedMotion
          : defaults.reducedMotion,
      music: value.music === true,
      sfx: value.sfx === true,
      volume:
        typeof value.volume === "number"
          ? Math.max(0, Math.min(1, value.volume))
          : 0.3,
    };
  } catch {
    return defaults;
  }
}
export function writeSettings(settings: Settings) {
  try {
    localStorage.setItem("software-ceo-settings", JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}
