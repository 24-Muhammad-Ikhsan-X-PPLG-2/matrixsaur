"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Logo } from "@/components/layout/AppShell";
import { supabase } from "@/lib/supabase/client";
import { z } from "zod";

type AuthMode = "login" | "register";

type AuthFormState = {
  error?: string;
  message?: string;
};

const inputClassName =
  "mt-1.5 min-h-12 w-full rounded-2xl border-2 border-line bg-bg px-4 font-bold text-ink outline-none transition-colors placeholder:text-muted/70 focus-visible:border-primary";

const signInSchema = z.object({
  email: z.email({ error: "Masukkan alamat email yang valid." }).trim(),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

const signUpSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "Nama tampilan minimal 2 karakter.")
      .max(60, "Nama tampilan maksimal 60 karakter."),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Username minimal 3 karakter.")
      .max(20, "Username maksimal 20 karakter.")
      .regex(
        /^[a-z0-9_]+$/,
        "Username hanya boleh berisi huruf kecil, angka, dan garis bawah.",
      ),
    email: z.email({ error: "Masukkan alamat email yang valid." }).trim(),
    password: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter.")
      .max(72, "Kata sandi maksimal 72 karakter."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    error: "Konfirmasi kata sandi tidak cocok.",
  });

export function AuthForm({
  mode,
  callbackError = false,
  nextPath,
}: {
  mode: AuthMode;
  callbackError?: boolean;
  nextPath?: string;
}) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [state, setState] = useState<AuthFormState>({});
  const [pending, setPending] = useState(false);
  const destination =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/dashboard";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState({});
    const formData = new FormData(event.currentTarget);

    if (isRegister) {
      const parsed = signUpSchema.safeParse({
        displayName: formData.get("displayName"),
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
      });

      if (!parsed.success) {
        setState({
          error:
            parsed.error.issues[0]?.message ??
            "Periksa kembali data yang dimasukkan.",
        });
        return;
      }

      setPending(true);
      try {
        const { displayName, username, email, password } = parsed.data;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName, username },
            emailRedirectTo: new URL(
              "/auth/callback",
              process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin,
            ).toString(),
          },
        });

        if (error) {
          setState({
            error:
              error.status === 422
                ? "Pendaftaran gagal. Pastikan email belum terdaftar dan data sudah benar."
                : "Tidak dapat mendaftar sekarang. Coba lagi beberapa saat.",
          });
          return;
        }

        if (data.session) {
          router.replace(destination);
          router.refresh();
          return;
        }

        setState({
          message:
            "Akun berhasil dibuat. Periksa email untuk mengonfirmasi pendaftaran sebelum masuk.",
        });
      } catch {
        setState({
          error: "Tidak dapat mendaftar sekarang. Coba lagi beberapa saat.",
        });
      } finally {
        setPending(false);
      }

      return;
    }

    const parsed = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      setState({
        error:
          parsed.error.issues[0]?.message ??
          "Periksa kembali data yang dimasukkan.",
      });
      return;
    }

    setPending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);

      if (error) {
        setState({
          error:
            error.status === 400
              ? "Email atau kata sandi tidak benar."
              : "Tidak dapat masuk sekarang. Coba lagi beberapa saat.",
        });
        return;
      }

      router.replace(destination);
      router.refresh();
    } catch {
      setState({
        error: "Tidak dapat masuk sekarang. Coba lagi beberapa saat.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mb-7 flex justify-center">
        <Logo to="/" />
      </div>

      <section className="rounded-3xl border border-line bg-surface p-6 shadow-xl sm:p-8">
        <p className="text-center text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
          {isRegister ? "Mulai petualangan" : "Selamat datang kembali"}
        </p>
        <h1 className="mt-2 text-center font-display text-3xl font-bold text-ink sm:text-4xl">
          {isRegister ? "Buat akun penjelajah" : "Masuk ke markas"}
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          {isRegister
            ? "Simpan progres belajar dan koleksi dinosaurusmu."
            : "Lanjutkan petualangan matriksmu."}
        </p>

        {callbackError && (
          <p
            className="mt-5 rounded-xl bg-lava-soft px-4 py-3 text-sm font-semibold text-ink"
            role="alert"
          >
            Tautan konfirmasi tidak valid atau sudah kedaluwarsa. Coba daftar
            kembali atau masuk.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {isRegister && (
            <>
              <label className="block text-sm font-bold text-ink">
                Nama tampilan
                <input
                  className={inputClassName}
                  type="text"
                  name="displayName"
                  autoComplete="name"
                  minLength={2}
                  maxLength={60}
                  required
                />
              </label>
              <label className="block text-sm font-bold text-ink">
                Username
                <input
                  className={inputClassName}
                  type="text"
                  name="username"
                  autoComplete="username"
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]+"
                  aria-describedby="username-help"
                  required
                />
                <span
                  id="username-help"
                  className="mt-1 block text-xs font-medium text-muted"
                >
                  3–20 karakter: huruf, angka, atau garis bawah.
                </span>
              </label>
            </>
          )}

          <label className="block text-sm font-bold text-ink">
            Email
            <input
              className={inputClassName}
              type="email"
              name="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="block text-sm font-bold text-ink">
            Kata sandi
            <input
              className={inputClassName}
              type="password"
              name="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={isRegister ? 8 : undefined}
              maxLength={isRegister ? 72 : undefined}
              required
            />
          </label>

          {isRegister && (
            <label className="block text-sm font-bold text-ink">
              Ulangi kata sandi
              <input
                className={inputClassName}
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
              />
            </label>
          )}

          {state.error && (
            <p
              className="rounded-xl bg-lava-soft px-4 py-3 text-sm font-semibold text-ink"
              role="alert"
            >
              {state.error}
            </p>
          )}
          {state.message && (
            <p
              className="rounded-xl bg-leaf px-4 py-3 text-sm font-semibold text-ink"
              role="status"
            >
              {state.message}
            </p>
          )}

          <button
            className="chunky min-h-12 w-full rounded-2xl bg-primary px-5 font-display font-semibold text-on-primary disabled:cursor-wait disabled:opacity-60"
            type="submit"
            disabled={pending}
          >
            {pending
              ? "Memproses..."
              : isRegister
                ? "Buat akun"
                : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-muted">
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <Link
            className="font-bold text-primary underline-offset-4 hover:underline"
            href={isRegister ? "/login" : "/register"}
          >
            {isRegister ? "Masuk" : "Daftar"}
          </Link>
        </p>
      </section>
    </main>
  );
}
