/** @type {import('next').NextConfig} */
const nextConfig = {
    // Cloud-compatible configuration
    experimental: {
        // No longer needed - using Supabase instead of formidable/better-sqlite3
    },
};

export default nextConfig;
