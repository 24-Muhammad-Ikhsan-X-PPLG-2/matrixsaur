import { Quiz } from "@/features/screens/Quiz";
import { requireUser } from "@/lib/auth";
import { getQuizPageData } from "@/lib/data/quiz";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const { supabase, user } = await requireUser();
  const data = await getQuizPageData(supabase, user.id, Number(chapterId));

  return <Quiz data={data} />;
}
