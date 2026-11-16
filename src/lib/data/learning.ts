import {
  buildChapterViews,
  fetchCurriculum,
  fetchUserLearning,
  findNextChapter,
} from "./curriculum";
import type { SupabaseClient } from "./shared";
import type { LearningPageData } from "./types";

export async function getLearningPageData(
  supabase: SupabaseClient,
  userId: string,
): Promise<LearningPageData> {
  const [curriculum, learning] = await Promise.all([
    fetchCurriculum(supabase),
    fetchUserLearning(supabase, userId),
  ]);

  const chapters = buildChapterViews(curriculum, learning);

  return {
    chapters,
    nextChapterId: findNextChapter(chapters)?.id ?? null,
    completedChapters: chapters.filter((chapter) => chapter.completed).length,
  };
}
