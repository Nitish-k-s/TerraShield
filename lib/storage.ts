/**
 * lib/storage.ts — Supabase Storage for image uploads
 */
import { getSupabaseAdmin } from "@/lib/supabase/server";

export interface UploadResult {
    path: string;
    publicUrl: string;
}

export async function uploadReportImage(
    userId: string,
    buffer: Buffer,
    filename: string,
    mimeType: string
): Promise<UploadResult> {
    const supabase = getSupabaseAdmin();
    const timestamp = Date.now();
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${userId}/${timestamp}-${sanitized}`;

    const { error } = await supabase.storage
        .from("report-images")
        .upload(storagePath, buffer, { contentType: mimeType, upsert: false });

    if (error) throw new Error(`Failed to upload image: ${error.message}`);

    const { data } = supabase.storage.from("report-images").getPublicUrl(storagePath);
    return { path: storagePath, publicUrl: data.publicUrl };
}

export async function downloadReportImage(storagePath: string): Promise<Buffer> {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage.from("report-images").download(storagePath);
    if (error) throw new Error(`Failed to download image: ${error.message}`);
    return Buffer.from(await data.arrayBuffer());
}

export async function deleteReportImage(storagePath: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    await supabase.storage.from("report-images").remove([storagePath]);
}
