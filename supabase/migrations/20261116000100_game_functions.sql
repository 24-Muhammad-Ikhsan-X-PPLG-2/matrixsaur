-- MATRIXSAUR — aturan permainan, RPC transaksi, dan trigger pengguna baru.
--
-- Semua penulisan progres, XP, streak, telur, dan lencana dilakukan di sini.
-- Klien tidak pernah menulis tabel progres secara langsung.

-- ---------------------------------------------------------------------------
-- Fungsi internal
-- ---------------------------------------------------------------------------

create or replace function public._jakarta_today()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Asia/Jakarta')::date;
$$;

create or replace function public._award_xp(
  p_user uuid,
  p_amount integer,
  p_source_type text,
  p_source_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_amount <= 0 then
    return;
  end if;

  insert into public.xp_transactions (user_id, amount, source_type, source_id)
  values (p_user, p_amount, p_source_type, p_source_id);

  update public.profiles
  set xp = xp + p_amount
  where id = p_user;
end;
$$;

create or replace function public._record_study_day(
  p_user uuid,
  p_xp integer,
  p_minutes integer,
  p_lessons integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := public._jakarta_today();
  v_last date;
  v_current integer;
  v_longest integer;
begin
  insert into public.daily_activity (
    user_id,
    activity_date,
    xp,
    minutes,
    lessons
  )
  values (
    p_user,
    v_today,
    greatest(p_xp, 0),
    greatest(p_minutes, 0),
    greatest(p_lessons, 0)
  )
  on conflict (user_id, activity_date) do update
  set xp = public.daily_activity.xp + excluded.xp,
      minutes = public.daily_activity.minutes + excluded.minutes,
      lessons = public.daily_activity.lessons + excluded.lessons;

  select current_days, longest_days, last_study_date
  into v_current, v_longest, v_last
  from public.user_streaks
  where user_id = p_user
  for update;

  if not found then
    insert into public.user_streaks (
      user_id,
      current_days,
      longest_days,
      last_study_date
    )
    values (p_user, 1, 1, v_today);
    return;
  end if;

  if v_last is distinct from v_today then
    if v_last = v_today - 1 then
      v_current := v_current + 1;
    else
      v_current := 1;
    end if;

    v_longest := greatest(v_longest, v_current);

    update public.user_streaks
    set current_days = v_current,
        longest_days = v_longest,
        last_study_date = v_today
    where user_id = p_user;
  end if;
end;
$$;

create or replace function public._feed_egg(p_user uuid, p_amount integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_amount <= 0 then
    return;
  end if;

  update public.dinosaur_eggs
  set progress = least(target, progress + p_amount)
  where user_id = p_user
    and status = 'incubating';
end;
$$;

create or replace function public._log_activity(
  p_user uuid,
  p_kind text,
  p_title text,
  p_detail text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.activity_logs (user_id, kind, title, detail)
  values (p_user, p_kind, p_title, coalesce(p_detail, ''));
end;
$$;

create or replace function public._sync_achievements(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_achievement record;
  v_earned boolean;
  v_completed integer;
  v_owned integer;
  v_total_chapters integer;
begin
  select count(*)
  into v_completed
  from public.chapter_progress
  where user_id = p_user and completed;

  select count(*)
  into v_owned
  from public.user_dinosaurs
  where user_id = p_user;

  select count(*)
  into v_total_chapters
  from public.chapters;

  for v_achievement in
    select id, title, description
    from public.achievements
    order by sort_order, id
  loop
    v_earned := case v_achievement.id
      when 'ach-first-step' then exists (
        select 1 from public.lesson_progress where user_id = p_user
      )
      when 'ach-streak-3' then exists (
        select 1 from public.user_streaks
        where user_id = p_user and current_days >= 3
      )
      when 'ach-streak-7' then exists (
        select 1 from public.user_streaks
        where user_id = p_user and current_days >= 7
      )
      when 'ach-perfect' then exists (
        select 1 from public.quiz_attempts
        where user_id = p_user and correct_count = total_questions
      )
      when 'ach-hatch' then v_owned >= 1
      when 'ach-half' then v_completed >= 6
      when 'ach-collector' then v_owned >= 5
      when 'ach-master' then v_total_chapters > 0
        and v_completed >= v_total_chapters
      else false
    end;

    if not v_earned then
      continue;
    end if;

    insert into public.user_achievements (user_id, achievement_id)
    values (p_user, v_achievement.id)
    on conflict (user_id, achievement_id) do nothing;

    if found then
      perform public._log_activity(
        p_user,
        'achievement',
        'Lencana ' || v_achievement.title,
        v_achievement.description
      );
    end if;
  end loop;
end;
$$;

create or replace function public._ensure_user_state(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_next_dinosaur text;
  v_username text;
  v_display_name text;
begin
  -- Pulihkan profil bila pengguna auth sudah ada tetapi profilnya belum dibuat.
  if not exists (select 1 from public.profiles where id = p_user) then
    select
      lower(coalesce(nullif(u.raw_user_meta_data ->> 'username', ''), '')),
      coalesce(nullif(u.raw_user_meta_data ->> 'display_name', ''), 'Penjelajah')
    into v_username, v_display_name
    from auth.users u
    where u.id = p_user;

    v_username := regexp_replace(coalesce(v_username, ''), '[^a-z0-9_]', '', 'g');

    if length(v_username) < 3 then
      v_username := 'player-' || substr(p_user::text, 1, 8);
    end if;

    if exists (select 1 from public.profiles where username = v_username) then
      v_username := v_username || '-' || substr(p_user::text, 1, 4);
    end if;

    insert into public.profiles (id, username, display_name)
    values (p_user, v_username, coalesce(v_display_name, 'Penjelajah'))
    on conflict (id) do nothing;
  end if;

  insert into public.user_settings (user_id)
  values (p_user)
  on conflict (user_id) do nothing;

  insert into public.user_streaks (user_id)
  values (p_user)
  on conflict (user_id) do nothing;

  if not exists (
    select 1
    from public.dinosaur_eggs
    where user_id = p_user and status = 'incubating'
  ) then
    select d.id
    into v_next_dinosaur
    from public.dinosaurs d
    where not exists (
      select 1
      from public.user_dinosaurs ud
      where ud.user_id = p_user and ud.dinosaur_id = d.id
    )
    and not exists (
      select 1
      from public.dinosaur_eggs e
      where e.user_id = p_user and e.dinosaur_id = d.id
    )
    order by d.sort_order
    limit 1;

    if v_next_dinosaur is not null then
      insert into public.dinosaur_eggs (
        user_id,
        dinosaur_id,
        progress,
        target
      )
      values (p_user, v_next_dinosaur, 0, 100);
    end if;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Pengguna baru
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public._ensure_user_state(new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RPC untuk pengguna terautentikasi
-- ---------------------------------------------------------------------------

create or replace function public.ensure_user_state()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  perform public._ensure_user_state(auth.uid());
end;
$$;

create or replace function public.complete_lesson(
  p_chapter_id integer,
  p_lesson_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_title text;
  v_minutes integer;
  v_chapter_id integer;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  perform public._ensure_user_state(v_user);

  select l.title, l.minutes, l.chapter_id
  into v_title, v_minutes, v_chapter_id
  from public.lessons l
  where l.id = p_lesson_id;

  if v_chapter_id is null or v_chapter_id <> p_chapter_id then
    raise exception 'lesson not found';
  end if;

  insert into public.lesson_progress (user_id, lesson_id)
  values (v_user, p_lesson_id)
  on conflict (user_id, lesson_id) do nothing;

  if not found then
    return jsonb_build_object(
      'alreadyCompleted', true,
      'xpAwarded', 0,
      'eggWarmed', 0
    );
  end if;

  insert into public.chapter_progress (user_id, chapter_id, completed)
  values (v_user, p_chapter_id, false)
  on conflict (user_id, chapter_id) do nothing;

  perform public._award_xp(v_user, 15, 'lesson', p_lesson_id);
  perform public._record_study_day(v_user, 15, v_minutes, 1);
  perform public._feed_egg(v_user, 10);
  perform public._log_activity(
    v_user,
    'lesson',
    v_title,
    'Chapter ' || p_chapter_id || ' · +15 XP'
  );
  perform public._sync_achievements(v_user);

  return jsonb_build_object(
    'alreadyCompleted', false,
    'xpAwarded', 15,
    'eggWarmed', 10
  );
end;
$$;

create or replace function public.check_quiz_answer(
  p_question_id text,
  p_given text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_type text;
  v_options jsonb;
  v_index integer;
  v_numeric numeric;
  v_correct boolean := false;
  v_text text := '';
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select q.question_type, q.options, k.answer_index, k.answer_numeric
  into v_type, v_options, v_index, v_numeric
  from public.quiz_questions q
  join public.quiz_question_keys k on k.question_id = q.id
  where q.id = p_question_id;

  if v_type is null then
    raise exception 'question not found';
  end if;

  if v_type = 'mcq' then
    if p_given ~ '^[0-9]+$' then
      v_correct := p_given::integer = v_index;
    end if;
    v_text := coalesce(v_options ->> v_index, '');
  else
    if p_given ~ '^-?[0-9]+([.,][0-9]+)?$' then
      v_correct := abs(
        replace(p_given, ',', '.')::numeric - v_numeric
      ) < 0.000000001;
    end if;
    v_text := trim_scale(v_numeric)::text;
  end if;

  return jsonb_build_object(
    'isCorrect', v_correct,
    'correctAnswerText', v_text,
    'correctOptionIndex', case when v_type = 'mcq' then v_index else null end
  );
end;
$$;

create or replace function public.submit_quiz(
  p_chapter_id integer,
  p_answers jsonb,
  p_duration_sec integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_chapter_title text;
  v_total integer;
  v_correct integer := 0;
  v_percent integer;
  v_passed boolean;
  v_base_xp integer;
  v_bonus integer := 0;
  v_was_completed boolean := false;
  v_attempt_id uuid;
  v_question record;
  v_given text;
  v_is_correct boolean;
  v_egg_progress integer;
  v_egg_target integer;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'array' then
    raise exception 'answers must be an array';
  end if;

  perform public._ensure_user_state(v_user);

  select title into v_chapter_title
  from public.chapters
  where id = p_chapter_id;

  if v_chapter_title is null then
    raise exception 'chapter not found';
  end if;

  select count(*) into v_total
  from public.quiz_questions
  where chapter_id = p_chapter_id;

  if v_total = 0 then
    raise exception 'chapter has no quiz';
  end if;

  select cp.completed into v_was_completed
  from public.chapter_progress cp
  where cp.user_id = v_user and cp.chapter_id = p_chapter_id;

  v_was_completed := coalesce(v_was_completed, false);

  insert into public.quiz_attempts (
    user_id,
    chapter_id,
    correct_count,
    total_questions,
    xp_earned,
    duration_sec
  )
  values (
    v_user,
    p_chapter_id,
    0,
    v_total,
    0,
    greatest(p_duration_sec, 0)
  )
  returning id into v_attempt_id;

  for v_question in
    select q.id, q.question_type, q.options, k.answer_index, k.answer_numeric
    from public.quiz_questions q
    join public.quiz_question_keys k on k.question_id = q.id
    where q.chapter_id = p_chapter_id
    order by q.sort_order
  loop
    select item ->> 'given'
    into v_given
    from jsonb_array_elements(p_answers) as item
    where item ->> 'questionId' = v_question.id
    limit 1;

    v_given := coalesce(v_given, '');

    if v_question.question_type = 'mcq' then
      v_is_correct := v_given ~ '^[0-9]+$'
        and v_given::integer = v_question.answer_index;
    else
      v_is_correct := false;
      if v_given ~ '^-?[0-9]+([.,][0-9]+)?$' then
        v_is_correct := abs(
          replace(v_given, ',', '.')::numeric - v_question.answer_numeric
        ) < 0.000000001;
      end if;
    end if;

    if v_is_correct then
      v_correct := v_correct + 1;
    end if;

    insert into public.quiz_attempt_answers (
      attempt_id,
      question_id,
      given_answer,
      is_correct
    )
    values (
      v_attempt_id,
      v_question.id,
      left(v_given, 500),
      v_is_correct
    );
  end loop;

  v_percent := round(v_correct::numeric * 100 / v_total);
  v_passed := v_percent >= 60;
  v_base_xp := v_correct * 10 + case when v_correct = v_total then 20 else 0 end;

  if v_passed and not v_was_completed then
    select xp_reward into v_bonus
    from public.chapters
    where id = p_chapter_id;
  end if;

  v_bonus := coalesce(v_bonus, 0);

  update public.quiz_attempts
  set correct_count = v_correct,
      xp_earned = v_base_xp + v_bonus
  where id = v_attempt_id;

  insert into public.chapter_progress (user_id, chapter_id, best_score, completed)
  values (v_user, p_chapter_id, v_percent, v_passed)
  on conflict (user_id, chapter_id) do update
  set best_score = greatest(
        coalesce(public.chapter_progress.best_score, 0),
        excluded.best_score
      ),
      completed = public.chapter_progress.completed or excluded.completed;

  perform public._award_xp(v_user, v_base_xp, 'quiz', v_attempt_id::text);

  if v_bonus > 0 then
    perform public._award_xp(
      v_user,
      v_bonus,
      'chapter_bonus',
      p_chapter_id::text
    );
  end if;

  perform public._record_study_day(
    v_user,
    v_base_xp + v_bonus,
    greatest(1, round(p_duration_sec::numeric / 60)::integer),
    0
  );
  perform public._feed_egg(v_user, v_correct * 6);
  perform public._log_activity(
    v_user,
    'quiz',
    'Latihan ' || v_chapter_title,
    v_correct || ' dari ' || v_total || ' benar · +'
      || (v_base_xp + v_bonus) || ' XP'
  );
  perform public._sync_achievements(v_user);

  select prefix.progress, prefix.target
  into v_egg_progress, v_egg_target
  from public.dinosaur_eggs prefix
  where prefix.user_id = v_user and prefix.status = 'incubating';

  return jsonb_build_object(
    'attemptId', v_attempt_id,
    'correct', v_correct,
    'total', v_total,
    'percent', v_percent,
    'passed', v_passed,
    'baseXp', v_base_xp,
    'bonus', v_bonus,
    'xpEarned', v_base_xp + v_bonus,
    'alreadyCompleted', v_was_completed,
    'eggWarmed', v_correct * 6,
    'eggProgress', v_egg_progress,
    'eggTarget', v_egg_target,
    'eggReady', coalesce(v_egg_progress >= v_egg_target, false)
  );
end;
$$;

create or replace function public.hatch_egg()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_egg record;
  v_hatched integer;
  v_next_dinosaur text;
  v_next_target integer;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  perform public._ensure_user_state(v_user);

  select id, dinosaur_id, progress, target
  into v_egg
  from public.dinosaur_eggs
  where user_id = v_user and status = 'incubating'
  for update;

  if not found then
    return jsonb_build_object(
      'hatched', false,
      'reason', 'no-active-egg'
    );
  end if;

  if v_egg.progress < v_egg.target then
    return jsonb_build_object(
      'hatched', false,
      'reason', 'not-ready'
    );
  end if;

  update public.dinosaur_eggs
  set status = 'hatched',
      hatched_at = now()
  where id = v_egg.id;

  insert into public.user_dinosaurs (user_id, dinosaur_id)
  values (v_user, v_egg.dinosaur_id)
  on conflict (user_id, dinosaur_id) do nothing;

  select count(*)
  into v_hatched
  from public.dinosaur_eggs
  where user_id = v_user and status = 'hatched';

  select d.id
  into v_next_dinosaur
  from public.dinosaurs d
  where not exists (
    select 1
    from public.user_dinosaurs ud
    where ud.user_id = v_user and ud.dinosaur_id = d.id
  )
  order by d.sort_order
  limit 1;

  if v_next_dinosaur is not null then
    v_next_target := 100 + v_hatched * 20;

    insert into public.dinosaur_eggs (
      user_id,
      dinosaur_id,
      progress,
      target
    )
    values (v_user, v_next_dinosaur, 0, v_next_target);
  end if;

  perform public._log_activity(
    v_user,
    'hatch',
    'Telur menetas',
    'Dinosaurus baru bergabung ke koleksimu'
  );
  perform public._sync_achievements(v_user);

  return jsonb_build_object(
    'hatched', true,
    'dinosaurId', v_egg.dinosaur_id,
    'nextDinosaurId', v_next_dinosaur,
    'nextTarget', v_next_target
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Backfill pengguna lama
-- ---------------------------------------------------------------------------

do $$
declare
  v_profile record;
begin
  for v_profile in select id from public.profiles loop
    perform public._ensure_user_state(v_profile.id);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Hak eksekusi
-- ---------------------------------------------------------------------------

revoke all on function public._jakarta_today() from public, anon, authenticated;
revoke all on function public._award_xp(uuid, integer, text, text) from public, anon, authenticated;
revoke all on function public._record_study_day(uuid, integer, integer, integer) from public, anon, authenticated;
revoke all on function public._feed_egg(uuid, integer) from public, anon, authenticated;
revoke all on function public._log_activity(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public._sync_achievements(uuid) from public, anon, authenticated;
revoke all on function public._ensure_user_state(uuid) from public, anon, authenticated;

revoke all on function public.ensure_user_state() from public, anon, authenticated;
revoke all on function public.complete_lesson(integer, text) from public, anon, authenticated;
revoke all on function public.check_quiz_answer(text, text) from public, anon, authenticated;
revoke all on function public.submit_quiz(integer, jsonb, integer) from public, anon, authenticated;
revoke all on function public.hatch_egg() from public, anon, authenticated;

grant execute on function public.ensure_user_state() to authenticated;
grant execute on function public.complete_lesson(integer, text) to authenticated;
grant execute on function public.check_quiz_answer(text, text) to authenticated;
grant execute on function public.submit_quiz(integer, jsonb, integer) to authenticated;
grant execute on function public.hatch_egg() to authenticated;
