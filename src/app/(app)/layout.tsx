import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { getShellData } from "@/lib/data/shell";

// Halaman terlindungi selalu dirender per permintaan karena membaca cookie sesi.
export const instant = false;

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { supabase, user } = await requireUser();
  const shell = await getShellData(supabase, user.id);

  return <AppShell data={shell}>{children}</AppShell>;
}
