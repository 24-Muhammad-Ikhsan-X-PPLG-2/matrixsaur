import { useState } from "react";
import type { MathPart, MatrixCell } from "@/types";
import { cn } from "@/utils/cn";

export type CellTone = "a" | "b" | "result" | "good" | "bad" | "dim";
export type CellHighlights = Record<string, CellTone>;

export const cellKey = (i: number, j: number) => `${i}-${j}`;

const TONE: Record<CellTone, string> = {
  a: "bg-amber-soft ring-2 ring-amber",
  b: "bg-ice-soft ring-2 ring-ice",
  result: "bg-leaf ring-2 ring-primary",
  good: "bg-leaf ring-2 ring-primary",
  bad: "bg-lava-soft ring-2 ring-lava",
  dim: "opacity-30",
};

/** Menampilkan bilangan negatif dengan tanda minus tipografis. */
export function formatCell(value: MatrixCell): string {
  if (typeof value === "number") return value < 0 ? `−${Math.abs(value)}` : `${value}`;
  return value.replace(/^-/, "−");
}

interface MatrixGridProps {
  data: MatrixCell[][];
  label?: string;
  editable?: boolean;
  onChange?: (i: number, j: number, value: number) => void;
  highlights?: CellHighlights;
  /** Sel yang belum terungkap ditampilkan sebagai titik. Jika tidak diisi, semua sel terlihat. */
  revealed?: string[];
  /** Tampilkan label B1, B2 (baris) dan K1, K2 (kolom). */
  showIndices?: boolean;
  size?: "sm" | "md";
  onCellFocus?: (i: number, j: number) => void;
  className?: string;
}

/** Grid matriks reusable: statis, dapat diedit, dan mendukung highlight per sel. */
export function MatrixGrid({ data, label, editable = false, onChange, highlights, revealed, showIndices = false, size = "md", onCellFocus, className }: MatrixGridProps) {
  const colCount = data[0]?.length ?? 0;
  const fixed = editable || showIndices;
  const cellH = size === "md" ? "h-11" : "h-8";
  const cellW = fixed ? (size === "md" ? "w-11" : "w-8") : size === "md" ? "min-w-11" : "min-w-8";
  const text = size === "md" ? "text-base" : "text-sm";
  const template = fixed ? `repeat(${colCount}, ${size === "md" ? "2.75rem" : "2rem"})` : `repeat(${colCount}, auto)`;

  const grid = (
    <div className="relative px-2.5 py-1.5" role="table" aria-label={label ? `Matriks ${label}` : "Matriks"}>
      <span aria-hidden className="absolute inset-y-0 left-0 w-2 rounded-l-md border-y-[3px] border-l-[3px] border-ink" />
      <span aria-hidden className="absolute inset-y-0 right-0 w-2 rounded-r-md border-y-[3px] border-r-[3px] border-ink" />
      <div className="grid gap-1.5" style={{ gridTemplateColumns: template }}>
        {data.map((row, i) => (
          <div key={i} role="row" className="contents">
            {row.map((value, j) => {
              const key = cellKey(i, j);
              const tone = highlights?.[key];
              const hidden = revealed !== undefined && !revealed.includes(key);
              const base = cn("grid place-items-center rounded-lg px-1 font-mono font-bold tabular-nums text-ink transition-all duration-300", cellH, cellW, text, tone && TONE[tone]);
              if (editable && typeof value === "number") {
                return (
                  <div key={key} role="cell" className={cn(base, "p-0", !tone && "bg-surface-2")}>
                    <NumberCell value={value} label={`${label ?? "Matriks"} baris ${i + 1} kolom ${j + 1}`} onChange={(n) => onChange?.(i, j, n)} onFocus={() => onCellFocus?.(i, j)} />
                  </div>
                );
              }
              return (
                <div
                  key={key}
                  role="cell"
                  tabIndex={onCellFocus ? 0 : undefined}
                  onMouseEnter={onCellFocus ? () => onCellFocus(i, j) : undefined}
                  onFocus={onCellFocus ? () => onCellFocus(i, j) : undefined}
                  className={cn(base, "whitespace-nowrap", hidden && "text-muted")}
                >
                  {hidden ? "·" : formatCell(value)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn("inline-flex flex-col items-center gap-1.5", className)}>
      {label && <span className="font-display text-sm font-semibold text-muted">{label}</span>}
      {showIndices ? (
        <div className="grid items-center gap-x-1.5 gap-y-1" style={{ gridTemplateColumns: "auto auto" }}>
          <span />
          <div className="grid gap-1.5 px-2.5" style={{ gridTemplateColumns: template }} aria-hidden>
            {Array.from({ length: colCount }, (_, j) => (
              <span key={j} className="text-center text-[11px] font-extrabold text-muted">
                K{j + 1}
              </span>
            ))}
          </div>
          <div className="grid gap-1.5 py-1.5" aria-hidden>
            {data.map((_, i) => (
              <span key={i} className={cn("grid place-items-center text-[11px] font-extrabold text-muted", cellH)}>
                B{i + 1}
              </span>
            ))}
          </div>
          {grid}
        </div>
      ) : (
        grid
      )}
    </div>
  );
}

/** Input angka bulat (−99 sampai 99) yang tetap nyaman saat mengetik tanda minus. */
function NumberCell({ value, onChange, onFocus, label }: { value: number; onChange: (n: number) => void; onFocus?: () => void; label: string }) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);
  const display = focused ? text : String(value);

  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      value={display}
      onFocus={(e) => {
        setFocused(true);
        e.target.select();
        onFocus?.();
      }}
      onBlur={() => {
        setFocused(false);
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^\d-]/g, "").slice(0, 3);
        setText(raw);
        const n = Number.parseInt(raw, 10);
        if (Number.isFinite(n)) onChange(Math.max(-99, Math.min(99, n)));
        else if (raw === "") onChange(0);
      }}
      className="h-full w-full rounded-lg bg-transparent text-center font-mono font-bold text-ink outline-none focus-visible:ring-2 focus-visible:ring-amber"
    />
  );
}

/** Menampilkan potongan ekspresi: teks dan matriks berdampingan. */
export function MathRow({ parts, size = "sm", className }: { parts: MathPart[]; size?: "sm" | "md"; className?: string }) {
  return (
    <div className={cn("scroll-x max-w-full", className)}>
      <div className="flex w-max items-center gap-2.5 py-1">
        {parts.map((part, i) =>
          typeof part === "string" ? (
            <span key={i} className="whitespace-nowrap font-mono text-sm font-bold text-ink sm:text-base">
              {part}
            </span>
          ) : (
            <MatrixGrid key={i} data={part} size={size} />
          ),
        )}
      </div>
    </div>
  );
}
