import { getChapterPercent, getChapterStatus } from "@/lib/game/rules";
import type {
  Difficulty,
  LessonSummary,
  VizOperation,
} from "@/types";
import type { ChapterView } from "./types";
import type { SupabaseClient } from "./shared";

type ChapterRow = {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  zone: string;
  difficulty: Difficulty;
  viz_operation: VizOperation;
  xp_reward: number;
  summary: string[];
  sort_order: number;
};

type LessonRow = {
  id: string;
  chapter_id: number;
  title: string;
  minutes: number;
  sort_order: number;
};

type QuestionRow = { chapter_id: number };

export interface CurriculumChapter {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  zone: string;
  difficulty: Difficulty;
  viz: VizOperation;
  xpReward: number;
  summary: string[];
  lessons: LessonSummary[];
  questionsCount: number;
}

export interface UserLearningState {
  lessonsDone: Set<string>;
  chapterProgress: Map<
    number,
    { bestScore: number | null; completed: boolean }
  >;
}

export async function fetchCurriculum(
  supabase: SupabaseClient,
): Promise<CurriculumChapter[]> {
  const [chaptersResult, lessonsResult, questionsResult] = await Promise.all([
    supabase
      .from("chapters")
      .select(
        "id, slug, title, tagline, zone, difficulty, viz_operation, xp_reward, summary, sort_order",
      )
      .order("sort_order"),
    supabase
      .from("lessons")
      .select("id, chapter_id, title, minutes, sort_order")
      .order("chapter_id")
      .order("sort_order"),
    supabase.from("quiz_questions").select("chapter_id"),
  ]);

  const failed =
    chaptersResult.error ?? lessonsResult.error ?? questionsResult.error;
  if (failed) {
    throw new Error(`Gagal memuat kurikulum: ${failed.message}`);
  }

  const lessonsByChapter = new Map<number, LessonSummary[]>();
  for (const lesson of (lessonsResult.data ?? []) as LessonRow[]) {
    const list = lessonsByChapter.get(lesson.chapter_id) ?? [];
    list.push({ id: lesson.id, title: lesson.title, minutes: lesson.minutes });
    lessonsByChapter.set(lesson.chapter_id, list);
  }

  const questionCount = new Map<number, number>();
  for (const question of (questionsResult.data ?? []) as QuestionRow[]) {
    questionCount.set(
      question.chapter_id,
      (questionCount.get(question.chapter_id) ?? 0) + 1,
    );
  }

  return ((chaptersResult.data ?? []) as ChapterRow[]).map((chapter) => ({
    id: chapter.id,
    slug: chapter.slug,
    title: chapter.title,
    tagline: chapter.tagline,
    zone: chapter.zone,
    difficulty: chapter.difficulty,
    viz: chapter.viz_operation,
    xpReward: chapter.xp_reward,
    summary: chapter.summary,
    lessons: lessonsByChapter.get(chapter.id) ?? [],
    questionsCount: questionCount.get(chapter.id) ?? 0,
  }));
}

export async function fetchUserLearning(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserLearningState> {
  const [lessonsResult, chaptersResult] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId),
    supabase
      .from("chapter_progress")
      .select("chapter_id, best_score, completed")
      .eq("user_id", userId),
  ]);

  const failed = lessonsResult.error ?? chaptersResult.error;
  if (failed) {
    throw new Error(`Gagal memuat progres: ${failed.message}`);
  }

  const lessonsDone = new Set(
    (lessonsResult.data ?? []).map((row) => row.lesson_id),
  );

  const chapterProgress = new Map<
    number,
    { bestScore: number | null; completed: boolean }
  >();
  for (const row of chaptersResult.data ?? []) {
    chapterProgress.set(row.chapter_id, {
      bestScore: row.best_score,
      completed: row.completed,
    });
  }

  return { lessonsDone, chapterProgress };
}

export function buildChapterViews(
  curriculum: CurriculumChapter[],
  learning: UserLearningState,
): ChapterView[] {
  return curriculum.map((chapter, index) => {
    const progress = learning.chapterProgress.get(chapter.id);
    const lessonsDone = chapter.lessons
      .filter((lesson) => learning.lessonsDone.has(lesson.id))
      .map((lesson) => lesson.id);
    const completed = progress?.completed ?? false;
    const bestScore = progress?.bestScore ?? null;
    const previousCompleted =
      index === 0
        ? true
        : (learning.chapterProgress.get(curriculum[index - 1].id)?.completed ??
          false);

    return {
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      tagline: chapter.tagline,
      zone: chapter.zone,
      difficulty: chapter.difficulty,
      viz: chapter.viz,
      xpReward: chapter.xpReward,
      summary: chapter.summary,
      lessons: chapter.lessons,
      questionsCount: chapter.questionsCount,
      lessonsDone,
      bestScore,
      completed,
      percent: getChapterPercent(
        lessonsDone.length,
        chapter.lessons.length,
        completed,
      ),
      status: getChapterStatus({
        completed,
        started: lessonsDone.length > 0 || bestScore !== null,
        previousCompleted,
      }),
    };
  });
}

/** Chapter pertama yang belum selesai (untuk misi berikutnya). */
export function findNextChapter(
  chapters: ChapterView[],
): ChapterView | undefined {
  return chapters.find((chapter) => !chapter.completed);
}
