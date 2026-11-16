import type { UserSettings } from "@/types";
import type {
  ProfileRow,
  SettingsRow,
  SupabaseClient,
} from "./shared";
import type { ProfilePageData } from "./types";

type AttemptRow = { correct_count: number; total_questions: number };

async function countUserRows(
  supabase: SupabaseClient,
  table: string,
  userId: string,
) {
  const { count, error } = await supabase
    .from(table)
    .select("user_id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Gagal menghitung ${table}: ${error.message}`);
  }
  return count ?? 0;
}

export async function getProfilePageData(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfilePageData> {
  const [
    profileResult,
    settingsResult,
    streakResult,
    attemptsResult,
    lessonsRead,
    chaptersCompleted,
    totalChapters,
    dinosaursOwned,
    totalDinosaurs,
    achievementsUnlocked,
    totalAchievements,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, display_name, avatar, xp, joined_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("user_settings")
      .select("theme, sound_enabled, reduced_motion, streak_visual")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("user_streaks")
      .select("longest_days")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("quiz_attempts")
      .select("correct_count, total_questions")
      .eq("user_id", userId),
    countUserRows(supabase, "lesson_progress", userId),
    supabase
      .from("chapter_progress")
      .select("chapter_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true),
    supabase
      .from("chapters")
      .select("id", { count: "exact", head: true }),
    countUserRows(supabase, "user_dinosaurs", userId),
    supabase
      .from("dinosaurs")
      .select("id", { count: "exact", head: true }),
    countUserRows(supabase, "user_achievements", userId),
    supabase
      .from("achievements")
      .select("id", { count: "exact", head: true }),
  ]);

  const failed =
    profileResult.error ??
    settingsResult.error ??
    streakResult.error ??
    attemptsResult.error ??
    chaptersCompleted.error ??
    totalChapters.error ??
    totalDinosaurs.error ??
    totalAchievements.error;

  if (failed) {
    throw new Error(`Gagal memuat profil: ${failed.message}`);
  }

  const profile = profileResult.data as ProfileRow | null;
  if (!profile) {
    throw new Error("Profil pengguna tidak ditemukan.");
  }

  const settingsRow = settingsResult.data as SettingsRow | null;
  const settings: UserSettings = {
    theme: settingsRow?.theme ?? "day",
    soundEnabled: settingsRow?.sound_enabled ?? true,
    reducedMotion: settingsRow?.reduced_motion ?? false,
    streakVisual: settingsRow?.streak_visual ?? "fossil",
  };

  const attempts = (attemptsResult.data ?? []) as AttemptRow[];
  const totalCorrect = attempts.reduce(
    (sum, attempt) => sum + attempt.correct_count,
    0,
  );
  const totalAsked = attempts.reduce(
    (sum, attempt) => sum + attempt.total_questions,
    0,
  );

  return {
    profile: {
      username: profile.username,
      displayName: profile.display_name,
      avatar: profile.avatar,
      joinedAt: profile.joined_at,
      xp: profile.xp,
    },
    settings,
    stats: {
      completedChapters: chaptersCompleted.count ?? 0,
      totalChapters: totalChapters.count ?? 0,
      lessonsRead,
      attempts: attempts.length,
      accuracy:
        totalAsked > 0 ? Math.round((totalCorrect / totalAsked) * 100) : 0,
      longestStreak: streakResult.data?.longest_days ?? 0,
      dinosaursOwned,
      totalDinosaurs: totalDinosaurs.count ?? 0,
      achievementsUnlocked,
      totalAchievements: totalAchievements.count ?? 0,
    },
  };
}
