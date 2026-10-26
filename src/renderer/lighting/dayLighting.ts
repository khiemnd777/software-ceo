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
