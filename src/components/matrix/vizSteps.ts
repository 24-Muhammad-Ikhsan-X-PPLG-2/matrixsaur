import type { MatrixCell, VizOperation } from "@/types";
import * as M from "@/utils/matrix";
import { cellKey, type CellHighlights, type CellTone } from "./MatrixGrid";

export interface VizPanel {
  key: string;
  label: string;
  data: MatrixCell[][];
  /** Panel ini dapat diedit dan terhubung ke input A atau B. */
  editable?: "A" | "B";
}

export interface VizStep {
  caption: string;
  expr?: string;
  highlights?: Record<string, CellHighlights>;
  /** Sel yang sudah terungkap per panel. Panel yang tidak disebut tampil penuh. */
  reveal?: Record<string, string[]>;
}

export interface VizScene {
  items: (VizPanel | string)[];
  steps: VizStep[];
}

type Num = M.NumMatrix;

const SUBS = "₀₁₂₃₄₅₆₇₈₉";
const sub = (n: number) => String(n).split("").map((d) => SUBS[Number(d)]).join("");
const idx = (i: number, j: number) => `${sub(i + 1)}${sub(j + 1)}`;
const fmt = (n: number) => (n < 0 ? `−${Math.abs(n)}` : `${Math.abs(n)}`);
const pn = (n: number) => (n < 0 ? `(−${Math.abs(n)})` : `${Math.abs(n)}`);
const frac = (n: number, d: number) => M.fraction(n, d).replace("-", "−");
const fracMatrix = (m: Num, d: number) => m.map((row) => row.map((v) => frac(v, d)));

function keys(r: number, c: number, tone: CellTone, filter: (i: number, j: number) => boolean = () => true): CellHighlights {
  const out: CellHighlights = {};
  for (let i = 0; i < r; i += 1) for (let j = 0; j < c; j += 1) if (filter(i, j)) out[cellKey(i, j)] = tone;
  return out;
}

const allKeys = (m: MatrixCell[][]) => Object.keys(keys(m.length, m[0].length, "a"));

/* ---------- Penjumlahan, pengurangan, skalar ---------- */
function elementwise(op: "add" | "subtract" | "scalar", A: Num, B: Num, k: number): VizScene {
  const C = op === "add" ? M.add(A, B) : op === "subtract" ? M.subtract(A, B) : M.scale(k, A);
  const sym = op === "add" ? "+" : "−";
  const items: VizScene["items"] =
    op === "scalar"
      ? [`${fmt(k)} ·`, { key: "A", label: "A", data: A, editable: "A" }, "=", { key: "C", label: `${fmt(k)}A`, data: C }]
      : [{ key: "A", label: "A", data: A, editable: "A" }, sym, { key: "B", label: "B", data: B, editable: "B" }, "=", { key: "C", label: `A ${sym} B`, data: C }];

  const steps: VizStep[] = [
    {
      caption:
        op === "scalar"
          ? `Skalar ${fmt(k)} dikalikan ke setiap elemen A, satu per satu.`
          : `Ordo A dan B sama (${M.rows(A)} × ${M.cols(A)}), jadi elemen yang seletak bisa ${op === "add" ? "dijumlahkan" : "dikurangkan"}.`,
      reveal: { C: [] },
    },
  ];
  const shown: string[] = [];
  A.forEach((row, i) =>
    row.forEach((a, j) => {
      const key = cellKey(i, j);
      shown.push(key);
      steps.push({
        caption: `Baris ${i + 1}, kolom ${j + 1}`,
        expr: op === "scalar" ? `${fmt(k)} · ${pn(a)} = ${fmt(C[i][j])}` : `${fmt(a)} ${sym} ${pn(B[i][j])} = ${fmt(C[i][j])}`,
        highlights: { A: { [key]: "a" }, B: { [key]: "b" }, C: { [key]: "result" } },
        reveal: { C: [...shown] },
      });
    }),
  );
  steps.push({ caption: "Selesai! Semua elemen sudah dihitung." });
  return { items, steps };
}

/* ---------- Perkalian baris × kolom ---------- */
function multiply(A: Num, B: Num): VizScene {
  const C = M.multiply(A, B);
  const steps: VizStep[] = [
    { caption: `Kolom A (${M.cols(A)}) sama dengan baris B (${M.rows(B)}), jadi AB terdefinisi dan berordo ${M.rows(A)} × ${M.cols(B)}.`, reveal: { C: [] } },
  ];
  const shown: string[] = [];
  C.forEach((row, i) =>
    row.forEach((value, j) => {
      const key = cellKey(i, j);
      shown.push(key);
      steps.push({
        caption: `c${idx(i, j)} = baris ${i + 1} dari A × kolom ${j + 1} dari B`,
        expr: `${A[i].map((v, n) => `${pn(v)}·${pn(B[n][j])}`).join(" + ")} = ${fmt(value)}`,
        highlights: {
          A: keys(M.rows(A), M.cols(A), "a", (r) => r === i),
          B: keys(M.rows(B), M.cols(B), "b", (_, c) => c === j),
          C: { [key]: "result" },
        },
        reveal: { C: [...shown] },
      });
    }),
  );
  steps.push({ caption: "Selesai! Setiap elemen hasil adalah baris dikali kolom." });
  return {
    items: [{ key: "A", label: "A", data: A, editable: "A" }, "×", { key: "B", label: "B", data: B, editable: "B" }, "=", { key: "C", label: "AB", data: C }],
    steps,
  };
}

/* ---------- Transpose ---------- */
function transpose(A: Num): VizScene {
  const T = M.transpose(A);
  const steps: VizStep[] = [{ caption: `A berordo ${M.rows(A)} × ${M.cols(A)}, jadi Aᵀ berordo ${M.cols(A)} × ${M.rows(A)}.`, reveal: { T: [] } }];
  const shown: string[] = [];
  A.forEach((row, i) =>
    row.forEach((value, j) => {
      shown.push(cellKey(j, i));
      steps.push({
        caption: `Baris ${i + 1} menjadi kolom ${i + 1}: a${idx(i, j)} pindah ke baris ${j + 1}, kolom ${i + 1}.`,
        expr: `(Aᵀ)${idx(j, i)} = a${idx(i, j)} = ${fmt(value)}`,
        highlights: { A: { [cellKey(i, j)]: "a" }, T: { [cellKey(j, i)]: "result" } },
        reveal: { T: [...shown] },
      });
    }),
  );
  steps.push({ caption: "Selesai! Setiap baris A sekarang menjadi kolom Aᵀ." });
  return { items: [{ key: "A", label: "A", data: A, editable: "A" }, "→", { key: "T", label: "Aᵀ", data: T }], steps };
}

/* ---------- Kesamaan ---------- */
function equality(A: Num, B: Num): VizScene {
  const steps: VizStep[] = [{ caption: "Ordo A dan B sama (2 × 2). Sekarang bandingkan elemen yang seletak." }];
  const marks: CellHighlights = {};
  let different = 0;
  A.forEach((row, i) =>
    row.forEach((a, j) => {
      const same = a === B[i][j];
      if (!same) different += 1;
      marks[cellKey(i, j)] = same ? "good" : "bad";
      steps.push({
        caption: `Baris ${i + 1}, kolom ${j + 1}: ${same ? "sama" : "berbeda"}.`,
        expr: `${fmt(a)} ${same ? "=" : "≠"} ${fmt(B[i][j])}`,
        highlights: { A: { ...marks }, B: { ...marks } },
      });
    }),
  );
  steps.push({
    caption: different === 0 ? "Semua elemen seletak sama, jadi A = B." : `Ada ${different} elemen seletak yang berbeda, jadi A ≠ B.`,
    expr: different === 0 ? "A = B" : "A ≠ B",
    highlights: { A: { ...marks }, B: { ...marks } },
  });
  return { items: [{ key: "A", label: "A", data: A, editable: "A" }, "≟", { key: "B", label: "B", data: B, editable: "B" }], steps };
}

/* ---------- Determinan 2×2 ---------- */
const MAIN2: CellHighlights = { "0-0": "a", "1-1": "a" };
const SIDE2: CellHighlights = { "0-1": "b", "1-0": "b" };

function det2(A: Num): VizScene {
  const [[a, b], [c, d]] = A;
  const det = M.det2(A);
  return {
    items: [{ key: "A", label: "A", data: A, editable: "A" }],
    steps: [
      { caption: "Determinan 2 × 2 dihitung dari dua diagonal: det A = ad − bc." },
      { caption: "Kalikan diagonal utama (kiri atas ke kanan bawah).", expr: `${fmt(a)} · ${pn(d)} = ${fmt(a * d)}`, highlights: { A: MAIN2 } },
      { caption: "Kalikan diagonal samping (kanan atas ke kiri bawah).", expr: `${fmt(b)} · ${pn(c)} = ${fmt(b * c)}`, highlights: { A: SIDE2 } },
      {
        caption: det === 0 ? "det A = 0 → matriks singular, tidak punya invers." : "det A ≠ 0 → matriks nonsingular, punya invers.",
        expr: `det A = ${fmt(a * d)} − ${pn(b * c)} = ${fmt(det)}`,
        highlights: { A: { ...MAIN2, ...SIDE2 } },
      },
    ],
  };
}

/* ---------- Invers 2×2 ---------- */
function inverse2(A: Num): VizScene {
  const [[a, b], [c, d]] = A;
  const det = M.det2(A);
  const adj = M.adjoint2(A);
  const items: VizScene["items"] = [{ key: "A", label: "A", data: A, editable: "A" }, "→", { key: "J", label: "adj A", data: adj }, "→", { key: "I", label: "A⁻¹", data: fracMatrix(adj, det) }];
  const hide = { J: [], I: [] };
  const steps: VizStep[] = [
    { caption: "Langkah 1: hitung determinan.", expr: `det A = ${fmt(a)}·${pn(d)} − ${pn(b)}·${pn(c)} = ${fmt(det)}`, highlights: { A: { ...MAIN2, ...SIDE2 } }, reveal: hide },
  ];
  if (det === 0) {
    steps.push({ caption: "det A = 0, jadi A tidak memiliki invers. Ubah angkanya untuk mencoba lagi.", expr: "A⁻¹ tidak ada", reveal: hide });
    return { items, steps };
  }
  steps.push(
    { caption: "Langkah 2: tukar posisi a dan d.", highlights: { A: MAIN2, J: { "0-0": "result", "1-1": "result" } }, reveal: { J: ["0-0", "1-1"], I: [] } },
    { caption: "Langkah 3: beri tanda negatif pada b dan c.", highlights: { A: SIDE2, J: { "0-1": "result", "1-0": "result" } }, reveal: { I: [] } },
    { caption: `Langkah 4: kalikan setiap elemen dengan 1/${pn(det)}.`, expr: `A⁻¹ = 1/${pn(det)} · adj A`, highlights: { I: keys(2, 2, "result") } },
  );
  return { items, steps };
}

/* ---------- Persamaan AX = B ---------- */
function equation(A: Num, B: Num): VizScene {
  const [[a, b], [c, d]] = A;
  const [p, q] = [B[0][0], B[1][0]];
  const det = M.det2(A);
  const xn = d * p - b * q;
  const yn = -c * p + a * q;
  const items: VizScene["items"] = [
    { key: "A", label: "A", data: A, editable: "A" },
    { key: "V", label: "X", data: [["x"], ["y"]] },
    "=",
    { key: "B", label: "B", data: B, editable: "B" },
    "→",
    { key: "X", label: "Hasil", data: [[frac(xn, det)], [frac(yn, det)]] },
  ];
  const steps: VizStep[] = [
    { caption: "Persamaan AX = B diselesaikan dengan X = A⁻¹ · B.", reveal: { X: [] } },
    { caption: "Hitung determinan A.", expr: `det A = ${fmt(a)}·${pn(d)} − ${pn(b)}·${pn(c)} = ${fmt(det)}`, highlights: { A: { ...MAIN2, ...SIDE2 } }, reveal: { X: [] } },
  ];
  if (det === 0) {
    steps.push({ caption: "det A = 0: A tidak punya invers, jadi cara ini tidak bisa dipakai. Ubah angkanya.", reveal: { X: [] } });
    return { items, steps };
  }
  steps.push(
    { caption: "Susun A⁻¹: tukar a dan d, negatifkan b dan c, kalikan 1/det.", expr: `A⁻¹ = 1/${pn(det)} · [ ${fmt(d)}  ${fmt(-b)} ; ${fmt(-c)}  ${fmt(a)} ]`, highlights: { A: keys(2, 2, "a") }, reveal: { X: [] } },
    { caption: "Baris 1 dari A⁻¹ dikali B menghasilkan x.", expr: `x = (${pn(d)}·${pn(p)} + ${pn(-b)}·${pn(q)}) / ${pn(det)} = ${frac(xn, det)}`, highlights: { B: keys(2, 1, "b"), X: { "0-0": "result" } }, reveal: { X: ["0-0"] } },
    { caption: "Baris 2 dari A⁻¹ dikali B menghasilkan y.", expr: `y = (${pn(-c)}·${pn(p)} + ${pn(a)}·${pn(q)}) / ${pn(det)} = ${frac(yn, det)}`, highlights: { B: keys(2, 1, "b"), X: { "1-0": "result" } } },
    { caption: "Selesai!", expr: `x = ${frac(xn, det)},  y = ${frac(yn, det)}`, highlights: { X: keys(2, 1, "result") } },
  );
  return { items, steps };
}

/* ---------- Determinan 3×3 (Sarrus) ---------- */
function det3(A: Num): VizScene {
  const E = A.map((row) => [...row, row[0], row[1]]);
  const det = M.det3(A);
  const steps: VizStep[] = [{ caption: "Salin kolom 1 dan kolom 2 ke sebelah kanan matriks.", highlights: { E: keys(3, 5, "result", (_, j) => j >= 3) } }];
  const downs: number[] = [];
  const ups: number[] = [];
  for (let k = 0; k < 3; k += 1) {
    const v = [E[0][k], E[1][k + 1], E[2][k + 2]];
    downs.push(v[0] * v[1] * v[2]);
    steps.push({
      caption: `Diagonal turun ke-${k + 1} (dijumlahkan).`,
      expr: `${v.map(pn).join(" · ")} = ${fmt(downs[k])}`,
      highlights: { E: { [cellKey(0, k)]: "a", [cellKey(1, k + 1)]: "a", [cellKey(2, k + 2)]: "a" } },
    });
  }
  for (let k = 0; k < 3; k += 1) {
    const v = [E[2][k], E[1][k + 1], E[0][k + 2]];
    ups.push(v[0] * v[1] * v[2]);
    steps.push({
      caption: `Diagonal naik ke-${k + 1} (dikurangkan).`,
      expr: `${v.map(pn).join(" · ")} = ${fmt(ups[k])}`,
      highlights: { E: { [cellKey(2, k)]: "b", [cellKey(1, k + 1)]: "b", [cellKey(0, k + 2)]: "b" } },
    });
  }
  steps.push({
    caption: det === 0 ? "det A = 0 → matriks singular." : "Jumlah diagonal turun dikurangi jumlah diagonal naik.",
    expr: `det A = (${downs.map(pn).join(" + ")}) − (${ups.map(pn).join(" + ")}) = ${fmt(det)}`,
  });
  return { items: [{ key: "A", label: "A", data: A, editable: "A" }, "→", { key: "E", label: "A dengan kolom 1–2 disalin", data: E }], steps };
}

/* ---------- Invers 3×3 ---------- */
function inverse3(A: Num): VizScene {
  const K = M.cofactorMatrix3(A);
  const adj = M.transpose(K);
  const det = M.det3(A);
  const items: VizScene["items"] = [
    { key: "A", label: "A", data: A, editable: "A" },
    "→",
    { key: "K", label: "Kofaktor K", data: K },
    "→",
    { key: "J", label: "adj A = Kᵀ", data: adj },
    "→",
    { key: "I", label: "A⁻¹", data: fracMatrix(adj, det) },
  ];
  const steps: VizStep[] = [{ caption: "Hitung minor dan kofaktor untuk kesembilan posisi.", reveal: { K: [], J: [], I: [] } }];
  const shown: string[] = [];
  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      const m = M.minorMatrix(A, i, j);
      const minor = M.det2(m);
      shown.push(cellKey(i, j));
      steps.push({
        caption: `Hapus baris ${i + 1} dan kolom ${j + 1}. Tanda kofaktor: ${(i + j) % 2 === 0 ? "+" : "−"}.`,
        expr: `M${idx(i, j)} = ${pn(m[0][0])}·${pn(m[1][1])} − ${pn(m[0][1])}·${pn(m[1][0])} = ${fmt(minor)}  →  C${idx(i, j)} = ${fmt(K[i][j])}`,
        highlights: { A: { ...keys(3, 3, "a"), ...keys(3, 3, "dim", (r, c) => r === i || c === j) }, K: { [cellKey(i, j)]: "result" } },
        reveal: { K: [...shown], J: [], I: [] },
      });
    }
  }
  steps.push({
    caption: "Determinan dengan ekspansi kofaktor baris pertama.",
    expr: `det A = ${A[0].map((v, j) => `${pn(v)}·${pn(K[0][j])}`).join(" + ")} = ${fmt(det)}`,
    highlights: { A: keys(3, 3, "a", (r) => r === 0), K: keys(3, 3, "b", (r) => r === 0) },
    reveal: { J: [], I: [] },
  });
  if (det === 0) {
    steps.push({ caption: "det A = 0, jadi A tidak memiliki invers. Ubah angkanya untuk mencoba lagi.", expr: "A⁻¹ tidak ada", reveal: { J: [], I: [] } });
    return { items, steps };
  }
  steps.push(
    { caption: "Transpose matriks kofaktor untuk mendapat adj A.", highlights: { J: keys(3, 3, "result") }, reveal: { I: [] } },
    { caption: `Kalikan adj A dengan 1/${pn(det)}.`, expr: `A⁻¹ = 1/${pn(det)} · adj A`, highlights: { I: keys(3, 3, "result") } },
  );
  return { items, steps };
}

/* ---------- Titik masuk ---------- */
export interface VizInput {
  A: Num;
  B: Num;
  k: number;
}

export const VIZ_DEFAULTS: Record<VizOperation, VizInput> = {
  intro: { A: [[2, 5, 1], [4, 0, 3]], B: [[0]], k: 1 },
  equality: { A: [[2, 5], [1, 3]], B: [[2, 5], [1, 4]], k: 1 },
  add: { A: [[1, 2], [3, 4]], B: [[5, 6], [7, 8]], k: 1 },
  subtract: { A: [[9, 7], [5, 8]], B: [[4, 2], [6, 3]], k: 1 },
  scalar: { A: [[2, -1], [0, 4]], B: [[0]], k: 3 },
  multiply: { A: [[1, 0, 2], [-1, 3, 1]], B: [[3, 1], [2, 1], [1, 0]], k: 1 },
  transpose: { A: [[1, 2, 3], [4, 5, 6]], B: [[0]], k: 1 },
  det2: { A: [[3, 2], [1, 4]], B: [[0]], k: 1 },
  inverse2: { A: [[4, 7], [2, 6]], B: [[0]], k: 1 },
  equation: { A: [[2, 1], [3, 2]], B: [[7], [12]], k: 1 },
  det3: { A: [[1, 2, 3], [0, 4, 5], [1, 0, 6]], B: [[0]], k: 1 },
  inverse3: { A: [[1, 2, 3], [0, 1, 4], [5, 6, 0]], B: [[0]], k: 1 },
};

export const VIZ_TITLES: Record<VizOperation, string> = {
  intro: "Jelajahi baris, kolom, dan ordo",
  equality: "Bandingkan elemen seletak",
  add: "Penjumlahan elemen seletak",
  subtract: "Pengurangan elemen seletak",
  scalar: "Skalar mengalikan setiap elemen",
  multiply: "Baris dikali kolom",
  transpose: "Baris menjadi kolom",
  det2: "Dua diagonal determinan",
  inverse2: "Empat langkah invers 2 × 2",
  equation: "Menyelesaikan AX = B",
  det3: "Enam diagonal Sarrus",
  inverse3: "Minor, kofaktor, adjoin, invers",
};

export function buildScene(op: VizOperation, { A, B, k }: VizInput): VizScene | null {
  switch (op) {
    case "add":
    case "subtract":
    case "scalar":
      return elementwise(op, A, B, k);
    case "multiply":
      return multiply(A, B);
    case "transpose":
      return transpose(A);
    case "equality":
      return equality(A, B);
    case "det2":
      return det2(A);
    case "inverse2":
      return inverse2(A);
    case "equation":
      return equation(A, B);
    case "det3":
      return det3(A);
    case "inverse3":
      return inverse3(A);
    default:
      return null;
  }
}

export { allKeys };
