import type { State, Command, NewGameOptions, Copy } from "../simulation/types";
import { createGame } from "../simulation/create";
import { transition } from "../simulation/engine";
export interface AppSnapshot {
  game: State | null;
  speed: 0 | 1 | 2 | 4;
  daySeconds: 24 | 60 | 120;
  toast: Copy | null;
  revision: number;
}
export class GameStore {
  private listeners = new Set<() => void>();
  private snapshot: AppSnapshot = {
    game: null,
    speed: 0,
    daySeconds: 60,
    toast: null,
    revision: 0,
  };
  // Normalized game minutes, retained across Pause/speed changes.
  private accumulator = 0;
  readonly visualTime = { current: { minute: 540, weatherSeconds: 0 } };
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getSnapshot = () => this.snapshot;
  private emit(patch: Partial<AppSnapshot>) {
    this.snapshot = {
      ...this.snapshot,
      ...patch,
      revision: this.snapshot.revision + 1,
    };
    this.listeners.forEach((fn) => fn());
  }
  private project() {
    const s = this.snapshot.game;
    if (s)
      this.visualTime.current.minute =
        (s.day - 1) * 1440 +
        s.clock.minute +
        Math.min(15 - 1e-8, this.accumulator);
  }
  newGame(o: NewGameOptions) {
    this.accumulator = 0;
    this.emit({ game: createGame(o), speed: 0, toast: null });
    this.visualTime.current.weatherSeconds = 0;
    this.project();
  }
  restore(game: State) {
    this.accumulator = 0;
    this.emit({ game, speed: 0, toast: null });
    this.visualTime.current.weatherSeconds = 0;
    this.project();
  }
  setSpeed(speed: 0 | 1 | 2 | 4) {
    this.emit({ speed });
    this.project();
  }
  setDaySeconds(value: 24 | 60 | 120) {
    this.emit({ daySeconds: value });
  }
  notify(toast: Copy | null) {
    this.emit({ toast });
  }
  dispatch(c: Command) {
    if (!this.snapshot.game) return false;
    const r = transition(this.snapshot.game, c);
    if (c.type === "advanceTime" || c.type === "tick") this.accumulator = 0;
    this.emit({
      game: r.state,
      toast: r.error ?? null,
      ...(r.critical ? { speed: 0 as const } : {}),
    });
    this.project();
    return r.ok;
  }
  advance(ms: number) {
    if (
      !this.snapshot.speed ||
      !this.snapshot.game ||
      this.snapshot.game.status !== "playing"
    )
      return;
    if (!Number.isFinite(ms) || ms < 0 || ms > 1000) {
      this.setSpeed(0);
      return;
    }
    this.visualTime.current.weatherSeconds += ms / 1000;
    this.accumulator +=
      ((ms * 1440) / (this.snapshot.daySeconds * 1000)) * this.snapshot.speed;
    const steps = Math.floor((this.accumulator + 1e-8) / 15);
    if (steps > 0) {
      const r = transition(this.snapshot.game, { type: "advanceTime", steps });
      this.accumulator =
        r.ok && !r.critical
          ? Math.max(0, this.accumulator - (r.steps ?? 0) * 15)
          : 0;
      this.emit({
        game: r.state,
        toast: r.error ?? null,
        ...(r.critical ? { speed: 0 as const } : {}),
      });
    }
    this.project();
  }
}
export const store = new GameStore();
