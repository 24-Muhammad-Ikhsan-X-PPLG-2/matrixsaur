-- MATRIXSAUR — skema awal.
-- Seluruh konten dan progres aplikasi disimpan di Supabase.
--
-- Migrasi ini sengaja idempoten agar aman dijalankan di database baru maupun
-- database yang sebelumnya memakai skema demo lama. Data pengguna yang sudah
-- ada tidak dihapus.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null,
  avatar text not null default 'trix'
    check (avatar in ('trix', 'egg', 'fern', 'volcano', 'bone', 'amber')),
  xp integer not null default 0 check (xp >= 0),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  theme text not null default 'day' check (theme in ('day', 'night')),
  sound_enabled boolean not null default true,
  reduced_motion boolean not null default false,
  streak_visual text not null default 'fossil'
    check (streak_visual in ('fossil', 'mammoth')),
  updated_at timestamptz not null default now()
);

create table if not exists public.chapters (
  id integer primary key,
  slug text not null unique,
  title text not null,
  tagline text not null,
  zone text not null,
  difficulty text not null check (difficulty in ('Dasar', 'Menengah', 'Lanjut')),
  viz_operation text not null check (
    viz_operation in (
      'intro', 'equality', 'add', 'subtract', 'scalar', 'multiply',
      'transpose', 'det2', 'inverse2', 'equation', 'det3', 'inverse3'
    )
  ),
  xp_reward integer not null default 0 check (xp_reward >= 0),
  summary text[] not null default '{}',
  sort_order integer not null unique
);

create table if not exists public.lessons (
  id text primary key,
  chapter_id integer not null references public.chapters (id) on delete cascade,
  title text not null,
  minutes integer not null check (minutes > 0),
  content_blocks jsonb not null default '[]'::jsonb
    check (jsonb_typeof(content_blocks) = 'array'),
  show_viz boolean not null default false,
  sort_order integer not null,
  unique (chapter_id, sort_order)
);

create table if not exists public.quiz_questions (
  id text primary key,
  chapter_id integer not null references public.chapters (id) on delete cascade,
  question_type text not null check (question_type in ('mcq', 'numeric')),
  prompt text not null,
  math jsonb,
  options jsonb,
  explanation text not null,
  sort_order integer not null,
  unique (chapter_id, sort_order),
  check (
    (question_type = 'mcq' and jsonb_typeof(options) = 'array')
    or (question_type = 'numeric' and options is null)
  )
);

-- Kunci jawaban sengaja dipisah. Tabel ini tidak memiliki policy RLS dan
-- tidak diberi grant ke anon/authenticated. Hanya RPC security definer yang
-- boleh membacanya.
create table if not exists public.quiz_question_keys (
  question_id text primary key references public.quiz_questions (id) on delete cascade,
  answer_index integer check (answer_index >= 0),
  answer_numeric numeric,
  check ((answer_index is not null) <> (answer_numeric is not null))
);

create table if not exists public.lesson_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id text not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.chapter_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  chapter_id integer not null references public.chapters (id) on delete cascade,
  best_score smallint check (best_score between 0 and 100),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  chapter_id integer not null references public.chapters (id),
  correct_count integer not null check (correct_count >= 0),
  total_questions integer not null check (total_questions > 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  duration_sec integer not null check (duration_sec >= 0),
  submitted_at timestamptz not null default now(),
  check (correct_count <= total_questions)
);

create table if not exists public.quiz_attempt_answers (
  attempt_id uuid not null references public.quiz_attempts (id) on delete cascade,
  question_id text not null references public.quiz_questions (id),
  given_answer text not null,
  is_correct boolean not null,
  primary key (attempt_id, question_id)
);

create table if not exists public.daily_activity (
  user_id uuid not null references public.profiles (id) on delete cascade,
  activity_date date not null,
  xp integer not null default 0 check (xp >= 0),
  minutes integer not null default 0 check (minutes >= 0),
  lessons integer not null default 0 check (lessons >= 0),
  primary key (user_id, activity_date)
);

create table if not exists public.user_streaks (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  current_days integer not null default 0 check (current_days >= 0),
  longest_days integer not null default 0 check (longest_days >= current_days),
  last_study_date date
);

create table if not exists public.xp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount integer not null check (amount > 0),
  source_type text not null check (
    source_type in ('lesson', 'quiz', 'chapter_bonus', 'other')
  ),
  source_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null check (
    icon in ('footprint', 'flame', 'bone', 'egg', 'star', 'volcano', 'brush', 'crown')
  ),
  sort_order integer not null default 0
);

-- Kolom baru untuk database yang dibuat dari skema demo lama.
alter table public.achievements
  add column if not exists sort_order integer not null default 0;

create table if not exists public.user_achievements (
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table if not exists public.dinosaurs (
  id text primary key,
  species text not null check (
    species in ('trice', 'stego', 'bronto', 'ptero', 'raptor', 'ankylo', 'spino', 'rex')
  ),
  name text not null,
  nickname text not null,
  rarity text not null check (rarity in ('Umum', 'Langka', 'Legendaris')),
  era text not null,
  color text not null,
  accent text not null,
  description text not null,
  matrix_power text not null,
  sort_order integer not null unique
);

create table if not exists public.user_dinosaurs (
  user_id uuid not null references public.profiles (id) on delete cascade,
  dinosaur_id text not null references public.dinosaurs (id),
  acquired_at timestamptz not null default now(),
  primary key (user_id, dinosaur_id)
);

create table if not exists public.dinosaur_eggs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  dinosaur_id text not null references public.dinosaurs (id),
  progress integer not null default 0 check (progress >= 0),
  target integer not null check (target > 0),
  status text not null default 'incubating' check (status in ('incubating', 'hatched')),
  created_at timestamptz not null default now(),
  hatched_at timestamptz,
  check (progress <= target),
  check ((status = 'hatched') = (hatched_at is not null))
);

create unique index if not exists dinosaur_eggs_one_active_per_user
  on public.dinosaur_eggs (user_id)
  where status = 'incubating';

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('lesson', 'quiz', 'hatch', 'achievement', 'streak')),
  title text not null,
  detail text not null default '',
  happened_at timestamptz not null default now()
);

create index if not exists lessons_chapter_order_idx
  on public.lessons (chapter_id, sort_order);
create index if not exists quiz_questions_chapter_order_idx
  on public.quiz_questions (chapter_id, sort_order);
create index if not exists quiz_attempts_user_submitted_idx
  on public.quiz_attempts (user_id, submitted_at desc);
create index if not exists activity_logs_user_happened_idx
  on public.activity_logs (user_id, happened_at desc);
create index if not exists xp_transactions_user_created_idx
  on public.xp_transactions (user_id, created_at desc);
create index if not exists daily_activity_user_date_idx
  on public.daily_activity (user_id, activity_date desc);

-- updated_at otomatis.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

drop trigger if exists chapter_progress_set_updated_at on public.chapter_progress;
create trigger chapter_progress_set_updated_at
  before update on public.chapter_progress
  for each row execute function public.set_updated_at();

-- RLS.
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.chapter_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;
alter table public.daily_activity enable row level security;
alter table public.user_streaks enable row level security;
alter table public.xp_transactions enable row level security;
alter table public.user_achievements enable row level security;
alter table public.user_dinosaurs enable row level security;
alter table public.dinosaur_eggs enable row level security;
alter table public.activity_logs enable row level security;
alter table public.chapters enable row level security;
alter table public.lessons enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_question_keys enable row level security;
alter table public.achievements enable row level security;
alter table public.dinosaurs enable row level security;

-- Mulai dari keadaan bersih agar migrasi bisa diulang tanpa policy ganda.
drop policy if exists "chapters are readable" on public.chapters;
drop policy if exists "lessons are readable" on public.lessons;
drop policy if exists "quiz questions are readable" on public.quiz_questions;
drop policy if exists "achievements are readable" on public.achievements;
drop policy if exists "dinosaurs are readable" on public.dinosaurs;
drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "users manage own settings" on public.user_settings;
drop policy if exists "users read own settings" on public.user_settings;
drop policy if exists "users update own settings" on public.user_settings;
drop policy if exists "users read own lesson progress" on public.lesson_progress;
drop policy if exists "users read own chapter progress" on public.chapter_progress;
drop policy if exists "users read own quiz attempts" on public.quiz_attempts;
drop policy if exists "users read own quiz answers" on public.quiz_attempt_answers;
drop policy if exists "users read own daily activity" on public.daily_activity;
drop policy if exists "users read own streak" on public.user_streaks;
drop policy if exists "users read own xp transactions" on public.xp_transactions;
drop policy if exists "users read own achievements" on public.user_achievements;
drop policy if exists "users read own dinosaurs" on public.user_dinosaurs;
drop policy if exists "users read own eggs" on public.dinosaur_eggs;
drop policy if exists "users read own activity logs" on public.activity_logs;

-- Katalog publik.
create policy "chapters are readable" on public.chapters
  for select to anon, authenticated using (true);
create policy "lessons are readable" on public.lessons
  for select to anon, authenticated using (true);
create policy "quiz questions are readable" on public.quiz_questions
  for select to anon, authenticated using (true);
create policy "achievements are readable" on public.achievements
  for select to anon, authenticated using (true);
create policy "dinosaurs are readable" on public.dinosaurs
  for select to anon, authenticated using (true);

-- Data privat: hanya baris milik pengguna.
create policy "users read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "users update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "users read own settings" on public.user_settings
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "users update own settings" on public.user_settings
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users read own lesson progress" on public.lesson_progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "users read own chapter progress" on public.chapter_progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "users read own quiz attempts" on public.quiz_attempts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "users read own quiz answers" on public.quiz_attempt_answers
  for select to authenticated using (
    exists (
      select 1 from public.quiz_attempts a
      where a.id = attempt_id and a.user_id = (select auth.uid())
    )
  );
create policy "users read own daily activity" on public.daily_activity
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "users read own streak" on public.user_streaks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "users read own xp transactions" on public.xp_transactions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "users read own achievements" on public.user_achievements
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "users read own dinosaurs" on public.user_dinosaurs
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "users read own eggs" on public.dinosaur_eggs
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "users read own activity logs" on public.activity_logs
  for select to authenticated using ((select auth.uid()) = user_id);

-- Hak akses eksplisit. Semua penulisan progres/reward dilakukan lewat RPC.
revoke all on public.chapters from anon, authenticated;
revoke all on public.lessons from anon, authenticated;
revoke all on public.quiz_questions from anon, authenticated;
revoke all on public.quiz_question_keys from anon, authenticated;
revoke all on public.achievements from anon, authenticated;
revoke all on public.dinosaurs from anon, authenticated;
revoke all on public.profiles from anon, authenticated;
revoke all on public.user_settings from anon, authenticated;
revoke all on public.lesson_progress from anon, authenticated;
revoke all on public.chapter_progress from anon, authenticated;
revoke all on public.quiz_attempts from anon, authenticated;
revoke all on public.quiz_attempt_answers from anon, authenticated;
revoke all on public.daily_activity from anon, authenticated;
revoke all on public.user_streaks from anon, authenticated;
revoke all on public.xp_transactions from anon, authenticated;
revoke all on public.user_achievements from anon, authenticated;
revoke all on public.user_dinosaurs from anon, authenticated;
revoke all on public.dinosaur_eggs from anon, authenticated;
revoke all on public.activity_logs from anon, authenticated;

grant select on public.chapters to anon, authenticated;
grant select on public.lessons to anon, authenticated;
grant select on public.quiz_questions to anon, authenticated;
grant select on public.achievements to anon, authenticated;
grant select on public.dinosaurs to anon, authenticated;

grant select on public.profiles to authenticated;
grant update (username, display_name, avatar, updated_at)
  on public.profiles to authenticated;

grant select on public.user_settings to authenticated;
grant update (theme, sound_enabled, reduced_motion, streak_visual)
  on public.user_settings to authenticated;

grant select on public.lesson_progress to authenticated;
grant select on public.chapter_progress to authenticated;
grant select on public.quiz_attempts to authenticated;
grant select on public.quiz_attempt_answers to authenticated;
grant select on public.daily_activity to authenticated;
grant select on public.user_streaks to authenticated;
grant select on public.xp_transactions to authenticated;
grant select on public.user_achievements to authenticated;
grant select on public.user_dinosaurs to authenticated;
grant select on public.dinosaur_eggs to authenticated;
grant select on public.activity_logs to authenticated;
