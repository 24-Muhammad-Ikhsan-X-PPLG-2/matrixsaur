import type { ReactNode } from "react";

export type IconName =
  | "cave" | "map" | "chart" | "egg" | "user" | "sound" | "mute" | "lock" | "check" | "play" | "left" | "right"
  | "flame" | "bone" | "star" | "footprint" | "volcano" | "brush" | "crown" | "bolt" | "clock" | "sun" | "moon"
  | "close" | "refresh" | "pause" | "step" | "book" | "target" | "snow";

const PATHS: Record<IconName, ReactNode> = {
  cave: <path d="M3 20 C3 10 7 4 12 4 C17 4 21 10 21 20 Z M9 20 C9 15 10.5 13 12 13 C13.5 13 15 15 15 20" />,
  map: <path d="M9 4 L3 6 V20 L9 18 L15 20 L21 18 V4 L15 6 Z M9 4 V18 M15 6 V20" />,
  chart: <path d="M4 20 V11 M10 20 V4 M16 20 V14 M21 20 H3" />,
  egg: <path d="M12 3 C16 3 19 9 19 13.5 C19 17.6 15.9 21 12 21 C8.1 21 5 17.6 5 13.5 C5 9 8 3 12 3 Z" />,
  user: <path d="M12 12 A4 4 0 1 0 12 4 A4 4 0 0 0 12 12 Z M4 21 C4 16.5 7.5 15 12 15 C16.5 15 20 16.5 20 21" />,
  sound: <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z M16.5 9 C17.8 10.6 17.8 13.4 16.5 15 M19 6.5 C21.6 9.6 21.6 14.4 19 17.5" />,
  mute: <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z M17 9.5 L22 14.5 M22 9.5 L17 14.5" />,
  lock: <path d="M6 11 H18 V20 H6 Z M8.5 11 V8 A3.5 3.5 0 0 1 15.5 8 V11" />,
  check: <path d="M5 12.5 L10 17.5 L19.5 7" />,
  play: <path d="M7 4.5 L19 12 L7 19.5 Z" />,
  left: <path d="M14.5 5 L7.5 12 L14.5 19" />,
  right: <path d="M9.5 5 L16.5 12 L9.5 19" />,
  flame: <path d="M12 3 C12 7 17 9 17 14.5 A5 5 0 0 1 7 14.5 C7 12 8.5 11 9 9 C10.5 10 11 11.5 11 12.5 C12.5 10.5 12.5 6.5 12 3 Z" />,
  bone: <path d="M8.2 15.8 L15.8 8.2 M15.8 8.2 C15 6.4 16 4.4 17.8 4.4 C19 4.4 19.6 5.4 19.4 6.2 C20.4 6.2 21.2 7.4 20.4 8.6 C19.6 9.8 17.6 9.4 15.8 8.2 Z M8.2 15.8 C6.4 15 4.4 16 4.4 17.8 C4.4 19 5.4 19.6 6.2 19.4 C6.2 20.4 7.4 21.2 8.6 20.4 C9.8 19.6 9.4 17.6 8.2 15.8 Z" />,
  star: <path d="M12 3.5 L14.6 9 L20.5 9.7 L16.1 13.8 L17.3 19.7 L12 16.8 L6.7 19.7 L7.9 13.8 L3.5 9.7 L9.4 9 Z" />,
  footprint: <path d="M12 21 C8.5 21 7 18.5 7 16 C7 13.5 9 12 12 12 C15 12 17 13.5 17 16 C17 18.5 15.5 21 12 21 Z M6 10 L5.5 7 M10 8.5 L10 5 M14 8.5 L14.5 5 M18 10 L19 7" />,
  volcano: <path d="M3 20 L9 9 H15 L21 20 Z M9 9 L11 12 L13 10 L15 9 M12 6 V3 M8.5 5.5 L7 4 M15.5 5.5 L17 4" />,
  brush: <path d="M14 4 L20 10 L11 19 H5 V13 Z M11 7 L17 13 M5 19 L3 21" />,
  crown: <path d="M4 18 L3 8 L8 12 L12 5 L16 12 L21 8 L20 18 Z M4 21 H20" />,
  bolt: <path d="M13 3 L5 13.5 H11 L10 21 L19 10 H13 Z" />,
  clock: <path d="M12 21 A9 9 0 1 0 12 3 A9 9 0 0 0 12 21 Z M12 7.5 V12 L15 14" />,
  sun: <path d="M12 16.5 A4.5 4.5 0 1 0 12 7.5 A4.5 4.5 0 0 0 12 16.5 Z M12 2.5 V4.5 M12 19.5 V21.5 M2.5 12 H4.5 M19.5 12 H21.5 M5.3 5.3 L6.7 6.7 M17.3 17.3 L18.7 18.7 M5.3 18.7 L6.7 17.3 M17.3 6.7 L18.7 5.3" />,
  moon: <path d="M20 14.5 A8.5 8.5 0 1 1 9.5 4 A7 7 0 0 0 20 14.5 Z" />,
  close: <path d="M6 6 L18 18 M18 6 L6 18" />,
  refresh: <path d="M19.5 12 A7.5 7.5 0 1 1 17 6.4 M17.5 3 V7 H13.5" />,
  pause: <path d="M8 5 V19 M16 5 V19" />,
  step: <path d="M6 5 L15 12 L6 19 Z M18.5 5 V19" />,
  book: <path d="M4 5 C7 4 10 4.5 12 6 C14 4.5 17 4 20 5 V19 C17 18 14 18.5 12 20 C10 18.5 7 18 4 19 Z M12 6 V20" />,
  target: <path d="M12 21 A9 9 0 1 0 12 3 A9 9 0 0 0 12 21 Z M12 16 A4 4 0 1 0 12 8 A4 4 0 0 0 12 16 Z" />,
  snow: <path d="M12 3 V21 M4.2 7.5 L19.8 16.5 M19.8 7.5 L4.2 16.5 M9.5 4.5 L12 7 L14.5 4.5 M9.5 19.5 L12 17 L14.5 19.5" />,
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  filled?: boolean;
}

export function Icon({ name, size = 20, className, filled = false }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {PATHS[name]}
    </svg>
  );
}
