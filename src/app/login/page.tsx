import { AuthForm } from "@/components/auth/AuthForm";

// Pesan galat diambil dari query string, jadi halaman ini dirender per permintaan.
export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  return (
    <AuthForm
      mode="login"
      callbackError={error === "callback"}
      nextPath={next}
    />
  );
}
