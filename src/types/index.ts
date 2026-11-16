/**
 * Kontrak domain MATRIXSAUR.
 *
 * Tipe di sini menggambarkan data yang dipakai UI dan data yang ditanam oleh
 * seeder. Kunci jawaban tidak termasuk kontrak publik: kunci hanya hidup di
 * tabel quiz_question_keys dan diperiksa melalui RPC Supabase.
 */

export type ID = string;

/* ---------- Pengguna ---------- */
export type ThemeMode = "day" | "night";
export type StreakVisual = "fossil" | "mammoth";
export type AvatarId = "trix" | "egg" | "fern" | "volcano" | "bone" | "amber";

export interface UserSettings {
  theme: ThemeMode;
  soundEnabled: boolean;
  reducedMotion: boolean;
  streakVisual: StreakVisual;
}

export interface User {
  id: ID;
  username: string;
  displayName: string;
  avatar: AvatarId;
  joinedAt: string; // ISO date
  xp: number;
  settings: UserSettings;
}

/* ---------- Materi ---------- */
export type Difficulty = "Dasar" | "Menengah" | "Lanjut";
export type ChapterStatus = "locked" | "in-progress" | "completed" | "available";

/** Sel matriks boleh angka atau simbol (mis. "x", "2y"). */
export type MatrixCell = number | string;
export type MatrixData = MatrixCell[][];
/** Potongan ekspresi: teks biasa atau matriks. */
export type MathPart = string | MatrixData;

export type VizOperation =
  | "intro"
  | "equality"
  | "add"
  | "subtract"
  | "scalar"
  | "multiply"
  | "transpose"
  | "det2"
  | "inverse2"
  | "equation"
  | "det3"
  | "inverse3";

export interface ExampleStep {
  text: string;
  math?: MathPart[];
}

export type ContentBlock =
  | { type: "text"; body: string }
  | { type: "list"; title?: string; items: string[] }
  | { type: "math"; label?: string; parts: MathPart[] }
  | { type: "formula"; label: string; expr: string; note?: string }
  | { type: "tip"; body: string }
  | {
      type: "example";
      title: string;
      question: string;
      math?: MathPart[];
      steps: ExampleStep[];
      answer: string;
    };

export interface Lesson {
  id: ID;
  chapterId: number;
  title: string;
  minutes: number;
  blocks: ContentBlock[];
  /** Tampilkan visualisasi interaktif chapter pada materi ini. */
  showViz?: boolean;
}

export interface Chapter {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  /** Nama zona pada peta petualangan. */
  zone: string;
  difficulty: Difficulty;
  viz: VizOperation;
  xpReward: number;
  lessons: Lesson[];
  summary: string[];
}

/** Ringkasan materi untuk daftar/navigasi tanpa memuat isi blok. */
export interface LessonSummary {
  id: ID;
  title: string;
  minutes: number;
}

/* ---------- Latihan ---------- */
export type QuestionType = "mcq" | "numeric";

/** Soal yang aman dikirim ke klien: tanpa kunci jawaban. */
export interface QuizQuestion {
  id: ID;
  chapterId: number;
  type: QuestionType;
  prompt: string;
  math?: MathPart[];
  /** Untuk pilihan ganda. */
  options?: string[];
  explanation: string;
}

/**
 * Bentuk soal pada dataset seeder. Kunci jawaban hanya boleh dipakai oleh
 * scripts/seed.ts dan tidak boleh masuk ke bundel aplikasi.
 */
export interface SeedQuizQuestion extends QuizQuestion {
  /** Untuk pilihan ganda. */
  answerIndex?: number;
  /** Untuk jawaban numerik. */
  answer?: number;
}

export interface QuizAnswer {
  questionId: ID;
  given: string;
  correct: boolean;
  correctAnswerText: string;
  correctOptionIndex: number | null;
}

export interface QuizAttempt {
  id: ID;
  chapterId: number;
  date: string; // ISO date
  correct: number;
  total: number;
  xpEarned: number;
  durationSec: number;
}

/* ---------- Progres ---------- */
export interface ChapterProgress {
  chapterId: number;
  lessonsDone: ID[];
  bestScore: number | null; // persen 0–100
  completed: boolean;
}

export interface StreakState {
  current: number;
  longest: number;
  /** Sudah belajar hari ini? */
  activeToday: boolean;
}

export interface DailyActivity {
  date: string; // ISO date
  label: string; // Sen, Sel, ...
  xp: number;
  minutes: number;
  lessons: number;
}

export type ActivityKind = "lesson" | "quiz" | "hatch" | "achievement" | "streak";

export interface ActivityLog {
  id: ID;
  kind: ActivityKind;
  title: string;
  detail: string;
  when: string;
}

/* ---------- Gamifikasi ---------- */
export type DinoRarity = "Umum" | "Langka" | "Legendaris";
export type DinoSpecies =
  | "trice"
  | "stego"
  | "bronto"
  | "ptero"
  | "raptor"
  | "ankylo"
  | "spino"
  | "rex";

export interface Dinosaur {
  id: ID;
  species: DinoSpecies;
  name: string;
  nickname: string;
  rarity: DinoRarity;
  era: string;
  color: string;
  accent: string;
  description: string;
  matrixPower: string;
}

export interface DinosaurEgg {
  id: ID;
  /** Dinosaurus yang akan menetas dari telur ini. */
  dinosaur: Dinosaur;
  progress: number;
  target: number;
}

export interface Achievement {
  id: ID;
  title: string;
  description: string;
  icon:
    | "footprint"
    | "flame"
    | "bone"
    | "egg"
    | "star"
    | "volcano"
    | "brush"
    | "crown";
}

export interface LevelInfo {
  level: number;
  title: string;
  xpIntoLevel: number;
  xpForLevel: number;
  percent: number;
}
