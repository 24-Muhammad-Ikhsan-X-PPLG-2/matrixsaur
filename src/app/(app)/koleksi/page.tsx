import { Collection } from "@/features/screens/Collection";
import { requireUser } from "@/lib/auth";
import { getCollectionPageData } from "@/lib/data/collection";

export default async function KoleksiPage() {
  const { supabase, user } = await requireUser();
  const data = await getCollectionPageData(supabase, user.id);

  return <Collection data={data} />;
}
