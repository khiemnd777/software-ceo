import {
  Children,
  isValidElement,
  useRef,
  useLayoutEffect,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { Locale } from "../simulation/types";

export const SectionNavigation = createContext<(id: string) => void>(() => {});

export function ManagementJump({
  section,
  children,
}: {
  section: string;
  children: ReactNode;
}) {
  const select = useContext(SectionNavigation);
  return (
    <button className="primary" onClick={() => select(section)}>
      {children}
    </button>
  );
}

interface SectionProps {
  id: string;
  label: string;
  count?: number;
  children: ReactNode;
}

export function ManagementSection({ id, label, children }: SectionProps) {
  return (
    <section className="management-section" aria-labelledby={`${id}-title`}>
      <h2 className="management-section-title" id={`${id}-title`}>
        {label}
      </h2>
      {children}
    </section>
  );
}

// Filtering keeps sections mounted so draft assignments and budget selections survive.
export function ManagementPage({
  locale,
  name,
  children,
}: {
  locale: Locale;
  name: string;
  children: ReactNode;
}) {
  const [selected, setSelected] = useState("all");
  const root = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const sections = items.filter(
    (item) =>
      isValidElement<SectionProps>(item) && item.type === ManagementSection,
  );
  const active = sections.some(
    (item) => isValidElement<SectionProps>(item) && item.props.id === selected,
  )
    ? selected
    : "all";
  useLayoutEffect(() => {
    root.current?.scrollTo({ top: 0 });
  }, [selected]);
  return (
    <SectionNavigation.Provider value={setSelected}>
      <div
        className="management management-page command-center"
        tabIndex={0}
        ref={root}
        aria-label={name}
      >
        {items.filter((item) => !sections.includes(item))}
        <nav
          className="section-nav"
          aria-label={locale === "vi" ? `Các mục ${name}` : `${name} sections`}
        >
          {[
            {
              id: "all",
              label: locale === "vi" ? "Tất cả" : "All",
              count: undefined,
            },
            ...sections.flatMap((item) =>
              isValidElement<SectionProps>(item) ? [item.props] : [],
            ),
          ].map(({ id, label, count }) => (
            <button
              key={id}
              aria-pressed={active === id}
              aria-controls={id === "all" ? undefined : `${id}-content`}
              onClick={() => {
                setSelected(id);
                root.current?.scrollTo({ top: 0 });
              }}
            >
              {label}
              {count !== undefined && (
                <span className="section-count">{count}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="management-content">
          {sections.map(
            (item) =>
              isValidElement<SectionProps>(item) && (
                <div
                  key={item.props.id}
                  id={`${item.props.id}-content`}
                  hidden={active !== "all" && active !== item.props.id}
                >
                  {item}
                </div>
              ),
          )}
        </div>
      </div>
    </SectionNavigation.Provider>
  );
}
