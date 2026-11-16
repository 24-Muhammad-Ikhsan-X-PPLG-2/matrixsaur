import { Learning } from "@/features/screens/Learning";
import { requireUser } from "@/lib/auth";
import { getLearningPageData } from "@/lib/data/learning";

export default async function BelajarPage() {
  const { supabase, user } = await requireUser();
  const data = await getLearningPageData(supabase, user.id);

  return <Learning data={data} />;
}
