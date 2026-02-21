/**
 * lib/pdf.ts
 *
 * Generates a professional TerraShield Ecological Risk Report PDF using pdf-lib.
 * All generation happens server-side; the result is returned as a Uint8Array
 * which the API route streams to the client.
 *
 * Design:
 *  - Dark title bar with white TerraShield branding
 *  - Satellite metrics table
 *  - Six-section Gemini report body
 *  - Risk classification badge at the end
 *  - Page numbers + footer on every page
 */

import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";
import type { EcologicalReportInput, EcologicalReportOutput } from "./gemini";

// ─── Colour palette ───────────────────────────────────────────────────────────

const C = {
    white: rgb(1, 1, 1),
    black: rgb(0, 0, 0),
    dark: rgb(0.04, 0.10, 0.06),   // near-black green
    primary: rgb(0.11, 0.67, 0.39),   // TerraShield green
    satelliteBlue: rgb(0.22, 0.74, 0.98),   // Sentinel accent
    textMain: rgb(0.13, 0.13, 0.13),
    textMuted: rgb(0.45, 0.45, 0.45),
    tableBg: rgb(0.96, 0.98, 0.97),
    rowAlt: rgb(0.92, 0.96, 0.94),
    riskRed: rgb(0.87, 0.20, 0.20),
    riskAmber: rgb(0.96, 0.62, 0.07),
    riskGreen: rgb(0.13, 0.71, 0.36),
    border: rgb(0.82, 0.88, 0.84),
};

const PAGE_W = 595.28;   // A4 width  (pt)
const PAGE_H = 841.89;   // A4 height (pt)
const MARGIN = 48;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Wrap text into lines of at most `maxWidth` points. */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(test, size) <= maxWidth) {
            current = test;
        } else {
            if (current) lines.push(current);
            current = word;
        }
    }
    if (current) lines.push(current);
    return lines;
}

/** Determine badge colour from risk-level string or final-conclusion text. */
function riskColour(riskLevel: string, conclusion: string): { colour: typeof C.riskRed; label: string } {
    const combined = (riskLevel + " " + conclusion).toLowerCase();
    if (combined.includes("red") || combined.includes("high") || combined.includes("critical")) {
        return { colour: C.riskRed, label: "HIGH RISK — RED" };
    }
    if (combined.includes("amber") || combined.includes("moderate") || combined.includes("medium")) {
        return { colour: C.riskAmber, label: "MODERATE RISK — AMBER" };
    }
    return { colour: C.riskGreen, label: "LOW RISK — GREEN" };
}

// ─── PDF Builder ──────────────────────────────────────────────────────────────

export interface PdfReportInput {
    reportInput: EcologicalReportInput;
    reportOutput: EcologicalReportOutput;
}

export async function generatePdfReport(data: PdfReportInput): Promise<Uint8Array> {
    const { reportInput: inp, reportOutput: out } = data;

    const doc = await PDFDocument.create();
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontReg = await doc.embedFont(StandardFonts.Helvetica);

    // ── State shared across pages ──────────────────────────────────────────
    let page = doc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H; // cursor from top; we subtract as we go down
    let pageNumber = 1;

    // Convenient drawing wrappers
    function drawText(
        text: string,
        x: number,
        yPos: number,
        font: PDFFont,
        size: number,
        colour: typeof C.black = C.textMain,
    ) {
        page.drawText(text, { x, y: yPos, font, size, color: colour });
    }

    function drawRect(x: number, yPos: number, w: number, h: number, colour: typeof C.dark) {
        page.drawRectangle({ x, y: yPos, width: w, height: h, color: colour });
    }

    function addPageFooter() {
        const generated = new Date(out.generated_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        const footerY = 28;
        page.drawLine({
            start: { x: MARGIN, y: footerY + 12 },
            end: { x: PAGE_W - MARGIN, y: footerY + 12 },
            thickness: 0.5,
            color: C.border,
        });
        drawText("TerraShield · Ecological Intelligence Platform", MARGIN, footerY, fontReg, 7, C.textMuted);
        drawText(`Page ${pageNumber}`, PAGE_W - MARGIN - 30, footerY, fontReg, 7, C.textMuted);
        drawText(`Generated: ${generated} IST`, MARGIN, footerY - 10, fontReg, 6.5, C.textMuted);
    }

    function newPage() {
        addPageFooter();
        page = doc.addPage([PAGE_W, PAGE_H]);
        pageNumber++;
        y = PAGE_H - MARGIN;
    }

    /** Ensure there is at least `space` pts remaining on the current page. */
    function ensureSpace(space: number) {
        if (y - space < 60) newPage();
    }

    // ── Title banner ───────────────────────────────────────────────────────
    const bannerH = 90;
    drawRect(0, PAGE_H - bannerH, PAGE_W, bannerH, C.dark);

    // Logo accent bar
    drawRect(MARGIN, PAGE_H - bannerH + 18, 3, 54, C.primary);

    drawText("TerraShield", MARGIN + 14, PAGE_H - 38, fontBold, 22, C.white);
    drawText("ECOLOGICAL RISK REPORT", MARGIN + 14, PAGE_H - 54, fontReg, 9, C.primary);
    drawText("Invasive Species Early Warning System", MARGIN + 14, PAGE_H - 67, fontReg, 8, rgb(0.55, 0.75, 0.60));

    // Report date top-right
    const dateStr = new Date(out.generated_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric" });
    drawText(dateStr, PAGE_W - MARGIN - 90, PAGE_H - 46, fontReg, 8, C.textMuted);
    drawText("Confidential — For Official Use", PAGE_W - MARGIN - 90, PAGE_H - 58, fontReg, 7, C.textMuted);

    y = PAGE_H - bannerH - 24;

    // ── Metadata strip ─────────────────────────────────────────────────────
    drawText("REPORT SUBJECT", MARGIN, y, fontBold, 7, C.textMuted);
    y -= 14;
    drawText(`Species: ${inp.species}`, MARGIN, y, fontBold, 11, C.textMain);
    y -= 13;
    drawText(`GPS: ${inp.latitude.toFixed(5)}°, ${inp.longitude.toFixed(5)}°   ·   AI Confidence: ${Math.round(inp.ai_confidence * 100)}%   ·   Cluster Reports: ${inp.cluster_density}`, MARGIN, y, fontReg, 9, C.textMuted);
    y -= 20;

    // Divider
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.75, color: C.border });
    y -= 18;

    // ── Satellite Metrics Table ────────────────────────────────────────────
    drawText("SENTINEL-2 SATELLITE DATA", MARGIN, y, fontBold, 8, C.satelliteBlue);
    y -= 12;

    const tableRows = [
        ["Metric", "Value", "Reference"],
        ["Current NDVI (30-day mean)", inp.current_ndvi.toFixed(4), "0 = barren · 1 = dense"],
        ["Historical NDVI (90-day baseline)", inp.historical_ndvi.toFixed(4), "Seasonal average"],
        ["Vegetation Anomaly Score", inp.anomaly_score.toFixed(4), "0 = normal · 1 = extreme"],
        ["Risk Classification", inp.risk_level, "Sentinel-2 L2A"],
    ];

    const colW = [210, 110, 175];
    const rowH = 18;
    const tableX = MARGIN;

    for (let r = 0; r < tableRows.length; r++) {
        const rowY = y - r * rowH;
        const bg = r === 0 ? C.dark : r % 2 === 1 ? C.tableBg : C.rowAlt;
        const textC = r === 0 ? C.white : C.textMain;
        const f = r === 0 ? fontBold : fontReg;
        const sz = r === 0 ? 8 : 8.5;

        drawRect(tableX, rowY - rowH + 3, colW[0] + colW[1] + colW[2], rowH, bg);
        drawText(tableRows[r][0], tableX + 6, rowY - 10, f, sz, textC);

        // Colour the NDVI value if abnormal
        let valColour = textC;
        if (r === 3 && inp.anomaly_score > 0.66) valColour = C.riskRed;
        if (r === 3 && inp.anomaly_score > 0.33 && inp.anomaly_score <= 0.66) valColour = C.riskAmber;

        drawText(tableRows[r][1], tableX + colW[0] + 6, rowY - 10, r === 0 ? fontBold : fontBold, sz, valColour);
        drawText(tableRows[r][2], tableX + colW[0] + colW[1] + 6, rowY - 10, f, sz, r === 0 ? C.white : C.textMuted);
    }

    y -= tableRows.length * rowH + 14;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: C.border });
    y -= 18;

    // ── Report Sections ────────────────────────────────────────────────────
    const sectionTitles = [
        "1. Species Overview",
        "2. Ecological Threat Assessment",
        "3. Satellite Vegetation Analysis Interpretation",
        "4. Outbreak Likelihood Evaluation",
        "5. Recommended Monitoring or Containment Actions",
        "6. Final Risk Conclusion",
    ];

    const sectionBodies = [
        out.sections.species_overview,
        out.sections.ecological_threat_assessment,
        out.sections.satellite_vegetation_analysis,
        out.sections.outbreak_likelihood_evaluation,
        out.sections.recommended_actions,
        out.sections.final_risk_conclusion,
    ];

    const bodyWidth = PAGE_W - MARGIN * 2;

    for (let s = 0; s < sectionTitles.length; s++) {
        ensureSpace(50);

        // Section heading background
        drawRect(MARGIN, y - 14, bodyWidth, 20, s === 5 ? C.dark : C.tableBg);
        const headingColour = s === 5 ? C.white : C.dark;
        drawText(sectionTitles[s].toUpperCase(), MARGIN + 8, y - 9, fontBold, 8.5, headingColour);
        y -= 22;

        // Body text — wrap and render
        const body = sectionBodies[s] || "(No content generated for this section.)";
        const paragraphs = body.split(/\n+/);

        for (const para of paragraphs) {
            if (!para.trim()) { y -= 6; continue; }
            const lines = wrapText(para.trim(), fontReg, 9.5, bodyWidth - 8);
            for (const line of lines) {
                ensureSpace(14);
                drawText(line, MARGIN + 4, y, fontReg, 9.5, C.textMain);
                y -= 13;
            }
            y -= 5;
        }
        y -= 10;
    }

    // ── Risk Classification Badge ──────────────────────────────────────────
    ensureSpace(55);
    const { colour: riskCol, label: riskLabel } = riskColour(inp.risk_level, out.sections.final_risk_conclusion);
    const badgeW = 260;
    const badgeX = (PAGE_W - badgeW) / 2;
    y -= 8;
    drawRect(badgeX, y - 28, badgeW, 36, riskCol);
    const labelW = fontBold.widthOfTextAtSize(riskLabel, 11);
    drawText(riskLabel, badgeX + (badgeW - labelW) / 2, y - 12, fontBold, 11, C.white);
    y -= 48;

    // Model attribution
    drawText(`Report generated by ${out.model_used} via Google Gemini API. Data sourced from Sentinel-2 L2A (ESA Copernicus).`, MARGIN, y, fontReg, 7, C.textMuted);

    // Footer on last page
    addPageFooter();

    return doc.save();
}
