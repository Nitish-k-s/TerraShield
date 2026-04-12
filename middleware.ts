import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const isApiRoute = request.nextUrl.pathname.startsWith("/api");
    const isPublicApiRoute = [
        "/api/public-reports",
        "/api/auth/login",
        "/api/auth/signup",
        "/api/auth/reset-password",
        "/api/agent-memory",
        "/api/enterprise/register",
        "/api/v1/",
    ].some(p => request.nextUrl.pathname.startsWith(p));

    if (!isApiRoute || isPublicApiRoute) return NextResponse.next();

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const user = token ? await verifyToken(token) : null;

    if (!user) {
        return new NextResponse(
            JSON.stringify({ error: "Unauthorized access: Please sign in." }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/api/:path*"],
};
