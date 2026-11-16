"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import type { ActionResponse } from "@/lib/data/types";
import type { AvatarId, ThemeMode, StreakVisual, UserSettings } from "@/types";

const AVATARS: AvatarId[] = [
  "trix",
  "egg",
  "fern",
  "volcano",
  "bone",
  "amber",
];

export interface ProfilePatch {
  displayName?: string;
  username?: string;
  avatar?: AvatarId;
}

export async function updateProfileAction(
  patch: ProfilePatch,
): Promise<ActionResponse<null>> {
  const { supabase, user } = await requireUser();
  const update: {
    display_name?: string;
    username?: string;
    avatar?: AvatarId;
  } = {};

  if (patch.displayName !== undefined) {
    const displayName = patch.displayName.trim();
    if (displayName.length < 2 || displayName.length > 60) {
      return { ok: false, error: "Nama panggilan harus 2–60 karakter." };
    }
    update.display_name = displayName;
  }

  if (patch.username !== undefined) {
    const username = patch.username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      return {
        ok: false,
        error: "Username harus 3–20 karakter: huruf kecil, angka, atau garis bawah.",
      };
    }
    update.username = username;
  }

  if (patch.avatar !== undefined) {
    if (!AVATARS.includes(patch.avatar)) {
      return { ok: false, error: "Avatar tidak valid." };
    }
    update.avatar = patch.avatar;
  }

  if (Object.keys(update).length === 0) {
    return { ok: false, error: "Tidak ada perubahan untuk disimpan." };
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) {
    console.error("[update_profile]", error);
    if (error.code === "23505") {
      return { ok: false, error: "Username itu sudah dipakai penjelajah lain." };
    }
    return { ok: false, error: "Gagal menyimpan profil. Coba lagi." };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: null };
}

export interface SettingsPatch {
  theme?: ThemeMode;
  soundEnabled?: boolean;
  reducedMotion?: boolean;
  streakVisual?: StreakVisual;
}

export async function updateSettingsAction(
  patch: SettingsPatch,
): Promise<ActionResponse<UserSettings | null>> {
  const { supabase, user } = await requireUser();
  const update: {
    theme?: ThemeMode;
    sound_enabled?: boolean;
    reduced_motion?: boolean;
    streak_visual?: StreakVisual;
  } = {};

  if (patch.theme === "day" || patch.theme === "night") {
    update.theme = patch.theme;
  }
  if (typeof patch.soundEnabled === "boolean") {
    update.sound_enabled = patch.soundEnabled;
  }
  if (typeof patch.reducedMotion === "boolean") {
    update.reduced_motion = patch.reducedMotion;
  }
  if (patch.streakVisual === "fossil" || patch.streakVisual === "mammoth") {
    update.streak_visual = patch.streakVisual;
  }

  if (Object.keys(update).length === 0) {
    return { ok: false, error: "Pengaturan tidak valid." };
  }

  const { data, error } = await supabase
    .from("user_settings")
    .update(update)
    .eq("user_id", user.id)
    .select("theme, sound_enabled, reduced_motion, streak_visual")
    .single();

  if (error) {
    console.error("[update_settings]", error);
    return { ok: false, error: "Gagal menyimpan pengaturan. Coba lagi." };
  }

  revalidatePath("/", "layout");
  return {
    ok: true,
    data: {
      theme: data.theme,
      soundEnabled: data.sound_enabled,
      reducedMotion: data.reduced_motion,
      streakVisual: data.streak_visual,
    },
  };
}
