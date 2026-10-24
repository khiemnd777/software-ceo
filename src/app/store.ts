import type { State, Command, NewGameOptions, Copy } from "../simulation/types";
import { createGame } from "../simulation/create";
import { transition } from "../simulation/engine";
export interface AppSnapshot {
  game: State | null;
  speed: 0 | 1 | 2 | 4;
  toast: Copy | null;
  revision: number;
}
export class GameStore {
  private listeners = new Set<() => void>();
  private snapshot: AppSnapshot = {
    game: null,
    speed: 0,
    toast: null,
    revision: 0,
  };
  private accumulator = 0;
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
  newGame(o: NewGameOptions) {
    this.accumulator = 0;
    this.emit({ game: createGame(o), speed: 0, toast: null });
  }
  restore(game: State) {
    this.accumulator = 0;
    this.emit({ game, speed: 0, toast: null });
  }
  setSpeed(speed: 0 | 1 | 2 | 4) {
    this.accumulator = 0;
    this.emit({ speed });
  }
  notify(toast: Copy | null) {
    this.emit({ toast });
  }
  dispatch(c: Command) {
    if (!this.snapshot.game) return false;
    const r = transition(this.snapshot.game, c);
    this.emit({
      game: r.state,
      toast: r.error ?? null,
      ...(r.critical ? { speed: 0 as const } : {}),
    });
    return r.ok;
  }
  advance(ms: number) {
    if (
      !this.snapshot.speed ||
      !this.snapshot.game ||
      this.snapshot.game.status !== "playing"
    )
      return;
    this.accumulator += Math.min(ms, 1000) * this.snapshot.speed;
    if (this.accumulator >= 5000) {
      this.accumulator -= 5000;
      this.dispatch({ type: "tick" });
    }
  }
}
export const store = new GameStore();
