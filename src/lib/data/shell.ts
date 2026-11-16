import type { AvatarId, UserSettings } from "@/types";
import type { ShellData } from "./types";
import type { ProfileRow, SettingsRow, SupabaseClient } from "./shared";

async function loadShellData(
  supabase: SupabaseClient,
  userId: string,
): Promise<ShellData | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, avatar, xp, username, joined_at")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Gagal memuat profil: ${profileError.message}`);
  }
  if (!profile) return null;

  const [settingsResult, streakResult] = await Promise.all([
    supabase
      .from("user_settings")
      .select("theme, sound_enabled, reduced_motion, streak_visual")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("user_streaks")
      .select("current_days")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const failed = settingsResult.error ?? streakResult.error;
  if (failed) {
    throw new Error(`Gagal memuat data shell: ${failed.message}`);
  }

  const settingsRow = settingsResult.data as SettingsRow | null;
  const settings: UserSettings = {
    theme: settingsRow?.theme ?? "day",
    soundEnabled: settingsRow?.sound_enabled ?? true,
    reducedMotion: settingsRow?.reduced_motion ?? false,
    streakVisual: settingsRow?.streak_visual ?? "fossil",
  };
  const row = profile as Pick<ProfileRow, "display_name" | "avatar" | "xp">;

  return {
    displayName: row.display_name,
    avatar: row.avatar as AvatarId,
    xp: row.xp,
    streak: streakResult.data?.current_days ?? 0,
    settings,
  };
}

export async function getShellData(
  supabase: SupabaseClient,
  userId: string,
): Promise<ShellData> {
  const first = await loadShellData(supabase, userId);
  if (first) return first;

  // Pengguna auth lama mungkin belum memiliki profil. Pulihkan sekali, lalu
  // baca ulang. RPC ini juga membuat pengaturan, streak, dan telur pertama.
  const { error } = await supabase.rpc("ensure_user_state");
  if (error) {
    throw new Error(`Gagal menyiapkan profil: ${error.message}`);
  }

  const second = await loadShellData(supabase, userId);
  if (!second) {
    throw new Error("Profil pengguna tidak ditemukan setelah inisialisasi.");
  }

  return second;
}
