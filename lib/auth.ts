/**
 * lib/auth.ts
 * Simple JWT-based auth using Web Crypto API (Edge + Node compatible)
 */

const SECRET = process.env.JWT_SECRET || "terrashield-dev-secret-change-in-production";

async function getKey(): Promise<CryptoKey> {
    return globalThis.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
}

function base64url(buf: ArrayBuffer | Uint8Array): string {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let str = "";
    for (const b of bytes) str += String.fromCharCode(b);
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64urlDecode(str: string): Uint8Array {
    const padded = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(str.length + (4 - str.length % 4) % 4, "=");
    const binary = atob(padded);
    return Uint8Array.from(binary, c => c.charCodeAt(0));
}

export async function createToken(user: AuthUser, expiresInSeconds = 60 * 60 * 24 * 7): Promise<string> {
    const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
    const payload = base64url(new TextEncoder().encode(JSON.stringify({
        sub: user.id, email: user.email,
        user_metadata: user.user_metadata ?? {},
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    })));
    const key = await getKey();
    const sig = await globalThis.crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${header}.${payload}`));
    return `${header}.${payload}.${base64url(sig)}`;
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
    try {
        const [header, payload, sig] = token.split(".");
        if (!header || !payload || !sig) return null;
        const key = await getKey();
        const valid = await globalThis.crypto.subtle.verify("HMAC", key, base64urlDecode(sig), new TextEncoder().encode(`${header}.${payload}`));
        if (!valid) return null;
        const data = JSON.parse(new TextDecoder().decode(base64urlDecode(payload)));
        if (data.exp && Date.now() / 1000 > data.exp) return null;
        return { id: data.sub, email: data.email ?? "", user_metadata: data.user_metadata ?? {} };
    } catch { return null; }
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
