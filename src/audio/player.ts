import { assetURL } from "../app/assets";
/** Audio starts only after a user gesture and never changes simulation state. */
class AudioPlayer {
  private music: HTMLAudioElement | null = null;
  private cues = new Map<string, HTMLAudioElement>();
  private musicEnabled = false;
  private sfxEnabled = false;
  private volume = 0.3;
  private unlocked = false;
  private lastCue = 0;
  unlock() {
    this.unlocked = true;
    this.updatePlayback();
  }
  configure(music: boolean, sfx: boolean, volume: number) {
    this.musicEnabled = music;
    this.sfxEnabled = sfx;
    if (!sfx) for (const cue of this.cues.values()) cue.pause();
    this.volume = volume;
    this.updatePlayback();
  }
  private updatePlayback() {
    if (typeof Audio === "undefined") return;
    if (!this.unlocked || !this.musicEnabled || document.hidden) {
      this.music?.pause();
      return;
    }
    if (!this.music) {
      this.music = new Audio(assetURL("audio/studio-hours.mp3"));
      this.music.loop = true;
      this.music.preload = "none";
    }
    this.music.volume = this.volume * 0.55;
    void this.music.play().catch(() => {
      /* The next user gesture retries a blocked autoplay. */
    });
  }
  visibility() {
    this.updatePlayback();
    if (document.hidden) for (const cue of this.cues.values()) cue.pause();
  }
  cue(name: "click" | "decision" | "cash" | "release" | "alert") {
    if (!this.sfxEnabled || !this.unlocked || document.hidden) return;
    const now = performance.now();
    if (now - this.lastCue < 65) return;
    this.lastCue = now;
    let cue = this.cues.get(name);
    if (!cue) {
      cue = new Audio(assetURL(`audio/${name}.mp3`));
      this.cues.set(name, cue);
    }
    cue.currentTime = 0;
    cue.volume = this.volume;
    void cue.play().catch(() => {});
  }
}
export const audioPlayer = new AudioPlayer();
