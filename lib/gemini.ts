/**
 * lib/gemini.ts
 *
 * Server-side Gemini API client for TerraShield ecological risk assessment.
 * API key is read from process.env.GEMINI_API_KEY and never exposed to the browser.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EcologicalReportInput {
    species: string;
    ai_confidence: number;   // 0–1
    latitude: number;
    longitude: number;
    cluster_density: number;   // number of nearby clustered reports
    current_ndvi: number;
    historical_ndvi: number;
    anomaly_score: number;   // 0–1
    risk_level: string;   // e.g. "High Vegetation Anomaly"
}

export interface EcologicalReportOutput {
    full_text: string;          // Complete Gemini response
    sections: ReportSections; // Parsed named sections
    model_used: string;
    generated_at: string;          // ISO timestamp
}

export interface ReportSections {
    species_overview: string;
    ecological_threat_assessment: string;
    satellite_vegetation_analysis: string;
    outbreak_likelihood_evaluation: string;
    recommended_actions: string;
    final_risk_conclusion: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL_NAME = "gemini-2.5-flash";

const SECTION_HEADINGS = [
    "Species Overview",
    "Ecological Threat Assessment",
    "Satellite Vegetation Analysis Interpretation",
    "Outbreak Likelihood Evaluation",
    "Recommended Monitoring or Containment Actions",
    "Final Risk Conclusion",
] as const;

// ─── Prompt Builder ───────────────────────────────────────────────────────────

function buildPrompt(data: EcologicalReportInput): string {
    const confidencePct = Math.round(data.ai_confidence * 100);

    return `You are an ecological risk assessment assistant for an invasive species early warning system.

Based ONLY on the structured data provided below, generate a professional environmental risk report.
Do NOT invent data. Only interpret the exact values given.

--- STRUCTURED FIELD DATA ---
Species detected:         ${data.species}
AI vision confidence:     ${confidencePct}%
GPS Location:             ${data.latitude.toFixed(5)}°, ${data.longitude.toFixed(5)}°
Clustered nearby reports: ${data.cluster_density}
Current NDVI (30-day):    ${data.current_ndvi.toFixed(4)}
Historical NDVI (90-day): ${data.historical_ndvi.toFixed(4)}
Vegetation anomaly score: ${data.anomaly_score.toFixed(4)}  (0 = no anomaly, 1 = extreme)
Risk classification:      ${data.risk_level}
---

Generate a structured report with EXACTLY these six numbered section headings, in this order:

1. Species Overview
2. Ecological Threat Assessment
3. Satellite Vegetation Analysis Interpretation
4. Outbreak Likelihood Evaluation
5. Recommended Monitoring or Containment Actions
6. Final Risk Conclusion

Rules:
- Use a professional, scientific tone suitable for environmental authorities and field ecologists.
- Each section should be 2–4 concise paragraphs.
- The Final Risk Conclusion must include an overall risk colour classification (Green / Amber / Red).
- Do not use markdown formatting (no **, no ##). Use plain text only.
- Use the exact numbered heading format shown above so sections can be parsed programmatically.`;
}

// ─── Section Parser ───────────────────────────────────────────────────────────

function parseSections(text: string): ReportSections {
    const headingPatterns = [
        /1\.\s*Species Overview/i,
        /2\.\s*Ecological Threat Assessment/i,
        /3\.\s*Satellite Vegetation Analysis Interpretation/i,
        /4\.\s*Outbreak Likelihood Evaluation/i,
        /5\.\s*Recommended Monitoring or Containment Actions/i,
        /6\.\s*Final Risk Conclusion/i,
    ];

    const indices: number[] = headingPatterns.map(re => {
        const match = re.exec(text);
        return match ? match.index : -1;
    });

    function extractSection(start: number, end: number): string {
        if (start === -1) return "";
        // Skip past the heading line
        const afterHeading = text.indexOf("\n", start);
        const snippet = text.slice(afterHeading + 1, end === -1 ? undefined : end);
        return snippet.trim();
    }

    return {
        species_overview: extractSection(indices[0], indices[1]),
        ecological_threat_assessment: extractSection(indices[1], indices[2]),
        satellite_vegetation_analysis: extractSection(indices[2], indices[3]),
        outbreak_likelihood_evaluation: extractSection(indices[3], indices[4]),
        recommended_actions: extractSection(indices[4], indices[5]),
        final_risk_conclusion: extractSection(indices[5], -1),
    };
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Calls Gemini API server-side and returns a structured ecological risk report.
 * API key is sourced exclusively from process.env.GEMINI_API_KEY.
 */
export async function generateEcologicalReport(
    input: EcologicalReportInput,
): Promise<EcologicalReportOutput> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error(
            "GEMINI_API_KEY is not configured. " +
            "Add it to your .env.local file."
        );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = buildPrompt(input);

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.3,   // low = reproducible, factual
            maxOutputTokens: 2048,
        },
    });

    const fullText = result.response.text();

    if (!fullText || fullText.trim().length === 0) {
        throw new Error("Gemini returned an empty response. Please try again.");
    }

    return {
        full_text: fullText,
        sections: parseSections(fullText),
        model_used: MODEL_NAME,
        generated_at: new Date().toISOString(),
    };
}
