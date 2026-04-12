/**
 * lib/auth.ts
 * Simple JWT-based auth using Node.js crypto (HMAC-SHA256)
 */

import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "terrashield-dev-secret-change-in-production";

function base64url(buf: Buffer | string): string {
    const b = typeof buf === "string" ? Buffer.from(buf) : buf;
    return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function createToken(user: AuthUser, expiresInSeconds = 60 * 60 * 24 * 7): Promise<string> {
    const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = base64url(JSON.stringify({
        sub: user.id,
        email: user.email,
        user_metadata: user.user_metadata ?? {},
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    }));
    const sig = base64url(
        crypto.createHmac("sha256", SECRET).update(`${header}.${payload}`).digest()
    );
    return `${header}.${payload}.${sig}`;
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
    try {
        const [header, payload, sig] = token.split(".");
        if (!header || !payload || !sig) return null;
        const expected = base64url(
            crypto.createHmac("sha256", SECRET).update(`${header}.${payload}`).digest()
        );
        if (sig !== expected) return null;
        const data = JSON.parse(Buffer.from(payload, "base64").toString());
        if (data.exp && Date.now() / 1000 > data.exp) return null;
        return { id: data.sub, email: data.email ?? "", user_metadata: data.user_metadata ?? {} };
    } catch {
        return null;
    }
}

export interface AuthUser {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
}

export function getUserFromRequest(req: { headers: { get(name: string): string | null } }): Promise<AuthUser | null> {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) return verifyToken(authHeader.slice(7));
    return Promise.resolve(null);
}
