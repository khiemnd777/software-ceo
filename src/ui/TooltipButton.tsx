import { useEffect, useId, useState, type ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  tip?: string;
};

/** Keep the control's name available when the visible label is an icon. */
export function TooltipButton({
  label,
  tip = label,
  children,
  onClick,
  ...props
}: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", dismiss, true);
    return () => window.removeEventListener("keydown", dismiss, true);
  }, [open]);
  return (
    <button
      {...props}
      aria-label={label}
      aria-describedby={open ? id : undefined}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={(event) => {
        if (!event.currentTarget.matches(":focus-visible")) setOpen(false);
      }}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={(event) => {
        setOpen(false);
        onClick?.(event);
      }}
    >
      {children}
      {open && (
        <span id={id} role="tooltip" className="icon-tooltip">
          {tip}
        </span>
      )}
    </button>
  );
}
