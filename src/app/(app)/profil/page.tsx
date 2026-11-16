import { Profile } from "@/features/screens/Profile";
import { requireUser } from "@/lib/auth";
import { getProfilePageData } from "@/lib/data/profile";

export default async function ProfilePage() {
  const { supabase, user } = await requireUser();
  const data = await getProfilePageData(supabase, user.id);

  return <Profile data={data} />;
}
