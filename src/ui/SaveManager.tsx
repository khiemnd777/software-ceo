import { useLayoutEffect, useRef, useState } from "react";
import type { Locale, State } from "../simulation/types";
import {
  listSaves,
  listLegacyBackups,
  type LegacyBackup,
  loadSave,
  saveGame,
  encodeSave,
  decodeSave,
  SaveError,
  type SavedRow,
  type Slot,
} from "../persistence/saves";
export function SaveManager({
  game,
  locale,
  onClose,
  onLoad,
}: {
  game: State | null;
  locale: Locale;
  onClose: () => void;
  onLoad: (s: State) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    file = useRef<HTMLInputElement>(null);
  const [backups, setBackups] = useState<LegacyBackup[]>([]);
  const [rows, setRows] = useState<SavedRow[]>([]),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [overwrite, setOverwrite] = useState<Slot | null>(null);
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  const error = (e: unknown) => {
    setMessage(
      e instanceof SaveError && e.code === "conflict"
        ? l(
            "Slot này đã thay đổi ở tab khác. Danh sách được tải lại; hãy xem thời điểm lưu trước khi ghi đè.",
            "This slot changed in another tab. The list is refreshed; review its timestamp before overwriting.",
          )
        : e instanceof SaveError && e.code === "future"
          ? l(
              "Bản lưu này cần phiên bản game mới hơn. Công ty hiện tại vẫn nguyên vẹn.",
              "This save requires a newer game version. Your current company is unchanged.",
            )
          : e instanceof SaveError && e.code === "corrupt"
            ? l(
                "Bản lưu bị hỏng hoặc không hợp lệ. Hãy giữ file gốc và thử bản sao khác. Công ty hiện tại vẫn nguyên vẹn.",
                "The save is corrupt or invalid. Keep the original and try another backup. Your current company is unchanged.",
              )
            : l(
                "Trình duyệt không cho phép lưu hoặc đã đầy. Hãy xuất JSON để bảo vệ tiến trình.",
                "Storage is unavailable or full. Export JSON to protect your progress.",
              ),
    );
  };
  const refresh = () =>
    Promise.all([listSaves(), listLegacyBackups()])
      .then(([rows, backups]) => {
        setRows(rows);
        setBackups(backups);
      })
      .catch(error);
  useLayoutEffect(() => {
    const element = ref.current!;
    element.showModal();
    void refresh();
    // Close before React detaches the dialog; the browser must release top-layer references.
    return () => element.close();
  }, []);
  const write = async (slot: Slot) => {
    if (!game) return;
    setBusy(true);
    try {
      const row = rows.find((r) => r.slot === slot);
      const result = await saveGame(slot, game, row?.revision ?? null);
      setRows((prev) => [...prev.filter((r) => r.slot !== slot), result]);
      setMessage(l("Đã lưu công ty.", "Company saved."));
      setOverwrite(null);
      void refresh();
    } catch (e) {
      error(e);
      void refresh();
    } finally {
      setBusy(false);
    }
  };
  const load = async (slot: Slot) => {
    setBusy(true);
    try {
      const state = await loadSave(slot);
      onLoad(state);
      onClose();
    } catch (e) {
      error(e);
    } finally {
      setBusy(false);
    }
  };
  const exportJSON = async () => {
    if (!game) return;
    setBusy(true);
    try {
      const raw = await encodeSave(game),
        url = URL.createObjectURL(
          new Blob([raw], { type: "application/json" }),
        ),
        a = document.createElement("a");
      a.href = url;
      a.download = `Software_CEO_${game.name.replace(/[^a-zA-Z0-9_-]+/g, "_")}_day${game.day}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setMessage(l("Đã xuất bản sao JSON.", "JSON backup exported."));
    } catch (e) {
      error(e);
    } finally {
      setBusy(false);
    }
  };
  const importJSON = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    try {
      if (f.size > 10 * 1024 * 1024)
        throw new SaveError("corrupt", "File too large");
      const state = await decodeSave(await f.text());
      onLoad(state);
      setMessage(
        l(
          "Đã phục hồi bản lưu. Lưu vào slot để giữ bản nhập trên trình duyệt này.",
          "Save restored. Save it into a slot to keep this import in this browser.",
        ),
      );
    } catch (e) {
      error(e);
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  };
  return (
    <dialog
      className="save-dialog"
      ref={ref}
      onCancel={onClose}
      aria-labelledby="save-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {l("GIỮ LẠI HÀNH TRÌNH CÔNG TY", "YOUR COMPANY, KEPT SAFE")}
          </span>
          <h2 id="save-title">{l("Lưu & tiếp tục", "Save & continue")}</h2>
        </div>
        <button
          onClick={onClose}
          aria-label={l("Đóng cửa sổ lưu", "Close saves")}
        >
          ×
        </button>
      </div>
      <p>
        {l(
          "Bản lưu nằm trong trình duyệt này. Xóa dữ liệu website có thể xóa bản lưu. Xuất JSON để chuyển máy hoặc giữ bản sao.",
          "Saves belong to this browser. Clearing site data can remove them. Export JSON to move devices or keep a backup.",
        )}
      </p>
      {(["1", "2", "3", "auto"] as Slot[]).map((slot) => {
        const row = rows.find((r) => r.slot === slot);
        return (
          <div className="save-slot" key={slot}>
            <div>
              <span className="tag">
                {slot === "auto"
                  ? l("TỰ ĐỘNG / MỖI TUẦN", "AUTOSAVE / WEEKLY")
                  : `SLOT ${slot}`}
              </span>
              <strong>{row?.name ?? l("Ô trống", "Empty slot")}</strong>
              <small>
                {row
                  ? `${l("Ngày", "Day")} ${row.day} · ${row.strategy} · ${new Date(row.savedAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}`
                  : l("Chưa có bản lưu", "No save yet")}
              </small>
            </div>
            <div className="button-row">
              {slot !== "auto" && game && (
                <button
                  disabled={busy}
                  onClick={() => (row ? setOverwrite(slot) : void write(slot))}
                >
                  {l("Lưu", "Save")}
                </button>
              )}
              <button
                className="primary"
                disabled={busy || !row}
                onClick={() => void load(slot)}
              >
                {l("Tải", "Load")}
              </button>
            </div>
          </div>
        );
      })}
      {backups.length > 0 && (
        <details className="legacy-backups">
          <summary>
            {l("Bản sao giữ trước nâng cấp", "Backups kept before upgrade")}
          </summary>
          <p>
            {l(
              "Xuất file gốc để dùng với bản game cũ. Bản sao này không bị ghi đè bởi lần lưu hiện tại.",
              "Export the original file for the previous game version. Current saves do not overwrite these backups.",
            )}
          </p>
          {backups.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                const url = URL.createObjectURL(
                  new Blob([b.payload], { type: "application/json" }),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = `Software_CEO_legacy_${b.slot}_${b.revision}.json`;
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 5000);
              }}
            >
              {l("Xuất bản gốc", "Export original")} {b.slot} · r{b.revision}
            </button>
          ))}
        </details>
      )}
      {overwrite && (
        <div className="forecast-box">
          <strong>
            {l(`Ghi đè Slot ${overwrite}?`, `Overwrite Slot ${overwrite}?`)}
          </strong>
          <p>
            {l(
              "Bản cũ sẽ được thay thế. Bạn có thể xuất JSON trước.",
              "The existing save will be replaced. You can export JSON first.",
            )}
          </p>
          <div className="button-row">
            <button onClick={() => setOverwrite(null)}>
              {l("Hủy", "Cancel")}
            </button>
            <button
              className="primary"
              disabled={busy}
              onClick={() => void write(overwrite)}
            >
              {l("Xác nhận ghi đè", "Confirm overwrite")}
            </button>
          </div>
        </div>
      )}
      <div className="button-row">
        <button disabled={busy || !game} onClick={() => void exportJSON()}>
          {l("Xuất JSON", "Export JSON")}
        </button>
        <button disabled={busy} onClick={() => file.current?.click()}>
          {l("Nhập JSON", "Import JSON")}
        </button>
        <button disabled={busy} onClick={() => void refresh()}>
          {l("Làm mới danh sách", "Refresh list")}
        </button>
      </div>
      <input
        type="file"
        ref={file}
        accept=".json,application/json"
        hidden
        onChange={(e) => void importJSON(e.target.files?.[0])}
      />
      {message && (
        <p className="save-message" role="status">
          {message}
        </p>
      )}
    </dialog>
  );
}
