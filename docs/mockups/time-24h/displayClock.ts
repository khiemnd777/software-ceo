import { RULES, timeLabel } from "./model";

// Quantize the readout only. The sky keeps the original continuous minute.
export const clockMinute = (minute: number) =>
  Math.floor(minute / RULES.stepMinutes) * RULES.stepMinutes;
export const clockLabel = (minute: number) => timeLabel(clockMinute(minute));
