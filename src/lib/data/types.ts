/** Kontrak data per halaman yang disiapkan server untuk komponen klien. */
import type {
  Achievement,
  ActivityLog,
  AvatarId,
  ChapterStatus,
  DailyActivity,
  Difficulty,
  Dinosaur,
  DinosaurEgg,
  ID,
  Lesson,
  LessonSummary,
  QuizAttempt,
  QuizQuestion,
  StreakState,
  UserSettings,
  VizOperation,
} from "@/types";

export interface ChapterView {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  zone: string;
  difficulty: Difficulty;
  viz: VizOperation;
  xpReward: number;
  summary: string[];
  lessons: LessonSummary[];
  questionsCount: number;
  lessonsDone: ID[];
  bestScore: number | null;
  completed: boolean;
  percent: number;
  status: ChapterStatus;
}

export interface ShellData {
  displayName: string;
  avatar: AvatarId;
  xp: number;
  streak: number;
  settings: UserSettings;
}

export interface AccountSummary {
  username: string;
  displayName: string;
  avatar: AvatarId;
  joinedAt: string;
  xp: number;
}

export interface AchievementView {
  achievement: Achievement;
  unlocked: boolean;
}

export interface DashboardData {
  profile: AccountSummary;
  streak: StreakState;
  chapters: ChapterView[];
  today: { xp: number; minutes: number; lessons: number };
  egg: DinosaurEgg | null;
  activities: ActivityLog[];
  achievements: AchievementView[];
  overallPercent: number;
  lessonsDone: number;
  totalLessons: number;
  totalChapters: number;
  completedChapters: number;
}

export interface LearningPageData {
  chapters: ChapterView[];
  nextChapterId: number | null;
  completedChapters: number;
}

export interface LessonPageData {
  chapter: ChapterView;
  lesson: Lesson;
  lessonIndex: number;
  previous: { chapterId: number; lessonIndex: number } | null;
}

export interface QuizPageData {
  chapter: ChapterView;
  questions: QuizQuestion[];
  nextChapter: { id: number; zone: string } | null;
  soundEnabled: boolean;
}

export interface CollectionPageData {
  dinosaurs: Dinosaur[];
  ownedIds: ID[];
  egg: DinosaurEgg | null;
}

export interface ProfileStats {
  completedChapters: number;
  totalChapters: number;
  lessonsRead: number;
  attempts: number;
  accuracy: number;
  longestStreak: number;
  dinosaursOwned: number;
  totalDinosaurs: number;
  achievementsUnlocked: number;
  totalAchievements: number;
}

export interface ProfilePageData {
  profile: AccountSummary;
  settings: UserSettings;
  stats: ProfileStats;
}

export interface ProgressPageData {
  profile: AccountSummary;
  settings: UserSettings;
  streak: StreakState;
  chapters: ChapterView[];
  attempts: QuizAttempt[];
  achievements: AchievementView[];
  daily: DailyActivity[];
  totalCorrect: number;
  totalAsked: number;
  accuracy: number;
  overallPercent: number;
  completedChapters: number;
  totalChapters: number;
  weekXp: number;
}

export interface ActionResult<T> {
  ok: true;
  data: T;
}

export interface ActionError {
  ok: false;
  error: string;
}

export type ActionResponse<T> = ActionResult<T> | ActionError;

export interface CompleteLessonResult {
  alreadyCompleted: boolean;
  xpAwarded: number;
  eggWarmed: number;
}

export interface CheckQuizAnswerResult {
  isCorrect: boolean;
  correctAnswerText: string;
  correctOptionIndex: number | null;
}

export interface SubmitQuizResult {
  attemptId: string;
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
  baseXp: number;
  bonus: number;
  xpEarned: number;
  alreadyCompleted: boolean;
  eggWarmed: number;
  eggProgress: number | null;
  eggTarget: number | null;
  eggReady: boolean;
}

export interface HatchEggResult {
  hatched: boolean;
  reason?: "no-active-egg" | "not-ready";
  dinosaurId?: string;
  nextDinosaurId?: string | null;
  nextTarget?: number | null;
}
