/**
 * Seeder konten MATRIXSAUR.
 *
 * Menyalin seluruh chapter, materi, soal, kunci jawaban, dinosaurus, dan
 * lencana dari src/data ke Supabase. Jalankan dengan kunci service role:
 *
 *   bun run seed
 *
 * Variabel lingkungan yang dibutuhkan:
 *   NEXT_PUBLIC_SUPABASE_URL (atau NEXT_PUBLIC_SUPABASE_PROJECT_URL)
 *   SUPABASE_SERVICE_ROLE_KEY (atau SUPABASE_SECRET_KEY)
 *
 * Script ini hanya menulis katalog konten. Data pengguna tidak disentuh.
 */
import { createClient } from "@supabase/supabase-js";
import { CHAPTERS } from "../src/data/chapters";
import { DINOSAURS, ACHIEVEMENTS } from "../src/data/dinosaurs";
import { QUESTIONS } from "../src/data/quizzes";
import type { SeedQuizQuestion } from "../src/types";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

function requireEnvironment() {
  if (!url) {
    throw new Error(
      "URL Supabase belum diatur. Isi NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_PROJECT_URL.",
    );
  }

  if (!serviceKey) {
    throw new Error(
      "Kunci service role belum diatur. Isi SUPABASE_SERVICE_ROLE_KEY (hanya untuk seeder, jangan pakai awalan NEXT_PUBLIC_).",
    );
  }

  if (
    serviceKey.startsWith("sb_publishable_") ||
    serviceKey === process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    throw new Error(
      "Kunci yang diberikan adalah publishable key. Seeder membutuhkan service role/secret key agar dapat menulis katalog.",
    );
  }
}

function validateContent() {
  const chapterIds = new Set<number>();
  const lessonIds = new Set<string>();

  for (const chapter of CHAPTERS) {
    if (chapterIds.has(chapter.id)) {
      throw new Error(`ID chapter ganda: ${chapter.id}`);
    }
    chapterIds.add(chapter.id);

    for (const lesson of chapter.lessons) {
      if (lesson.chapterId !== chapter.id) {
        throw new Error(
          `Materi ${lesson.id} memiliki chapterId ${lesson.chapterId}, seharusnya ${chapter.id}.`,
        );
      }
      if (lessonIds.has(lesson.id)) {
        throw new Error(`ID materi ganda: ${lesson.id}`);
      }
      lessonIds.add(lesson.id);
    }
  }

  const questionIds = new Set<string>();

  for (const question of QUESTIONS) {
    if (!chapterIds.has(question.chapterId)) {
      throw new Error(
        `Soal ${question.id} merujuk chapter ${question.chapterId} yang tidak ada.`,
      );
    }
    if (questionIds.has(question.id)) {
      throw new Error(`ID soal ganda: ${question.id}`);
    }
    questionIds.add(question.id);

    if (question.type === "mcq") {
      if (!question.options?.length) {
        throw new Error(`Soal ${question.id} tidak memiliki pilihan jawaban.`);
      }
      if (
        question.answerIndex === undefined ||
        question.answerIndex < 0 ||
        question.answerIndex >= question.options.length
      ) {
        throw new Error(`Kunci jawaban soal ${question.id} tidak valid.`);
      }
    } else if (!Number.isFinite(question.answer)) {
      throw new Error(`Jawaban numerik soal ${question.id} tidak valid.`);
    }
  }

  return { chapterIds, questionIds };
}

type Row = Record<string, unknown>;

/**
 * Bentuk minimal klien Supabase yang dibutuhkan seeder. Tabel tidak memiliki
 * tipe database tergenerasi, jadi kontrak sempit ini menjaga pemanggilan tetap
 * jelas tanpa bergantung pada tipe internal pustaka.
 */
interface SeedClient {
  from(table: string): {
    upsert(
      rows: Row[],
      options: { onConflict: string },
    ): Promise<{ error: { message: string } | null }>;
  };
}

function buildRows() {
  const chapterRows: Row[] = CHAPTERS.map((chapter, index) => ({
    id: chapter.id,
    slug: chapter.slug,
    title: chapter.title,
    tagline: chapter.tagline,
    zone: chapter.zone,
    difficulty: chapter.difficulty,
    viz_operation: chapter.viz,
    xp_reward: chapter.xpReward,
    summary: chapter.summary,
    sort_order: index + 1,
  }));

  const lessonRows: Row[] = CHAPTERS.flatMap((chapter) =>
    chapter.lessons.map((lesson, index) => ({
      id: lesson.id,
      chapter_id: chapter.id,
      title: lesson.title,
      minutes: lesson.minutes,
      content_blocks: lesson.blocks,
      show_viz: lesson.showViz ?? false,
      sort_order: index + 1,
    })),
  );

  const questionOrder = new Map<number, number>();
  const questionRows: Row[] = QUESTIONS.map((question) => {
    const order = (questionOrder.get(question.chapterId) ?? 0) + 1;
    questionOrder.set(question.chapterId, order);

    return {
      id: question.id,
      chapter_id: question.chapterId,
      question_type: question.type,
      prompt: question.prompt,
      math: question.math ?? null,
      options: question.options ?? null,
      explanation: question.explanation,
      sort_order: order,
    };
  });

  const keyRows: Row[] = QUESTIONS.map((question: SeedQuizQuestion) => ({
    question_id: question.id,
    answer_index: question.type === "mcq" ? question.answerIndex : null,
    answer_numeric: question.type === "numeric" ? question.answer : null,
  }));

  const dinosaurRows: Row[] = DINOSAURS.map((dinosaur, index) => ({
    id: dinosaur.id,
    species: dinosaur.species,
    name: dinosaur.name,
    nickname: dinosaur.nickname,
    rarity: dinosaur.rarity,
    era: dinosaur.era,
    color: dinosaur.color,
    accent: dinosaur.accent,
    description: dinosaur.description,
    matrix_power: dinosaur.matrixPower,
    sort_order: index + 1,
  }));

  const achievementRows: Row[] = ACHIEVEMENTS.map(
    (achievement, index) => ({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      sort_order: index + 1,
    }),
  );

  return {
    chapters: chapterRows,
    lessons: lessonRows,
    questions: questionRows,
    keys: keyRows,
    dinosaurs: dinosaurRows,
    achievements: achievementRows,
  };
}

async function upsertRows(
  client: SeedClient,
  table: string,
  rows: Row[],
  onConflict: string,
) {
  const chunkSize = 200;

  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    const { error } = await client.from(table).upsert(chunk, { onConflict });

    if (error) {
      throw new Error(
        `${table} gagal pada baris ${index + 1}-${index + chunk.length}: ${error.message}`,
      );
    }

    console.log(
      `  ${table.padEnd(12)} ${Math.min(index + chunkSize, rows.length)}/${rows.length}`,
    );
  }
}

async function main() {
  requireEnvironment();
  validateContent();

  const rows = buildRows();
  const client = createClient(url!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  }) as unknown as SeedClient;

  console.log("Menanam konten MATRIXSAUR ke Supabase...");
  console.log(
    `  ${CHAPTERS.length} chapter · ${rows.lessons.length} materi · ${rows.questions.length} soal · ${rows.dinosaurs.length} dinosaurus · ${rows.achievements.length} lencana`,
  );

  // Urutan penting agar foreign key selalu terpenuhi.
  await upsertRows(client, "chapters", rows.chapters, "id");
  await upsertRows(client, "dinosaurs", rows.dinosaurs, "id");
  await upsertRows(client, "achievements", rows.achievements, "id");
  await upsertRows(client, "lessons", rows.lessons, "id");
  await upsertRows(client, "quiz_questions", rows.questions, "id");
  await upsertRows(client, "quiz_question_keys", rows.keys, "question_id");

  console.log("Selesai. Konten siap dipakai aplikasi.");
}

try {
  await main();
} catch (error) {
  console.error(
    `\nSeeder gagal: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
}
