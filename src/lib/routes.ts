/** Rute aplikasi dan helper navigasi yang dipakai shell, tautan, dan redirect. */
export const paths = {
  landing: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  learn: "/belajar",
  lesson: (chapterId: number, lessonIndex: number) =>
    `/belajar/${chapterId}/${lessonIndex + 1}`,
  quiz: (chapterId: number) => `/latihan/${chapterId}`,
  progress: "/progress",
  collection: "/koleksi",
  profile: "/profil",
} as const;

export type NavKey = "dashboard" | "learn" | "progress" | "collection" | "profile";

export function getNavKey(pathname: string): NavKey | null {
  if (pathname === paths.dashboard) return "dashboard";
  if (
    pathname === paths.learn ||
    pathname.startsWith(`${paths.learn}/`) ||
    pathname.startsWith("/latihan/")
  ) {
    return "learn";
  }
  if (pathname === paths.progress) return "progress";
  if (pathname === paths.collection) return "collection";
  if (pathname === paths.profile) return "profile";
  return null;
}
