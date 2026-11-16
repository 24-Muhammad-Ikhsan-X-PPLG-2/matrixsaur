import type { MathPart, QuestionType, QuizQuestion } from "@/types";
import {
  buildChapterViews,
  fetchCurriculum,
  fetchUserLearning,
} from "./curriculum";
import type { SupabaseClient } from "./shared";
import type { QuizPageData } from "./types";

type QuestionRow = {
  id: string;
  chapter_id: number;
  question_type: QuestionType;
  prompt: string;
  math: MathPart[] | null;
  options: string[] | null;
  explanation: string;
  sort_order: number;
};

export async function getQuizPageData(
  supabase: SupabaseClient,
  userId: string,
  chapterId: number,
): Promise<QuizPageData | null> {
  const [curriculum, learning, settingsResult] = await Promise.all([
    fetchCurriculum(supabase),
    fetchUserLearning(supabase, userId),
    supabase
      .from("user_settings")
      .select("sound_enabled")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (settingsResult.error) {
    throw new Error(
      `Gagal memuat pengaturan latihan: ${settingsResult.error.message}`,
    );
  }

  const chapters = buildChapterViews(curriculum, learning);
  const chapterPosition = chapters.findIndex(
    (chapter) => chapter.id === chapterId,
  );
  const chapter = chapters[chapterPosition];

  if (!chapter) return null;

  const { data, error } = await supabase
    .from("quiz_questions")
    .select(
      "id, chapter_id, question_type, prompt, math, options, explanation, sort_order",
    )
    .eq("chapter_id", chapterId)
    .order("sort_order");

  if (error) {
    throw new Error(`Gagal memuat soal: ${error.message}`);
  }

  const questions: QuizQuestion[] = ((data ?? []) as QuestionRow[]).map(
    (row) => ({
      id: row.id,
      chapterId: row.chapter_id,
      type: row.question_type,
      prompt: row.prompt,
      math: row.math ?? undefined,
      options: row.options ?? undefined,
      explanation: row.explanation,
    }),
  );

  const nextChapter = chapters[chapterPosition + 1];

  return {
    chapter,
    questions,
    nextChapter: nextChapter
      ? { id: nextChapter.id, zone: nextChapter.zone }
      : null,
    soundEnabled: settingsResult.data?.sound_enabled ?? true,
  };
}
