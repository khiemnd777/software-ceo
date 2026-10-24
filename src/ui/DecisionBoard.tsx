import { useState, type ReactNode } from "react";
import type { Locale } from "../simulation/types";
import { Icon, Meter } from "./common";

export interface DecisionItem {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
  tone?: "info" | "success" | "warning" | "danger";
  meta?: string;
  progress?: number;
}

/** Selection changes presentation only. Business actions stay in owning panels. */
export function DecisionBoard({
  items,
  label,
  locale,
  children,
  className = "",
  initialId = "",
}: {
  items: DecisionItem[];
  label: string;
  locale: Locale;
  children: (id: string) => ReactNode;
  className?: string;
  initialId?: string;
}) {
  const [selected, setSelected] = useState(initialId);
  const current = items.find((item) => item.id === selected) ?? items[0];
  if (!current) return null;
  return (
    <div className={`decision-board ${className}`}>
      <aside className="decision-rail" aria-label={label}>
        <div className="decision-rail-heading">
          <h3>{label}</h3>
          <span>{items.length}</span>
        </div>
        <ul className="decision-list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                className="decision-choice"
                aria-pressed={current.id === item.id}
                onClick={() => setSelected(item.id)}
              >
                <span className={`decision-status ${item.tone ?? "info"}`}>
                  <Icon name={item.tone === "success" ? "check" : "work"} />
                  {item.status}
                </span>
                <strong>{item.title}</strong>
                {item.subtitle && <span>{item.subtitle}</span>}
                {item.progress !== undefined && (
                  <Meter
                    label={`${item.title} · ${locale === "vi" ? "Tiến độ" : "Progress"}`}
                    value={item.progress}
                  />
                )}
                {item.meta && <small>{item.meta}</small>}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="decision-inspector" key={current.id}>
        {children(current.id)}
      </div>
    </div>
  );
}

export function NextMove({
  title,
  children,
  locale,
  tone = "info",
}: {
  title: string;
  children: ReactNode;
  locale: Locale;
  tone?: "info" | "success" | "warning";
}) {
  return (
    <section
      className={`next-move ${tone}`}
      aria-label={locale === "vi" ? "Bước tiếp theo" : "Next move"}
    >
      <span className="next-move-label">
        <Icon name={tone === "success" ? "check" : "arrow"} />
        {locale === "vi" ? "BƯỚC TIẾP THEO" : "NEXT MOVE"}
      </span>
      <h3>{title}</h3>
      <div className="next-move-body">{children}</div>
    </section>
  );
}
