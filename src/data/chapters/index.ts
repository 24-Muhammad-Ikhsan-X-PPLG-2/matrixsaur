import type { Chapter, Lesson } from "@/types";
import { chaptersPart1 } from "./part1";
import { chaptersPart2 } from "./part2";
import { chaptersPart3 } from "./part3";
import { chaptersPart4 } from "./part4";

/** Seluruh 12 chapter, berurutan dari dasar hingga lanjut. */
export const CHAPTERS: Chapter[] = [...chaptersPart1, ...chaptersPart2, ...chaptersPart3, ...chaptersPart4];

export const TOTAL_LESSONS = CHAPTERS.reduce((sum, c) => sum + c.lessons.length, 0);

export const getChapter = (id: number): Chapter | undefined => CHAPTERS.find((c) => c.id === id);

export interface LessonRef {
  chapter: Chapter;
  lesson: Lesson;
  index: number;
}

/** Daftar datar semua materi untuk navigasi sebelumnya/berikutnya lintas chapter. */
export const LESSON_SEQUENCE: LessonRef[] = CHAPTERS.flatMap((chapter) =>
  chapter.lessons.map((lesson, index) => ({ chapter, lesson, index })),
);
