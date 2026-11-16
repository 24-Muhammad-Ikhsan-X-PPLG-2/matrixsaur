import { Dashboard } from "@/features/screens/Dashboard";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/dashboard";

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const data = await getDashboardData(supabase, user.id);

  return <Dashboard data={data} />;
}
