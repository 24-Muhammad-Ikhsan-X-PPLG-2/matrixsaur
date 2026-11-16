"use client";
import { useState } from "react";
import { EggArt } from "@/components/art/DinoArt";
import { Trixsaurus, type TrixMood } from "@/components/character/Trixsaurus";
import { StreakVisual } from "@/components/gamification/Streak";
import { Logo } from "@/components/layout/AppShell";
import { MatrixVisualizer } from "@/components/matrix/MatrixVisualizer";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Button, Chip, Eyebrow } from "@/components/ui/primitives";
import type { LandingChapter } from "@/lib/data/landing";
import { cn } from "@/utils/cn";

const MOODS: { mood: TrixMood; label: string; line: string }[] = [
  {
    mood: "idle",
    label: "Santai",
    line: "Aku menunggumu di markas. Mau belajar apa hari ini?",
  },
  {
    mood: "happy",
    label: "Senang",
    line: "Jawabanmu benar! Elemen seletaknya pas semua.",
  },
  {
    mood: "thinking",
    label: "Berpikir",
    line: "Hmm… baris dikali kolom. Yang mana dulu, ya?",
  },
  {
    mood: "sad",
    label: "Sedih",
    line: "Streak kita terputus. Yuk mulai menggali lagi.",
  },
  {
    mood: "angry",
    label: "Marah",
    line: "RAWR! Jawabannya belum tepat. Coba periksa tandanya!",
  },
  {
    mood: "celebrating",
    label: "Merayakan",
    line: "Chapter selesai! Telurmu makin hangat.",
  },
];

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "book",
    title: "12 chapter berurutan",
    body: "Dari pengertian matriks sampai invers ordo 3 × 3, lengkap dengan rumus dan contoh langkah demi langkah.",
  },
  {
    icon: "target",
    title: "Latihan dengan umpan balik",
    body: "Soal pilihan ganda dan isian angka. Setiap jawaban langsung dijelaskan, benar ataupun salah.",
  },
  {
    icon: "egg",
    title: "Telur yang menetas",
    body: "Setiap materi dan jawaban benar menghangatkan telurmu sampai seekor bayi dinosaurus lahir.",
  },
  {
    icon: "brush",
    title: "Streak yang terlihat",
    body: "Belajar tiap hari membersihkan fosil sedikit demi sedikit — atau mencairkan mammoth yang membeku.",
  },
];

export function Landing({ chapters }: { chapters: LandingChapter[] }) {
  const [mood, setMood] = useState<TrixMood>("happy");
  const active = MOODS.find((m) => m.mood === mood)!;

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo to="/login" />

        <Button href="/login" size="sm" variant="ghost" iconRight="right">
          Masuk
        </Button>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-36 pt-6 sm:px-6 md:grid-cols-[1.05fr_1fr] md:pb-44 md:pt-12">
            <div className="animate-rise relative z-10">
              <Chip tone="amber" icon="footprint">
                Petualangan belajar matriks
              </Chip>
              <h1 className="mt-4 font-display text-[2.6rem] font-bold leading-[1.02] text-ink sm:text-6xl lg:text-7xl">
                Jinakkan matriks bersama{" "}
                <span className="text-primary">Trixsaurus</span>.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted">
                MATRIXSAUR mengajakmu belajar matriks dari nol sampai mahir:
                baca materinya, mainkan visualisasinya, jawab soalnya, lalu
                tetaskan dinosaurusmu.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button href={"/register"} size="lg" icon="play">
                  Mulai belajar
                </Button>
                <Button href={"/login"} size="lg" variant="ghost" icon="map">
                  Lihat peta chapter
                </Button>
              </div>
              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-extrabold text-ink">
                <li className="flex items-center gap-1.5">
                  <Icon name="book" size={16} className="text-primary" />{" "}
                  {chapters.length} chapter
                </li>
                <li className="flex items-center gap-1.5">
                  <Icon name="target" size={16} className="text-primary" /> 60
                  soal latihan
                </li>
                <li className="flex items-center gap-1.5">
                  <Icon name="egg" size={16} className="text-primary" /> 8
                  dinosaurus
                </li>
              </ul>
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-md items-end justify-center">
              <div className="animate-pop absolute left-0 top-0 rounded-3xl rounded-bl-md border border-line bg-surface px-4 py-3 font-display font-semibold text-ink shadow-lg sm:left-2">
                Baris dulu, baru kolom!
              </div>
              <Trixsaurus
                mood="happy"
                size={300}
                className="mt-14 h-auto max-w-[78%]"
              />
              <EggArt progress={0.7} size={84} wobble className="-ml-6 mb-2" />
            </div>
          </div>

          {/* Lanskap prasejarah */}
          <svg
            viewBox="0 0 1440 260"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-0 h-40 w-full md:h-56"
            aria-hidden
          >
            <path
              d="M980 260 L1120 70 L1150 96 L1176 64 L1330 260 Z"
              fill="var(--c-surface-2)"
            />
            <path
              d="M1108 86 L1120 70 L1150 96 L1176 64 L1190 82 L1164 110 L1146 96 L1128 112 Z"
              fill="var(--c-lava)"
              opacity="0.85"
            />
            <path
              d="M0 190 C220 110 420 210 660 160 C900 110 1160 200 1440 140 V260 H0 Z"
              fill="var(--c-leaf)"
            />
            <path
              d="M0 230 C260 170 520 250 820 205 C1080 168 1260 232 1440 200 V260 H0 Z"
              fill="var(--c-primary)"
              opacity="0.9"
            />
          </svg>
        </section>

        {/* Fitur */}
        <section className="bg-primary px-4 pb-16 pt-6 text-on-primary sm:px-6">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em]">
              Cara belajar di MATRIXSAUR
            </p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
              Belajar terasa seperti menjelajah, bukan menghafal.
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <li
                  key={feature.title}
                  className="rounded-3xl bg-surface p-5 text-ink"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber text-[#2B2218]">
                    <Icon name={feature.icon} size={24} />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted">{feature.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Visualisasi */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <Eyebrow>Coba sekarang</Eyebrow>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
                Lihat baris bertemu kolom.
              </h2>
              <p className="mt-4 text-muted">
                Setiap chapter punya visualisasi yang bisa dimainkan. Ganti
                angkanya, putar animasinya, dan ikuti perhitungannya satu
                langkah demi satu langkah.
              </p>
              <ul className="mt-5 space-y-2.5 font-bold text-ink">
                {[
                  "Angka matriks bisa diubah sesukamu",
                  "Elemen yang sedang dihitung disorot",
                  "Hasil muncul bersama cara menghitungnya",
                ].map((text) => (                  <li key={text} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf text-ink">
                      <Icon name="check" size={14} />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <MatrixVisualizer operation="multiply" />
          </div>
        </section>

        {/* Trixsaurus */}
        <section className="strata border-y border-line px-4 py-16 sm:px-6">
          <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-8 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <Eyebrow>Kenalan dengan Trixsaurus</Eyebrow>
              <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
                Teman belajar yang ikut merasakan jawabanmu.
              </h2>
              <p className="mt-4 text-muted">
                Ia bersorak saat kamu benar dan meraung saat kamu salah. Suara
                raungannya bisa dimatikan kapan saja.
              </p>
              <div
                className="mt-6 flex flex-wrap gap-2"
                role="group"
                aria-label="Pilih suasana hati Trixsaurus"
              >
                {MOODS.map((m) => (
                  <button
                    key={m.mood}
                    type="button"
                    aria-pressed={mood === m.mood}
                    onClick={() => setMood(m.mood)}
                    className={cn(
                      "min-h-11 rounded-2xl border-2 px-4 font-display font-semibold transition-colors",
                      mood === m.mood
                        ? "border-primary bg-primary text-on-primary"
                        : "border-line bg-surface text-ink hover:border-primary",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="order-1 flex flex-col items-center md:order-2">
              <p
                key={mood}
                className="animate-pop max-w-xs rounded-3xl rounded-bl-md border border-line bg-surface px-5 py-3 text-center font-display text-lg font-semibold text-ink"
                aria-live="polite"
              >
                {active.line}
              </p>
              <Trixsaurus mood={mood} size={240} className="mt-2" />
            </div>
          </div>
        </section>

        {/* Gamifikasi */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Eyebrow>Konsisten itu kelihatan</Eyebrow>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold text-ink sm:text-4xl">
            Tujuh hari belajar, satu fosil utuh.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <figure className="rounded-3xl border border-line bg-surface p-4">
              <StreakVisual variant="fossil" current={4} />
              <figcaption className="mt-3 px-1 font-bold text-ink">
                Kuas arkeologi membersihkan satu bagian fosil setiap hari kamu
                belajar.
              </figcaption>
            </figure>
            <figure className="rounded-3xl border border-line bg-surface p-4">
              <StreakVisual variant="mammoth" current={4} />
              <figcaption className="mt-3 px-1 font-bold text-ink">
                Atau pilih mammoth beku yang perlahan mencair. Kalau streak
                putus, ia membeku lagi.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Peta chapter */}
        <section className="bg-surface-2 px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <Eyebrow>Peta petualangan</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
              12 wilayah, dari Lembah Telur sampai Puncak Rex.            </h2>
            <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {chapters.map((chapter) => (
                <li
                  key={chapter.id}
                  className="flex items-center gap-3 rounded-2xl bg-surface p-3.5"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-leaf font-display text-lg font-bold text-ink tabular-nums">
                    {chapter.id}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display font-semibold text-ink">
                      {chapter.title}
                    </span>
                    <span className="block text-sm text-muted">
                      {chapter.zone} · {chapter.difficulty}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA akhir */}
        <section className="px-4 py-20 text-center sm:px-6">
          <Trixsaurus
            mood="celebrating"
            size={150}
            className="mx-auto"
            decorative
          />
          <h2 className="mx-auto mt-4 max-w-xl font-display text-4xl font-semibold text-ink sm:text-5xl">
            Telurmu sudah menunggu.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            Mulai dari Chapter 1 dan bangun kawanan dinosaurusmu sambil
            menguasai matriks.
          </p>
          <Button
            href="/register"
            size="lg"
            icon="play"
            className="mt-7"
          >
            Mulai petualangan
          </Button>
        </section>
      </main>

      <footer className="border-t border-line px-4 py-6 text-center text-sm font-bold text-muted">
        MATRIXSAUR · belajar matriks bersama Trixsaurus
      </footer>
    </div>
  );
}
