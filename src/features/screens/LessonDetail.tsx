"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { Trixsaurus } from "@/components/character/Trixsaurus";
import { ContentBlocks } from "@/components/lesson/ContentBlocks";
import { MatrixVisualizer } from "@/components/matrix/MatrixVisualizer";
import { Icon } from "@/components/ui/Icon";
import {
  Button,
  Card,
  Chip,
  Eyebrow,
  ProgressBar,
} from "@/components/ui/primitives";
import { completeLessonAction } from "@/lib/actions/learning";
import { RULES } from "@/lib/game/rules";
import { paths } from "@/lib/routes";
import type { LessonPageData } from "@/lib/data/types";
import { cn } from "@/utils/cn";

export function LessonDetail({ data }: { data: LessonPageData | null }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (!data) {
    return (
      <Notice
        mood="thinking"
        title="Materi tidak ditemukan"
        body="Jejaknya hilang di sini. Kembali ke peta untuk memilih chapter."
      >
        <Button href={paths.learn} icon="map">
          Buka peta chapter
        </Button>
      </Notice>
    );
  }

  const { chapter, lesson, lessonIndex, previous } = data;

  if (chapter.status === "locked") {
    return (
      <Notice
        mood="sad"
        title={`Chapter ${chapter.id} masih terkunci`}
        body={`Lulus latihan Chapter ${chapter.id - 1} dulu untuk membuka ${chapter.zone}.`}
      >
        <Button
          href={paths.quiz(chapter.id - 1)}
          variant="amber"
          icon="target"
        >
          Latihan Chapter {chapter.id - 1}
        </Button>
        <Button href={paths.learn} variant="ghost" icon="map">
          Peta chapter
        </Button>
      </Notice>
    );
  }

  const done = chapter.lessonsDone.includes(lesson.id);
  const isLast = lessonIndex === chapter.lessons.length - 1;
  const prevPath = previous
    ? paths.lesson(previous.chapterId, previous.lessonIndex)
    : null;
  const nextPath = isLast
    ? paths.quiz(chapter.id)
    : paths.lesson(chapter.id, lessonIndex + 1);

  const finish = () => {
    startTransition(async () => {
      const result = await completeLessonAction(chapter.id, lesson.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(nextPath);
      router.refresh();
    });
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <article className="min-w-0">
        <Link
          href={paths.learn}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl font-bold text-muted no-underline hover:text-ink"
        >
          <Icon name="left" size={18} />
          Peta chapter
        </Link>

        <header className="mt-2">
          <Eyebrow>
            Chapter {chapter.id} · {chapter.zone}
          </Eyebrow>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-5xl">
            {lesson.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip icon="book">
              Materi {lessonIndex + 1} dari {chapter.lessons.length}
            </Chip>
            <Chip icon="clock">{lesson.minutes} menit</Chip>
            <Chip
              tone={
                chapter.difficulty === "Dasar"
                  ? "leaf"
                  : chapter.difficulty === "Menengah"
                    ? "amber"
                    : "lava"
              }
            >
              {chapter.difficulty}
            </Chip>
            {done && (
              <Chip tone="leaf" icon="check">
                Sudah dibaca
              </Chip>
            )}
          </div>
        </header>

        {/* Navigasi antar materi (mobile & tablet) */}
        <nav
          className="scroll-x mt-5 lg:hidden"
          aria-label="Materi dalam chapter ini"
        >
          <ol className="flex w-max gap-2 pb-1">
            {chapter.lessons.map((item, i) => (
              <li key={item.id}>
                <Link
                  href={paths.lesson(chapter.id, i)}
                  aria-current={i === lessonIndex ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-2xl border-2 px-3.5 text-sm font-bold no-underline",
                    i === lessonIndex
                      ? "border-primary bg-primary text-on-primary"
                      : "border-line bg-surface text-ink",
                  )}
                >
                  {chapter.lessonsDone.includes(item.id) && (
                    <Icon name="check" size={14} />
                  )}
                  {i + 1}. {item.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-6">
          <ContentBlocks blocks={lesson.blocks} />
        </div>

        {lesson.showViz && (
          <MatrixVisualizer operation={chapter.viz} className="mt-8" />
        )}

        {isLast && (
          <Card className="mt-8 border-primary bg-leaf">
            <Eyebrow>Rangkuman chapter {chapter.id}</Eyebrow>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
              {chapter.title}
            </h2>
            <ul className="mt-3 space-y-2">
              {chapter.summary.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 font-bold text-ink"
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-on-primary">
                    <Icon name="check" size={14} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Navigasi bawah */}
        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          {prevPath ? (
            <Button href={prevPath} variant="ghost" icon="left">
              Materi sebelumnya
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href={paths.quiz(chapter.id)} variant="amber" icon="target">
              Latihan
            </Button>
            <Button onClick={finish} iconRight="right" disabled={pending}>
              {pending
                ? "Menyimpan..."
                : done
                  ? isLast
                    ? "Lanjut ke latihan"
                    : "Materi berikutnya"
                  : `Selesai, lanjut (+${RULES.xpPerLesson} XP)`}
            </Button>
          </div>
        </div>
        {error && (
          <p className="mt-3 text-sm font-bold text-lava" role="alert">
            {error}
          </p>
        )}
      </article>

      {/* Panel samping (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Trixsaurus
                mood={done ? "happy" : "thinking"}
                size={72}
                decorative
              />
              <p className="rounded-2xl rounded-bl-md bg-surface-2 px-3 py-2 text-sm font-bold text-ink">
                {lesson.showViz
                  ? "Jangan lewatkan visualisasinya di bawah. Ubah angkanya!"
                  : done
                    ? "Materi ini sudah kamu kuasai."
                    : "Baca pelan-pelan, lalu coba contohnya."}
              </p>
            </div>
            <ProgressBar
              value={chapter.percent}
              label={`Progres ${chapter.title}`}
              className="mt-4"
            />
            <ol
              className="mt-4 space-y-1.5"
              aria-label="Materi dalam chapter ini"
            >
              {chapter.lessons.map((item, i) => {
                const isDone = chapter.lessonsDone.includes(item.id);
                return (
                  <li key={item.id}>
                    <Link
                      href={paths.lesson(chapter.id, i)}
                      aria-current={i === lessonIndex ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold no-underline transition-colors",
                        i === lessonIndex
                          ? "bg-primary text-on-primary"
                          : "text-ink hover:bg-surface-2",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-extrabold",
                          isDone
                            ? "bg-amber text-[#2B2218]"
                            : "bg-surface-2 text-muted",
                        )}
                      >
                        {isDone ? <Icon name="check" size={12} /> : i + 1}
                      </span>
                      {item.title}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href={paths.quiz(chapter.id)}
                  className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-ink no-underline hover:bg-surface-2"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-soft text-ink">
                    <Icon name="target" size={12} />
                  </span>
                  Latihan soal
                </Link>
              </li>
            </ol>
          </Card>
        </div>
      </aside>
    </div>
  );
}

export function Notice({
  mood,
  title,
  body,
  children,
}: {
  mood: "sad" | "thinking";
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <Trixsaurus mood={mood} size={160} className="mx-auto" />
      <h1 className="mt-4 font-display text-3xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-muted">{body}</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {children}
      </div>
    </div>
  );
}
