import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { createRoot } from "react-dom/client";
import { LitOffice, type Camera, type VisualTime } from "./LitOffice";
import { WALL_CLOCK } from "./wallClock";
import { WALL_SWITCH } from "./wallSwitch";
import { clockLabel } from "./displayClock";
import { WEATHER, type Weather } from "./outdoorWeather";
import {
  RULES,
  SCHEDULE,
  MILESTONES,
  buildTimeline,
  dayLabel,
  timeLabel,
  lighting,
  phaseAt,
  phaseLabel,
  hourlyWP,
  totalCost,
  type Scenario,
  type Worker,
  type Frame,
} from "./model";
import "./style.css";

const timeline = buildTimeline();
const money = (cents: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
const number = (value: number, digits = 1) =>
  value.toLocaleString("vi-VN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
const rate = (value: number) => `${value > 0 ? "+" : ""}${number(value)}`;
const workerName = "Minh · Lập trình viên";
function Gauge({
  name,
  value,
  color,
  detail,
}: {
  name: string;
  value: number;
  color: string;
  detail: string;
}) {
  return (
    <div className="gauge" style={{ "--gauge": color } as CSSProperties}>
      <div>
        <span>{name}</span>
        <strong>
          {number(value)}
          <small>/100</small>
        </strong>
      </div>
      <div
        className="bar"
        role="meter"
        aria-label={name}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(value.toFixed(2))}
      >
        <i style={{ width: `${value}%` }} />
      </div>
      <small>{detail}</small>
    </div>
  );
}
function ScenarioCard({
  scenario,
  frame,
  playing,
  reduced,
  weather,
  weatherSeconds,
  visualMinute,
  visualTime,
}: {
  scenario: Scenario;
  frame: Frame;
  playing: boolean;
  reduced: boolean;
  weather: Weather;
  weatherSeconds: number;
  visualMinute: number;
  visualTime: RefObject<VisualTime>;
}) {
  const [selected, setSelected] = useState("");
  const [lightsOn, setLightsOn] = useState(true);
  const [notice, setNotice] = useState("");
  const [camera, setCamera] = useState<Camera | null>(null);
  const worker = frame[scenario],
    light = lighting(visualMinute);
  const phase = phaseAt(frame.minute, scenario);
  const working = phase === "work" || phase === "overtime";
  const present = phase !== "rest" && frame.minute < RULES.durationMinutes;
  const isOvertime = scenario === "overtime";
  const energyRate =
    phase === "work"
      ? RULES.regularEnergyPerHour
      : phase === "overtime"
        ? RULES.overtimeEnergyPerHour
        : phase === "lunch"
          ? RULES.lunchEnergyPerHour
          : RULES.restEnergyPerHour;
  const phaseText =
    frame.minute === RULES.durationMinutes
      ? "Đã hoàn thành 48 giờ"
      : phaseLabel[phase];
  return (
    <article
      className={`scenario ${scenario}`}
      data-scenario={scenario}
      aria-label={isOvertime ? "Phương án tăng ca" : "Phương án bình thường"}
    >
      <header className="scenario-head">
        <div>
          <span className="eyebrow">PHƯƠNG ÁN {isOvertime ? "B" : "A"}</span>
          <h2>{isOvertime ? "Có tăng ca" : "Làm bình thường"}</h2>
        </div>
        <span className="schedule-badge">
          {isOvertime ? "8 giờ + 2 giờ tăng ca" : "8 giờ / ngày"}
        </span>
      </header>
      <div
        className="scene"
        data-camera={camera ? JSON.stringify(camera) : undefined}
        data-lighting-minute={visualMinute}
        data-model-minute={frame.minute}
        data-wall-clock={clockLabel(visualMinute)}
        data-wall-clock-plane={JSON.stringify(WALL_CLOCK)}
        data-wall-switch-plane={JSON.stringify(WALL_SWITCH)}
        data-lights-on={lightsOn}
        data-weather={weather}
        data-weather-phase={reduced ? 0 : weatherSeconds}
      >
        <LitOffice
          visualTime={visualTime}
          lightsOn={lightsOn}
          onToggleLights={() => setLightsOn((value) => !value)}
          lightingMinute={visualMinute}
          weather={weather}
          weatherSeconds={weatherSeconds}
          onCameraChange={setCamera}
          people={
            present
              ? [
                  {
                    id: "minh",
                    name: "Minh",
                    role: "developer",
                    appearance: "male-trousers",
                    working,
                    morale: worker.morale,
                    energy: worker.energy,
                    taskKind: "develop",
                  },
                ]
              : []
          }
          tier={1}
          companyName="SOFTWARE CEO"
          selected={selected}
          onSelect={(id) => {
            setSelected(id === selected ? "" : id);
            setNotice(
              "Minh có cùng kỹ năng và trạng thái ban đầu ở cả hai phương án.",
            );
          }}
          onNavigate={() =>
            setNotice(
              "Bản so sánh tập trung vào lịch làm và trạng thái nhân viên bên dưới.",
            )
          }
          reducedMotion={reduced}
          paused={!playing}
          language="vi"
          interactionLabelsVisible={false}
        />
        <span className="scene-time">
          {clockLabel(visualMinute)} · Ngoài trời: {light.label}
        </span>
        <span className="lamp-badge">
          Đèn văn phòng · {lightsOn ? "Bật" : "Tắt"}
        </span>
        <span className={`phase-badge ${working ? "working" : "resting"}`}>
          {working ? "●" : "◌"} {phaseText}
        </span>
      </div>
      <div className="scenario-body">
        <div className="person-line">
          <strong>{workerName}</strong>
          <span>
            {present
              ? phase === "lunch"
                ? "Đang nghỉ trong văn phòng"
                : "Có mặt tại văn phòng"
              : "Ngoài văn phòng"}
          </span>
        </div>
        <div className="project-line">
          <span>Dự án mẫu · 4 WP</span>
          <strong data-value="progress">
            {number(worker.work, 2)} WP{" "}
            <small>· {number((worker.work / RULES.projectWP) * 100)}%</small>
          </strong>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Tiến độ dự án"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Number(
            ((worker.work / RULES.projectWP) * 100).toFixed(2),
          )}
        >
          <i style={{ width: `${(worker.work / RULES.projectWP) * 100}%` }} />
        </div>
        <p className="work-detail">
          {working && frame.minute < RULES.durationMinutes
            ? `${number(hourlyWP(worker) * (phase === "overtime" ? RULES.overtimeOutputFactor : 1), 3)} WP/giờ tại trạng thái hiện tại`
            : "Không tích lũy công việc trong thời gian nghỉ"}
        </p>
        <div className="health-grid">
          <Gauge
            name="Năng lượng"
            value={worker.energy}
            color="#76d8b5"
            detail={`${rate(energyRate)} điểm/giờ ${working ? "làm" : "nghỉ"}`}
          />
          <Gauge
            name="Tinh thần"
            value={worker.morale}
            color="#a9baff"
            detail={
              phase === "overtime"
                ? "−0,5 điểm/giờ tăng ca"
                : phase === "rest"
                  ? "Nghỉ đêm không xóa bất mãn"
                  : "Thay đổi chậm hơn năng lượng"
            }
          />
        </div>
        <div className="cost-line">
          <div>
            <span>Chi phí tích lũy</span>
            <strong data-value="cost">{money(totalCost(worker))}</strong>
          </div>
          <p>
            Lương {money(worker.laborCents)}
            <br />
            Vận hành {money(worker.overheadCents)}
          </p>
        </div>
        <p className="hours-line">
          Đã làm {number(worker.regularMinutes / 60)} giờ chuẩn ·{" "}
          {number(worker.overtimeMinutes / 60)} giờ tăng ca
        </p>
        {notice && (
          <p className="scene-notice" role="status">
            {notice}
          </p>
        )}
      </div>
    </article>
  );
}
type Metric = "energy" | "morale" | "work" | "cost";
const metricLabels: Record<Metric, string> = {
  energy: "Năng lượng",
  morale: "Tinh thần",
  work: "Tiến độ công việc",
  cost: "Chi phí tích lũy",
};
const metricValue = (worker: Worker, metric: Metric) =>
  metric === "cost" ? totalCost(worker) / 100 : worker[metric];
function History({ frame }: { frame: Frame }) {
  const [metric, setMetric] = useState<Metric>("energy");
  const max =
    metric === "energy" || metric === "morale"
      ? 100
      : metric === "work"
        ? RULES.projectWP
        : Math.ceil(totalCost(timeline.at(-1)!.overtime) / 100 / 100) * 100;
  const points = (scenario: Scenario) =>
    timeline
      .filter((item) => item.minute <= frame.minute)
      .map(
        (item) =>
          `${45 + (item.minute / RULES.durationMinutes) * 880},${155 - (metricValue(item[scenario], metric) / max) * 130}`,
      )
      .join(" ");
  return (
    <section className="history panel" aria-label="Diễn biến hai ngày">
      <div className="section-head">
        <div>
          <span className="eyebrow">HẬU QUẢ THEO THỜI GIAN</span>
          <h2>Ngày hôm nay ảnh hưởng ngày mai</h2>
        </div>
        <label>
          Chỉ số{" "}
          <select
            value={metric}
            onChange={(event) => setMetric(event.target.value as Metric)}
          >
            {Object.entries(metricLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="legend">
        <span className="normal-key">━━ Bình thường</span>
        <span className="overtime-key">┄┄ Tăng ca</span>
        <span>
          Vùng nền: giờ làm chuẩn · dữ liệu hiện đến {dayLabel(frame.minute)},{" "}
          {timeLabel(frame.minute)}
        </span>
      </div>
      <svg
        className="chart"
        viewBox="0 0 960 190"
        role="img"
        aria-label={`Biểu đồ ${metricLabels[metric]} của hai phương án trong 48 giờ; số liệu tại các mốc có trong bảng bên dưới.`}
      >
        <title>{metricLabels[metric]} trong hai ngày</title>
        {[0, 1440].flatMap((day) =>
          SCHEDULE.workWindows.map(([a, b]) => (
            <rect
              key={`${day}-${a}`}
              x={45 + ((day + a) / 2880) * 880}
              y={25}
              width={((b - a) / 2880) * 880}
              height={130}
              fill="#253836"
            />
          )),
        )}
        {[0, 0.5, 1].map((fraction) => (
          <g key={fraction}>
            <line
              x1="45"
              x2="925"
              y1={155 - fraction * 130}
              y2={155 - fraction * 130}
              stroke="#34414d"
            />
            <text x="35" y={159 - fraction * 130} textAnchor="end">
              {number(max * fraction, metric === "work" ? 1 : 0)}
            </text>
          </g>
        ))}
        <line
          x1="485"
          x2="485"
          y1="25"
          y2="155"
          stroke="#576575"
          strokeDasharray="3 5"
        />
        <polyline
          points={points("regular")}
          fill="none"
          stroke="#76d8b5"
          strokeWidth="3"
        />
        <polyline
          points={points("overtime")}
          fill="none"
          stroke="#ffca80"
          strokeWidth="3"
          strokeDasharray="7 4"
        />
        <line
          x1={45 + (frame.minute / 2880) * 880}
          x2={45 + (frame.minute / 2880) * 880}
          y1="20"
          y2="155"
          stroke="#e4ebf2"
          strokeWidth="1"
        />
        <text x="45" y="179">
          Ngày 1 · 00:00
        </text>
        <text x="485" y="179" textAnchor="middle">
          Ngày 2 · 00:00
        </text>
        <text x="925" y="179" textAnchor="end">
          Hết ngày 2
        </text>
      </svg>
      <details>
        <summary>Xem số liệu tại các mốc đã đi qua</summary>
        <div className="table-scroll">
          <table>
            <caption>
              Giá trị tích lũy từ 00:00 ngày 1; A: bình thường, B: tăng ca
            </caption>
            <thead>
              <tr>
                <th scope="col">Thời điểm</th>
                <th scope="col">WP A / B</th>
                <th scope="col">Năng lượng A / B</th>
                <th scope="col">Tinh thần A / B</th>
                <th scope="col">Chi phí A / B</th>
              </tr>
            </thead>
            <tbody>
              {MILESTONES.filter((minute) => minute <= frame.minute).map(
                (minute) => {
                  const item = timeline[minute / 15];
                  return (
                    <tr key={minute}>
                      <th scope="row">
                        {dayLabel(minute)} · {timeLabel(minute)}
                      </th>
                      <td>
                        {number(item.regular.work, 2)} /{" "}
                        {number(item.overtime.work, 2)}
                      </td>
                      <td>
                        {number(item.regular.energy)} /{" "}
                        {number(item.overtime.energy)}
                      </td>
                      <td>
                        {number(item.regular.morale)} /{" "}
                        {number(item.overtime.morale)}
                      </td>
                      <td>
                        {money(totalCost(item.regular))} /{" "}
                        {money(totalCost(item.overtime))}
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
function App() {
  const [elapsed, setElapsed] = useState<number>(SCHEDULE.workWindows[0][0]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [daySeconds, setDaySeconds] = useState(120);
  const [weather, setWeather] = useState<Weather>("sunny");
  const [weatherSeconds, setWeatherSeconds] = useState(0);
  const [scale, setScale] = useState(() =>
    new URLSearchParams(location.search).get("scale") === "150" ? "150" : "100",
  );
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [message, setMessage] = useState(
    "Đang dừng tại 09:00 ngày 1. Hai phương án có cùng trạng thái ban đầu.",
  );
  const last = useRef(0);
  const visualTime = useRef<VisualTime>({
    minute: SCHEDULE.workWindows[0][0],
    weatherSeconds: 0,
  });
  const minute = Math.min(2880, Math.floor(elapsed / 15) * 15);
  const frame = timeline[minute / 15];
  const light = lighting(elapsed);
  useEffect(() => {
    document.documentElement.style.fontSize = scale === "150" ? "21px" : "14px";
  }, [scale]);
  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    let animation = 0;
    const tick = (now: number) => {
      const seconds = Math.min((now - last.current) / 1000, 0.25);
      last.current = now;
      const previous = visualTime.current;
      const next = {
        minute: Math.min(
          RULES.durationMinutes,
          previous.minute + ((seconds * 1440) / daySeconds) * speed,
        ),
        weatherSeconds: previous.weatherSeconds + seconds,
      };
      visualTime.current = next;
      if (Math.floor(next.minute) !== Math.floor(previous.minute)) {
        setElapsed(next.minute);
        setWeatherSeconds(next.weatherSeconds);
      }
      animation = requestAnimationFrame(tick);
    };
    animation = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animation);
      setElapsed(visualTime.current.minute);
      setWeatherSeconds(visualTime.current.weatherSeconds);
    };
  }, [playing, speed, daySeconds]);
  useEffect(() => {
    if (elapsed >= RULES.durationMinutes && playing) {
      setPlaying(false);
      setMessage(
        "Đã hoàn thành hai ngày. Có thể kéo thanh thời gian để xem lại hoặc bấm Phát lại.",
      );
    }
  }, [elapsed, playing]);
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) {
        setPlaying(false);
        setMessage(
          "Đã tạm dừng khi chuyển tab. Bấm Chạy để tiếp tục; không chạy bù.",
        );
      }
    };
    document.addEventListener("visibilitychange", hidden);
    return () => document.removeEventListener("visibilitychange", hidden);
  }, []);
  function seek(value: number) {
    setPlaying(false);
    visualTime.current = { minute: value, weatherSeconds: value * 0.04 };
    setElapsed(value);
    setWeatherSeconds(value * 0.04);
    setMessage(
      `Đã đến ${dayLabel(value)}, ${timeLabel(value)}. Cả hai phương án dùng cùng thời điểm.`,
    );
  }
  const energyGap = frame.regular.energy - frame.overtime.energy;
  const insight =
    minute < SCHEDULE.overtime[0]
      ? "Trong giờ làm chuẩn, hai phương án tạo cùng tiến độ. Hãy đi đến 18:00 để xem thời điểm quyết định."
      : minute < 1440 + SCHEDULE.workWindows[0][0]
        ? "Từ 18:00, A nghỉ để hồi sức; B làm thêm đến 20:00. B tăng tiến độ và chi phí, đồng thời có ít thời gian phục hồi hơn."
        : `Ngày 2: B còn thiếu ${number(energyGap)} năng lượng so với A tại thời điểm này. Giờ tăng ca hôm trước ảnh hưởng năng suất làm việc hôm nay.`;
  return (
    <main>
      <header className="page-head">
        <div className="brand">
          <span className="brand-mark">S/C</span>
          <div>
            <span className="eyebrow">SOFTWARE CEO · PHÒNG THỬ NGHIỆM</span>
            <h1>Thời gian & con người</h1>
          </div>
        </div>
        <div className="review-settings">
          <span className="proposal-tag">LOCAL · ĐỀ XUẤT</span>
          <label>
            Cỡ UI{" "}
            <select
              aria-label="Cỡ giao diện"
              value={scale}
              onChange={(event) => setScale(event.target.value)}
            >
              <option value="100">100%</option>
              <option value="150">150%</option>
            </select>
          </label>
        </div>
      </header>
      <p className="intro">
        Cùng một người, cùng một dự án. Theo dõi{" "}
        <strong>hai ngày liên tiếp</strong> để thấy làm thêm hôm nay đổi lấy
        điều gì ngày mai.
      </p>
      <section className="clock-panel panel" aria-label="Điều khiển thời gian">
        <div className="clock-face">
          <span>
            {dayLabel(elapsed)}{" "}
            <span className="daylight">· {light.label}</span>
          </span>
          <strong data-testid="clock">{clockLabel(elapsed)}</strong>
          <small>
            {playing ? `Đang chạy · ${speed}×` : "Đang tạm dừng"} · bước tính
            công việc = 15 phút game
          </small>
        </div>
        <div className="transport">
          <div className="buttons">
            <button
              className="primary"
              onClick={() => {
                if (minute >= 2880) {
                  visualTime.current = { minute: 0, weatherSeconds: 0 };
                  setElapsed(0);
                  setWeatherSeconds(0);
                }
                setPlaying(!playing);
                setMessage(
                  playing
                    ? "Đã tạm dừng."
                    : "Hai phương án đang chạy cùng một đồng hồ.",
                );
              }}
            >
              {playing ? "Ⅱ Tạm dừng" : "▶ Chạy"}
            </button>
            <button
              onClick={() => {
                visualTime.current = { minute: 0, weatherSeconds: 0 };
                setElapsed(0);
                setWeatherSeconds(0);
                setPlaying(true);
                setMessage("Phát lại hai ngày từ 00:00 ngày 1.");
              }}
            >
              ↻ Phát lại
            </button>
            <button
              disabled={minute === 0}
              onClick={() =>
                seek(
                  [...MILESTONES].reverse().find((value) => value < minute) ??
                    0,
                )
              }
            >
              ← Trước
            </button>
            <button
              disabled={minute === 2880}
              onClick={() =>
                seek(MILESTONES.find((value) => value > minute) ?? 2880)
              }
            >
              Tiếp →
            </button>
            <button
              disabled={minute === 2880}
              onClick={() => seek(Math.min(2880, minute + 15))}
            >
              +15 phút
            </button>
          </div>
          <div className="play-settings">
            <label>
              Thời tiết{" "}
              <select
                aria-label="Thời tiết ngoài trời"
                value={weather}
                onChange={(event) => {
                  setPlaying(false);
                  setWeather(event.target.value as Weather);
                }}
              >
                {Object.entries(WEATHER).map(([key, spec]) => (
                  <option key={key} value={key}>
                    {key === "sunny" && light.label === "Ban đêm"
                      ? "Trời quang"
                      : spec.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nhịp x1{" "}
              <select
                aria-label="Nhịp thời gian"
                value={daySeconds}
                onChange={(event) => setDaySeconds(Number(event.target.value))}
              >
                <option value="24">24 giây/ngày</option>
                <option value="60">60 giây/ngày</option>
                <option value="120">120 giây/ngày</option>
              </select>
            </label>
            <div className="speed-group" role="group" aria-label="Tốc độ chạy">
              {[1, 2, 4].map((value) => (
                <button
                  key={value}
                  aria-pressed={speed === value}
                  onClick={() => setSpeed(value)}
                >
                  {value}×
                </button>
              ))}
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={reduced}
                onChange={(event) => setReduced(event.target.checked)}
              />
              Giảm hiệu ứng
            </label>
          </div>
        </div>
        <div className="scrubber">
          <label htmlFor="time-slider">
            Chọn thời điểm{" "}
            <strong>
              {dayLabel(minute)} · {timeLabel(minute)}
            </strong>
          </label>
          <input
            id="time-slider"
            type="range"
            min="0"
            max="2880"
            step="15"
            value={minute}
            aria-valuetext={`${dayLabel(minute)}, ${timeLabel(minute)}`}
            onChange={(event) => seek(Number(event.target.value))}
          />
          <div className="ruler">
            <span>Ngày 1 · 00:00</span>
            <span>Ngày 2 · 00:00</span>
            <span>Hết ngày 2</span>
          </div>
          <div className="jump-links">
            <button onClick={() => seek(0)}>Ngày 1 · 00:00</button>
            <button onClick={() => seek(300)}>Xem bình minh · 05:00</button>
            <button onClick={() => seek(420)}>Xem nắng · 07:00</button>
            <button onClick={() => seek(720)}>Xem trưa · 12:00</button>
            <button onClick={() => seek(1020)}>Xem hoàng hôn · 17:00</button>
            <button onClick={() => seek(SCHEDULE.workWindows[0][0])}>
              Ngày 1 · 09:00
            </button>
            <button onClick={() => seek(SCHEDULE.overtime[0])}>
              Ngày 1 · Tan ca
            </button>
            <button onClick={() => seek(SCHEDULE.overtime[1])}>
              Ngày 1 · Hết tăng ca
            </button>
            <button onClick={() => seek(1440 + SCHEDULE.workWindows[0][0])}>
              Ngày 2 · Bắt đầu làm
            </button>
            <button onClick={() => seek(2880)}>Kết quả hai ngày</button>
          </div>
        </div>
      </section>
      <div className="notice" role="status">
        {message}
      </div>
      <div className="comparison">
        <ScenarioCard
          scenario="regular"
          frame={frame}
          playing={playing}
          reduced={reduced}
          weather={weather}
          weatherSeconds={weatherSeconds}
          visualMinute={elapsed}
          visualTime={visualTime}
        />
        <ScenarioCard
          scenario="overtime"
          frame={frame}
          playing={playing}
          reduced={reduced}
          weather={weather}
          weatherSeconds={weatherSeconds}
          visualMinute={elapsed}
          visualTime={visualTime}
        />
      </div>
      <section
        className="impact panel"
        aria-label="So sánh tại thời điểm đang chọn"
      >
        <div>
          <span className="eyebrow">ĐÁNH ĐỔI TẠI {timeLabel(minute)}</span>
          <h2>Tăng ca đổi lấy điều gì?</h2>
          <p>{insight}</p>
        </div>
        <dl>
          <div>
            <dt>Tiến độ thêm</dt>
            <dd>+{number(frame.overtime.work - frame.regular.work, 2)} WP</dd>
          </div>
          <div>
            <dt>Chi phí thêm</dt>
            <dd>
              +{money(totalCost(frame.overtime) - totalCost(frame.regular))}
            </dd>
          </div>
          <div>
            <dt>Năng lượng thấp hơn</dt>
            <dd>{number(energyGap)} điểm</dd>
          </div>
          <div>
            <dt>Tinh thần thấp hơn</dt>
            <dd>{number(frame.regular.morale - frame.overtime.morale)} điểm</dd>
          </div>
        </dl>
      </section>
      <History frame={frame} />
      <section className="rules panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">CÁCH ĐỌC BẢN THỬ</span>
            <h2>Giả định minh bạch, trước khi chốt luật</h2>
          </div>
        </div>
        <p>
          <strong>Proposed:</strong> nhân viên mẫu skill 3, năng lượng 80 và
          tinh thần 75 tại 00:00 ngày 1; dự án 4 WP. Hai ngày là hai ngày làm
          việc liên tiếp. Bắt đầu xem tại 09:00, sau 9 giờ nghỉ giống nhau.
          Không có deadline, thu tiền hay sự kiện ngẫu nhiên trong phép so sánh
          này.
        </p>
        <div className="rule-grid">
          <div>
            <h3>Lịch làm & tiến độ</h3>
            <p>
              09–12h và 13–18h. B tăng ca 18–20h cả hai ngày. Không có WP khi
              nghỉ. Năng suất mỗi bước phụ thuộc năng lượng và tinh thần đầu
              bước.
            </p>
            <p>
              Thử chuẩn hóa 6 WP/tuần × hệ số skill, tinh thần, năng lượng ÷ 40
              giờ/tuần. Đây là lựa chọn thử nghiệm; chưa mô phỏng tuần đầy đủ
              hoặc ngày nghỉ. Giờ tăng ca có hệ số năng suất 0,8 trước ảnh hưởng
              mệt mỏi.
            </p>
          </div>
          <div>
            <h3>Sức khỏe & tinh thần</h3>
            <p>
              Làm chuẩn −2,5 năng lượng/giờ; tăng ca −5/giờ; nghỉ trưa +2/giờ;
              ngoài giờ +1,2/giờ. Mọi chỉ số giới hạn 0–100.
            </p>
            <p>
              Tăng ca −0,5 tinh thần/giờ; nghỉ trưa +0,05/giờ; nghỉ buổi tối
              trong khung 17–22h +0,03/giờ (chỉ khi đã tan ca). Ngủ không đặt
              lại tinh thần. Chưa có burnout, nghỉ việc hoặc rủi ro lỗi.
            </p>
          </div>
          <div>
            <h3>Chi phí & phạm vi</h3>
            <p>
              Lương chuẩn $20/giờ; tăng ca $30/giờ; vận hành $1/giờ theo lịch
              24h. Đây là chi phí tích lũy, chưa phải tiền mặt đã trả. Các mức
              này là dữ liệu mẫu.
            </p>
            <p>
              <strong>Verified:</strong> bản thử dùng mô hình riêng trong RAM và
              art V4/G–H hiện có. <strong>Unknown:</strong> cân bằng dài hạn và
              nhịp chơi phù hợp. Chưa tích hợp game, chưa đọc hoặc ghi save.
            </p>
          </div>
        </div>
      </section>
      <footer>
        LOCAL · Hai phương án chỉ khác lịch tăng ca · Tốc độ phát không thay đổi
        kết quả mô phỏng · Bản thử cần anh review trước khi tích hợp
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
