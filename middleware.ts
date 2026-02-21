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

    // Extract token from header if it exists
    const authHeader = request.headers.get('authorization');
    let user = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data } = await supabase.auth.getUser(token);
        user = data?.user || null;
    } else {
        // Refresh session from cookies — do NOT remove this
        const { data } = await supabase.auth.getUser();
        user = data?.user || null;
    }

    // Protect all /api routes except explicitly public ones
    const isApiRoute = request.nextUrl.pathname.startsWith("/api");
    const isPublicApiRoute = [
        "/api/public-reports",
    ].some(p => request.nextUrl.pathname.startsWith(p));

    // Return 401 Unauthorized for protected API routes
    if (!user && isApiRoute && !isPublicApiRoute) {
        return new NextResponse(
            JSON.stringify({ error: "Unauthorized access: Please sign in." }),
            { status: 401, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
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
