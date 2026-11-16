import type { Dinosaur } from "@/types";
import { cn } from "@/utils/cn";

interface DinoArtProps {
  dino: Dinosaur;
  size?: number;
  /** Tampilkan sebagai siluet (belum terbuka). */
  locked?: boolean;
  className?: string;
}

const INK = "#2B2218";
const CREAM = "#FFF6DC";

/** Ilustrasi placeholder bayi dinosaurus. Satu kerangka tubuh, ciri khas berbeda per spesies. */
export function DinoArt({ dino, size = 120, locked = false, className }: DinoArtProps) {
  const s = dino.species;
  const c = locked ? "var(--c-line)" : dino.color;
  const a = locked ? "var(--c-line)" : dino.accent;
  const head = s === "bronto" ? { x: 98, y: 22, r: 11 } : s === "rex" ? { x: 86, y: 40, r: 19 } : s === "ptero" ? { x: 88, y: 38, r: 13 } : { x: 88, y: 44, r: 16 };
  const { x: hx, y: hy, r } = head;

  return (
    <svg
      viewBox="0 0 124 100"
      width={size}
      height={(size * 100) / 124}
      className={cn("shrink-0 overflow-visible", className)}
      role="img"
      aria-label={locked ? "Dinosaurus belum terbuka" : `${dino.nickname} si ${dino.name}`}
    >
      <ellipse cx="58" cy="93" rx="40" ry="5" fill={INK} opacity={locked ? 0.05 : 0.12} />

      {/* Ciri di belakang tubuh */}
      {s === "trice" && <circle cx={hx - 8} cy={hy - 2} r={r + 6} fill={a} />}
      {s === "spino" && <path d="M28 54 Q55 2 82 52 Z" fill={a} />}
      {s === "stego" && [34, 46, 58, 70].map((x, i) => <path key={x} d={`M${x} 48 l7 ${-15 - (i % 2) * 4} l7 ${15 + (i % 2) * 4} Z`} fill={a} />)}
      {s === "ptero" && <path d="M52 58 L18 20 L46 28 L68 52 Z" fill={a} />}
      {s === "ankylo" && <circle cx="7" cy="77" r="8" fill={a} />}

      {/* Ekor, kaki, badan */}
      <path d="M34 58 C16 56 9 68 4 78 C16 77 27 77 38 72 Z" fill={c} />
      <rect x="42" y="72" width="11" height="19" rx="5.5" fill={c} />
      <rect x="62" y="72" width="11" height="19" rx="5.5" fill={c} />
      <ellipse cx="55" cy="62" rx="28" ry="20" fill={c} />
      {!locked && <ellipse cx="57" cy="70" rx="18" ry="9" fill={CREAM} opacity="0.55" />}

      {/* Leher dan kepala */}
      <path d={`M70 56 L${hx - 4} ${hy + 6}`} stroke={c} strokeWidth={s === "bronto" ? 12 : 15} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={r} fill={c} />
      {s === "ptero" ? (
        <path d={`M${hx + 6} ${hy - 4} L${hx + 32} ${hy + 6} L${hx + 6} ${hy + 10} Z`} fill={a} />
      ) : (
        <ellipse cx={hx + r * 0.55} cy={hy + r * 0.35} rx={r * 0.72} ry={r * 0.55} fill={c} />
      )}

      {/* Ciri di depan tubuh */}
      {s === "trice" && (
        <g fill={locked ? c : CREAM}>
          <path d={`M${hx - 4} ${hy - 12} l3 -13 l6 12 Z`} />
          <path d={`M${hx + 15} ${hy} l5 -10 l3 11 Z`} />
        </g>
      )}
      {s === "bronto" && !locked && (
        <g fill={a} opacity="0.7">
          <circle cx="44" cy="54" r="4" />
          <circle cx="58" cy="50" r="3" />
          <circle cx="68" cy="60" r="3.5" />
        </g>
      )}
      {s === "ptero" && (
        <>
          <path d={`M${hx - 6} ${hy - 8} L${hx - 28} ${hy - 20} L${hx - 2} ${hy - 13} Z`} fill={a} />
          <path d="M46 60 L26 34 L60 46 L68 60 Z" fill={a} opacity={locked ? 1 : 0.75} />
        </>
      )}
      {s === "raptor" && (
        <>
          <path d={`M${hx - 8} ${hy - 12} l-7 -11 l9 6 l1 -11 l6 12 Z`} fill={a} />
          {!locked && (
            <g stroke={a} strokeWidth="4" strokeLinecap="round">
              <path d="M40 46 l4 9" />
              <path d="M52 43 l3 9" />
              <path d="M64 45 l2 8" />
            </g>
          )}
        </>
      )}
      {s === "ankylo" && [36, 48, 60, 72].map((x) => <circle key={x} cx={x} cy={x === 36 || x === 72 ? 49 : 44} r="5" fill={a} />)}
      {s === "spino" && !locked && (
        <g stroke={c} strokeWidth="2.5" strokeLinecap="round" opacity="0.7">
          <path d="M44 48 L48 30" />
          <path d="M55 46 L55 22" />
          <path d="M66 48 L62 30" />
        </g>
      )}
      {s === "rex" && (
        <>
          <path d={`M${hx + 6} ${hy + 15} l3 6 l3 -6 l3 6 l3 -6 l3 6 l3 -6 Z`} fill={locked ? c : CREAM} />
          <path d="M76 62 l9 4" stroke={c} strokeWidth="5" strokeLinecap="round" />
        </>
      )}
      {s === "stego" && (
        <g stroke={a} strokeWidth="3" strokeLinecap="round">
          <path d="M12 72 l-5 -8" />
          <path d="M19 68 l-3 -9" />
        </g>
      )}

      {/* Wajah */}
      {!locked && (
        <g>
          <circle cx={hx + 3} cy={hy - 3} r={r * 0.3} fill="#FFFDF5" />
          <circle cx={hx + 4} cy={hy - 3} r={r * 0.17} fill={INK} />
          {s !== "ptero" && <path d={`M${hx + r * 0.5} ${hy + r * 0.55} q${r * 0.3} ${r * 0.22} ${r * 0.6} 0`} fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />}
          <circle cx={hx - 3} cy={hy + r * 0.45} r={r * 0.2} fill="#F29C7B" opacity="0.6" />
        </g>
      )}
      {locked && (
        <text x="58" y="68" textAnchor="middle" fontSize="26" fontWeight="700" fill="var(--c-muted)" fontFamily="Fredoka, sans-serif">
          ?
        </text>
      )}
    </svg>
  );
}

interface EggArtProps {
  /** 0–1 */
  progress: number;
  size?: number;
  accent?: string;
  wobble?: boolean;
  /** Tahap retak tambahan saat diketuk (0–3). */
  taps?: number;
  className?: string;
}

/** Telur dinosaurus: retakan bertambah seiring progres. */
export function EggArt({ progress, size = 120, accent = "#F0A22E", wobble = false, taps = 0, className }: EggArtProps) {
  const stage = Math.max(progress >= 1 ? 3 : progress >= 0.67 ? 2 : progress >= 0.34 ? 1 : 0, taps);
  return (
    <svg viewBox="0 0 100 124" width={size} height={(size * 124) / 100} className={cn("shrink-0 overflow-visible", className)} role="img" aria-label={`Telur dinosaurus, ${Math.round(progress * 100)} persen`}>
      <ellipse cx="50" cy="118" rx="30" ry="5" fill={INK} opacity="0.12" />
      <g className={wobble ? "animate-wobble" : undefined} style={{ transformOrigin: "50px 114px", transformBox: "view-box" }}>
        {progress >= 1 && <ellipse cx="50" cy="64" rx="48" ry="58" fill={accent} opacity="0.22" />}
        <path d="M50 6 C74 6 90 44 90 70 C90 96 72 114 50 114 C28 114 10 96 10 70 C10 44 26 6 50 6 Z" fill="#FFF6DC" stroke="#E4D3A4" strokeWidth="3" />
        <path d="M24 84 C30 100 44 108 58 106 C44 104 32 96 24 84 Z" fill="#E4D3A4" opacity="0.7" />
        <g fill={accent}>
          <circle cx="36" cy="40" r="7" />
          <circle cx="66" cy="58" r="9" />
          <circle cx="40" cy="80" r="6" />
          <circle cx="62" cy="28" r="4" />
          <circle cx="70" cy="90" r="5" />
        </g>
        <ellipse cx="34" cy="30" rx="5" ry="9" fill="#FFFFFF" opacity="0.7" transform="rotate(24 34 30)" />
        <g fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          {stage >= 1 && <path d="M44 8 L50 20 L43 28 L52 38" />}
          {stage >= 2 && <path d="M52 38 L46 48 L58 54 L50 64 M46 48 L34 52" />}
          {stage >= 3 && <path d="M50 64 L60 72 L52 82 L62 92 M58 54 L72 50 M52 82 L40 88" />}
        </g>
      </g>
    </svg>
  );
}
