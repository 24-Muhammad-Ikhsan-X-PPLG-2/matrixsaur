import type { ContentBlock, Lesson } from "@/types";
import {
  buildChapterViews,
  fetchCurriculum,
  fetchUserLearning,
} from "./curriculum";
import type { SupabaseClient } from "./shared";
import type { LessonPageData } from "./types";

type LessonBlockRow = {
  id: string;
  chapter_id: number;
  title: string;
  minutes: number;
  content_blocks: ContentBlock[];
  show_viz: boolean;
};

export async function getLessonPageData(
  supabase: SupabaseClient,
  userId: string,
  chapterId: number,
  lessonIndex: number,
): Promise<LessonPageData | null> {
  const [curriculum, learning] = await Promise.all([
    fetchCurriculum(supabase),
    fetchUserLearning(supabase, userId),
  ]);

  const chapters = buildChapterViews(curriculum, learning);
  const chapterPosition = chapters.findIndex(
    (chapter) => chapter.id === chapterId,
  );
  const chapter = chapters[chapterPosition];

  if (
    !chapter ||
    !Number.isInteger(lessonIndex) ||
    lessonIndex < 0 ||
    lessonIndex >= chapter.lessons.length
  ) {
    return null;
  }

  const summary = chapter.lessons[lessonIndex];
  const { data, error } = await supabase
    .from("lessons")
    .select("id, chapter_id, title, minutes, content_blocks, show_viz")
    .eq("id", summary.id)
    .single();

  if (error || !data) {
    throw new Error(
      `Gagal memuat materi: ${error?.message ?? "tidak ditemukan"}`,
    );
  }

  const row = data as LessonBlockRow;
  const lesson: Lesson = {
    id: row.id,
    chapterId: row.chapter_id,
    title: row.title,
    minutes: row.minutes,
    blocks: row.content_blocks,
    showViz: row.show_viz,
  };

  let previous: LessonPageData["previous"] = null;
  if (lessonIndex > 0) {
    previous = { chapterId, lessonIndex: lessonIndex - 1 };
  } else if (chapterPosition > 0) {
    const previousChapter = chapters[chapterPosition - 1];
    if (previousChapter.lessons.length > 0) {
      previous = {
        chapterId: previousChapter.id,
        lessonIndex: previousChapter.lessons.length - 1,
      };
    }
  }

  return { chapter, lesson, lessonIndex, previous };
}
