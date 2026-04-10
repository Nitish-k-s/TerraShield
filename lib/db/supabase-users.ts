/**
 * lib/db/supabase-users.ts
 *
 * Supabase PostgreSQL replacement for SQLite users.ts
 * Vercel-compatible user metadata and points system
 */

import { createClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserMeta {
    id: number;
    user_id: string;
    email: string;
    name?: string | null;
    gender?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    terra_points: number;
    reports_count: number;
    verified_reports: number;
    role: string;
    created_at: string;
    level?: string;
    next_level_at?: number | null;
    level_progress_pct?: number;
}

export interface PointHistory {
    id: number;
    user_id: string;
    amount: number;
    reason: string;
    created_at: string;
}

// ─── Client ───────────────────────────────────────────────────────────────────

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

// ─── Level System ─────────────────────────────────────────────────────────────

export function calculateUserLevel(points: number): string {
    if (points >= 301) return 'Guardian';
    if (points >= 151) return 'Protector';
    if (points >= 51) return 'Defender';
    return 'Observer';
}

export function nextLevelThreshold(points: number): number | null {
    if (points < 51) return 51;
    if (points < 151) return 151;
    if (points < 301) return 301;
    return null;
}

export function levelProgressPct(points: number): number {
    if (points >= 301) return 100;
    if (points >= 151) return Math.round(((points - 151) / (301 - 151)) * 100);
    if (points >= 51) return Math.round(((points - 51) / (151 - 51)) * 100);
    return Math.round((points / 51) * 100);
}

function withLevel(user: UserMeta): UserMeta {
    const pts = user.terra_points ?? 0;
    return {
        ...user,
        level: calculateUserLevel(pts),
        next_level_at: nextLevelThreshold(pts),
        level_progress_pct: levelProgressPct(pts),
    };
}

// ─── CRUD Functions ───────────────────────────────────────────────────────────

export async function getUserMeta(userId: string, email: string): Promise<UserMeta> {
    const supabase = getSupabaseAdmin();

    const { data: user, error } = await supabase
        .from("users_meta")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error || !user) {
        // Auto-create with welcome bonus (handled by trigger in migration)
        // But if trigger didn't fire, create manually
        const { data: newUser } = await supabase
            .from("users_meta")
            .insert({ user_id: userId, email, terra_points: 50 })
            .select()
            .single();

        if (newUser) {
            await supabase
                .from("points_history")
                .insert({ user_id: userId, amount: 50, reason: "Welcome to TerraShield" });
        }

        const { data: fetchedUser } = await supabase
            .from("users_meta")
            .select("*")
            .eq("user_id", userId)
            .single();

        return withLevel(fetchedUser as UserMeta);
    }

    return withLevel(user as UserMeta);
}

export async function getUserMetaById(userId: string): Promise<UserMeta | null> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from("users_meta")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error || !data) return null;
    return withLevel(data as UserMeta);
}

export async function updateProfileContent(userId: string, data: Partial<UserMeta>): Promise<void> {
    const supabase = getSupabaseAdmin();

    const updates: Partial<UserMeta> = {};
    const cols = ['name', 'gender', 'phone', 'avatar_url'] as const;

    for (const col of cols) {
        if (data[col] !== undefined) {
            updates[col] = data[col];
        }
    }

    if (Object.keys(updates).length > 0) {
        const { error } = await supabase
            .from("users_meta")
            .update(updates)
            .eq("user_id", userId);

        if (error) throw new Error(`Failed to update profile: ${error.message}`);
    }
}

export async function getPointHistory(userId: string): Promise<PointHistory[]> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from("points_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch point history: ${error.message}`);
    return (data as PointHistory[]) || [];
}

export async function addTerraPoints(userId: string, amount: number, reason: string): Promise<void> {
    const supabase = getSupabaseAdmin();

    // Use transaction-like behavior with RPC or sequential operations
    const { error: updateError } = await supabase.rpc('increment_terra_points', {
        p_user_id: userId,
        p_amount: amount,
    });

    if (updateError) {
        // Fallback to manual update
        const { error: manualError } = await supabase
            .from("users_meta")
            .update({ terra_points: supabase.raw(`terra_points + ${amount}`) })
            .eq("user_id", userId);

        if (manualError) throw new Error(`Failed to add points: ${manualError.message}`);
    }

    await supabase
        .from("points_history")
        .insert({ user_id: userId, amount, reason });
}

export function calcPoints(aiLabel: string, aiConfidence: number): number {
    const isInvasive = aiLabel === 'invasive-plant' || aiLabel === 'invasive-animal';
    if (!isInvasive || aiConfidence <= 0.70) return 0;
    if (aiConfidence >= 0.95) return 30;
    if (aiConfidence >= 0.85) return 20;
    return 10;
}

export async function awardReportPoints(
    userId: string,
    exifRecordId: number,
    aiLabel: string,
    aiConfidence: number,
    isVerified = false
): Promise<{ pointsAwarded: number; updatedUser: UserMeta | null }> {
    const supabase = getSupabaseAdmin();
    const idempotencyKey = `report:${exifRecordId}`;

    // Check if already awarded
    const { data: existing } = await supabase
        .from("points_history")
        .select("id")
        .eq("user_id", userId)
        .eq("reason", idempotencyKey)
        .single();

    if (existing) {
        const user = await getUserMetaById(userId);
        return { pointsAwarded: 0, updatedUser: user };
    }

    const pts = calcPoints(aiLabel, aiConfidence);

    // Increment reports_count
    await supabase
        .from("users_meta")
        .update({ reports_count: supabase.raw('reports_count + 1') })
        .eq("user_id", userId);

    // Award points if eligible
    if (pts > 0) {
        await supabase
            .from("users_meta")
            .update({ terra_points: supabase.raw(`terra_points + ${pts}`) })
            .eq("user_id", userId);
    }

    // Record in history (even if 0 points for idempotency)
    await supabase
        .from("points_history")
        .insert({ user_id: userId, amount: pts, reason: idempotencyKey });

    // Increment verified_reports if applicable
    if (isVerified) {
        await supabase
            .from("users_meta")
            .update({ verified_reports: supabase.raw('verified_reports + 1') })
            .eq("user_id", userId);
    }

    const updatedUser = await getUserMetaById(userId);
    return { pointsAwarded: pts, updatedUser };
}
