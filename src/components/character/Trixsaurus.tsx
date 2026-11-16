import { cn } from "@/utils/cn";

export type TrixMood = "idle" | "happy" | "thinking" | "sad" | "angry" | "celebrating";

const MOOD_LABEL: Record<TrixMood, string> = {
  idle: "Trixsaurus sedang santai",
  happy: "Trixsaurus senang",
  thinking: "Trixsaurus sedang berpikir",
  sad: "Trixsaurus sedih",
  angry: "Trixsaurus marah dan meraung",
  celebrating: "Trixsaurus merayakan",
};

const MOOD_ANIMATION: Record<TrixMood, string> = {
  idle: "animate-bob",
  happy: "animate-hop",
  thinking: "animate-sway",
  sad: "animate-droop",
  angry: "animate-shake",
  celebrating: "animate-hop",
};

interface TrixsaurusProps {
  mood?: TrixMood;
  size?: number;
  className?: string;
  /** Sembunyikan dari pembaca layar jika hanya dekorasi. */
  decorative?: boolean;
}

const INK = "#2B2218";

/**
 * Trixsaurus — placeholder ilustrasi vektor.
 * Untuk mengganti dengan aset final, cukup ganti isi komponen ini; props `mood` tetap sama.
 */
export function Trixsaurus({ mood = "idle", size = 160, className, decorative = false }: TrixsaurusProps) {
  const angry = mood === "angry";
  const joyful = mood === "happy" || mood === "celebrating";
  const body = angry ? "#D9634A" : "#4FA36F";
  const bodyDark = angry ? "#B44A35" : "#2E7355";
  const snout = angry ? "#E58469" : "#74BE8B";
  const armsUp = mood === "celebrating";

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={cn("shrink-0 overflow-visible", className)}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : MOOD_LABEL[mood]}
    >
      <ellipse cx="100" cy="188" rx="52" ry="7" fill={INK} opacity="0.12" />

      <g key={mood} className={MOOD_ANIMATION[mood]} style={{ transformOrigin: "100px 180px", transformBox: "view-box" }}>
        {/* Ekor */}
        <path d="M126 162 C168 170 186 142 178 114 C172 140 156 150 130 144 Z" fill={bodyDark} />
        {/* Kaki */}
        <ellipse cx="76" cy="178" rx="17" ry="10" fill={bodyDark} />
        <ellipse cx="122" cy="178" rx="17" ry="10" fill={bodyDark} />
        {/* Badan */}
        <ellipse cx="100" cy="138" rx="45" ry="42" fill={body} />
        <ellipse cx="100" cy="146" rx="28" ry="27" fill="#F7EBC8" />
        {/* Tanda matriks 2×2 di perut */}
        <g fill="#F0A22E">
          <rect x="88" y="134" width="10" height="10" rx="3" />
          <rect x="102" y="134" width="10" height="10" rx="3" opacity="0.55" />
          <rect x="88" y="148" width="10" height="10" rx="3" opacity="0.55" />
          <rect x="102" y="148" width="10" height="10" rx="3" />
        </g>

        {/* Lengan */}
        <g fill={bodyDark}>
          <ellipse cx="56" cy="130" rx="9" ry="15" transform={armsUp ? "rotate(150 60 122)" : "rotate(24 56 130)"} />
          <ellipse
            cx="144"
            cy="130"
            rx="9"
            ry="15"
            transform={armsUp ? "rotate(-150 140 122)" : mood === "thinking" ? "rotate(-150 142 120)" : "rotate(-24 144 130)"}
          />
        </g>

        {/* Jambul tiga duri */}
        <g fill="#F0A22E">
          <path d="M70 46 L78 24 L90 42 Z" />
          <path d="M90 40 L100 14 L110 40 Z" />
          <path d="M110 42 L122 24 L130 46 Z" />
        </g>

        {/* Kepala */}
        <ellipse cx="100" cy="78" rx="52" ry="43" fill={body} />
        <ellipse cx="100" cy="98" rx="31" ry="19" fill={snout} />
        <circle cx="91" cy="90" r="2.4" fill={bodyDark} />
        <circle cx="109" cy="90" r="2.4" fill={bodyDark} />
        {/* Pipi */}
        <circle cx="60" cy="90" r="8" fill={angry ? "#F6A98C" : "#9AD6A4"} />
        <circle cx="140" cy="90" r="8" fill={angry ? "#F6A98C" : "#9AD6A4"} />

        {/* Mata */}
        {joyful ? (
          <g fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round">
            <path d="M70 72 Q80 59 90 72" />
            <path d="M110 72 Q120 59 130 72" />
          </g>
        ) : (
          <g>
            <circle cx="80" cy="68" r="12" fill="#FFFDF5" />
            <circle cx="120" cy="68" r="12" fill="#FFFDF5" />
            {mood === "thinking" && (
              <>
                <circle cx="84" cy="63" r="6" fill={INK} />
                <circle cx="124" cy="63" r="6" fill={INK} />
              </>
            )}
            {mood === "sad" && (
              <>
                <circle cx="80" cy="73" r="6" fill={INK} />
                <circle cx="120" cy="73" r="6" fill={INK} />
                <path d="M67 62 Q80 54 93 64 L93 56 L67 54 Z" fill={body} />
                <path d="M133 62 Q120 54 107 64 L107 56 L133 54 Z" fill={body} />
              </>
            )}
            {mood === "angry" && (
              <>
                <circle cx="82" cy="71" r="5.5" fill={INK} />
                <circle cx="118" cy="71" r="5.5" fill={INK} />
                <path d="M66 52 L96 64 L96 54 L66 48 Z" fill={body} />
                <path d="M134 52 L104 64 L104 54 L134 48 Z" fill={body} />
              </>
            )}
            {mood === "idle" && (
              <>
                <circle cx="82" cy="69" r="6.5" fill={INK} />
                <circle cx="122" cy="69" r="6.5" fill={INK} />
                <circle cx="84.5" cy="66" r="2.2" fill="#FFFDF5" />
                <circle cx="124.5" cy="66" r="2.2" fill="#FFFDF5" />
              </>
            )}
          </g>
        )}

        {/* Alis */}
        {mood === "angry" && (
          <g stroke={INK} strokeWidth="5" strokeLinecap="round">
            <path d="M66 54 L94 65" />
            <path d="M134 54 L106 65" />
          </g>
        )}
        {mood === "sad" && (
          <g stroke={INK} strokeWidth="4" strokeLinecap="round">
            <path d="M68 58 L88 52" />
            <path d="M132 58 L112 52" />
          </g>
        )}
        {mood === "thinking" && (
          <g stroke={INK} strokeWidth="4" strokeLinecap="round">
            <path d="M68 53 L90 51" />
            <path d="M110 46 L132 50" />
          </g>
        )}

        {/* Mulut */}
        {mood === "idle" && <path d="M88 103 Q100 113 112 103" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />}
        {mood === "thinking" && <path d="M92 106 Q101 101 110 105" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />}
        {mood === "sad" && <path d="M88 110 Q100 100 112 110" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />}
        {joyful && (
          <g>
            <path d="M84 100 Q100 124 116 100 Z" fill={INK} />
            <path d="M92 110 Q100 118 108 110 Q100 106 92 110 Z" fill="#F0786A" />
          </g>
        )}
        {angry && (
          <g>
            <path d="M80 99 Q100 92 120 99 Q119 122 100 122 Q81 122 80 99 Z" fill={INK} />
            <path d="M86 98 L90 106 L94 97 Z M97 96 L100 105 L103 96 Z M106 97 L110 106 L114 98 Z" fill="#FFFDF5" />
            <path d="M90 119 Q100 111 110 119 Q100 124 90 119 Z" fill="#F0786A" />
          </g>
        )}

        {mood === "sad" && <path d="M68 84 Q63 94 68 98 Q73 94 68 84 Z" fill="#8FD0D6" className="animate-drip" />}
      </g>

      {/* Aksen suasana di luar tubuh */}
      {mood === "thinking" && (
        <g className="animate-pop" style={{ transformOrigin: "166px 36px", transformBox: "view-box" }}>
          <circle cx="150" cy="58" r="4" fill="#F0A22E" />
          <circle cx="166" cy="34" r="17" fill="#F0A22E" />
          <text x="166" y="42" textAnchor="middle" fontSize="24" fontWeight="700" fill={INK} fontFamily="Fredoka, sans-serif">
            ?
          </text>
        </g>
      )}
      {angry && (
        <g fill="none" stroke="#D94E33" strokeWidth="5" strokeLinecap="round" className="animate-pop" style={{ transformOrigin: "100px 60px", transformBox: "view-box" }}>
          <path d="M22 54 L38 62" />
          <path d="M18 80 L36 80" />
          <path d="M178 54 L162 62" />
          <path d="M182 80 L164 80" />
          <path d="M30 30 L44 44" />
          <path d="M170 30 L156 44" />
        </g>
      )}
      {mood === "celebrating" && (
        <g className="animate-pop" style={{ transformOrigin: "100px 60px", transformBox: "view-box" }}>
          <path d="M26 40 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4 l9 -4 Z" fill="#F0A22E" />
          <path d="M176 28 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" fill="#D94E33" />
          <path d="M170 92 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3 Z" fill="#8FD0D6" />
          <circle cx="34" cy="98" r="5" fill="#D94E33" />
          <circle cx="148" cy="12" r="4" fill="#4FA36F" />
          <circle cx="54" cy="14" r="4" fill="#8FD0D6" />
        </g>
      )}
      {mood === "happy" && (
        <g fill="#F0A22E" className="animate-pop" style={{ transformOrigin: "100px 60px", transformBox: "view-box" }}>
          <path d="M30 50 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" />
          <path d="M172 40 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" />
        </g>
      )}
    </svg>
  );
}
