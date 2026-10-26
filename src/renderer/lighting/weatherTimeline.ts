import type { Weather } from "./outdoorWeather";
export function weatherForDay(seed: number, day: number): Weather {
  let n = Math.imul((seed >>> 0) ^ Math.imul(day + 1, 374761393), 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n = (n ^ (n >>> 16)) >>> 0;
  return (
    [
      "sunny",
      "sunny",
      "sunny",
      "cloudy",
      "cloudy",
      "rain",
      "wind",
      "rain-wind",
    ] as Weather[]
  )[n % 8];
}
export function weatherBlend(seed: number, minute: number) {
  const day = Math.floor(minute / 1440),
    m = ((minute % 1440) + 1440) % 1440;
  const t = Math.min(1, m / 60),
    alpha = t * t * (3 - 2 * t);
  const to = weatherForDay(seed, day);
  return { from: alpha >= 1 ? to : weatherForDay(seed, day - 1), to, alpha };
}
