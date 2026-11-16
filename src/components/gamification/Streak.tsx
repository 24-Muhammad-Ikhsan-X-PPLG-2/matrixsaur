import { Card, Chip, Eyebrow } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { RULES } from "@/lib/game/rules";
import type { StreakVisual as StreakVisualKind } from "@/types";
import { cn } from "@/utils/cn";

const CYCLE = RULES.streakCycle;

/** Fosil yang perlahan dibersihkan kuas arkeologi. `cleaned` = 0–7 bagian yang sudah bersih. */
function FossilVisual({ cleaned }: { cleaned: number }) {
  const strip = 280 / CYCLE;
  return (
    <svg viewBox="0 0 280 150" className="h-auto w-full" role="img" aria-label={`Fosil dinosaurus, ${cleaned} dari ${CYCLE} bagian sudah dibersihkan`}>
      <clipPath id="streak-clip-fossil">
        <rect width="280" height="150" rx="18" />
      </clipPath>
      <g clipPath="url(#streak-clip-fossil)">
      <rect width="280" height="150" fill="#6B4A2B" />
      <path d="M0 104 Q70 92 140 106 T280 100 V150 H0 Z" fill="#5A3D22" />
      {/* Kerangka */}
      <g fill="none" stroke="#F6E9C8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M34 96 C70 60 150 52 214 66" strokeWidth="6" />
        <path d="M34 96 L14 108" strokeWidth="5" />
        <g strokeWidth="4">
          <path d="M92 66 C88 86 92 100 100 108" />
          <path d="M112 61 C108 84 112 100 120 110" />
          <path d="M132 58 C130 82 134 98 142 108" />
          <path d="M152 58 C152 80 156 94 164 102" />
          <path d="M172 60 C174 78 178 88 186 94" />
        </g>
        <path d="M80 72 L70 112 L84 128 M70 112 L58 124" strokeWidth="5" />
        <path d="M186 66 L196 104 L186 124 M196 104 L210 118" strokeWidth="5" />
      </g>
      <g fill="#F6E9C8">
        <path d="M210 52 C226 40 256 44 262 62 C264 72 252 80 236 80 L214 78 C206 72 204 60 210 52 Z" />
        {[48, 64, 80, 100, 122, 144, 166, 188].map((x, i) => (
          <circle key={x} cx={x} cy={88 - Math.sin((i / 7) * Math.PI) * 26 + (i < 2 ? 2 : 0)} r="4.5" />
        ))}
      </g>
      <circle cx="240" cy="58" r="6" fill="#6B4A2B" />
      <path d="M232 80 l3 -7 l3 7 l3 -7 l3 7 l3 -7 l3 7" fill="none" stroke="#6B4A2B" strokeWidth="2.5" />

      {/* Tanah penutup: satu jalur per hari */}
      {Array.from({ length: CYCLE }, (_, i) => (
        <g key={i} style={{ opacity: i < cleaned ? 0 : 1, transition: "opacity 0.9s ease" }}>
          <rect x={i * strip - 0.5} y="0" width={strip + 1} height="150" fill="#8A6238" />
          <circle cx={i * strip + 12} cy={30 + ((i * 37) % 80)} r="5" fill="#74502C" />
          <circle cx={i * strip + 28} cy={70 + ((i * 23) % 60)} r="3.5" fill="#A57A4B" />
          <path d={`M${i * strip + 6} ${118 - ((i * 13) % 30)} q8 -6 16 0`} fill="none" stroke="#74502C" strokeWidth="3" strokeLinecap="round" />
        </g>
      ))}
      </g>
      <rect x="2" y="2" width="276" height="146" rx="16" fill="none" stroke="#4A321B" strokeWidth="4" />

      {/* Kuas arkeologi di batas area yang sudah bersih */}
      {cleaned > 0 && cleaned < CYCLE && (
        <g transform={`translate(${cleaned * strip - 6} 40)`}>
          <g className="animate-brush" style={{ transformOrigin: "10px 40px" }}>
            <rect x="6" y="-22" width="8" height="40" rx="4" fill="#D94E33" />
            <rect x="3" y="16" width="14" height="8" rx="2" fill="#C9C2B2" />
            <path d="M3 24 H17 L20 44 H0 Z" fill="#F0A22E" />
          </g>
        </g>
      )}
    </svg>
  );
}

/** Mammoth yang membeku dan perlahan mencair. */
function MammothVisual({ cleaned }: { cleaned: number }) {
  const ice = 1 - cleaned / CYCLE;
  return (
    <svg viewBox="0 0 280 150" className="h-auto w-full" role="img" aria-label={`Mammoth dalam es, ${Math.round((1 - ice) * 100)} persen sudah mencair`}>
      <clipPath id="streak-clip-mammoth">
        <rect width="280" height="150" rx="18" />
      </clipPath>
      <g clipPath="url(#streak-clip-mammoth)">
      <rect width="280" height="150" fill="#D8F0F1" />
      <path d="M0 122 Q70 112 140 124 T280 118 V150 H0 Z" fill="#FFFFFF" />
      {/* Mammoth */}
      <rect x="126" y="92" width="20" height="40" rx="9" fill="#6E4428" />
      <rect x="176" y="92" width="20" height="40" rx="9" fill="#6E4428" />
      <ellipse cx="160" cy="80" rx="58" ry="40" fill="#8A5A3B" />
      <path d="M118 46 q10 -14 22 -4 q10 -12 22 -2 q12 -10 22 2 q10 -4 16 8 L196 62 H120 Z" fill="#6E4428" />
      <circle cx="104" cy="70" r="33" fill="#8A5A3B" />
      <path d="M82 40 q10 -14 22 -4 q10 -10 20 0 L120 50 H86 Z" fill="#6E4428" />
      <ellipse cx="124" cy="72" rx="10" ry="15" fill="#6E4428" />
      <path d="M90 92 C82 116 88 134 104 132" fill="none" stroke="#8A5A3B" strokeWidth="14" strokeLinecap="round" />
      <path d="M100 92 C92 116 66 122 58 100" fill="none" stroke="#FFF6DC" strokeWidth="7" strokeLinecap="round" />
      <circle cx="94" cy="66" r="4.5" fill="#2B2218" />
      <circle cx="95.5" cy="64.5" r="1.5" fill="#FFFFFF" />
      {cleaned >= CYCLE && <path d="M84 80 q6 6 12 0" fill="none" stroke="#2B2218" strokeWidth="2.5" strokeLinecap="round" />}

      {/* Balok es */}
      <g style={{ opacity: ice, transition: "opacity 0.9s ease" }}>
        <rect x="22" y="12" width="236" height="126" rx="22" fill="#8FD0D6" />
        <rect x="22" y="12" width="236" height="126" rx="22" fill="none" stroke="#FFFFFF" strokeWidth="4" opacity="0.8" />
        <path d="M44 32 L96 24 M40 48 L62 44 M204 124 L240 116" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
        <path d="M150 12 L162 46 L146 70 L168 100" fill="none" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.7" />
      </g>
      {cleaned > 0 && cleaned < CYCLE && (
        <g fill="#5DB7C0">
          <path d="M70 138 q-4 8 0 11 q4 -3 0 -11 Z" className="animate-drip" />
          <path d="M210 138 q-4 8 0 11 q4 -3 0 -11 Z" className="animate-drip" style={{ animationDelay: "0.7s" }} />
        </g>
      )}
      </g>
      <rect x="2" y="2" width="276" height="146" rx="16" fill="none" stroke="#5DB7C0" strokeWidth="4" />
    </svg>
  );
}

export function StreakVisual({ variant, current }: { variant: StreakVisualKind; current: number }) {
  const cleaned = Math.min(current, CYCLE);
  return variant === "fossil" ? <FossilVisual cleaned={cleaned} /> : <MammothVisual cleaned={cleaned} />;
}

/** Kartu streak lengkap: visual, pilihan tampilan, dan ringkasan hari ini. */
export function StreakCard({
  current,
  longest,
  activeToday,
  variant,
  onVariantChange,
  className,
}: {
  current: number;
  longest: number;
  activeToday: boolean;
  variant: StreakVisualKind;
  onVariantChange?: (variant: StreakVisualKind) => void;
  className?: string;
}) {
  const cleaned = Math.min(current, CYCLE);
  const message =
    current === 0
      ? variant === "fossil"
        ? "Fosil tertutup tanah lagi. Belajar hari ini untuk mulai menggali."
        : "Mammoth membeku lagi. Belajar hari ini untuk mulai mencairkan es."
      : cleaned >= CYCLE
        ? variant === "fossil"
          ? "Fosil utuh! Kerja keras seminggu terbayar."
          : "Es mencair seluruhnya! Mammoth bebas."
        : variant === "fossil"
          ? `${CYCLE - cleaned} hari lagi sampai fosil bersih seluruhnya.`
          : `${CYCLE - cleaned} hari lagi sampai es mencair seluruhnya.`;

  return (
    <Card className={className}>
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
            <span className="tabular-nums">{current}</span>
            <span className="text-base text-muted">hari</span>
          </p>
        </div>
        <div
          className="flex rounded-2xl bg-surface-2 p-1"
          role="group"
          aria-label="Pilih visual streak"
        >
          {(["fossil", "mammoth"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={variant === kind}
              onClick={() => onVariantChange?.(kind)}
              className={cn(
                "flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-bold transition-colors",
                variant === kind
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted",
              )}
            >
              <Icon name={kind === "fossil" ? "brush" : "snow"} size={16} />
              {kind === "fossil" ? "Fosil" : "Mammoth"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[18px]">
        <StreakVisual variant={variant} current={current} />
      </div>

      <div className="mt-3 flex items-center gap-1.5" aria-hidden>
        {Array.from({ length: CYCLE }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors duration-500",
              i < cleaned
                ? variant === "fossil"
                  ? "bg-amber"
                  : "bg-ice"
                : "bg-surface-2",
            )}
          />
        ))}
      </div>
      <p className="mt-3 text-sm font-bold text-ink">{message}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Chip tone="amber" icon="crown">
          Terpanjang {longest} hari
        </Chip>
        <Chip
          tone={activeToday ? "leaf" : "plain"}
          icon={activeToday ? "check" : "clock"}
        >
          {activeToday ? "Hari ini sudah belajar" : "Hari ini belum belajar"}
        </Chip>
      </div>
    </Card>
  );
}
