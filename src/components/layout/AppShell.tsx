"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { updateSettingsAction } from "@/lib/actions/profile";
import { getNavKey, paths, type NavKey } from "@/lib/routes";
import type { ShellData } from "@/lib/data/types";
import type { AvatarId } from "@/types";
import { cn } from "@/utils/cn";

/* ---------- Avatar ---------- */
const AVATAR_STYLE: Record<
  Exclude<AvatarId, "trix">,
  { icon: IconName; cls: string }
> = {
  egg: { icon: "egg", cls: "bg-amber text-[#2B2218]" },
  fern: { icon: "footprint", cls: "bg-primary text-on-primary" },
  volcano: { icon: "volcano", cls: "bg-lava-soft text-ink" },
  bone: { icon: "bone", cls: "bg-surface-2 text-ink" },
  amber: { icon: "star", cls: "bg-amber-soft text-ink" },
};

export const AVATAR_IDS: AvatarId[] = [
  "trix",
  "egg",
  "fern",
  "volcano",
  "bone",
  "amber",
];
export const AVATAR_NAMES: Record<AvatarId, string> = {
  trix: "Trixsaurus",
  egg: "Telur",
  fern: "Jejak",
  volcano: "Gunung api",
  bone: "Tulang",
  amber: "Bintang amber",
};

export function Avatar({
  id,
  size = 44,
  className,
}: {
  id: AvatarId;
  size?: number;
  className?: string;
}) {
  if (id === "trix") {
    return (
      <span
        className={cn(
          "grid shrink-0 place-items-end overflow-hidden rounded-full bg-leaf",
          className,
        )}
        style={{ width: size, height: size }}
      >
        <svg viewBox="40 22 120 120" width={size} height={size} aria-hidden>
          <g fill="#F0A22E">
            <path d="M70 46 L78 24 L90 42 Z" />
            <path d="M90 40 L100 14 L110 40 Z" />
            <path d="M110 42 L122 24 L130 46 Z" />
          </g>
          <ellipse cx="100" cy="82" rx="52" ry="43" fill="#4FA36F" />
          <ellipse cx="100" cy="102" rx="31" ry="19" fill="#74BE8B" />
          <circle cx="80" cy="72" r="12" fill="#FFFDF5" />
          <circle cx="120" cy="72" r="12" fill="#FFFDF5" />
          <circle cx="82" cy="73" r="6.5" fill="#2B2218" />
          <circle cx="122" cy="73" r="6.5" fill="#2B2218" />
          <path
            d="M88 107 Q100 117 112 107"
            fill="none"
            stroke="#2B2218"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  const style = AVATAR_STYLE[id];
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full",
        style.cls,
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Icon name={style.icon} size={Math.round(size * 0.5)} />
    </span>
  );
}

/* ---------- Logo ---------- */
export function Logo({
  to = paths.dashboard,
  className,
}: {
  to?: string;
  className?: string;
}) {
  return (
    <Link
      href={to}
      className={cn(
        "flex items-center gap-2 rounded-xl no-underline",
        className,
      )}
      aria-label="MATRIXSAUR — beranda"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
          <path
            d="M12 2.5 C16.2 2.5 19.5 9 19.5 13.5 C19.5 18 16.2 21.5 12 21.5 C7.8 21.5 4.5 18 4.5 13.5 C4.5 9 7.8 2.5 12 2.5 Z"
            fill="#F7F0DC"
          />
          <rect x="8" y="10" width="3.4" height="3.4" rx="1" fill="#F0A22E" />
          <rect
            x="12.6"
            y="10"
            width="3.4"
            height="3.4"
            rx="1"
            fill="#2E7355"
          />
          <rect x="8" y="14.6" width="3.4" height="3.4" rx="1" fill="#2E7355" />
          <rect
            x="12.6"
            y="14.6"
            width="3.4"
            height="3.4"
            rx="1"
            fill="#F0A22E"
          />
        </svg>
      </span>
      <span className="font-display text-xl font-bold tracking-wide text-ink max-[359px]:hidden">
        MATRIX<span className="text-primary">SAUR</span>
      </span>
    </Link>
  );
}

/* ---------- Tombol suara ---------- */
export function SoundToggle({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(enabled);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      const result = await updateSettingsAction({ soundEnabled: next });
      if (!result.ok) setOn(!next);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Matikan suara raungan" : "Nyalakan suara raungan"}
      title={on ? "Suara menyala" : "Suara mati"}
      onClick={toggle}
      disabled={pending}
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 transition-colors disabled:opacity-60",
        on
          ? "border-line bg-surface text-ink"
          : "border-line bg-surface-2 text-muted",
      )}
    >
      <Icon name={on ? "sound" : "mute"} size={20} />
    </button>
  );
}

/* ---------- Kerangka ---------- */
const NAV: {
  key: NavKey;
  label: string;
  icon: IconName;
  path: string;
}[] = [
  { key: "dashboard", label: "Markas", icon: "cave", path: paths.dashboard },
  { key: "learn", label: "Belajar", icon: "map", path: paths.learn },
  { key: "progress", label: "Progres", icon: "chart", path: paths.progress },
  { key: "collection", label: "Koleksi", icon: "egg", path: paths.collection },
  { key: "profile", label: "Profil", icon: "user", path: paths.profile },
];

export function AppShell({
  data,
  children,
}: {
  data: ShellData;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const activeKey = getNavKey(pathname ?? "");

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = data.settings.theme;
    root.dataset.motion = data.settings.reducedMotion ? "reduced" : "full";
  }, [data.settings.theme, data.settings.reducedMotion]);

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <button
        type="button"
        onClick={() => document.getElementById("konten")?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-amber focus:px-4 focus:py-2 focus:font-bold focus:text-[#2B2218]"
      >
        Lompat ke konten
      </button>

      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Logo className="mr-auto md:mr-4" />

          <nav
            className="mr-auto hidden items-center gap-1 md:flex"
            aria-label="Navigasi utama"
          >
            {NAV.map((item) => {
              const active = activeKey === item.key;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-xl px-3.5 font-display font-semibold no-underline transition-colors",
                    active
                      ? "bg-primary text-on-primary"
                      : "text-muted hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <span
            className="flex h-11 items-center gap-1.5 rounded-xl bg-lava-soft px-3 font-display font-semibold text-ink tabular-nums"
            title="Streak belajar"
          >
            <Icon name="flame" size={18} className="text-lava" filled />
            {data.streak}
            <span className="sr-only">hari streak</span>
          </span>
          <span
            className="hidden h-11 items-center gap-1.5 rounded-xl bg-amber-soft px-3 font-display font-semibold text-ink tabular-nums min-[420px]:flex"
            title="Total XP"
          >
            <Icon name="bolt" size={18} filled />
            {data.xp}
            <span className="text-xs text-muted">XP</span>
          </span>
          <SoundToggle enabled={data.settings.soundEnabled} />
          <Link
            href={paths.profile}
            className="hidden rounded-full sm:block"
            aria-label={`Profil ${data.displayName}`}
          >
            <Avatar id={data.avatar} size={44} />
          </Link>
        </div>
      </header>

      <main
        id="konten"
        tabIndex={-1}
        className="mx-auto max-w-6xl px-4 pb-32 pt-6 outline-none sm:px-6 sm:pt-8 md:pb-16"
      >
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Navigasi utama"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map((item) => {
            const active = activeKey === item.key;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-extrabold no-underline",
                    active ? "text-primary" : "text-muted",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-12 place-items-center rounded-full transition-colors",
                      active && "bg-leaf",
                    )}
                  >
                    <Icon name={item.icon} size={20} />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
