import {
  DINOSAUR_COLUMNS,
  fetchActiveEgg,
  mapDinosaur,
  type DinosaurRow,
  type SupabaseClient,
} from "./shared";
import type { CollectionPageData } from "./types";

export async function getCollectionPageData(
  supabase: SupabaseClient,
  userId: string,
): Promise<CollectionPageData> {
  const [dinosaursResult, ownedResult, egg] = await Promise.all([
    supabase
      .from("dinosaurs")
      .select(DINOSAUR_COLUMNS)
      .order("sort_order"),
    supabase
      .from("user_dinosaurs")
      .select("dinosaur_id")
      .eq("user_id", userId),
    fetchActiveEgg(supabase, userId),
  ]);

  const failed = dinosaursResult.error ?? ownedResult.error;
  if (failed) {
    throw new Error(`Gagal memuat koleksi: ${failed.message}`);
  }

  return {
    dinosaurs: ((dinosaursResult.data ?? []) as DinosaurRow[]).map(
      mapDinosaur,
    ),
    ownedIds: (ownedResult.data ?? []).map((row) => row.dinosaur_id),
    egg,
  };
}
