"use client";

import { useRouter } from "next/navigation";
import {
  useId,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { LevelBar } from "@/components/gamification/Widgets";
import { Avatar, AVATAR_IDS, AVATAR_NAMES } from "@/components/layout/AppShell";
import { Icon, type IconName } from "@/components/ui/Icon";
import {
  Button,
  Card,
  Eyebrow,
  StatTile,
  Toggle,
} from "@/components/ui/primitives";
import { signOutAction } from "@/lib/actions/auth";
import { updateProfileAction, updateSettingsAction } from "@/lib/actions/profile";
import type { ProfilePageData } from "@/lib/data/types";
import type { AvatarId, ThemeMode, StreakVisual, UserSettings } from "@/types";
import { cn } from "@/utils/cn";

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon: IconName }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <span className="font-bold text-ink">{label}</span>
      <div
        className="flex rounded-2xl bg-surface-2 p-1"
        role="group"
        aria-label={label}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "flex min-h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-bold transition-colors disabled:opacity-60",
              value === option.value
                ? "bg-surface text-ink shadow-sm"
                : "text-muted",
            )}
          >
            <Icon name={option.icon} size={16} />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Profile({ data }: { data: ProfilePageData }) {
  const router = useRouter();
  const { profile, stats } = data;
  const [settings, setSettings] = useState<UserSettings>(data.settings);
  const [name, setName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const nameId = useId();
  const userId = useId();

  const nameError = name.trim() === "" ? "Nama tidak boleh kosong." : null;
  const usernameError = /^[a-z0-9_]{3,20}$/.test(username)
    ? null
    : "Gunakan 3–20 karakter: huruf kecil, angka, atau garis bawah.";
  const dirty =
    name.trim() !== profile.displayName || username !== profile.username;

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (nameError || usernameError || pending) return;

    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await updateProfileAction({
        displayName: name.trim(),
        username,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Perubahan tersimpan.");
      setName(name.trim());
      router.refresh();
    });
  };

  const changeAvatar = (avatar: AvatarId) => {
    if (avatar === profile.avatar || pending) return;

    setError("");
    startTransition(async () => {
      const result = await updateProfileAction({ avatar });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const changeSettings = (patch: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    startTransition(async () => {
      const result = await updateSettingsAction(patch);
      if (!result.ok) {
        setError(result.error);
        setSettings(data.settings);
        return;
      }
      router.refresh();
    });
  };

  const joined = new Date(profile.joinedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const inputCls =
    "mt-1.5 h-12 w-full rounded-2xl border-2 bg-bg px-4 font-bold text-ink outline-none focus-visible:border-primary";

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Kartu penjelajah</Eyebrow>
          <h1 className="mt-1 font-display text-4xl font-bold text-ink sm:text-5xl">
            Profil
          </h1>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="danger" icon="close">
            Keluar
          </Button>
        </form>
      </header>

      {error && (
        <p className="text-sm font-semibold text-lava" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-5">
          <Card>
            <div className="flex items-center gap-4">
              <Avatar
                id={profile.avatar}
                size={88}
                className="ring-4 ring-amber"
              />
              <div className="min-w-0">
                <p className="truncate font-display text-3xl font-semibold text-ink">
                  {profile.displayName}
                </p>
                <p className="truncate font-mono text-sm font-bold text-muted">
                  @{profile.username}
                </p>
                <p className="mt-1 text-sm text-muted">Bergabung {joined}</p>
              </div>
            </div>
            <LevelBar xp={profile.xp} className="mt-5" />

            <fieldset className="mt-5" disabled={pending}>
              <legend className="font-bold text-ink">Pilih avatar</legend>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {AVATAR_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={profile.avatar === id}
                    aria-label={`Avatar ${AVATAR_NAMES[id]}`}
                    onClick={() => changeAvatar(id)}
                    className={cn(
                      "rounded-full p-1 transition-transform hover:scale-105 disabled:opacity-60",
                      profile.avatar === id
                        ? "ring-4 ring-primary"
                        : "ring-2 ring-line",
                    )}
                  >
                    <Avatar id={id} size={48} />
                  </button>
                ))}
              </div>
            </fieldset>
          </Card>

          <Card>
            <Eyebrow>Ubah identitas</Eyebrow>
            <form onSubmit={save} className="mt-3 space-y-4" noValidate>
              <div>
                <label htmlFor={nameId} className="font-bold text-ink">
                  Nama panggilan
                </label>
                <input
                  id={nameId}
                  value={name}
                  maxLength={24}
                  autoComplete="nickname"
                  onChange={(e) => {
                    setName(e.target.value);
                    setMessage("");
                  }}
                  aria-invalid={!!nameError}
                  className={cn(
                    inputCls,
                    nameError ? "border-lava" : "border-line",
                  )}
                />
                {nameError && (
                  <p className="mt-1.5 text-sm font-bold text-ink" role="alert">
                    {nameError}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor={userId} className="font-bold text-ink">
                  Username
                </label>
                <input
                  id={userId}
                  value={username}
                  maxLength={20}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase());
                    setMessage("");
                  }}
                  aria-invalid={!!usernameError}
                  className={cn(
                    inputCls,
                    "font-mono",
                    usernameError ? "border-lava" : "border-line",
                  )}
                />
                {usernameError && (
                  <p className="mt-1.5 text-sm font-bold text-ink" role="alert">
                    {usernameError}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  icon="check"
                  disabled={
                    !dirty || !!nameError || !!usernameError || pending
                  }
                >
                  {pending ? "Menyimpan..." : "Simpan perubahan"}
                </Button>
                {message && (
                  <span
                    className="flex items-center gap-1.5 text-sm font-bold text-ink"
                    role="status"
                  >
                    <Icon name="check" size={16} className="text-primary" />
                    {message}
                  </span>
                )}
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <Eyebrow>Statistik belajar</Eyebrow>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatTile
                icon="bolt"
                label="Total XP"
                value={profile.xp}
                tone="amber"
              />
              <StatTile
                icon="check"
                label="Chapter selesai"
                value={`${stats.completedChapters}/${stats.totalChapters}`}
                tone="leaf"
              />
              <StatTile
                icon="book"
                label="Materi dibaca"
                value={stats.lessonsRead}
                tone="ice"
              />
              <StatTile
                icon="target"
                label="Latihan dikerjakan"
                value={stats.attempts}
              />
              <StatTile
                icon="star"
                label="Akurasi jawaban"
                value={stats.attempts > 0 ? `${stats.accuracy}%` : "—"}
                tone="leaf"
              />
              <StatTile
                icon="flame"
                label="Streak terpanjang"
                value={`${stats.longestStreak} hari`}
                tone="lava"
              />
              <StatTile
                icon="egg"
                label="Dinosaurus"
                value={`${stats.dinosaursOwned}/${stats.totalDinosaurs}`}
                tone="amber"
              />
              <StatTile
                icon="crown"
                label="Lencana"
                value={`${stats.achievementsUnlocked}/${stats.totalAchievements}`}
                tone="ice"
              />
            </div>
          </Card>

          <Card>
            <Eyebrow>Pengaturan tampilan</Eyebrow>
            <div className="mt-1 divide-y divide-line">
              <Segmented<ThemeMode>
                label="Tema"
                value={settings.theme}
                disabled={pending}
                onChange={(theme) => changeSettings({ theme })}
                options={[
                  { value: "day", label: "Siang", icon: "sun" },
                  { value: "night", label: "Malam gua", icon: "moon" },
                ]}
              />
              <Segmented<StreakVisual>
                label="Visual streak"
                value={settings.streakVisual}
                disabled={pending}
                onChange={(streakVisual) => changeSettings({ streakVisual })}
                options={[
                  { value: "fossil", label: "Fosil", icon: "brush" },
                  { value: "mammoth", label: "Mammoth", icon: "snow" },
                ]}
              />
              <Toggle
                label="Suara raungan"
                description="Trixsaurus meraung hanya saat jawabanmu salah."
                checked={settings.soundEnabled}
                onChange={(soundEnabled) => changeSettings({ soundEnabled })}
              />
              <Toggle
                label="Kurangi animasi"
                description="Mematikan gerakan karakter dan transisi."
                checked={settings.reducedMotion}
                onChange={(reducedMotion) => changeSettings({ reducedMotion })}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
