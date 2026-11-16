"use client";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <section className="max-w-md rounded-3xl border border-line bg-surface p-6 text-center shadow-xl">
        <h1 className="font-display text-2xl font-bold text-ink">
          Dashboard tidak dapat dimuat
        </h1>
        <p className="mt-2 text-sm text-muted">
          Data dashboard gagal diambil. Periksa koneksi, lalu coba lagi.
        </p>
        <button
          type="button"
          onClick={reset}
          className="chunky mt-5 min-h-12 rounded-2xl bg-primary px-5 font-display font-semibold text-on-primary"
        >
          Coba lagi
        </button>
      </section>
    </main>
  );
}
