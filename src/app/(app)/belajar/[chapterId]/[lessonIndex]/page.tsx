import { LessonDetail } from "@/features/screens/LessonDetail";
import { requireUser } from "@/lib/auth";
import { getLessonPageData } from "@/lib/data/lesson";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ chapterId: string; lessonIndex: string }>;
}) {
  const { chapterId, lessonIndex } = await params;
  const chapter = Number(chapterId);
  const index = Number(lessonIndex) - 1;
  const { supabase, user } = await requireUser();

  const data = await getLessonPageData(supabase, user.id, chapter, index);

  return <LessonDetail data={data} />;
}
