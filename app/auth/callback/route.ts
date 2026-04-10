import { NextResponse } from "next/server";

// Auth is now handled via /api/auth/login and /api/auth/signup
// This route is kept for compatibility but just redirects home
export async function GET(request: Request) {
    const { origin } = new URL(request.url);
    return NextResponse.redirect(`${origin}/index.html`);
}
