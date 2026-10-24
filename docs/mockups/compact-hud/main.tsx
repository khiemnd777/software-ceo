import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
} from "react";
import { createRoot } from "react-dom/client";
import { Office, type Camera } from "../../../src/renderer/Office";
import {
  officePeople,
  places,
  project,
  seats,
} from "../../../src/ui/simulateModel";
import { Icon } from "../../../src/ui/common";
import { makeFixture } from "../simulate-unified/fixture";
import "../../../src/ui/style.css";
import "../../../src/ui/simulate.css";
import "./style.css";

// One synthetic snapshot shared by both layouts. No bootstrap, store or persistence.
const sample = makeFixture();
sample.day = 154;
for (const employee of sample.employees) {
  if (!employee.assignments.length)
    employee.assignments = [{ target: sample.work[0].id, kind: "develop" }];
}
const people = officePeople(sample);
const kpis = [
  {
    label: "Tiền mặt",
    value: "$64,100",
    detail: "Chi phí vận hành: $18,200/tháng",
    icon: "finance",
    title: "Tài chính",
    body: "Tiền mặt là khoản có thể chi ngay. Chi phí vận hành gồm lương và chi phí công ty. Trong game, bấm KPI này mở bảng Tài chính.",
    rows: [
      ["Tiền mặt", "$64,100"],
      ["Chi phí vận hành / tháng", "$18,200"],
    ],
  },
  {
    label: "Việc còn lại",
    value: "66 WP",
    detail: "4 đầu việc đang theo dõi",
    icon: "work",
    title: "Công việc",
    body: "WP là điểm việc còn lại. Trong game, bấm KPI này mở danh sách dự án để xem tiến độ, QA và phân công.",
    rows: [
      ["Việc còn lại", "66 WP"],
      ["Đầu việc đang theo dõi", "4"],
    ],
  },
  {
    label: "Đội ngũ",
    value: "4 người",
    detail: "4 người đã được giao việc",
    icon: "people",
    title: "Đội ngũ",
    body: "Trong game, bấm KPI này mở đội ngũ để xem phân công và tình trạng từng người.",
    rows: [
      ["Nhân sự", "4"],
      ["Đã được giao việc", "4"],
    ],
  },
  {
    label: "Uy tín",
    value: "45/100",
    detail: "Mô hình: Outsourcing",
    icon: "star",
    title: "Chiến lược",
    body: "Icon ngôi sao chỉ Uy tín; icon tia chớp chỉ Lượt CEO. Trong game, nhóm chỉ số này mở Chiến lược.",
    rows: [
      ["Uy tín", "45/100"],
      ["Lượt CEO còn lại", "3/3"],
      ["Mô hình kinh doanh", "Outsourcing"],
    ],
  },
];
type Detail = { title: string; body: string; rows?: string[][] };

function HudIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z",
    bolt: "m13 2-9 12h7l-1 8 10-13h-7l1-7Z",
    help: "M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4m.1 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  };
  if (!paths[name]) return <Icon name={name} />;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}

function TipButton({
  tip,
  label,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tip?: string; label: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <button
      {...props}
      aria-label={label}
      aria-describedby={open && tip ? id : undefined}
      onMouseEnter={() => setOpen(!!tip)}
      onMouseLeave={(event) => {
        if (!event.currentTarget.matches(":focus-visible")) setOpen(false);
      }}
      onFocus={() => setOpen(!!tip)}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      {children}
      {open && tip && (
        <span role="tooltip" id={id} className="hud-tooltip">
          {tip}
        </span>
      )}
    </button>
  );
}

function App() {
  const [before, setBefore] = useState(
    new URLSearchParams(location.search).get("mode") === "before",
  );
  const [scale, setScale] = useState(
    new URLSearchParams(location.search).get("scale") === "150" ? "150" : "100",
  );
  const [expanded, setExpanded] = useState(false);
  const [beforeCollapsed, setBeforeCollapsed] = useState(false);
  const [points, setPoints] = useState(true);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [sceneHeight, setSceneHeight] = useState(0);
  const [topHeight, setTopHeight] = useState(0);
  const scene = useRef<HTMLElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.uiScale = scale;
    document.documentElement.style.fontSize = scale === "150" ? "21px" : "14px";
  }, [scale]);
  useEffect(() => {
    const measure = () => {
      setSceneHeight(
        Math.round(scene.current?.getBoundingClientRect().height ?? 0),
      );
      setTopHeight(
        Math.round(top.current?.getBoundingClientRect().height ?? 0),
      );
    };
    const observer = new ResizeObserver(measure);
    if (scene.current) observer.observe(scene.current);
    if (top.current) observer.observe(top.current);
    measure();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (detail && !dialog.current?.open) {
      previousFocus.current =
        document.activeElement instanceof HTMLElement &&
        document.activeElement !== document.body
          ? document.activeElement
          : document.querySelector<HTMLButtonElement>(".objective-action");
      dialog.current?.showModal();
    }
  }, [detail]);
  function close() {
    dialog.current?.close();
    setDetail(null);
    previousFocus.current?.focus();
  }
  function policy() {
    setExpanded(false);
    setDetail({
      title: "Chọn chính sách giao hàng",
      body: "Giao nhanh tạo thêm lỗi và nợ kỹ thuật. Chất lượng trước chậm hơn nhưng giảm việc sửa lỗi về sau. Cân bằng giữ mức trung gian. Mockup chỉ cho xem; chưa áp dụng chính sách.",
      rows: [
        ["Giao nhanh", "Tốc độ ↑ · Lỗi ↑"],
        ["Cân bằng", "Chính sách hiện tại"],
        ["Chất lượng trước", "Tốc độ ↓ · Lỗi ↓"],
      ],
    });
  }
  const tutorialBody =
    "Giao nhanh tạo thêm lỗi và nợ kỹ thuật. Chất lượng trước chậm hơn nhưng giảm việc sửa lỗi về sau. Bạn cũng có thể giữ Cân bằng.";
  return (
    <div className={`mockup ${before ? "before" : "proposed"}`}>
      <div className="game-frame">
        <div className="top-area" ref={top}>
          <header className="review-hud">
            <div className="review-brand">
              <b>&lt;/&gt;</b>
              <div>
                <strong>SOFTWARE CEO</strong>
                <small>SIMULATE</small>
              </div>
            </div>
            {kpis.map((k, i) => (
              <TipButton
                key={k.label}
                className={`review-kpi kpi-${i}`}
                label={`${k.label} ${k.value}`}
                tip={before ? undefined : `${k.label} · Mở ${k.title}`}
                onClick={() => setDetail(k)}
              >
                {before ? (
                  <span className="kpi-label">{k.label}</span>
                ) : (
                  <HudIcon name={k.icon} />
                )}
                <strong>
                  {!before && i === 2 ? "4" : k.value}
                  {before && i === 3 && <em> · 3/3</em>}
                </strong>
                <small>{k.detail}</small>
              </TipButton>
            ))}
            {!before && (
              <TipButton
                className="review-kpi ceo"
                label="Lượt CEO 3/3"
                tip="Lượt CEO còn lại · Mở Chiến lược"
                onClick={() => setDetail(kpis[3])}
              >
                <HudIcon name="bolt" />
                <strong>
                  3<span>/3</span>
                </strong>
              </TipButton>
            )}
            <div className="review-utilities">
              <TipButton
                label="Lưu và tải"
                tip="Lưu và tải"
                onClick={() =>
                  setDetail({
                    title: "Lưu và tải",
                    body: "Nút Lưu giữ vị trí ở cuối HUD. Đây là mockup độc lập; không đọc hoặc ghi bản lưu game.",
                  })
                }
              >
                <Icon name="save" />
              </TipButton>
              <TipButton
                label="Cài đặt"
                tip="Cài đặt"
                onClick={() =>
                  setDetail({
                    title: "Cài đặt",
                    body: "Dùng bộ chọn UI 100% / 150% ở thanh xem mockup để kiểm tra kích thước chữ và bố cục.",
                  })
                }
              >
                <Icon name="settings" />
              </TipButton>
              <button
                aria-label="Ngôn ngữ của mockup"
                onClick={() =>
                  setDetail({
                    title: "Ngôn ngữ",
                    body: "Mockup đang dùng tiếng Việt. Bản tích hợp sẽ giữ hỗ trợ EN/VI hiện có.",
                  })
                }
              >
                VI
              </button>
            </div>
          </header>
          <section
            className={`objective-line ${before && beforeCollapsed ? "legacy-collapsed" : ""}`}
            aria-label="Hướng dẫn khởi đầu"
          >
            <span className="tutorial-progress">
              {before ? "Những tuần đầu tiên" : "Hướng dẫn"} <b>5/6</b>
            </span>
            <strong>Chọn chính sách giao hàng</strong>
            {before && <p>{tutorialBody}</p>}
            <TipButton
              className="objective-action"
              label="Mở màn hình chọn chính sách giao hàng"
              tip={before ? undefined : "Mở màn hình chọn chính sách giao hàng"}
              onClick={policy}
            >
              {before ? (
                <>
                  Mở màn hình này <span>→</span>
                </>
              ) : (
                <HudIcon name="arrow" />
              )}
            </TipButton>
            <TipButton
              className="expand-tutorial"
              label="Xem giải thích hướng dẫn"
              tip={
                before
                  ? undefined
                  : expanded
                    ? "Thu gọn giải thích hướng dẫn"
                    : "Giải thích hướng dẫn"
              }
              aria-expanded={before ? !beforeCollapsed : expanded}
              aria-controls="tutorial-content"
              onClick={() =>
                before
                  ? setBeforeCollapsed(!beforeCollapsed)
                  : setExpanded(!expanded)
              }
            >
              {before ? beforeCollapsed ? "+" : "−" : <HudIcon name="help" />}
            </TipButton>
          </section>
        </div>
        <main ref={scene} className="unified-scene" aria-label="Văn phòng mẫu">
          <Office
            people={people}
            tier={0}
            companyName="KNA SOFTWARE"
            language="vi"
            paused
            reducedMotion
            onCameraChange={setCamera}
            onSelect={(id) =>
              setDetail({
                title: people.find((p) => p.id === id)?.name ?? "Nhân sự",
                body: "Trong game, chọn nhân sự mở bảng quản lý ngay trong văn phòng.",
              })
            }
            onNavigate={(view) =>
              setDetail({
                title: "Quản lý văn phòng",
                body: `Điểm tương tác mở bảng ${view} trong game. Mockup này tập trung vào HUD và diện tích chơi.`,
              })
            }
          />
          <div className="scene-toolbar">
            <div>
              <span className="run-indicator" />
              <strong>KNA SOFTWARE</strong>
              <span className="date">THÁNG 6 · NGÀY 154</span>
            </div>
            <button
              className="find-object"
              onClick={() =>
                setDetail({
                  title: "Tìm trong văn phòng",
                  body: "Các điểm quản lý vẫn ở trong văn phòng. Có thể chọn trực tiếp nhân sự hoặc địa điểm; vị trí nút tìm kiếm được giữ như game hiện tại.",
                  rows: places.map((p) => [p.name, "↗"]),
                })
              }
            >
              <Icon name="people" />
              Tìm trong văn phòng <kbd>⌘ K</kbd>
            </button>
          </div>
          {camera && points && (
            <div className="world-overlays">
              {places.map((p) => {
                const pos = project(camera, p.x, p.y, p.z);
                return (
                  <button
                    key={p.id}
                    className="world-point"
                    style={{ left: pos.x, top: pos.y }}
                    onClick={() =>
                      p.id === "meeting"
                        ? policy()
                        : setDetail({
                            title: p.name,
                            body: "Điểm quản lý giữ vị trí trong văn phòng. Mockup chỉ thay cách trình bày phần trên.",
                          })
                    }
                  >
                    <Icon name={p.icon} />
                    {p.name}
                  </button>
                );
              })}
              {people.map((p, i) => {
                const seat = seats[i];
                const pos = project(camera, seat.x, seat.y, 1.9);
                return (
                  <button
                    className="person-point"
                    key={p.id}
                    style={{ left: pos.x, top: pos.y }}
                    onClick={() =>
                      setDetail({
                        title: p.name,
                        body: "Bảng chi tiết nhân sự trong game vẫn mở từ văn phòng.",
                      })
                    }
                  >
                    <span>{p.name.split(" ")[0]}</span>
                    <small>
                      {p.working ? "Đang làm việc" : "Chờ phân công"}
                    </small>
                  </button>
                );
              })}
            </div>
          )}
          <section className="attention-corner">
            <button onClick={() => setDetail(kpis[1])}>
              <small>
                CẦN CHÚ Ý <b>1</b>
              </small>
              <strong>4 đầu việc cần theo dõi ↗</strong>
              <span>Tiến độ, QA và phân công</span>
            </button>
          </section>
          <div className="world-help">
            <span>Chọn người hoặc địa điểm để quản lý công ty.</span>
            <button onClick={() => setPoints(!points)}>
              {points ? "Ẩn" : "Hiện"} điểm tương tác
            </button>
          </div>
          <div className="mock-clock">
            <span>Ⅱ Tạm dừng</span>
            <button
              aria-label="Xem điều khiển thời gian"
              onClick={() =>
                setDetail({
                  title: "Điều khiển thời gian",
                  body: "Giữ cụm Phát / 1× / 2× / 4× / Ngày tiếp ở vị trí hiện tại. Thời gian của mockup cố định để so sánh cùng một văn phòng.",
                })
              }
            >
              1× · 2× · 4× <b>Ngày tiếp →</b>
            </button>
          </div>
          {!before && expanded && (
            <section
              id="tutorial-content"
              className="tutorial-popover"
              aria-label="Giải thích hướng dẫn"
            >
              <div>
                <small>HƯỚNG DẪN · 5/6</small>
                <button
                  aria-label="Đóng giải thích"
                  onClick={() => setExpanded(false)}
                >
                  ×
                </button>
              </div>
              <h2>Chọn chính sách giao hàng</h2>
              <p>{tutorialBody}</p>
              <button className="primary" onClick={policy}>
                Xem các chính sách →
              </button>
            </section>
          )}
        </main>
        <footer className="sample-footer">
          <span>● MÔ PHỎNG TẠM DỪNG</span>
          <button
            onClick={() =>
              setDetail({
                title: "Nhật ký",
                body: "Thanh Nhật ký và Hộp thư giữ ở cuối màn hình, như game hiện tại.",
              })
            }
          >
            NGÀY 154 <strong>Có điều cần theo dõi</strong> Nhật ký ↗
          </button>
          <button
            onClick={() =>
              setDetail({
                title: "Hộp thư",
                body: "Trong game, mở Hộp thư để xem sự kiện và quyết định cần xử lý.",
              })
            }
          >
            1 sự kiện · Hộp thư ↗
          </button>
        </footer>
      </div>
      <nav className="review-bar" aria-label="Điều khiển xem mockup">
        <div className="review-mode">
          <span>MOCKUP</span>
          <button
            aria-pressed={!before}
            onClick={() => {
              setBefore(false);
              setExpanded(false);
            }}
          >
            Đề xuất
          </button>
          <button
            aria-pressed={before}
            onClick={() => {
              setBefore(true);
              setExpanded(false);
              setBeforeCollapsed(false);
            }}
          >
            Hiện tại
          </button>
        </div>
        <output>
          Phần trên <b>{topHeight}px</b>
          <i>·</i>Văn phòng <b>{sceneHeight}px</b>
        </output>
        <label>
          UI{" "}
          <select
            aria-label="Tỷ lệ UI"
            value={scale}
            onChange={(e) => setScale(e.target.value)}
          >
            <option value="100">100%</option>
            <option value="150">150%</option>
          </select>
        </label>
        <small>Dữ liệu mẫu · Không lưu</small>
      </nav>
      <dialog
        ref={dialog}
        className="mock-dialog"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
      >
        <button
          className="dialog-close"
          aria-label="Đóng chi tiết"
          onClick={close}
        >
          ×
        </button>
        <small>XEM THỬ · MOCKUP</small>
        <h2>{detail?.title}</h2>
        <p>{detail?.body}</p>
        {detail?.rows && (
          <dl>
            {detail.rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <button onClick={close}>Trở lại văn phòng</button>
      </dialog>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
