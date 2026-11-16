"use client";

import { useEffect, useRef, useState } from "react";
import { DinoArt } from "@/components/art/DinoArt";
import { EggCard } from "@/components/gamification/Widgets";
import { Icon } from "@/components/ui/Icon";
import {
  Card,
  Chip,
  Eyebrow,
  ProgressBar,
} from "@/components/ui/primitives";
import type { CollectionPageData } from "@/lib/data/types";
import type { Dinosaur, DinoRarity } from "@/types";
import { cn } from "@/utils/cn";

const RARITY_TONE: Record<DinoRarity, "leaf" | "ice" | "amber"> = {
  Umum: "leaf",
  Langka: "ice",
  Legendaris: "amber",
};

type DinoState = "owned" | "incubating" | "locked";

export function Collection({ data }: { data: CollectionPageData }) {
  const { dinosaurs, ownedIds, egg } = data;
  const [selected, setSelected] = useState<Dinosaur | null>(null);

  const stateOf = (dino: Dinosaur): DinoState =>
    ownedIds.includes(dino.id)
      ? "owned"
      : egg?.dinosaur.id === dino.id
        ? "incubating"
        : "locked";

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Kandang penjelajah</Eyebrow>
          <h1 className="mt-1 font-display text-4xl font-bold text-ink sm:text-5xl">
            Koleksi dinosaurus
          </h1>
          <p className="mt-2 max-w-xl text-muted">
            Setiap telur yang menetas menambah satu anggota kawanan. Ketuk kartu
            untuk melihat detailnya.
          </p>
        </div>
        <div className="w-full max-w-xs">
          <div className="flex items-baseline justify-between">
            <span className="font-bold text-muted">Terkumpul</span>
            <span className="font-display text-2xl font-semibold text-ink tabular-nums">
              {ownedIds.length}/{dinosaurs.length}
            </span>
          </div>
          <ProgressBar
            value={ownedIds.length}
            max={dinosaurs.length}
            label="Dinosaurus terkumpul"
            className="mt-1.5"
            thick
          />
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="space-y-4">
          <EggCard egg={egg} />
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {dinosaurs.map((dino, i) => {
            const kind = stateOf(dino);
            const isOwned = kind === "owned";
            return (
              <li key={dino.id}>
                <button
                  type="button"
                  onClick={() => setSelected(dino)}
                  aria-label={
                    isOwned
                      ? `${dino.nickname}, ${dino.name}, ${dino.rarity}. Lihat detail`
                      : `Dinosaurus ke-${i + 1}, ${kind === "incubating" ? "sedang dierami" : "terkunci"}. Lihat petunjuk`
                  }
                  className={cn(
                    "card-shadow flex h-full w-full flex-col items-center rounded-3xl border-2 p-3 text-center transition-transform hover:-translate-y-1",
                    isOwned
                      ? "border-line bg-surface"
                      : kind === "incubating"
                        ? "border-amber bg-amber-soft"
                        : "border-dashed border-line bg-surface-2",
                  )}
                >
                  <span className="grid h-24 w-full place-items-center">
                    <DinoArt dino={dino} size={104} locked={!isOwned} />
                  </span>
                  <span className="mt-2 font-display text-lg font-semibold leading-tight text-ink">
                    {isOwned ? dino.nickname : "???"}
                  </span>
                  <span className="text-xs font-bold text-muted">
                    {isOwned
                      ? dino.name
                      : kind === "incubating"
                        ? "Sedang dierami"
                        : `Telur ke-${i - 1}`}
                  </span>
                  <Chip
                    tone={isOwned ? RARITY_TONE[dino.rarity] : "plain"}
                    icon={
                      isOwned
                        ? undefined
                        : kind === "incubating"
                          ? "egg"
                          : "lock"
                    }
                    className={cn("mt-2", !isOwned && "bg-surface")}
                  >
                    {isOwned
                      ? dino.rarity
                      : kind === "incubating"
                        ? "Segera"
                        : "Terkunci"}
                  </Chip>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <Card>
        <Eyebrow>Cara menetaskan telur</Eyebrow>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: "book" as const,
              title: "Baca materi",
              body: "Setiap materi selesai memberi +10 kehangatan.",
            },
            {
              icon: "target" as const,
              title: "Jawab benar",
              body: "Setiap jawaban benar di latihan memberi +6 kehangatan.",
            },
            {
              icon: "egg" as const,
              title: "Ketuk telurnya",
              body: "Saat kehangatan penuh, ketuk telur tiga kali sampai menetas.",
            },
          ].map((step, i) => (
            <li
              key={step.title}
              className="flex items-start gap-3 rounded-2xl bg-surface-2 p-4"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber text-[#2B2218]">
                <Icon name={step.icon} size={20} />
              </span>
              <span>
                <span className="block font-display font-semibold text-ink">
                  {i + 1}. {step.title}
                </span>
                <span className="block text-sm text-muted">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </Card>

      {selected && (
        <DinoDialog
          dino={selected}
          kind={stateOf(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function DinoDialog({
  dino,
  kind,
  onClose,
}: {
  dino: Dinosaur;
  kind: DinoState;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOwned = kind === "owned";

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/65 p-0 sm:place-items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dino-title"
      onClick={onClose}
    >
      <div
        className="animate-rise w-full max-w-md rounded-t-[2rem] border border-line bg-surface p-6 sm:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow>
              {isOwned
                ? dino.era
                : kind === "incubating"
                  ? "Sedang dierami"
                  : "Belum terbuka"}
            </Eyebrow>
            <h2
              id="dino-title"
              className="mt-1 font-display text-3xl font-semibold text-ink"
            >
              {isOwned ? dino.nickname : "Dinosaurus misterius"}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Tutup detail"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="strata mt-4 grid place-items-center rounded-3xl border border-line bg-bg py-6">
          <DinoArt
            dino={dino}
            size={200}
            locked={!isOwned}
            className={isOwned ? "animate-bob" : undefined}
          />
        </div>

        {isOwned ? (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip tone={RARITY_TONE[dino.rarity]} icon="star">
                {dino.rarity}
              </Chip>
              <Chip>{dino.name}</Chip>
              <Chip icon="clock">{dino.era}</Chip>
            </div>
            <p className="mt-3 leading-relaxed text-ink">{dino.description}</p>
            <p className="mt-3 rounded-2xl bg-leaf px-4 py-3 font-bold text-ink">
              <span className="block text-xs font-extrabold uppercase tracking-widest text-muted">
                Kekuatan matriks
              </span>
              {dino.matrixPower}
            </p>
          </>
        ) : (
          <p className="mt-4 leading-relaxed text-ink">
            {kind === "incubating"
              ? "Dinosaurus ini ada di dalam telur yang sedang kamu erami. Penuhi kehangatan telur, lalu tetaskan untuk berkenalan."
              : "Tetaskan telur-telur sebelumnya terlebih dahulu. Setiap telur yang menetas memunculkan telur baru."}
          </p>
        )}
      </div>
    </div>
  );
}
