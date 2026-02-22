/**
 * POST /api/report-quick
 *
 * Fast PDF download for the Statistics page.
 * 
 * If `id` is provided in the body, fetches the stored exif record from the DB
 * and builds the PDF directly from stored data — no Gemini call, instant.
 *
 * Falls back to using the body fields directly if no ID is given.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getDb } from "@/lib/db/exif";
import type { ExifRecord } from "@/lib/db/exif";

export const runtime = "nodejs";

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function resolveUser(req: NextRequest) {
    const supabase = await createClient();
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const { data } = await supabase.auth.getUser(token);
        return data?.user ?? null;
    }
    const { data } = await supabase.auth.getUser();
    return data?.user ?? null;
}

// ─── Colour palette ─────────────────────────────────────────────────────────

const C = {
    white: rgb(1, 1, 1),
    dark: rgb(0.04, 0.10, 0.06),
    primary: rgb(0.11, 0.67, 0.39),
    satelliteBlue: rgb(0.22, 0.74, 0.98),
    textMain: rgb(0.13, 0.13, 0.13),
    textMuted: rgb(0.45, 0.45, 0.45),
    tableBg: rgb(0.96, 0.98, 0.97),
    rowAlt: rgb(0.92, 0.96, 0.94),
    riskRed: rgb(0.87, 0.20, 0.20),
    riskAmber: rgb(0.96, 0.62, 0.07),
    riskGreen: rgb(0.13, 0.71, 0.36),
    border: rgb(0.82, 0.88, 0.84),
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;

function wrapText(text: string, font: typeof StandardFonts.Helvetica extends never ? never : ReturnType<typeof Object.assign>, size: number, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
        const t = cur ? `${cur} ${w}` : w;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((font as any).widthOfTextAtSize(t, size) <= maxWidth) {
            cur = t;
        } else {
            if (cur) lines.push(cur);
            cur = w;
        }
    }
    if (cur) lines.push(cur);
    return lines;
}

// ─── Satellite data helper ────────────────────────────────────────────────────

interface SatData { current_ndvi?: number; historical_ndvi?: number; anomaly_score?: number; risk_level?: string; }

function parseSatData(satellite_context_json: string | null | undefined): SatData {
    if (!satellite_context_json) return {};
    try {
        const j = JSON.parse(satellite_context_json);
        return {
            current_ndvi: j.current_ndvi ?? j.ndvi ?? j.ndvi_current,
            historical_ndvi: j.historical_ndvi ?? j.ndvi_baseline,
            anomaly_score: j.anomaly_score ?? j.anomaly,
            risk_level: j.risk_level ?? j.riskLevel,
        };
    } catch { return {}; }
}

// ─── PDF builder ──────────────────────────────────────────────────────────────

interface PdfData {
    species: string;
    ai_label: string;
    ai_confidence: number;
    ai_risk_score: number;
    ai_summary: string;
    latitude: number;
    longitude: number;
    current_ndvi: number;
    historical_ndvi: number;
    anomaly_score: number;
    risk_level: string;
    analysed_at: string | null;
}

async function buildQuickPdf(d: PdfData): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontReg = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([PAGE_W, PAGE_H]);

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric" });
    const tsStr = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const isHigh = d.ai_risk_score >= 7;
    const isMed = d.ai_risk_score >= 4;
    const riskCol = isHigh ? C.riskRed : isMed ? C.riskAmber : C.riskGreen;
    const riskLabel = isHigh ? "HIGH RISK — RED ALERT" : isMed ? "MODERATE RISK — AMBER" : "LOW RISK — GREEN";

    // ── Banner ──────────────────────────────────────────────────────────────
    page.drawRectangle({ x: 0, y: PAGE_H - 90, width: PAGE_W, height: 90, color: C.dark });
    page.drawRectangle({ x: MARGIN, y: PAGE_H - 72, width: 3, height: 54, color: C.primary });
    page.drawText("TerraShield", { x: MARGIN + 14, y: PAGE_H - 38, font: fontBold, size: 22, color: C.white });
    page.drawText("ECOLOGICAL RISK REPORT", { x: MARGIN + 14, y: PAGE_H - 54, font: fontReg, size: 9, color: C.primary });
    page.drawText("Invasive Species Early Warning System", { x: MARGIN + 14, y: PAGE_H - 67, font: fontReg, size: 8, color: rgb(0.55, 0.75, 0.60) });
    page.drawText(dateStr, { x: PAGE_W - MARGIN - 90, y: PAGE_H - 46, font: fontReg, size: 8, color: C.textMuted });
    page.drawText("Confidential — For Official Use", { x: PAGE_W - MARGIN - 90, y: PAGE_H - 58, font: fontReg, size: 7, color: C.textMuted });

    let y = PAGE_H - 90 - 24;

    // ── Subject strip ────────────────────────────────────────────────────────
    page.drawText("REPORT SUBJECT", { x: MARGIN, y, font: fontBold, size: 7, color: C.textMuted });
    y -= 14;
    page.drawText(`Species: ${d.species}`, { x: MARGIN, y, font: fontBold, size: 13, color: C.textMain });
    y -= 15;
    page.drawText(
        `GPS: ${d.latitude.toFixed(5)}°, ${d.longitude.toFixed(5)}°   ·   AI Confidence: ${Math.round(d.ai_confidence * 100)}%`,
        { x: MARGIN, y, font: fontReg, size: 9, color: C.textMuted }
    );
    y -= 20;

    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.75, color: C.border });
    y -= 18;

    // ── Satellite table ──────────────────────────────────────────────────────
    page.drawText("SENTINEL-2 SATELLITE DATA", { x: MARGIN, y, font: fontBold, size: 8, color: C.satelliteBlue });
    y -= 12;

    const tableRows = [
        ["Metric", "Value", "Reference"],
        ["Current NDVI (30-day mean)", d.current_ndvi.toFixed(4), "0 = barren · 1 = dense"],
        ["Historical NDVI (90-day baseline)", d.historical_ndvi.toFixed(4), "Seasonal average"],
        ["Vegetation Anomaly Score", d.anomaly_score.toFixed(4), "0 = normal · 1 = extreme"],
        ["Risk Classification", d.risk_level, "Sentinel-2 L2A"],
    ];
    const colW = [210, 110, 175];
    const rowH = 18;
    for (let r = 0; r < tableRows.length; r++) {
        const rowY = y - r * rowH;
        const bg = r === 0 ? C.dark : r % 2 === 1 ? C.tableBg : C.rowAlt;
        const textC = r === 0 ? C.white : C.textMain;
        const f = r === 0 ? fontBold : fontReg;
        const sz = r === 0 ? 8 : 8.5;
        page.drawRectangle({ x: MARGIN, y: rowY - rowH + 3, width: colW[0] + colW[1] + colW[2], height: rowH, color: bg });
        page.drawText(tableRows[r][0], { x: MARGIN + 6, y: rowY - 10, font: f, size: sz, color: textC });
        page.drawText(tableRows[r][1], { x: MARGIN + colW[0] + 6, y: rowY - 10, font: fontBold, size: sz, color: textC });
        page.drawText(tableRows[r][2], { x: MARGIN + colW[0] + colW[1] + 6, y: rowY - 10, font: f, size: sz, color: r === 0 ? C.white : C.textMuted });
    }
    y -= tableRows.length * rowH + 14;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: C.border });
    y -= 20;

    // ── AI Classification ────────────────────────────────────────────────────
    page.drawText("AI CLASSIFICATION", { x: MARGIN, y, font: fontBold, size: 8, color: C.primary });
    y -= 12;
    const classRows = [
        ["AI Risk Score", `${d.ai_risk_score.toFixed(1)} / 10`],
        ["Classification", d.ai_label.toUpperCase()],
        ["AI Confidence", `${Math.round(d.ai_confidence * 100)}%`],
        ["Analysed At", d.analysed_at ? new Date(d.analysed_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "—"],
    ];
    for (const [lbl, val] of classRows) {
        page.drawRectangle({ x: MARGIN, y: y - 14, width: PAGE_W - MARGIN * 2, height: 18, color: C.tableBg });
        page.drawText(lbl, { x: MARGIN + 6, y: y - 9, font: fontBold, size: 8.5, color: C.textMain });
        page.drawText(val, { x: MARGIN + 220, y: y - 9, font: fontReg, size: 8.5, color: C.textMain });
        y -= 18;
    }
    y -= 14;

    // ── AI Summary ───────────────────────────────────────────────────────────
    if (d.ai_summary) {
        page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: C.border });
        y -= 18;
        page.drawText("ECOLOGICAL ASSESSMENT", { x: MARGIN, y, font: fontBold, size: 8, color: C.primary });
        y -= 14;

        const bodyW = PAGE_W - MARGIN * 2 - 8;
        const paras = d.ai_summary.split(/\n+/);
        for (const para of paras) {
            if (!para.trim()) { y -= 6; continue; }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const lines = wrapText(para.trim(), fontReg as any, 9.5, bodyW);
            for (const line of lines) {
                if (y < 80) break;
                page.drawText(line, { x: MARGIN + 4, y, font: fontReg, size: 9.5, color: C.textMain });
                y -= 13;
            }
            y -= 4;
        }
        y -= 10;
    }

    // ── Risk badge ───────────────────────────────────────────────────────────
    if (y < 80) y = 80;
    const badgeW = 280;
    const badgeX = (PAGE_W - badgeW) / 2;
    y -= 10;
    page.drawRectangle({ x: badgeX, y: y - 28, width: badgeW, height: 36, color: riskCol });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lw = (fontBold as any).widthOfTextAtSize(riskLabel, 11);
    page.drawText(riskLabel, { x: badgeX + (badgeW - lw) / 2, y: y - 12, font: fontBold, size: 11, color: C.white });

    // ── Footer ───────────────────────────────────────────────────────────────
    const footerY = 28;
    page.drawLine({ start: { x: MARGIN, y: footerY + 12 }, end: { x: PAGE_W - MARGIN, y: footerY + 12 }, thickness: 0.5, color: C.border });
    page.drawText("TerraShield · Ecological Intelligence Platform", { x: MARGIN, y: footerY, font: fontReg, size: 7, color: C.textMuted });
    page.drawText("Page 1", { x: PAGE_W - MARGIN - 30, y: footerY, font: fontReg, size: 7, color: C.textMuted });
    page.drawText(`Generated: ${tsStr} IST`, { x: MARGIN, y: footerY - 10, font: fontReg, size: 6.5, color: C.textMuted });

    return doc.save();
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
    const user = await resolveUser(req);
    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try { body = await req.json(); }
    catch { return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 }); }

    // ── If an exif record ID is supplied, load it from the DB ─────────────────
    let record: ExifRecord | undefined;
    if (body.id) {
        const id = Number(body.id);
        if (isFinite(id) && id > 0) {
            record = getDb()
                .prepare<[number], ExifRecord>("SELECT * FROM exif_data WHERE id = ?")
                .get(id);
        }
    }

    // ── Build PdfData from record or fallback to body ─────────────────────────
    let pdfData: PdfData;

    if (record) {
        const sat = parseSatData(record.satellite_context_json ?? null);
        const tags: string[] = (() => { try { return JSON.parse(record.ai_tags ?? "[]"); } catch { return []; } })();
        const species = tags[0] || String(body.species ?? "Unknown Species");

        pdfData = {
            species,
            ai_label: record.ai_label || "—",
            ai_confidence: record.ai_confidence ?? 0,
            ai_risk_score: record.ai_risk_score ?? 0,
            ai_summary: record.ai_summary || "",
            latitude: record.latitude ?? 0,
            longitude: record.longitude ?? 0,
            current_ndvi: sat.current_ndvi ?? 0.5,
            historical_ndvi: sat.historical_ndvi ?? 0.6,
            anomaly_score: sat.anomaly_score ?? 0.2,
            risk_level: sat.risk_level || (record.ai_risk_score ?? 0) >= 7 ? "Critical" : (record.ai_risk_score ?? 0) >= 4 ? "Moderate" : "Low",
            analysed_at: record.ai_analysed_at ?? null,
        };
    } else {
        // Fallback — use body fields (same as before)
        const riskScore = Number(body.ai_risk_score ?? 0);
        pdfData = {
            species: String(body.species ?? "Unknown"),
            ai_label: String(body.ai_label ?? body.risk_level ?? "—"),
            ai_confidence: Math.min(Math.max(Number(body.ai_confidence ?? 0), 0), 1),
            ai_risk_score: riskScore,
            ai_summary: String(body.ai_summary ?? ""),
            latitude: Number(body.latitude ?? 0),
            longitude: Number(body.longitude ?? 0),
            current_ndvi: Number(body.current_ndvi ?? 0.5),
            historical_ndvi: Number(body.historical_ndvi ?? 0.6),
            anomaly_score: Number(body.anomaly_score ?? 0.2),
            risk_level: String(body.risk_level ?? "Moderate"),
            analysed_at: null,
        };
    }

    let pdfBytes: Uint8Array;
    try { pdfBytes = await buildQuickPdf(pdfData); }
    catch (err) {
        const msg = err instanceof Error ? err.message : "PDF error";
        console.error("[report-quick]", msg);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }

    const safe = pdfData.species.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `TerraShield_Report_${safe}_${dateStr}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": pdfBytes.byteLength.toString(),
            "Cache-Control": "no-store",
        },
    });
}

export async function GET(): Promise<NextResponse> {
    return NextResponse.json({ success: false, error: "POST only." }, { status: 405 });
}
