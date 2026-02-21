"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [aiResult, setAiResult] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUserEmail(data.user?.email ?? null);
        });
    }, []);

    async function handleLogout() {
        await supabase.auth.signOut();
        window.location.href = "/login";
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setResult(null);
        setError(null);
        setAiResult(null);
        setAiError(null);

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch("/api/extract-exif", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.status === 401) {
                setError("Unauthorized — please log in again.");
                return;
            }
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleAnalyse() {
        if (!result?.recordId) return;

        setAiLoading(true);
        setAiResult(null);
        setAiError(null);

        try {
            const res = await fetch("/api/analyse-exif", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recordId: result.recordId }),
            });
            const data = await res.json();
            if (!data.success) {
                setAiError(data.error ?? data.errors?.[0]?.error ?? "Analysis failed.");
                return;
            }
            setAiResult(data.analysed?.[0] ?? null);
        } catch (err: any) {
            setAiError(err.message);
        } finally {
            setAiLoading(false);
        }
    }

    // Colour-code risk score
    function riskColour(score: number): string {
        if (score >= 7) return "#c0392b";
        if (score >= 4) return "#e67e22";
        return "#27ae60";
    }

    return (
        <div style={{ fontFamily: "monospace", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h1 style={{ margin: 0 }}>🛡️ EXIF Extractor — Test Page</h1>
                <div style={{ textAlign: "right", fontSize: "0.85rem" }}>
                    {userEmail && <span style={{ color: "#555", marginRight: "1rem" }}>👤 {userEmail}</span>}
                    <button
                        onClick={handleLogout}
                        style={{ padding: "6px 12px", background: "#e00", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "monospace" }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            <p style={{ color: "#666" }}>Upload an image to test the <code>/api/extract-exif</code> endpoint.</p>

            <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                style={{ margin: "1rem 0", display: "block" }}
            />

            {loading && <p>⏳ Extracting EXIF data...</p>}
            {error && <p style={{ color: "red" }}>❌ Error: {error}</p>}

            {result && (
                <div>
                    <h2>Result {result.recordId && <span style={{ fontSize: "0.8rem", color: "#888" }}>(DB record #{result.recordId})</span>}</h2>

                    <h3>📍 GPS</h3>
                    {result.mapsUrl ? (
                        <p>
                            Lat: {result.gps.latitude}, Lng: {result.gps.longitude}, Alt: {result.gps.altitude ?? "N/A"}
                            <br />
                            <a href={result.mapsUrl} target="_blank" rel="noreferrer">📌 Open in Google Maps</a>
                        </p>
                    ) : (
                        <p style={{ color: "#888" }}>No GPS data found in this image.</p>
                    )}

                    {/* ── Gemini AI Analysis ── */}
                    <h3>🤖 Gemini AI Analysis</h3>
                    {!aiResult && (
                        <button
                            onClick={handleAnalyse}
                            disabled={aiLoading}
                            style={{
                                padding: "8px 18px",
                                background: aiLoading ? "#999" : "#4a90d9",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: aiLoading ? "not-allowed" : "pointer",
                                fontFamily: "monospace",
                                fontSize: "0.9rem",
                                marginBottom: "0.75rem",
                            }}
                        >
                            {aiLoading ? "⏳ Analysing with Gemini…" : "✨ Analyse with Gemini"}
                        </button>
                    )}
                    {aiError && <p style={{ color: "red" }}>❌ Gemini Error: {aiError}</p>}
                    {aiResult && (
                        <div style={{ background: "#f0f7ff", border: "1px solid #b3d4f5", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
                            <p><strong>Label:</strong> {aiResult.ai_label}</p>
                            <p>
                                <strong>Risk Score:</strong>{" "}
                                <span style={{ fontWeight: "bold", color: riskColour(aiResult.ai_risk_score) }}>
                                    {aiResult.ai_risk_score.toFixed(1)} / 10
                                </span>
                            </p>
                            <p><strong>Confidence:</strong> {(aiResult.ai_confidence * 100).toFixed(1)}%</p>
                            <p><strong>Tags:</strong> {Array.isArray(aiResult.ai_tags) ? aiResult.ai_tags.join(", ") : aiResult.ai_tags}</p>
                            <p><strong>Summary:</strong> {aiResult.ai_summary}</p>
                        </div>
                    )}

                    <h3>🏷️ All EXIF Tags</h3>
                    {Object.keys(result.allTags).length === 0 ? (
                        <p style={{ color: "#888" }}>No EXIF tags found.</p>
                    ) : (
                        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.85rem" }}>
                            <thead>
                                <tr style={{ background: "#f0f0f0" }}>
                                    <th style={{ border: "1px solid #ccc", padding: "6px 10px", textAlign: "left" }}>Tag</th>
                                    <th style={{ border: "1px solid #ccc", padding: "6px 10px", textAlign: "left" }}>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(result.allTags).map(([key, val]) => (
                                    <tr key={key}>
                                        <td style={{ border: "1px solid #ccc", padding: "6px 10px", fontWeight: "bold" }}>{key}</td>
                                        <td style={{ border: "1px solid #ccc", padding: "6px 10px" }}>{String(val)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <h3>📄 Raw JSON</h3>
                    <pre style={{ background: "#f6f6f6", padding: "1rem", overflow: "auto", borderRadius: "6px", fontSize: "0.8rem" }}>
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
