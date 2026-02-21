import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session — do NOT remove this
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protect all /api routes except public endpoints if any exist later
    const isApiRoute = request.nextUrl.pathname.startsWith("/api");

    // Return 401 Unauthorized for API routes instead of redirecting to a UI page
    if (!user && isApiRoute) {
        return new NextResponse(
            JSON.stringify({ error: "Unauthorized access: Please sign in." }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        // Only run middleware on Next.js API routes and auth callbacks
        "/api/:path*",
        "/auth/callback",
    ],
};
