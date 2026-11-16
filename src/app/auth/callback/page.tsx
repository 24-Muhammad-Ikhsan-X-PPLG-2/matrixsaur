"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const completeSignIn = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        router.replace("/login?error=callback");
        return;
      }

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          router.replace("/login?error=callback");
          return;
        }

        const candidate = new URL(
          params.get("next") ?? "/dashboard",
          window.location.origin,
        );
        const destination =
          candidate.origin === window.location.origin
            ? `${candidate.pathname}${candidate.search}${candidate.hash}`
            : "/dashboard";

        router.replace(destination);
        router.refresh();
      } catch {
        router.replace("/login?error=callback");
      }
    };

    void completeSignIn();
  }, [router]);

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <p className="font-semibold text-muted" role="status">
        Memverifikasi tautan konfirmasi...
      </p>
    </main>
  );
}
