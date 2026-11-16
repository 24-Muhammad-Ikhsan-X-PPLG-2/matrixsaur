import { useEffect, useMemo, useState } from "react";
import { Button, Chip, Eyebrow } from "@/components/ui/primitives";
import type { VizOperation } from "@/types";
import { cn } from "@/utils/cn";
import * as M from "@/utils/matrix";
import { cellKey, MatrixGrid, type CellHighlights } from "./MatrixGrid";
import { buildScene, VIZ_DEFAULTS, VIZ_TITLES, type VizInput } from "./vizSteps";

interface MatrixVisualizerProps {
  operation: VizOperation;
  className?: string;
}

/** Visualisasi matriks interaktif yang reusable untuk semua chapter. */
export function MatrixVisualizer({ operation, className }: MatrixVisualizerProps) {
  return (
    <section className={cn("card-shadow rounded-3xl border border-line bg-surface p-4 sm:p-6", className)} aria-label={`Visualisasi: ${VIZ_TITLES[operation]}`}>
      <Eyebrow>Visualisasi interaktif</Eyebrow>
      <h3 className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl">{VIZ_TITLES[operation]}</h3>
      {operation === "intro" ? <MatrixExplorer key="intro" /> : <VizPlayer key={operation} operation={operation} />}
    </section>
  );
}

const ORDERS: [number, number][] = [
  [2, 2],
  [2, 3],
  [3, 3],
];

function VizPlayer({ operation }: { operation: VizOperation }) {
  const [input, setInput] = useState<VizInput>(VIZ_DEFAULTS[operation]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const scene = useMemo(() => buildScene(operation, input), [operation, input]);
  const last = (scene?.steps.length ?? 1) - 1;
  const current = scene?.steps[Math.min(step, last)];
  const playingNow = playing && step < last;

  useEffect(() => {
    if (!playing || step >= last) return;
    const timer = window.setTimeout(() => setStep((s) => s + 1), 1500);
    return () => window.clearTimeout(timer);
  }, [playing, step, last]);

  if (!scene || !current) return null;

  const edit = (target: "A" | "B", i: number, j: number, value: number) => {
    setPlaying(false);
    setStep(0);
    setInput((prev) => ({ ...prev, [target]: prev[target].map((row, r) => row.map((v, c) => (r === i && c === j ? value : v))) }));
  };
  const setOrder = (r: number, c: number) => {
    setPlaying(false);
    setStep(0);
    setInput((prev) => ({ ...prev, A: M.resize(prev.A, r, c), B: M.resize(prev.B, r, c) }));
  };
  const setK = (k: number) => {
    setPlaying(false);
    setStep(0);
    setInput((prev) => ({ ...prev, k: Math.max(-9, Math.min(9, k)) }));
  };
  const resizable = operation === "add" || operation === "subtract";

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="amber">Kuning: elemen pertama</Chip>
        <Chip tone="ice">Biru: elemen kedua</Chip>
        <Chip tone="leaf">Hijau: hasil</Chip>
      </div>

      {(resizable || operation === "scalar") && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {resizable && (
            <>
              <span className="text-sm font-bold text-muted">Ordo:</span>
              {ORDERS.map(([r, c]) => {
                const active = M.rows(input.A) === r && M.cols(input.A) === c;
                return (
                  <button
                    key={`${r}x${c}`}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setOrder(r, c)}
                    className={cn("min-h-10 rounded-xl border-2 px-3.5 font-mono text-sm font-bold transition-colors", active ? "border-primary bg-leaf text-ink" : "border-line bg-surface text-muted hover:border-primary")}
                  >
                    {r} × {c}
                  </button>
                );
              })}
            </>
          )}
          {operation === "scalar" && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted">Skalar k:</span>
              <button type="button" aria-label="Kurangi skalar" onClick={() => setK(input.k - 1)} className="grid h-10 w-10 place-items-center rounded-xl border-2 border-line bg-surface font-mono text-lg font-bold text-ink hover:border-primary">
                −
              </button>
              <span className="grid h-10 min-w-12 place-items-center rounded-xl bg-amber-soft px-2 font-mono text-lg font-bold text-ink" aria-live="polite">
                {input.k < 0 ? `−${Math.abs(input.k)}` : input.k}
              </span>
              <button type="button" aria-label="Tambah skalar" onClick={() => setK(input.k + 1)} className="grid h-10 w-10 place-items-center rounded-xl border-2 border-line bg-surface font-mono text-lg font-bold text-ink hover:border-primary">
                +
              </button>
            </div>
          )}
        </div>
      )}

      <div className="strata scroll-x mt-4 rounded-2xl border border-line bg-bg">
        <div className="flex min-w-max flex-col items-center justify-center gap-x-3 gap-y-3 px-4 py-6 sm:min-w-0 sm:flex-row sm:flex-wrap sm:gap-y-5">
          {scene.items.map((item, i) =>
            typeof item === "string" ? (
              <span key={i} className="font-mono text-2xl font-bold text-ink sm:mt-6">
                {item}
              </span>
            ) : (
              <MatrixGrid
                key={item.key}
                data={item.data}
                label={item.label}
                editable={!!item.editable}
                onChange={item.editable ? (r, c, v) => edit(item.editable!, r, c, v) : undefined}
                highlights={current.highlights?.[item.key]}
                revealed={current.reveal?.[item.key]}
                className="rounded-2xl bg-surface px-3 py-2"
              />
            ),
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">Ubah angka di dalam matriks masukan untuk mencoba kasusmu sendiri.</p>

      <div className="mt-4 rounded-2xl bg-surface-2 p-4" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-muted">
            Langkah {Math.min(step, last) + 1} dari {last + 1}
          </span>
          <div className="flex gap-1" aria-hidden>
            {scene.steps.length <= 14 &&
              scene.steps.map((_, i) => <span key={i} className={cn("h-1.5 w-3 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-line")} />)}
          </div>
        </div>
        <p className="mt-2 font-bold text-ink">{current.caption}</p>
        {current.expr && (
          <div className="scroll-x mt-2">
            <p key={current.expr} className="animate-rise w-max rounded-xl bg-surface px-3 py-2 font-mono text-sm font-bold text-ink sm:text-base">
              {current.expr}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <Button variant="primary" size="sm" icon={playingNow ? "pause" : "play"} onClick={() => (step >= last ? (setStep(0), setPlaying(true)) : setPlaying((p) => !p))}>
          {playingNow ? "Jeda" : step >= last ? "Putar ulang" : "Putar animasi"}
        </Button>
        <Button variant="ghost" size="sm" icon="left" disabled={step === 0} onClick={() => (setPlaying(false), setStep((s) => Math.max(0, s - 1)))}>
          Mundur
        </Button>
        <Button variant="ghost" size="sm" iconRight="right" disabled={step >= last} onClick={() => (setPlaying(false), setStep((s) => Math.min(last, s + 1)))}>
          Maju
        </Button>
        <Button variant="ghost" size="sm" icon="refresh" onClick={() => (setPlaying(false), setStep(0), setInput(VIZ_DEFAULTS[operation]))}>
          Atur ulang
        </Button>
      </div>
    </div>
  );
}

/* ---------- Penjelajah matriks (Chapter 1) ---------- */
const PRESETS: { label: string; data: number[][] }[] = [
  { label: "Catatan telur", data: [[2, 5, 1], [4, 0, 3]] },
  { label: "Identitas", data: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] },
  { label: "Nol", data: [[0, 0], [0, 0]] },
  { label: "Diagonal", data: [[4, 0, 0], [0, -1, 0], [0, 0, 6]] },
  { label: "Segitiga atas", data: [[1, 2, 3], [0, 4, 5], [0, 0, 6]] },
  { label: "Baris", data: [[3, 1, 4]] },
  { label: "Kolom", data: [[2], [7], [5]] },
];

const SUBS = "₀₁₂₃₄₅₆₇₈₉";

function MatrixExplorer() {
  const [data, setData] = useState<number[][]>(PRESETS[0].data);
  const [focus, setFocus] = useState<[number, number]>([0, 1]);
  const r = M.rows(data);
  const c = M.cols(data);
  const fi = Math.min(focus[0], r - 1);
  const fj = Math.min(focus[1], c - 1);

  const highlights = useMemo(() => {
    const out: CellHighlights = {};
    for (let j = 0; j < c; j += 1) out[cellKey(fi, j)] = "a";
    for (let i = 0; i < r; i += 1) out[cellKey(i, fj)] = "b";
    out[cellKey(fi, fj)] = "result";
    return out;
  }, [r, c, fi, fj]);

  const kinds = M.classify(data);
  const resize = (nr: number, nc: number) => setData((prev) => M.resize(prev, Math.max(1, Math.min(4, nr)), Math.max(1, Math.min(4, nc))));

  return (
    <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button key={preset.label} type="button" onClick={() => setData(preset.data)} className="min-h-10 rounded-xl border-2 border-line bg-surface px-3 text-sm font-bold text-ink transition-colors hover:border-primary">
              {preset.label}
            </button>
          ))}
        </div>
        <div className="strata scroll-x mt-4 grid place-items-center rounded-2xl border border-line bg-bg px-4 py-6">
          <MatrixGrid data={data} label="A" editable showIndices highlights={highlights} onChange={(i, j, v) => setData((prev) => prev.map((row, ri) => row.map((x, ci) => (ri === i && ci === j ? v : x))))} onCellFocus={(i, j) => setFocus([i, j])} />
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <Stepper label="Baris" value={r} onChange={(v) => resize(v, c)} />
          <Stepper label="Kolom" value={c} onChange={(v) => resize(r, v)} />
        </div>
      </div>

      <div className="space-y-3" aria-live="polite">
        <div className="rounded-2xl bg-leaf p-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-muted">Elemen terpilih</p>
          <p className="mt-1 font-mono text-2xl font-bold text-ink">
            a{SUBS[fi + 1]}
            {SUBS[fj + 1]} = {data[fi][fj] < 0 ? `−${Math.abs(data[fi][fj])}` : data[fi][fj]}
          </p>
          <p className="mt-1 text-sm font-bold text-ink">
            Baris ke-{fi + 1} (kuning), kolom ke-{fj + 1} (biru).
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-amber-soft p-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-muted">Ordo</p>
            <p className="mt-1 font-mono text-2xl font-bold text-ink">
              {r} × {c}
            </p>
          </div>
          <div className="rounded-2xl bg-ice-soft p-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-muted">Banyak elemen</p>
            <p className="mt-1 font-mono text-2xl font-bold text-ink">{r * c}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-surface-2 p-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-muted">Jenis matriks</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {kinds.length > 0 ? kinds.map((kind) => <Chip key={kind} tone="leaf">{kind}</Chip>) : <Chip>Matriks 1 × 1</Chip>}
          </div>
        </div>
        <p className="text-sm text-muted">Klik sebuah sel untuk melihat baris dan kolomnya. Ubah angka atau ukuran, lalu lihat jenis matriksnya berubah.</p>
      </div>
    </div>
  );
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const btn = "grid h-10 w-10 place-items-center rounded-xl border-2 border-line bg-surface font-mono text-lg font-bold text-ink hover:border-primary disabled:opacity-40";
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold text-muted">{label}</span>
      <button type="button" className={btn} aria-label={`Kurangi ${label.toLowerCase()}`} disabled={value <= 1} onClick={() => onChange(value - 1)}>
        −
      </button>
      <span className="w-6 text-center font-mono text-lg font-bold text-ink">{value}</span>
      <button type="button" className={btn} aria-label={`Tambah ${label.toLowerCase()}`} disabled={value >= 4} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
