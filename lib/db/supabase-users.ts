/**
 * lib/db/supabase-users.ts — Supabase user metadata and points system
 */
import { getSupabaseAdmin } from "@/lib/supabase/server";

export interface UserMeta {
    id: number; user_id: string; email: string;
    name?: string | null; gender?: string | null; phone?: string | null; avatar_url?: string | null;
    terra_points: number; reports_count: number; verified_reports: number; role: string; created_at: string;
    level?: string; next_level_at?: number | null; level_progress_pct?: number;
    password_hash?: string | null;
}

export interface PointHistory { id: number; user_id: string; amount: number; reason: string; created_at: string; }

export function calculateUserLevel(points: number): string {
    if (points >= 301) return 'Guardian';
    if (points >= 151) return 'Protector';
    if (points >= 51) return 'Defender';
    return 'Observer';
}

export function nextLevelThreshold(points: number): number | null {
    if (points < 51) return 51; if (points < 151) return 151; if (points < 301) return 301; return null;
}

export function levelProgressPct(points: number): number {
    if (points >= 301) return 100;
    if (points >= 151) return Math.round(((points - 151) / 150) * 100);
    if (points >= 51) return Math.round(((points - 51) / 100) * 100);
    return Math.round((points / 51) * 100);
}

function withLevel(user: UserMeta): UserMeta {
    const pts = user.terra_points ?? 0;
    return { ...user, level: calculateUserLevel(pts), next_level_at: nextLevelThreshold(pts), level_progress_pct: levelProgressPct(pts) };
}

export async function getUserMeta(userId: string, email: string): Promise<UserMeta> {
    const supabase = getSupabaseAdmin();
    const { data: user } = await supabase.from("users_meta").select("*").eq("user_id", userId).single();
    if (!user) {
        await supabase.from("users_meta").insert({ user_id: userId, email, terra_points: 50 });
        await supabase.from("points_history").insert({ user_id: userId, amount: 50, reason: "Welcome to TerraShield" });
        const { data: newUser } = await supabase.from("users_meta").select("*").eq("user_id", userId).single();
        return withLevel(newUser as UserMeta);
    }
    return withLevel(user as UserMeta);
}

export async function getUserMetaById(userId: string): Promise<UserMeta | null> {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from("users_meta").select("*").eq("user_id", userId).single();
    return data ? withLevel(data as UserMeta) : null;
}

export async function updateProfileContent(userId: string, data: Partial<UserMeta>): Promise<void> {
    const supabase = getSupabaseAdmin();
    const updates: Partial<UserMeta> = {};
    for (const col of ['name', 'gender', 'phone', 'avatar_url'] as const) {
        if (data[col] !== undefined) updates[col] = data[col];
    }
    if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from("users_meta").update(updates).eq("user_id", userId);
        if (error) throw new Error(`Failed to update profile: ${error.message}`);
    }
}

export async function getPointHistory(userId: string): Promise<PointHistory[]> {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from("points_history").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    return (data as PointHistory[]) || [];
}

export async function addTerraPoints(userId: string, amount: number, reason: string): Promise<void> {
    const supabase = getSupabaseAdmin();
    const { data: user } = await supabase.from("users_meta").select("terra_points").eq("user_id", userId).single();
    if (!user) return;
    await supabase.from("users_meta").update({ terra_points: (user.terra_points || 0) + amount }).eq("user_id", userId);
    await supabase.from("points_history").insert({ user_id: userId, amount, reason });
}

export function calcPoints(aiLabel: string, aiConfidence: number): number {
    if ((aiLabel !== 'invasive-plant' && aiLabel !== 'invasive-animal') || aiConfidence <= 0.70) return 0;
    if (aiConfidence >= 0.95) return 30;
    if (aiConfidence >= 0.85) return 20;
    return 10;
}

export async function awardReportPoints(userId: string, exifRecordId: number, aiLabel: string, aiConfidence: number, isVerified = false): Promise<{ pointsAwarded: number; updatedUser: UserMeta | null }> {
    const supabase = getSupabaseAdmin();
    const idempotencyKey = `report:${exifRecordId}`;
    const { data: existing } = await supabase.from("points_history").select("id").eq("user_id", userId).eq("reason", idempotencyKey).single();
    if (existing) return { pointsAwarded: 0, updatedUser: await getUserMetaById(userId) };

    const pts = calcPoints(aiLabel, aiConfidence);
    const { data: user } = await supabase.from("users_meta").select("terra_points, reports_count, verified_reports").eq("user_id", userId).single();
    if (!user) return { pointsAwarded: 0, updatedUser: null };

    await supabase.from("users_meta").update({
        reports_count: (user.reports_count || 0) + 1,
        terra_points: (user.terra_points || 0) + pts,
        ...(isVerified ? { verified_reports: (user.verified_reports || 0) + 1 } : {}),
    }).eq("user_id", userId);

    await supabase.from("points_history").insert({ user_id: userId, amount: pts, reason: idempotencyKey });
    return { pointsAwarded: pts, updatedUser: await getUserMetaById(userId) };
}
