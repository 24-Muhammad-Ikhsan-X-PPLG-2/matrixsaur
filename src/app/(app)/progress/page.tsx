import { Progress } from "@/features/screens/Progress";
import { requireUser } from "@/lib/auth";
import { getProgressPageData } from "@/lib/data/progress";

export default async function ProgressPage() {
  const { supabase, user } = await requireUser();
  const data = await getProgressPageData(supabase, user.id);

  return <Progress data={data} />;
}
