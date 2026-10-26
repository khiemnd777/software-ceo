import type { Copy, State, HistoryItem } from "./types";
import { copy } from "../content/catalog";
export const clamp = (v: number, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, v));
export const round = (v: number) => Math.round(v * 1000) / 1000;
export const month = (s: State) => Math.floor((s.day - 1) / 30);
export const week = (s: State) => Math.floor((s.day - 1) / 7) + 1;
export function rng(s: State): number {
  let t = (s.rng += 0x6d2b79f5);
  s.rng >>>= 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const uid = (s: State, prefix: string) => `${prefix}-${s.nextId++}`;
export class RuleError extends Error {
  copy: Copy;
  constructor(vi: string, en: string) {
    super(en);
    this.copy = copy(vi, en);
  }
}
export function need(
  condition: unknown,
  vi: string,
  en: string,
): asserts condition {
  if (!condition) throw new RuleError(vi, en);
}
export function action(s: State, n = 1) {
  need(
    s.actions >= n,
    "Hết lượt CEO trong tuần. Chờ tuần mới hoặc dùng lượt khẩn cấp khi có khủng hoảng.",
    "No CEO actions left. Wait for next week, or use an emergency action during a crisis.",
  );
  s.actions -= n;
}
export function log(
  s: State,
  type: HistoryItem["type"],
  title: Copy,
  body: Copy,
  cause = "system",
) {
  s.history.push({ id: uid(s, "h"), day: s.day, type, title, body, cause });
  if (s.history.length > 500) s.history.shift();
}
export const stat = (s: State, field: "reputation", delta: number) => {
  s[field] = clamp(s[field] + delta);
};
export const mean = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
