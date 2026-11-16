# MATRIXSAUR

<p align="center">
  <strong>Belajar matriks, satu petualangan pada satu waktu.</strong><br />
  Aplikasi belajar interaktif yang mengubah materi matematika menjadi perjalanan
  bersama dinosaurus, tantangan, dan progres belajar yang tersimpan.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4.5-000000?logo=nextdotjs&logoColor=white" alt="Next.js 16.4.5" />
  <img src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Bun-1.4.2-000000?logo=bun&logoColor=white" alt="Bun 1.4.2" />
</p>

## Tentang proyek

MATRIXSAUR adalah aplikasi edukasi untuk mempelajari matriks melalui kurikulum
bertahap dan pengalaman bergaya petualangan. Pengguna dapat mempelajari konsep,
melihat visualisasi operasi matriks, mengerjakan latihan, serta melacak
perkembangan belajarnya.

Aplikasi menggunakan Supabase untuk autentikasi dan penyimpanan data. Progres
pengguna, hasil latihan, XP, streak, koleksi, dan pencapaian tersimpan per akun.

## Fitur

- **Akun pengguna** — daftar, masuk, konfirmasi email, dan profil.
- **Kurikulum matriks** — chapter dan materi belajar dengan contoh, rumus, dan
  visualisasi interaktif.
- **Latihan dan kuis** — soal pilihan ganda dan numerik dengan pemeriksaan
  jawaban melalui backend.
- **Progres belajar** — pantau chapter, hasil kuis, aktivitas harian, XP, dan
  streak.
- **Gamifikasi** — level, telur dinosaurus, koleksi, dan lencana pencapaian.
- **Preferensi akun** — avatar, tema, suara, aksesibilitas gerak, dan tampilan
  streak.
- **Proteksi data** — Row Level Security (RLS) membatasi data pribadi ke
  pemiliknya; perubahan progres dilakukan melalui fungsi backend.

## Screenshot

Screenshot produk belum disertakan. Untuk melengkapi README, ambil screenshot
halaman berikut:

1. **Landing page** — tampilan utama dan pengenalan aplikasi.
2. **Dashboard** — ringkasan progres, XP, streak, dan misi berikutnya.
3. **Peta belajar** — daftar chapter beserta status progresnya.
4. **Detail materi** — materi matriks dan visualisasi interaktif.
5. **Halaman latihan** — tampilan soal dan interaksi menjawab.
6. **Halaman progres** — statistik belajar, aktivitas, dan pencapaian.
7. **Halaman koleksi** — telur dan dinosaurus yang telah dikumpulkan.
8. **Halaman profil** — informasi akun dan preferensi pengguna.

Screenshot login dan pendaftaran bersifat opsional. Setelah gambar tersedia,
simpan di folder `docs/screenshots/` lalu tambahkan gambar yang dipilih di
bagian ini.

## Teknologi

- [Next.js](https://nextjs.org/) 16 dengan App Router
- [React](https://react.dev/) 19 dan [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/) Auth, PostgreSQL, RLS, dan RPC
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Bun](https://bun.sh/) sebagai package manager dan runtime script

## Menjalankan secara lokal

### Prasyarat

- Bun 1.4.2 atau versi yang kompatibel
- Project Supabase
- Supabase CLI untuk menerapkan migrasi melalui terminal

### Instalasi

1. Clone repository dan masuk ke direktori proyek.
2. Pasang dependensi:

   ```bash
   bun install
   ```

3. Salin `.env.example` menjadi `.env.local`, lalu isi variabel yang diperlukan:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   `SUPABASE_SERVICE_ROLE_KEY` hanya digunakan oleh seeder. Jangan pernah
   menggunakan awalan `NEXT_PUBLIC_` untuk secret key atau memasukkannya ke
   source control.

4. Hubungkan Supabase CLI ke project, lalu terapkan migrasi:

   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   supabase db push
   ```

   Alternatifnya, jalankan kedua file SQL di `supabase/migrations/` secara
   berurutan melalui Supabase SQL Editor.

5. Isi katalog kurikulum, soal, dinosaurus, dan lencana:

   ```bash
   bun run seed
   ```

6. Di Supabase Dashboard, buka **Authentication → URL Configuration**:
   - Atur Site URL ke `http://localhost:3000`.
   - Tambahkan `http://localhost:3000/auth/callback` ke daftar Redirect URLs.

7. Jalankan aplikasi:

   ```bash
   bun dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Perintah

| Perintah | Keterangan |
| --- | --- |
| `bun dev` | Menjalankan server pengembangan |
| `bun run build` | Membuat build produksi |
| `bun start` | Menjalankan build produksi |
| `bun run typecheck` | Memeriksa tipe TypeScript |
| `bun run lint` | Menjalankan ESLint |
| `bun run seed` | Mengisi katalog Supabase; memerlukan service role key |

## Struktur proyek

```text
src/
├── app/                 # Halaman dan route aplikasi
├── components/          # Komponen UI, materi, kuis, dan gamifikasi
├── data/                # Sumber konten yang dipakai oleh seeder
├── features/screens/    # Tampilan tiap fitur
├── lib/
│   ├── actions/          # Server actions untuk operasi aplikasi
│   ├── data/             # Pengambilan dan pemetaan data halaman
│   └── supabase/         # Konfigurasi client Supabase
└── proxy.ts              # Pemeriksaan sesi dan proteksi route

scripts/                 # Seeder konten
supabase/
├── migrations/           # Skema, kebijakan akses, dan fungsi database
└── config.toml           # Konfigurasi Supabase lokal
```

## Keamanan dan data

- Klien aplikasi memakai Supabase publishable key.
- Service role/secret key hanya diperlukan saat menjalankan seeder dan tidak
  boleh diekspos ke browser.
- Kunci jawaban disimpan terpisah dari data soal dan tidak dikirim ke klien.
- Pemeriksaan jawaban, pencatatan hasil kuis, serta pemberian progres/reward
  dijalankan melalui RPC di backend.
- Kebijakan RLS membatasi data akun agar hanya dapat dibaca oleh pemiliknya.

## Kontributor

| Nama | Kontribusi |
| --- | --- |
| **Ikhsan** | Backend |
| **Yasqi** | Frontend |
| **Riki** | Ide aplikasi |
