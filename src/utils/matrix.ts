/** Utilitas matematika matriks — fungsi murni, tanpa UI. */

export type NumMatrix = number[][];

export const rows = (m: NumMatrix) => m.length;
export const cols = (m: NumMatrix) => (m[0] ? m[0].length : 0);

export function create(r: number, c: number, fill: (i: number, j: number) => number = () => 0): NumMatrix {
  return Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => fill(i, j)));
}

export function resize(m: NumMatrix, r: number, c: number): NumMatrix {
  return create(r, c, (i, j) => m[i]?.[j] ?? 0);
}

export const add = (a: NumMatrix, b: NumMatrix): NumMatrix => a.map((row, i) => row.map((v, j) => v + b[i][j]));
export const subtract = (a: NumMatrix, b: NumMatrix): NumMatrix => a.map((row, i) => row.map((v, j) => v - b[i][j]));
export const scale = (k: number, a: NumMatrix): NumMatrix => a.map((row) => row.map((v) => k * v));
export const transpose = (a: NumMatrix): NumMatrix => create(cols(a), rows(a), (i, j) => a[j][i]);

export function multiply(a: NumMatrix, b: NumMatrix): NumMatrix {
  return create(rows(a), cols(b), (i, j) => a[i].reduce((sum, v, k) => sum + v * b[k][j], 0));
}

export const det2 = (m: NumMatrix): number => m[0][0] * m[1][1] - m[0][1] * m[1][0];

export function det3(m: NumMatrix): number {
  const [[a, b, c], [d, e, f], [g, h, i]] = m;
  return a * e * i + b * f * g + c * d * h - (c * e * g + a * f * h + b * d * i);
}

/** Submatriks setelah baris i dan kolom j dihapus. */
export function minorMatrix(m: NumMatrix, i: number, j: number): NumMatrix {
  return m.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));
}

export const minor3 = (m: NumMatrix, i: number, j: number): number => det2(minorMatrix(m, i, j));
export const cofactor3 = (m: NumMatrix, i: number, j: number): number => ((i + j) % 2 === 0 ? 1 : -1) * minor3(m, i, j);
export const cofactorMatrix3 = (m: NumMatrix): NumMatrix => create(3, 3, (i, j) => cofactor3(m, i, j));
export const adjoint3 = (m: NumMatrix): NumMatrix => transpose(cofactorMatrix3(m));

/** Adjoin matriks 2×2: tukar diagonal utama, negatifkan diagonal samping. */
export const adjoint2 = (m: NumMatrix): NumMatrix => [
  [m[1][1], -m[0][1]],
  [-m[1][0], m[0][0]],
];

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** Menulis n/d sebagai pecahan paling sederhana, mis. 6/4 → "3/2". */
export function fraction(n: number, d: number): string {
  if (d === 0) return "∅";
  if (n === 0) return "0";
  const g = gcd(n, d) || 1;
  let num = n / g;
  let den = d / g;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  return den === 1 ? `${num}` : `${num}/${den}`;
}

export const fractionMatrix = (m: NumMatrix, d: number): string[][] => m.map((row) => row.map((v) => fraction(v, d)));

/** Tanda kurung untuk bilangan negatif di dalam ekspresi: -3 → (-3). */
export const paren = (n: number): string => (n < 0 ? `(${n})` : `${n}`);

export function isSameOrder(a: NumMatrix, b: NumMatrix): boolean {
  return rows(a) === rows(b) && cols(a) === cols(b);
}

/** Mengenali jenis-jenis matriks untuk chapter Pengenalan. */
export function classify(m: NumMatrix): string[] {
  const r = rows(m);
  const c = cols(m);
  const kinds: string[] = [];
  const all = (test: (v: number, i: number, j: number) => boolean) => m.every((row, i) => row.every((v, j) => test(v, i, j)));

  if (all((v) => v === 0)) kinds.push("Matriks nol");
  if (r === 1 && c > 1) kinds.push("Matriks baris");
  if (c === 1 && r > 1) kinds.push("Matriks kolom");
  if (r !== c) {
    if (r > 1 && c > 1) kinds.push("Matriks persegi panjang");
    return kinds;
  }
  kinds.push("Matriks persegi");
  if (r < 2) return kinds;

  const diagonal = all((v, i, j) => i === j || v === 0);
  const upper = all((v, i, j) => i <= j || v === 0);
  const lower = all((v, i, j) => i >= j || v === 0);
  if (diagonal && all((v, i, j) => i !== j || v === 1)) kinds.push("Matriks identitas");
  if (diagonal) kinds.push("Matriks diagonal");
  else if (upper) kinds.push("Matriks segitiga atas");
  else if (lower) kinds.push("Matriks segitiga bawah");
  if (all((v, i, j) => v === m[j][i]) && !diagonal) kinds.push("Matriks simetris");
  return kinds;
}
