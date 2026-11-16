"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
  useTransition,
} from "react";
import { StreakCard } from "@/components/gamification/Streak";
import { AchievementBadge, LevelBar } from "@/components/gamification/Widgets";
import { Icon } from "@/components/ui/Icon";
import {
  Card,
  Chip,
  Eyebrow,
  ProgressBar,
  StatTile,
} from "@/components/ui/primitives";
import { updateSettingsAction } from "@/lib/actions/profile";
import { paths } from "@/lib/routes";
import type { ProgressPageData } from "@/lib/data/types";
import type { DailyActivity, StreakVisual } from "@/types";
import { formatDuration } from "@/hooks/useStopwatch";
import { cn } from "@/utils/cn";

type Metric = "xp" | "minutes" | "lessons";
const METRICS: { key: Metric; label: string; unit: string }[] = [
  { key: "xp", label: "XP", unit: "XP" },
  { key: "minutes", label: "Menit", unit: "menit" },
  { key: "lessons", label: "Materi", unit: "materi" },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

function WeeklyChart({
  daily,
  metric,
}: {
  daily: DailyActivity[];
  metric: Metric;
}) {
  const meta = METRICS.find((m) => m.key === metric)!;
  const max = Math.max(1, ...daily.map((d) => d[metric]));
  return (
    <ol
      className="mt-5 grid h-56 grid-cols-7 gap-2 sm:gap-4"
      aria-label={`Grafik ${meta.label} tujuh hari terakhir`}
    >
      {daily.map((day, i) => {
        const value = day[metric];
        const isToday = i === daily.length - 1;
        return (
          <li
            key={day.date}
            className="flex h-full flex-col items-center justify-end gap-1.5"
          >
            <span className="font-display text-sm font-semibold text-ink tabular-nums">
              {value}
            </span>
            <span
              className="flex min-h-0 w-full flex-1 items-end justify-center"
              aria-hidden
            >
              <span
                className={cn(
                  "w-full max-w-14 rounded-t-xl rounded-b-md transition-[height] duration-700 ease-out",
                  value === 0
                    ? "bg-surface-2"
                    : isToday
                      ? "bg-amber"
                      : "bg-primary",
                )}
                style={{ height: `${Math.max(4, (value / max) * 100)}%` }}
              />
            </span>
            <span
              className={cn(
                "text-center text-[11px] font-extrabold leading-tight",
                isToday ? "text-ink" : "text-muted",
              )}
            >
              {day.label}
            </span>
            <span className="sr-only">
              {value} {meta.unit}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function Progress({ data }: { data: ProgressPageData }) {
  const router = useRouter();
  const [metric, setMetric] = useState<Metric>("xp");
  const [variant, setVariant] = useState<StreakVisual>(
    data.settings.streakVisual,
  );
  const [pending, startTransition] = useTransition();

  const chapters = data.chapters;
  const unlockedAchievements = data.achievements.filter(
    (entry) => entry.unlocked,
  ).length;
  const chapterTitles = new Map(
    chapters.map((chapter) => [chapter.id, chapter.title]),
  );

  const changeVariant = (next: StreakVisual) => {
    setVariant(next);
    startTransition(async () => {
      const result = await updateSettingsAction({ streakVisual: next });
      if (!result.ok) {
        setVariant(data.settings.streakVisual);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <header>
        <Eyebrow>Catatan penjelajah</Eyebrow>
        <h1 className="mt-1 font-display text-4xl font-bold text-ink sm:text-5xl">
          Progres belajar
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          Ringkasan aktivitas belajarmu: XP, akurasi, chapter, dan streak.
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Eyebrow>Tujuh hari terakhir</Eyebrow>
              <p className="mt-1 font-display text-3xl font-semibold text-ink tabular-nums">
                {data.weekXp}{" "}
                <span className="text-base text-muted">XP minggu ini</span>
              </p>
            </div>
            <div
              className="flex rounded-2xl bg-surface-2 p-1"
              role="group"
              aria-label="Pilih data grafik"
            >
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  aria-pressed={metric === m.key}
                  onClick={() => setMetric(m.key)}
                  className={cn(
                    "min-h-10 rounded-xl px-3.5 text-sm font-bold transition-colors",
                    metric === m.key
                      ? "bg-surface text-ink shadow-sm"
                      : "text-muted",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <WeeklyChart daily={data.daily} metric={metric} />
        </Card>

        <Card>
          <Eyebrow>Level dan XP</Eyebrow>
          <LevelBar xp={data.profile.xp} className="mt-3" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatTile
              icon="bolt"
              label="Total XP"
              value={data.profile.xp}
              tone="amber"
            />
            <StatTile
              icon="target"
              label="Akurasi"
              value={`${data.accuracy}%`}
              tone="leaf"
            />
            <StatTile
              icon="check"
              label="Chapter"
              value={`${data.completedChapters}/${data.totalChapters}`}
              tone="ice"
            />
            <StatTile
              icon="flame"
              label="Streak"
              value={data.streak.current}
              tone="lava"
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-baseline justify-between gap-3">
            <Eyebrow>Chapter</Eyebrow>
            <span className="font-display text-lg font-semibold text-ink tabular-nums">
              {data.overallPercent}% tuntas
            </span>
          </div>
          <ol className="mt-3 divide-y divide-line">
            {chapters.map((chapter) => {
              const status = chapter.status;
              const locked = status === "locked";
              return (
                <li key={chapter.id} className="flex items-center gap-3 py-3">
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold tabular-nums",
                      status === "completed"
                        ? "bg-primary text-on-primary"
                        : locked
                          ? "bg-surface-2 text-muted"
                          : "bg-amber text-[#2B2218]",
                    )}
                  >
                    {status === "completed" ? (
                      <Icon name="check" size={16} />
                    ) : locked ? (
                      <Icon name="lock" size={14} />
                    ) : (
                      chapter.id
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    {locked ? (
                      <span className="block truncate font-bold text-muted">
                        {chapter.title}
                      </span>
                    ) : (
                      <Link
                        href={paths.lesson(chapter.id, 0)}
                        className="block truncate font-bold text-ink underline-offset-4 hover:underline"
                      >
                        {chapter.title}
                      </Link>
                    )}
                    <ProgressBar
                      value={chapter.percent}
                      label={`Progres ${chapter.title}`}
                      tone={status === "completed" ? "primary" : "amber"}
                      className="mt-1.5"
                    />
                  </div>
                  <span className="w-24 shrink-0 text-right text-xs font-extrabold text-muted">
                    {chapter.bestScore != null
                      ? `Terbaik ${chapter.bestScore}%`
                      : locked
                        ? "Terkunci"
                        : "Belum latihan"}
                  </span>
                </li>
              );
            })}
          </ol>
        </Card>

        <StreakCard
          current={data.streak.current}
          longest={data.streak.longest}
          activeToday={data.streak.activeToday}
          variant={variant}
          onVariantChange={changeVariant}
        />
      </div>

      <Card>
        <Eyebrow>Riwayat latihan</Eyebrow>
        {data.attempts.length === 0 ? (
          <p className="mt-3 font-bold text-ink">
            Belum ada latihan. Selesaikan satu latihan untuk melihat riwayatnya
            di sini.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {data.attempts.map((attempt) => {
              const perfect = attempt.correct === attempt.total;
              return (
                <li
                  key={attempt.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-surface-2 p-3.5"
                >
                  <span
                    className={cn(
                      "grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display font-bold tabular-nums",
                      perfect
                        ? "bg-amber text-[#2B2218]"
                        : "bg-surface text-ink",
                    )}
                  >
                    {attempt.correct}/{attempt.total}
                  </span>
                  <div className="min-w-0 flex-1 basis-40">
                    <p className="truncate font-bold text-ink">
                      Chapter {attempt.chapterId} ·{" "}
                      {chapterTitles.get(attempt.chapterId)}
                    </p>
                    <p className="text-sm text-muted">
                      {formatDate(attempt.date)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {perfect && (
                      <Chip tone="amber" icon="star">
                        Sempurna
                      </Chip>
                    )}
                    <Chip icon="clock" className="bg-surface tabular-nums">
                      {formatDuration(attempt.durationSec)}
                    </Chip>
                    <Chip icon="bolt" className="bg-surface tabular-nums">
                      +{attempt.xpEarned} XP
                    </Chip>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <div className="flex items-baseline justify-between gap-3">
          <Eyebrow>Lencana</Eyebrow>
          <span className="text-sm font-extrabold text-muted tabular-nums">
            {unlockedAchievements} dari {data.achievements.length} terbuka
          </span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.achievements.map((entry) => (
            <AchievementBadge
              key={entry.achievement.id}
              achievement={entry.achievement}
              unlocked={entry.unlocked}
            />
          ))}
        </div>
      </Card>
      {pending && <span className="sr-only">Menyimpan pengaturan…</span>}
    </div>
  );
}
