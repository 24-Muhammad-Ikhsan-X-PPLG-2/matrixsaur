import type { createClient } from "@/lib/supabase/server";
import type {
  Achievement,
  ActivityKind,
  AvatarId,
  Dinosaur,
  DinosaurEgg,
  DinoRarity,
  DinoSpecies,
  StreakState,
} from "@/types";
import type { AchievementView } from "./types";

export type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export const DINOSAUR_COLUMNS =
  "id, species, name, nickname, rarity, era, color, accent, description, matrix_power";

export type DinosaurRow = {
  id: string;
  species: DinoSpecies;
  name: string;
  nickname: string;
  rarity: DinoRarity;
  era: string;
  color: string;
  accent: string;
  description: string;
  matrix_power: string;
};

export function mapDinosaur(row: DinosaurRow): Dinosaur {
  return {
    id: row.id,
    species: row.species,
    name: row.name,
    nickname: row.nickname,
    rarity: row.rarity,
    era: row.era,
    color: row.color,
    accent: row.accent,
    description: row.description,
    matrixPower: row.matrix_power,
  };
}

export function getJakartaDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00+07:00`);
  date.setUTCDate(date.getUTCDate() + days);
  return getJakartaDate(date);
}

export function formatActivityTime(value: string): string {
  const date = new Date(value);
  const dateKey = getJakartaDate(date);
  const today = getJakartaDate();
  const yesterday = addDays(today, -1);

  if (dateKey === today) return "Hari ini";
  if (dateKey === yesterday) return "Kemarin";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function dayLabel(isoDate: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${isoDate}T12:00:00+07:00`));
}

export async function fetchActiveEgg(
  supabase: SupabaseClient,
  userId: string,
): Promise<DinosaurEgg | null> {
  const { data: egg, error } = await supabase
    .from("dinosaur_eggs")
    .select("id, dinosaur_id, progress, target")
    .eq("user_id", userId)
    .eq("status", "incubating")
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat telur: ${error.message}`);
  }
  if (!egg) return null;

  const { data: dinosaur, error: dinosaurError } = await supabase
    .from("dinosaurs")
    .select(DINOSAUR_COLUMNS)
    .eq("id", egg.dinosaur_id)
    .single();

  if (dinosaurError || !dinosaur) {
    throw new Error(
      `Gagal memuat dinosaurus telur: ${dinosaurError?.message ?? "tidak ditemukan"}`,
    );
  }

  return {
    id: egg.id,
    dinosaur: mapDinosaur(dinosaur as DinosaurRow),
    progress: egg.progress,
    target: egg.target,
  };
}

export async function fetchAchievements(
  supabase: SupabaseClient,
  userId: string,
): Promise<AchievementView[]> {
  const [catalogResult, unlockedResult] = await Promise.all([
    supabase
      .from("achievements")
      .select("id, title, description, icon")
      .order("sort_order"),
    supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId),
  ]);

  const failed = catalogResult.error ?? unlockedResult.error;
  if (failed) {
    throw new Error(`Gagal memuat lencana: ${failed.message}`);
  }

  const unlocked = new Set(
    (unlockedResult.data ?? []).map((row) => row.achievement_id),
  );

  return (catalogResult.data ?? []).map((row) => ({
    achievement: row as Achievement,
    unlocked: unlocked.has(row.id),
  }));
}

type StreakRow = {
  current_days: number;
  longest_days: number;
  last_study_date: string | null;
};

export async function fetchStreak(
  supabase: SupabaseClient,
  userId: string,
): Promise<StreakState> {
  const { data, error } = await supabase
    .from("user_streaks")
    .select("current_days, longest_days, last_study_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat streak: ${error.message}`);
  }

  const row = data as StreakRow | null;
  return {
    current: row?.current_days ?? 0,
    longest: row?.longest_days ?? 0,
    activeToday: row?.last_study_date === getJakartaDate(),
  };
}

export type ActivityRow = {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  happened_at: string;
};

export async function fetchRecentActivities(
  supabase: SupabaseClient,
  userId: string,
  limit = 5,
) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id, kind, title, detail, happened_at")
    .eq("user_id", userId)
    .order("happened_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Gagal memuat aktivitas: ${error.message}`);
  }

  return ((data ?? []) as ActivityRow[]).map((row) => ({
    id: row.id,
    kind: row.kind,
    title: row.title,
    detail: row.detail,
    when: formatActivityTime(row.happened_at),
  }));
}

export type ProfileRow = {
  username: string;
  display_name: string;
  avatar: AvatarId;
  xp: number;
  joined_at: string;
};

export type SettingsRow = {
  theme: "day" | "night";
  sound_enabled: boolean;
  reduced_motion: boolean;
  streak_visual: "fossil" | "mammoth";
};
