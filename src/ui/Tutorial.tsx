import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./common";
import { TooltipButton } from "./TooltipButton";
import type { State, Locale, Command } from "../simulation/types";
const steps = [
  {
    id: "observe",
    view: "work",
    vi: "Nhìn tiền và công việc",
    en: "Read cash and work",
    bodyVi:
      "Tiền mặt trả lương. Công việc tạo ra giá trị trước khi tiền thật sự về. Mở bảng công việc để xem cơ hội đầu tiên.",
    bodyEn:
      "Cash pays salaries. Work creates value before money actually arrives. Open the work board to see your first opportunity.",
  },
  {
    id: "assign",
    view: "work",
    vi: "Giao một công việc",
    en: "Assign a teammate",
    bodyVi:
      "Ký hợp đồng, chọn tính năng hoặc mở thử nghiệm theo mô hình của bạn. Sau đó giao việc phù hợp cho một nhân viên và bấm Chạy.",
    bodyEn:
      "Sign a contract, plan a feature or start an experiment for your business. Assign one teammate to the right work, then press Play.",
  },
  {
    id: "policy",
    view: "strategy",
    vi: "Chọn nhịp giao hàng",
    en: "Choose a delivery policy",
    bodyVi:
      "Nhanh hơn sẽ có thêm lỗi và nợ kỹ thuật. Chất lượng trước chậm hơn nhưng giảm việc sửa sau này. Bạn cũng có thể giữ Cân bằng.",
    bodyEn:
      "Shipping faster creates more defects and debt. Quality First is slower but reduces later repair work. You can also keep Balanced.",
  },
  {
    id: "decision",
    view: "office",
    vi: "Giải quyết một tình huống",
    en: "Make a CEO decision",
    bodyVi:
      "Xem cảnh báo trong Hộp thư CEO. Khi tình huống mở, chọn một phương án; một số hậu quả đến sau vài tuần. Lượt CEO được làm mới mỗi 7 ngày.",
    bodyEn:
      "Read advance warnings in the CEO Inbox. When a decision opens, choose a response. Some consequences arrive weeks later. Actions refresh every seven days.",
  },
  {
    id: "review",
    view: "history",
    vi: "Đọc lại một tuần",
    en: "Review a week",
    bodyVi:
      "Từ ngày 7, Nhật ký giải thích tiền mặt và khối lượng việc đã thay đổi ra sao. Dùng báo cáo để điều chỉnh kế hoạch tuần tới.",
    bodyEn:
      "From day 7, History shows how cash and completed work changed. Use the review to plan the next week.",
  },
  {
    id: "income",
    view: "finance",
    vi: "Theo dõi khoản thu thật",
    en: "Follow actual income",
    bodyVi:
      "Mở Tài chính sau khi hóa đơn được thanh toán hoặc thuê bao trả tiền vào cuối tháng. Phân biệt tiền cọc, khoản phải thu và doanh thu.",
    bodyEn:
      "Open Finance after an invoice clears or subscribers pay at month end. Distinguish deposits, receivables and earned revenue.",
  },
];
export function Tutorial({
  s,
  locale,
  view,
  compact = false,
  navigate,
  dispatch,
}: {
  s: State;
  locale: Locale;
  view: string;
  compact?: boolean;
  navigate: (v: string) => void;
  dispatch: (c: Command) => boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const section = useRef<HTMLElement>(null);
  const id = useId();
  const en = locale === "en";
  const seen = s.tutorial.seen;
  const step = steps.find((x) => !seen.includes(x.id));
  useEffect(() => setExpanded(false), [compact, step?.id]);
  function close() {
    setExpanded(false);
    section.current
      ?.querySelector<HTMLButtonElement>(".tutorial-toggle")
      ?.focus();
  }
  useEffect(() => {
    if (!expanded) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!section.current?.contains(event.target as Node)) setExpanded(false);
    };
    window.addEventListener("keydown", key, true);
    document.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("keydown", key, true);
      document.removeEventListener("pointerdown", outside);
    };
  }, [expanded]);
  if (!step || seen.length >= 6) return null;
  const action =
    step.id === "policy" && view === "strategy"
      ? en
        ? "Keep current policy"
        : "Giữ chính sách hiện tại"
      : en
        ? "Open this screen"
        : "Mở màn hình này";
  const act = () => {
    // Keep a mounted opener when the explanation closes or the step advances.
    section.current
      ?.querySelector<HTMLButtonElement>(".tutorial-action")
      ?.focus();
    setExpanded(false);
    if (step.id === "observe") dispatch({ type: "tutorial", step: step.id });
    else if (step.id === "policy" && view === "strategy")
      dispatch({ type: "tutorial", step: "policy" });
    navigate(step.view);
  };
  return (
    <section
      ref={section}
      className="tutorial-strip compact-tutorial"
      aria-label={en ? "Getting started" : "Hướng dẫn khởi đầu"}
    >
      <span className="tutorial-progress">
        {en ? "Tutorial" : "Hướng dẫn"} <b>{seen.length}/6</b>
      </span>
      <strong className="tutorial-task">{en ? step.en : step.vi}</strong>
      <TooltipButton className="tutorial-action" label={action} onClick={act}>
        <Icon name="arrow" />
      </TooltipButton>
      <TooltipButton
        className="tutorial-toggle"
        label={en ? "Toggle tutorial" : "Thu gọn hoặc mở hướng dẫn"}
        tip={
          expanded
            ? en
              ? "Hide explanation"
              : "Thu gọn giải thích"
            : en
              ? "Explain this step"
              : "Giải thích bước này"
        }
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded(!expanded)}
      >
        <Icon name="help" />
      </TooltipButton>
      {expanded && (
        <section
          id={id}
          className="tutorial-explanation"
          aria-label={en ? "Tutorial explanation" : "Giải thích hướng dẫn"}
        >
          <div>
            <small>
              {en ? "TUTORIAL" : "HƯỚNG DẪN"} · {seen.length}/6
            </small>
            <button
              aria-label={en ? "Close explanation" : "Đóng giải thích"}
              onClick={close}
            >
              <Icon name="close" />
            </button>
          </div>
          <h3>{en ? step.en : step.vi}</h3>
          <p>{en ? step.bodyEn : step.bodyVi}</p>
          <button className="primary" onClick={act}>
            {action} →
          </button>
        </section>
      )}
    </section>
  );
}
