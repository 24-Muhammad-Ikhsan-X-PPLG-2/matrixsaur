/**
 * Aturan permainan yang murni dan bisa dipakai di server maupun klien.
 * Tidak ada impor dataset di sini; angka berasal dari data yang sudah dimuat.
 */
import type { ChapterStatus, LevelInfo } from "@/types";

export const RULES = {
  xpPerLesson: 15,
  xpPerCorrect: 10,
  perfectBonus: 20,
  passPercent: 60,
  eggPerLesson: 10,
  eggPerCorrect: 6,
  streakCycle: 7,
} as const;

const LEVEL_TITLES = [
  "Telur Penasaran",
  "Tukik Matriks",
  "Pelacak Baris",
  "Penjaga Kolom",
  "Pemburu Ordo",
  "Raptor Determinan",
  "Penakluk Sarrus",
  "Rex Invers",
];

export function getLevelInfo(xp: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, xp);
  let need = 100;

  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = 100 + (level - 1) * 40;
  }

  return {
    level,
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
    xpIntoLevel: remaining,
    xpForLevel: need,
    percent: Math.round((remaining / need) * 100),
  };
}

export const isPassing = (correct: number, total: number) =>
  total > 0 && (correct / total) * 100 >= RULES.passPercent;

export function computeQuizXp(correct: number, total: number): number {
  return (
    correct * RULES.xpPerCorrect +
    (correct === total && total > 0 ? RULES.perfectBonus : 0)
  );
}

export function getChapterStatus({
  completed,
  started,
  previousCompleted,
}: {
  completed: boolean;
  started: boolean;
  previousCompleted: boolean;
}): ChapterStatus {
  if (completed) return "completed";
  if (!previousCompleted) return "locked";
  return started ? "in-progress" : "available";
}

/** Persentase chapter: semua materi + latihan lulus. */
export function getChapterPercent(
  lessonsDone: number,
  totalLessons: number,
  completed: boolean,
): number {
  const steps = totalLessons + 1;
  if (steps <= 0) return 0;
  return Math.round(((lessonsDone + (completed ? 1 : 0)) / steps) * 100);
}

export function getOverallPercent(
  lessonsDone: number,
  completedChapters: number,
  totalLessons: number,
  totalChapters: number,
): number {
  const steps = totalLessons + totalChapters;
  if (steps <= 0) return 0;
  return Math.round(((lessonsDone + completedChapters) / steps) * 100);
}
