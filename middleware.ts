import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/keuangan",
  "/laporan",
  "/statistik",
  "/dokumen",
  "/pengaturan",
  "/portal",
];

const AUTH_ONLY = ["/login", "/reset-password", "/update-password"];

const PUBLIK_DESA_ROUTES = ["/lapor", "/transparansi", "/cek-laporan", "/beranda"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const desaId = process.env.NEXT_PUBLIC_DESA_ID;
  const isPublikDesaRoute = PUBLIK_DESA_ROUTES.some((r) =>
    pathname.startsWith(r)
  );

  if (isPublikDesaRoute && desaId) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-desa-id", desaId);
    response = NextResponse.next({ request: { headers: requestHeaders } });

    request.cookies.getAll().forEach(({ name, value }) => {
      response.cookies.set(name, value);
    });
  }

  if (!user && PROTECTED.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && AUTH_ONLY.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};