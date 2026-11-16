import { Landing } from "@/features/screens/Landing";
import { getLandingChapters } from "@/lib/data/landing";
import { createClient } from "@/lib/supabase/server";

// Daftar chapter dibaca dari Supabase dengan klien yang memakai cookie.
export const instant = false;

export default async function LandingPage() {
  const supabase = await createClient();
  const chapters = await getLandingChapters(supabase);

  return <Landing chapters={chapters} />;
}
