import type { Copy, Locale } from "../simulation/types";
export const money = (value: number, locale: Locale = "vi", compact = false) =>
  new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    ...(compact ? { notation: "compact" as const } : {}),
  }).format(value / 100);
export const text = (c: Copy, locale: Locale) => c[locale];
export function Meter({
  value,
  label,
  max = 100,
  tone = "green",
}: {
  value: number;
  label: string;
  max?: number;
  tone?: string;
}) {
  return (
    <div
      className={`meter ${tone}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(max, Math.max(0, value))}
    >
      <span
        style={{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }}
      />
    </div>
  );
}
export function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    office: "M3 21V7l9-4 9 4v14M8 21v-5h8v5M7 8v3m5-5v5m5-3v3",
    work: "M4 4h16v16H4zM9 4v16M15 4v16M6 8h1m4 4h2m4-4h1",
    people:
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
    market: "M3 21V3M3 17l6-6 4 3 8-10M16 4h5v5",
    finance: "M12 3v18M17 6H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H6",
    strategy: "M4 21V3M4 4c5-5 10 5 16 0v10c-6 5-11-5-16 0",
    save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2M7 3v6h10V3M7 21v-8h10v8",
    settings:
      "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2",
    inbox: "M3 3h18v18H3zM3 13h5l2 3h4l2-3h5",
    arrow: "M5 12h14m-6-6 6 6-6 6",
    close: "M6 6l12 12M6 18 18 6",
    play: "m7 4 14 8-14 8z",
    pause: "M8 4v16M16 4v16",
    check: "m5 12 4 4L19 6",
    star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z",
    bolt: "m13 2-9 12h7l-1 8 10-13h-7l1-7Z",
    help: "M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4m.1 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    clock: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M12 6v6l4 2",
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] ?? paths.office} />
    </svg>
  );
}
