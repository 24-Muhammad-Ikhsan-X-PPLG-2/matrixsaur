"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import { DinoArt, EggArt } from "@/components/art/DinoArt";
import { Trixsaurus } from "@/components/character/Trixsaurus";
import { Icon } from "@/components/ui/Icon";
import {
  Button,
  Card,
  Chip,
  Eyebrow,
  ProgressBar,
} from "@/components/ui/primitives";
import { hatchEggAction } from "@/lib/actions/collection";
import { getLevelInfo } from "@/lib/game/rules";
import { paths } from "@/lib/routes";
import type { Achievement, Dinosaur, DinosaurEgg } from "@/types";
import { cn } from "@/utils/cn";

/* ---------- Level & XP ---------- */
export function LevelBar({
  xp,
  className,
  compact = false,
  levelInfo,
}: {
  xp: number;
  className?: string;
  compact?: boolean;
  levelInfo?: ReturnType<typeof getLevelInfo>;
}) {
  const info = levelInfo ?? getLevelInfo(xp);
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber font-display text-xl font-bold text-[#2B2218]"
        aria-label={`Level ${info.level}`}
      >
        {info.level}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-display font-semibold text-ink">
            {info.title}
          </span>
          <span className="shrink-0 text-xs font-extrabold text-muted tabular-nums">
            {info.xpIntoLevel} / {info.xpForLevel} XP
          </span>
        </div>
        <ProgressBar
          value={info.xpIntoLevel}
          max={info.xpForLevel}
          tone="amber"
          label="XP menuju level berikutnya"
          className="mt-1.5"
          thick={!compact}
        />
      </div>
    </div>
  );
}

/* ---------- Konfeti ---------- */
const CONFETTI_COLORS = ["#F0A22E", "#D94E33", "#4FA36F", "#8FD0D6", "#F7EBC8"];

export function Confetti({ count = 18 }: { count?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const style = {
          left: "50%",
          top: "38%",
          background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          "--dx": `${Math.cos(angle) * (90 + (i % 4) * 30)}px`,
          "--dy": `${Math.sin(angle) * 90 + 110}px`,
          "--rot": `${(i % 2 ? 1 : -1) * 420}deg`,
          animationDelay: `${(i % 5) * 60}ms`,
        } as CSSProperties;
        return (
          <span
            key={i}
            className="animate-confetti absolute h-3 w-2 rounded-sm"
            style={style}
          />
        );
      })}
    </div>
  );
}

/* ---------- Modal penetasan ---------- */
function HatchModal({
  dinosaur,
  onClose,
}: {
  dinosaur: Dinosaur;
  onClose: () => void;
}) {
  const router = useRouter();
  const [taps, setTaps] = useState(0);
  const [hatched, setHatched] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const mainRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    mainRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const close = () => {
    onClose();
    if (hatched) router.refresh();
  };

  const tap = () => {
    if (hatched || pending) return;

    if (taps + 1 < 3) {
      setTaps(taps + 1);
      return;
    }

    setTaps(3);
    startTransition(async () => {
      const result = await hatchEggAction();
      if (result.ok && result.data.hatched) {
        setHatched(true);
        setError("");
        return;
      }

      setTaps(0);
      setError(
        result.ok
          ? "Telur belum siap menetas."
          : "Gagal menetaskan telur. Coba lagi.",
      );
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hatch-title"
    >
      <div className="animate-pop relative w-full max-w-md overflow-hidden rounded-[2rem] border border-line bg-surface p-6 text-center">
        {hatched && <Confetti />}
        <button
          type="button"
          onClick={close}
          aria-label="Tutup"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-ink"
        >
          <Icon name="close" size={18} />
        </button>

        {hatched ? (
          <>
            <Eyebrow>Telur menetas</Eyebrow>
            <h2
              id="hatch-title"
              className="mt-1 font-display text-3xl font-semibold text-ink"
            >
              Halo, {dinosaur.nickname}!
            </h2>
            <div className="mt-4 flex items-end justify-center gap-2">
              <DinoArt dino={dinosaur} size={170} className="animate-pop" />
              <Trixsaurus mood="celebrating" size={96} decorative />
            </div>
            <div className="mt-3 flex justify-center gap-2">
              <Chip tone="amber">{dinosaur.rarity}</Chip>
              <Chip tone="leaf">{dinosaur.name}</Chip>
            </div>
            <p className="mx-auto mt-3 max-w-xs text-sm text-muted">
              {dinosaur.description}
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <Link
                href={paths.collection}
                onClick={close}
                className="chunky inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-5 font-display font-semibold text-on-primary no-underline"
              >
                Lihat koleksi
              </Link>
              <Button variant="ghost" onClick={close}>
                Tutup
              </Button>
            </div>
          </>
        ) : (
          <>
            <Eyebrow>Telur siap menetas</Eyebrow>
            <h2
              id="hatch-title"
              className="mt-1 font-display text-3xl font-semibold text-ink"
            >
              Ketuk telurnya!
            </h2>
            <button
              ref={mainRef}
              type="button"
              onClick={tap}
              disabled={pending}
              aria-label={`Ketuk telur, ${3 - taps} ketukan lagi`}
              className="mx-auto mt-4 block rounded-[2rem] p-3 transition-transform active:scale-95 disabled:opacity-70"
            >
              <span key={taps} className="animate-shake block">
                <EggArt
                  progress={0}
                  taps={taps + 1}
                  size={150}
                  accent={dinosaur.accent}
                />
              </span>
            </button>
            <p className="mt-2 font-bold text-ink" aria-live="polite">
              {pending ? "Menetaskan..." : `${3 - taps} ketukan lagi`}
            </p>
            {error && (
              <p className="mt-2 text-sm font-bold text-lava" role="alert">
                {error}
              </p>
            )}
            <div className="mt-2 flex justify-center gap-2" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-2.5 w-8 rounded-full",
                    i < taps ? "bg-amber" : "bg-surface-2",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Kartu telur ---------- */
export function EggCard({
  egg,
  className,
  showHint = true,
}: {
  egg: DinosaurEgg | null;
  className?: string;
  showHint?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className={className}>
      <Eyebrow>Telur dinosaurus</Eyebrow>
      {egg ? (
        <div className="mt-2 flex items-center gap-4">
          <EggArt
            progress={egg.progress / egg.target}
            accent={egg.dinosaur.accent}
            size={96}
            wobble={egg.progress >= egg.target}
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-semibold text-ink">
              {egg.progress >= egg.target ? "Siap menetas!" : "Sedang dierami"}
            </p>
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
            {egg.progress >= egg.target ? (
              <Button
                className="mt-3"
                variant="amber"
                size="sm"
                icon="egg"
                onClick={() => setOpen(true)}
              >
                Tetaskan sekarang
              </Button>
            ) : (
              showHint && (
                <p className="mt-2 text-sm text-muted">
                  Selesaikan materi (+10) dan jawab soal dengan benar (+6) untuk
                  menghangatkannya.
                </p>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-4">
          <Trixsaurus mood="celebrating" size={88} decorative />
          <p className="font-bold text-ink">
            Semua dinosaurus sudah menetas. Kawananmu lengkap!
          </p>
        </div>
      )}
      {open && egg && (
        <HatchModal
          dinosaur={egg.dinosaur}
          onClose={() => setOpen(false)}
        />
      )}
    </Card>
  );
}

/* ---------- Lencana achievement ---------- */
export function AchievementBadge({
  achievement,
  unlocked,
}: {
  achievement: Achievement;
  unlocked: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border-2 p-3",
        unlocked
          ? "border-amber bg-amber-soft"
          : "border-dashed border-line bg-surface",
      )}
    >
      <span
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-full",
          unlocked ? "bg-amber text-[#2B2218]" : "bg-surface-2 text-muted",
        )}
      >
        <Icon name={unlocked ? achievement.icon : "lock"} size={22} />
      </span>
      <span className="min-w-0">
        <span className="block font-display font-semibold leading-tight text-ink">
          {achievement.title}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-muted">
          {achievement.description}
        </span>
        <span className="sr-only">
          {unlocked ? "Sudah terbuka" : "Belum terbuka"}
        </span>
      </span>
    </div>
  );
}
