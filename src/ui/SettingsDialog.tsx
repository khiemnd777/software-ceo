import { useEffect, useRef } from "react";
import type { Locale } from "../simulation/types";
import { audioPlayer } from "../audio/player";
export interface AudioSettings {
  music: boolean;
  sfx: boolean;
  volume: number;
}
export function SettingsDialog({
  locale,
  scale,
  motion,
  audio,
  setScale,
  setMotion,
  setAudio,
  onClose,
  onMenu,
}: {
  locale: Locale;
  scale: number;
  motion: boolean;
  audio: AudioSettings;
  setScale: (n: number) => void;
  setMotion: (v: boolean) => void;
  setAudio: (v: AudioSettings) => void;
  onClose: () => void;
  onMenu?: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current!;
    el.showModal();
    return () => el.close();
  }, []);
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      className="settings-dialog"
      aria-labelledby="settings-title"
    >
      <span className="eyebrow">
        {l("CHƠI THEO CÁCH CỦA BẠN", "MAKE YOURSELF AT HOME")}
      </span>
      <h2 id="settings-title">{l("Cài đặt", "Settings")}</h2>
      <label>
        {l("Cỡ giao diện", "UI size")}
        <select
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
        >
          <option value={100}>100%</option>
          <option value={125}>125%</option>
          <option value={150}>150%</option>
        </select>
      </label>
      <label className="check-label">
        <input
          type="checkbox"
          checked={motion}
          onChange={(e) => setMotion(e.target.checked)}
        />
        {l("Giảm chuyển động", "Reduce motion")}
      </label>
      <label className="check-label">
        <input
          type="checkbox"
          checked={audio.music}
          onChange={(e) => {
            audioPlayer.unlock();
            setAudio({ ...audio, music: e.target.checked });
          }}
        />
        {l("Nhạc nền · Studio Hours", "Music · Studio Hours")}
      </label>
      <label className="check-label">
        <input
          type="checkbox"
          checked={audio.sfx}
          onChange={(e) => {
            audioPlayer.unlock();
            setAudio({ ...audio, sfx: e.target.checked });
          }}
        />
        {l("Hiệu ứng âm thanh", "Sound effects")}
      </label>
      <label>
        {l("Âm lượng", "Volume")} · {Math.round(audio.volume * 100)}%
        <input
          type="range"
          aria-label={l("Âm lượng", "Volume")}
          min={0}
          max={1}
          step={0.05}
          value={audio.volume}
          onChange={(e) =>
            setAudio({ ...audio, volume: Number(e.target.value) })
          }
        />
      </label>
      <p>
        {l(
          "Âm thanh tự dừng khi chuyển tab. Nhạc và hiệu ứng được sáng tác riêng cho game.",
          "Audio pauses when the tab is hidden. Music and sound effects were authored for the game.",
        )}
      </p>
      <div className="button-row">
        <button className="primary" autoFocus onClick={onClose}>
          {l("Đóng", "Close")}
        </button>
        {onMenu && (
          <button onClick={onMenu}>{l("Về menu chính", "Main menu")}</button>
        )}
      </div>
    </dialog>
  );
}
export function AboutDialog({
  locale,
  onClose,
}: {
  locale: Locale;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current!;
    el.showModal();
    return () => el.close();
  }, []);
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      className="about-dialog"
      aria-labelledby="about-title"
    >
      <span className="eyebrow">BUILD · SHIP · SURVIVE</span>
      <h2 id="about-title">Software CEO</h2>
      <p>
        {l(
          "Bạn điều hành công ty bằng ba lượt CEO mỗi tuần. Phân công nhân viên và thời gian mô phỏng không tốn lượt. Nhịp chuẩn: 5 giây thực cho một ngày game.",
          "Lead your company with three CEO actions per week. Assignments and advancing time do not spend actions. At normal speed, five seconds advance one game day.",
        )}
      </p>
      <h3>{l("Điều khiển", "Controls")}</h3>
      <p>
        {l(
          "Space: chạy / tạm dừng. Canvas: kéo hoặc phím mũi tên để di chuyển; cuộn hoặc +/− để thu phóng; 0 căn giữa. Tab và Enter dùng được với mọi nút quản lý. Escape đóng hộp thoại.",
          "Space: play / pause. Canvas: drag or arrow keys to pan; scroll or +/− to zoom; 0 fits the room. Tab and Enter reach all management actions. Escape closes dialogs.",
        )}
      </p>
      <h3>{l("Ghi công & nguồn gốc", "Credits & provenance")}</h3>
      <p>
        {l(
          "Thiết kế: bộ GDD Software CEO do chủ dự án cung cấp. Hình ảnh: mô hình V4 đã được chủ dự án phê duyệt; khung hình động và nội thất mở rộng được dựng từ mã nguồn mô hình đó. Nhạc: Studio Hours, sáng tác gốc của dự án.",
          "Design: the owner-supplied Software CEO GDD. Art: the owner-approved V4 models; animation frames and additional furniture are authored from those model sources. Music: Studio Hours, an original project composition.",
        )}
      </p>
      <p>
        {l(
          "React, Vite và các phụ thuộc mã nguồn mở được ghi trong docs/LICENSES.md. Bản này chạy cục bộ, không tài khoản và không gửi dữ liệu chơi ra ngoài.",
          "React, Vite and open-source dependencies are listed in docs/LICENSES.md. This local build requires no account and sends no gameplay data to external services.",
        )}
      </p>
      <button className="primary" autoFocus onClick={onClose}>
        {l("Đóng", "Close")}
      </button>
    </dialog>
  );
}
