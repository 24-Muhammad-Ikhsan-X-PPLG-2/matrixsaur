import type { Difficulty } from "@/types";
import type { SupabaseClient } from "./shared";

export interface LandingChapter {
  id: number;
  title: string;
  zone: string;
  difficulty: Difficulty;
}

export async function getLandingChapters(
  supabase: SupabaseClient,
): Promise<LandingChapter[]> {
  const { data, error } = await supabase
    .from("chapters")
    .select("id, title, zone, difficulty")
    .order("sort_order");

  if (error) {
    throw new Error(`Gagal memuat peta chapter: ${error.message}`);
  }

  return (data ?? []) as LandingChapter[];
}
