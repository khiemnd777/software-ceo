import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import type {
  Command,
  Copy,
  Difficulty,
  Locale,
  Strategy,
} from "../simulation/types";
import { copy } from "../content/catalog";
import { store } from "./store";
import { createWorkSession } from "../ui/workSession";
import { Office, type OfficePerson } from "../renderer/Office";
import { type PanelProps } from "../ui/Panels";
import { audioPlayer } from "../audio/player";

import {
  SettingsDialog,
  AboutDialog,
  type AudioSettings,
} from "../ui/SettingsDialog";
import { SaveManager } from "../ui/SaveManager";
import { readSettings, writeSettings } from "../persistence/settings";
import { listSaves, loadSave, saveGame, SaveError } from "../persistence/saves";
import { SimulateWorkspace } from "../ui/SimulateWorkspace";
import { CONCEPTS } from "../content/products";
import { campaignEvaluation } from "../gameplay/progression";
import { Icon } from "../ui/common";

export function App() {
  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const s = snap.game;
  const [workSession, setWorkSession] = useState(createWorkSession);
  const [uiSession, setUiSession] = useState(0);
  const [initialSettings] = useState(readSettings);
  const [locale, setLocale] = useState<Locale>(initialSettings.locale),
    [screen, setScreen] = useState<"menu" | "setup" | "game">("menu"),
    [view, setView] = useState("office"),
    [selected, setSelected] = useState("");
  const [company, setCompany] = useState("Evergreen Studio"),
    [strategy, setStrategy] = useState<Strategy>("outsourcing"),
    [difficulty, setDifficulty] = useState<Difficulty>("standard"),
    [seed, setSeed] = useState("21102026");
  const [concept, setConcept] = useState("retail"),
    [mode, setMode] = useState<
      "career" | "sandbox" | "rescue" | "deadline" | "fit"
    >("career");
  const [settings, setSettings] = useState(false),
    [motion, setMotion] = useState(initialSettings.reducedMotion),
    [scale, setScale] = useState(initialSettings.scale);
  const [audio, setAudio] = useState<AudioSettings>({
      music: initialSettings.music,
      sfx: initialSettings.sfx,
      volume: initialSettings.volume,
    }),
    [about, setAbout] = useState(false),
    [outcomeClosed, setOutcomeClosed] = useState(false);
  const [saves, setSaves] = useState(false),
    [hasSaves, setHasSaves] = useState(false);
  const autoRevision = useRef<number | null>(null),
    autoWeek = useRef(-1),
    saveQueue = useRef<Promise<unknown>>(Promise.resolve()),
    autoReady = useRef(false);
  const [confirm, setConfirm] = useState<{
    title: Copy;
    body: Copy;
    command: Command;
  } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const l = (vi: string, en: string) => (locale === "vi" ? vi : en);
  const dispatch = (c: Command) => {
    audioPlayer.unlock();
    const ok = store.dispatch(c);
    if (c.type !== "tick" && c.type !== "tutorial")
      audioPlayer.cue(
        ok
          ? c.type === "release"
            ? "release"
            : c.type === "decide"
              ? "decision"
              : "click"
          : "alert",
      );
    return ok;
  };
  const ask: PanelProps["confirm"] = (title, body, command) => {
    store.setSpeed(0);
    setConfirm({ title, body, command });
  };
  useEffect(() => {
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      store.advance(now - last);
      last = now;
    }, 100);
    const hidden = () => {
      last = performance.now();
      audioPlayer.visibility();
      if (document.hidden) {
        store.setSpeed(0);
        store.notify(
          copy(
            "Đã tạm dừng khi chuyển tab. Bấm Chạy để tiếp tục.",
            "Paused while the tab was hidden. Press Play to resume.",
          ),
        );
      }
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, []);
  useEffect(() => {
    writeSettings({ locale, scale, reducedMotion: motion, ...audio });
    audioPlayer.configure(audio.music, audio.sfx, audio.volume);
  }, [locale, scale, motion, audio]);
  useEffect(() => {
    const unlock = () => audioPlayer.unlock();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);
  useEffect(() => {
    if (!s) return;
    if (view === "history" && s.day >= 7 && !s.tutorial.seen.includes("review"))
      store.dispatch({ type: "tutorial", step: "review" });
    if (
      view === "finance" &&
      s.ledger.some(
        (e) => e.category === "collection" || e.category === "subscription",
      ) &&
      !s.tutorial.seen.includes("income")
    )
      store.dispatch({ type: "tutorial", step: "income" });
  }, [s, view]);
  useEffect(() => {
    void listSaves()
      .then((rows) => {
        setHasSaves(rows.length > 0);
        autoRevision.current =
          rows.find((r) => r.slot === "auto")?.revision ?? null;
        autoReady.current = true;
      })
      .catch(() => {
        autoReady.current = true;
      });
  }, []);
  useEffect(() => {
    if (!s || s.day === 0 || s.status !== "playing" || !autoReady.current)
      return;
    const wk = Math.floor(s.day / 7);
    if (wk === autoWeek.current || s.day % 7 !== 0) return;
    autoWeek.current = wk;
    const snapshot = s;
    saveQueue.current = saveQueue.current.then(async () => {
      try {
        const row = await saveGame("auto", snapshot, autoRevision.current);
        autoRevision.current = row.revision;
        setHasSaves(true);
      } catch (e) {
        store.notify(
          e instanceof SaveError && e.code === "conflict"
            ? copy(
                "Tự lưu bị dừng do bản lưu thay đổi ở tab khác. Hãy mở Lưu/Tải để xem và bảo vệ tiến trình.",
                "Autosave stopped because another tab changed the save. Open Save/Load to review and protect your progress.",
              )
            : copy(
                "Không tự lưu được. Hãy xuất JSON để giữ tiến trình.",
                "Autosave failed. Export JSON to protect your progress.",
              ),
        );
      }
    });
  }, [s]);
  const restoreGame = (state: NonNullable<typeof s>) => {
    store.restore(state);
    setWorkSession(createWorkSession());
    setUiSession((n) => n + 1);
    setSelected("");
    setOutcomeClosed(false);
    autoWeek.current = Math.floor(state.day / 7);
    setScreen("game");
    setView("office");
  };
  const continueSaved = async () => {
    try {
      const rows = await listSaves();
      const row = rows.sort((a, b) => b.savedAt.localeCompare(a.savedAt))[0];
      if (row) restoreGame(await loadSave(row.slot));
      else setSaves(true);
    } catch {
      setSaves(true);
    }
  };
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.uiScale = String(scale);
    document.documentElement.style.fontSize = `${(16 * scale) / 100}px`;
  }, [locale, scale]);
  useEffect(() => {
    if (confirm) dialog.current?.showModal();
    else dialog.current?.close();
  }, [confirm]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).matches("input,select,textarea,button") ||
        document.querySelector("dialog[open]")
      )
        return;
      if (e.code === "Space" && s && screen === "game") {
        e.preventDefault();
        store.setSpeed(snap.speed ? 0 : 1);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [s, screen, snap.speed]);
  const demo: OfficePerson[] = [
    {
      id: "menu-1",
      appearance: "male-trousers",
      name: "Minh",
      role: "developer",
      working: true,
      morale: 80,
      energy: 90,
    },
    {
      id: "menu-2",
      appearance: "female-trousers-short",
      name: "Linh",
      role: "qa",
      working: true,
      morale: 80,
      energy: 90,
    },
  ];
  const brand = (
    <div className="identity">
      <div className="brand">
        &lt;/&gt;<span>CEO</span>
      </div>
      <div>
        <strong>SOFTWARE CEO</strong>
        <p>BUILD · SHIP · SURVIVE</p>
      </div>
    </div>
  );
  if (screen !== "game" || !s)
    return (
      <main className={`menu ${screen === "setup" ? "menu-setup" : ""}`}>
        <header>
          {brand}
          <div className="header-end">
            <button
              className="ghost"
              onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
            >
              {locale === "vi" ? "EN" : "VI"}
            </button>
          </div>
        </header>
        <div className="menu-body">
          <div className="menu-copy">
            <span className="eyebrow">
              {l(
                "MỘT STUDIO. CÂU CHUYỆN CỦA BẠN.",
                "A SOFTWARE STUDIO. YOUR STORY.",
              )}
            </span>
            <h1>
              {l(
                "Xây một công ty.\nGiữ một lời hứa.",
                "Build a company.\nKeep a promise.",
              )}
            </h1>
            <p className="lead">
              {l(
                "Từ hai cộng sự đến một đội ngũ của riêng bạn. Tìm cơ hội, làm sản phẩm tốt và đưa công ty qua những lựa chọn khó.",
                "From two teammates to a studio of your own. Find opportunities, make good software and lead through the difficult choices.",
              )}
            </p>
            {screen === "menu" ? (
              <div className="menu-actions">
                <button
                  className="primary large"
                  onClick={() => setScreen("setup")}
                >
                  {l("Bắt đầu công ty mới", "Start a new company")}{" "}
                  <Icon name="arrow" />
                </button>
                {(s || hasSaves) && (
                  <button
                    onClick={() =>
                      s ? setScreen("game") : void continueSaved()
                    }
                  >
                    {l("Tiếp tục", "Continue")}
                  </button>
                )}
                <button onClick={() => setSaves(true)}>
                  {l("Tải bản lưu", "Load game")}
                </button>
                <button onClick={() => setSettings(true)}>
                  {l("Cài đặt", "Settings")}
                </button>
                <button onClick={() => setAbout(true)}>
                  {l("Cách chơi & Ghi công", "How to play & Credits")}
                </button>
                <p className="small">
                  {l(
                    "Chơi đơn · Lưu trên trình duyệt · Không cần tài khoản",
                    "Single player · Browser saves · No account needed",
                  )}
                </p>
              </div>
            ) : (
              <form
                className="setup-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setWorkSession(createWorkSession());
                  setUiSession((n) => n + 1);
                  setSelected("");
                  store.newGame({
                    name: company,
                    strategy,
                    difficulty,
                    seed: Number(seed),
                    concept,
                    mode,
                  });
                  autoWeek.current = -1;
                  setOutcomeClosed(false);
                  setScreen("game");
                  setView("office");
                }}
              >
                <label>
                  {l("Tên công ty", "Company name")}
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    maxLength={40}
                    required
                  />
                </label>
                <div className="form-row">
                  <label>
                    {l("Chiến lược", "Starting strategy")}
                    <select
                      aria-label={l("Chiến lược", "Starting strategy")}
                      disabled={["rescue", "deadline", "fit"].includes(mode)}
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value as Strategy)}
                    >
                      <option value="outsourcing">Outsourcing · $45,000</option>
                      <option value="product">Product · $70,000</option>
                      <option value="startup">Startup · $100,000</option>
                    </select>
                  </label>
                  <label>
                    {l("Độ khó", "Difficulty")}
                    <select
                      aria-label={l("Độ khó", "Difficulty")}
                      value={difficulty}
                      onChange={(e) =>
                        setDifficulty(e.target.value as Difficulty)
                      }
                    >
                      <option value="friendly">
                        {l("Dễ tiếp cận (+25% vốn)", "Friendly (+25% cash)")}
                      </option>
                      <option value="standard">
                        {l("Tiêu chuẩn", "Standard")}
                      </option>
                      <option value="tough">
                        {l("Thử thách (−15% vốn)", "Tough (−15% cash)")}
                      </option>
                    </select>
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    {l("Chế độ", "Game mode")}
                    <select
                      aria-label={l("Chế độ", "Game mode")}
                      value={mode}
                      onChange={(e) => {
                        const m = e.target.value as typeof mode;
                        setMode(m);
                        if (m === "rescue") setStrategy("startup");
                        else if (m === "deadline") setStrategy("outsourcing");
                        else if (m === "fit") setStrategy("product");
                      }}
                    >
                      <option value="career">
                        Campaign · 36 {l("tháng", "months")}
                      </option>
                      <option value="sandbox">Sandbox</option>
                      <option value="rescue">
                        {l(
                          "Cứu runway · Startup · 6 tháng",
                          "Runway rescue · Startup · 6 months",
                        )}
                      </option>
                      <option value="deadline">
                        {l(
                          "Chạy đua giao hàng · 6 tháng",
                          "Delivery relay · 6 months",
                        )}
                      </option>
                      <option value="fit">
                        {l(
                          "Tìm sự phù hợp · 12 tháng",
                          "Find the fit · 12 months",
                        )}
                      </option>
                    </select>
                  </label>
                  {strategy !== "outsourcing" && (
                    <label>
                      {l("Ý tưởng sản phẩm", "Product concept")}
                      <select
                        value={concept}
                        onChange={(e) => setConcept(e.target.value)}
                      >
                        {CONCEPTS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name[locale]}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                <p className="small">
                  {mode === "rescue"
                    ? l(
                        "Thử thách cứu công ty: $30.000 tiền mặt, 180 ngày. Cần kết thúc với ít nhất $20.000 và không nợ lương.",
                        "Rescue challenge: $30,000 cash and 180 days. Finish with at least $20,000 and no unpaid payroll.",
                      )
                    : strategy === "outsourcing"
                      ? l(
                          "Hai nhân viên. Hợp đồng $30.000. Giữ phạm vi, chất lượng và tiền về đúng lúc.",
                          "Two staff. A $30,000 contract. Protect scope, quality and collections.",
                        )
                      : strategy === "product"
                        ? l(
                            "Hai nhân viên. MVP đã có 35 khách trả $79/tháng. Cải thiện sản phẩm và giữ chân khách.",
                            "Two staff. A live MVP with 35 customers at $79/month. Improve fit and retention.",
                          )
                        : l(
                            "Hai nhân viên. Chưa có khách hàng. Tìm bằng chứng, tạo MVP và gọi vốn trước khi hết tiền.",
                            "Two staff. No customers yet. Validate, launch an MVP and fund the runway.",
                          )}
                </p>
                <label>
                  {l("Hạt giống thế giới", "World seed")}
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    required
                    min={0}
                    max={4294967295}
                  />
                </label>
                <div className="button-row">
                  <button type="button" onClick={() => setScreen("menu")}>
                    {l("Quay lại", "Back")}
                  </button>
                  <button className="primary large" type="submit">
                    {l("Mở cửa công ty", "Open your studio")}{" "}
                    <Icon name="arrow" />
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="menu-office">
            <Office
              people={demo}
              tier={1}
              companyName={screen === "setup" ? company : undefined}
              onSelect={() => setScreen("setup")}
              onNavigate={() => setScreen("setup")}
              reducedMotion={motion}
              language={locale}
            />
            <div className="menu-caption">
              <span>{l("01 / KHỞI ĐẦU", "01 / THE BEGINNING")}</span>
              <strong>
                {l(
                  "Một văn phòng nhỏ. Rất nhiều khả năng.",
                  "A small office. A world of possibility.",
                )}
              </strong>
            </div>
          </div>
        </div>
        <div className="menu-foot">
          {l(
            "Mỗi tuần là một lựa chọn. Mỗi lựa chọn để lại dấu vết.",
            "Every week brings a choice. Every choice leaves a trace.",
          )}
          <span>
            {l("SOFTWARE CEO · BẢN CỤC BỘ", "SOFTWARE CEO · LOCAL BUILD")}
          </span>
        </div>
        {saves && (
          <SaveManager
            game={s}
            locale={locale}
            onClose={() => setSaves(false)}
            onLoad={restoreGame}
          />
        )}{" "}
        {settings && (
          <SettingsDialog
            locale={locale}
            scale={scale}
            motion={motion}
            audio={audio}
            setScale={setScale}
            setMotion={setMotion}
            setAudio={setAudio}
            onClose={() => setSettings(false)}
          />
        )}{" "}
        {about && (
          <AboutDialog locale={locale} onClose={() => setAbout(false)} />
        )}
      </main>
    );
  const panel = {
    s,
    locale,
    dispatch,
    confirm: ask,
    navigate: setView,
    selected,
    select: setSelected,
    workSession,
    setWorkSession,
  };
  return (
    <div className="game-runtime">
      <SimulateWorkspace
        sessionKey={uiSession}
        panel={panel}
        speed={snap.speed}
        setSpeed={store.setSpeed.bind(store)}
        motion={motion}
        view={view}
        onViewChange={setView}
        onSave={() => {
          store.setSpeed(0);
          setSaves(true);
        }}
        onSettings={() => {
          store.setSpeed(0);
          setSettings(true);
        }}
        onLocale={() => setLocale(locale === "vi" ? "en" : "vi")}
      />
      {snap.toast && (
        <div className="toast" role="alert">
          <span>{snap.toast[locale]}</span>
          <button
            onClick={() => store.notify(null)}
            aria-label={l("Đóng thông báo", "Dismiss notification")}
          >
            ×
          </button>
        </div>
      )}
      {settings && (
        <SettingsDialog
          locale={locale}
          scale={scale}
          motion={motion}
          audio={audio}
          setScale={setScale}
          setMotion={setMotion}
          setAudio={setAudio}
          onClose={() => setSettings(false)}
          onMenu={() => {
            store.setSpeed(0);
            setScreen("menu");
            setSettings(false);
          }}
        />
      )}
      <dialog
        aria-labelledby="confirmation-title"
        ref={dialog}
        onCancel={() => setConfirm(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setConfirm(null);
        }}
      >
        {confirm && (
          <>
            <span className="eyebrow">
              {l("QUYẾT ĐỊNH CỦA CEO", "CEO DECISION")}
            </span>
            <h2 id="confirmation-title">{confirm.title[locale]}</h2>
            <p className="pre-wrap">{confirm.body[locale]}</p>
            <div className="button-row">
              <button autoFocus onClick={() => setConfirm(null)}>
                {l("Quay lại", "Back")}
              </button>
              <button
                className="primary"
                onClick={() => {
                  dispatch(confirm.command);
                  setConfirm(null);
                }}
              >
                {l("Xác nhận", "Confirm")}
              </button>
            </div>
          </>
        )}
      </dialog>
      {s.status === "review" && (
        <div className="outcome">
          <section>
            <span className="eyebrow">
              {l("TỔNG KẾT CÔNG TY", "COMPANY REVIEW")}
            </span>
            <h1>
              {s.campaignWon
                ? l("Một công ty đáng tự hào.", "A company to be proud of.")
                : l(
                    "Chặng đường vẫn còn phía trước.",
                    "The story can continue.",
                  )}
            </h1>
            <p>
              {l("Mục tiêu chiến dịch", "Victory track")}:{" "}
              {s.strategy.toUpperCase()} ·{" "}
              {l("Di sản công ty", "Company legacy")}:{" "}
              {campaignEvaluation(s).legacy}/100
            </p>
            <p>
              {l(
                "Xem lại dòng tiền, khách hàng, chất lượng và những lời hứa. Bạn có thể tiếp tục xây dựng trong Sandbox.",
                "Review cash flow, customers, quality and your promises. Continue building in Sandbox.",
              )}
            </p>
            <div className="button-row">
              <button
                className="primary"
                onClick={() => dispatch({ type: "continueSandbox" })}
              >
                {l("Tiếp tục Sandbox", "Continue in Sandbox")}
              </button>
              <button onClick={() => setScreen("setup")}>
                {l("Công ty mới", "New company")}
              </button>
            </div>
          </section>
        </div>
      )}
      {s.status === "insolvent" && !outcomeClosed && (
        <div className="outcome">
          <section>
            <span className="eyebrow">
              {l("TỔNG KẾT CÔNG TY", "COMPANY REVIEW")}
            </span>
            <h1>{l("Một chương khép lại.", "A chapter closes.")}</h1>
            <p>
              {l(
                "Công ty không trả được lương trong thời hạn 14 ngày. Những lựa chọn đã qua vẫn nằm trong nhật ký để bạn xem lại.",
                "Payroll remained unpaid beyond the 14-day grace period. Your company history preserves every decision to learn from.",
              )}
            </p>
            <div className="button-row">
              <button
                onClick={() => {
                  setView("history");
                  setOutcomeClosed(true);
                }}
              >
                {l("Xem lịch sử", "Review history")}
              </button>
              <button className="primary" onClick={() => setScreen("setup")}>
                {l("Bắt đầu lại", "Start again")}
              </button>
            </div>
          </section>
        </div>
      )}
      {saves && (
        <SaveManager
          game={s}
          locale={locale}
          onClose={() => setSaves(false)}
          onLoad={restoreGame}
        />
      )}
      <div className="mobile-notice">
        {l(
          "Game được thiết kế cho màn hình ngang từ 1280px.",
          "Designed for landscape desktop screens from 1280px.",
        )}
      </div>
    </div>
  );
}
