// Proposed experiment only. No game state, business RNG, commands or storage.
export const RULES = {
  stepMinutes: 15,
  durationMinutes: 2880,
  projectWP: 4,
  baseWPPerWeek: 6,
  proposedWeekHours: 40,
  skill: 3,
  initialEnergy: 80,
  initialMorale: 75,
  regularEnergyPerHour: -2.5,
  overtimeEnergyPerHour: -5,
  lunchEnergyPerHour: 2,
  restEnergyPerHour: 1.2,
  overtimeMoralePerHour: -0.5,
  lunchMoralePerHour: 0.05,
  eveningMoralePerHour: 0.03,
  overtimeOutputFactor: 0.8,
  regularHourlyCents: 2000,
  overtimeHourlyCents: 3000,
  overheadHourlyCents: 100,
} as const;
export const SCHEDULE = {
  workWindows: [
    [540, 720],
    [780, 1080],
  ],
  lunch: [720, 780],
  overtime: [1080, 1200],
} as const;
export type Scenario = "regular" | "overtime";
export type Phase = "work" | "lunch" | "overtime" | "rest";
export interface Worker {
  energy: number;
  morale: number;
  work: number;
  regularWork: number;
  overtimeWork: number;
  regularMinutes: number;
  overtimeMinutes: number;
  laborCents: number;
  overheadCents: number;
}
export interface Frame {
  minute: number;
  regular: Worker;
  overtime: Worker;
}
const clamp = (n: number) => Math.max(0, Math.min(100, n));
export const phaseAt = (minute: number, scenario: Scenario): Phase => {
  const time = minute % 1440;
  if (SCHEDULE.workWindows.some(([start, end]) => time >= start && time < end))
    return "work";
  if (time >= SCHEDULE.lunch[0] && time < SCHEDULE.lunch[1]) return "lunch";
  if (
    scenario === "overtime" &&
    time >= SCHEDULE.overtime[0] &&
    time < SCHEDULE.overtime[1]
  )
    return "overtime";
  return "rest";
};
export const phaseLabel: Record<Phase, string> = {
  work: "Đang làm việc",
  lunch: "Nghỉ trưa",
  overtime: "Đang tăng ca",
  rest: "Đã tan ca / nghỉ ngoài giờ",
};
export const timeLabel = (minute: number) => {
  const value = Math.floor(minute) % 1440;
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
};
export const dayLabel = (minute: number) =>
  minute >= RULES.durationMinutes
    ? "Kết thúc ngày 2"
    : `Ngày ${Math.floor(minute / 1440) + 1}`;
export const totalCost = (worker: Worker) =>
  worker.laborCents + worker.overheadCents;
export const hourlyWP = (worker: Worker) =>
  (RULES.baseWPPerWeek *
    (0.7 + 0.12 * RULES.skill) *
    (0.8 + 0.004 * worker.morale) *
    (0.65 + 0.0035 * worker.energy)) /
  RULES.proposedWeekHours;
const initial = (): Worker => ({
  energy: RULES.initialEnergy,
  morale: RULES.initialMorale,
  work: 0,
  regularWork: 0,
  overtimeWork: 0,
  regularMinutes: 0,
  overtimeMinutes: 0,
  laborCents: 0,
  overheadCents: 0,
});
function step(worker: Worker, minute: number, scenario: Scenario): Worker {
  const next = { ...worker };
  const phase = phaseAt(minute, scenario);
  const hours = RULES.stepMinutes / 60;
  if (phase === "work" || phase === "overtime") {
    const overtime = phase === "overtime";
    const amount = Math.min(
      RULES.projectWP - worker.work,
      hourlyWP(worker) * hours * (overtime ? RULES.overtimeOutputFactor : 1),
    );
    next.work += amount;
    if (overtime) {
      next.overtimeWork += amount;
      next.overtimeMinutes += RULES.stepMinutes;
    } else {
      next.regularWork += amount;
      next.regularMinutes += RULES.stepMinutes;
    }
    next.energy = clamp(
      worker.energy +
        hours *
          (overtime ? RULES.overtimeEnergyPerHour : RULES.regularEnergyPerHour),
    );
    next.morale = clamp(
      worker.morale + (overtime ? RULES.overtimeMoralePerHour * hours : 0),
    );
    next.laborCents += Math.round(
      hours * (overtime ? RULES.overtimeHourlyCents : RULES.regularHourlyCents),
    );
  } else {
    next.energy = clamp(
      worker.energy +
        hours *
          (phase === "lunch"
            ? RULES.lunchEnergyPerHour
            : RULES.restEnergyPerHour),
    );
    const hour = (minute % 1440) / 60;
    // Sleep restores energy, not an immediate reset of dissatisfaction.
    next.morale = clamp(
      worker.morale +
        hours *
          (phase === "lunch"
            ? RULES.lunchMoralePerHour
            : hour >= 17 && hour < 22
              ? RULES.eveningMoralePerHour
              : 0),
    );
  }
  next.overheadCents += Math.round(RULES.overheadHourlyCents * hours);
  return next;
}
export function buildTimeline(): Frame[] {
  const frames: Frame[] = [
    { minute: 0, regular: initial(), overtime: initial() },
  ];
  for (
    let minute = 0;
    minute < RULES.durationMinutes;
    minute += RULES.stepMinutes
  ) {
    const previous = frames[frames.length - 1];
    frames.push({
      minute: minute + RULES.stepMinutes,
      regular: step(previous.regular, minute, "regular"),
      overtime: step(previous.overtime, minute, "overtime"),
    });
  }
  return frames;
}
export const MILESTONES = [
  0,
  ...[0, 1440].flatMap((day) =>
    [
      SCHEDULE.workWindows[0][0],
      SCHEDULE.lunch[0],
      SCHEDULE.lunch[1],
      SCHEDULE.overtime[0],
      SCHEDULE.overtime[1],
      1440,
    ].map((minute) => day + minute),
  ),
];
export function lighting(minute: number) {
  const hour = (minute % 1440) / 60;
  const keys = [
    [0, 0.32, 0],
    [5, 0.32, 0],
    [7, 0, 0.1],
    [9, 0, 0],
    [16, 0, 0],
    [17, 0.04, 0.2],
    [19, 0.3, 0.04],
    [22, 0.32, 0],
    [24, 0.32, 0],
  ];
  const right = keys.findIndex((key, index) => index > 0 && key[0] >= hour);
  const a = keys[Math.max(0, right - 1)],
    b = keys[Math.max(1, right)];
  const t = (hour - a[0]) / (b[0] - a[0]);
  return {
    dark: a[1] + (b[1] - a[1]) * t,
    warm: a[2] + (b[2] - a[2]) * t,
    label:
      hour >= 5 && hour < 7
        ? "Bình minh"
        : hour >= 7 && hour < 17
          ? "Ban ngày"
          : hour >= 17 && hour < 19
            ? "Hoàng hôn"
            : "Ban đêm",
  };
}
