import { getOverallPercent } from "@/lib/game/rules";
import type { QuizAttempt, UserSettings } from "@/types";
import {
  buildChapterViews,
  fetchCurriculum,
  fetchUserLearning,
} from "./curriculum";
import {
  addDays,
  dayLabel,
  fetchAchievements,
  fetchStreak,
  getJakartaDate,
  type ProfileRow,
  type SettingsRow,
  type SupabaseClient,
} from "./shared";
import type { ProgressPageData } from "./types";

type AttemptRow = {
  id: string;
  chapter_id: number;
  correct_count: number;
  total_questions: number;
  xp_earned: number;
  duration_sec: number;
  submitted_at: string;
};

type DailyRow = {
  activity_date: string;
  xp: number;
  minutes: number;
  lessons: number;
};

export async function getProgressPageData(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProgressPageData> {
  const today = getJakartaDate();
  const startDate = addDays(today, -6);

  const [
    curriculum,
    learning,
    profileResult,
    streak,
    settingsResult,
    attemptsResult,
    achievements,
    dailyResult,
  ] = await Promise.all([
    fetchCurriculum(supabase),
    fetchUserLearning(supabase, userId),
    supabase
      .from("profiles")
      .select("username, display_name, avatar, xp, joined_at")
      .eq("id", userId)
      .maybeSingle(),
    fetchStreak(supabase, userId),
    supabase
      .from("user_settings")
      .select("theme, sound_enabled, reduced_motion, streak_visual")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("quiz_attempts")
      .select(
        "id, chapter_id, correct_count, total_questions, xp_earned, duration_sec, submitted_at",
      )
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false }),
    fetchAchievements(supabase, userId),
    supabase
      .from("daily_activity")
      .select("activity_date, xp, minutes, lessons")
      .eq("user_id", userId)
      .gte("activity_date", startDate)
      .lte("activity_date", today),
  ]);

  const failed =
    profileResult.error ??
    settingsResult.error ??
    attemptsResult.error ??
    dailyResult.error;
  if (failed) {
    throw new Error(`Gagal memuat progres: ${failed.message}`);
  }

  const profile = profileResult.data as ProfileRow | null;
  if (!profile) {
    throw new Error("Profil pengguna tidak ditemukan.");
  }

  const chapters = buildChapterViews(curriculum, learning);
  const lessonsDone = chapters.reduce(
    (sum, chapter) => sum + chapter.lessonsDone.length,
    0,
  );
  const totalLessons = chapters.reduce(
    (sum, chapter) => sum + chapter.lessons.length,
    0,
  );
  const completedChapters = chapters.filter(
    (chapter) => chapter.completed,
  ).length;

  const attemptRows = (attemptsResult.data ?? []) as AttemptRow[];
  const attempts: QuizAttempt[] = attemptRows.map((row) => ({
    id: row.id,
    chapterId: row.chapter_id,
    date: row.submitted_at.slice(0, 10),
    correct: row.correct_count,
    total: row.total_questions,
    xpEarned: row.xp_earned,
    durationSec: row.duration_sec,
  }));

  const totalCorrect = attemptRows.reduce(
    (sum, row) => sum + row.correct_count,
    0,
  );
  const totalAsked = attemptRows.reduce(
    (sum, row) => sum + row.total_questions,
    0,
  );

  const dailyByDate = new Map(
    ((dailyResult.data ?? []) as DailyRow[]).map((row) => [
      row.activity_date,
      row,
    ]),
  );
  const daily = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(startDate, index);
    const row = dailyByDate.get(date);
    return {
      date,
      label: dayLabel(date),
      xp: row?.xp ?? 0,
      minutes: row?.minutes ?? 0,
      lessons: row?.lessons ?? 0,
    };
  });

  const settingsRow = settingsResult.data as SettingsRow | null;
  const settings: UserSettings = {
    theme: settingsRow?.theme ?? "day",
    soundEnabled: settingsRow?.sound_enabled ?? true,
    reducedMotion: settingsRow?.reduced_motion ?? false,
    streakVisual: settingsRow?.streak_visual ?? "fossil",
  };

  return {
    profile: {
      username: profile.username,
      displayName: profile.display_name,
      avatar: profile.avatar,
      joinedAt: profile.joined_at,
      xp: profile.xp,
    },
    settings,
    streak,
    chapters,
    attempts,
    achievements,
    daily,
    totalCorrect,
    totalAsked,
    accuracy:
      totalAsked > 0 ? Math.round((totalCorrect / totalAsked) * 100) : 0,
    overallPercent: getOverallPercent(
      lessonsDone,
      completedChapters,
      totalLessons,
      chapters.length,
    ),
    completedChapters,
    totalChapters: chapters.length,
    weekXp: daily.reduce((sum, day) => sum + day.xp, 0),
  };
}
