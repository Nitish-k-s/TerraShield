/**
 * lib/storage.ts
 * Local filesystem image storage (replaces Supabase Storage)
 * Images are saved to /public/uploads/<userId>/<timestamp>-<filename>
 */

import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export interface UploadResult {
    path: string;       // relative storage path, e.g. "userId/123-file.jpg"
    publicUrl: string;  // URL accessible from browser, e.g. "/uploads/userId/123-file.jpg"
}

export async function uploadReportImage(
    userId: string,
    buffer: Buffer,
    filename: string,
    _mimeType: string
): Promise<UploadResult> {
    const userDir = path.join(UPLOAD_DIR, userId);
    ensureDir(userDir);

    const timestamp = Date.now();
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storedFilename = `${timestamp}-${sanitized}`;
    const fullPath = path.join(userDir, storedFilename);

    fs.writeFileSync(fullPath, buffer);

    const storagePath = `${userId}/${storedFilename}`;
    return { path: storagePath, publicUrl: `/uploads/${storagePath}` };
}

export async function downloadReportImage(storagePath: string): Promise<Buffer> {
    const fullPath = path.join(UPLOAD_DIR, storagePath);
    if (!fs.existsSync(fullPath)) throw new Error(`Image not found: ${storagePath}`);
    return fs.readFileSync(fullPath);
}

export async function deleteReportImage(storagePath: string): Promise<void> {
    const fullPath = path.join(UPLOAD_DIR, storagePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}

export async function getSignedUrl(storagePath: string, _expiresIn = 3600): Promise<string> {
    return `/uploads/${storagePath}`;
}
