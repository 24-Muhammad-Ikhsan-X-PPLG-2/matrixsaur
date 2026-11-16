# MATRIXSAUR

Aplikasi belajar matriks berbasis Next.js, React, dan Supabase. Seluruh konten
(chapter, materi, soal, kunci jawaban, dinosaurus, lencana) serta progres
pengguna disimpan di Supabase — tidak ada mock data saat aplikasi berjalan.

## Arsitektur singkat

- `supabase/migrations/20261116000000_initial_schema.sql` — skema tabel, RLS,
  dan hak akses.
- `supabase/migrations/20261116000100_game_functions.sql` — aturan permainan,
  RPC, dan trigger pengguna baru.
- `scripts/seed.ts` — menanam konten dari `src/data` ke Supabase. Folder
  `src/data` hanya dipakai seeder, bukan oleh aplikasi.
- `src/lib/data/*` — pembacaan data per halaman di server.
- `src/lib/actions/*` — server action yang memanggil RPC Supabase.

Semua penulisan progres (XP, streak, telur, lencana, riwayat latihan) dilakukan
lewat RPC `security definer`. Kunci jawaban soal hanya tersimpan di tabel
`quiz_question_keys` dan tidak pernah dikirim ke klien; pemeriksaan jawaban
dilakukan oleh RPC.

## Menjalankan aplikasi

1. Salin `.env.example` menjadi `.env.local`.
2. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Isi `SUPABASE_SERVICE_ROLE_KEY` (hanya untuk seeder; jangan pakai awalan
   `NEXT_PUBLIC_`).
4. Atur `NEXT_PUBLIC_SITE_URL`, misalnya `http://localhost:3000`.
5. Terapkan migrasi ke project Supabase:
   - Dengan Supabase CLI: `supabase db push`
   - Atau tempel isi kedua file migrasi di SQL Editor, berurutan.
6. Tanam konten: `bun run seed`.
7. Di **Authentication → URL Configuration**, gunakan `NEXT_PUBLIC_SITE_URL`
   sebagai Site URL dan tambahkan `http://localhost:3000/auth/callback` ke
   Redirect URLs.
8. Jalankan `bun dev`, lalu buka `http://localhost:3000`.

Pendaftaran memakai Supabase Auth email/password. Metadata `username` dan
`display_name` diteruskan ke trigger `handle_new_user`, yang membuat profil,
pengaturan, streak, dan telur pertama. Jika konfirmasi email aktif, pengguna
harus mengonfirmasi lewat tautan callback sebelum masuk.

## Perintah

- `bun dev` — server pengembangan.
- `bun run build` — build produksi.
- `bun run typecheck` — pemeriksaan TypeScript.
- `bun run lint` — pemeriksaan ESLint.
- `bun run seed` — menanam konten ke Supabase (butuh service role key).

## Catatan pengembangan

- Menambah atau mengubah materi/soal: edit `src/data`, lalu jalankan
  `bun run seed`. Seeder melakukan upsert berdasarkan ID sehingga aman diulang.
- Menambah aturan permainan baru: tambahkan fungsi/RPC di migrasi baru, lalu
  panggil dari server action. Jangan menulis tabel progres langsung dari klien.
- Jangan pernah menaruh service role key di variabel `NEXT_PUBLIC_*`.
