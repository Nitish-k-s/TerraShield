/** @type {import('next').NextConfig} */
const nextConfig = {
    // Required so formidable can parse multipart/form-data in API routes
    experimental: {
        serverComponentsExternalPackages: ["exifr", "formidable"],
    },
};

export default nextConfig;
