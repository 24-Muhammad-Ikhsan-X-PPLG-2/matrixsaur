"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import type {
  ActionResponse,
  CheckQuizAnswerResult,
  CompleteLessonResult,
  SubmitQuizResult,
} from "@/lib/data/types";

const GENERIC_ERROR = "Gagal menyimpan progres. Coba lagi.";

export async function completeLessonAction(
  chapterId: number,
  lessonId: string,
): Promise<ActionResponse<CompleteLessonResult>> {
  if (!Number.isInteger(chapterId) || !lessonId) {
    return { ok: false, error: "Materi tidak valid." };
  }

  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("complete_lesson", {
    p_chapter_id: chapterId,
    p_lesson_id: lessonId,
  });

  if (error) {
    console.error("[complete_lesson]", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: data as CompleteLessonResult };
}

export async function checkQuizAnswerAction(
  questionId: string,
  given: string,
): Promise<ActionResponse<CheckQuizAnswerResult>> {
  if (!questionId) {
    return { ok: false, error: "Soal tidak valid." };
  }

  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("check_quiz_answer", {
    p_question_id: questionId,
    p_given: given,
  });

  if (error) {
    console.error("[check_quiz_answer]", error);
    return { ok: false, error: "Gagal memeriksa jawaban. Coba lagi." };
  }

  return { ok: true, data: data as CheckQuizAnswerResult };
}

export interface SubmittedAnswer {
  questionId: string;
  given: string;
}

export async function submitQuizAction(
  chapterId: number,
  answers: SubmittedAnswer[],
  durationSec: number,
): Promise<ActionResponse<SubmitQuizResult>> {
  if (
    !Number.isInteger(chapterId) ||
    !Array.isArray(answers) ||
    !Number.isFinite(durationSec)
  ) {
    return { ok: false, error: "Data latihan tidak valid." };
  }

  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("submit_quiz", {
    p_chapter_id: chapterId,
    p_answers: answers.map((answer) => ({
      questionId: answer.questionId,
      given: answer.given,
    })),
    p_duration_sec: Math.max(0, Math.round(durationSec)),
  });

  if (error) {
    console.error("[submit_quiz]", error);
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: data as SubmitQuizResult };
}
