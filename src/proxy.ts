import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

const protectedPaths = [
  "/dashboard",
  "/belajar",
  "/latihan",
  "/profil",
  "/progress",
  "/koleksi",
];

function isProtectedPath(pathname: string) {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function copyResponseState(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value, ...options }) => {
    to.cookies.set(name, value, options);
  });

  for (const header of ["Cache-Control", "Expires", "Pragma"]) {
    const value = from.headers.get(header);
    if (value) to.headers.set(header, value);
  }

  return to;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseConfig();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        for (const [name, value] of Object.entries(headers)) {
          response.headers.set(name, value);
        }
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const authenticated = Boolean(data?.claims);
  const protectedPath = isProtectedPath(request.nextUrl.pathname);

  if (protectedPath && !authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return copyResponseState(response, NextResponse.redirect(loginUrl));
  }

  if (
    authenticated &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register")
  ) {
    return copyResponseState(
      response,
      NextResponse.redirect(new URL("/dashboard", request.url)),
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/belajar/:path*",
    "/latihan/:path*",
    "/profil/:path*",
    "/progress/:path*",
    "/koleksi/:path*",
    "/login",
    "/register",
  ],
};
