export const STEP_MINUTES = 15;
export const STEPS_PER_DAY = 96;
export const DEFAULT_DAY_SECONDS = 60;
export type ShiftPhase = "rest" | "work" | "lunch" | "overtime";
export interface ClockState {
  minute: number;
  opened: boolean;
  lastClosedDay: number;
}
export const phaseAt = (minute: number): ShiftPhase => {
  const m = ((minute % 1440) + 1440) % 1440;
  if ((m >= 540 && m < 720) || (m >= 780 && m < 1080)) return "work";
  if (m >= 720 && m < 780) return "lunch";
  if (m >= 1080 && m < 1200) return "overtime";
  return "rest";
};
export const clockLabel = (minute: number) => {
  const m = (((Math.floor(minute / 15) * 15) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
export const nextWorkSteps = (minute: number) =>
  Math.max(
    1,
    Math.ceil(
      ((minute < 540 ? 540 : minute < 780 && minute >= 720 ? 780 : 1980) -
        minute) /
        15,
    ),
  );
