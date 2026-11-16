import type {
  ButtonHTMLAttributes,
  CSSProperties,
  MouseEventHandler,
  ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import { Icon, type IconName } from "./Icon";
import Link from "next/link";

/* ---------- Button ---------- */
type Variant = "primary" | "amber" | "ghost" | "soft" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, { cls: string; chunk: string }> = {
  primary: {
    cls: "bg-primary text-on-primary",
    chunk: "var(--c-primary-deep)",
  },
  amber: { cls: "bg-amber text-[#2B2218]", chunk: "#B97610" },
  ghost: {
    cls: "bg-surface text-ink border-2 border-line",
    chunk: "var(--c-line)",
  },
  soft: { cls: "bg-leaf text-ink", chunk: "var(--c-line)" },
  danger: {
    cls: "bg-lava-soft text-ink border-2 border-lava",
    chunk: "var(--c-lava)",
  },
};

const SIZE: Record<Size, string> = {
  sm: "min-h-10 px-4 text-sm gap-1.5 rounded-xl",
  md: "min-h-12 px-5 text-base gap-2 rounded-2xl",
  lg: "min-h-14 px-7 text-lg gap-2.5 rounded-2xl",
};

interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  /** Jika diisi, tombol dirender sebagai tautan. */
  href?: string;
  children?: ReactNode;
  block?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  href,
  children,
  className,
  block,
  disabled,
  ...rest
}: ButtonProps) {
  const v = VARIANT[variant];
  const cls = cn(
    "chunky inline-flex select-none items-center justify-center font-display font-semibold leading-tight no-underline",
    SIZE[size],
    v.cls,
    block && "w-full",
    disabled && "opacity-50",
    className,
  );
  const style = { "--chunk": v.chunk } as CSSProperties;
  const inner = (
    <>
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 20} />}
      {children && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 16 : 20} />}
    </>
  );
  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={cls}
        style={style}
        aria-label={rest["aria-label"]}
        onClick={
          rest.onClick as unknown as
            | MouseEventHandler<HTMLAnchorElement>
            | undefined
        }
      >
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={cls}
      style={style}
      disabled={disabled}
      {...rest}
    >
      {inner}
    </button>
  );
}

/* ---------- Card ---------- */
export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag
      className={cn(
        "card-shadow rounded-3xl border border-line bg-surface p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* ---------- ProgressBar ---------- */
type Tone = "primary" | "amber" | "lava" | "ice";
const TONE_BG: Record<Tone, string> = {
  primary: "bg-primary",
  amber: "bg-amber",
  lava: "bg-lava",
  ice: "bg-ice",
};

export function ProgressBar({
  value,
  max = 100,
  tone = "primary",
  label,
  className,
  thick = false,
}: {
  value: number;
  max?: number;
  tone?: Tone;
  label: string;
  className?: string;
  thick?: boolean;
}) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      className={cn(
        "w-full overflow-hidden rounded-full bg-surface-2",
        thick ? "h-4" : "h-2.5",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          TONE_BG[tone],
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

/* ---------- Chip ---------- */
type ChipTone = "leaf" | "amber" | "lava" | "ice" | "plain";
const CHIP: Record<ChipTone, string> = {
  leaf: "bg-leaf",
  amber: "bg-amber-soft",
  lava: "bg-lava-soft",
  ice: "bg-ice-soft",
  plain: "bg-surface-2",
};

export function Chip({
  children,
  tone = "plain",
  icon,
  className,
}: {
  children: ReactNode;
  tone?: ChipTone;
  icon?: IconName;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-extrabold text-ink",
        CHIP[tone],
        className,
      )}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}

/* ---------- Eyebrow & judul bagian ---------- */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs font-extrabold uppercase tracking-[0.14em] text-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}

/* ---------- Toggle ---------- */
export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span className="min-w-0">
        <span className="block font-bold text-ink">{label}</span>
        {description && (
          <span className="block text-sm text-muted">{description}</span>
        )}
      </span>
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          role="switch"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="h-8 w-14 rounded-full bg-surface-2 ring-2 ring-line transition-colors peer-checked:bg-primary peer-checked:ring-primary peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber" />
        <span className="pointer-events-none absolute left-1 top-1 h-6 w-6 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-6" />
      </span>
    </label>
  );
}

/* ---------- Stat kecil ---------- */
export function StatTile({
  icon,
  label,
  value,
  tone = "plain",
}: {
  icon: IconName;
  label: string;
  value: ReactNode;
  tone?: ChipTone;
}) {
  return (
    <div
      className={cn("flex items-center gap-3 rounded-2xl p-3.5", CHIP[tone])}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-ink">
        <Icon name={icon} size={20} />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-xl font-semibold leading-none text-ink tabular-nums">
          {value}
        </span>
        <span className="mt-1 block text-xs font-bold text-muted">{label}</span>
      </span>
    </div>
  );
}
