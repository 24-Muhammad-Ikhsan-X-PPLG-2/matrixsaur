import type { MathPart, SeedQuizQuestion } from "@/types";

const mcq = (chapterId: number, n: number, prompt: string, options: string[], answerIndex: number, explanation: string, math?: MathPart[]): SeedQuizQuestion => ({
  id: `q${chapterId}-${n}`,
  chapterId,
  type: "mcq",
  prompt,
  options,
  answerIndex,
  explanation,
  math,
});

const num = (chapterId: number, n: number, prompt: string, answer: number, explanation: string, math?: MathPart[]): SeedQuizQuestion => ({
  id: `q${chapterId}-${n}`,
  chapterId,
  type: "numeric",
  prompt,
  answer,
  explanation,
  math,
});

/** Bank soal sumber seeder: 5 soal per chapter. Kunci jawaban hanya untuk quiz_question_keys. */
export const QUESTIONS: SeedQuizQuestion[] = [
  // 1 — Pengenalan Matriks
  mcq(1, 1, "Berapakah ordo matriks berikut?", ["3 × 2", "2 × 3", "2 × 2", "6 × 1"], 1, "Ada 2 baris dan 3 kolom, jadi ordonya 2 × 3. Baris selalu disebut lebih dulu.", [[[1, 2, 3], [4, 5, 6]]]),
  num(1, 2, "Tentukan nilai elemen a₃₁ dari matriks P.", 3, "a₃₁ adalah elemen baris ke-3 kolom ke-1, yaitu 3.", ["P =", [[7, -2, 4], [1, 9, 0], [3, 6, -5]]]),
  num(1, 3, "Berapa banyak elemen pada matriks berordo 4 × 3?", 12, "Banyak elemen = m · n = 4 · 3 = 12."),
  mcq(1, 4, "Matriks berikut disebut matriks…", ["Nol", "Baris", "Identitas", "Kolom"], 2, "Diagonal utamanya 1 dan elemen lainnya 0, jadi ini matriks identitas.", [[[1, 0], [0, 1]]]),
  mcq(1, 5, "Matriks berikut termasuk jenis matriks…", ["Kolom", "Baris", "Persegi", "Diagonal"], 0, "Hanya ada satu kolom (ordo 3 × 1), jadi ini matriks kolom.", [[[2], [7], [5]]]),

  // 2 — Kesamaan Matriks
  mcq(2, 1, "Dua matriks A dan B dikatakan sama jika…", ["Banyak elemennya sama", "Ordonya sama dan elemen seletaknya sama", "Determinannya sama", "Jumlah semua elemennya sama"], 1, "Syarat kesamaan: ordo sama dan setiap elemen seletak sama."),
  num(2, 2, "Tentukan nilai x agar kedua matriks sama.", 6, "Elemen baris 1 kolom 1 harus sama: x = 6.", [[["x", 3], [5, 8]], "=", [[6, 3], [5, 8]]]),
  num(2, 3, "Tentukan nilai y agar kedua matriks sama.", 7, "2y = 14, sehingga y = 7.", [[[4, "2y"], [1, 3]], "=", [[4, 14], [1, 3]]]),
  num(2, 4, "Jika kedua matriks sama, tentukan nilai a + b.", 11, "a + 2 = 9 → a = 7. 3b = 12 → b = 4. Jadi a + b = 11.", [[["a + 2", 5], [0, "3b"]], "=", [[9, 5], [0, 12]]]),
  mcq(2, 5, "Apakah kedua matriks berikut sama?", ["Ya, karena elemennya sama", "Ya, karena banyak elemennya sama", "Tidak, karena ordonya berbeda", "Tidak, karena jumlah elemennya berbeda"], 2, "Yang pertama berordo 1 × 3, yang kedua 3 × 1. Ordo berbeda, jadi tidak sama.", [[[1, 2, 3]], "dan", [[1], [2], [3]]]),

  // 3 — Penjumlahan Matriks
  mcq(3, 1, "Matriks berordo 2 × 3 hanya dapat dijumlahkan dengan matriks berordo…", ["3 × 2", "2 × 2", "3 × 3", "2 × 3"], 3, "Syarat penjumlahan: ordo kedua matriks harus sama."),
  num(3, 2, "Tentukan elemen baris 2 kolom 1 dari A + B.", 10, "Elemen seletak dijumlahkan: 3 + 7 = 10.", ["A =", [[1, 2], [3, 4]], ", B =", [[5, 6], [7, 8]]]),
  mcq(3, 3, "Hasil penjumlahan berikut adalah…", ["[[6, 5], [−2, 6]]", "[[6, 5], [0, 0]]", "[[8, 0], [−1, −9]]", "[[−2, −5], [−2, 6]]"], 1, "2 + 4 = 6, 0 + 5 = 5, −1 + 1 = 0, 3 + (−3) = 0.", [[[2, 0], [-1, 3]], "+", [[4, 5], [1, -3]]]),
  num(3, 4, "Tentukan nilai x.", 5, "x + 4 = 9, sehingga x = 5.", [[["x", 1], [2, 3]], "+", [[4, 0], [1, 2]], "=", [[9, 1], [3, 5]]]),
  mcq(3, 5, "Sifat A + B = B + A disebut sifat…", ["Asosiatif", "Distributif", "Komutatif", "Identitas"], 2, "Urutan penjumlahan boleh ditukar — itulah sifat komutatif."),

  // 4 — Pengurangan Matriks
  num(4, 1, "Tentukan elemen baris 2 kolom 1 dari A − B.", -1, "5 − 6 = −1.", ["A =", [[9, 7], [5, 8]], ", B =", [[4, 2], [6, 3]]]),
  mcq(4, 2, "Hasil pengurangan berikut adalah…", ["[[4, −1], [0, 7]]", "[[4, 1], [0, 5]]", "[[6, 7], [4, 5]]", "[[4, −1], [0, 5]]"], 0, "5 − 1 = 4, 3 − 4 = −1, 2 − 2 = 0, 6 − (−1) = 7.", [[[5, 3], [2, 6]], "−", [[1, 4], [2, -1]]]),
  num(4, 3, "Tentukan elemen baris 2 kolom 2 dari P − Q.", 11, "5 − (−6) = 5 + 6 = 11.", ["P =", [[3, -2], [0, 5]], ", Q =", [[-1, 4], [2, -6]]]),
  mcq(4, 4, "Untuk sembarang matriks A, hasil A − A adalah…", ["Matriks identitas", "Matriks A", "Matriks nol", "Tidak terdefinisi"], 2, "Setiap elemen dikurangi dirinya sendiri menghasilkan 0, jadi hasilnya matriks nol."),
  num(4, 5, "Matriks X memenuhi X + A = B. Tentukan elemen baris 2 kolom 2 dari X.", 5, "X = B − A, sehingga elemen baris 2 kolom 2 adalah 9 − 4 = 5.", ["A =", [[2, 1], [3, 4]], ", B =", [[6, 5], [4, 9]]]),

  // 5 — Perkalian Skalar
  mcq(5, 1, "Skalar adalah…", ["Matriks berordo 2 × 2", "Bilangan tunggal, bukan matriks", "Matriks yang semua elemennya 0", "Elemen diagonal utama"], 1, "Skalar adalah bilangan real tunggal seperti 3, −2, atau ½."),
  num(5, 2, "Tentukan elemen baris 2 kolom 2 dari 3A.", 12, "3 · 4 = 12.", ["A =", [[2, -1], [0, 4]]]),
  mcq(5, 3, "Hasil perkalian berikut adalah…", ["[[−2, −6], [−8, 0]]", "[[2, −6], [8, 0]]", "[[−2, 6], [−8, 0]]", "[[−1, −5], [2, −2]]"], 2, "−2 · 1 = −2, −2 · (−3) = 6, −2 · 4 = −8, −2 · 0 = 0.", ["−2 ·", [[1, -3], [4, 0]]]),
  num(5, 4, "Tentukan nilai skalar k.", 5, "k · 2 = 10, sehingga k = 5. Periksa elemen lain: 5 · 3 = 15, 5 · 1 = 5, 5 · 4 = 20.", ["k ·", [[2, 3], [1, 4]], "=", [[10, 15], [5, 20]]]),
  num(5, 5, "Tentukan elemen baris 1 kolom 1 dari 2A − B.", 5, "2 · 3 − 1 = 6 − 1 = 5.", ["A =", [[3, 1], [0, 2]], ", B =", [[1, 1], [4, 3]]]),

  // 6 — Perkalian Dua Matriks
  mcq(6, 1, "Jika A berordo 2 × 3 dan B berordo 3 × 4, maka AB berordo…", ["3 × 3", "2 × 4", "4 × 2", "Tidak terdefinisi"], 1, "(2 × 3)(3 × 4): angka tengah sama, hasilnya berordo 2 × 4."),
  mcq(6, 2, "Perkalian manakah yang tidak terdefinisi?", ["A₂ₓ₃ · B₃ₓ₂", "A₃ₓ₁ · B₁ₓ₃", "A₂ₓ₃ · B₂ₓ₃", "A₂ₓ₂ · B₂ₓ₅"], 2, "Kolom A (3) tidak sama dengan baris B (2), jadi tidak bisa dikalikan."),
  num(6, 3, "Tentukan elemen baris 1 kolom 1 dari AB.", 19, "Baris 1 × kolom 1 = 1·5 + 2·7 = 5 + 14 = 19.", ["A =", [[1, 2], [3, 4]], ", B =", [[5, 6], [7, 8]]]),
  num(6, 4, "Tentukan elemen baris 2 kolom 2 dari hasil kali berikut.", 15, "Baris 2 × kolom 2 = 0·4 + 3·5 = 15.", [[[2, 1], [0, 3]], [[1, 4], [2, 5]]]),
  mcq(6, 5, "Hasil perkalian berikut adalah…", ["[[3, 0], [0, 2]]", "[[5, 4], [1, 2]]", "[[3, 6], [1, 4]]", "[[5, 2], [1, 4]]"], 1, "c₁₁ = 1·3 + 2·1 = 5, c₁₂ = 1·0 + 2·2 = 4, c₂₁ = 0·3 + 1·1 = 1, c₂₂ = 0·0 + 1·2 = 2.", [[[1, 2], [0, 1]], [[3, 0], [1, 2]]]),

  // 7 — Transpose
  mcq(7, 1, "Jika A berordo 2 × 3, maka Aᵀ berordo…", ["2 × 3", "3 × 3", "3 × 2", "2 × 2"], 2, "Transpose menukar baris dan kolom: m × n menjadi n × m."),
  mcq(7, 2, "Transpose dari matriks berikut adalah…", ["[[1, 3], [2, 4]]", "[[4, 3], [2, 1]]", "[[2, 1], [4, 3]]", "[[3, 4], [1, 2]]"], 0, "Baris 1 (1, 2) menjadi kolom 1 dan baris 2 (3, 4) menjadi kolom 2.", [[[1, 2], [3, 4]]]),
  num(7, 3, "Tentukan elemen baris 3 kolom 2 dari Aᵀ.", 5, "(Aᵀ)₃₂ = a₂₃ = 5.", ["A =", [[2, -1, 0], [7, 4, 5]]]),
  mcq(7, 4, "Hasil dari (Aᵀ)ᵀ adalah…", ["Aᵀ", "A", "−A", "I"], 1, "Transpose dua kali mengembalikan matriks semula."),
  num(7, 5, "Diketahui Aᵀ = B. Tentukan nilai x.", 9, "Aᵀ = [[3, 2], [x, 5]]. Samakan dengan B: x = 9.", ["A =", [[3, "x"], [2, 5]], ", B =", [[3, 2], [9, 5]]]),

  // 8 — Determinan 2×2
  num(8, 1, "Hitung determinan matriks berikut.", 10, "ad − bc = 3·4 − 2·1 = 12 − 2 = 10.", [[[3, 2], [1, 4]]]),
  num(8, 2, "Hitung determinan matriks berikut.", 14, "ad − bc = 2·1 − (−3)·4 = 2 + 12 = 14.", [[[2, -3], [4, 1]]]),
  mcq(8, 3, "Rumus determinan matriks [[a, b], [c, d]] adalah…", ["ab − cd", "ad + bc", "ac − bd", "ad − bc"], 3, "Diagonal utama (ad) dikurangi diagonal samping (bc)."),
  mcq(8, 4, "Matriks dengan determinan 0 disebut matriks…", ["Identitas", "Singular", "Nonsingular", "Diagonal"], 1, "det = 0 berarti matriks singular dan tidak memiliki invers."),
  num(8, 5, "Determinan matriks berikut adalah 14. Tentukan nilai x.", 5, "4x − 2·3 = 14 → 4x = 20 → x = 5.", [[["x", 2], [3, 4]]]),

  // 9 — Invers 2×2
  mcq(9, 1, "Matriks A memiliki invers jika…", ["det A = 0", "det A ≠ 0", "A matriks nol", "semua elemen A positif"], 1, "Invers hanya ada untuk matriks nonsingular, yaitu det A ≠ 0."),
  mcq(9, 2, "Invers dari matriks berikut adalah…", ["[[3, 1], [5, 2]]", "[[−3, 1], [5, −2]]", "[[3, −1], [−5, 2]]", "[[2, −1], [−5, 3]]"], 2, "det = 2·3 − 1·5 = 1. Tukar a dan d, negatifkan b dan c: [[3, −1], [−5, 2]].", [[[2, 1], [5, 3]]]),
  num(9, 3, "Hitung determinan matriks berikut sebelum mencari inversnya.", 10, "4·6 − 7·2 = 24 − 14 = 10.", [[[4, 7], [2, 6]]]),
  mcq(9, 4, "Hasil dari A · A⁻¹ adalah…", ["Matriks nol", "Matriks A", "Matriks identitas", "Aᵀ"], 2, "Definisi invers: A · A⁻¹ = A⁻¹ · A = I."),
  num(9, 5, "Tentukan elemen baris 2 kolom 1 dari A⁻¹.", -5, "det = 3·2 − 1·5 = 1, sehingga A⁻¹ = [[2, −1], [−5, 3]]. Elemen baris 2 kolom 1 adalah −5.", ["A =", [[3, 1], [5, 2]]]),

  // 10 — Persamaan Matriks
  mcq(10, 1, "Penyelesaian persamaan AX = B adalah…", ["X = BA⁻¹", "X = A⁻¹B", "X = AB", "X = B − A"], 1, "Kalikan kedua ruas dengan A⁻¹ dari kiri: X = A⁻¹B."),
  mcq(10, 2, "Penyelesaian persamaan XA = B adalah…", ["X = BA⁻¹", "X = A⁻¹B", "X = BA", "X = AᵀB"], 0, "Kalikan kedua ruas dengan A⁻¹ dari kanan: X = BA⁻¹."),
  num(10, 3, "Selesaikan 2x + y = 7 dan 3x + 2y = 12. Berapakah nilai x?", 2, "A⁻¹ = [[2, −1], [−3, 2]], sehingga x = 2·7 − 12 = 2 (dan y = 3).", [[[2, 1], [3, 2]], [["x"], ["y"]], "=", [[7], [12]]]),
  num(10, 4, "Matriks X memenuhi 2X + A = B. Tentukan elemen baris 1 kolom 1 dari X.", 3, "2X = B − A → elemen pertama (7 − 1) = 6, lalu dibagi 2 menjadi 3.", ["A =", [[1, 3], [5, -2]], ", B =", [[7, 5], [1, 4]]]),
  num(10, 5, "Tentukan nilai y dari persamaan matriks berikut.", 1, "det = 2·1 − 1·1 = 1, A⁻¹ = [[1, −1], [−1, 2]]. y = −5 + 2·3 = 1 (dan x = 2).", [[[2, 1], [1, 1]], [["x"], ["y"]], "=", [[5], [3]]]),

  // 11 — Determinan 3×3
  mcq(11, 1, "Langkah pertama metode Sarrus adalah…", ["Mentranspose matriks", "Menyalin dua kolom pertama ke kanan matriks", "Menghapus baris pertama", "Mengalikan semua elemen"], 1, "Dua kolom pertama disalin ke kanan agar enam diagonal mudah dilihat."),
  num(11, 2, "Hitung determinan matriks berikut.", 22, "Turun: 24 + 10 + 0 = 34. Naik: 12 + 0 + 0 = 12. det = 34 − 12 = 22.", [[[1, 2, 3], [0, 4, 5], [1, 0, 6]]]),
  num(11, 3, "Hitung determinan matriks diagonal berikut.", 24, "Hanya diagonal utama yang tidak nol: 2·3·4 = 24.", [[[2, 0, 0], [0, 3, 0], [0, 0, 4]]]),
  num(11, 4, "Hitung determinan matriks berikut.", 13, "Turun: 1·1·1 + 0·0·0 + 2·2·3 = 13. Naik: 0 + 0 + 0 = 0. det = 13.", [[[1, 0, 2], [2, 1, 0], [0, 3, 1]]]),
  mcq(11, 5, "Rumus Sarrus untuk matriks [[a, b, c], [d, e, f], [g, h, i]] adalah…", ["(aei + bfg + cdh) − (ceg + afh + bdi)", "(aei + bfg + cdh) + (ceg + afh + bdi)", "(abc + def + ghi) − (adg + beh + cfi)", "aei − ceg"], 0, "Jumlah tiga diagonal turun dikurangi jumlah tiga diagonal naik."),

  // 12 — Invers 3×3
  mcq(12, 1, "Minor Mᵢⱼ adalah…", ["Elemen pada baris i kolom j", "Determinan submatriks setelah baris i dan kolom j dihapus", "Transpose dari matriks kofaktor", "Hasil kali baris i dan kolom j"], 1, "Hapus baris i dan kolom j, lalu hitung determinan matriks 2 × 2 yang tersisa."),
  num(12, 2, "Tentukan minor M₁₁ dari matriks A.", -24, "Hapus baris 1 dan kolom 1: [[1, 4], [6, 0]] → 1·0 − 4·6 = −24.", ["A =", [[1, 2, 3], [0, 1, 4], [5, 6, 0]]]),
  num(12, 3, "Tentukan kofaktor C₁₂ dari matriks A.", 20, "M₁₂ = 0·0 − 4·5 = −20. C₁₂ = (−1)^(1+2) · (−20) = 20.", ["A =", [[1, 2, 3], [0, 1, 4], [5, 6, 0]]]),
  mcq(12, 4, "Adjoin matriks A adalah…", ["Matriks kofaktor A", "Invers dari A", "Transpose dari matriks kofaktor A", "Determinan A"], 2, "adj A diperoleh dengan mentranspose matriks kofaktor."),
  num(12, 5, "Hitung determinan matriks B.", 3, "Sarrus: (2 + 0 + 1) − (0 + 0 + 0) = 3.", ["B =", [[2, 0, 1], [1, 1, 0], [0, 1, 1]]]),
];

export const getQuestions = (chapterId: number): SeedQuizQuestion[] =>
  QUESTIONS.filter((q) => q.chapterId === chapterId);
