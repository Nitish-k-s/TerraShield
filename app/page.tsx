"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

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
                    <h2>Result</h2>

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
