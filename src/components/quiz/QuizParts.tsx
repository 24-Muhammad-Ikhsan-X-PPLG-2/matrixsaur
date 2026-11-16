import { useId, useState, type FormEvent } from "react";
import { MathRow } from "@/components/matrix/MatrixGrid";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/primitives";
import type { QuizAnswer, QuizQuestion } from "@/types";
import { cn } from "@/utils/cn";

/** Mengubah masukan teks menjadi angka. Menerima koma desimal dan tanda minus tipografis. */
export function parseNumeric(raw: string): number | null {
  const cleaned = raw.trim().replace(/−/g, "-").replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}

/* ---------- Progres soal ---------- */
export function QuizProgress({
  total,
  index,
  answers,
}: {
  total: number;
  index: number;
  answers: QuizAnswer[];
}) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="img"
      aria-label={`Soal ${Math.min(index + 1, total)} dari ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const answer = answers[i];
        return (
          <span
            key={i}
            className={cn(
              "h-3 flex-1 rounded-full transition-colors duration-300",
              answer
                ? answer.correct
                  ? "bg-primary"
                  : "bg-lava"
                : i === index
                  ? "bg-amber"
                  : "bg-surface-2",
            )}
          />
        );
      })}
    </div>
  );
}

/* ---------- Kartu soal ---------- */
interface QuestionCardProps {
  question: QuizQuestion;
  /** Jawaban yang sudah dikunci; null selama masih menjawab. */
  locked: QuizAnswer | null;
  /** true selama jawaban sedang diperiksa server. */
  pending?: boolean;
  onSubmit: (given: string) => void;
}

const LETTERS = ["A", "B", "C", "D", "E"];

export function QuestionCard({
  question,
  locked,
  pending = false,
  onSubmit,
}: QuestionCardProps) {
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const errorId = useId();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (locked || pending) return;
    if (question.type === "mcq") {
      if (choice !== null) onSubmit(String(choice));
      return;
    }
    if (parseNumeric(text) === null) {
      setError("Masukkan satu angka, misalnya 12 atau −3.");
      return;
    }
    onSubmit(String(parseNumeric(text)));
  };

  const canSubmit =
    question.type === "mcq" ? choice !== null : text.trim() !== "";

  return (
    <form
      onSubmit={submit}
      className="card-shadow rounded-3xl border border-line bg-surface p-5 sm:p-7"
    >
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
        {question.type === "mcq" ? "Pilihan ganda" : "Isian angka"}
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
        {question.prompt}
      </h2>
      {question.math && (
        <div className="mt-4 rounded-2xl border border-line bg-bg p-4">
          <MathRow parts={question.math} size="md" />
        </div>
      )}

      {question.type === "mcq" ? (
        <fieldset className="mt-5" disabled={!!locked || pending}>
          <legend className="sr-only">Pilih satu jawaban</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {question.options?.map((option, i) => {
              const selected = (locked ? Number(locked.given) : choice) === i;
              const isAnswer = locked?.correctOptionIndex === i;
              return (
                <label
                  key={i}
                  className={cn(
                    "flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-amber",
                    !locked &&
                      (selected
                        ? "border-primary bg-leaf"
                        : "border-line bg-surface hover:border-primary"),
                    locked && isAnswer && "border-primary bg-leaf",
                    locked &&
                      selected &&
                      !isAnswer &&
                      "border-lava bg-lava-soft",
                    locked &&
                      !selected &&
                      !isAnswer &&
                      "border-line bg-surface opacity-60",
                    locked && "cursor-default",
                  )}
                >
                  <input
                    type="radio"
                    name={question.id}
                    className="sr-only"
                    checked={selected}
                    onChange={() => setChoice(i)}
                  />
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-sm font-bold",
                      selected || (locked && isAnswer)
                        ? "bg-primary text-on-primary"
                        : "bg-surface-2 text-ink",
                    )}
                  >
                    {locked && isAnswer ? (
                      <Icon name="check" size={16} />
                    ) : locked && selected ? (
                      <Icon name="close" size={16} />
                    ) : (
                      LETTERS[i]
                    )}
                  </span>
                  <span className="font-mono text-base font-bold text-ink">
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <div className="mt-5">
          <label htmlFor={inputId} className="block font-bold text-ink">
            Jawabanmu
          </label>
          <input
            id={inputId}
            type="text"
            inputMode="text"
            autoComplete="off"
            placeholder="Ketik angka"
            value={locked ? locked.given : text}
            disabled={!!locked || pending}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            className={cn(
              "mt-2 h-16 w-full max-w-xs rounded-2xl border-2 bg-bg px-5 font-mono text-3xl font-bold text-ink outline-none placeholder:text-xl placeholder:font-semibold placeholder:text-muted focus-visible:border-primary",
              error
                ? "border-lava"
                : locked
                  ? locked.correct
                    ? "border-primary bg-leaf"
                    : "border-lava bg-lava-soft"
                  : "border-line",
            )}
          />
          {error && (
            <p
              id={errorId}
              className="mt-2 flex items-center gap-1.5 font-bold text-ink"
              role="alert"
            >
              <Icon name="close" size={16} className="text-lava" />
              {error}
            </p>
          )}
        </div>
      )}

      {!locked && (
        <Button
          type="submit"
          size="lg"
          className="mt-6"
          block
          disabled={!canSubmit || pending}
          icon="check"
        >
          {pending ? "Memeriksa..." : "Periksa jawaban"}
        </Button>
      )}
    </form>
  );
}

/* ---------- Umpan balik ---------- */
export function FeedbackBanner({
  question,
  answer,
  onNext,
  isLast,
}: {
  question: QuizQuestion;
  answer: QuizAnswer;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <div
      className={cn(
        "animate-rise rounded-3xl border-2 p-5",
        answer.correct ? "border-primary bg-leaf" : "border-lava bg-lava-soft",
      )}
      role="status"
    >
      <p className="flex items-center gap-2 font-display text-2xl font-semibold text-ink">
        <span
          className={cn(
            "grid h-9 w-9 place-items-center rounded-full",
            answer.correct
              ? "bg-primary text-on-primary"
              : "bg-lava text-[#FFFBF0]",
          )}
        >
          <Icon name={answer.correct ? "check" : "close"} size={20} />
        </span>
        {answer.correct ? "Benar!" : "Belum tepat"}
      </p>
      {!answer.correct && (
        <p className="mt-2 font-bold text-ink">
          Jawaban yang benar:{" "}
          <span className="font-mono">{answer.correctAnswerText}</span>
        </p>
      )}
      <p className="mt-2 leading-relaxed text-ink">{question.explanation}</p>
      <Button
        autoFocus
        onClick={onNext}
        size="lg"
        className="mt-4"
        iconRight="right"
        variant={answer.correct ? "primary" : "amber"}
      >
        {isLast ? "Lihat hasil" : "Soal berikutnya"}
      </Button>
    </div>
  );
}
