"use client";

import { EggArt } from "@/components/art/DinoArt";
import { Trixsaurus, type TrixMood } from "@/components/character/Trixsaurus";
import { AchievementBadge } from "@/components/gamification/Widgets";
import { Icon, type IconName } from "@/components/ui/Icon";
import {
  Button,
  Card,
  Chip,
  Eyebrow,
  ProgressBar,
  StatTile,
} from "@/components/ui/primitives";
import { getLevelInfo } from "@/lib/game/rules";
import { paths } from "@/lib/routes";
import type { DashboardData } from "@/lib/data/types";
import type { ActivityKind } from "@/types";

const ACTIVITY_ICON: Record<ActivityKind, IconName> = {
  lesson: "book",
  quiz: "target",
  hatch: "egg",
  achievement: "star",
  streak: "flame",
};

export function Dashboard({ data }: { data: DashboardData }) {
  const { profile, chapters, streak, today, egg, activities, achievements } =
    data;

  const nextChapter = chapters.find((chapter) => !chapter.completed);
  const nextLessonIndex = nextChapter
    ? nextChapter.lessons.findIndex(
        (lesson) => !nextChapter.lessonsDone.includes(lesson.id),
      )
    : -1;
  const nextLesson =
    nextChapter && nextLessonIndex >= 0
      ? nextChapter.lessons[nextLessonIndex]
      : undefined;
  const nextQuiz =
    nextChapter && !nextLesson && nextChapter.questionsCount > 0
      ? nextChapter
      : undefined;
  const allChaptersCompleted =
    chapters.length > 0 && data.completedChapters === chapters.length;
  const level = getLevelInfo(profile.xp);
  const unlockedAchievements = achievements.filter(
    ({ unlocked }) => unlocked,
  ).length;

  const mood: TrixMood =
    streak.current === 0
      ? "sad"
      : allChaptersCompleted
        ? "celebrating"
        : streak.activeToday
          ? "happy"
          : "idle";
  const bubble =
    streak.current === 0
      ? "Belajar hari ini untuk memulai streak pertamamu."
      : allChaptersCompleted
        ? "Semua materi sudah selesai. Kamu resmi Raja Matriks!"
        : streak.activeToday
          ? "Kerja bagus hari ini! Mau lanjut satu materi lagi?"
          : "Yuk lanjutkan petualangan belajarmu.";

  return (
    <div className="space-y-5">
      <section className="card-shadow relative overflow-hidden rounded-[2rem] bg-primary text-on-primary">
        <svg
          viewBox="0 0 800 120"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-20 w-full opacity-25"
          aria-hidden
        >
          <path
            d="M0 80 C160 20 300 100 460 60 C620 20 700 70 800 40 V120 H0 Z"
            fill="currentColor"
          />
        </svg>
        <div className="relative grid items-center gap-2 p-5 sm:p-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em]">
              Markas penjelajah
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold sm:text-5xl">
              Halo, {profile.displayName}!
            </h1>
            <p className="mt-3 max-w-md rounded-2xl rounded-bl-md bg-surface px-4 py-2.5 font-bold text-ink">
              {bubble}
            </p>

            {nextChapter && (nextLesson || nextQuiz) ? (
              <div className="mt-5 rounded-3xl bg-surface p-4 text-ink sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="amber" icon="map">
                    Misi berikutnya
                  </Chip>
                  <Chip>
                    Chapter {nextChapter.id} · {nextChapter.zone}
                  </Chip>
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold">
                  {nextQuiz
                    ? `Latihan: ${nextChapter.title}`
                    : nextLesson?.title}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {nextQuiz
                    ? "Semua materi chapter ini sudah dibaca. Saatnya uji pemahamanmu."
                    : `${nextChapter.title} · sekitar ${nextLesson?.minutes} menit`}
                </p>
                <ProgressBar
                  value={nextChapter.percent}
                  label={`Progres ${nextChapter.title}`}
                  className="mt-3"
                />
                <Button
                  href={
                    nextQuiz
                      ? paths.quiz(nextChapter.id)
                      : paths.lesson(nextChapter.id, nextLessonIndex)
                  }
                  variant="amber"
                  icon="play"
                  className="mt-4"
                >
                  {nextQuiz ? "Mulai latihan" : "Lanjutkan belajar"}
                </Button>
              </div>
            ) : chapters.length === 0 ? (
              <div className="mt-5 rounded-3xl bg-surface p-5 text-ink">
                <h2 className="font-display text-2xl font-semibold">
                  Materi belum tersedia
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Materi belajar belum tersedia di database.
                </p>
              </div>
            ) : allChaptersCompleted ? (
              <div className="mt-5 rounded-3xl bg-surface p-5 text-ink">
                <h2 className="font-display text-2xl font-semibold">
                  Petualangan tuntas!
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Semua chapter telah kamu selesaikan.
                </p>
                <Button
                  href={paths.learn}
                  variant="amber"
                  icon="map"
                  className="mt-4"
                >
                  Buka peta chapter
                </Button>
              </div>
            ) : (
              <div className="mt-5 rounded-3xl bg-surface p-5 text-ink">
                <h2 className="font-display text-2xl font-semibold">
                  Belum ada latihan berikutnya
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Latihan untuk chapter berikutnya belum tersedia.
                </p>
              </div>
            )}
          </div>
          <Trixsaurus
            mood={mood}
            size={220}
            className="mx-auto hidden md:block"
          />
        </div>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Eyebrow>Level dan XP</Eyebrow>
          <div className="mt-3 flex items-center gap-3">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber font-display text-xl font-bold text-[#2B2218]"
              aria-label={`Level ${level.level}`}
            >
              {level.level}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-display font-semibold text-ink">
                  {level.title}
                </span>
                <span className="shrink-0 text-xs font-extrabold text-muted tabular-nums">
                  {level.xpIntoLevel} / {level.xpForLevel} XP
                </span>
              </div>
              <ProgressBar
                value={level.xpIntoLevel}
                max={level.xpForLevel}
                tone="amber"
                label="XP menuju level berikutnya"
                className="mt-1.5"
                thick
              />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile
              icon="bolt"
              label="Total XP"
              value={profile.xp}
              tone="amber"
            />
            <StatTile
              icon="check"
              label="Chapter selesai"
              value={`${data.completedChapters}/${chapters.length}`}
              tone="leaf"
            />
            <StatTile
              icon="book"
              label="Materi dibaca"
              value={data.lessonsDone}
              tone="ice"
            />
            <StatTile icon="clock" label="Menit hari ini" value={today.minutes} />
          </div>
          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <span className="font-display font-semibold text-ink">
                Progres seluruh petualangan
              </span>
              <span className="font-display text-xl font-semibold text-ink tabular-nums">
                {data.overallPercent}%
              </span>
            </div>
            <ProgressBar
              value={data.overallPercent}
              label="Progres seluruh petualangan"
              className="mt-2"
              thick
            />
            <ol
              className="mt-3 grid grid-cols-12 gap-1"
              aria-label="Status chapter"
            >
              {chapters.map((chapter) => (
                <li
                  key={chapter.id}
                  title={`Chapter ${chapter.id}`}
                  className={`grid h-7 place-items-center rounded-lg text-[11px] font-extrabold tabular-nums ${chapter.completed ? "bg-primary text-on-primary" : chapter.lessonsDone.length > 0 ? "bg-amber text-[#2B2218]" : "bg-surface-2 text-muted"}`}
                >
                  {chapter.id}
                </li>
              ))}
            </ol>
          </div>
        </Card>

        <Card>
          <Eyebrow>Telur dinosaurus</Eyebrow>
          {egg ? (
            <div className="mt-2 flex items-center gap-4">
              <EggArt
                progress={egg.progress / egg.target}
                accent={egg.dinosaur.accent}
                size={96}
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-semibold text-ink">
                  {egg.dinosaur.nickname}
                </p>
                <p className="text-sm text-muted">{egg.dinosaur.name}</p>
                <ProgressBar
                  value={egg.progress}
                  max={egg.target}
                  tone="amber"
                  label="Kehangatan telur"
                  className="mt-2"
                  thick
                />
                <p className="mt-1.5 text-sm font-bold text-muted tabular-nums">
                  {egg.progress} / {egg.target} kehangatan
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Belum ada telur yang sedang dierami.
            </p>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Eyebrow>Streak belajar</Eyebrow>
              <p className="mt-1 flex items-baseline gap-2 font-display text-3xl font-semibold text-ink">
                <Icon
                  name="flame"
                  size={26}
                  className="translate-y-1 text-lava"
                  filled
                />
                <span className="tabular-nums">{streak.current}</span>
                <span className="text-base text-muted">hari</span>
              </p>
            </div>
            <p className="text-sm font-bold text-muted">
              Terpanjang: {streak.longest} hari
            </p>
          </div>
          <p className="mt-3 text-sm text-muted">
            {streak.activeToday
              ? "Aktivitas belajarmu hari ini sudah tercatat."
              : "Selesaikan materi atau latihan untuk mencatat aktivitas hari ini."}
          </p>
        </Card>

        <Card>
          <Eyebrow>Aktivitas terakhir</Eyebrow>
          {activities.length ? (
            <ul className="mt-3 space-y-3">
              {activities.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink">
                    <Icon name={ACTIVITY_ICON[item.kind]} size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold leading-snug text-ink">
                      {item.title}
                    </span>
                    <span className="block text-sm text-muted">
                      {item.detail}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-extrabold text-muted">
                    {item.when}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Belum ada aktivitas belajar.
            </p>
          )}
          <Button
            href={paths.progress}
            variant="ghost"
            size="sm"
            iconRight="right"
            className="mt-4"
          >
            Lihat semua progres
          </Button>
        </Card>
      </div>

      <Card>
        <div className="flex items-baseline justify-between gap-3">
          <Eyebrow>Lencana</Eyebrow>
          <span className="text-sm font-extrabold text-muted tabular-nums">
            {unlockedAchievements} dari {achievements.length} terbuka
          </span>
        </div>
        {achievements.length ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.slice(0, 4).map(({ achievement, unlocked }) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                unlocked={unlocked}
              />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Belum ada lencana yang tersedia.
          </p>
        )}
      </Card>
    </div>
  );
}
