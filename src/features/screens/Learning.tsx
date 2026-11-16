"use client";

import Link from "next/link";
import { useState } from "react";
import { Trixsaurus } from "@/components/character/Trixsaurus";
import { Icon } from "@/components/ui/Icon";
import { Button, Chip, Eyebrow, ProgressBar } from "@/components/ui/primitives";
import { paths } from "@/lib/routes";
import type { ChapterView, LearningPageData } from "@/lib/data/types";
import type { ChapterStatus, Difficulty } from "@/types";
import { cn } from "@/utils/cn";

const DIFFICULTY_TONE: Record<Difficulty, "leaf" | "amber" | "lava"> = {
  Dasar: "leaf",
  Menengah: "amber",
  Lanjut: "lava",
};
const STATUS_LABEL: Record<ChapterStatus, string> = {
  locked: "Terkunci",
  available: "Siap dijelajahi",
  "in-progress": "Sedang dipelajari",
  completed: "Selesai",
};
const FILTERS: ("Semua" | Difficulty)[] = [
  "Semua",
  "Dasar",
  "Menengah",
  "Lanjut",
];

export function Learning({ data }: { data: LearningPageData }) {
  const { chapters, nextChapterId, completedChapters } = data;
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Semua");
  const [openId, setOpenId] = useState<number | null>(nextChapterId ?? 1);
  const visible = chapters.filter(
    (chapter) => filter === "Semua" || chapter.difficulty === filter,
  );

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Peta petualangan</Eyebrow>
          <h1 className="mt-1 font-display text-4xl font-bold text-ink sm:text-5xl">
            12 chapter matriks
          </h1>
          <p className="mt-2 max-w-xl text-muted">
            Ikuti jejaknya dari dasar sampai lanjut. Lulus latihan (minimal 60%)
            membuka chapter berikutnya.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-3xl border border-line bg-surface px-4 py-3">
          <Trixsaurus mood="thinking" size={56} decorative />
          <div>
            <p className="font-display text-2xl font-semibold leading-none text-ink tabular-nums">
              {completedChapters}/{chapters.length}
            </p>
            <p className="text-sm font-bold text-muted">chapter selesai</p>
          </div>
        </div>
      </header>

      <div
        className="mt-6 flex flex-wrap gap-2"
        role="group"
        aria-label="Saring tingkat kesulitan"
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              "min-h-11 rounded-2xl border-2 px-4 font-display font-semibold transition-colors",
              filter === f
                ? "border-primary bg-primary text-on-primary"
                : "border-line bg-surface text-ink hover:border-primary",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <ol className="relative mt-8 space-y-4">
        <span
          aria-hidden
          className="absolute bottom-6 left-[1.4rem] top-6 w-0 border-l-4 border-dotted border-line sm:left-7"
        />
        {visible.map((chapter) => (
          <ChapterRow
            key={chapter.id}
            chapter={chapter}
            open={openId === chapter.id}
            onToggle={() =>
              setOpenId(openId === chapter.id ? null : chapter.id)
            }
            isNext={nextChapterId === chapter.id}
          />
        ))}
      </ol>
    </div>
  );
}

function ChapterRow({
  chapter,
  open,
  onToggle,
  isNext,
}: {
  chapter: ChapterView;
  open: boolean;
  onToggle: () => void;
  isNext: boolean;
}) {
  const status = chapter.status;
  const locked = status === "locked";
  const panelId = `chapter-panel-${chapter.id}`;

  return (
    <li className="relative flex gap-3 sm:gap-5">
      <span
        className={cn(
          "relative z-10 mt-4 grid h-12 w-12 shrink-0 place-items-center rounded-full border-4 border-bg font-display text-lg font-bold tabular-nums sm:h-14 sm:w-14",
          status === "completed" && "bg-primary text-on-primary",
          status === "in-progress" && "bg-amber text-[#2B2218]",
          status === "available" && "bg-leaf text-ink",
          locked && "bg-surface-2 text-muted",
        )}
        aria-hidden
      >
        {status === "completed" ? (
          <Icon name="check" size={22} />
        ) : locked ? (
          <Icon name="lock" size={18} />
        ) : (
          chapter.id
        )}
      </span>

      <article
        className={cn(
          "card-shadow min-w-0 flex-1 rounded-3xl border bg-surface",
          isNext ? "border-amber ring-2 ring-amber" : "border-line",
          locked && "opacity-75",
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-start gap-3 rounded-3xl p-4 text-left sm:p-5"
        >
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <Chip tone={DIFFICULTY_TONE[chapter.difficulty]}>
                {chapter.difficulty}
              </Chip>
              <Chip
                tone={
                  status === "completed"
                    ? "leaf"
                    : status === "in-progress"
                      ? "amber"
                      : "plain"
                }
                icon={
                  locked ? "lock" : status === "completed" ? "check" : undefined
                }
              >
                {STATUS_LABEL[status]}
              </Chip>
              {isNext && (
                <Chip tone="amber" icon="footprint">
                  Lanjut di sini
                </Chip>
              )}
            </span>
            <span className="mt-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
              Chapter {chapter.id} · {chapter.zone}
            </span>
            <span className="mt-0.5 block font-display text-xl font-semibold text-ink sm:text-2xl">
              {chapter.title}
            </span>
            <span className="mt-1 block text-sm text-muted">
              {chapter.tagline}
            </span>
            <span className="mt-3 flex items-center gap-3">
              <ProgressBar
                value={chapter.percent}
                label={`Progres ${chapter.title}`}
                tone={status === "completed" ? "primary" : "amber"}
              />
              <span className="w-10 shrink-0 text-right text-sm font-extrabold text-ink tabular-nums">
                {chapter.percent}%
              </span>
            </span>
          </span>
          <Icon
            name="right"
            size={20}
            className={cn(
              "mt-1 text-muted transition-transform",
              open && "rotate-90",
            )}
          />
        </button>

        {open && (
          <div
            id={panelId}
            className="animate-rise border-t border-line p-4 sm:p-5"
          >
            {locked ? (
              <p className="flex items-center gap-2 font-bold text-ink">
                <Icon name="lock" size={18} />
                Lulus latihan Chapter {chapter.id - 1} untuk membuka wilayah
                ini.
              </p>
            ) : (
              <>
                <ul className="space-y-2">
                  {chapter.lessons.map((lesson, index) => {
                    const done = chapter.lessonsDone.includes(lesson.id);
                    return (
                      <li key={lesson.id}>
                        <Link
                          href={paths.lesson(chapter.id, index)}
                          className="flex min-h-12 items-center gap-3 rounded-2xl bg-surface-2 px-3.5 py-2 no-underline transition-colors hover:bg-leaf"
                        >
                          <span
                            className={cn(
                              "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold",
                              done
                                ? "bg-primary text-on-primary"
                                : "bg-surface text-muted",
                            )}
                          >
                            {done ? <Icon name="check" size={14} /> : index + 1}
                          </span>
                          <span className="min-w-0 flex-1 font-bold text-ink">
                            {lesson.title}
                          </span>
                          <span className="shrink-0 text-xs font-extrabold text-muted">
                            {lesson.minutes} mnt
                          </span>
                          <span className="sr-only">
                            {done ? "sudah dibaca" : "belum dibaca"}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button
                    href={paths.quiz(chapter.id)}
                    variant="amber"
                    size="sm"
                    icon="target"
                  >
                    Latihan soal
                  </Button>
                  <Button
                    href={paths.lesson(chapter.id, 0)}
                    variant="ghost"
                    size="sm"
                    icon="book"
                  >
                    Baca dari awal
                  </Button>
                  <span className="text-sm font-bold text-muted">
                    {chapter.bestScore != null
                      ? `Nilai terbaik ${chapter.bestScore}%`
                      : "Belum pernah latihan"}{" "}
                    · hadiah {chapter.xpReward} XP
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </article>
    </li>
  );
}
