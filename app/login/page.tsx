"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

    const supabase = createClient();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: `${location.origin}/auth/callback` },
            });
            if (error) {
                setMessage({ text: error.message, error: true });
            } else {
                setMessage({ text: "Check your email for a confirmation link!", error: false });
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setMessage({ text: error.message, error: true });
            } else {
                window.location.href = "/";
            }
        }

        setLoading(false);
    }

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            background: "#f5f5f5",
        }}>
            <div style={{
                background: "#fff",
                padding: "2rem",
                borderRadius: "8px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                width: "100%",
                maxWidth: "400px",
            }}>
                <h1 style={{ marginBottom: "0.25rem" }}>🛡️ TerraShield</h1>
                <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                    {isSignUp ? "Create an account" : "Sign in to continue"}
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem" }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", fontFamily: "monospace" }}
                        />
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem" }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", fontFamily: "monospace" }}
                        />
                    </div>

                    {message && (
                        <p style={{ color: message.error ? "red" : "green", marginBottom: "1rem", fontSize: "0.85rem" }}>
                            {message.error ? "❌" : "✅"} {message.text}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "10px",
                            background: "#0070f3",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontFamily: "monospace",
                            fontSize: "1rem",
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
                    </button>
                </form>

                <p style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.85rem" }}>
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
                        style={{ background: "none", border: "none", color: "#0070f3", cursor: "pointer", fontFamily: "monospace", textDecoration: "underline" }}
                    >
                        {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
}
