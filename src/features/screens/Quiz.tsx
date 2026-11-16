"use client";

import Link from "next/link";
import { useState } from "react";
import { Trixsaurus, type TrixMood } from "@/components/character/Trixsaurus";
import { Confetti } from "@/components/gamification/Widgets";
import {
  FeedbackBanner,
  QuestionCard,
  QuizProgress,
} from "@/components/quiz/QuizParts";
import { Icon } from "@/components/ui/Icon";
import {
  Button,
  Card,
  Chip,
  Eyebrow,
  StatTile,
} from "@/components/ui/primitives";
import {
  checkQuizAnswerAction,
  submitQuizAction,
} from "@/lib/actions/learning";
import { RULES } from "@/lib/game/rules";
import { paths } from "@/lib/routes";
import type { QuizPageData, SubmitQuizResult } from "@/lib/data/types";
import { useRoar } from "@/hooks/useRoar";
import { formatDuration, useStopwatch } from "@/hooks/useStopwatch";
import type { QuizAnswer } from "@/types";
import { Notice } from "./LessonDetail";

type QuizOutcome = SubmitQuizResult & { seconds: number };

const LINES: Record<"thinking" | "happy" | "angry", string[]> = {
  thinking: [
    "Pelan-pelan saja. Periksa baris dan kolomnya.",
    "Hmm, hitung dulu di kertas kalau perlu.",
    "Ingat rumusnya, lalu masukkan angkanya.",
  ],
  happy: [
    "Mantap! Telurmu makin hangat.",
    "Benar! Aku ikut senang.",
    "Tepat sekali, penjelajah!",
  ],
  angry: [
    "RAWR! Hampir. Baca penjelasannya, ya.",
    "GRRR! Periksa lagi tandanya.",
    "RAWR! Tidak apa-apa, soal berikutnya pasti bisa.",
  ],
};

export function Quiz({ data }: { data: QuizPageData | null }) {
  const roar = useRoar(data?.soundEnabled ?? false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);
  const { seconds, reset } = useStopwatch(!outcome && !submitting);

  if (!data || data.questions.length === 0) {
    return (
      <Notice
        mood="thinking"
        title="Latihan tidak ditemukan"
        body="Pilih chapter dari peta untuk memulai latihan."
      >
        <Button href={paths.learn} icon="map">
          Buka peta chapter
        </Button>
      </Notice>
    );
  }

  const { chapter, questions, nextChapter } = data;

  if (chapter.status === "locked") {
    return (
      <Notice
        mood="sad"
        title={`Latihan Chapter ${chapter.id} terkunci`}
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

  const total = questions.length;
  const question = questions[index];
  const locked = answers[index] ?? null;

  const submit = (given: string) => {
    if (checking) return;
    setError("");
    setChecking(true);

    void (async () => {
      const result = await checkQuizAnswerAction(question.id, given);
      setChecking(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setAnswers((prev) => [
        ...prev,
        {
          questionId: question.id,
          given,
          correct: result.data.isCorrect,
          correctAnswerText: result.data.correctAnswerText,
          correctOptionIndex: result.data.correctOptionIndex,
        },
      ]);

      if (!result.data.isCorrect) roar();
    })();
  };

  const next = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      return;
    }

    setSubmitting(true);
    setError("");

    void (async () => {
      const result = await submitQuizAction(
        chapter.id,
        answers.map((answer) => ({
          questionId: answer.questionId,
          given: answer.given,
        })),
        seconds,
      );
      setSubmitting(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOutcome({ ...result.data, seconds });
    })();
  };

  const restart = () => {
    setIndex(0);
    setAnswers([]);
    setOutcome(null);
    setError("");
    reset();
  };

  if (outcome) {
    const unlockedNext =
      outcome.passed && !outcome.alreadyCompleted && !!nextChapter;

    return (
      <div className="mx-auto max-w-3xl">
        <Card className="relative overflow-hidden text-center">
          {outcome.passed && <Confetti count={22} />}
          <Trixsaurus
            mood={outcome.passed ? "celebrating" : "sad"}
            size={170}
            className="mx-auto"
          />
          <Eyebrow className="mt-2">
            Hasil latihan · Chapter {chapter.id}
          </Eyebrow>
          <h1 className="mt-1 font-display text-4xl font-bold text-ink sm:text-5xl">
            {outcome.passed
              ? outcome.correct === outcome.total
                ? "Sempurna!"
                : "Latihan lulus!"
              : "Belum lulus"}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-muted">
            {outcome.passed
              ? unlockedNext
                ? `Chapter ${chapter.id + 1} · ${nextChapter?.zone} sekarang terbuka.`
                : "Nilai terbaikmu sudah dicatat untuk sesi ini."
              : `Butuh minimal ${RULES.passPercent}% untuk lulus. Baca lagi penjelasannya, lalu coba sekali lagi.`}
          </p>
          <p className="mt-5 font-display text-7xl font-bold text-ink tabular-nums">
            {outcome.correct}
            <span className="text-3xl text-muted">/{outcome.total}</span>
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
            <StatTile
              icon="bolt"
              label={
                outcome.bonus > 0
                  ? `XP (termasuk bonus ${outcome.bonus})`
                  : "XP didapat"
              }
              value={`+${outcome.xpEarned}`}
              tone="amber"
            />
            <StatTile
              icon="clock"
              label="Waktu"
              value={formatDuration(outcome.seconds)}
              tone="ice"
            />
            <StatTile
              icon="egg"
              label="Kehangatan telur"
              value={`+${outcome.eggWarmed}`}
              tone="leaf"
            />
          </div>
          {outcome.eggReady && (
            <p className="mt-4 rounded-2xl bg-amber-soft px-4 py-3 font-bold text-ink">
              Telurmu siap menetas!{" "}
              <Link href={paths.collection} className="underline">
                Buka koleksi
              </Link>
            </p>
          )}
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {outcome.passed && nextChapter ? (
              <Button href={paths.lesson(nextChapter.id, 0)} icon="play">
                Lanjut Chapter {nextChapter.id}
              </Button>
            ) : (
              <Button href={paths.lesson(chapter.id, 0)} icon="book">
                Baca ulang materi
              </Button>
            )}
            <Button variant="amber" icon="refresh" onClick={restart}>
              Ulangi latihan
            </Button>
            <Button href={paths.learn} variant="ghost" icon="map">
              Peta chapter
            </Button>
          </div>
        </Card>

        <Card className="mt-5">
          <Eyebrow>Pembahasan</Eyebrow>
          <ol className="mt-3 space-y-3">
            {questions.map((item, i) => {
              const answer = answers[i];
              const given =
                item.type === "mcq"
                  ? (item.options?.[Number(answer?.given)] ?? "—")
                  : (answer?.given ?? "—");
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-2xl bg-surface-2 p-3.5"
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${answer?.correct ? "bg-primary text-on-primary" : "bg-lava text-[#FFFBF0]"}`}
                  >
                    <Icon
                      name={answer?.correct ? "check" : "close"}
                      size={16}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink">
                      {i + 1}. {item.prompt}
                    </p>
                    <p className="mt-1 text-sm text-ink">
                      Jawabanmu:{" "}
                      <span className="font-mono font-bold">{given}</span>
                      {!answer?.correct && (
                        <>
                          {" "}
                          · Kunci:{" "}
                          <span className="font-mono font-bold">
                            {answer?.correctAnswerText}
                          </span>
                        </>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {item.explanation}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>
    );
  }

  const mood: TrixMood = locked
    ? locked.correct
      ? "happy"
      : "angry"
    : "thinking";
  const line = LINES[mood as "thinking" | "happy" | "angry"][index % 3];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={paths.lesson(chapter.id, 0)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl font-bold text-muted no-underline hover:text-ink"
        >
          <Icon name="left" size={18} />
          Keluar latihan
        </Link>
        <div className="flex items-center gap-2">
          <Chip icon="clock" className="text-sm tabular-nums">
            {formatDuration(seconds)}
          </Chip>
          <Chip tone="amber" className="text-sm tabular-nums">
            Soal {index + 1} dari {total}
          </Chip>
        </div>
      </div>

      <Eyebrow className="mt-4">
        Latihan · Chapter {chapter.id} · {chapter.zone}
      </Eyebrow>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink sm:text-4xl">
        {chapter.title}
      </h1>
      <div className="mt-4">
        <QuizProgress total={total} index={index} answers={answers} />
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="order-2 space-y-4 lg:order-1">
          <QuestionCard
            key={question.id}
            question={question}
            locked={locked}
            pending={checking}
            onSubmit={submit}
          />
          {error && (
            <p className="font-bold text-lava" role="alert">
              {error}
            </p>
          )}
          {locked && (
            <FeedbackBanner
              question={question}
              answer={locked}
              onNext={next}
              isLast={index + 1 === total}
            />
          )}
        </div>

        <aside className="order-1 lg:order-2">
          <div
            className={`flex items-center gap-3 rounded-3xl border-2 p-3 transition-colors lg:sticky lg:top-24 lg:flex-col lg:p-5 ${mood === "angry" ? "border-lava bg-lava-soft" : mood === "happy" ? "border-primary bg-leaf" : "border-line bg-surface"}`}
          >
            <Trixsaurus
              mood={mood}
              size={150}
              className="h-24 w-24 lg:h-40 lg:w-40"
            />
            <p
              key={`${index}-${mood}`}
              className="animate-pop min-w-0 flex-1 rounded-2xl rounded-bl-md bg-surface px-3.5 py-2.5 font-display font-semibold text-ink lg:flex-none lg:text-center"
              aria-live="polite"
            >
              {line}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
