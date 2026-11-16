"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import type { ActionResponse, HatchEggResult } from "@/lib/data/types";

export async function hatchEggAction(): Promise<ActionResponse<HatchEggResult>> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("hatch_egg");

  if (error) {
    console.error("[hatch_egg]", error);
    return { ok: false, error: "Gagal menetaskan telur. Coba lagi." };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: data as HatchEggResult };
}
