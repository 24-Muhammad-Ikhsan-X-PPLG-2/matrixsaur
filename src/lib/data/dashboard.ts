import { getOverallPercent } from "@/lib/game/rules";
import {
  buildChapterViews,
  fetchCurriculum,
  fetchUserLearning,
} from "./curriculum";
import {
  fetchAchievements,
  fetchActiveEgg,
  fetchRecentActivities,
  fetchStreak,
  getJakartaDate,
  type ProfileRow,
  type SupabaseClient,
} from "./shared";
import type { DashboardData } from "./types";

type DailyRow = { xp: number; minutes: number; lessons: number };

export async function getDashboardData(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardData> {
  const today = getJakartaDate();

  const [
    curriculum,
    learning,
    profileResult,
    dailyResult,
    streak,
    achievements,
    egg,
    activities,
  ] = await Promise.all([
    fetchCurriculum(supabase),
    fetchUserLearning(supabase, userId),
    supabase
      .from("profiles")
      .select("username, display_name, avatar, xp, joined_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("daily_activity")
      .select("xp, minutes, lessons")
      .eq("user_id", userId)
      .eq("activity_date", today)
      .maybeSingle(),
    fetchStreak(supabase, userId),
    fetchAchievements(supabase, userId),
    fetchActiveEgg(supabase, userId),
    fetchRecentActivities(supabase, userId),
  ]);

  const failed = profileResult.error ?? dailyResult.error;
  if (failed) {
    console.error(failed.message);
    throw new Error(`Gagal memuat dashboard: ${failed.message}`);
  }

  const profile = profileResult.data as ProfileRow | null;
  if (!profile) {
    throw new Error("Profil pengguna tidak ditemukan.");
  }

  const chapters = buildChapterViews(curriculum, learning);
  const lessonsDone = chapters.reduce(
    (total, chapter) => total + chapter.lessonsDone.length,
    0,
  );
  const totalLessons = chapters.reduce(
    (total, chapter) => total + chapter.lessons.length,
    0,
  );
  const completedChapters = chapters.filter(
    (chapter) => chapter.completed,
  ).length;
  const daily = dailyResult.data as DailyRow | null;

  return {
    profile: {
      username: profile.username,
      displayName: profile.display_name,
      avatar: profile.avatar,
      joinedAt: profile.joined_at,
      xp: profile.xp,
    },
    streak,
    chapters,
    today: {
      xp: daily?.xp ?? 0,
      minutes: daily?.minutes ?? 0,
      lessons: daily?.lessons ?? 0,
    },
    egg,
    activities,
    achievements,
    overallPercent: getOverallPercent(
      lessonsDone,
      completedChapters,
      totalLessons,
      chapters.length,
    ),
    lessonsDone,
    totalLessons,
    totalChapters: chapters.length,
    completedChapters,
  };
}
