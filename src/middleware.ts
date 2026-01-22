
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession, decrypt } from "@/src/lib/auth";

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Korumalı rotalar: Admin ana sayfa ve admin alt sayfaları
    // Tablet, Login, View, Sign ve API'nin bazı kısımları hariç tutulmalı
    // Ancak en güvenlisi: Sadece "/" (admin dashboard) ve "/admin/*" (settings vs) rotalarını korumak.

    const isProtected = path === "/" || path.startsWith("/admin");
    const isPublic = path === "/login" || path.startsWith("/tablet") || path.startsWith("/view") || path.startsWith("/sign") || path.startsWith("/api");

    // Eğer korumalı bir rotaya erişiliyorsa session kontrolü yap
    if (isProtected) {
        try {
            const session = request.cookies.get("session")?.value;

            if (!session) {
                return NextResponse.redirect(new URL("/login", request.url));
            }

            await decrypt(session);
        } catch (err) {
            console.error("Middleware Auth Hatası:", err);
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Eğer zaten giriş yapmışsa ve /login'e gitmeye çalışıyorsa ana sayfaya at
    if (path === "/login") {
        try {
            const session = request.cookies.get("session")?.value;
            if (session) {
                await decrypt(session);
                return NextResponse.redirect(new URL("/", request.url));
            }
        } catch (e) {
            // Session geçersizse login sayfasında kalabilir
        }
    }

    try {
        return await updateSession(request);
    } catch (error) {
        console.error("Session Update Hatası:", error);
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
