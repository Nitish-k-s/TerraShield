import { redirect } from "next/navigation";

/**
 * Root page — redirects to the frontend SPA served from /public/index.html.
 *
 * The TerraShield frontend is a standalone vanilla JS SPA located in
 * public/index.html (sourced from the frontend/ directory).
 * Next.js serves the public/ folder at the root, so visiting "/" redirects
 * straight to the real UI without loading any React page component.
 */
export default function RootPage() {
    redirect("/index.html");
}
